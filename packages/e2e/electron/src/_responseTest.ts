import type { expect as PlaywrightExpect, Page } from '@playwright/test'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export interface ElectronTestContext {
  readonly expect: typeof PlaywrightExpect
  readonly page: Page
}

interface ResponseTestOptions extends TestServer.TestResponse {
  readonly expectedText: string
}

export const run = async ({ expect, page }: ElectronTestContext, { expectedText, ...response }: ResponseTestOptions): Promise<void> => {
  const server = await TestServer.start(TestServer.respond(response))
  try {
    await SimpleBrowser.show(page)
    const webContentsPage = await SimpleBrowser.openUrl(page, server.url)
    await expect(webContentsPage.locator('body')).toHaveText(expectedText)
  } finally {
    await server.close()
  }
}
