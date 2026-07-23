import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const handleWillNavigate = (state: SimpleBrowserState, url: string): SimpleBrowserState => {
  return {
    ...state,
    iframeSrc: url,
    isLoading: true,
  }
}
