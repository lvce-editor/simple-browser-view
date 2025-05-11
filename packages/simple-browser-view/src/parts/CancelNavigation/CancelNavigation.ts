import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronBrowserViewFunctions from '../ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.ts'

export const cancelNavigation = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId } = state
  await ElectronBrowserViewFunctions.cancelNavigation(browserViewId)
  const { url, canGoBack, canGoForward } = await ElectronBrowserViewFunctions.getStats(browserViewId)
  return {
    ...state,
    isLoading: false,
    iframeSrc: url,
    canGoBack,
    canGoForward,
  }
}
