import { cp, readFile, realpath, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './fixture.mjs'

const bundle = new URL('../../../.tmp/dist/dist/', import.meta.url)
const destination = join(root, 'packages/renderer-worker/node_modules/@lvce-editor/simple-browser-view/dist')
await cp(bundle, destination, { recursive: true })
console.log('Installed this Simple Browser build into the application fixture')

// Updating the fixture's manifest directly would also refresh unrelated dependencies.
const rendererPackage = new URL('../../../.fixtures/renderer-release/node_modules/@lvce-editor/renderer-process/', import.meta.url)
const rendererManifest = JSON.parse(await readFile(new URL('package.json', rendererPackage), 'utf8'))
if (rendererManifest.version !== '30.64.2') throw new Error('Expected published renderer-process 30.64.2')
// Preserve npm workspace links: the server and import resolver must see the same package.
const rendererDestination = await realpath(join(root, 'packages/renderer-worker/node_modules/@lvce-editor/renderer-process'))
await rm(rendererDestination, { recursive: true, force: true })
await cp(rendererPackage, rendererDestination, { recursive: true })
console.log('Installed published renderer-process 30.64.2 without changing other fixture dependencies')

// The pinned fixture root lockfile predates the main-process event connection migration.
const embedsPackage = new URL('../../../.fixtures/renderer-release/node_modules/@lvce-editor/embeds-worker/', import.meta.url)
const embedsManifest = JSON.parse(await readFile(new URL('package.json', embedsPackage), 'utf8'))
if (embedsManifest.version !== '4.19.3') throw new Error('Expected published embeds-worker 4.19.3')
const embedsDestination = await realpath(join(root, 'packages/renderer-worker/node_modules/@lvce-editor/embeds-worker'))
await rm(embedsDestination, { recursive: true, force: true })
await cp(embedsPackage, embedsDestination, { recursive: true })
console.log('Installed published embeds-worker 4.19.3 with the main-process event connection')
