import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronWebContentsView from '../ElectronWebContentsView/ElectronWebContentsView.ts'

export const dispose = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId } = state
  await ElectronWebContentsView.disposeWebContentsView(browserViewId)
  return state
}
