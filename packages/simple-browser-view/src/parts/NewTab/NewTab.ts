import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../SimpleBrowserTab/SimpleBrowserTab.ts'
import * as ElectronWebContentsView from '../ElectronWebContentsView/ElectronWebContentsView.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'
import * as SimpleBrowserPreferences from '../SimpleBrowserPreferences/SimpleBrowserPreferences.ts'
import * as SimpleBrowserTabs from '../SimpleBrowserTabs/SimpleBrowserTabs.ts'

export const newTab = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId: oldBrowserViewId, headerHeight, height, tabs, width, x, y } = state
  const browserViewId = await ElectronWebContentsView.createWebContentsView(0, [])
  await ElectronWebContentsViewFunctions.resizeWebContentsView(browserViewId, x, y + headerHeight, width, height - headerHeight)
  const iframeSrc = SimpleBrowserPreferences.getDefaultUrl()
  await ElectronWebContentsViewFunctions.setIframeSrc(browserViewId, iframeSrc)
  const { canGoBack, canGoForward, title } = await ElectronWebContentsViewFunctions.getStats(browserViewId)
  const tab: SimpleBrowserTab = {
    browserViewId,
    canGoBack,
    canGoForward,
    iframeSrc,
    inputValue: iframeSrc,
    isLoading: false,
    title,
  }
  if (oldBrowserViewId) {
    await ElectronWebContentsViewFunctions.hide(oldBrowserViewId)
  }
  await ElectronWebContentsViewFunctions.show(browserViewId)
  await ElectronWebContentsViewFunctions.focus(browserViewId)
  return SimpleBrowserTabs.activate(
    {
      ...state,
      tabs: [...tabs, tab],
    },
    tab,
  )
}
