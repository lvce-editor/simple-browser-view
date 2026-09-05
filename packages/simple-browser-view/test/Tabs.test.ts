import { beforeEach, expect, jest, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../src/parts/SimpleBrowserTab/SimpleBrowserTab.ts'

beforeEach(() => {
  jest.clearAllMocks()
})

jest.unstable_mockModule('../src/parts/ElectronWebContentsView/ElectronWebContentsView.ts', () => ({
  createWebContentsView: jest.fn(async () => 30),
  disposeWebContentsView: jest.fn(async () => {}),
}))

jest.unstable_mockModule('../src/parts/ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts', () => ({
  focus: jest.fn(async () => {}),
  getStats: jest.fn(async () => ({
    canGoBack: false,
    canGoForward: false,
    title: 'New Page',
  })),
  hide: jest.fn(async () => {}),
  resizeWebContentsView: jest.fn(async () => {}),
  setIframeSrc: jest.fn(async () => {}),
  show: jest.fn(async () => {}),
}))

const CloseTab = await import('../src/parts/CloseTab/CloseTab.ts')
const Create = await import('../src/parts/Create/Create.ts')
const ElectronWebContentsView = await import('../src/parts/ElectronWebContentsView/ElectronWebContentsView.ts')
const ElectronWebContentsViewFunctions = await import('../src/parts/ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts')
const HandleTabMouseDown = await import('../src/parts/HandleTabMouseDown/HandleTabMouseDown.ts')
const NewTab = await import('../src/parts/NewTab/NewTab.ts')
const SelectTab = await import('../src/parts/SelectTab/SelectTab.ts')

const createTab = (browserViewId: number, title: string): SimpleBrowserTab => ({
  browserViewId,
  canGoBack: false,
  canGoForward: false,
  iframeSrc: `https://example.com/${browserViewId}`,
  inputValue: `https://example.com/${browserViewId}`,
  isLoading: false,
  title,
})

const createState = (): SimpleBrowserState => {
  const firstTab = createTab(10, 'Music')
  const secondTab = createTab(20, 'GitHub')
  return {
    ...Create.create(1, 5, 10, 800, 600),
    ...firstTab,
    tabs: [firstTab, secondTab],
  }
}

test('opens a new active tab while keeping the previous WebContentsView alive', async () => {
  const state = createState()

  const newState = await NewTab.newTab(state)

  expect(newState.tabs).toEqual([state.tabs[0], state.tabs[1], expect.objectContaining({ browserViewId: 30, title: 'New Page' })])
  expect(newState.browserViewId).toBe(30)
  expect(ElectronWebContentsView.disposeWebContentsView).not.toHaveBeenCalled()
  expect(ElectronWebContentsViewFunctions.hide).toHaveBeenCalledWith(10)
  expect(ElectronWebContentsViewFunctions.show).toHaveBeenCalledWith(30)
})

test('switches tabs by hiding the active view and showing the selected view', async () => {
  const state = createState()

  const newState = await SelectTab.selectTab(state, '20')

  expect(newState.browserViewId).toBe(20)
  expect(newState.title).toBe('GitHub')
  expect(ElectronWebContentsViewFunctions.hide).toHaveBeenCalledWith(10)
  expect(ElectronWebContentsViewFunctions.show).toHaveBeenCalledWith(20)
  expect(ElectronWebContentsViewFunctions.focus).toHaveBeenCalledWith(20)
})

test('primary mouse down selects and stages an inactive tab for dragging', async () => {
  const state = createState()

  const newState = await HandleTabMouseDown.handleTabMouseDown(state, '20', 0)

  expect(newState.browserViewId).toBe(20)
  expect(newState.draggedBrowserViewId).toBe(20)
  expect(ElectronWebContentsViewFunctions.hide).toHaveBeenCalledWith(10)
  expect(ElectronWebContentsViewFunctions.show).toHaveBeenCalledWith(20)
})

test('primary mouse down stages the already-active tab without changing its view', async () => {
  const state = createState()

  const newState = await HandleTabMouseDown.handleTabMouseDown(state, '10', 0)

  expect(newState.browserViewId).toBe(10)
  expect(newState.draggedBrowserViewId).toBe(10)
  expect(ElectronWebContentsViewFunctions.hide).not.toHaveBeenCalled()
  expect(ElectronWebContentsViewFunctions.show).not.toHaveBeenCalled()
})

test('non-primary mouse down does not select or stage a tab', async () => {
  const state = createState()

  expect(await HandleTabMouseDown.handleTabMouseDown(state, '20', 1)).toBe(state)
  expect(ElectronWebContentsViewFunctions.hide).not.toHaveBeenCalled()
})

test.each(['missing', '99'])('invalid mouse down tab %s is ignored', async (browserViewId) => {
  const state = createState()

  expect(await HandleTabMouseDown.handleTabMouseDown(state, browserViewId, 0)).toBe(state)
})

test('closes the active tab and selects its neighbor', async () => {
  const state = createState()

  const newState = await CloseTab.closeTab(state, '10')

  expect(newState.tabs).toEqual([state.tabs[1]])
  expect(newState.browserViewId).toBe(20)
  expect(ElectronWebContentsView.disposeWebContentsView).toHaveBeenCalledWith(10)
  expect(ElectronWebContentsViewFunctions.show).toHaveBeenCalledWith(20)
})

test('closing the final tab replaces it with a fresh tab', async () => {
  const state = createState()
  const singleTabState = {
    ...state,
    tabs: [state.tabs[0]],
  }

  const newState = await CloseTab.closeTab(singleTabState, '10')

  expect(newState.tabs).toEqual([expect.objectContaining({ browserViewId: 30 })])
  expect(newState.browserViewId).toBe(30)
  expect(ElectronWebContentsView.disposeWebContentsView).toHaveBeenCalledWith(10)
})
