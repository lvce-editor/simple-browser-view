import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.recovers-after-connection-error'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const unavailableServer = await TestServer.start()
  const unavailableUrl = unavailableServer.url
  await unavailableServer.close()
  const availableServer = await TestServer.start(
    TestServer.respond({
      body: '<!doctype html><html><body><h1>Server is available again</h1></body></html>',
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
  )
  try {
    await SimpleBrowser.show(page)
    const errorPage = await SimpleBrowser.openUrl(page, unavailableUrl)
    await expect(errorPage.locator('body')).toContainText("This site can't be reached")

    const recoveredPage = await SimpleBrowser.openUrl(page, availableServer.url)
    await expect(recoveredPage.locator('h1')).toHaveText('Server is available again')
  } finally {
    await availableServer.close()
  }
}
