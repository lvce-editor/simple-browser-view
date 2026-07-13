import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as HtmlInputType from '../HtmlInputType/HtmlInputType.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const getSimpleBrowserVirtualDom = (
  canGoBack: boolean,
  canGoForward: boolean,
  isLoading: boolean,
  value: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'Viewlet SimpleBrowser',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 5,
      className: ClassNames.SimpleBrowserHeader,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: ClassNames.IconButton,
      onClick: DomEventListenerFunctions.HandleClickBackward,
      title: 'Back',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconArrowLeft',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: ClassNames.IconButton,
      onClick: DomEventListenerFunctions.HandleClickForward,
      title: 'Forward',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconArrowRight',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: ClassNames.IconButton,
      onClick: DomEventListenerFunctions.HandleClickReload,
      title: 'Reload',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: isLoading ? 'MaskIcon MaskIconClose' : 'MaskIcon MaskIconRefresh',
      type: VirtualDomElements.Div,
    },
    {
      className: ClassNames.InputBox,
      enterKeyHint: 'Go',
      inputType: HtmlInputType.Url,
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      type: VirtualDomElements.Input,
      value,
    },
    {
      childCount: 1,
      className: ClassNames.IconButton,
      title: 'Open External',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconLinkExternal',
      onClick: DomEventListenerFunctions.HandleClickOpenExternal,
      type: VirtualDomElements.Div,
    },
  ]
}
