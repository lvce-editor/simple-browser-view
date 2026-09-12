import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const renderDragData = (oldState: SimpleBrowserState, newState: SimpleBrowserState): readonly any[] => {
  const { draggedBrowserViewId, tabs, uid } = newState
  const tab = tabs.find((candidate) => candidate.browserViewId === draggedBrowserViewId)
  if (!tab) {
    return []
  }
  const data = String(draggedBrowserViewId)
  return [
    'Viewlet.setDragData',
    uid,
    {
      items: [{ data, type: 'application/x-lvce-simple-browser-tab' }],
      label: tab.title || 'Simple Browser',
    },
  ]
}
