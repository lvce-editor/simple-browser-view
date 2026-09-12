import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('includes the simple browser settings contribution in the build', async () => {
  const settings = JSON.parse(await readFile(new URL('../../../.tmp/dist/dist/settings.json', import.meta.url), 'utf8'))

  assert.deepEqual(settings.find(({ id }) => id === 'simpleBrowser.tabHover.enabled'), {
    category: 'features',
    description: 'Controls whether hovering over a simple browser tab shows its full title and memory usage',
    heading: 'Simple Browser Tab Hover',
    id: 'simpleBrowser.tabHover.enabled',
    type: 'boolean',
    value: false,
  })
})
