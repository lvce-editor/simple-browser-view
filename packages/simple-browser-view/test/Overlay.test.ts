import { beforeEach, expect, jest, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'

jest.unstable_mockModule('../src/parts/ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}))

const ElectronWebContentsViewFunctions = await import('../src/parts/ElectronWebContentsViewFunctions/ElectronWebContentsViewFunctions.ts')
const HideOverlay = await import('../src/parts/HideOverlay/HideOverlay.ts')
const ShowOverlay = await import('../src/parts/ShowOverlay/ShowOverlay.ts')

const state = {
  browserViewId: 12,
  overlayIds: [],
} as unknown as SimpleBrowserState

beforeEach(() => {
  jest.resetAllMocks()
})

test('first overlay hides the active web contents view', async () => {
  const result = await ShowOverlay.showOverlay(state, 'basic-auth:12:1')

  expect(ElectronWebContentsViewFunctions.hide).toHaveBeenCalledWith(12)
  expect(result.overlayIds).toEqual(['basic-auth:12:1'])
})

test('additional overlays keep the web contents view hidden', async () => {
  const result = await ShowOverlay.showOverlay(
    {
      ...state,
      overlayIds: ['menu'],
    },
    'basic-auth:12:1',
  )

  expect(ElectronWebContentsViewFunctions.hide).not.toHaveBeenCalled()
  expect(result.overlayIds).toEqual(['menu', 'basic-auth:12:1'])
})

test('last overlay removal shows the active web contents view', async () => {
  const result = await HideOverlay.hideOverlay(
    {
      ...state,
      overlayIds: ['basic-auth:12:1'],
    },
    'basic-auth:12:1',
  )

  expect(ElectronWebContentsViewFunctions.show).toHaveBeenCalledWith(12)
  expect(result.overlayIds).toEqual([])
})

test('removing one of multiple overlays keeps the web contents view hidden', async () => {
  const result = await HideOverlay.hideOverlay(
    {
      ...state,
      overlayIds: ['menu', 'basic-auth:12:1'],
    },
    'basic-auth:12:1',
  )

  expect(ElectronWebContentsViewFunctions.show).not.toHaveBeenCalled()
  expect(result.overlayIds).toEqual(['menu'])
})
