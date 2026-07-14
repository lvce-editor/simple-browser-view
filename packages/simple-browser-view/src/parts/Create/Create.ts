import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as SearchViewStates from '../SimpleBrowserStates/SimpleBrowserStates.ts'

export const create = (uid: number, x: number, y: number, width: number, height: number, value: string = ''): SimpleBrowserState => {
  const state: SimpleBrowserState = {
    browserViewId: 0,
    canGoBack: false,
    canGoForward: false,
    focus: 0,
    focused: false,
    hasSuggestionsOverlay: false,
    headerHeight: 70,
    height,
    iframeSrc: '',
    inputValue: value,
    isLoading: false,
    shortcuts: [],
    suggestionsEnabled: false,
    title: '',
    uid,
    uri: '',
    width,
    x,
    y,
  }
  SearchViewStates.set(uid, state, state)
  return state
}
