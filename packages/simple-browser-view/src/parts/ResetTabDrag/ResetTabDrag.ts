import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const resetTabDrag = (state: SimpleBrowserState): SimpleBrowserState => {
  const { draggedBrowserViewId, tabDropIndex } = state
  if (draggedBrowserViewId === -1 && tabDropIndex === -1) {
    return state
  }
  return {
    ...state,
    draggedBrowserViewId: -1,
    tabDropIndex: -1,
  }
}
