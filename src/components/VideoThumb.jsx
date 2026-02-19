import { useEffect, useState } from 'react'

// Generate a thumbnail from the first frame of the video if poster is missing
export default function VideoThumb({ src, alt = '' }) {
  const [thumb, setThumb] = useState(null)

  useEffect(() => {
    if (!src) return

    const cacheKey = `thumb:${src}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      setThumb(cached)
      return
    }

    let cancelled = false

    // Try remote pre-generated thumbnail by swapping extension to .jpg
    const candidate = src.replace(/\.\w+($|\?)/, '.jpg$1')
    const img = new Image()
    img.decoding = 'async'
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        sessionStorage.setItem(cacheKey, candidate)
      } catch {}
      setThumb(candidate)
    }
    img.onerror = () => {
      // fallback: generate from video frame
      tryGenerateFromVideo()
    }
    img.src = candidate

    function tryGenerateFromVideo() {
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.preload = 'auto'
      video.src = src
      video.muted = true

      const capture = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth || 320
          canvas.height = video.videoHeight || 180
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          if (!cancelled) {
            try { sessionStorage.setItem(cacheKey, dataUrl) } catch {}
            setThumb(dataUrl)
          }
        } catch {
          // swallow errors
        }
      }

      const onLoaded = () => {
        const target = Math.min(0.2, video.duration || 0.2)
        const onSeeked = () => {
          capture()
          video.removeEventListener('seeked', onSeeked)
          video.src = ''
        }
        video.addEventListener('seeked', onSeeked)
        try { video.currentTime = target } catch { capture() }
      }

      video.addEventListener('loadeddata', onLoaded, { once: true })
      video.addEventListener('error', () => { /* ignore */ }, { once: true })
    }

    return () => { cancelled = true }
  }, [src])

  if (!thumb) return <div className="thumb" aria-hidden />
  return <img src={thumb} alt={alt} loading="eager" fetchpriority="high" />
}


