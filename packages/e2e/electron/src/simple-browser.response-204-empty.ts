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
    await expect(webContentsPage.locator('h1')).toHaveText('Existing content')

    await SimpleBrowser.setUrl(page, noContentServer.url)
    await noContentRequested
    await expect(webContentsPage.locator('h1')).toHaveText('Existing content')
    expect(webContentsPage.url()).toBe(`${contentServer.url}/`)
  } finally {
    await Promise.all([contentServer.close(), noContentServer.close()])
  }
}
