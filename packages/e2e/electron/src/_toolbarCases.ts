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
        await choose(page, 'Downloads')
        await expect(page.locator('.Main')).toContainText('Downloads')

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
