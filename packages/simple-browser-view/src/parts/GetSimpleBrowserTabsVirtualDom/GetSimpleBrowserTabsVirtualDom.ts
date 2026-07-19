import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import * as AriaRoles from '../AriaRoles/AriaRoles.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'
import * as VirtualDomHelpers from '../VirtualDomHelpers/VirtualDomHelpers.ts'

const defaultTitle = 'Simple Browser'

export const getSimpleBrowserTabsVirtualDom = (pageTitle: string): readonly VirtualDomNode[] => {
  const title = pageTitle || defaultTitle
  return [
    {
      childCount: 1,
      className: ClassNames.MainTabs,
      role: AriaRoles.TabList,
      type: VirtualDomElements.Div,
    },
    {
      'aria-selected': true,
      childCount: 1,
      className: MergeClassNames.mergeClassNames(ClassNames.MainTab, ClassNames.MainTabSelected),
      role: AriaRoles.Tab,
      title,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: ClassNames.TabTitle,
      type: VirtualDomElements.Span,
    },
    VirtualDomHelpers.text(title),
  ]
}
