import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVideo } from '../contexts/VideoContext'
import VideoThumb from './VideoThumb'

export default function VideoModal({ item, onClose }) {
  const [index, setIndex] = useState(0)
  const { registerVideo, unregisterVideo, setActiveVideo, clearActiveVideo, openModal, closeModal } = useVideo()
  
  const isProject = item && Array.isArray(item.items)
  const itemsList = isProject ? item.items : (item ? [item] : [])

  const resolvePoster = useCallback(
    (videoItem) => {
      if (!videoItem) return undefined
      return videoItem.poster || (itemsList.length <= 1 ? videoItem.fallbackPoster : undefined)
    },
    [itemsList.length],
  )
  
  useEffect(() => {
    const onKey = (e) => { 
      if (e.key === 'Escape') {
        onClose()
      } else if (isProject && itemsList.length > 1) {
        // Navegación con flechas del teclado
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setIndex((i) => (i - 1 + itemsList.length) % itemsList.length)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          setIndex((i) => (i + 1) % itemsList.length)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, isProject, itemsList.length])

  // Reset when opening a different item
  useEffect(() => { setIndex(0) }, [item])

  // Lock page scroll while modal is open so it behaves like a separate page
  useEffect(() => {
    if (item) {
      openModal()
    } else {
      closeModal()
    }
  }, [item, openModal, closeModal])

  // Clear active video when modal closes
  useEffect(() => {
    if (!item) {
      clearActiveVideo()
    }
  }, [item, clearActiveVideo])
  const current = itemsList[index]
  const currentPoster = resolvePoster(current)
  const videoRef = useRef(null)
  const iframeRef = useRef(null)
  const mediaRef = useRef(null)
  const isPlaceholder = !current?.src && !current?.embedUrl

  const renderCredits = (text) => {
    const raw = (text && String(text)) || ''
    const normalized = raw.replace(/\\n/g, '\n')
    const lines = normalized.split('\n')
    return (
      <>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </>
    )
  }

  // Try to autoplay whenever the current item changes
  useEffect(() => {
    if (isPlaceholder) return undefined

    const el = videoRef.current
    const iframe = iframeRef.current
    
    if (el && typeof el.play === 'function') {
      registerVideo(el)
      
      const play = async () => {
        try { 
          setActiveVideo(el)
          await el.play() 
        } catch { /* ignore autoplay errors */ }
      }
      if (el.readyState >= 2) play()
      else el.addEventListener('canplay', play, { once: true })
    }
    
    if (iframe) {
      registerVideo(iframe)
      setActiveVideo(iframe)
    }
    
    return () => {
      if (el) {
        unregisterVideo(el)
      }
      if (iframe) {
        unregisterVideo(iframe)
      }
    }
  }, [current, isPlaceholder, registerVideo, unregisterVideo, setActiveVideo])

  const embedSrc = useMemo(() => {
    if (!current?.embedUrl) return null
    // Añadir parámetros para ocultar cabecera de Vimeo y autoplay
    const baseUrl = current.embedUrl.includes('?') ? current.embedUrl : `${current.embedUrl}?`
    // Asegurar que los parámetros de Vimeo estén presentes (title=0, byline=0, portrait=0)
    let url = baseUrl
    if (!url.includes('title=')) url += (url.includes('?') && !url.endsWith('?') ? '&' : '') + 'title=0'
    if (!url.includes('byline=')) url += '&byline=0'
    if (!url.includes('portrait=')) url += '&portrait=0'
    // Añadir autoplay
    if (!url.includes('autoplay=')) {
      url += '&autoplay=1'
    } else {
      url = url.replace(/autoplay=[01]/, 'autoplay=1')
    }
    return url
  }, [current])

  if (!item) return null

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on any child elements
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Botón close para desktop */}
        <button 
          className="modal-close modal-close-desktop"
          onClick={(e) => { 
            e.stopPropagation(); 
            onClose() 
          }}
          aria-label="Cerrar modal"
        >
          (x) close
        </button>
        
        <div className="modal-header">
          <strong>{item.title}</strong>
          
          {/* Botón close para móvil */}
          <button 
            className="modal-close modal-close-mobile"
            onClick={(e) => { 
              e.stopPropagation(); 
              onClose() 
            }}
            aria-label="Cerrar modal"
          >
            (x) close
          </button>
        </div>
        <div className="media-unit">
          <div className="modal-media" ref={mediaRef}>
          {!isPlaceholder && current?.src ? (
            <video
              key={current?.src || item.src}
              ref={videoRef}
              src={current?.src || item.src}
              poster={currentPoster || item.poster}
              controls
              playsInline
              autoPlay
            />
          ) : !isPlaceholder && current?.embedUrl ? (
            <iframe
              ref={iframeRef}
              key={embedSrc}
              src={embedSrc}
              title={item.title}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : currentPoster ? (
            <img src={currentPoster} alt="" />
          ) : null}
          </div>
          <div className="credits-below">
            {renderCredits((item.credits && item.credits.trim()) || `Directed by: —\\nEdited by: Joan Colomer\\nProduction: —\\nClient: —`)}
          </div>
        </div>
        {/* Thumbnail navigation for multi-video projects */}
        {isProject && itemsList.length > 1 && (
          <div className="thumbnail-nav">
            <div className="thumbnail-carousel">
              <button 
                className="thumbnail-nav-button thumbnail-nav-prev"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIndex((i) => (i - 1 + itemsList.length) % itemsList.length) 
                }}
                aria-label="Video anterior"
              >
                ← prev
              </button>

              {(() => {
                // Mostrar el vídeo actual y 3 más (total 4 visibles)
                const startIdx = Math.max(0, Math.min(index - 1, itemsList.length - 4));
                const endIdx = Math.min(startIdx + 4, itemsList.length);
                const visibleItems = itemsList.slice(startIdx, endIdx);

                return (
                  <>
                    {startIdx > 0 && (
                      <div className="thumbnail-more">...</div>
                    )}

                    <div className={`thumbnail-grid ${itemsList.length >= 4 ? 'thumbnail-grid-compact' : ''}`}>
                      {visibleItems.map((videoItem, idx) => {
                        const actualIdx = startIdx + idx;
                        return (
                          <button
                            key={actualIdx}
                            className={`thumbnail-nav-item ${actualIdx === index ? 'active' : ''}`}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setIndex(actualIdx) 
                            }}
                            aria-label={`Ver video ${actualIdx + 1}: ${videoItem.title || `Video ${actualIdx + 1}`}`}
                          >
                            {resolvePoster(videoItem) ? (
                              <img src={resolvePoster(videoItem)} alt={videoItem.title || `Video ${actualIdx + 1}`} loading="lazy" />
                            ) : videoItem.src ? (
                              <VideoThumb src={videoItem.src} alt={videoItem.title || `Video ${actualIdx + 1}`} />
                            ) : null}
                            <span className="thumbnail-number">{actualIdx + 1}</span>
                          </button>
                        );
                      })}
                    </div>

                    {endIdx < itemsList.length && (
                      <div className="thumbnail-more">...</div>
                    )}
                  </>
                );
              })()}

              <button 
                className="thumbnail-nav-button thumbnail-nav-next"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIndex((i) => (i + 1) % itemsList.length) 
                }}
                aria-label="Siguiente video"
              >
                next →
              </button>
            </div>
          </div>
        )}
        
        {/* Removed duplicate credits in footer */}
      </div>
    </div>
  )
}


