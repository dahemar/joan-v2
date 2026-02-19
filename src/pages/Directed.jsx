import { useEffect, useState } from 'react'
import VideoModal from '../components/VideoModal'
import { getCachedDirectedItems, loadDirectedFromSheets, sheetsConfigured } from '../data/loadFromSheets'
import { resolveProjectPosterByTitle, resolveProjectVideoByTitle } from '../data/resolveLocalMedia'
import VideoThumb from '../components/VideoThumb'

export default function Directed() {
  const [active, setActive] = useState(null)
  const [items, setItems] = useState(() => (sheetsConfigured() ? (getCachedDirectedItems() || []) : []))
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="center-viewport">
      <div className="grid">
        {(items || []).map((item) => {
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


