import type { ElectronApplication, Locator, Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export interface BrowserFixture extends ElectronTestContext {
  readonly address: Locator
  readonly browser: Locator
  readonly close: () => Promise<void>
  readonly guest: Page
  readonly newTab: (path?: string) => Promise<Page>
  readonly requests: string[]
  readonly server: TestServer.TestServer
  readonly suggestions: Locator
  readonly tabs: Locator
}

export const pressControl = async (locator: Locator): Promise<void> => {
  // eslint-disable-next-line e2e/no-direct-click -- exercises real browser controls and page content
  await locator.click()
}

export const command = async (page: Page, label: string): Promise<void> => {
  await page.bringToFront()
  await page.keyboard.press('Escape')
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P')
  const picker = page.locator('.QuickPick')
  await picker.locator('input').fill(`>${label}`)
  await pressControl(picker.getByRole('option', { exact: true, name: label }))
  await picker.waitFor({ state: 'hidden' })
}

export const settings = async (electronApp: ElectronApplication, values: Readonly<Record<string, unknown>>): Promise<void> => {
  const profile = process.env.SIMPLE_BROWSER_TEST_PROFILE
  if (!profile) throw new Error('Run Electron tests using npm run e2e:electron to isolate configuration')
  const configHome = await electronApp.evaluate(() => process.env.XDG_CONFIG_HOME)
  if (!configHome || configHome === process.env.XDG_CONFIG_HOME) {
    throw new Error('Expected the test launcher to isolate the Electron configuration directory')
  }
  for (const name of ['lvce', 'lvce-oss']) {
    const directory = join(configHome, name)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'settings.json'), JSON.stringify(values))
  }
}

export const reset = async ({ electronApp, page }: ElectronTestContext, preferences: Readonly<Record<string, unknown>> = {}): Promise<void> => {
  await settings(electronApp, preferences)
  await electronApp.evaluate(({ BrowserWindow, WebContentsView }) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.webContents.closeDevTools()
    window.webContents.setZoomLevel(0)
    for (const view of window.contentView.children) {
      if (view instanceof WebContentsView && view.webContents !== window.webContents) view.webContents.close()
    }
    window.setSize(1200, 850)
    window.focus()
  })
  await page.evaluate(() => globalThis.localStorage.clear())
  await page.reload()
  await page.locator('.Workbench').waitFor({ state: 'visible' })
  await page.locator('.StatusBar').waitFor({ state: 'visible' })
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready
  })
}

export const start = async (
  context: ElectronTestContext,
  preferences: Readonly<Record<string, unknown>> = {},
  storage: Readonly<Record<string, string>> = {},
): Promise<BrowserFixture> => {
  const artifactDirectory = join(process.cwd(), '.test-with-playwright', 'artifacts')
  await mkdir(artifactDirectory, { recursive: true })
  await context.page.context().tracing.start({ screenshots: true, snapshots: true, sources: true })
  await reset(context, preferences)
  const requests: string[] = []
  const server = await TestServer.start((request, response) => {
    const path = request.url || '/'
    requests.push(path)
    if (path === '/picture.png') {
      response.writeHead(200, { 'content-type': 'image/png' })
      response.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+afooAAAAASUVORK5CYII=', 'base64'))
      return
    }
    const title = ['/two', '/three'].includes(path.split('?', 1)[0]) ? { '/three': 'Three', '/two': 'Two' }[path.split('?', 1)[0]] : 'One'
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(
      `<!doctype html><html><head><title>${title}</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='red'/%3E%3C/svg%3E"></head><body style="margin:20px"><h1>${title}</h1><img id="picture" src="/picture.png" width="24" height="24"><input id="draft" aria-label="Draft"><textarea aria-label="Notes"></textarea><a href="/two">Next page</a><a href="/two" target="_blank">Background link</a><a href="#section">Section link</a><button id="push" onclick="history.pushState({},'', '/pushed')">Push state</button><div style="height:2000px"></div><h2 id="section">Section</h2><script>window.documentToken=crypto.randomUUID()</script></body></html>`,
    )
  })
  await context.page.evaluate((values) => {
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value)
  }, storage)
  await SimpleBrowser.show(context.page)
  const guest = await SimpleBrowser.openUrl(context.page, `${server.url}/one`)
  const browser = context.page.locator('.SimpleBrowser').last()
  return {
    ...context,
    address: browser.locator('.SimpleBrowserHeader input.InputBox'),
    browser,
    close: async (): Promise<void> => {
      await context.page.context().tracing.stop({ path: join(artifactDirectory, `${process.env.SIMPLE_BROWSER_TEST_NAME || 'browser'}.zip`) })
      await server.close()
    },
    guest,
    newTab: async (path = '/two'): Promise<Page> => {
      const count = await browser.getByRole('tab').count()
      await pressControl(browser.getByRole('button', { exact: true, name: 'New Tab' }))
      await context.expect(browser.getByRole('tab')).toHaveCount(count + 1)
      await context.expect(browser.locator('.SimpleBrowserHeader input.InputBox')).toBeFocused()
      await context.expect(browser.locator('.SimpleBrowserHeader input.InputBox')).toHaveValue('')
      return SimpleBrowser.openUrl(context.page, `${server.url}${path}`)
    },
    requests,
    server,
    suggestions: browser.locator('.SimpleBrowserSuggestion'),
    tabs: browser.getByRole('tab'),
  }
}

export const toggle = async (page: Page): Promise<void> => {
  const wasExpanded = (await page.locator('.BrowserFullWidth').count()) > 0
  await pressControl(page.locator('.SimpleBrowserFullWidthButton').last())
  await page.waitForFunction((previous) => Boolean(document.querySelector('.BrowserFullWidth')) !== previous, wasExpanded)
}

export const tapControl = async (page: Page): Promise<void> => {
  await page.keyboard.down('ControlLeft')
  await page.keyboard.up('ControlLeft')
}

export const doubleControl = async (page: Page): Promise<void> => {
  await tapControl(page)
  await tapControl(page)
}

export const tabMenu = async (page: Page, tab: Locator, label: string): Promise<void> => {
  // eslint-disable-next-line e2e/no-direct-click -- opens the actual tab context menu
  await tab.click({ button: 'right' })
  await pressControl(page.getByRole('menuitem', { exact: true, name: label }))
}

export const gesture = async ({ electronApp }: Pick<ElectronTestContext, 'electronApp'>, url?: string): Promise<void> => {
  await electronApp.evaluate(({ BrowserWindow, webContents }, targetUrl) => {
    const window = BrowserWindow.getAllWindows()[0]
    if (!window.isFocused()) window.focus()
    const target = targetUrl ? webContents.getAllWebContents().find((item) => item.getURL() === targetUrl)! : window.webContents
    if (!target.isFocused()) target.focus()
    for (const type of ['keyDown', 'keyUp', 'keyDown', 'keyUp'] as const) target.sendInputEvent({ keyCode: 'Control', type })
  }, url)
}
