import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

const choose = async (page: ElectronTestContext['page'], label: string): Promise<void> => {
  await Fixture.pressControl(page.locator('.SimpleBrowserHeader').getByRole('button', { exact: true, name: 'Customize and control Simple Browser' }))
  await Fixture.pressControl(page.getByRole('menuitem', { exact: true, name: label }))
}

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const fixture = await Fixture.start(context)
  const { electronApp, expect, guest, page, tabs } = fixture
  const zoom = (): Promise<number | undefined> =>
    electronApp.evaluate(
      ({ webContents }, url) =>
        webContents
          .getAllWebContents()
          .find((item) => item.getURL() === url)
          ?.getZoomLevel(),
      guest.url(),
    )
  try {
    switch (scenario) {
      case 'downloads': {
        await electronApp.evaluate(({ shell }) => {
          // eslint-disable-next-line @typescript-eslint/unbound-method -- retain the native method for restoration
          Reflect.set(globalThis, 'originalShowItemInFolder', shell.showItemInFolder)
          shell.showItemInFolder = (path: string): void => {
            Reflect.set(globalThis, 'browserDownloadsPath', path)
          }
        })
        try {
          await choose(page, 'Downloads')
          const expected = process.env.XDG_DOWNLOAD_DIR
          expect(expected).toBeTruthy()
          await expect.poll(() => electronApp.evaluate(() => globalThis['browserDownloadsPath'])).toBe(expected)
        } finally {
          await electronApp.evaluate(({ shell }) => {
            shell.showItemInFolder = globalThis['originalShowItemInFolder']
          })
        }
        break
      }
      case 'history': {
        await choose(page, 'History')
        await expect(page.locator('.Main')).toContainText('History')
        await expect(page.locator('.Main')).toContainText(fixture.server.url)

        break
      }
      case 'mute-tab': {
        await Fixture.tabMenu(page, tabs.first(), 'Mute Tab')
        await expect(tabs.first().getByRole('button', { exact: true, name: 'Unmute tab' })).toBeVisible()
        await expect
          .poll(() =>
            electronApp.evaluate(
              ({ webContents }, url) =>
                webContents
                  .getAllWebContents()
                  .find((item) => item.getURL() === url)
                  ?.isAudioMuted(),
              guest.url(),
            ),
          )
          .toBe(true)
        await Fixture.tabMenu(page, tabs.first(), 'Unmute Tab')
        await expect
          .poll(() =>
            electronApp.evaluate(
              ({ webContents }, url) =>
                webContents
                  .getAllWebContents()
                  .find((item) => item.getURL() === url)
                  ?.isAudioMuted(),
              guest.url(),
            ),
          )
          .toBe(false)

        break
      }
      case 'open-external': {
        await electronApp.evaluate(({ shell }) => {
          // eslint-disable-next-line @typescript-eslint/unbound-method -- retain the native method for restoration
          Reflect.set(globalThis, 'originalOpenExternal', shell.openExternal)
          shell.openExternal = async (url: string): Promise<void> => {
            Reflect.set(globalThis, 'browserExternalUrl', url)
          }
        })
        try {
          await choose(page, 'Open in Default Browser')
          await expect.poll(() => electronApp.evaluate(() => globalThis['browserExternalUrl'])).toBe(`${fixture.server.url}/one`)
        } finally {
          await electronApp.evaluate(({ shell }) => {
            shell.openExternal = globalThis['originalOpenExternal']
          })
        }
        break
      }
      case 'zoom-in': {
        await choose(page, 'Zoom In')
        await expect.poll(zoom).toBe(0.5)

        break
      }
      case 'zoom-out': {
        await choose(page, 'Zoom Out')
        await expect.poll(zoom).toBe(-0.5)

        break
      }
      case 'zoom-reset': {
        await choose(page, 'Zoom In')
        await expect.poll(zoom).toBe(0.5)
        await choose(page, 'Reset Zoom')
        await expect.poll(zoom).toBe(0)

        break
      }
      // No default
    }
  } finally {
    await fixture.close()
  }
}
