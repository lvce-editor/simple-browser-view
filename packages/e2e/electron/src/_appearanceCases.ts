import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
const cases: Record<string, (fixture: Fixture.BrowserFixture) => Promise<void>> = {
  favicon: async ({ expect, tabs }): Promise<void> => {
    const locator1 = tabs.first().locator('img.SimpleBrowserTabFavicon')
    await expect(locator1).toBeVisible()
    const locator2 = tabs.first().locator('img.SimpleBrowserTabFavicon')
    await expect(locator2).toHaveAttribute('src', /^blob:/)
    const imageWidth = await tabs
      .first()
      .locator('img')
      .evaluate((image: HTMLImageElement) => image.naturalWidth)
    expect(imageWidth).toBe(16)
  },
  'favicon-fallback': async ({ expect, guest, tabs }): Promise<void> => {
    await guest.evaluate(() => {
      document.querySelector('link')!.setAttribute('href', 'data:image/png;base64,broken')
    })
    const locator4 = tabs.first().locator('.SimpleBrowserTabFaviconFallback')
    await expect(locator4).toBeVisible()
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
    await expect(tabs.first()).toHaveAttribute('aria-label', 'One')
    const locator5 = browser.locator('.SimpleBrowserHeader .MaskIconRefresh')
    await expect(locator5).toBeVisible()
    await tabs.first().hover()
    const locator6 = browser.locator('.SimpleBrowserTabHover')
    await expect(locator6).toContainText('One')
    await Fixture.toggle(page)
    const locator7 = browser.locator('.SimpleBrowserTabHover')
    await expect(locator7).toHaveCount(0)
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
