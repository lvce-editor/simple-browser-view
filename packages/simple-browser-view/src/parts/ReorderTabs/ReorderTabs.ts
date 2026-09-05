import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const reorderTabs = (state: SimpleBrowserState, browserViewId: number, insertionBoundary: number): SimpleBrowserState => {
  const { tabs: currentTabs } = state
  const sourceIndex = currentTabs.findIndex((tab) => tab.browserViewId === browserViewId)
  if (sourceIndex === -1 || !Number.isFinite(insertionBoundary)) {
    return state
  }
  const clampedBoundary = Math.min(Math.max(insertionBoundary, 0), currentTabs.length)
  const insertionIndex = clampedBoundary > sourceIndex ? clampedBoundary - 1 : clampedBoundary
  if (insertionIndex === sourceIndex) {
    return state
  }
  const tab = currentTabs[sourceIndex]
  const tabs = currentTabs.filter((candidate) => candidate.browserViewId !== browserViewId)
  tabs.splice(insertionIndex, 0, tab)
  return {
    ...state,
    tabs,
  }
}
