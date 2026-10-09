import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const staticPath = join(root, 'node_modules', '@lvce-editor', 'static-server', 'static')
const directories = await readdir(staticPath)
const commitHash = directories.find((name) => /^[a-f0-9]{7}$/.test(name))
if (!commitHash) {
  throw new Error('Static server commit directory not found')
}
const rendererWorkerPath = join(staticPath, commitHash, 'packages', 'renderer-worker', 'dist', 'rendererWorkerMain.js')
const content = await readFile(rendererWorkerPath, 'utf8')

// The runtime's generic view renderer must dispatch tree patches to the renderer process.
const occurrence = '} else if (command[0] === "Viewlet.setPatches") {'
const replacement = '} else if (command[0] === "Viewlet.setPatches" || command[0] === "Viewlet.setTreePatches") {'
if (!content.includes(replacement)) {
  if (!content.includes(occurrence)) {
    throw new Error('Expected view render patch dispatch not found')
  }
  await writeFile(rendererWorkerPath, content.replace(occurrence, replacement))
}
