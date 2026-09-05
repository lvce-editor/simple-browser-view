import { expect, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import { commandMap } from '../src/parts/CommandMap/CommandMap.ts'
import * as SimpleBrowserStates from '../src/parts/SimpleBrowserStates/SimpleBrowserStates.ts'

test('reads the latest state and renders edits through the component state commands', async () => {
  const initialState = commandMap['SimpleBrowser.create'](1, 0, 0, 800, 600)
  const pendingState = { ...initialState, isLoading: true }
  SimpleBrowserStates.set(1, initialState, pendingState)
  expect(commandMap['SimpleBrowser.getComponentState'](1)).toBe(pendingState)

  const editedState = { ...pendingState, iframeSrc: 'https://example.com/edited' }
  await commandMap['SimpleBrowser.setComponentState'](1, editedState)

  expect(commandMap['SimpleBrowser.getComponentState'](1)).toBe(editedState)
  expect(SimpleBrowserStates.get(1).oldState).toBe(initialState)
  const diff = commandMap['SimpleBrowser.diff2'](1)
  expect(diff.length).toBeGreaterThan(0)
  const commands = commandMap['SimpleBrowser.render2'](1, diff)
  expect(commands).toEqual(
    expect.arrayContaining([['Viewlet.setDom2', expect.arrayContaining([expect.objectContaining({ value: 'https://example.com/edited' })])]]),
  )
  expect(commandMap['SimpleBrowser.diff2'](1)).toEqual([])
})

test.each([null, [], 'invalid', 42])('rejects non-object state %p without changing the registry', async (value) => {
  const state = commandMap['SimpleBrowser.create'](2, 0, 0, 800, 600)
  await expect(commandMap['SimpleBrowser.setComponentState'](2, value as unknown as SimpleBrowserState)).rejects.toThrow(
    'SimpleBrowser state must be an object',
  )
  expect(commandMap['SimpleBrowser.getComponentState'](2)).toBe(state)
})

test('rejects changing the component uid without modifying either instance', async () => {
  const first = commandMap['SimpleBrowser.create'](3, 0, 0, 800, 600)
  const second = commandMap['SimpleBrowser.create'](4, 0, 0, 800, 600)
  await expect(commandMap['SimpleBrowser.setComponentState'](3, { ...first, uid: 4 })).rejects.toThrow('SimpleBrowser state uid must remain 3')
  expect(commandMap['SimpleBrowser.getComponentState'](3)).toBe(first)
  expect(commandMap['SimpleBrowser.getComponentState'](4)).toBe(second)
})
