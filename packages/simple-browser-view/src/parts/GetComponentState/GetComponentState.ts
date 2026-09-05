import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SimpleBrowserStates from '../SimpleBrowserStates/SimpleBrowserStates.ts'

export const getComponentState = (uid: number): SimpleBrowserState => {
  return SimpleBrowserStates.get(uid).newState
}
