import { createContext, useContext, useRef, useState } from 'react'

const VideoContext = createContext()

export function VideoProvider({ children }) {
  const activeVideoRef = useRef(null)
  const allVideosRef = useRef(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const stopMediaElement = (videoElement) => {
    if (!videoElement) return
    try {
      if (typeof videoElement.pause === 'function') {
        videoElement.pause()
        if (videoElement.currentTime !== undefined) {
          videoElement.currentTime = 0
        }
      } else if (videoElement.tagName === 'IFRAME') {
        const currentSrc = videoElement.src
        if (currentSrc) {
          videoElement.src = 'about:blank'
          setTimeout(() => {
            if (videoElement.src === 'about:blank') {
              videoElement.src = currentSrc
            }
          }, 100)
        }
      }
    } catch (error) {
      console.warn('Error stopping media element:', error)
    }
  }

  const registerVideo = (videoElement) => {
    if (videoElement) {
      allVideosRef.current.add(videoElement)
    }
  }

  const unregisterVideo = (videoElement) => {
    if (videoElement) {
      stopMediaElement(videoElement)
      allVideosRef.current.delete(videoElement)
    }
  }

  const pauseAllVideos = (exceptVideo = null) => {
    allVideosRef.current.forEach(video => {
      if (video !== exceptVideo && video) {
        stopMediaElement(video)
      }
    })
  }

  const setActiveVideo = (videoElement) => {
    // Pause all other videos first
    pauseAllVideos(videoElement)
    activeVideoRef.current = videoElement
  }

  const clearActiveVideo = () => {
    pauseAllVideos()
    activeVideoRef.current = null
  }

  const pauseAllVideosGlobally = () => {
    pauseAllVideos()
  }

  const openModal = () => {
    setIsModalOpen(true)
    document.body.classList.add('modal-open')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.classList.remove('modal-open')
  }

  return (
    <VideoContext.Provider value={{
      registerVideo,
      unregisterVideo,
      setActiveVideo,
      clearActiveVideo,
      pauseAllVideosGlobally,
      stopMediaElement,
      activeVideo: activeVideoRef.current,
      isModalOpen,
      openModal,
      closeModal
    }}>
      {children}
    </VideoContext.Provider>
  )
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}
