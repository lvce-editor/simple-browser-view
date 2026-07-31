import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { SimpleBrowserTab } from '../SimpleBrowserTab/SimpleBrowserTab.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as GetSimpleBrowserTabsVirtualDom from '../GetSimpleBrowserTabsVirtualDom/GetSimpleBrowserTabsVirtualDom.ts'
import * as HtmlInputType from '../HtmlInputType/HtmlInputType.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

const simpleBrowserNode: VirtualDomNode = {
  childCount: 2,
  className: MergeClassNames.mergeClassNames(ClassNames.Viewlet, ClassNames.SimpleBrowser),
  type: VirtualDomElements.Div,
}

const simpleBrowserHeaderNode: VirtualDomNode = {
  childCount: 4,
  className: ClassNames.SimpleBrowserHeader,
  type: VirtualDomElements.Div,
}

const simpleBrowserButtonsLeftNode: VirtualDomNode = {
  childCount: 3,
  className: ClassNames.SimlpeBrowserButtonsLeft,
  type: VirtualDomElements.Div,
}

const backButtonNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleClickBackward,
  title: 'Back',
  type: VirtualDomElements.Button,
}

const backIconNode: VirtualDomNode = {
  childCount: 0,
  className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconArrowLeft),
  type: VirtualDomElements.Div,
}

const forwardButtonNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleClickForward,
  title: 'Forward',
  type: VirtualDomElements.Button,
}

const forwardIconNode: VirtualDomNode = {
  childCount: 0,
  className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconArrowRight),
  type: VirtualDomElements.Div,
}

const reloadButtonNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleClickReload,
  title: 'Reload',
  type: VirtualDomElements.Button,
}

const addressBarContainerNode: VirtualDomNode = {
  childCount: 1,
  type: VirtualDomElements.Div,
}

const openExternalButtonNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleClickOpenExternal,
  title: 'Open External',
  type: VirtualDomElements.Button,
}

const openExternalIconNode: VirtualDomNode = {
  childCount: 0,
  className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconLinkExternal),
  type: VirtualDomElements.Div,
}

const openDevtoolsButtonNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleClickOpenDevtools,
  title: 'Toggle Developer Tools',
  type: VirtualDomElements.Button,
}

const openDevtoolsIconNode: VirtualDomNode = {
  childCount: 0,
  className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconDebugAlt2),
  type: VirtualDomElements.Div,
}

export const getSimpleBrowserVirtualDom = (
  canGoBack: boolean,
  canGoForward: boolean,
  isLoading: boolean,
  value: string,
  tabs: readonly SimpleBrowserTab[],
  activeBrowserViewId: number,
): readonly VirtualDomNode[] => {
  const tabsDom = GetSimpleBrowserTabsVirtualDom.getSimpleBrowserTabsVirtualDom(tabs, activeBrowserViewId)
  return [
    simpleBrowserNode,
    ...tabsDom,
    simpleBrowserHeaderNode,
    simpleBrowserButtonsLeftNode,
    backButtonNode,
    backIconNode,
    forwardButtonNode,
    forwardIconNode,
    reloadButtonNode,
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, isLoading ? ClassNames.MaskIconClose : ClassNames.MaskIconRefresh),
      type: VirtualDomElements.Div,
    },
    addressBarContainerNode,
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
    openExternalButtonNode,
    openExternalIconNode,
    openDevtoolsButtonNode,
    openDevtoolsIconNode,
  ]
}
