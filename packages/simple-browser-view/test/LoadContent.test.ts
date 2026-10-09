import { beforeEach, expect, jest, test } from '@jest/globals'

const createWebContentsView = jest.fn<(restoreId: number, fallThroughKeyBindings: readonly any[]) => Promise<number>>().mockResolvedValue(42)
const setFallthroughKeyBindings = jest.fn<(id: number, fallThroughKeyBindings: readonly any[]) => Promise<void>>().mockResolvedValue(undefined)
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
  getFallThroughKeyBindings: jest.fn(() => ['Ctrl+K']),
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

beforeEach(() => {
  jest.clearAllMocks()
})

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

  expect(createWebContentsView).toHaveBeenCalledWith(0, [])
  expect(setIframeSrc).not.toHaveBeenCalled()
  expect(setFallthroughKeyBindings).not.toHaveBeenCalled()

  resolveKeyBindings([{ key: 'Ctrl+K' }])

  await expect(loading).resolves.toMatchObject({
    browserViewId: 42,
    iframeSrc: 'https://example.com',
    title: 'Example',
    uri: 'simple-browser://42',
  })
  expect(setFallthroughKeyBindings).toHaveBeenCalledWith(42, ['Ctrl+K'])
  expect(setIframeSrc).toHaveBeenCalledWith(42, 'https://example.com')
})

test('restores a native view with its keybindings set on the returned view ID', async () => {
  createWebContentsView.mockResolvedValueOnce(7)

  await LoadContent.loadContent(
    {
      headerHeight: 40,
      height: 600,
      uri: 'simple-browser://7',
      width: 800,
      x: 10,
      y: 20,
    } as any,
    { iframeSrc: 'https://restored.example' },
  )

  expect(createWebContentsView).toHaveBeenCalledWith(7, [])
  expect(setFallthroughKeyBindings).toHaveBeenCalledWith(7, ['Ctrl+K'])
  expect(setIframeSrc).not.toHaveBeenCalled()
})
