import { resolveImageSrc, resolveVideoSrc, resolveProjectPosterByTitle, resolveProjectVideoByTitle, resolvePosterFromVideo } from './resolveLocalMedia'
// Load Projects and Videos from Google Sheets and adapt to the local structure
// Expected Sheets: "Projects" and "Videos"
// Env vars: VITE_GOOGLE_SHEETS_API_KEY, VITE_GOOGLE_SHEETS_SHEET_ID

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SHEET_ID

// Debug: Log all env vars on module load
console.log('🔧 loadFromSheets.js loaded')
console.log('🔧 import.meta.env.PROD:', import.meta.env.PROD)
console.log('🔧 import.meta.env.MODE:', import.meta.env.MODE)
console.log('🔧 API_KEY exists:', !!API_KEY)
console.log('🔧 SHEET_ID exists:', !!SHEET_ID)

const BASE = SHEET_ID
  ? `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`
  : null

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

function humanize(slug) {
  let result = String(slug || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
  result = result.replace(/\bESPANA\b/g, 'ESPAÑA')
  return result
}

function parseValues(values) {
  if (!values || values.length === 0) return []
  const headers = values[0].map(normalizeHeader)
  return values
    .slice(1)
    .filter((row) => row && row.length)
    .map((row) => {
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = row[i] ?? ''
      })
      return obj
    })
}

async function fetchRange(range) {
  if (!BASE || !API_KEY) throw new Error('Sheets not configured')

  // sessionStorage cache to speed up subsequent loads
  const cacheKey = `gs:${SHEET_ID}:${range}`
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const { ts, values } = JSON.parse(cached)
      // TTL 120s to reduce flicker and API hits
      if (Date.now() - ts < 120_000 && Array.isArray(values)) {
        console.log('⚡ Using cached range:', range, 'rows:', values.length)
        return values
      }
    }
  } catch {}

  const url = `${BASE}/${encodeURIComponent(range)}?key=${API_KEY}`
  console.log('🌐 Fetching:', url)
  const res = await fetch(url)
  console.log('📡 Response status:', res.status)
  if (!res.ok) {
    const errorText = await res.text()
    console.log('❌ Error response:', errorText)
    throw new Error(`Sheets HTTP ${res.status}: ${errorText}`)
  }
  const json = await res.json()
  const values = json.values || []
  console.log('📊 Data received:', values.length || 0, 'rows')
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), values }))
  } catch {}
  return values
}

function toBool(v) {
  const s = String(v || '').trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'show'
}

function toInt(v, fallback = 0) {
  const n = parseInt(String(v || '').trim(), 10)
  return Number.isFinite(n) ? n : fallback
}

function vimeoIdFromUrl(url) {
  if (!url) return null
  const m = String(url).match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  return m ? m[1] : null
}

function vimeoEmbedUrl(id) {
  if (!id) return null
  // Ocultar cabecera de Vimeo: title=0, byline=0, portrait=0
  return `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0`
}

async function loadProjectsAndVideos(projectsRange, videosRange) {
  if (!BASE || !API_KEY) return null

  const [projectsValues, videosValues] = await Promise.all([
    fetchRange(projectsRange),
    fetchRange(videosRange),
  ])

  const projectsRows = parseValues(projectsValues)
  const videosRows = parseValues(videosValues)

  const projectsMap = new Map()
  projectsRows
    .filter((p) => toBool(p.show ?? '1'))
    .forEach((p) => {
      const id = (p.id || p.slug || p.title || '').trim()
      if (!id) return
      const thumbnail = (p.thumbnail || p.poster || '').trim() || undefined
      const resolvedPoster = resolveImageSrc(thumbnail)
      let resolvedProjectSrc = resolveVideoSrc(p.src || p.local_src)
      projectsMap.set(id, {
        id,
        title: (p.title && p.title.trim()) || humanize(id),
        poster:
          resolvedPoster ||
          resolveProjectPosterByTitle(p.title) ||
          (/^https?:/i.test(String(thumbnail || '')) ? thumbnail : undefined),
        // Project-level media for single-video projects
        projectVimeoUrl: (p.vimeo_url || p.vimeo || '').trim() || undefined,
        projectSrc: resolvedProjectSrc || resolveProjectVideoByTitle(p.title) || undefined,
        projectThumbnail: resolvedPoster || resolveProjectPosterByTitle(p.title) || undefined,
        credits: (p.credits || '').trim(),
        order: toInt(p.order, 0),
        items: [],
        category: (p.category || '').trim() || undefined,
      })
    })

  videosRows
    .filter((v) => toBool(v.show ?? '1'))
    .forEach((v) => {
      const projectId = (v.project_id || v.project || '').trim()
      if (!projectId || !projectsMap.has(projectId)) return
      const localSrc = resolveVideoSrc(v.src || v.local_src) || undefined
      const thumbInput = (v.thumbnail || v.poster || '').trim()
      const project = projectsMap.get(projectId)
      const posterFromVideo = localSrc ? resolvePosterFromVideo(localSrc) : undefined
      const poster =
        resolveImageSrc(thumbInput) ||
        posterFromVideo ||
        (/^https?:/i.test(thumbInput) ? thumbInput : undefined)
      const fallbackPoster = poster ? undefined : (project.projectThumbnail || project.poster)
      const vimeoId = vimeoIdFromUrl(v.vimeo_url || v.vimeo || '')
      const embedUrl = vimeoId ? vimeoEmbedUrl(vimeoId) : undefined

      project.items.push({
        src: localSrc,
        embedUrl,
        poster: poster || undefined,
        fallbackPoster,
        order: toInt(v.order, 0),
      })
    })

  projectsMap.forEach((p) => {
    p.items.sort((a, b) => a.order - b.order)
    // If no video rows provided, fallback to project-level single item if available
    if (p.items.length === 0) {
      const vimeoId = vimeoIdFromUrl(p.projectVimeoUrl)
      const embedUrl = vimeoId ? vimeoEmbedUrl(vimeoId) : undefined
      const src = p.projectSrc || undefined
      if (embedUrl || src) {
        p.items.push({
          src,
          embedUrl,
          poster: p.poster,
          order: 0,
        })
      }
    }
    if (p.items.length === 0 && p.poster) {
      p.items.push({
        src: undefined,
        embedUrl: undefined,
        poster: p.poster,
        order: 0,
        placeholder: true,
      })
    }
  })

  const projects = Array.from(projectsMap.values())
    .filter((p) => p.items.length > 0 || p.poster)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

  return projects
}

