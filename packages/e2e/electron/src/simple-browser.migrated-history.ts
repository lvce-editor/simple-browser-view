import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

const nonZeroPixelWidthRegex = /^[1-9]\d*(?:\.\d+)?px$/

export const name = 'simple-browser.migrated-history'

export const test = async ({ page, expect, electronApp }: ElectronTestContext): Promise<void> => {
  const { expect, page } = context
  await Fixture.reset({ page, expect, electronApp })

  await page.evaluate(
    (entries) => globalThis.localStorage.setItem('simple-browser-history', JSON.stringify(entries)),
    [
      { date: Date.UTC(2026, 8, 2, 11, 15), url: 'https://older.example' },
      { date: Date.UTC(2026, 8, 3, 12, 30), url: 'https://newer.example/docs' },
    ],
  )
  await Fixture.command(page, 'Simple Browser: Open History')

  const historyView = page.locator('.SimpleBrowserHistory')
  await expect(historyView).toBeVisible()
  await expect(historyView).toHaveCSS('width', nonZeroPixelWidthRegex)
  await expect(historyView.locator('h1')).toHaveText('History')
  await expect(historyView.locator('input')).toHaveAttribute('placeholder', 'Search history')
  const entries = historyView.locator('.SimpleBrowserHistoryEntry')
  await expect(entries).toHaveCount(2)
  const firstUrl = entries.nth(0).locator('.SimpleBrowserHistoryUrl')
  await expect(firstUrl).toHaveText('https://newer.example/docs')
  const secondUrl = entries.nth(1).locator('.SimpleBrowserHistoryUrl')
  await expect(secondUrl).toHaveText('https://older.example')

  await Fixture.pressControl(entries.nth(0).locator('.SimpleBrowserHistoryRemove'))
  await expect(entries).toHaveCount(1)
  await expect(entries.locator('.SimpleBrowserHistoryUrl')).toHaveText('https://older.example')

  await Fixture.pressControl(historyView.locator('.SimpleBrowserHistoryControls button'))
  await expect(entries).toHaveCount(0)
}
