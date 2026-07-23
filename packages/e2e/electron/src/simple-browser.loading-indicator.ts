import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.loading-indicator'
// TODO enable when the published Electron editor uses the standalone Simple Browser worker
export const skip = 1

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start()
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, server.url)
    await expect(webContentsPage.locator('#greeting')).toHaveText('hello world')

    const reloadIcon = page.locator('.SimpleBrowserHeader').getByRole('button', { exact: true, name: 'Reload' }).locator('.MaskIcon')
    await expect(reloadIcon).toHaveClass(/MaskIconRefresh/)
  } finally {
    await server.close()
  }
}
