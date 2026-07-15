import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.response-redirect'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start((request, response) => {
    if (request.url === '/redirect') {
      response.writeHead(302, { location: '/destination' })
      response.end()
      return
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end('<!doctype html><html><body><h1>Redirect destination</h1></body></html>')
  })
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, `${server.url}/redirect`, `${server.url}/destination`)
    await expect(webContentsPage.locator('h1')).toHaveText('Redirect destination')
  } finally {
    await server.close()
  }
}
