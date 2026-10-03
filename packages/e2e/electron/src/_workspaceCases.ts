import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
const cases: Record<string, (fixture: Fixture.BrowserFixture) => Promise<void>> = {
  'address-selection': async ({ address, electronApp, expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.pressControl(address)
    await expect(address).toBeFocused()
    await address.press('Control+a')
    await address.pressSequentially('unfinished address')
    await expect(address).toHaveValue('unfinished address')
    await address.press('ArrowLeft')
    await address.pressSequentially('x')
    await expect(address).toHaveValue('unfinished addresxs')
    await address.press('Backspace')
    await expect(address).toHaveValue('unfinished address')
    await address.evaluate((element: HTMLInputElement) => element.setSelectionRange(2, 8))
    await Fixture.gesture({ electronApp })
    const locator1 = page.locator('.BrowserFullWidth')
    await expect(locator1).toHaveCount(1)
    await expect(address).toBeFocused()
    await expect(address).toHaveValue('unfinished address')
    await expect.poll(() => address.evaluate((element: HTMLInputElement) => [element.selectionStart, element.selectionEnd])).toEqual([2, 8])
  },
  'escape-keeps-layout': async ({ expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.toggle(page)
    await guest.keyboard.press('Escape')
    const locator2 = page.locator('.BrowserFullWidth')
    await expect(locator2).toHaveCount(1)
  },
  'fifty-switches': async ({ expect, guest, page, requests }): Promise<void> => {
    const token = await guest.evaluate(() => window['documentToken'])
    await guest.locator('#draft').fill('retained draft')
    await guest.evaluate(() => scrollTo(0, 200))
    for (let index = 0; index < 50; index++) {
      await Fixture.toggle(page)
      const locator3 = page.locator('.BrowserFullWidth')
      await expect(locator3).toHaveCount(index % 2 === 0 ? 1 : 0)
    }
    expect(await guest.evaluate(() => window['documentToken'])).toBe(token)
    const locator4 = guest.locator('#draft')
    await expect(locator4).toHaveValue('retained draft')
    expect(await guest.evaluate(() => scrollY)).toBe(200)
    expect(requests.filter((path) => path === '/one')).toHaveLength(1)
  },
  'gesture-address': async ({ address, electronApp, expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await address.focus()
    await Fixture.gesture({ electronApp })
    const locator5 = page.locator('.BrowserFullWidth')
    await expect(locator5).toHaveCount(1)
    await Fixture.toggle(page)
    const locator6 = page.locator('.BrowserFullWidth')
    await expect(locator6).toHaveCount(0)
  },
  'gesture-disabled': async ({ electronApp, expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.gesture({ electronApp })
    const recognitionWindowEnds = Date.now() + 450
    await expect.poll(() => Date.now()).toBeGreaterThan(recognitionWindowEnds)
    const locator7 = page.locator('.BrowserFullWidth')
    await expect(locator7).toHaveCount(0)
    await Fixture.toggle(page)
    const locator8 = page.locator('.BrowserFullWidth')
    await expect(locator8).toHaveCount(1)
    await Fixture.toggle(page)
    const locator9 = page.locator('.BrowserFullWidth')
    await expect(locator9).toHaveCount(0)
  },
  'gesture-page': async ({ electronApp, expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.gesture({ electronApp }, guest.url())
    const locator10 = page.locator('.BrowserFullWidth')
    await expect(locator10).toHaveCount(1)
    await Fixture.toggle(page)
    const locator11 = page.locator('.BrowserFullWidth')
    await expect(locator11).toHaveCount(0)
  },
  'palette-toggle': async ({ expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.command(page, 'Simple Browser: Toggle Full Width')
    const locator12 = page.locator('.BrowserFullWidth')
    await expect(locator12).toHaveCount(1)
    await Fixture.command(page, 'Simple Browser: Toggle Full Width')
    const locator13 = page.locator('.BrowserFullWidth')
    await expect(locator13).toHaveCount(0)
  },
  'preserve-document': async ({ expect, guest, page, requests }): Promise<void> => {
    const token = await guest.evaluate(() => window['documentToken'])
    await guest.locator('#draft').fill('retained draft')
    await guest.evaluate(() => scrollTo(0, 200))
    for (let index = 0; index < 2; index++) {
      await Fixture.toggle(page)
      const locator14 = page.locator('.BrowserFullWidth')
      await expect(locator14).toHaveCount(index % 2 === 0 ? 1 : 0)
    }
    expect(await guest.evaluate(() => window['documentToken'])).toBe(token)
    const locator15 = guest.locator('#draft')
    await expect(locator15).toHaveValue('retained draft')
    expect(await guest.evaluate(() => scrollY)).toBe(200)
    expect(requests.filter((path) => path === '/one')).toHaveLength(1)
  },
  'resize-restore': async ({ browser, electronApp, expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.toggle(page)
    await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(900, 650))
    await expect
      .poll(async () => {
        const bounds = await browser.boundingBox()
        return bounds?.width
      })
      .toBe(900)
    await Fixture.toggle(page)
    const bounds = await browser.boundingBox()
    expect(bounds!.width).toBeGreaterThan(100)
    expect(bounds!.height).toBeGreaterThan(100)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(900)
  },
  'restart-snapshot': async ({ expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.toggle(page)
    await page.evaluate(() => {
      globalThis.localStorage.removeItem('Layout')
      // eslint-disable-next-line unicorn/isolated-functions -- Event is provided by the renderer realm
      globalThis.document.dispatchEvent(new Event('pointerleave'))
    })
    await expect.poll(() => page.evaluate(() => globalThis.localStorage.getItem('Layout'))).not.toBeNull()
    const layout = await page.evaluate(() => JSON.parse(globalThis.localStorage.getItem('Layout')!))
    const { browserFullWidth } = layout
    expect(browserFullWidth).toBeUndefined()
    await page.reload()
    const locator16 = page.locator('.Workbench')
    await expect(locator16).toBeVisible()
    const locator17 = page.locator('.BrowserFullWidth')
    await expect(locator17).toHaveCount(0)
  },
  'reveal-pane': async ({ electronApp, expect, guest, page }): Promise<void> => {
    await guest.locator('#draft').fill('retained draft')
    await Fixture.toggle(page)
    await expect
      .poll(() =>
        electronApp.evaluate(
          ({ webContents }, url) =>
            webContents
              .getAllWebContents()
              .find((item) => item.getURL() === url)
              ?.isFocused(),
          guest.url(),
        ),
      )
      .toBe(true)
    await Fixture.command(page, 'Layout: Toggle Panel')
    const locator18 = page.locator('.BrowserFullWidth')
    await expect(locator18).toHaveCount(0)
    const locator19 = page.locator('.Panel')
    await expect(locator19).toBeVisible()
  },
}

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const fixture = await Fixture.start(context, scenario === 'gesture-disabled' ? { 'simpleBrowser.fullWidth.doubleControlEnabled': false } : {})

  try {
    if (!cases[scenario]) throw new Error('Unknown browser scenario: ' + scenario)
    await cases[scenario](fixture)
  } finally {
    await fixture.close()
  }
}
