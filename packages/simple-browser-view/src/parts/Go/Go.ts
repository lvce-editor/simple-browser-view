import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'
import * as IframeSrc from '../IframeSrc/IframeSrc.ts'

export const go = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { inputValue, browserViewId, suggestionsEnabled, hasSuggestionsOverlay, shortcuts } = state
  const iframeSrc = IframeSrc.toIframeSrc(inputValue, shortcuts)
  // TODO await promises
  void ElectronWebContentsViewFunctions.setIframeSrc(browserViewId, iframeSrc)
  void ElectronWebContentsViewFunctions.focus(browserViewId)
  if (suggestionsEnabled && hasSuggestionsOverlay) {
    // void ElectronBrowserViewSuggestions.disposeBrowserView()
  }
  return {
    ...state,
    iframeSrc,
    isLoading: true,
  }
}
