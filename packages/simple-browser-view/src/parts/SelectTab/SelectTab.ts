import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'
import * as SimpleBrowserTabs from '../SimpleBrowserTabs/SimpleBrowserTabs.ts'

export const selectTab = async (state: SimpleBrowserState, browserViewIdRaw: string): Promise<SimpleBrowserState> => {
  const { browserViewId: activeBrowserViewId, tabs } = state
  const browserViewId = Number.parseInt(browserViewIdRaw)
  if (!Number.isFinite(browserViewId) || browserViewId === activeBrowserViewId) {
    return state
  }
  const tab = tabs.find((candidate) => candidate.browserViewId === browserViewId)
  if (!tab) {
    return state
  }
  await ElectronWebContentsViewFunctions.hide(activeBrowserViewId)
  await ElectronWebContentsViewFunctions.show(browserViewId)
  await ElectronWebContentsViewFunctions.focus(browserViewId)
  return SimpleBrowserTabs.activate(state, tab)
}
