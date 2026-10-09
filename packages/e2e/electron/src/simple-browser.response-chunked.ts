import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.response-chunked'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start(async (_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
    response.write('first chunk, ')
    await new Promise<void>((resolve) => setImmediate(resolve))
    response.end('second chunk')
  })
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, server.url)
    const locator1 = webContentsPage.locator('body')
    await expect(locator1).toHaveText('first chunk, second chunk')
  } finally {
    await server.close()
  }
}
