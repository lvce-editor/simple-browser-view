import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as DiffType from '../DiffType/DiffType.ts'

export const diffType = DiffType.RenderItems

export const isEqual = (oldState: SimpleBrowserState, newState: SimpleBrowserState): boolean => {
  return (
    oldState.canGoBack === newState.canGoBack &&
    oldState.canGoForward === newState.canGoForward &&
    oldState.iframeSrc === newState.iframeSrc &&
    oldState.isLoading === newState.isLoading &&
    oldState.title === newState.title
  )
}
