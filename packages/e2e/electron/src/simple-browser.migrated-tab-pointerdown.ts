import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

export const name = 'simple-browser.migrated-tab-pointerdown'

export const test = async ({ page, expect, electronApp }: ElectronTestContext): Promise<void> => {
  const fixture = await Fixture.start({ page, expect, electronApp }, { 'simpleBrowser.tabs.enabled': true })
  try {
    await Fixture.pressControl(page.getByRole('button', { exact: true, name: 'New Tab' }))

    const firstTab = page.locator('.SimpleBrowserTab').nth(0)
    const secondTab = page.locator('.SimpleBrowserTab').nth(1)
    await expect(secondTab).toHaveAttribute('aria-selected', 'true')

    // Pressing the close button on a background tab must not activate it.
    await firstTab.locator('.SimpleBrowserTabClose').dispatchEvent('pointerdown', { bubbles: true, button: 0 })
    await expect(secondTab).toHaveAttribute('aria-selected', 'true')

    // Check selection before dispatching pointerup or click.
    await firstTab.locator('.SimpleBrowserTabTitle').dispatchEvent('pointerdown', { bubbles: true, button: 0 })
    await expect(firstTab).toHaveAttribute('aria-selected', 'true')
    await expect(secondTab).toHaveAttribute('aria-selected', 'false')
  } finally {
    await fixture.close()
  }
}
