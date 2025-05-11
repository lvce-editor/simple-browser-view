import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const renderItems = (oldState: SimpleBrowserState, newState: SimpleBrowserState): readonly any[] => {
  const dom: readonly VirtualDomNode[] = []
  return ['Viewlet.setDom2', dom]
}
