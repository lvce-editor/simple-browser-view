import { measureMemory } from '@lvce-editor/measure-memory'
import { join } from 'node:path'
import { root } from './root.js'

const threshold = 475_000

const instantiations = 7000

const instantiationsPath = join(root, 'packages', 'simple-browser-view')

const workerPath = join(root, '.tmp/dist/dist/simpleBrowserViewWorkerMain.js')

const playwrightPath = import.meta.resolve('../../e2e/node_modules/playwright/index.mjs')

await measureMemory({
  playwrightPath,
  workerPath,
  threshold,
  instantiations,
  instantiationsPath,
})
