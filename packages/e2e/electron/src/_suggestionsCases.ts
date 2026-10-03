import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
const cases: Record<string, (fixture: Fixture.BrowserFixture) => Promise<void>> = {
  disabled: async ({ address, electronApp, expect, page, suggestions }): Promise<void> => {
    await address.fill('known')
    const quietPeriodEnds = Date.now() + 400
    await expect
      .poll(async () => {
        const queries = await electronApp.evaluate(() => globalThis['suggestionQueries'])
        return queries.length === 0 && Date.now() >= quietPeriodEnds
      })
      .toBe(true)
    await expect(suggestions).toHaveCount(0)
    expect(await electronApp.evaluate(() => globalThis['suggestionQueries'])).toEqual([])
  },
  'dismiss-pending': async ({ address, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('dismiss')
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionQueries'])).toContain('dismiss')
    await address.press('Escape')
    await electronApp.evaluate(() => globalThis['suggestionReleases']['dismiss']())
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionCompletions'])).toContain('dismiss')
    await expect(suggestions).toHaveCount(0)
    await expect(address).toHaveValue('dismiss')
  },
  'escape-keeps-text': async ({ address, expect, suggestions }): Promise<void> => {
    await address.fill('known')
    await expect(suggestions.first()).toBeVisible()
    await address.press('Escape')
    await expect(suggestions).toHaveCount(0)
    await expect(address).toHaveValue('known')
    await expect(address).toBeFocused()
  },
  'explicit-selection': async ({ address, browser, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('known')
    await expect(suggestions.first()).toContainText('known first')
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionQueries'])).toContain('known')
    expect(await electronApp.evaluate(() => globalThis['suggestionCompletions'])).not.toContain('known')
    await electronApp.evaluate(() => globalThis['suggestionReleases']['known']())
    await address.press('ArrowDown')
    const selected = browser.locator('[aria-selected="true"].SimpleBrowserSuggestion')
    await expect(selected).toContainText('known first')
    await expect(suggestions).toContainText(['known first', 'known second', 'https://known.example/article', 'known', 'known result'])
    await expect(selected).toContainText('known first')
  },
  'full-width-dismissal': async ({ address, expect, page, suggestions }): Promise<void> => {
    await address.fill('known')
    await expect(suggestions.first()).toBeVisible()
    await Fixture.toggle(page)
    await expect(suggestions).toHaveCount(0)
    const locator1 = page.locator('.BrowserFullWidth')
    await expect(locator1).toHaveCount(1)
  },
  'local-history': async ({ address, expect, suggestions }): Promise<void> => {
    await address.fill('known')
    await expect(suggestions.first()).toContainText('known first')
  },
  'mouse-selection': async ({ address, expect, suggestions }): Promise<void> => {
    await address.fill('known')
    await expect(suggestions.first()).toContainText('known first')
    await address.fill('https://known.example')
    await Fixture.pressControl(suggestions.filter({ hasText: 'https://known.example/article' }))
    await expect(address).toHaveValue('https://known.example/article')
    await expect(suggestions).toHaveCount(0)
  },
  'provider-failure': async ({ address, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('offline')
    await expect(suggestions.first()).toContainText('offline local')
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionCompletions'])).toContain('offline')
    await expect(suggestions.first()).toContainText('offline local')
    await expect(address).toBeFocused()
  },
  'short-input': async ({ address, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('dismiss')
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionQueries'])).toContain('dismiss')
    await address.fill('d')
    await electronApp.evaluate(() => globalThis['suggestionReleases']['dismiss']())
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionCompletions'])).toContain('dismiss')
    await expect(suggestions).toHaveCount(0)
    await expect(address).toHaveValue('d')
  },
  'superseded-query': async ({ address, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('slow')
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionQueries'])).toContain('slow')
    await address.fill('fast')
    await expect(suggestions).toContainText(['fast', 'fast result'])
    await electronApp.evaluate(() => globalThis['suggestionReleases']['slow']())
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionCompletions'])).toContain('slow')
    await expect(suggestions).toContainText(['fast', 'fast result'])
  },
  'switch-tab-pending': async ({ address, browser, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('dismiss')
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionQueries'])).toContain('dismiss')
    await Fixture.pressControl(browser.getByRole('button', { exact: true, name: 'New Tab' }))
    await electronApp.evaluate(() => globalThis['suggestionReleases']['dismiss']())
    await expect.poll(() => electronApp.evaluate(() => globalThis['suggestionCompletions'])).toContain('dismiss')
    await expect(suggestions).toHaveCount(0)
    await expect(address).toHaveValue('')
  },
  'typed-enter': async ({ address, electronApp, expect, page, suggestions }): Promise<void> => {
    await address.fill('https://known.example')
    await expect(suggestions).toContainText(['https://known.example/article'])
    expect(await electronApp.evaluate(() => globalThis['suggestionQueries'])).toEqual([])
    await address.press('Enter')
    const destination = await SimpleBrowser.waitForWebContentsPage(page, 'https://known.example')
    expect(new URL(destination.url()).pathname).toBe('/')
    await expect(destination.getByRole('heading')).toHaveText('Typed address')
    await expect(address).toHaveValue(/^https:\/\/known\.example\/?$/)
  },
  'url-history': async ({ address, electronApp, expect, suggestions }): Promise<void> => {
    await address.fill('https://known.example')
    await expect(suggestions).toContainText(['https://known.example/article'])
    expect(await electronApp.evaluate(() => globalThis['suggestionQueries'])).toEqual([])
  },
}

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  await context.electronApp.evaluate(({ net, session }, scenario) => {
    Reflect.set(globalThis, 'suggestionQueries', [])
    Reflect.set(globalThis, 'suggestionCompletions', [])
    Reflect.set(globalThis, 'suggestionReleases', {})
    const gatedQueries = scenario === 'explicit-selection' ? ['known'] : ['dismiss', 'slow']
    session.defaultSession.protocol.handle('https', async (request) => {
      const url = new URL(request.url)
      if (url.hostname === 'known.example') return new Response('<h1>Typed address</h1>', { headers: { 'Content-Type': 'text/html' } })
      if (url.hostname !== 'suggestqueries.google.com') return net.fetch(request.url, { bypassCustomProtocolHandlers: true })
      const query = url.searchParams.get('q') || ''
      globalThis['suggestionQueries'].push(query)
      if (gatedQueries.includes(query)) {
        await new Promise<void>((resolve) => {
          globalThis['suggestionReleases'][query] = resolve
        })
      }
      globalThis['suggestionCompletions'].push(query)
      if (query === 'offline') return new Response('', { status: 503 })
      return Response.json([query, [query + ' result']])
    })
  }, scenario)
  const fixture = await Fixture.start(
    context,
    { 'simpleBrowser.suggestions': scenario !== 'disabled' },
    {
      'simple-browser-history': JSON.stringify([{ date: Date.now(), url: 'https://known.example/article' }]),
      'simple-browser-search-history': JSON.stringify(['known first', 'known second', 'offline local']),
    },
  )
  await fixture.guest.route('https://known.example/**', (route) => route.fulfill({ body: '<h1>Typed address</h1>', contentType: 'text/html' }))
  const { electronApp } = fixture
  try {
    if (!cases[scenario]) throw new Error('Unknown browser scenario: ' + scenario)
    await cases[scenario](fixture)
  } finally {
    await electronApp.evaluate(({ session }) => session.defaultSession.protocol.unhandle('https'))
    await fixture.close()
  }
}
