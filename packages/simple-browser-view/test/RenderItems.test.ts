import { expect, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import * as Create from '../src/parts/Create/Create.ts'
import * as RenderItems from '../src/parts/RenderItems/RenderItems.ts'

test('renders the current page title in the tab strip', () => {
  const oldState = Create.create(1, 0, 0, 800, 600)
  const newState: SimpleBrowserState = {
    ...oldState,
    iframeSrc: 'https://example.com',
    title: 'Example Domain',
  }

  const command = RenderItems.renderItems(oldState, newState)
  expect(command[0]).toBe('Viewlet.setDom2')
  expect(command[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        className: 'MainTab MainTabSelected',
        title: 'Example Domain',
      }),
      expect.objectContaining({
        text: 'Example Domain',
      }),
    ]),
  )
})
