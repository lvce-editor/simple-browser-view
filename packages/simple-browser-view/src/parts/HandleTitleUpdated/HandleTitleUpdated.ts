import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SimpleBrowserTabs from '../SimpleBrowserTabs/SimpleBrowserTabs.ts'

export const handleTitleUpdated = (
  state: SimpleBrowserState,
  browserViewIdOrTitle: number | string,
  updatedTitle?: string,
): SimpleBrowserState => {
  const { browserViewId: activeBrowserViewId, tabs } = state
  const browserViewId = updatedTitle === undefined ? activeBrowserViewId : Number(browserViewIdOrTitle)
  const title = updatedTitle === undefined ? String(browserViewIdOrTitle) : updatedTitle
  if (tabs.length === 0) {
    return {
      ...state,
      title,
    }
  }
  return SimpleBrowserTabs.update(state, browserViewId, { title })
}
