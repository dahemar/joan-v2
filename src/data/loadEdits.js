// Auto-load videos and images from src/media/edits/** using Vite's glob imports
// Structure supported:
// - src/media/edits/ProjectA/video1.mp4, video2.mp4, poster.jpg, credits.txt
// - src/media/edits/video3.mp4 (treated as its own project "video3")

const videoModules = import.meta.glob('../media/edits/**/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })
const imageModules = import.meta.glob('../media/edits/**/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
const creditsTxt = import.meta.glob('../media/edits/**/credits.txt', { eager: true, query: '?raw', import: 'default' })
const creditsJson = import.meta.glob('../media/edits/**/credits.json', { eager: true, query: '?raw', import: 'default' })

function humanize(slug) {
  let result = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
  // Handle special cases for Spanish characters
  result = result.replace(/\bESPANA\b/g, "ESPAÑA")
  return result
}

function getProjectKey(path) {
  // path like ../media/edits/ProjectA/file.mp4 or ../media/edits/file.mp4
  const parts = path.split('/media/edits/')[1].split('/')
  if (parts.length > 1) return parts[0]
  const file = parts[0]
  return file.replace(/\.[^.]+$/, '')
}

function getDirPath(path) {
  const upto = path.lastIndexOf('/')
  return path.slice(0, upto)
}

const projectsMap = new Map()

// Initialize projects from videos
Object.entries(videoModules).forEach(([path, url]) => {
  const key = getProjectKey(path)
  const title = humanize(key)
  if (!projectsMap.has(key)) {
    projectsMap.set(key, { id: key, title, items: [], poster: undefined, credits: '' })
  }
  projectsMap.get(key).items.push({ src: url, type: 'video', title })
})

// Posters: prefer poster.* or first image
Object.entries(imageModules).forEach(([path, url]) => {
  let key = getProjectKey(path)
  const file = path.split('/').pop() || ''
  // Support both poster.jpg inside subfolder and <name>_poster.jpg next to a root file
  const m = file.match(/^(.+)_poster\.(jpg|jpeg|png|webp)$/i)
  if (m) {
    key = m[1]
  }
  if (!projectsMap.has(key)) return
  if (!projectsMap.get(key).poster || /^poster\./i.test(file) || /_poster\./i.test(file)) {
    projectsMap.get(key).poster = url
  }
})

// Credits
Object.entries(creditsTxt).forEach(([path, raw]) => {
  const key = getProjectKey(path)
  if (!projectsMap.has(key)) return
  projectsMap.get(key).credits = String(raw)
})
Object.entries(creditsJson).forEach(([path, raw]) => {
  const key = getProjectKey(path)
  if (!projectsMap.has(key)) return
  try {
    const obj = JSON.parse(String(raw))
    const lines = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n')
    projectsMap.get(key).credits = lines
  } catch {}
})

// Exclude items that belong to the Directed tab
const excludeFromEdits = [
  'CIUTAT - JUSTO AL OTRO LADO',
  'CIUTAT - I WANT TO STAY',
  'NAISEKUD - AMANTES DE VERDAD',
]
excludeFromEdits.forEach((k) => projectsMap.delete(k))

export const editsProjects = Array.from(projectsMap.values()).sort((a, b) => a.title.localeCompare(b.title))


