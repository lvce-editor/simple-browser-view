import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'

export const name = 'simple-browser.new-tab-input'

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  await SimpleBrowser.show(page)
  const newTabPage = await SimpleBrowser.waitForWebContentsPage(page, 'data:text/html')
  const input = newTabPage.getByRole('searchbox', { name: 'Search with Google' })

  await expect(input).toHaveCSS('user-select', 'none')
}
