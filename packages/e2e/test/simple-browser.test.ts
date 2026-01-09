import { test, expect } from '@playwright/test'
import { ElectronApplication } from 'playwright'
import * as LaunchElectron from '../src/launchElectron.ts'

test.describe('Simple Browser E2E', () => {
  let electronApp: ElectronApplication | null = null
  let page: Awaited<ReturnType<ElectronApplication['firstWindow']>> | null = null

  test.beforeAll(async () => {
    electronApp = await LaunchElectron.launchElectron()

    page = await electronApp.firstWindow()
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('should open simple browser view from command palette', async () => {
    if (!page) {
      throw new Error('Window not initialized')
    }

    test.setTimeout(60000)

    await page.waitForLoadState('domcontentloaded')
    const workbench = page.locator('.Workbench')
    await expect(workbench).toBeVisible()
    const activityBar = page.locator('.ActivityBar')
    await expect(activityBar).toBeVisible()

    // Close all editors before opening simple browser
    await page.keyboard.press('Control+Shift+P')
    const quickPick = page.locator('.QuickPick')
    await expect(quickPick).toBeVisible()

    const quickPickInput = quickPick.locator('input')
    await expect(quickPick).toBeVisible()

    await quickPickInput.fill('close all editors')

    // TODO select option
    // TODO then open simple browser
    const simpleBrowserTab = page.locator('.Viewlet.SimpleBrowser')
    await expect(simpleBrowserTab).toBeVisible()
  })
})
