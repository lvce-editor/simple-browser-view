import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { SimpleBrowserTab } from '../SimpleBrowserTab/SimpleBrowserTab.ts'
import * as AriaRoles from '../AriaRoles/AriaRoles.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'
import * as VirtualDomHelpers from '../VirtualDomHelpers/VirtualDomHelpers.ts'

const defaultTitle = 'Simple Browser'

const tabTitleNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.TabTitle,
  type: VirtualDomElements.Span,
}

const closeIconNode: VirtualDomNode = {
  childCount: 0,
  className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconClose),
  type: VirtualDomElements.Div,
}

const addIconNode: VirtualDomNode = {
  childCount: 0,
  className: MergeClassNames.mergeClassNames(ClassNames.MaskIcon, ClassNames.MaskIconAdd),
  type: VirtualDomElements.Div,
}

const newTabButtonNode: VirtualDomNode = {
  'aria-label': 'New Tab',
  childCount: 1,
  className: ClassNames.IconButton,
  onClick: DomEventListenerFunctions.HandleClickNewTab,
  title: 'New Tab',
  type: VirtualDomElements.Button,
}

type DropIndicatorPosition = 'after' | 'before' | undefined

const getDropIndicatorStyle = (dropIndicatorPosition: DropIndicatorPosition): string | undefined => {
  if (dropIndicatorPosition === 'before') {
    return 'box-shadow:inset 2px 0 0 white;'
  }
  if (dropIndicatorPosition === 'after') {
    return 'box-shadow:inset -2px 0 0 white;'
  }
  return undefined
}

const getDropIndicatorPosition = (tabIndex: number, tabCount: number, tabDropIndex: number): DropIndicatorPosition => {
  if (tabDropIndex === tabIndex) {
    return 'before'
  }
  if (tabDropIndex === tabCount && tabIndex === tabCount - 1) {
    return 'after'
  }
  return undefined
}

const renderTab = (
  tab: SimpleBrowserTab,
  activeBrowserViewId: number,
  tabIndex: number,
  tabCount: number,
  tabDropIndex: number,
): readonly VirtualDomNode[] => {
  const isActive = tab.browserViewId === activeBrowserViewId
  const title = tab.title || defaultTitle
  const className = isActive ? MergeClassNames.mergeClassNames(ClassNames.MainTab, ClassNames.MainTabSelected) : ClassNames.MainTab
  const dropIndicatorPosition = getDropIndicatorPosition(tabIndex, tabCount, tabDropIndex)
  return [
    {
      'aria-selected': isActive,
      childCount: 2,
      className,
      'data-id': String(tab.browserViewId),
      'data-index': String(tabIndex),
      draggable: true,
      onDragEnd: DomEventListenerFunctions.HandleDragEnd,
      onDragOver: DomEventListenerFunctions.HandleTabDragOver,
      onDragStart: DomEventListenerFunctions.HandleDragStart,
      onMouseDown: DomEventListenerFunctions.HandleClickTab,
      onMouseUp: DomEventListenerFunctions.HandleTabMouseUp,
      role: AriaRoles.Tab,
      ...(dropIndicatorPosition && { style: getDropIndicatorStyle(dropIndicatorPosition) }),
      tabIndex: isActive ? 0 : -1,
      title,
      type: VirtualDomElements.Div,
    },
    tabTitleNode,
    VirtualDomHelpers.text(title),
    {
      'aria-label': `Close ${title}`,
      childCount: 1,
      className: ClassNames.EditorTabCloseButton,
      'data-id': String(tab.browserViewId),
      onClick: DomEventListenerFunctions.HandleClickCloseTab,
      title: 'Close',
      type: VirtualDomElements.Button,
    },
    closeIconNode,
  ]
}

export const getSimpleBrowserTabsVirtualDom = (
  tabs: readonly SimpleBrowserTab[],
  activeBrowserViewId: number,
  tabDropIndex: number = -1,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: tabs.length + 1,
      className: ClassNames.MainTabs,
      onDragLeave: DomEventListenerFunctions.HandleDragLeave,
      onDragOver: DomEventListenerFunctions.HandleTabsDragOver,
      onDrop: DomEventListenerFunctions.HandleDrop,
      role: AriaRoles.TabList,
      type: VirtualDomElements.Div,
    },
    ...tabs.flatMap((tab, tabIndex) => renderTab(tab, activeBrowserViewId, tabIndex, tabs.length, tabDropIndex)),
    newTabButtonNode,
    addIconNode,
  ]
}
