import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronBrowserViewFunctions from '../ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.js'

export const inspectElement = async (state: SimpleBrowserState, x: number, y: number): Promise<SimpleBrowserState> => {
  const { browserViewId } = state
  await ElectronBrowserViewFunctions.inspectElement(browserViewId, x, y)
  return state
}
