import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsView from '../ElectronWebContentsView/ElectronWebContentsView.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'
import * as NewTab from '../NewTab/NewTab.ts'
import * as SimpleBrowserTabs from '../SimpleBrowserTabs/SimpleBrowserTabs.ts'

export const closeTab = async (state: SimpleBrowserState, browserViewIdRaw: string): Promise<SimpleBrowserState> => {
  const { browserViewId: activeBrowserViewId, tabs: currentTabs } = state
  const browserViewId = Number.parseInt(browserViewIdRaw)
  const tabIndex = currentTabs.findIndex((tab) => tab.browserViewId === browserViewId)
  if (tabIndex === -1) {
    return state
  }
  if (currentTabs.length === 1) {
    const stateWithReplacement = await NewTab.newTab(state)
    await ElectronWebContentsView.disposeWebContentsView(browserViewId)
    return {
      ...stateWithReplacement,
      tabs: stateWithReplacement.tabs.filter((tab) => tab.browserViewId !== browserViewId),
    }
  }
  const tabs = currentTabs.filter((tab) => tab.browserViewId !== browserViewId)
  await ElectronWebContentsView.disposeWebContentsView(browserViewId)
  if (browserViewId !== activeBrowserViewId) {
    return {
      ...state,
      tabs,
    }
  }
  const nextTab = tabs[Math.min(tabIndex, tabs.length - 1)]
  await ElectronWebContentsViewFunctions.show(nextTab.browserViewId)
  await ElectronWebContentsViewFunctions.focus(nextTab.browserViewId)
  return SimpleBrowserTabs.activate(
    {
      ...state,
      tabs,
    },
    nextTab,
  )
}
