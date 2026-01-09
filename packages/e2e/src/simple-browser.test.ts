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

    await StartBuild.waitForBuild(30000)

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

    test.setTimeout(60000)

    await window.waitForLoadState('domcontentloaded')
    await window.locator('.Workbench').waitFor({ timeout: 30000, state: 'visible' })

    await window.waitForTimeout(5000)

    await window.keyboard.press('Control+Shift+P')
    await window.waitForTimeout(2000)

    const quickpickInput = window.locator('input').first()
    await quickpickInput.waitFor({ timeout: 15000, state: 'visible' })

    await quickpickInput.fill('simple browser')
    await window.waitForTimeout(2000)

    const commandPaletteItems = window.locator('[role="option"], .monaco-list-row')
    const firstItem = commandPaletteItems.first()
    try {
      await firstItem.waitFor({ timeout: 10000, state: 'visible' })
    } catch (error) {
      const screenshot = await window.screenshot({ path: 'test-results/command-palette-error.png' })
      const html = await window.content()
      console.error('Command palette items not found.')
      throw error
    }

    const itemText = await firstItem.textContent()
    console.log(`Found command palette item: ${itemText}`)

    await window.keyboard.press('Enter')
    await window.waitForTimeout(3000)

    const simpleBrowserTab = window.locator('.Viewlet.SimpleBrowser')
    try {
      await simpleBrowserTab.waitFor({ timeout: 30000, state: 'visible' })
    } catch (error) {
      const screenshot = await window.screenshot({ path: 'test-results/simple-browser-not-found.png' })
      const html = await window.content()
      const viewlets = await window.locator('.Viewlet').all()
      console.error(`Found ${viewlets.length} viewlets, but SimpleBrowser not found`)
      for (const viewlet of viewlets) {
        const className = await viewlet.getAttribute('class')
        console.error(`Viewlet class: ${className}`)
      }
      throw error
    }

    expect(simpleBrowserTab).toBeVisible()

    const simpleBrowserHeader = window.locator('.SimpleBrowserHeader')
    await simpleBrowserHeader.waitFor({ timeout: 10000, state: 'visible' })
    expect(simpleBrowserHeader).toBeVisible()

    const inputBox = window.locator('.InputBox')
    await inputBox.waitFor({ timeout: 10000, state: 'visible' })
    expect(inputBox).toBeVisible()
  })
})
