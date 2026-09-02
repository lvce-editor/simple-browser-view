import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'

export const name = 'simple-browser.new-tab-input'
export const skip = process.env.RUN_NEW_TAB_INPUT_E2E === '1' ? 0 : 1

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  await SimpleBrowser.show(page)
  const simpleBrowser = page.locator('.SimpleBrowser').last()
  // eslint-disable-next-line e2e/no-direct-click -- exercises the actual new-tab control
  await simpleBrowser.getByRole('button', { exact: true, name: 'New Tab' }).click()
  const newTabPage = await SimpleBrowser.waitForWebContentsPage(page, 'data:text/html')
  const input = newTabPage.getByRole('searchbox', { name: 'Search with Google' })

  await expect(input).toHaveCSS('user-select', 'none')
}
