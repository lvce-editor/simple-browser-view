import type { Test } from '@lvce-editor/test-with-playwright'

const nonZeroPixelWidthRegex = /^[1-9]\d*(?:\.\d+)?px$/

export const name = 'viewlet.simple-browser-history'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('LocalStorage.setJson', 'simple-browser-history', [
    { date: Date.UTC(2026, 8, 2, 11, 15), url: 'https://older.example' },
    { date: Date.UTC(2026, 8, 3, 12, 30), url: 'https://newer.example/docs' },
  ])
  await Command.execute('Main.openUri', 'simple-browser-history://')

  const historyView = Locator('.SimpleBrowserHistory')
  await expect(historyView).toBeVisible()
  await expect(historyView).toHaveCSS('width', nonZeroPixelWidthRegex as unknown as string)
  const heading = historyView.locator('h1')
  await expect(heading).toHaveText('History')
  const searchInput = historyView.locator('input')
  await expect(searchInput).toHaveAttribute('placeholder', 'Search history')
  const entries = historyView.locator('.SimpleBrowserHistoryEntry')
  await expect(entries).toHaveCount(2)
  const newestUrl = entries.nth(0).locator('.SimpleBrowserHistoryUrl')
  const oldestUrl = entries.nth(1).locator('.SimpleBrowserHistoryUrl')
  await expect(newestUrl).toHaveText('https://newer.example/docs')
  await expect(oldestUrl).toHaveText('https://older.example')

  await Command.execute('SimpleBrowserHistory.removeEntry', 0)
  await expect(entries).toHaveCount(1)
  const remainingUrl = entries.locator('.SimpleBrowserHistoryUrl')
  await expect(remainingUrl).toHaveText('https://older.example')

  await Command.execute('SimpleBrowserHistory.clearHistory')
  await expect(entries).toHaveCount(0)
}
