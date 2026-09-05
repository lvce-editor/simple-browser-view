import type { Locator, Page } from '@playwright/test'
import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.tab-reorder'
// TODO enable when the published Electron editor includes this Simple Browser worker version
export const skip = 1

const pages: Readonly<Record<string, string>> = {
  '/one.html': '<!doctype html><html><head><title>One</title></head><body><h1>One</h1></body></html>',
  '/three.html': '<!doctype html><html><head><title>Three</title></head><body><h1>Three</h1></body></html>',
  '/two.html': '<!doctype html><html><head><title>Two</title></head><body><h1>Two</h1></body></html>',
}

const getTabTitles = async (tabs: Locator): Promise<readonly string[]> => {
  return tabs.locator('.TabTitle').allTextContents()
}

const dragBefore = async (page: Page, source: Locator, target: Locator): Promise<void> => {
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) {
    throw new Error('Simple Browser tabs must be visible before dragging')
  }
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(targetBox.x + 1, targetBox.y + targetBox.height / 2, { steps: 10 })
}

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start((request, response) => {
    const body = pages[request.url || '']
    if (!body) {
      response.writeHead(404)
      response.end()
      return
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(body)
  })
  const oneUrl = `${server.url}/one.html`
  const twoUrl = `${server.url}/two.html`
  const threeUrl = `${server.url}/three.html`
  const tabs = page.locator('.SimpleBrowser .MainTab')
  const newTabButton = page.getByRole('button', { exact: true, name: 'New Tab' })
  const input = page.locator('.SimpleBrowserHeader input.InputBox')
  try {
    await SimpleBrowser.show(page)
    await SimpleBrowser.openUrl(page, oneUrl)
    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual new-tab control
    await newTabButton.click()
    await SimpleBrowser.openUrl(page, twoUrl)
    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual new-tab control
    await newTabButton.click()
    await SimpleBrowser.openUrl(page, threeUrl)
    await expect(tabs).toHaveCount(3)

    const oneTab = tabs.filter({ hasText: 'One' })
    await dragBefore(page, tabs.filter({ hasText: 'Two' }), oneTab)
    await expect(oneTab).toHaveAttribute('style', /box-shadow:.*white/)
    await page.mouse.up()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['Two', 'One', 'Three'])
    await expect(input).toHaveValue(twoUrl)

    await tabs.filter({ hasText: 'Two' }).dragTo(tabs.filter({ hasText: 'Three' }))
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Three', 'Two'])
    await expect(input).toHaveValue(twoUrl)

    const threeTab = tabs.filter({ hasText: 'Three' })
    await dragBefore(page, threeTab, threeTab)
    await page.mouse.up()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Three', 'Two'])

    // eslint-disable-next-line e2e/no-direct-click -- validates close behavior after a reorder
    await tabs.filter({ hasText: 'Three' }).getByRole('button', { name: 'Close Three' }).click()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Two'])
    await expect(input).toHaveValue(twoUrl)

    // eslint-disable-next-line e2e/no-direct-click -- validates that new tabs still append after a reorder
    await newTabButton.click()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Two', 'Simple Browser'])
  } finally {
    await server.close()
  }
}
