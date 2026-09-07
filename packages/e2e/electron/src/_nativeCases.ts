import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
interface NativeMenuEntry {
  readonly enabled: boolean
  readonly label: string
  readonly role: string | null
}
interface NativeFixture extends Fixture.BrowserFixture {
  readonly choose: (label: string) => Promise<void>
  readonly openMenu: (selector: string) => Promise<readonly NativeMenuEntry[]>
}

const cases: Record<string, (fixture: NativeFixture) => Promise<void>> = {
  'copy-link': async ({ choose, electronApp, expect, openMenu, server }): Promise<void> => {
    const entries = await openMenu('a[href="/two"]:not([target])')
    expect(entries.some((item) => item.label === 'Open Link in New Tab')).toBe(true)
    await choose('Copy Link Address')
    await expect.poll(() => electronApp.evaluate(({ clipboard }) => clipboard.readText())).toBe(`${server.url}/two`)
  },
  'copy-selection': async ({ choose, electronApp, expect, guest, openMenu }): Promise<void> => {
    await guest.locator('h1').selectText()
    await openMenu('h1')
    await choose('Copy')
    await expect.poll(() => electronApp.evaluate(({ clipboard }) => clipboard.readText())).toBe('One')
  },
  'devtools-menu': async ({ choose, electronApp, expect, guest, openMenu }): Promise<void> => {
    const entries = await openMenu('h1')
    expect(entries.some((item) => item.label === 'Toggle Developer Tools')).toBe(true)
    await choose('Toggle Developer Tools')
    await expect
      .poll(() =>
        electronApp.evaluate(
          ({ webContents }, url) =>
            webContents
              .getAllWebContents()
              .find((item) => item.getURL() === url)
              ?.isDevToolsOpened(),
          guest.url(),
        ),
      )
      .toBe(true)
    expect(await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.isDevToolsOpened())).toBe(false)
  },
  'devtools-shortcut': async ({ electronApp, expect, guest }): Promise<void> => {
    await electronApp.evaluate(({ webContents }, url) => {
      const target = webContents.getAllWebContents().find((item) => item.getURL() === url)!
      target.focus()
      target.sendInputEvent({ keyCode: 'I', modifiers: ['control', 'shift'], type: 'keyDown' })
      target.sendInputEvent({ keyCode: 'I', modifiers: ['control', 'shift'], type: 'keyUp' })
    }, guest.url())
    await expect
      .poll(() =>
        electronApp.evaluate(
          ({ webContents }, url) =>
            webContents
              .getAllWebContents()
              .find((item) => item.getURL() === url)
              ?.isDevToolsOpened(),
          guest.url(),
        ),
      )
      .toBe(true)
  },
  'editing-capabilities': async ({ expect, guest, openMenu }): Promise<void> => {
    await guest.locator('#draft').fill('editable text')
    await guest.locator('#draft').selectText()
    const entries = await openMenu('#draft')
    for (const label of ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Select All']) expect(entries.some((item) => item.label === label)).toBe(true)
    expect(entries.find((item) => item.label === 'Copy')?.enabled).toBe(true)
  },
  'full-width-menu': async ({ address, browser, choose, expect, openMenu, page, server, tabs }): Promise<void> => {
    await Fixture.toggle(page)
    await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
    const entries = await openMenu('a[href="/two"]:not([target])')
    expect(entries.some((item) => item.label === 'Open Link in New Tab')).toBe(true)
    await choose('Open Link in New Tab')
    await expect(tabs).toHaveCount(2)
    await expect(address).toHaveValue(`${server.url}/one`)
    await expect(browser).toBeVisible()
  },
  'inspect-element': async ({ choose, electronApp, expect, guest, openMenu }): Promise<void> => {
    const entries = await openMenu('h1')
    expect(entries.some((item) => item.label === 'Toggle Developer Tools')).toBe(true)
    const expected = await electronApp.evaluate(() => globalThis['browserContextCoordinates'])
    await choose('Inspect Element')
    await expect.poll(() => electronApp.evaluate(() => globalThis['browserInspection'])).toEqual(expected)
    await expect
      .poll(() =>
        electronApp.evaluate(
          ({ webContents }, url) =>
            webContents
              .getAllWebContents()
              .find((item) => item.getURL() === url)
              ?.isDevToolsOpened(),
          guest.url(),
        ),
      )
      .toBe(true)
    expect(await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.isDevToolsOpened())).toBe(false)
  },
  'inspect-zoomed': async ({ choose, electronApp, expect, guest, openMenu }): Promise<void> => {
    await electronApp.evaluate(({ BrowserWindow, webContents }, url) => {
      BrowserWindow.getAllWindows()[0].webContents.setZoomLevel(1)
      webContents
        .getAllWebContents()
        .find((item) => item.getURL() === url)!
        .setZoomLevel(1)
    }, guest.url())
    const entries = await openMenu('h1')
    expect(entries.some((item) => item.label === 'Toggle Developer Tools')).toBe(true)
    const expected = await electronApp.evaluate(() => globalThis['browserContextCoordinates'])
    await choose('Inspect Element')
    await expect.poll(() => electronApp.evaluate(() => globalThis['browserInspection'])).toEqual(expected)
    await expect
      .poll(() =>
        electronApp.evaluate(
          ({ webContents }, url) =>
            webContents
              .getAllWebContents()
              .find((item) => item.getURL() === url)
              ?.isDevToolsOpened(),
          guest.url(),
        ),
      )
      .toBe(true)
    expect(await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.isDevToolsOpened())).toBe(false)
  },
  'open-link-background': async ({ address, choose, expect, openMenu, server, tabs }): Promise<void> => {
    const entries = await openMenu('a[href="/two"]:not([target])')
    expect(entries.some((item) => item.label === 'Open Link in New Tab')).toBe(true)
    await choose('Open Link in New Tab')
    await expect(tabs).toHaveCount(2)
    await expect(address).toHaveValue(`${server.url}/one`)
  },
  paste: async ({ choose, electronApp, expect, guest, openMenu }): Promise<void> => {
    await guest.locator('#draft').fill('editable text')
    await guest.locator('#draft').selectText()
    await electronApp.evaluate(({ clipboard }) => clipboard.writeText('pasted from native menu'))
    const entries = await openMenu('#draft')
    for (const label of ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Select All']) expect(entries.some((item) => item.label === label)).toBe(true)
    await choose('Paste')
    await expect(guest.locator('#draft')).toHaveValue('pasted from native menu')
  },
}

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const fixture = await Fixture.start(context)
  const { electronApp, expect, guest } = fixture
  await electronApp.evaluate(({ webContents }, url) => {
    const target = webContents.getAllWebContents().find((item) => item.getURL() === url)!
    target.on('context-menu', (_event, params) => {
      Reflect.set(globalThis, 'browserContextCoordinates', { id: target.id, x: params.x, y: params.y })
    })
    const inspect = target.inspectElement.bind(target)
    target.inspectElement = (x: number, y: number): void => {
      Reflect.set(globalThis, 'browserInspection', { id: target.id, x, y })
      inspect(x, y)
    }
  }, guest.url())
  await electronApp.evaluate(({ Menu }) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- retain the original prototype method for restoration
    Reflect.set(globalThis, 'originalBrowserMenuPopup', Menu.prototype.popup)
    Menu.prototype.popup = function (options): void {
      // eslint-disable-next-line unicorn/no-this-outside-of-class -- Electron invokes this replacement with the native Menu receiver
      Reflect.set(globalThis, 'browserTestMenu', this)
      Reflect.set(globalThis, 'browserTestMenuOptions', options)
    }
  })
  const openMenu = async (selector: string): Promise<readonly NativeMenuEntry[]> => {
    await electronApp.evaluate(() => {
      Reflect.set(globalThis, 'browserTestMenu', undefined)
    })
    // eslint-disable-next-line e2e/no-direct-click -- requests a native context menu from the actual embedded page
    await guest.locator(selector).click({ button: 'right' })
    await expect.poll(() => electronApp.evaluate(() => Boolean(globalThis['browserTestMenu']))).toBe(true)
    return electronApp.evaluate(() =>
      globalThis['browserTestMenu'].items.map((item) => ({ enabled: item.enabled, label: item.label, role: item.role })),
    )
  }
  const choose = async (label: string): Promise<void> => {
    await electronApp.evaluate(({ BrowserWindow }, expectedLabel) => {
      const menu = globalThis['browserTestMenu']
      const item = menu.items.find((candidate) => candidate.label === expectedLabel)
      if (!item || !item.enabled) throw new Error(`Native menu item unavailable: ${expectedLabel}`)
      // eslint-disable-next-line e2e/no-direct-click -- executes the captured native MenuItem callback
      item.click(item, BrowserWindow.getAllWindows()[0], {})
      menu.closePopup()
    }, label)
  }
  try {
    if (!cases[scenario]) throw new Error('Unknown browser scenario: ' + scenario)
    await cases[scenario]({ ...fixture, choose, openMenu })
  } finally {
    await electronApp.evaluate(({ BrowserWindow, Menu, webContents }, url) => {
      Menu.prototype.popup = globalThis['originalBrowserMenuPopup']
      BrowserWindow.getAllWindows()[0].webContents.setZoomLevel(0)
      const guest = webContents.getAllWebContents().find((item) => item.getURL() === url)
      guest?.closeDevTools()
      guest?.setZoomLevel(0)
    }, guest.url())
    await fixture.close()
  }
}
