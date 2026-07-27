import type { DomEventListener } from '../DomEventListener/DomEventListener.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: DomEventListenerFunctions.HandleClickCloseTab,
      params: ['handleClickCloseTab', 'event.target.dataset.id'],
    },
    {
      name: DomEventListenerFunctions.HandleClickNewTab,
      params: ['handleClickNewTab'],
    },
    {
      name: DomEventListenerFunctions.HandleClickTab,
      params: ['handleClickTab', 'event.target.dataset.id'],
    },
  ]
}
