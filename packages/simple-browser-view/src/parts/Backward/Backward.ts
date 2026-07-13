import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronBrowserViewFunctions from '../ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.ts'

export const backward = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId } = state
  await ElectronBrowserViewFunctions.backward(browserViewId)
  const { canGoBack, canGoForward, url } = await ElectronBrowserViewFunctions.getStats(browserViewId)
  return {
    ...state,
    canGoBack,
    canGoForward,
    iframeSrc: url,
    isLoading: false,
  }
}
