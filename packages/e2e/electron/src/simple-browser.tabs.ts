import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.tabs'
// TODO enable when the published Electron editor includes this Simple Browser worker version
export const skip = 1

const pages: Readonly<Record<string, string>> = {
  '/github.html': '<!doctype html><html><head><title>GitHub</title></head><body><h1>GitHub</h1></body></html>',
  '/music.html':
    '<!doctype html><html><head><title>Music</title></head><body><h1>Music</h1><a href="/playing.html">Play Song</a></body></html>',
  '/playing.html': '<!doctype html><html><head><title>Now Playing</title></head><body><h1>Now Playing</h1></body></html>',
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
  const musicUrl = `${server.url}/music.html`
  const githubUrl = `${server.url}/github.html`
  const playingUrl = `${server.url}/playing.html`
  const tabs = page.locator('.SimpleBrowser .MainTab')
  const input = page.locator('.SimpleBrowserHeader input.InputBox')
  try {
    await SimpleBrowser.show(page)
    const musicPage = await SimpleBrowser.openUrl(page, musicUrl)
    const firstTab = tabs.nth(0)
    await expect(tabs).toHaveCount(1)
    await expect(firstTab).toContainText('Music')

    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual new-tab control
    await page.getByRole('button', { exact: true, name: 'New Tab' }).click()
    await expect(tabs).toHaveCount(2)
    await SimpleBrowser.openUrl(page, githubUrl)
    const secondTab = tabs.nth(1)
    await expect(secondTab).toContainText('GitHub')

    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual tab selection control
    await firstTab.click()
    await expect(input).toHaveValue(musicUrl)
    await SimpleBrowser.clickLink(musicPage, 'Play Song')
    await musicPage.waitForURL(playingUrl)
    await expect(firstTab).toContainText('Now Playing')

    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual tab selection control
    await secondTab.click()
    await expect(input).toHaveValue(githubUrl)
    // eslint-disable-next-line e2e/no-direct-click -- exercises the actual tab close control
    await secondTab.getByRole('button', { name: 'Close GitHub' }).click()
    await expect(tabs).toHaveCount(1)
    await expect(firstTab).toContainText('Now Playing')
    await expect(input).toHaveValue(playingUrl)
  } finally {
    await server.close()
  }
}
