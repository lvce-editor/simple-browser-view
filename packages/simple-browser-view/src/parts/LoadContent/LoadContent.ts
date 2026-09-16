import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import type { SimpleBrowserTab } from '../SimpleBrowserTab/SimpleBrowserTab.ts'
import * as Assert from '../Assert/Assert.ts'
import * as ElectronWebContentsView from '../ElectronWebContentsView/ElectronWebContentsView.ts'
import * as ElectronWebContentsViewFunctions from '../ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts'
import * as GetFallThroughKeyBindings from '../GetFallThroughKeyBindings/GetFallThroughKeyBindings.ts'
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
  const { headerHeight, height, uid, uri, width, x, y } = state
  const idPart = uri.slice('simple-browser://'.length)
  const id = getId(idPart)
  const iframeSrc = getUrlFromSavedState(savedState)
  const browserViewX = x
  const browserViewY = y + headerHeight
  const browserViewWidth = width
  const browserViewHeight = height - headerHeight
  const keyBindingsPromise = KeyBindingsInitial.getKeyBindings()
  const suggestionsEnabledPromise = Preferences.get('simpleBrowser.suggestions')
  const shortcutsPromise = SimpleBrowserPreferences.getShortCuts()

  // Start creating the native view while the independent worker preferences are loading. This
  // keeps the browser navigation on the critical path instead of waiting for unrelated RPCs.
  // @ts-ignore
  const actualId = await ElectronWebContentsView.createWebContentsView(id, uid)
  const pageLoadPromise = id === actualId ? Promise.resolve() : ElectronWebContentsViewFunctions.setIframeSrc(actualId, iframeSrc)
  const [keyBindings, suggestionsEnabled, shortcuts] = await Promise.all([keyBindingsPromise, suggestionsEnabledPromise, shortcutsPromise])

  if (id) {
    await ElectronWebContentsViewFunctions.setFallthroughKeyBindings(keyBindings)
    await ElectronWebContentsViewFunctions.resizeWebContentsView(actualId, browserViewX, browserViewY, browserViewWidth, browserViewHeight)
    await pageLoadPromise
    const { canGoBack, canGoForward, title } = await ElectronWebContentsViewFunctions.getStats(actualId)
    const tab: SimpleBrowserTab = {
      browserViewId: actualId,
      canGoBack,
      canGoForward,
      iframeSrc,
      inputValue: iframeSrc,
      isLoading: false,
      title,
    }
    return {
      ...state,
      browserViewId: actualId,
      canGoBack,
      canGoForward,
      iframeSrc,
      shortcuts,
      suggestionsEnabled,
      tabs: [tab],
      title,
    }
  }

  const fallThroughKeyBindings = GetFallThroughKeyBindings.getFallThroughKeyBindings(keyBindings)
  await ElectronWebContentsViewFunctions.setFallthroughKeyBindings(fallThroughKeyBindings)
  await ElectronWebContentsViewFunctions.resizeWebContentsView(actualId, browserViewX, browserViewY, browserViewWidth, browserViewHeight)
  Assert.number(actualId)
  await pageLoadPromise
  const { canGoBack, canGoForward, title } = await ElectronWebContentsViewFunctions.getStats(actualId)
  const tab: SimpleBrowserTab = {
    browserViewId: actualId,
    canGoBack,
    canGoForward,
    iframeSrc,
    inputValue: iframeSrc,
    isLoading: false,
    title,
  }
  return {
    ...state,
    browserViewId: actualId,
    canGoBack,
    canGoForward,
    iframeSrc,
    shortcuts,
    suggestionsEnabled,
    tabs: [tab],
    title,
    uri: `simple-browser://${actualId}`,
  }
}