export async function loadEditsFromSheets() {
  console.log('🎬 loadEditsFromSheets: Starting...')
  console.log('🎬 BASE:', BASE)
  console.log('🎬 API_KEY:', API_KEY ? `Present (${API_KEY.substring(0, 10)}...)` : 'Missing')
  console.log('🎬 SHEET_ID:', SHEET_ID || 'Missing')
  console.log('🎬 import.meta.env.PROD:', import.meta.env.PROD)
  
  if (!BASE || !API_KEY) {
    console.log('❌ Missing BASE or API_KEY')
    return null
  }
  
  // Prefer Edits_* sheets; fallback to generic Projects/Videos
  try {
    console.log('🎬 Trying Edits_Projects and Edits_Videos...')
    const result = await loadProjectsAndVideos('Edits_Projects!A:Z', 'Edits_Videos!A:Z')
    console.log('✅ Edits loaded:', result?.length, 'projects')
    if (result && result.length > 0) {
      console.log('📋 First project:', result[0])
    }
    return result
  } catch (error) {
    console.error('❌ Edits sheets failed:', error)
    console.error('Stack:', error.stack)
    try {
      console.log('🎬 Trying fallback Projects and Videos...')
      const result = await loadProjectsAndVideos('Projects!A:Z', 'Videos!A:Z')
      console.log('✅ Fallback loaded:', result?.length, 'projects')
      return result
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
      console.error('Stack:', fallbackError.stack)
      return null
    }
  }
}

export function sheetsConfigured() {
  const configured = Boolean(API_KEY && SHEET_ID)
  console.log('🔧 sheetsConfigured() called:', configured)
  return configured
}

export async function loadDirectedFromSheets() {
  if (!BASE || !API_KEY) return null
  // Read directed projects/videos and flatten into items for the Directed page
  const projects = await loadProjectsAndVideos('Directed_Projects!A:Z', 'Directed_Videos!A:Z')
  if (!projects) return null
  const items = []
  projects.forEach((p) => {
    p.items.forEach((it, idx) => {
      const resolvedPoster = it.poster || p.poster || resolveProjectPosterByTitle(p.title) || resolvePosterFromVideo(it.src)
      items.push({
        id: `${p.id}__${idx}`,
        title: p.title,
        src: it.src,
        embedUrl: it.embedUrl,
        poster: resolvedPoster,
        order: toInt(it.order, 0),
      })
    })
  })
  return items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export async function loadContactFromSheets() {
  if (!BASE || !API_KEY) return null
  try {
    const values = await fetchRange('Contact!A:Z')
    const rows = parseValues(values)
    if (!rows || rows.length === 0) return null
    // Format 1: key,value pairs
    const headers = (values[0] || []).map(normalizeHeader)
    const contact = {}
    if (headers.includes('key') && headers.includes('value')) {
      rows.forEach((r) => {
        const k = (r.key || '').trim().toLowerCase()
        const v = (r.value || '').trim()
        if (k) contact[k] = v
      })
      return contact
    }
    // Format 2: single row with named columns (email, instagram, etc.)
    const first = rows[0]
    Object.keys(first).forEach((k) => {
      contact[k] = String(first[k] || '')
    })
    return contact
  } catch {
    return null
  }
}


