import type { DomEventListener } from '../DomEventListener/DomEventListener.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderAddressEventListeners = (): readonly DomEventListener[] => [
  { name: DomEventListenerFunctions.HandleFocus, params: ['handleAddressFocus', 'event.target.value'] },
  { name: DomEventListenerFunctions.HandleBlur, params: ['handleAddressBlur'] },
]
