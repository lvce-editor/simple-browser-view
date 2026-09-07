import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import { getAddressSelection } from '../GetAddressSelection/GetAddressSelection.ts'

export const handleAddressFocus = (state: SimpleBrowserState, value: string): SimpleBrowserState => {
  const { hasSuggestionsOverlay } = state
  return { ...state, addressSelection: getAddressSelection(true, value, hasSuggestionsOverlay), focused: true }
}
