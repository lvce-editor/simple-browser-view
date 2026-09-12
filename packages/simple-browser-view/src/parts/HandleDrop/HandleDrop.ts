import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ReorderTabs from '../ReorderTabs/ReorderTabs.ts'
import * as ResetTabDrag from '../ResetTabDrag/ResetTabDrag.ts'

export const handleDrop = (state: SimpleBrowserState): SimpleBrowserState => {
  const { draggedBrowserViewId, tabDropIndex } = state
  if (tabDropIndex === -1) {
    return ResetTabDrag.resetTabDrag(state)
  }
  return ResetTabDrag.resetTabDrag(ReorderTabs.reorderTabs(state, draggedBrowserViewId, tabDropIndex))
}
