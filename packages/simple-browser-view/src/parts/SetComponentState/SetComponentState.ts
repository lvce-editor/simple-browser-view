import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SimpleBrowserStates from '../SimpleBrowserStates/SimpleBrowserStates.ts'

const applyComponentState = (currentState: SimpleBrowserState, state: SimpleBrowserState): SimpleBrowserState => {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new TypeError('SimpleBrowser state must be an object')
  }
  const { uid } = state
  if (uid !== currentState.uid) {
    throw new Error(`SimpleBrowser state uid must remain ${currentState.uid}`)
  }
  return state
}

export const setComponentState = SimpleBrowserStates.wrapCommand(applyComponentState)
