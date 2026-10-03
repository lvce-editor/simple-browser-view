import type { ElectronTestContext } from './_responseTest.ts'
import * as NavigationTest from './_navigationTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'

export const name = 'simple-browser.backward'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await NavigationTest.startServer()
  const pageAUrl = `${server.url}${NavigationTest.pageAPath}`
  const pageBUrl = `${server.url}${NavigationTest.pageBPath}`
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, pageAUrl)
    const locator1 = webContentsPage.locator('h1')
    await expect(locator1).toHaveText('Page A')

    await SimpleBrowser.clickLink(webContentsPage, 'Go to Page B')
    await webContentsPage.waitForURL(pageBUrl)
    const locator2 = webContentsPage.locator('h1')
    await expect(locator2).toHaveText('Page B')

    await SimpleBrowser.clickButton(page, 'Back')
    await webContentsPage.waitForURL(pageAUrl)
    const locator3 = webContentsPage.locator('h1')
    await expect(locator3).toHaveText('Page A')
  } finally {
    await server.close()
  }
}
