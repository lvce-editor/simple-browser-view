import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as DiffItems from '../src/parts/DiffItems/DiffItems.ts'

test('page title changes require a render', () => {
  const oldState = Create.create(1, 0, 0, 800, 600)
  const newState = {
    ...oldState,
    tabs: [
      {
        browserViewId: 12,
        canGoBack: false,
        canGoForward: false,
        iframeSrc: 'https://example.com',
        inputValue: 'https://example.com',
        isLoading: false,
        title: 'Example Domain',
      },
    ],
  }

  expect(DiffItems.isEqual(oldState, newState)).toBe(false)
})

test('tab drop indicator changes require a render', () => {
  const oldState = Create.create(1, 0, 0, 800, 600)
  const newState = {
    ...oldState,
    tabDropIndex: 0,
  }

  expect(DiffItems.isEqual(oldState, newState)).toBe(false)
})

test('active tab changes require a render even when both tabs share the same URL', () => {
  const oldState = Create.create(1, 0, 0, 800, 600)
  const newState = {
    ...oldState,
    browserViewId: 12,
  }

  expect(DiffItems.isEqual(oldState, newState)).toBe(false)
})

test('drag source changes do not require a DOM render', () => {
  const oldState = Create.create(1, 0, 0, 800, 600)
  const newState = {
    ...oldState,
    draggedBrowserViewId: 12,
  }

  expect(DiffItems.isEqual(oldState, newState)).toBe(true)
})
