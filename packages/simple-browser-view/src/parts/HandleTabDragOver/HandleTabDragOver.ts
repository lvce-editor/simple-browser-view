import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

const hasDraggedTab = (state: SimpleBrowserState): boolean => {
  const { draggedBrowserViewId, tabs } = state
  return tabs.some((tab) => tab.browserViewId === draggedBrowserViewId)
}

const withTabDropIndex = (state: SimpleBrowserState, tabDropIndex: number): SimpleBrowserState => {
  const { tabDropIndex: oldTabDropIndex } = state
  if (oldTabDropIndex === tabDropIndex) {
    return state
  }
  return {
    ...state,
    tabDropIndex,
  }
}

export const handleTabDragOver = (
  state: SimpleBrowserState,
  tabIndexRaw: string,
  tabOffsetLeft: number,
  tabWidth: number,
  tabsScrollLeft: number,
  clientX: number,
): SimpleBrowserState => {
  const { tabs, x } = state
  if (!hasDraggedTab(state)) {
    return state
  }
  const tabIndex = Number.parseInt(tabIndexRaw)
  if (!Number.isFinite(tabIndex) || tabIndex < 0 || tabIndex >= tabs.length) {
    return state
  }
  const tabMidpoint = x + tabOffsetLeft - tabsScrollLeft + tabWidth / 2
  const tabDropIndex = clientX < tabMidpoint ? tabIndex : tabIndex + 1
  return withTabDropIndex(state, tabDropIndex)
}

export const handleTabsDragOver = (state: SimpleBrowserState): SimpleBrowserState => {
  const { tabs } = state
  if (!hasDraggedTab(state)) {
    return state
  }
  return withTabDropIndex(state, tabs.length)
}
