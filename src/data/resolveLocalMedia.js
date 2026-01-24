const videoModules = import.meta.glob('../media/edits/**/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })
const imageModules = import.meta.glob('../media/edits/**/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })

const byBase = (path) => (path.split('/').pop() || '').toLowerCase()
const dirname = (path) => {
  const parts = path.split('/')
  parts.pop()
  return (parts.pop() || '').toLowerCase()
}
const stem = (filename) => filename.replace(/\.[^.]+$/, '')

const videoMap = new Map(
  Object.entries(videoModules).map(([path, url]) => [byBase(path), url])
)

const imageMap = new Map(
  Object.entries(imageModules).map(([path, url]) => [byBase(path), url])
)

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const PUBLIC_MEDIA_PREFIX = `${baseUrl}/media/edits/`

const folderPosterMap = new Map()
Object.entries(imageModules).forEach(([path, url]) => {
  const base = byBase(path)
  if (base === 'poster.jpg' || base === 'poster.webp' || base === 'poster.png') {
    folderPosterMap.set(dirname(path), url)
  }
})

const rootPosterByStem = new Map()
Object.entries(imageModules).forEach(([path, url]) => {
  const dir = dirname(path)
  const base = byBase(path)
  const m = base.match(/^(.*)_poster\.(jpg|jpeg|png|webp)$/)
  if (m && dir !== 'edits') return
  if (m) {
    rootPosterByStem.set(m[1], url)
  }
})

const rootVideoByStem = new Map()
Object.entries(videoModules).forEach(([path, url]) => {
  const dir = dirname(path)
  if (dir !== 'edits') return
  const base = byBase(path)
  rootVideoByStem.set(normalizeStemKey(stem(base)), url)
})

export function resolveVideoSrc(input) {
  if (!input) return undefined
  const raw = String(input).trim()
  if (!raw) return undefined
  if (/^https?:/i.test(raw)) return raw

  const base = byBase(raw)
  const exact = videoMap.get(base)
  if (exact) return exact

  const inputStem = normalizeStemKey(stem(base))
  for (const [k, url] of videoMap.entries()) {
    const ks = normalizeStemKey(stem(k))
    if (ks === inputStem || ks.startsWith(inputStem) || inputStem.startsWith(ks)) {
      return url
    }
  }

  return `${PUBLIC_MEDIA_PREFIX}${raw.replace(/^\.\//, '')}`
}

function stripDiacritics(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
}

function normalizeTitleKey(title) {
  return stripDiacritics(title).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function normalizeStemKey(stemValue) {
  return stripDiacritics(stemValue).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function resolveProjectPosterByTitle(title) {
  const key = normalizeTitleKey(title)
  for (const [dirName, url] of folderPosterMap.entries()) {
    if (normalizeTitleKey(dirName) === key) return url
  }
  for (const [stemKey, url] of rootPosterByStem.entries()) {
    if (normalizeStemKey(stemKey) === key) return url
  }
  return undefined
}

export function resolveProjectVideoByTitle(title) {
  const key = normalizeTitleKey(title)
  const direct = rootVideoByStem.get(key)
  if (direct) return direct
  return undefined
}

export function resolvePosterFromVideo(src) {
  if (!src) return undefined
  const base = byBase(String(src))
  const s = normalizeStemKey(stem(base))
  const candidates = [
    `${s}_poster.jpg`,
    `${s}_poster.webp`,
    `${s}_poster.png`,
    `${s}_poster.jpeg`,
  ]
  for (const c of candidates) {
    const hit = imageMap.get(c)
    if (hit) return hit
  }
  return undefined
}

export function resolveImageSrc(input) {
  if (!input) return undefined
  let raw = String(input).trim()
  if (!raw) return undefined
  const bbcodeMatch = raw.match(/^\[img\](.+?)\[\/img\]$/i)
  if (bbcodeMatch) {
    raw = bbcodeMatch[1].trim()
  }
  if (/^https?:/i.test(raw)) return raw

  const base = byBase(raw)
  const exact = imageMap.get(base)
  if (exact) return exact

  const inputStem = normalizeStemKey(stem(base))
  for (const [k, url] of imageMap.entries()) {
    const ks = normalizeStemKey(stem(k))
    if (ks === inputStem || ks.startsWith(inputStem) || inputStem.startsWith(ks)) {
      return url
    }
  }

  return undefined
}
