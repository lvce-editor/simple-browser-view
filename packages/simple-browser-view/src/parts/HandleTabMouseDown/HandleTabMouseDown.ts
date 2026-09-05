import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SelectTab from '../SelectTab/SelectTab.ts'

export const handleTabMouseDown = async (state: SimpleBrowserState, browserViewIdRaw: string, button: number = 0): Promise<SimpleBrowserState> => {
  const { tabs } = state
  if (button !== 0) {
    return state
  }
  const browserViewId = Number.parseInt(browserViewIdRaw)
  if (!Number.isFinite(browserViewId) || tabs.every((tab) => tab.browserViewId !== browserViewId)) {
    return state
  }
  const selectedState = await SelectTab.selectTab(state, browserViewIdRaw)
  return {
    ...selectedState,
    draggedBrowserViewId: browserViewId,
  }
}
