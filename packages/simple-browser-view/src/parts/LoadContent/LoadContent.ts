import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as Assert from '../Assert/Assert.ts'
import * as ElectronWebContentsView from '../ElectronWebContentsView/ElectronWebContentsView.js'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.js'
import * as GetFallThroughKeyBindings from '../GetFallThroughKeyBindings/GetFallThroughKeyBindings.js'
import * as KeyBindingsInitial from '../KeyBindingsInitial/KeyBindingsInitial.ts'
import * as Preferences from '../Preferences/Preferences.ts'
import * as SimpleBrowserPreferences from '../SimpleBrowserPreferences/SimpleBrowserPreferences.ts'

const getId = (idPart: any): number => {
  if (!idPart) {
    return 0
  }
  return Number.parseInt(idPart)
}

const getUrlFromSavedState = (savedState: any): string => {
  if (savedState && savedState.iframeSrc) {
    return savedState.iframeSrc
  }
  return SimpleBrowserPreferences.getDefaultUrl()
}

export const loadContent = async (state: SimpleBrowserState, savedState: any): Promise<SimpleBrowserState> => {
  const { x, y, width, height, headerHeight, uri, uid } = state
  const idPart = uri.slice('simple-browser://'.length)
  const id = getId(idPart)
  const iframeSrc = getUrlFromSavedState(savedState)
  // TODO load keybindings in parallel with creating browserview
  const keyBindings = await KeyBindingsInitial.getKeyBindings()
  const suggestionsEnabled = Preferences.get('simpleBrowser.suggestions')
  const browserViewX = x
  const browserViewY = y + headerHeight
  const browserViewWidth = width
  const browserViewHeight = height - headerHeight
  const shortcuts = SimpleBrowserPreferences.getShortCuts()

  if (id) {
    // @ts-ignore
    const actualId = await ElectronWebContentsView.createWebContentsView(id, uid)
    await ElectronWebContentsViewFunctions.setFallthroughKeyBindings(keyBindings)
    await ElectronWebContentsViewFunctions.resizeWebContentsView(actualId, browserViewX, browserViewY, browserViewWidth, browserViewHeight)
    if (id !== actualId) {
      await ElectronWebContentsViewFunctions.setIframeSrc(actualId, iframeSrc)
    }
    return {
      ...state,
      iframeSrc,
      // @ts-ignore
      title: 'Simple Browser',
      browserViewId: actualId,
      suggestionsEnabled,
      shortcuts,
    }
  }

  const fallThroughKeyBindings = GetFallThroughKeyBindings.getFallThroughKeyBindings(keyBindings)
  // @ts-ignore
  const browserViewId = await ElectronWebContentsView.createWebContentsView(/* restoreId */ 0, uid)
  await ElectronWebContentsViewFunctions.setFallthroughKeyBindings(fallThroughKeyBindings)
  await ElectronWebContentsViewFunctions.resizeWebContentsView(browserViewId, browserViewX, browserViewY, browserViewWidth, browserViewHeight)
  Assert.number(browserViewId)
  await ElectronWebContentsViewFunctions.setIframeSrc(browserViewId, iframeSrc)
  const { title, canGoBack, canGoForward } = await ElectronWebContentsViewFunctions.getStats(browserViewId)
  return {
    ...state,
    iframeSrc,
    // @ts-ignore
    title,
    browserViewId,
    canGoBack,
    canGoForward,
    uri: `simple-browser://${browserViewId}`,
    suggestionsEnabled,
    shortcuts,
  }
}
