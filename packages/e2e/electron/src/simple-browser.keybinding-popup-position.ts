import type { ElectronTestContext } from './_responseTest.ts'

export const name = 'simple-browser.keybinding-popup-position'

const getCenter = async (locator: ReturnType<ElectronTestContext['page']['locator']>): Promise<number> => {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Expected keybinding popup bounds')
  return box.x + box.width / 2
}

const getIdeCenter = async (page: ElectronTestContext['page']): Promise<number> => {
  const workbench = await page.locator('#Workbench').boundingBox()
  const preview = await page.locator('.PreviewArea').boundingBox()
  if (!workbench || !preview) throw new Error('Expected workbench and preview bounds')
  return workbench.x + (workbench.width - preview.width) / 2
}

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  page.context().setDefaultTimeout(15_000)
  await page.locator('.Workbench').waitFor({ state: 'visible' })
  await page.locator('.SideBar .Explorer').waitFor({ state: 'visible' })
  await page.bringToFront()

  await page.keyboard.press('Control+Shift+k')
  const keybindings = page.locator('.KeyBindings')
  await expect(keybindings).toBeVisible()
  await page.keyboard.press('Control+Shift+b')
  await expect(page.locator('.SideBar')).toHaveCount(0)
  await page.keyboard.press('Control+Alt+1')
  await expect(page.locator('.PreviewArea .SimpleBrowser')).toBeVisible()

  const popup = page.locator('.Viewlet.DefineKeyBinding')
  const firstKeybinding = keybindings.locator('.TableBody .TableRow').first()
  await firstKeybinding.dblclick()
  await expect(popup).toBeVisible()
  await expect(popup.locator('input')).toBeVisible()
  await expect(popup.locator('input')).toBeFocused()
  await expect.poll(() => getCenter(popup)).toBeCloseTo(await getIdeCenter(page), 0)
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()

  const sash = await page.locator('.SashPreview').boundingBox()
  if (!sash) throw new Error('Expected preview sash bounds')
  await page.mouse.move(sash.x + sash.width / 2, sash.y + sash.height / 2)
  await page.mouse.down()
  await page.mouse.move(sash.x - 120, sash.y + sash.height / 2)
  await page.mouse.up()
  await expect(page.locator('.PreviewArea')).toBeVisible()
  await firstKeybinding.dblclick()
  await expect(popup).toBeVisible()
  await expect.poll(() => getCenter(popup)).toBeCloseTo(await getIdeCenter(page), 0)

  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
  await page.locator('.PreviewCloseButton').click()
  await expect(page.locator('.PreviewArea')).toHaveCount(0)
  await firstKeybinding.dblclick()
  await expect(popup).toBeVisible()
  await expect
    .poll(() => getCenter(popup))
    .toBeCloseTo(
      await page.locator('#Workbench').evaluate((element) => {
        const { x, width } = element.getBoundingClientRect()
        return x + width / 2
      }),
      0,
    )
}
