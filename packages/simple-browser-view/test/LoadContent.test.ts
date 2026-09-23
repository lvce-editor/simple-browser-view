import { expect, jest, test } from '@jest/globals'

const createWebContentsView = jest.fn<() => Promise<number>>().mockResolvedValue(42)
const setFallthroughKeyBindings = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const resizeWebContentsView = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const setIframeSrc = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const getStats = jest.fn<() => Promise<{ canGoBack: boolean; canGoForward: boolean; title: string }>>().mockResolvedValue({
  canGoBack: false,
  canGoForward: false,
  title: 'Example',
})

const { promise: keyBindingsPromise, resolve: resolveKeyBindings } = Promise.withResolvers<readonly any[]>()

jest.unstable_mockModule('../src/parts/ElectronWebContentsView/ElectronWebContentsView.ts', () => ({
  createWebContentsView,
}))

jest.unstable_mockModule('../src/parts/ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts', () => ({
  getStats,
  resizeWebContentsView,
  setFallthroughKeyBindings,
  setIframeSrc,
}))

jest.unstable_mockModule('../src/parts/GetFallThroughKeyBindings/GetFallThroughKeyBindings.ts', () => ({
  getFallThroughKeyBindings: jest.fn(() => []),
}))

jest.unstable_mockModule('../src/parts/KeyBindingsInitial/KeyBindingsInitial.ts', () => ({
  getKeyBindings: jest.fn(() => keyBindingsPromise),
}))

jest.unstable_mockModule('../src/parts/Preferences/Preferences.ts', () => ({
  get: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}))

jest.unstable_mockModule('../src/parts/SimpleBrowserPreferences/SimpleBrowserPreferences.ts', () => ({
  getDefaultUrl: jest.fn(() => 'https://example.com'),
  getShortCuts: jest.fn<() => Promise<readonly any[]>>().mockResolvedValue([]),
}))

const LoadContent = await import('../src/parts/LoadContent/LoadContent.ts')

test('starts native view creation while worker preferences are loading', async () => {
  const loading = LoadContent.loadContent(
    {
      headerHeight: 40,
      height: 600,
      uid: 7,
      uri: 'simple-browser://',
      width: 800,
      x: 10,
      y: 20,
    } as any,
    undefined,
  )

  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(createWebContentsView).toHaveBeenCalledWith(0, 7)
  expect(setIframeSrc).not.toHaveBeenCalled()
  expect(setFallthroughKeyBindings).not.toHaveBeenCalled()

  resolveKeyBindings([])

  await expect(loading).resolves.toMatchObject({
    browserViewId: 42,
    iframeSrc: 'https://example.com',
    title: 'Example',
    uri: 'simple-browser://42',
  })
  expect(setIframeSrc).toHaveBeenCalledWith(42, 'https://example.com')
})
