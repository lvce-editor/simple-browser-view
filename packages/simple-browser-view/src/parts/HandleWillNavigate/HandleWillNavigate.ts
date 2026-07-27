import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SimpleBrowserTabs from '../SimpleBrowserTabs/SimpleBrowserTabs.ts'

export const handleWillNavigate = (
  state: SimpleBrowserState,
  browserViewIdOrUrl: number | string,
  updatedUrl?: string,
): SimpleBrowserState => {
  const { browserViewId: activeBrowserViewId, tabs } = state
  const browserViewId = updatedUrl === undefined ? activeBrowserViewId : Number(browserViewIdOrUrl)
  const url = updatedUrl === undefined ? String(browserViewIdOrUrl) : updatedUrl
  const update = {
    iframeSrc: url,
    isLoading: true,
  }
  if (tabs.length === 0) {
    return {
      ...state,
      ...update,
    }
  }
  return SimpleBrowserTabs.update(state, browserViewId, update)
}
