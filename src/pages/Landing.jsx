import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useCallback } from 'react'
import { sheetsConfigured } from '../data/loadFromSheets'
import { preloadThumbnailsInBackground } from '../utils/preloadThumbnails'

export default function Landing() {
  const videoRef = useRef(null)
  const playTimeoutRef = useRef(null)

  const tryPlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    el.defaultMuted = true
    el.setAttribute('muted', '')
    el.setAttribute('playsinline', '')
    el.setAttribute('autoplay', '')
    el.play().catch(() => {})
  }, [])

  useEffect(() => {
    if (sheetsConfigured()) {
      // Start preloading thumbnails while the GIF is displayed
      preloadThumbnailsInBackground()
    }
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return undefined

    if (el.readyState >= 2) {
      tryPlay()
    } else {
      el.addEventListener('loadeddata', tryPlay, { once: true })
    }

    return () => {
      el.removeEventListener('loadeddata', tryPlay)
    }
  }, [tryPlay])

  useEffect(() => {
    playTimeoutRef.current = setInterval(() => {
      const el = videoRef.current
      if (el && el.paused) {
        tryPlay()
      }
    }, 1500)

    return () => {
      if (playTimeoutRef.current) {
        clearInterval(playTimeoutRef.current)
      }
    }
  }, [tryPlay])

  useEffect(() => {
    const reattempt = () => {
      tryPlay()
    }

    const onVisibility = () => {
      if (!document.hidden) {
        tryPlay()
      }
    }

    const events = ['pointerdown', 'touchstart', 'keydown']
    events.forEach((evt) => document.addEventListener(evt, reattempt, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', reattempt)
    window.addEventListener('pageshow', reattempt)

    return () => {
      events.forEach((evt) => document.removeEventListener(evt, reattempt))
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', reattempt)
      window.removeEventListener('pageshow', reattempt)
    }
  }, [tryPlay])
  return (
    <div>
      <div className="topbar center-viewport">
        <div className="links">
          <NavLink to="/work" className={({ isActive }) => isActive ? 'active' : undefined}>work</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : undefined}>contact</NavLink>
        </div>
      </div>
      <div className="landing-page">
        <div className="landing-content">
          <div className="landing-media">
            <video
              ref={videoRef}
              className="landing-gif"
              autoPlay
              muted
              defaultMuted
              loop
              playsInline
              poster={import.meta.env.BASE_URL + 'HOMEtest.jpg'}
              preload="auto"
            >
              <source src={import.meta.env.BASE_URL + 'HOMEtest.webm'} type="video/webm" />
              <source src={import.meta.env.BASE_URL + 'HOMEtest.mp4'} type="video/mp4" />
              <img src={import.meta.env.BASE_URL + 'HOMEtest.jpg'} alt="Landing animation" />
            </video>
          </div>
        </div>
      </div>
    </div>
  )
}
