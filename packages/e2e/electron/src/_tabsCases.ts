import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
const cases: Record<string, (fixture: Fixture.BrowserFixture) => Promise<void>> = {
  'close-active': async ({ address, expect, guest, newTab, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    await Fixture.pressControl(tabs.nth(2).getByRole('button', { exact: true, name: 'Close Three' }))
    await expect(address).toHaveValue(`${server.url}/two`)
    await expect(tabs).toHaveCount(2)
  },
  'close-background': async ({ address, expect, guest, newTab, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    await Fixture.pressControl(tabs.first().getByRole('button', { exact: true, name: 'Close One' }))
    await expect(address).toHaveValue(`${server.url}/three`)
    await expect(tabs).toHaveCount(2)
  },
  'close-last': async ({ address, expect, guest, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await Fixture.pressControl(tabs.first().getByRole('button', { exact: true, name: 'Close One' }))
    await expect(tabs).toHaveCount(1)
    await expect(address).toHaveValue('')
    await expect(address).toBeFocused()
  },
  'close-left': async ({ expect, guest, newTab, page, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    const label = 'Close Tabs to the Left'
    await Fixture.tabMenu(page, tabs.nth(1), label)
    const expected = ['Two', 'Three']
    await expect.poll(() => tabs.locator('.SimpleBrowserTabTitle').allTextContents()).toEqual(expected)
  },
  'close-others': async ({ expect, guest, newTab, page, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    const label = 'Close Other Tabs'
    await Fixture.tabMenu(page, tabs.nth(1), label)
    const expected = ['Two']
    await expect.poll(() => tabs.locator('.SimpleBrowserTabTitle').allTextContents()).toEqual(expected)
  },
  'close-right': async ({ expect, guest, newTab, page, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    const label = 'Close Tabs to the Right'
    await Fixture.tabMenu(page, tabs.nth(1), label)
    const expected = ['One', 'Two']
    await expect.poll(() => tabs.locator('.SimpleBrowserTabTitle').allTextContents()).toEqual(expected)
  },
  'cycle-next': async ({ address, expect, guest, newTab, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    await address.focus()
    await address.press('Control+Tab')
    await expect(address).toHaveValue(`${server.url}/one`)
  },
  'cycle-previous': async ({ address, expect, guest, newTab, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    await Fixture.pressControl(tabs.first())
    await address.focus()
    await address.press('Control+Shift+Tab')
    await expect(address).toHaveValue(`${server.url}/three`)
  },
  duplicate: async ({ address, expect, guest, page, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await Fixture.tabMenu(page, tabs.first(), 'Duplicate Tab')
    await expect(tabs).toHaveCount(2)
    await expect(address).toHaveValue(`${server.url}/one`)
    const duplicate = tabs.nth(1)
    await expect(duplicate).toHaveAttribute('aria-selected', 'true')
  },
  'middle-click-keeps-selection': async ({ address, expect, guest, newTab, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    // eslint-disable-next-line e2e/no-direct-click -- exercises the native middle-button tab gesture
    await tabs.nth(1).click({ button: 'middle' })
    await expect(tabs).toHaveCount(3)
    await expect(address).toHaveValue(`${server.url}/three`)
  },
  'new-tab-focus': async ({ address, browser, expect, guest, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await Fixture.pressControl(browser.getByRole('button', { exact: true, name: 'New Tab' }))
    await expect(tabs).toHaveCount(2)
    await expect(address).toBeFocused()
    await expect(address).toHaveValue('')
  },
  'overflow-active-visible': async ({ browser, expect, guest, newTab, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    for (let index = 0; index < 9; index++) await newTab(`/two?tab=${index}`)
    const strip = await browser.locator('.SimpleBrowserTabs').boundingBox()
    const active = await tabs.last().boundingBox()
    expect(active!.x).toBeGreaterThanOrEqual(strip!.x)
    expect(active!.x + active!.width).toBeLessThanOrEqual(strip!.x + strip!.width + 1)
  },
  'reload-background': async ({ address, expect, guest, newTab, page, requests, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    const before = requests.filter((path) => path === '/one').length
    await Fixture.tabMenu(page, tabs.first(), 'Reload Tab')
    await expect.poll(() => requests.filter((path) => path === '/one').length).toBeGreaterThan(before)
    await expect(address).toHaveValue(`${server.url}/three`)
  },
  'switch-preserves-document': async ({ address, expect, guest, newTab, server, tabs }): Promise<void> => {
    await guest.locator('#draft').fill('keep first draft')
    const token = await guest.evaluate(() => window['documentToken'])
    await newTab('/two')
    await newTab('/three')
    await expect(tabs).toHaveCount(3)
    await Fixture.pressControl(tabs.first())
    await expect(address).toHaveValue(`${server.url}/one`)
    await expect(guest.locator('#draft')).toHaveValue('keep first draft')
    expect(await guest.evaluate(() => window['documentToken'])).toBe(token)
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
