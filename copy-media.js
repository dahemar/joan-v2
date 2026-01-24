import { existsSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import path from 'node:path'

const cwd = process.cwd()
const sourceDir = path.resolve(cwd, 'media')
const targetDir = path.resolve(cwd, 'dist', 'media')

async function main() {
  if (!existsSync(sourceDir)) {
    console.log('[copy-media] No media directory found, skipping copy')
    return
  }

  try {
    await cp(sourceDir, targetDir, { recursive: true })
    console.log('[copy-media] Copied media directory to dist/media')
  } catch (error) {
    console.error('[copy-media] Failed to copy media directory:', error)
    process.exitCode = 1
  }
}

main()



