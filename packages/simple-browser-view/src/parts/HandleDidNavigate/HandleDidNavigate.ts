import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const handleDidNavigate = (state: SimpleBrowserState, url: string): SimpleBrowserState => {
  return {
    ...state,
    iframeSrc: url,
    isLoading: false,
  }
}
