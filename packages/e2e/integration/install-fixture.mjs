import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './fixture.mjs'

const bundle = new URL('../../../.tmp/dist/dist/', import.meta.url)
const destination = join(root, 'packages/renderer-worker/node_modules/@lvce-editor/simple-browser-view/dist')
await cp(bundle, destination, { recursive: true })
console.log('Installed this Simple Browser build into the application fixture')
