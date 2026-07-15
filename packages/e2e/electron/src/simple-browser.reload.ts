import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.reload'
// TODO enable when Electron forwards Simple Browser toolbar clicks to the active view
export const skip = 1

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  let requestCount = 0
  const server = await TestServer.start((request, response) => {
    if (request.url !== '/reload.html') {
      response.writeHead(404)
      response.end()
      return
    }
    requestCount++
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(`<!doctype html><html><body><h1>Request ${requestCount}</h1></body></html>`)
  })
  const reloadUrl = `${server.url}/reload.html`
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, reloadUrl)
    await expect(webContentsPage.locator('h1')).toHaveText('Request 1')

    await SimpleBrowser.clickButton(page, 'Reload')
    await expect(webContentsPage.locator('h1')).toHaveText('Request 2')
    expect(webContentsPage.url()).toBe(reloadUrl)
  } finally {
    await server.close()
  }
}
