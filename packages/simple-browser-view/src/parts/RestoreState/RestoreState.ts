import type { RestoredState } from '../RestoredState/RestoredState.ts'

export const restoreState = (savedState: unknown): RestoredState => {
  return {
    history: [],
  }
}
