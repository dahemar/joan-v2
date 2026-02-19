import { useEffect, useMemo, useState } from 'react'
import VideoModal from '../components/VideoModal'
import { editsProjects as loaded } from '../data/loadEdits'
import { loadEditsFromSheets, sheetsConfigured } from '../data/loadFromSheets'
import { edits as fallback } from '../data/videos'
import VideoThumb from '../components/VideoThumb'
import { EDIT_CATEGORIES } from '../data/categories'
import { useSearchParams } from 'react-router-dom'

export default function Edits() {
  if (import.meta.env.DEV) console.log('🎨 Edits component rendered')
  const [active, setActive] = useState(null)
  const [sheetProjects, setSheetProjects] = useState(null)
  const sheetsConfig = sheetsConfigured()
  if (import.meta.env.DEV) console.log('🎨 sheetsConfigured:', sheetsConfig)
  const [loading, setLoading] = useState(sheetsConfig)
  const [params, setParams] = useSearchParams()
  const filter = params.get('f') || 'all'
  const projects = useMemo(() => {
    // Prioritize Google Sheets if configured and loaded
    if (sheetsConfigured() && sheetProjects && sheetProjects.length > 0) {
      return sheetProjects
    }
    // Fallback to local files or hardcoded data
    return loaded && loaded.length
      ? loaded
      : fallback.map((e) => ({ id: e.id, title: e.title, poster: e.poster, items: [e], credits: e.credits }))
  }, [sheetProjects])

  // Load from Google Sheets if configured
  useEffect(() => {
    let cancelled = false
    if (sheetsConfigured()) {
      if (import.meta.env.DEV) console.log('🔄 Edits: Starting Google Sheets fetch...')
      loadEditsFromSheets()
        .then((projects) => { 
          if (import.meta.env.DEV) console.log('📦 Edits: Sheets response:', projects?.length || 0, 'projects')
          if (!cancelled) setSheetProjects(projects || []) 
        })
        .catch((error) => {
          console.error('💥 Edits: Sheets error:', error)
        })
        .finally(() => { 
          if (!cancelled) {
            if (import.meta.env.DEV) console.log('✅ Edits: Sheets loading finished')
            setLoading(false) 
          }
        })
    }
    return () => { cancelled = true }
  }, [])

  return (
    <div className="center-viewport">
      <div className="grid">
        {projects.map((project) => {
          if (import.meta.env.DEV) console.log('🎬 Rendering project:', project.id, project.title, 'items:', project.items?.length)
          const cat = project.category || EDIT_CATEGORIES[project.title] || 'music'
          const dim = (filter === 'commercial' && cat !== 'commercial') || (filter === 'music' && cat !== 'music')
          return (
          <div key={project.id} className="grid-item" style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 160ms ease' }}>
            <button className="grid-thumb" onClick={() => setActive(project)} aria-label={`Open ${project.title}`}>
              {project.poster ? (
                <img src={project.poster} alt="" loading="lazy" />
              ) : (
                // If no poster, try to draw a thumbnail from the first clip
                <VideoThumb src={project.items?.[0]?.src} alt={project.title} />
              )}
            </button>
            <div className="grid-caption">{project.title}</div>
          </div>)
        })}
      </div>
      <VideoModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}


