import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SearchViewStates from '../SimpleBrowserStates/SimpleBrowserStates.ts'

export const create = (uid: number, x: number, y: number, width: number, height: number, value: string = ''): SimpleBrowserState => {
  const state: SimpleBrowserState = {
    uid,
    inputValue: value,
    x,
    y,
    width,
    focus: 0,
    focused: false,
    height,
    browserViewId: 0,
    canGoBack: false,
    canGoForward: false,
    iframeSrc: '',
    isLoading: false,
    hasSuggestionsOverlay: false,
    shortcuts: [],
    suggestionsEnabled: false,
  }
  SearchViewStates.set(uid, state, state)
  return state
}
