import { measureMemory } from '@lvce-editor/measure-memory'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { root } from './root.js'

const threshold = 475_000

const instantiations = 7000

const instantiationsPath = join(root, 'packages', 'simple-browser-view')

const workerPath = join(root, '.tmp/dist/dist/simpleBrowserViewWorkerMain.js')

const e2eRequire = createRequire(new URL('../../e2e/package.json', import.meta.url))
const playwrightPath = pathToFileURL(join(dirname(e2eRequire.resolve('playwright/package.json')), 'index.mjs')).href

await measureMemory({
  playwrightPath,
  workerPath,
  threshold,
  instantiations,
  instantiationsPath,
})
