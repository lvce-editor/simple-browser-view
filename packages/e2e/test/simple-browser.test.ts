import { test, expect } from '@playwright/test'
import { ElectronApplication } from 'playwright'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import * as LaunchElectron from '../src/launchElectron.ts'

test.describe('Simple Browser E2E', () => {
  let electronApp: ElectronApplication | null = null
  let page: Awaited<ReturnType<ElectronApplication['firstWindow']>> | null = null
  let userDataDir: string | null = null

  test.beforeAll(async () => {
    userDataDir = mkdtempSync(join(tmpdir(), 'simple-browser-view-e2e-'))
    electronApp = await LaunchElectron.launchElectron(userDataDir)

    page = await electronApp.firstWindow()
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
    if (userDataDir) {
      rmSync(userDataDir, { recursive: true, force: true })
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

    await new Promise((r) => {})

    // TODO select option
    // TODO then open simple browser
    const simpleBrowserTab = page.locator('.Viewlet.SimpleBrowser')
    await expect(simpleBrowserTab).toBeVisible()
  })
})
