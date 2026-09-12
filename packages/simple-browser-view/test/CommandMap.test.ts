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
  expect(commandMap['SimpleBrowser.handleDragEnd']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleDragLeave']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleDragStart']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleDrop']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleTabDragOver']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleTabsDragOver']).toBeDefined()
  expect(commandMap['SimpleBrowser.handleTabMouseUp']).toBeDefined()
})
