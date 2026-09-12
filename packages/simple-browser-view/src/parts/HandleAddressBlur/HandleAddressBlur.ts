import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import { getAddressSelection } from '../GetAddressSelection/GetAddressSelection.ts'

export const handleAddressBlur = (state: SimpleBrowserState): SimpleBrowserState => {
  const { inputValue } = state
  return { ...state, addressSelection: getAddressSelection(false, inputValue), focused: false }
}
