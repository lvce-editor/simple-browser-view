import type { ElectronTestContext } from './_responseTest.ts'
import * as NavigationTest from './_navigationTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'

export const name = 'simple-browser.forward'
// TODO enable when Electron forwards Simple Browser toolbar clicks to the active view
export const skip = 1

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await NavigationTest.startServer()
  const pageAUrl = `${server.url}${NavigationTest.pageAPath}`
  const pageBUrl = `${server.url}${NavigationTest.pageBPath}`
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, pageAUrl)

    await SimpleBrowser.clickLink(webContentsPage, 'Go to Page B')
    await webContentsPage.waitForURL(pageBUrl)
    await expect(webContentsPage.locator('h1')).toHaveText('Page B')

    await SimpleBrowser.clickButton(page, 'Back')
    await webContentsPage.waitForURL(pageAUrl)
    await expect(webContentsPage.locator('h1')).toHaveText('Page A')

    await SimpleBrowser.clickButton(page, 'Forward')
    await webContentsPage.waitForURL(pageBUrl)
    await expect(webContentsPage.locator('h1')).toHaveText('Page B')
  } finally {
    await server.close()
  }
}
