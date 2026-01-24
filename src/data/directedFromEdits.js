// Pull specific directed videos from the edits folder by filename
// Target files: JUSTO AL OTRO LADO, I WANT TO STAY, NAISEKUD - AMANTES DE VERDAD

const videoModules = import.meta.glob('../media/edits/*.{mp4,webm,mov}', { eager: true, query: '?url', import: 'default' })
const imageModules = import.meta.glob('../media/edits/*_poster.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })

const targets = [
  'JUSTO AL OTRO LADO',
  'I WANT TO STAY',
  'NAISEKUD - AMANTES DE VERDAD',
]

function humanize(file) {
  return file.replace(/\.[^.]+$/, '')
}

const normalizeKey = (s) => (s || '').normalize('NFC')
const posterMap = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => {
    const file = path.split('/').pop() || ''
    const raw = file.replace(/_poster\.(jpg|jpeg|png|webp)$/i, '')
    const name = normalizeKey(raw)
    return [name, url]
  })
)

export const directedVideos = Object.entries(videoModules)
  .filter(([path]) => targets.some((t) => path.toUpperCase().includes(t)))
  .map(([path, url]) => {
    const file = path.split('/').pop() || ''
    const base = file.replace(/\.[^.]+$/, '')
    const title = base
    const key = normalizeKey(base)
    return ({ id: path, title, src: url, poster: posterMap[key] })
  })
  .sort((a, b) => a.title.localeCompare(b.title))


