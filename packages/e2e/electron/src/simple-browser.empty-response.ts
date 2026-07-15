import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.empty-response'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start((request) => {
    request.socket.destroy()
  })
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, server.url)
    const body = webContentsPage.locator('body')
    await expect(body).toContainText('Site could not be loaded')
    await expect(body).toContainText('ERR_EMPTY_RESPONSE')
  } finally {
    await server.close()
  }
}
