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
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.preload = 'auto'
    video.src = src
    video.muted = true

    const capture = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        if (!cancelled) {
          sessionStorage.setItem(cacheKey, dataUrl)
          setThumb(dataUrl)
        }
      } catch {
        // swallow errors and leave placeholder
      }
    }

    const onLoaded = () => {
      // Seek a little to ensure a decoded frame is available
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

    return () => { cancelled = true }
  }, [src])

  if (!thumb) return <div className="thumb" aria-hidden />
  return <img src={thumb} alt={alt} loading="lazy" />
}


