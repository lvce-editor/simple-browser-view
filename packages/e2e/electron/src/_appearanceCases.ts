import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
const cases: Record<string, (fixture: Fixture.BrowserFixture) => Promise<void>> = {
  favicon: async ({ expect, tabs }): Promise<void> => {
    await expect(tabs.first().locator('img.SimpleBrowserTabFavicon')).toBeVisible()
    await expect(tabs.first().locator('img.SimpleBrowserTabFavicon')).toHaveAttribute('src', /^data:image\/svg\+xml/)
    expect(
      await tabs
        .first()
        .locator('img')
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBe(16)
  },
  'favicon-fallback': async ({ expect, guest, tabs }): Promise<void> => {
    await guest.evaluate(() => {
      document.querySelector('link')!.setAttribute('href', 'data:image/png;base64,broken')
    })
    await expect(tabs.first().locator('.SimpleBrowserTabFaviconFallback')).toBeVisible()
  },
  'inherit-theme': async ({ browser, expect, guest, page }): Promise<void> => {
    await expect(browser).not.toHaveClass(/SimpleBrowserLight/)
    const siteTheme = await guest.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)
    await Fixture.toggle(page)
    expect(await guest.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(siteTheme)
  },
  'light-theme': async ({ browser, expect, guest, page, tabs }): Promise<void> => {
    await expect(browser).toHaveClass(/SimpleBrowserLight/)
    await expect(tabs.first()).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    const siteTheme = await guest.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)
    await Fixture.toggle(page)
    expect(await guest.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(siteTheme)
  },
  'tab-hover': async ({ browser, expect, page, tabs }): Promise<void> => {
    await tabs.first().hover()
    await expect(browser.locator('.SimpleBrowserTabHover')).toContainText('One')
    await Fixture.toggle(page)
    await expect(browser.locator('.SimpleBrowserTabHover')).toHaveCount(0)
  },
}

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const preferences = {
    'inherit-theme': { 'simpleBrowser.chromeTheme': 'inherit' },
    'tab-hover': { 'simpleBrowser.tabHover.enabled': true },
  }
  const fixture = await Fixture.start(context, preferences[scenario] || {})

  try {
    if (!cases[scenario]) throw new Error('Unknown browser scenario: ' + scenario)
    await cases[scenario](fixture)
  } finally {
    await fixture.close()
  }
}
