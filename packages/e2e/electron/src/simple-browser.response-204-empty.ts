import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.response-204-empty'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const contentServer = await TestServer.start(
    TestServer.respond({
      body: '<!doctype html><html><body><h1>Existing content</h1></body></html>',
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
  )
  const { promise: noContentRequested, resolve: resolveNoContentRequested } = Promise.withResolvers<void>()
  const noContentServer = await TestServer.start((_request, response) => {
    response.writeHead(204)
    response.end()
    resolveNoContentRequested()
  })
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, contentServer.url)
    const locator1 = webContentsPage.locator('h1')
    await expect(locator1).toHaveText('Existing content')

    await SimpleBrowser.setUrl(page, noContentServer.url)
    await noContentRequested
    // HTTP 204 keeps the existing document; locator assertions wait for a navigation
    // that never commits in this Electron fixture. Read the retained document directly.
    await expect.poll(() => webContentsPage.evaluate(() => document.querySelector('h1')?.textContent)).toBe('Existing content')
    expect(webContentsPage.url()).toBe(`${contentServer.url}/`)
  } finally {
    await Promise.all([contentServer.close(), noContentServer.close()])
  }
}
