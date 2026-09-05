import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const handleDragLeave = (state: SimpleBrowserState): SimpleBrowserState => {
  const { tabDropIndex } = state
  if (tabDropIndex === -1) {
    return state
  }
  return {
    ...state,
    tabDropIndex: -1,
  }
}
