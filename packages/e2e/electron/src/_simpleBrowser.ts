import type { Page } from '@playwright/test'

const navigationTimeout = 15_000

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

const waitForWebContentsPage = async (page: Page, expectedUrl: string): Promise<Page> => {
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
  await page.locator('.Workbench').waitFor({ state: 'visible' })
  await page.bringToFront()
  const shortcut = process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P'
  await page.keyboard.press(shortcut)
  const quickPick = page.locator('.QuickPick')
  await quickPick.waitFor({ state: 'visible' })
  const input = quickPick.locator('input')
  await input.fill('>Simple Browser: Open')
  const command = quickPick.getByRole('option', { exact: true, name: 'Simple Browser: Open' })
  await command.waitFor({ state: 'visible' })
  await page.keyboard.press('Enter')
  await page.locator('.SimpleBrowser').waitFor({ state: 'visible' })
}

export const setUrl = async (page: Page, url: string): Promise<void> => {
  const input = page.locator('.SimpleBrowserHeader input.InputBox')
  await input.fill(url)
  await input.press('Enter')
}

export const openUrl = async (page: Page, url: string, expectedUrl: string = url): Promise<Page> => {
  await setUrl(page, url)
  return waitForWebContentsPage(page, expectedUrl)
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
