import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

export const name = 'simple-browser.workspace-toolbar'

export const test = async (context: ElectronTestContext): Promise<void> => {
  const fixture = await Fixture.start(context)
  const { browser, expect, page } = fixture
  try {
    const originalBounds = await page.locator('.Main').boundingBox()
    await Fixture.toggle(page)
    await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
    await expect(browser.getByRole('button', { exact: true, name: 'Restore Coding Layout' })).toBeVisible()
    await expect
      .poll(async () => {
        const bounds = await browser.boundingBox()
        return bounds?.width
      })
      .toBe(await page.evaluate(() => globalThis.innerWidth))
    await Fixture.toggle(page)
    await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
    await expect.poll(() => page.locator('.Main').boundingBox()).toEqual(originalBounds)
  } finally {
    await fixture.close()
  }
}
