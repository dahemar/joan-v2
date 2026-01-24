import { useEffect, useState } from 'react'
import VideoModal from '../components/VideoModal'
import { directedVideos as fallbackDirected } from '../data/directedFromEdits'
import { loadDirectedFromSheets, sheetsConfigured } from '../data/loadFromSheets'
import { resolveProjectPosterByTitle, resolveProjectVideoByTitle } from '../data/resolveLocalMedia'
import VideoThumb from '../components/VideoThumb'

export default function Directed() {
  const [active, setActive] = useState(null)
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(sheetsConfigured())

  useEffect(() => {
    let cancelled = false
    if (sheetsConfigured()) {
      loadDirectedFromSheets()
        .then((res) => { if (!cancelled) setItems(res || []) })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoading(false) })
    }
    return () => { cancelled = true }
  }, [])

  if (sheetsConfigured() && loading) {
    return (
      <div className="center-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #333',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontSize: '14px', margin: 0 }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="center-viewport">
      <div className="grid">
        {(sheetsConfigured() && items && items.length > 0 ? items : fallbackDirected).map((item) => {
          const poster = item.poster || resolveProjectPosterByTitle(item.title)
          const thumbVideoSrc = item.src || resolveProjectVideoByTitle(item.title)
          return (
          <div key={item.id} className="grid-item">
            <button className="grid-thumb" onClick={() => setActive(item)} aria-label={`Open ${item.title}`}>
              {poster ? (
                <img src={poster} alt="" loading="lazy" />
              ) : (
                <VideoThumb src={thumbVideoSrc} alt={item.title} />
              )}
            </button>
            <div className="grid-caption">{item.title}</div>
          </div>
          )
        })}
      </div>
      <VideoModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}


