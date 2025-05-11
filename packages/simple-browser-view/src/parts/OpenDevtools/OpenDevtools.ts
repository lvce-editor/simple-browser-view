import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ElectronBrowserViewFunctions from '../ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.ts'

export const openDevtools = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { browserViewId } = state
  await ElectronBrowserViewFunctions.openDevtools(browserViewId)
  return state
}
