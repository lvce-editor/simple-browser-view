import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SearchViewStates from '../SimpleBrowserStates/SimpleBrowserStates.ts'

export const create = (uid: number, x: number, y: number, width: number, height: number, value: string = ''): SimpleBrowserState => {
  const state: SimpleBrowserState = {
    uid,
    value,
    x,
    y,
    width,
    focus: 0,
    focused: false,
    height,
  }
  SearchViewStates.set(uid, state, state)
  return state
}
