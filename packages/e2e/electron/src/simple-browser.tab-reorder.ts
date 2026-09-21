/* eslint-disable unicorn/prefer-await, @typescript-eslint/unbound-method, unicorn/no-this-outside-of-class -- temporary failure diagnostics preserve capture when a target closes */
import type { Locator, Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.tab-reorder'

const pages: Readonly<Record<string, string>> = {
  '/one.html': '<!doctype html><html><head><title>One</title></head><body><h1>One</h1></body></html>',
  '/three.html': '<!doctype html><html><head><title>Three</title></head><body><h1>Three</h1></body></html>',
  '/two.html': '<!doctype html><html><head><title>Two</title></head><body><h1>Two</h1></body></html>',
}

const getTabTitles = async (tabs: Locator): Promise<readonly string[]> => {
  return tabs.locator('.SimpleBrowserTabTitle').allTextContents()
}

const dragTab = async (page: Page, source: Locator, target: Locator, side: 'before' | 'after'): Promise<void> => {
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) {
    throw new Error('Simple Browser tabs must be visible before dragging')
  }
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 10, sourceBox.y + sourceBox.height / 2, { steps: 5 })
  await page.mouse.move(targetBox.x + (side === 'before' ? 2 : targetBox.width - 2), targetBox.y + targetBox.height / 2, { steps: 10 })
  // Chromium starts native dragging during the first move; send a dragover at the final target.
  await page.mouse.move(targetBox.x + (side === 'before' ? 2 : targetBox.width - 2), targetBox.y + targetBox.height / 2)
}

export const test = async ({ electronApp, expect, page }: ElectronTestContext): Promise<void> => {
  const directory = join(process.cwd(), '.test-with-playwright', 'artifacts')
  await mkdir(directory, { recursive: true })
  await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true })
  const errors: string[] = []
  page.on('pageerror', (error) => {
    errors.push(String(error))
  })
  let stage = 'startup'
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
  const tabs = page.locator('.SimpleBrowser .SimpleBrowserTab')
  const newTabButton = page.getByRole('button', { exact: true, name: 'New Tab' })
  const input = page.locator('.SimpleBrowserHeader input.InputBox')
  try {
    await SimpleBrowser.show(page)
    await page.evaluate(() => {
      const { document, HTMLInputElement, performance } = globalThis
      const trace: unknown[] = []
      Object.assign(globalThis, { __tabDragTrace: trace })
      const record = (kind: string): void => {
        const input = globalThis.document.querySelector<HTMLInputElement>('.SimpleBrowserHeader input.InputBox')
        trace.push({
          active: document.activeElement?.getAttribute('name'),
          end: input?.selectionEnd,
          kind,
          stack: new Error('selection observation').stack,
          start: input?.selectionStart,
          time: performance.now(),
          value: input?.value,
        })
      }
      for (const type of ['keydown', 'keyup', 'focusin', 'focusout', 'select', 'selectionchange']) {
        document.addEventListener(type, (event) => record(`${type}:${'key' in event ? event.key : ''}`), { capture: true })
      }
      const { select } = HTMLInputElement.prototype
      HTMLInputElement.prototype.select = function (): void {
        select.call(this)
        record('select()')
      }
      const { setSelectionRange } = HTMLInputElement.prototype
      HTMLInputElement.prototype.setSelectionRange = function (...args: Parameters<HTMLInputElement['setSelectionRange']>): void {
        setSelectionRange.apply(this, args)
        record('setSelectionRange()')
      }
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!
      Object.defineProperty(HTMLInputElement.prototype, 'value', {
        ...descriptor,
        set(value: string): void {
          descriptor.set!.call(this, value)
          record('value=')
        },
      })
    })
    stage = 'navigate one'
    await SimpleBrowser.openUrl(page, oneUrl)
    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual new-tab control
    await newTabButton.click()
    await expect(tabs).toHaveCount(2)
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
    stage = 'navigate two'
    await SimpleBrowser.openUrl(page, twoUrl)
    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual new-tab control
    await newTabButton.click()
    await expect(tabs).toHaveCount(3)
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
    stage = 'navigate three'
    await SimpleBrowser.openUrl(page, threeUrl)
    await expect(tabs).toHaveCount(3)

    stage = 'drag tabs'
    const oneTab = tabs.filter({ hasText: 'One' })
    const twoTab = tabs.filter({ hasText: 'Two' })
    await expect(twoTab).toHaveAttribute('draggable', 'true')
    await dragTab(page, twoTab, oneTab, 'before')
    await expect(oneTab).toHaveClass(/SimpleBrowserTabDropBefore/)
    await page.mouse.up()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['Two', 'One', 'Three'])
    await expect(input).toHaveValue(twoUrl)

    await expect(twoTab).toHaveAttribute('aria-selected', 'true')
    const threeTab = tabs.filter({ hasText: 'Three' })
    await dragTab(page, twoTab, threeTab, 'after')
    await expect(threeTab).toHaveClass(/SimpleBrowserTabDropAfter/)
    await page.mouse.up()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Three', 'Two'])
    await expect(input).toHaveValue(twoUrl)

    await expect(twoTab).toHaveAttribute('aria-selected', 'true')
    await dragTab(page, threeTab, threeTab, 'before')
    await page.mouse.up()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Three', 'Two'])

    await expect(page.locator('.SimpleBrowserTabDropBefore, .SimpleBrowserTabDropAfter')).toHaveCount(0)

    // eslint-disable-next-line e2e/no-direct-click -- validates close behavior after a reorder
    await tabs.filter({ hasText: 'Three' }).getByRole('button', { name: 'Close Three' }).click()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Two'])
    await expect(input).toHaveValue(twoUrl)

    // eslint-disable-next-line e2e/no-direct-click -- validates that new tabs still append after a reorder
    await newTabButton.click()
    await expect.poll(() => getTabTitles(tabs)).toEqual(['One', 'Two', 'New Tab'])
  } finally {
    await writeFile(
      join(directory, 'state.json'),
      JSON.stringify(
        {
          dom: await page
            .evaluate(() => ({
              active: globalThis.document.activeElement?.outerHTML,
              focused: globalThis.document.hasFocus(),
              html: globalThis.document.documentElement.outerHTML,
              selection: ((): { start: number | null; end: number | null; value: string } | null => {
                const input = globalThis.document.querySelector<HTMLInputElement>('.SimpleBrowserHeader input.InputBox')
                return input && { end: input.selectionEnd, start: input.selectionStart, value: input.value }
              })(),
              trace: (globalThis as typeof globalThis & { __tabDragTrace?: unknown[] }).__tabDragTrace,
            }))
            .catch(String),
          errors,
          native: await electronApp
            .evaluate(({ BrowserWindow, webContents }) => ({
              contents: webContents
                .getAllWebContents()
                .map((contents) => ({ focused: contents.isFocused(), id: contents.id, url: contents.getURL() })),
              windows: BrowserWindow.getAllWindows().map((window) => ({ focused: window.isFocused(), visible: window.isVisible() })),
            }))
            .catch(String),
          pages: page
            .context()
            .pages()
            .map((candidate) => candidate.url()),
          stage,
        },
        null,
        2,
      ),
    )
    await page.context().tracing.stop({ path: join(directory, 'tab-drag.zip') })
    await server.close()
  }
}
