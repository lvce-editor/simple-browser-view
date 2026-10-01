import type { Page } from '@playwright/test'
import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

const checkCancelledDrops = async ({ expect, page }: ElectronTestContext, fixture: Fixture.BrowserFixture, moved: Page): Promise<void> => {
  const tabBox = await fixture.tabs.nth(1).boundingBox()
  if (!tabBox) throw new Error('Missing tab')
  for (const cancel of [true, false]) {
    await page.mouse.move(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(200, 650, { steps: 15 })
    await page.mouse.move(200, 650)
    await expect(page.locator('.BrowserBottomLeftDropTarget')).toBeVisible()
    if (cancel) await page.keyboard.press('Escape')
    else await page.mouse.move(200, 150, { steps: 10 })
    await page.mouse.up()
    await expect(page.locator('.BrowserBottomLeftDropTarget')).toHaveCount(0)
    await expect(fixture.tabs).toHaveCount(2)
    await expect(page.locator('.BrowserLeftColumn')).toHaveCount(0)
    await expect(moved.locator('#draft')).toHaveValue('preserved draft')
  }
}

export const run = async ({ electronApp, expect, page }: ElectronTestContext, single = false): Promise<void> => {
  const fixture = await Fixture.start({ electronApp, expect, page }, {}, {}, 'preview')
  try {
    const moved = single ? fixture.guest : await fixture.newTab('/two')
    await moved.locator('#draft').fill('preserved draft')
    const token = await moved.evaluate(() => (globalThis as any).documentToken)
    if (!single) await checkCancelledDrops({ electronApp, expect, page }, fixture, moved)
    const source = await fixture.tabs.nth(single ? 0 : 1).boundingBox()
    if (!source) throw new Error('Missing source tab bounds')
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
    await page.mouse.down()
    await page.mouse.move(source.x + source.width / 2 + 15, source.y + source.height / 2, { steps: 5 })
    await page.mouse.move(200, 650, { steps: 10 })
    await page.mouse.move(200, 650)
    const target = page.locator('.BrowserBottomLeftDropTarget')
    await expect(target).toBeVisible()
    const overlay = await target.boundingBox()
    if (!overlay) throw new Error('Missing lower-left drop target')
    const x = overlay.x + overlay.width / 2
    const y = overlay.y + overlay.height / 2
    await page.mouse.move(x, y, { steps: 10 })
    await page.mouse.move(x, y)
    await page.mouse.up()
    const bottom = page.locator('.BrowserLeftColumn .SimpleBrowser')
    const right = page.locator('.WorkbenchBody > .PreviewArea .SimpleBrowser')
    await expect(bottom).toBeVisible()
    await expect(bottom.getByRole('tab')).toHaveCount(1)
    await expect(right.getByRole('tab')).toHaveCount(1)
    await expect(target).toHaveCount(0)
    await expect(bottom.locator('.SimpleBrowserHeader input.InputBox')).toHaveValue(`${fixture.server.url}/${single ? 'one' : 'two'}`)
    await expect(right.locator('.SimpleBrowserHeader input.InputBox')).toHaveValue(single ? '' : `${fixture.server.url}/one`)
    await page.screenshot({ path: `.test-with-playwright/artifacts/bottom-left-${single ? 'single' : 'multiple'}.png` })
    const bounds = await bottom.boundingBox()
    expect(bounds).toEqual(overlay)
    await expect(moved.locator('#draft')).toHaveValue('preserved draft')
    expect(await moved.evaluate(() => (globalThis as any).documentToken)).toBe(token)
    await moved.evaluate(() => {
      document.title = 'Moved page'
    })
    await expect(bottom.getByRole('tab')).toContainText('Moved page')
    await expect(right.getByRole('tab')).toContainText(single ? 'New Tab' : 'One')
    await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1000, 750))
    await expect
      .poll(async () => {
        const box = await bottom.boundingBox()
        return box?.width
      })
      .toBeLessThan(overlay.width)
    const resized = await bottom.boundingBox()
    expect(resized).not.toBeNull()
    const nativeBounds = await moved.evaluate(() => ({ height: innerHeight, width: innerWidth }))
    expect(nativeBounds.width).toBe(Math.round(resized!.width))
    expect(nativeBounds.height).toBe(Math.round(resized!.height - 65))
    if (!single) {
      await fixture.guest.locator('#draft').fill('right remains usable')
      await expect(fixture.guest.locator('#draft')).toHaveValue('right remains usable')
    }
    const address = bottom.locator('.SimpleBrowserHeader input.InputBox')
    await Fixture.pressControl(address)
    await address.fill(`${fixture.server.url}/three`)
    await address.press('Enter')
    await expect(bottom.getByRole('tab')).toContainText('Three')
    await expect(right.getByRole('tab')).toContainText(single ? 'New Tab' : 'One')
    await Fixture.pressControl(page.locator('.SecondaryPreviewCloseButton'))
    await expect(bottom).toHaveCount(0)
    await expect(right).toBeVisible()
    await expect.poll(() => moved.isClosed()).toBe(true)
  } finally {
    await fixture.close()
  }
}
