import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../SimpleBrowserTab/SimpleBrowserTab.ts'

export const activate = (state: SimpleBrowserState, tab: SimpleBrowserTab): SimpleBrowserState => {
  return {
    ...state,
    browserViewId: tab.browserViewId,
    canGoBack: tab.canGoBack,
    canGoForward: tab.canGoForward,
    iframeSrc: tab.iframeSrc,
    inputValue: tab.inputValue,
    isLoading: tab.isLoading,
    title: tab.title,
  }
}

export const update = (state: SimpleBrowserState, browserViewId: number, update: Partial<SimpleBrowserTab>): SimpleBrowserState => {
  const { browserViewId: activeBrowserViewId, tabs: currentTabs } = state
  const index = currentTabs.findIndex((tab) => tab.browserViewId === browserViewId)
  if (index === -1) {
    return state
  }
  const updatedTab = {
    ...currentTabs[index],
    ...update,
  }
  const tabs = currentTabs.map((tab, tabIndex) => (tabIndex === index ? updatedTab : tab))
  const updatedState = {
    ...state,
    tabs,
  }
  if (activeBrowserViewId !== browserViewId) {
    return updatedState
  }
  return activate(updatedState, updatedTab)
}
