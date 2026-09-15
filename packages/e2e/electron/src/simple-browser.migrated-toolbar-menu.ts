import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

export const name = 'simple-browser.migrated-toolbar-menu'

export const test = async ({ page, expect, electronApp }: ElectronTestContext): Promise<void> => {
  const fixture = await Fixture.start({ page, expect, electronApp }, { 'simpleBrowser.tabs.enabled': true })
  try {
    const menuButton = page.locator('.SimpleBrowserMenuButton')
    await expect(menuButton).toHaveAttribute('aria-label', 'Customize and control Simple Browser')
    await Fixture.pressControl(menuButton)

    const menu = page.locator('#Menu-0')
    await expect(menu).toBeVisible()
    await expect(menu).toContainText('New Tab')
    await expect(menu).toContainText('Downloads')
    await expect(menu).toContainText('Zoom In')
    await expect(menu).toContainText('Zoom Out')
    await expect(menu).toContainText('Reset Zoom')
    await expect(menu).toContainText('Toggle Developer Tools')

    await Fixture.pressControl(page.locator('#Menu-0 .MenuItem').filter({ hasText: 'New Tab' }))
    await expect(page.locator('.SimpleBrowserTab')).toHaveCount(2)

    await Fixture.pressControl(menuButton)
    await Fixture.pressControl(page.locator('#Menu-0 .MenuItem').filter({ hasText: 'Close Tab' }))
    await expect(page.locator('.SimpleBrowserTab')).toHaveCount(1)
  } finally {
    await fixture.close()
  }
}
