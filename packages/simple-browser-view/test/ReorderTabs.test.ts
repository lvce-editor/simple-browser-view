import { expect, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../src/parts/SimpleBrowserTab/SimpleBrowserTab.ts'
import * as Create from '../src/parts/Create/Create.ts'
import * as ReorderTabs from '../src/parts/ReorderTabs/ReorderTabs.ts'

const createTab = (browserViewId: number): SimpleBrowserTab => ({
  browserViewId,
  canGoBack: false,
  canGoForward: false,
  iframeSrc: `https://example.com/${browserViewId}`,
  inputValue: `https://example.com/${browserViewId}`,
  isLoading: false,
  title: `Tab ${browserViewId}`,
})

const createState = (...ids: readonly number[]): SimpleBrowserState => ({
  ...Create.create(1, 0, 0, 800, 600),
  browserViewId: ids[1] ?? ids[0] ?? 0,
  tabs: ids.map(createTab),
})

const ids = (state: SimpleBrowserState): readonly number[] => state.tabs.map((tab) => tab.browserViewId)

test.each<[string, readonly number[], number, number, readonly number[]]>([
  ['second tab before first', [1, 2, 3], 2, 0, [2, 1, 3]],
  ['first tab after final tab', [1, 2, 3], 1, 3, [2, 3, 1]],
  ['final tab before second tab', [1, 2, 3], 3, 1, [1, 3, 2]],
  ['first tab after second tab', [1, 2, 3], 1, 2, [2, 1, 3]],
  ['second tab after final tab', [1, 2, 3], 2, 3, [1, 3, 2]],
  ['negative boundary clamped to start', [1, 2, 3], 3, -100, [3, 1, 2]],
  ['large boundary clamped to end', [1, 2, 3], 1, 100, [2, 3, 1]],
])('reorders the %s', (_name, initialIds, browserViewId, insertionBoundary, expectedIds) => {
  const state = createState(...initialIds)

  const result = ReorderTabs.reorderTabs(state, browserViewId, insertionBoundary)

  expect(ids(result)).toEqual(expectedIds)
  expect(result.browserViewId).toBe(state.browserViewId)
})

test.each<[string, number, number]>([
  ['before itself', 2, 1],
  ['after itself', 2, 2],
])('returns the same state when dropping %s', (_name, browserViewId, insertionBoundary) => {
  const state = createState(1, 2, 3)

  expect(ReorderTabs.reorderTabs(state, browserViewId, insertionBoundary)).toBe(state)
})

test('returns the same state for an unknown tab', () => {
  const state = createState(1, 2, 3)

  expect(ReorderTabs.reorderTabs(state, 99, 0)).toBe(state)
})

test('returns the same state for a non-finite insertion boundary', () => {
  const state = createState(1, 2, 3)

  expect(ReorderTabs.reorderTabs(state, 2, NaN)).toBe(state)
})

test('preserves tab objects and does not mutate the original order', () => {
  const state = createState(1, 2, 3)

  const result = ReorderTabs.reorderTabs(state, 3, 0)

  expect(result.tabs).toEqual([state.tabs[2], state.tabs[0], state.tabs[1]])
  expect(ids(state)).toEqual([1, 2, 3])
})

test('returns the same empty state', () => {
  const state = createState()

  expect(ReorderTabs.reorderTabs(state, 1, 0)).toBe(state)
})
