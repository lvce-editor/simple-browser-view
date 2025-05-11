import type { SavedState } from '../SavedState/SavedState.ts'

export const saveState = (uid: number): SavedState => {
  return {
    history: [],
  }
}
