import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as DiffType from '../DiffType/DiffType.ts'

export const diffType = DiffType.RenderItems

export const isEqual = (oldState: SimpleBrowserState, newState: SimpleBrowserState): boolean => {
  return oldState.focus === newState.focus
}
