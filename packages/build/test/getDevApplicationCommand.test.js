import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import { getDevApplicationCommand } from '../src/getDevApplicationCommand.js'
import { waitForDevProcesses } from '../src/waitForDevProcesses.js'

test('launches LVCE with the local simple browser worker linked', () => {
  const root = '/test/simple-browser-view'

  assert.deepEqual(getDevApplicationCommand(root, '/test/bin/lvce'), {
    args: ['--link', join(root, '.tmp', 'dist'), '--hot-reload', '--wait', root],
    command: '/test/bin/lvce',
    cwd: root,
  })
})

test('keeps the build watcher alive without an interactive stdin', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url), 'utf8'))

  assert.match(packageJson.scripts['build:watch'], /--watch=forever/)
})

test('terminates both child processes when the dev script is interrupted', async () => {
  /** @type {string[]} */
  const signals = []
  /** @returns {Promise<void> & { kill(signal: string): void }} */
  const createChild = () => {
    let resolveChild = () => {}
    /** @type {Promise<void>} */
    const childPromise = new Promise((resolve) => {
      resolveChild = resolve
    })
    return Object.assign(childPromise, {
      kill(signal) {
        signals.push(signal)
        resolveChild()
      },
    })
  }
  const processObject = new EventEmitter()
  const watcher = createChild()
  const application = createChild()

  const completion = waitForDevProcesses({ application, processObject, watcher })
  processObject.emit('SIGINT')
  await completion

  assert.deepEqual(signals, ['SIGTERM', 'SIGTERM'])
})
