import type { Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const navigationTimeout = 15_000
const commandPaletteTimeout = 5000

const isExpectedPage = (candidate: Page, expectedUrl: string): boolean => {
  const candidateUrl = candidate.url()
  if (candidateUrl.startsWith(expectedUrl)) {
    return true
  }
  try {
    const parsedUrl = new URL(candidateUrl)
    const message = parsedUrl.searchParams.get('message') || ''
    return parsedUrl.pathname.endsWith('/pages/error/error.html') && message.includes(expectedUrl)
  } catch {
    return false
  }
}

export const waitForWebContentsPage = async (page: Page, expectedUrl: string): Promise<Page> => {
  const context = page.context()
  const end = Date.now() + navigationTimeout
  while (Date.now() < end) {
    const webContentsPage = context.pages().find((candidate) => isExpectedPage(candidate, expectedUrl))
    if (webContentsPage) {
      await webContentsPage.waitForLoadState('domcontentloaded')
      return webContentsPage
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  const pageUrls = context.pages().map((candidate) => candidate.url())
  throw new Error(`Simple Browser WebContentsView did not navigate to ${expectedUrl}. Open pages: ${pageUrls.join(', ')}`)
}

export const show = async (page: Page): Promise<void> => {
  page.context().setDefaultTimeout(10_000)
  await page
    .context()
    .route('https://example.com/**', (route) => route.fulfill({ body: '<title>Initial browser page</title>', contentType: 'text/html' }))
  await page.locator('.Workbench').waitFor({ state: 'visible' })
  await page.evaluate(() => {
    const events: unknown[] = []
    Object.assign(globalThis, { ___paletteEvents: events })
    for (const type of ['focusin', 'focusout', 'keydown', 'keyup', 'input']) {
      globalThis.document.addEventListener(
        type,
        (event) => {
          events.push({ key: (event as KeyboardEvent).key, target: (event.target as Element)?.outerHTML, time: globalThis.performance.now(), type })
        },
        { capture: true },
      )
    }
  })
  await page.bringToFront()
  const shortcut = process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P'
  const quickPick = page.locator('.QuickPick')
  const input = quickPick.locator('input')
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.press('Escape')
    await page.keyboard.press(shortcut)
    try {
      await input.waitFor({ state: 'visible', timeout: commandPaletteTimeout })
      lastError = undefined
      break
    } catch (error) {
      lastError = error
    }
  }
  if (lastError) {
    throw lastError
  }
  await input.fill('>Simple Browser: Open')
  const command = quickPick.getByRole('option', { exact: true, name: 'Simple Browser: Open' })
  try {
    await command.waitFor({ state: 'visible' })
  } catch (error) {
    await mkdir('.test-with-playwright/artifacts', { recursive: true })
    await writeFile(
      '.test-with-playwright/artifacts/palette.json',
      JSON.stringify(
        await page.evaluate(() => ({
          events: (globalThis as unknown as { ___paletteEvents: unknown }).___paletteEvents,
          html: globalThis.document.body.outerHTML,
          messages: (globalThis as unknown as { ___receivedMessages: unknown }).___receivedMessages,
        })),
      ),
    )
    console.error(
      'COMMAND_PALETTE_FAILURE',
      await page.evaluate(() => ({
        active: globalThis.document.activeElement?.outerHTML,
        html: globalThis.document.querySelector('.QuickPick')?.outerHTML,
        value: globalThis.document.querySelector<HTMLInputElement>('.QuickPick input')?.value,
      })),
    )
    throw error
  }
  await page.keyboard.press('Enter')
  await page.locator('.SimpleBrowser').last().waitFor({ state: 'visible' })
  await waitForWebContentsPage(page, 'https://example.com')
  await page.locator('.SimpleBrowserHeader .MaskIconRefresh').waitFor({ state: 'visible' })
}

export const setUrl = async (page: Page, url: string): Promise<void> => {
  const input = page.locator('.SimpleBrowserHeader input.InputBox')
  // A DOM focus call does not activate the host WebContents after the native page takes focus.
  // eslint-disable-next-line e2e/no-direct-click -- exercise the user's native focus transition
  await input.click()
  await page.waitForFunction(() => {
    const address = document.querySelector<HTMLInputElement>('.SimpleBrowserHeader input.InputBox')
    return document.hasFocus() && document.activeElement === address
  })
  // Navigation setup replaces the value directly; shortcut selection has dedicated coverage.
  await input.fill(url)
  await input.press('Enter')
}

export const openUrl = async (page: Page, url: string, expectedUrl: string = url): Promise<Page> => {
  await setUrl(page, url)
  const webContentsPage = await waitForWebContentsPage(page, expectedUrl)
  // Native DOM readiness precedes the host's navigation-completion render.
  // Wait before the next action can type into or switch away from this tab.
  await page.locator('.SimpleBrowserHeader .MaskIconRefresh').waitFor({ state: 'visible' })
  return webContentsPage
}

export const clickLink = async (webContentsPage: Page, name: string): Promise<void> => {
  // eslint-disable-next-line e2e/no-direct-click -- exercises navigation initiated inside the WebContentsView
  await webContentsPage.getByRole('link', { name }).click()
}

export const clickButton = async (page: Page, name: 'Back' | 'Forward' | 'Reload' | 'Toggle Developer Tools'): Promise<void> => {
  // eslint-disable-next-line e2e/no-direct-click -- exercises the actual Simple Browser toolbar button
  await page.locator('.SimpleBrowserHeader').getByRole('button', { exact: true, name }).click()
}

export const openDevtools = async (page: Page): Promise<Page> => {
  const context = page.context()
  const existingPages = new Set(context.pages())
  // eslint-disable-next-line e2e/no-direct-click -- opens the actual browser toolbar menu
  await page.locator('.SimpleBrowserHeader').getByRole('button', { exact: true, name: 'Customize and control Simple Browser' }).click()
  // eslint-disable-next-line e2e/no-direct-click -- selects the browser DevTools action
  await page.getByRole('menuitem', { exact: true, name: 'Toggle Developer Tools' }).click()
  const end = Date.now() + navigationTimeout
  while (Date.now() < end) {
    const devtoolsPage = context.pages().find((candidate) => !existingPages.has(candidate) && candidate.url().startsWith('devtools://'))
    if (devtoolsPage) {
      await devtoolsPage.waitForLoadState('domcontentloaded')
      return devtoolsPage
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  const pageUrls = context.pages().map((candidate) => candidate.url())
  throw new Error(`Simple Browser developer tools did not open. Open pages: ${pageUrls.join(', ')}`)
}

export const injectJavaScriptCode = async <T>(webContentsPage: Page, code: string): Promise<T> => {
  return webContentsPage.evaluate(code)
}

export const getHtml = async (webContentsPage: Page): Promise<string> => {
  return injectJavaScriptCode(webContentsPage, 'document.documentElement.outerHTML')
}

export const getComputedStyle = async (webContentsPage: Page, selector: string, property: string): Promise<string> => {
  const code = `getComputedStyle(document.querySelector(${JSON.stringify(selector)})).getPropertyValue(${JSON.stringify(property)})`
  return injectJavaScriptCode(webContentsPage, code)
}
