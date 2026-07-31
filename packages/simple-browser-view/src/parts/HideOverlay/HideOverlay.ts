import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'

export const hideOverlay = async (state: SimpleBrowserState, overlayId: string): Promise<SimpleBrowserState> => {
  const { browserViewId, overlayIds: oldOverlayIds } = state
  if (!oldOverlayIds.includes(overlayId)) {
    return state
  }
  const overlayIds = oldOverlayIds.filter((id) => id !== overlayId)
  if (overlayIds.length === 0) {
    await ElectronWebContentsViewFunctions.show(browserViewId)
  }
  return {
    ...state,
    overlayIds,
  }
}
