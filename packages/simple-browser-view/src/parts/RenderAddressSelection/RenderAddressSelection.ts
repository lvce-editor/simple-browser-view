import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const renderAddressSelection = (oldState: SimpleBrowserState, newState: SimpleBrowserState): readonly any[] => {
  const { addressSelection, uid } = newState
  if (!addressSelection) return []
  return ['Viewlet.setSelectionByName', uid, 'simple-browser-address', addressSelection.start, addressSelection.end]
}
