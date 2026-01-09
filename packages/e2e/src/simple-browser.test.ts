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

    await quickpickInput.fill('browser')
    await window.waitForTimeout(2000)

    const commandPaletteItems = window.locator('[role="option"], .monaco-list-row')
    const itemCount = await commandPaletteItems.count()
    console.log(`Found ${itemCount} command palette items when searching for "browser"`)

    let foundSimpleBrowser = false
    for (let i = 0; i < Math.min(itemCount, 20); i++) {
      const item = commandPaletteItems.nth(i)
      const itemText = await item.textContent()
      console.log(`Command ${i}: ${itemText}`)
      if (itemText && (itemText.toLowerCase().includes('simple browser') || itemText.toLowerCase().includes('open simple browser'))) {
        await item.click()
        foundSimpleBrowser = true
        break
      }
    }

    if (!foundSimpleBrowser) {
      await quickpickInput.fill('')
      await window.waitForTimeout(500)
      await quickpickInput.fill('simple')
      await window.waitForTimeout(2000)
      const itemCount2 = await commandPaletteItems.count()
      console.log(`Found ${itemCount2} command palette items when searching for "simple"`)
      for (let i = 0; i < Math.min(itemCount2, 20); i++) {
        const item = commandPaletteItems.nth(i)
        const itemText = await item.textContent()
        console.log(`Command ${i}: ${itemText}`)
        if (itemText && (itemText.toLowerCase().includes('simple browser') || itemText.toLowerCase().includes('open simple browser'))) {
          await item.click()
          foundSimpleBrowser = true
          break
        }
      }
    }

    if (!foundSimpleBrowser) {
      const screenshot = await window.screenshot({ path: 'test-results/command-palette-error.png' })
      throw new Error('SimpleBrowser command not found in command palette. Tried searching for "browser" and "simple"')
    }

    await window.waitForTimeout(1000)
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
