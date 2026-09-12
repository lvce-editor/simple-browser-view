export interface AddressSelection {
  readonly end: number
  readonly start: number
}

export const getAddressSelection = (
  focused: boolean,
  value: string,
  hasSuggestions: boolean = false,
  restoredSelection?: AddressSelection,
): AddressSelection => {
  if (!focused) return { end: 0, start: 0 }
  if (restoredSelection) return restoredSelection
  return { end: value.length, start: hasSuggestions ? value.length : 0 }
}
