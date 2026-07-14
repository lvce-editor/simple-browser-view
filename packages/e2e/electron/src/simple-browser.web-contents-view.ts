import type { expect as PlaywrightExpect, Page } from '@playwright/test'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

interface ElectronTestContext {
  readonly expect: typeof PlaywrightExpect
  readonly page: Page
}

export const name = 'simple-browser.web-contents-view'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start()
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, server.url)

    const heading = webContentsPage.locator('#greeting')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('hello world')
    expect(await SimpleBrowser.getHtml(webContentsPage)).toContain('<h1 id="greeting">hello world</h1>')
    expect(await SimpleBrowser.getComputedStyle(webContentsPage, '#greeting', 'display')).toBe('block')
  } finally {
    await server.close()
  }
}
