import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'

export const showOverlay = async (state: SimpleBrowserState, overlayId: string): Promise<SimpleBrowserState> => {
  const { browserViewId, overlayIds } = state
  if (overlayIds.includes(overlayId)) {
    return state
  }
  if (overlayIds.length === 0) {
    await ElectronWebContentsViewFunctions.hide(browserViewId)
  }
  return {
    ...state,
    overlayIds: [...overlayIds, overlayId],
  }
}
