import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.connection-refused'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start()
  const unreachableUrl = server.url
  await server.close()

  await SimpleBrowser.show(page)
  const webContentsPage = await SimpleBrowser.openUrl(page, unreachableUrl)
  const body = webContentsPage.locator('body')
  await expect(body).toContainText("This site can't be reached")
  await expect(body).toContainText('ERR_CONNECTION_REFUSED')
}
