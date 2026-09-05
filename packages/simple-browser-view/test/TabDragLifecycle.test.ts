import { expect, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../src/parts/SimpleBrowserTab/SimpleBrowserTab.ts'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandleDragLeave from '../src/parts/HandleDragLeave/HandleDragLeave.ts'
import * as HandleDragStart from '../src/parts/HandleDragStart/HandleDragStart.ts'
import * as HandleDrop from '../src/parts/HandleDrop/HandleDrop.ts'
import * as RenderDragData from '../src/parts/RenderDragData/RenderDragData.ts'
import * as ResetTabDrag from '../src/parts/ResetTabDrag/ResetTabDrag.ts'

const createTab = (browserViewId: number, title: string): SimpleBrowserTab => ({
  browserViewId,
  canGoBack: false,
  canGoForward: false,
  iframeSrc: '',
  inputValue: '',
  isLoading: false,
  title,
})

const createState = (): SimpleBrowserState => ({
  ...Create.create(7, 0, 0, 800, 600),
  browserViewId: 2,
  draggedBrowserViewId: 2,
  tabDropIndex: 0,
  tabs: [createTab(1, 'One'), createTab(2, 'Two'), createTab(3, 'Three')],
})

test('drop reorders tabs and clears drag state', () => {
  const result = HandleDrop.handleDrop(createState())

  expect(result.tabs.map((tab) => tab.browserViewId)).toEqual([2, 1, 3])
  expect(result.browserViewId).toBe(2)
  expect(result.draggedBrowserViewId).toBe(-1)
  expect(result.tabDropIndex).toBe(-1)
})

test('drop after itself preserves order and clears drag state', () => {
  const state = { ...createState(), tabDropIndex: 2 }

  const result = HandleDrop.handleDrop(state)

  expect(result.tabs).toBe(state.tabs)
  expect(result.draggedBrowserViewId).toBe(-1)
  expect(result.tabDropIndex).toBe(-1)
})

test('drop without a target preserves order and clears the dragged tab', () => {
  const state = { ...createState(), tabDropIndex: -1 }

  const result = HandleDrop.handleDrop(state)

  expect(result.tabs).toBe(state.tabs)
  expect(result.draggedBrowserViewId).toBe(-1)
})

test('drag leave clears only the insertion indicator', () => {
  const result = HandleDragLeave.handleDragLeave(createState())

  expect(result.tabDropIndex).toBe(-1)
  expect(result.draggedBrowserViewId).toBe(2)
})

test('drag leave is a no-op without an insertion indicator', () => {
  const state = { ...createState(), tabDropIndex: -1 }

  expect(HandleDragLeave.handleDragLeave(state)).toBe(state)
})

test('drag end clears the source and insertion indicator', () => {
  const result = ResetTabDrag.resetTabDrag(createState())

  expect(result.draggedBrowserViewId).toBe(-1)
  expect(result.tabDropIndex).toBe(-1)
})

test('reset is a no-op when no drag is active', () => {
  const state = { ...createState(), draggedBrowserViewId: -1, tabDropIndex: -1 }

  expect(ResetTabDrag.resetTabDrag(state)).toBe(state)
})

test('drag start preserves the staged drag state', () => {
  const state = createState()

  expect(HandleDragStart.handleDragStart(state)).toBe(state)
})

test('renders drag data for the staged tab', () => {
  const state = createState()

  expect(RenderDragData.renderDragData(state, state)).toEqual([
    'Viewlet.setDragData',
    7,
    {
      items: [{ data: '2', type: 'application/x-lvce-simple-browser-tab' }],
      label: 'Two',
    },
  ])
})

test('renders fallback drag label for an untitled tab', () => {
  const state = { ...createState(), tabs: [createTab(2, '')] }

  expect(RenderDragData.renderDragData(state, state)[2].label).toBe('Simple Browser')
})

test('does not render drag data without a matching tab', () => {
  const state = { ...createState(), draggedBrowserViewId: 99 }

  expect(RenderDragData.renderDragData(state, state)).toEqual([])
})
