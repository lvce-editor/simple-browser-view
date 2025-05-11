import type { DomEventListener } from '../DomEventListener/DomEventListener.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as InputSource from '../InputSource/InputSource.ts'

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: DomEventListenerFunctions.HandleInput2,
      params: ['handleInput2', 'event.target.name', 'event.target.value', InputSource.User],
    },
    {
      name: DomEventListenerFunctions.HandleExcludeInput,
      params: ['handleExcludeInput', 'event.target.value'],
    },
    {
      name: DomEventListenerFunctions.HandleIncludeInput,
      params: ['handleIncludeInput', 'event.target.value'],
    },
    {
      name: DomEventListenerFunctions.HandleReplaceInput,
      params: ['handleReplaceInput', 'event.target.value'],
    },
    {
      name: DomEventListenerFunctions.HandleInput,
      params: ['handleInput', 'event.target.value', InputSource.User],
    },
    {
      name: DomEventListenerFunctions.HandleClick,
      params: ['handleClickAt', 'event.clientX', 'event.clientY'],
    },
    {
      name: DomEventListenerFunctions.HandleToggleButtonClick,
      params: ['handleToggleButtonClick'],
    },
    {
      name: DomEventListenerFunctions.HandleListFocus,
      params: ['handleListFocus'],
    },
    {
      name: DomEventListenerFunctions.HandleListBlur,
      params: ['handleListBlur'],
    },
    {
      name: DomEventListenerFunctions.HandleContextMenu,
      params: ['handleContextMenu', 'event.button', 'event.clientX', 'event.clientY'],
      preventDefault: true,
    },
    {
      name: DomEventListenerFunctions.HandleHeaderContextMenu,
      params: ['handleHeaderContextMenu'],
      preventDefault: true,
    },
    {
      name: DomEventListenerFunctions.HandleWheel,
      params: ['handleWheel', 'event.deltaMode', 'event.deltaY'],
      passive: true,
    },
    {
      name: DomEventListenerFunctions.HandleHeaderClick2,
      params: ['handleHeaderClick', 'event.target.name'],
    },
    {
      name: DomEventListenerFunctions.HandleHeaderFocusIn,
      params: ['handleHeaderFocusIn'],
    },
    {
      name: DomEventListenerFunctions.HandleHeaderFocusOut,
      params: ['handleHeaderFocusOut'],
    },
    {
      name: DomEventListenerFunctions.HandleScrollBarPointerDown,
      params: ['handleScrollBarClick', 'event.deltaY'],
    },
  ]
}
