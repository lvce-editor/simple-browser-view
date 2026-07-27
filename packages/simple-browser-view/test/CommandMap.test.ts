import { expect, test } from '@jest/globals'
import { commandMap } from '../src/parts/CommandMap/CommandMap.ts'

test('registers the developer tools click handler', () => {
  expect(commandMap['SimpleBrowser.handleClickOpenDevtools']).toBeDefined()
})

test('registers the navigation handlers', () => {
  expect(commandMap['SimpleBrowser.handleDidNavigate']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleWillNavigate']).toBeDefined()
})

test('registers tab lifecycle handlers', () => {
  expect(commandMap['SimpleBrowser.handleClickCloseTab']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleClickNewTab']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleClickTab']).toBeDefined()
})
