import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronBrowserViewFunctions from '../ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.ts'
import * as SimpleBrowserTabs from '../SimpleBrowserTabs/SimpleBrowserTabs.ts'

export const backward = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId } = state
  await ElectronBrowserViewFunctions.backward(browserViewId)
  const { canGoBack, canGoForward, url } = await ElectronBrowserViewFunctions.getStats(browserViewId)
  return SimpleBrowserTabs.update(state, browserViewId, {
    canGoBack,
    canGoForward,
    iframeSrc: url,
    isLoading: false,
  })
}
