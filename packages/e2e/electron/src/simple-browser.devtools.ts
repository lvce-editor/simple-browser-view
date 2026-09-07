import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.devtools'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start()
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, server.url)
    await expect(webContentsPage.locator('#greeting')).toHaveText('hello world')

    const devtoolsPage = await SimpleBrowser.openDevtools(page)

    expect(devtoolsPage.url()).toMatch(/^devtools:\/\//)
  } finally {
    await server.close()
  }
}
