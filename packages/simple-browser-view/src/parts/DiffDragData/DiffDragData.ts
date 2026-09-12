import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const isEqual = (oldState: SimpleBrowserState, newState: SimpleBrowserState): boolean => {
  return oldState.draggedBrowserViewId === newState.draggedBrowserViewId
}
