import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const loadContent = async (state: SimpleBrowserState, savedState: unknown): Promise<SimpleBrowserState> => {
  return {
    ...state,
  }
}
