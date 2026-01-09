import { test, expect } from '@playwright/test'
import { ElectronApplication } from 'playwright'
import { ChildProcess } from 'node:child_process'
import * as LaunchElectron from './launchElectron.ts'
import * as StartBuild from './startBuild.ts'
import * as StopProcess from './stopProcess.ts'

test.describe('Simple Browser E2E', () => {
  let electronApp: ElectronApplication | null = null
  let buildProcess: ChildProcess | null = null
  let window: Awaited<ReturnType<ElectronApplication['firstWindow']>> | null = null

  test.beforeAll(async () => {
    buildProcess = StartBuild.startBuild()

    await StartBuild.waitForBuild(3000)

    electronApp = await LaunchElectron.launchElectron()

    window = await electronApp.firstWindow()
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
    await StopProcess.stopProcess(buildProcess)
  })

  test('should open simple browser view from command palette', async () => {
    if (!window) {
      throw new Error('Window not initialized')
    }

    await window.waitForLoadState('domcontentloaded')
    await window.locator('.Workbench').waitFor({ timeout: 30000, state: 'visible' })

    await window.waitForTimeout(2000)

    await window.keyboard.press('Control+Shift+P')
    await window.waitForTimeout(1000)

    const quickpickInput = window.locator('input').first()
    await quickpickInput.waitFor({ timeout: 15000, state: 'visible' })

    await quickpickInput.fill('simple browser')
    await window.waitForTimeout(1000)

    await window.keyboard.press('Enter')
    await window.waitForTimeout(3000)

    const simpleBrowserTab = window.locator('.Viewlet.SimpleBrowser')
    await simpleBrowserTab.waitFor({ timeout: 20000, state: 'visible' })

    expect(simpleBrowserTab).toBeVisible()

    const simpleBrowserHeader = window.locator('.SimpleBrowserHeader')
    expect(simpleBrowserHeader).toBeVisible()

    const inputBox = window.locator('.InputBox')
    expect(inputBox).toBeVisible()
  })
})
