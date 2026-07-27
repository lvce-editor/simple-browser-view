import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as GetSimpleBrowserVirtualDom from '../GetSimpleBrowserVirtualDom/GetSimpleBrowserVirtualDom.ts'

export const renderItems = (oldState: SimpleBrowserState, newState: SimpleBrowserState): readonly any[] => {
  const { browserViewId, canGoBack, canGoForward, iframeSrc, isLoading, tabs } = newState
  const dom: readonly VirtualDomNode[] = GetSimpleBrowserVirtualDom.getSimpleBrowserVirtualDom(
    canGoBack,
    canGoForward,
    isLoading,
    iframeSrc,
    tabs,
    browserViewId,
  )
  return ['Viewlet.setDom2', dom]
}
