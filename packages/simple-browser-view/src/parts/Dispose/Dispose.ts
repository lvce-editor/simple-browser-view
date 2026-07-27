import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsView from '../ElectronWebContentsView/ElectronWebContentsView.ts'

export const dispose = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId, tabs } = state
  const browserViewIds = tabs.length > 0 ? tabs.map((tab) => tab.browserViewId) : [browserViewId]
  for (const browserViewId of browserViewIds) {
    if (browserViewId) {
      await ElectronWebContentsView.disposeWebContentsView(browserViewId)
    }
  }
  return state
}
