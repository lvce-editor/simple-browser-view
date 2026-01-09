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
    await page.locator('.Workbench').waitFor({ timeout: 30000, state: 'visible' })

    await page.waitForTimeout(5000)

    // Close all editors before opening simple browser
    await page.keyboard.press('Control+Shift+P')
    await page.waitForTimeout(2000)

    const closeAllEditorsInput = page.locator('input').first()
    await closeAllEditorsInput.waitFor({ timeout: 15000, state: 'visible' })
    await closeAllEditorsInput.fill('close all editors')
    await page.waitForTimeout(2000)

    const closeAllEditorsItems = page.locator('[role="option"], .monaco-list-row')
    const closeAllEditorsCount = await closeAllEditorsItems.count()
    let foundCloseAllEditors = false
    for (let i = 0; i < Math.min(closeAllEditorsCount, 20); i++) {
      const item = closeAllEditorsItems.nth(i)
      const itemText = await item.textContent()
      if (itemText && itemText.toLowerCase().includes('close all editors')) {
        await item.click()
        foundCloseAllEditors = true
        break
      }
    }

    if (foundCloseAllEditors) {
      await page.waitForTimeout(1000)
    }

    // Open simple browser
    await page.keyboard.press('Control+Shift+P')
    await page.waitForTimeout(2000)

    const quickpickInput = page.locator('input').first()
    await quickpickInput.waitFor({ timeout: 15000, state: 'visible' })

    await quickpickInput.fill('browser')
    await page.waitForTimeout(2000)

    const commandPaletteItems = page.locator('[role="option"], .monaco-list-row')
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
      await page.waitForTimeout(500)
      await quickpickInput.fill('simple')
      await page.waitForTimeout(2000)
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
      const screenshot = await page.screenshot({ path: 'test-results/command-palette-error.png' })
      throw new Error('SimpleBrowser command not found in command palette. Tried searching for "browser" and "simple"')
    }

    await page.waitForTimeout(1000)
    await page.waitForTimeout(3000)

    const simpleBrowserTab = page.locator('.Viewlet.SimpleBrowser')
    try {
      await simpleBrowserTab.waitFor({ timeout: 30000, state: 'visible' })
    } catch (error) {
      const screenshot = await page.screenshot({ path: 'test-results/simple-browser-not-found.png' })
      const html = await page.content()
      const viewlets = await page.locator('.Viewlet').all()
      console.error(`Found ${viewlets.length} viewlets, but SimpleBrowser not found`)
      for (const viewlet of viewlets) {
        const className = await viewlet.getAttribute('class')
        console.error(`Viewlet class: ${className}`)
      }
      throw error
    }

    expect(simpleBrowserTab).toBeVisible()

    const simpleBrowserHeader = page.locator('.SimpleBrowserHeader')
    await simpleBrowserHeader.waitFor({ timeout: 10000, state: 'visible' })
    expect(simpleBrowserHeader).toBeVisible()

    const inputBox = page.locator('.InputBox')
    await inputBox.waitFor({ timeout: 10000, state: 'visible' })
    expect(inputBox).toBeVisible()
  })
})
