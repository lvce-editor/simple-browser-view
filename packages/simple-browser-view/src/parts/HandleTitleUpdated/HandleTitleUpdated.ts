import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const handleTitleUpdated = (state: SimpleBrowserState, title: string): SimpleBrowserState => {
  return {
    ...state,
    title,
  }
}
