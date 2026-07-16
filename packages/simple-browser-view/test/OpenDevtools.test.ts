import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.ts', () => ({
  openDevtools: jest.fn(),
}))

const Create = await import('../src/parts/Create/Create.ts')
const ElectronBrowserViewFunctions = await import('../src/parts/ElectronBrowserViewFunctions/ElectronBrowserViewFunctions.ts')
const OpenDevtools = await import('../src/parts/OpenDevtools/OpenDevtools.ts')

test('opens developer tools for the simple browser web contents view', async () => {
  const state = {
    ...Create.create(1, 0, 0, 800, 600),
    browserViewId: 42,
  }

  await expect(OpenDevtools.openDevtools(state)).resolves.toBe(state)
  expect(ElectronBrowserViewFunctions.openDevtools).toHaveBeenCalledWith(42)
})
