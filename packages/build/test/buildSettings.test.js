import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('includes the simple browser settings contribution in the build', async () => {
  const settings = JSON.parse(await readFile(new URL('../../../.tmp/dist/dist/settings.json', import.meta.url), 'utf8'))

  assert.deepEqual(settings.find(({ id }) => id === 'simpleBrowser.workflows').items, {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Unique name used to select this workflow from a keybinding',
      },
      tasks: {
        type: 'array',
        description: 'Ordered browser actions to run; the first task must open a browser tab',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['open-simple-browser-tab', 'press-key'],
              description: 'Opens a browser tab or sends a key to the active page',
            },
            url: {
              type: 'string',
              description: 'HTTP(S) page to open; URLs without a scheme use HTTPS',
            },
            key: {
              type: 'string',
              description: 'Key to send, optionally combined with ctrl, shift, alt, or meta',
            },
          },
        },
      },
    },
  })

  assert.deepEqual(settings.find(({ id }) => id === 'simpleBrowser.tabHover.enabled'), {
    category: 'features',
    description: 'Controls whether hovering over a simple browser tab shows its full title and memory usage',
    heading: 'Simple Browser Tab Hover',
    id: 'simpleBrowser.tabHover.enabled',
    type: 'boolean',
    value: false,
  })
})
