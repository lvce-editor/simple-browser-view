import type { ElectronTestContext } from './_responseTest.ts'
import * as NavigationTest from './_navigationTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'

export const name = 'simple-browser.navigation-updates-url'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await NavigationTest.startServer()
  const pageAUrl = `${server.url}${NavigationTest.pageAPath}`
  const pageBUrl = `${server.url}${NavigationTest.pageBPath}`
  const input = page.locator('.SimpleBrowserHeader input.InputBox')
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, pageAUrl)

    await SimpleBrowser.clickLink(webContentsPage, 'Go to Page B')
    await webContentsPage.waitForURL(pageBUrl)
    await expect(input).toHaveValue(pageBUrl)

    await SimpleBrowser.clickLink(webContentsPage, 'Go to Page A')
    await webContentsPage.waitForURL(pageAUrl)
    await expect(input).toHaveValue(pageAUrl)
  } finally {
    await server.close()
  }
}
