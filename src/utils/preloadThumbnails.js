import { loadEditsFromSheets, loadDirectedFromSheets, sheetsConfigured } from '../data/loadFromSheets'
import { resolveProjectPosterByTitle } from '../data/resolveLocalMedia'

const preloaded = new Set()

function preloadImage(src) {
  if (!src || preloaded.has(src)) return
  try {
    const img = new Image()
    img.decoding = 'async'
    img.loading = 'eager'
    img.src = src
    preloaded.add(src)
  } catch {}
}

export async function preloadThumbnailsInBackground() {
  if (!sheetsConfigured()) return
  try {
    const [edits, directed] = await Promise.all([
      loadEditsFromSheets(),
      loadDirectedFromSheets().catch(() => []),
    ])
    const projects = Array.isArray(edits) ? edits : []
    const directedItems = Array.isArray(directed) ? directed : []

    // Edits grid posters
    projects.forEach((p) => {
      const poster = p.poster || resolveProjectPosterByTitle(p.title)
      if (poster) preloadImage(poster)
    })

    // Directed grid posters (flattened items share title per project)
    directedItems.forEach((it) => {
      const poster = it.poster || resolveProjectPosterByTitle(it.title)
      if (poster) preloadImage(poster)
    })
  } catch {}
}


