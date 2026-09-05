import { expect, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../src/parts/SimpleBrowserTab/SimpleBrowserTab.ts'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandleTabDragOver from '../src/parts/HandleTabDragOver/HandleTabDragOver.ts'

const createTab = (browserViewId: number): SimpleBrowserTab => ({
  browserViewId,
  canGoBack: false,
  canGoForward: false,
  iframeSrc: '',
  inputValue: '',
  isLoading: false,
  title: `Tab ${browserViewId}`,
})

const createState = (): SimpleBrowserState => ({
  ...Create.create(1, 100, 0, 800, 600),
  draggedBrowserViewId: 2,
  tabs: [createTab(1), createTab(2), createTab(3)],
})

test('shows an insertion indicator before the hovered tab midpoint', () => {
  const result = HandleTabDragOver.handleTabDragOver(createState(), '0', 20, 100, 0, 169)

  expect(result.tabDropIndex).toBe(0)
})

test('shows an insertion indicator after the hovered tab midpoint', () => {
  const result = HandleTabDragOver.handleTabDragOver(createState(), '1', 120, 100, 0, 271)

  expect(result.tabDropIndex).toBe(2)
})

test('uses the after position at the exact midpoint', () => {
  const result = HandleTabDragOver.handleTabDragOver(createState(), '1', 120, 100, 0, 270)

  expect(result.tabDropIndex).toBe(2)
})

test('accounts for horizontal scrolling', () => {
  const result = HandleTabDragOver.handleTabDragOver(createState(), '2', 300, 100, 200, 249)

  expect(result.tabDropIndex).toBe(2)
})

test('accounts for the Simple Browser horizontal offset', () => {
  const result = HandleTabDragOver.handleTabDragOver(createState(), '0', 20, 100, 0, 171)

  expect(result.tabDropIndex).toBe(1)
})

test('returns the same state for an unchanged insertion point', () => {
  const state = { ...createState(), tabDropIndex: 0 }

  expect(HandleTabDragOver.handleTabDragOver(state, '0', 20, 100, 0, 169)).toBe(state)
})

test.each(['-1', '3', 'invalid'])('ignores invalid target tab index %s', (tabIndex) => {
  const state = createState()

  expect(HandleTabDragOver.handleTabDragOver(state, tabIndex, 20, 100, 0, 169)).toBe(state)
})

test('ignores drag over when the dragged tab no longer exists', () => {
  const state = { ...createState(), draggedBrowserViewId: 99 }

  expect(HandleTabDragOver.handleTabDragOver(state, '0', 20, 100, 0, 169)).toBe(state)
})

test('shows an insertion indicator after the final tab over strip whitespace', () => {
  const result = HandleTabDragOver.handleTabsDragOver(createState())

  expect(result.tabDropIndex).toBe(3)
})

test('returns the same state for unchanged strip whitespace insertion point', () => {
  const state = { ...createState(), tabDropIndex: 3 }

  expect(HandleTabDragOver.handleTabsDragOver(state)).toBe(state)
})

test('ignores strip whitespace drag over without an internal dragged tab', () => {
  const state = { ...createState(), draggedBrowserViewId: -1 }

  expect(HandleTabDragOver.handleTabsDragOver(state)).toBe(state)
})
