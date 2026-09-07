import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
const cases: Record<string, (fixture: Fixture.BrowserFixture) => Promise<void>> = {
  'address-focus-page': async ({ address, browser, electronApp, expect, guest, server }): Promise<void> => {
    await guest.locator('#draft').focus()
    await electronApp.evaluate(({ webContents }, url) => {
      const target = webContents.getAllWebContents().find((item) => item.getURL() === url)!
      target.focus()
      target.sendInputEvent({ keyCode: 'L', modifiers: ['control'], type: 'keyDown' })
      target.sendInputEvent({ keyCode: 'L', modifiers: ['control'], type: 'keyUp' })
    }, guest.url())
    await expect(address).toBeFocused()
    expect(await address.evaluate((input: HTMLInputElement) => [input.selectionStart, input.selectionEnd])).toEqual([0, `${server.url}/one`.length])
    await expect(browser).toBeAttached()
  },
  'background-link': async ({ address, browser, electronApp, expect, guest, page, server, tabs }): Promise<void> => {
    const link = guest.getByRole('link', { name: 'Background link' })
    // eslint-disable-next-line e2e/no-direct-click -- exercises real link opening gestures in an embedded page
    await link.click({})
    await expect(tabs).toHaveCount(2)
    await expect(address).toHaveValue(`${server.url}/one`)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
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
    await expect(browser).toBeAttached()
  },
  'control-click': async ({ address, browser, electronApp, expect, guest, page, server, tabs }): Promise<void> => {
    const link = guest.getByRole('link', { name: 'Next page' })
    // eslint-disable-next-line e2e/no-direct-click -- exercises real link opening gestures in an embedded page
    await link.click({ modifiers: ['Control'] })
    await expect(tabs).toHaveCount(2)
    await expect(address).toHaveValue(`${server.url}/one`)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
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
    await expect(browser).toBeAttached()
  },
  hash: async ({ address, browser, expect, guest, server }): Promise<void> => {
    await Fixture.pressControl(guest.getByRole('link', { name: 'Section link' }))
    await expect(address).toHaveValue(`${server.url}/one#section`)
    await expect(guest.locator('#section')).toBeInViewport()
    await expect(browser).toBeAttached()
  },
  'history-shortcut': async ({ address, browser, expect, page }): Promise<void> => {
    await address.focus()
    await address.press('Control+h')
    await expect(page.locator('.Main')).toContainText('History')
    await expect(browser).toBeAttached()
  },
  'middle-click': async ({ address, browser, electronApp, expect, guest, page, server, tabs }): Promise<void> => {
    const link = guest.getByRole('link', { name: 'Next page' })
    // eslint-disable-next-line e2e/no-direct-click -- exercises real link opening gestures in an embedded page
    await link.click({ button: 'middle' })
    await expect(tabs).toHaveCount(2)
    await expect(address).toHaveValue(`${server.url}/one`)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
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
    await expect(browser).toBeAttached()
  },
  'page-title': async ({ browser, expect, guest, tabs }): Promise<void> => {
    await guest.evaluate(() => {
      document.title = 'Updated title'
    })
    await expect(tabs.first()).toHaveAttribute('aria-label', 'Updated title')
    await expect(tabs.first().getByRole('button', { exact: true, name: 'Close Updated title' })).toBeVisible()
    await expect(browser).toBeAttached()
  },
  'push-state': async ({ address, browser, expect, guest, server }): Promise<void> => {
    await Fixture.pressControl(guest.getByRole('button', { name: 'Push state' }))
    await expect(address).toHaveValue(`${server.url}/pushed`)
    await expect(browser).toBeAttached()
  },
  'reload-preserves-url': async ({ address, browser, expect, guest, page, server, tabs }): Promise<void> => {
    const token = await guest.evaluate(() => window['documentToken'])
    await SimpleBrowser.clickButton(page, 'Reload')
    await expect.poll(() => guest.evaluate(() => window['documentToken'])).not.toBe(token)
    await expect(address).toHaveValue(`${server.url}/one`)
    await expect(tabs).toHaveCount(1)
    await expect(browser).toBeAttached()
  },
  'updates-url': async ({ browser, expect }): Promise<void> => {
    await expect(browser).toBeAttached()
  },
}

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const fixture = await Fixture.start(context)

  try {
    if (!cases[scenario]) throw new Error('Unknown browser scenario: ' + scenario)
    await cases[scenario](fixture)
  } finally {
    await fixture.close()
  }
}
