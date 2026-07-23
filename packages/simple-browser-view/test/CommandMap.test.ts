import { expect, test } from '@jest/globals'
import { commandMap } from '../src/parts/CommandMap/CommandMap.ts'

test('registers the developer tools click handler', () => {
  expect(commandMap['SimpleBrowser.handleClickOpenDevtools']).toBeDefined()
})

test('registers the navigation handlers', () => {
  expect(commandMap['SimpleBrowser.handleDidNavigate']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleWillNavigate']).toBeDefined()
})
