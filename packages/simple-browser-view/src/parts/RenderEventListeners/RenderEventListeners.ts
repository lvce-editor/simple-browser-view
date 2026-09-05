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
      params: ['handleClickTab', 'event.currentTarget.dataset.id', 'event.button'],
    },
    {
      name: DomEventListenerFunctions.HandleTabDragOver,
      params: [
        'handleTabDragOver',
        'event.currentTarget.dataset.index',
        'event.currentTarget.offsetLeft',
        'event.currentTarget.offsetWidth',
        'event.currentTarget.parentElement.scrollLeft',
        'event.clientX',
      ],
      preventDefault: true,
      stopPropagation: true,
    },
    {
      name: DomEventListenerFunctions.HandleTabsDragOver,
      params: ['handleTabsDragOver'],
      preventDefault: true,
      stopPropagation: true,
    },
    {
      dragEffect: 'copyMove',
      name: DomEventListenerFunctions.HandleDragStart,
      params: ['handleDragStart'],
    },
    {
      name: DomEventListenerFunctions.HandleDragEnd,
      params: ['handleDragEnd'],
    },
    {
      name: DomEventListenerFunctions.HandleTabMouseUp,
      params: ['handleTabMouseUp'],
    },
    {
      name: DomEventListenerFunctions.HandleDragLeave,
      params: ['handleDragLeave'],
    },
    {
      name: DomEventListenerFunctions.HandleDrop,
      params: ['handleDrop'],
      preventDefault: true,
    },
  ]
}
