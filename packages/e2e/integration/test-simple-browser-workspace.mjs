import { fixtureUrl, root } from './fixture.mjs'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const requireTests = createRequire(join(root, 'packages/extension-host-worker-tests/package.json'))
const requireBuild = createRequire(join(root, 'packages/build/package.json'))
const { _electron } = requireTests('playwright')
const { expect } = requireTests('@playwright/test')
const { build } = requireBuild('esbuild')
const profile = await mkdtemp(join(tmpdir(), 'lvce-browser-workspace-'))
const editorFile = join(profile, 'example.txt')
await writeFile(editorFile, 'keep editor selection\nsecond line\n')
await mkdir(join(profile, 'config/lvce-oss'), { recursive: true })
await writeFile(join(profile, 'config/lvce-oss/settings.json'), JSON.stringify({ 'simpleBrowser.suggestions': true }))
const rendererPath = join(root, 'packages/renderer-worker/node_modules/@lvce-editor/renderer-process/dist/rendererProcessMain.js')
const rendererSource = await readFile(rendererPath, 'utf8')
const bundleUrl = '/packages/renderer-worker/dist/browserWorkspaceTestMain.js'
await build({
  entryPoints: [join(root, 'packages/renderer-worker/src/rendererWorkerMain.ts')],
  outfile: join(root, bundleUrl),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  external: ['node:*', '/static/*', 'electron'],
  logLevel: 'error',
  plugins: [
    {
      name: 'navigation-diagnosis',
      setup(build) {
        build.onLoad({ filter: /CreateWorkerViewlet\.js$/ }, async ({ path }) => {
          let contents = await readFile(path, 'utf8')
          contents = contents.replace(
            'return await worker.invoke(method.name, ...parameters)',
            'console.log("STARTUP begin", method.name, parameters[0]); const value = await worker.invoke(method.name, ...parameters); console.log("STARTUP end", method.name, parameters[0]); return value',
          )
          return { contents, loader: 'js' }
        })
        build.onLoad({ filter: /TitleBarMenuOverlay\.js$/ }, async ({ path }) => {
          let contents = await readFile(path, 'utf8')
          contents = contents.replace(
            "const componentState = await TitleBarWorker.invoke('TitleBar.getComponentState', state.uid)",
            "console.log('STARTUP reconcile begin',state.uid); const componentState = await TitleBarWorker.invoke('TitleBar.getComponentState', state.uid); console.log('STARTUP reconcile end',state.uid)",
          )
          return { contents, loader: 'js' }
        })

        build.onLoad({ filter: /ViewletSimpleBrowser\.js$/ }, async ({ path }) => {
          let contents = await readFile(path, 'utf8')
          for (const name of ['handleDidNavigate', 'handleWillNavigate']) {
            contents = contents.replace(
              'export const ' + name + ' = ' + (name === 'handleDidNavigate' ? 'async ' : '') + '(state, browserViewId, value) => {',
              (match) =>
                match +
                '\n console.log("NAVIGATION", ' +
                JSON.stringify(name) +
                ', JSON.stringify({browserViewId,value,input:state.inputValue,src:state.iframeSrc,loading:state.isLoading,focus:FocusState.get()}));',
            )
          }
          return { contents, loader: 'js' }
        })
      },
    },
  ],
})
const fixtureImage = await readFile(join(root, 'packages/build/files/icon.png'))
const server = createServer((_request, response) => {
  if (_request.url === '/image.png') {
    response.setHeader('Content-Type', 'image/png')
    response.end(fixtureImage)
    return
  }
  response.setHeader('Content-Type', 'text/html')
  response.end(
    `<!doctype html><title>Workspace article</title><main style="max-width:640px;margin:auto"><h1>Workspace article</h1><input id="draft"><img id="picture" width="24" height="24" src="/image.png"><a href="/second" target="_blank">Second article</a><button id="play" onclick="window.audioContext=new AudioContext();let o=audioContext.createOscillator();let g=audioContext.createGain();g.gain.value=0.001;o.connect(g).connect(audioContext.destination);o.start()">Play audio</button><div style="height:3000px">Article text</div></main><script>window.documentToken=crypto.randomUUID()</script>`,
  )
})
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
const url = `http://127.0.0.1:${server.address().port}/article`
let app
try {
  await writeFile(
    rendererPath,
    "(() => {\n const entries=[]; let dropped=0;\n globalThis.__browserCapture={entries,get dropped(){return dropped}};\n const record=(kind,data)=>{if(entries.length>=12000){dropped++;return}try{let raw=JSON.stringify(data,(_k,v)=>v instanceof MessagePort?'[MessagePort]':v);entries.push({seq:entries.length,time:performance.now(),kind,data:raw.length>50000?{truncated:true,text:raw.slice(0,50000)}:JSON.parse(raw)})}catch{}};\n const add=EventTarget.prototype.addEventListener;const seen=new WeakSet();\n EventTarget.prototype.addEventListener=function(type,fn,options){if(type==='message'&&!seen.has(this)){seen.add(this);add.call(this,type,e=>record('receive',e.data))}return add.call(this,type,fn,options)};\n const post=MessagePort.prototype.postMessage;MessagePort.prototype.postMessage=function(data,...args){record('send',data);return post.call(this,data,...args)};\n for(const type of ['input','submit','keydown','focusin','focusout']) add.call(document,type,e=>{const t=e.target;record(type,{key:e.key,name:t.name,value:t.value,start:t.selectionStart,end:t.selectionEnd,active:document.activeElement?.name,focused:document.hasFocus()})},true);\n add.call(window,'error',e=>record('error',{message:e.message}));add.call(window,'unhandledrejection',e=>record('rejection',{message:String(e.reason)}));\n record('renderer-start',{url:location.href});\n})();\n" +
      rendererSource.replace('/packages/renderer-worker/src/rendererWorkerMain.ts', bundleUrl),
  )
  const env = { ...process.env, DEV: '1', LVCE_ROOT: root, LVCE_SHARED_PROCESS_PATH: join(root, 'packages/shared-process/src/sharedProcessMain.ts') }
  delete env.ELECTRON_RUN_AS_NODE
  for (const key of ['CONFIG', 'DATA', 'STATE', 'CACHE']) env[`XDG_${key}_HOME`] = join(profile, key.toLowerCase())
  const launchOptions = {
    executablePath: join(root, 'packages/main-process/node_modules/electron/dist/electron'),
    args: ['--no-sandbox', '--disable-http-cache', '--user-data-dir=' + join(profile, 'chromium'), '.', profile],
    cwd: join(root, 'packages/main-process'),
    env,
    timeout: 60000,
  }
  app = await _electron.launch(launchOptions)
  await app.evaluate(({ session, net }) => {
    globalThis.browserSuggestionQueries = []
    globalThis.completedBrowserSuggestionQueries = []
    session.defaultSession.protocol.handle('https', async (request) => {
      if (request.url === 'https://example.com/') {
        return new Response('<title>Example Domain</title>', { headers: { 'Content-Type': 'text/html' } })
      }
      if (!request.url.startsWith('https://suggestqueries.google.com/')) return net.fetch(request.url, { bypassCustomProtocolHandlers: true })
      const query = new URL(request.url).searchParams.get('q')
      globalThis.browserSuggestionQueries.push(query)
      await new Promise((resolve) => setTimeout(resolve, ['slow', 'dismiss'].includes(query) ? 350 : 50))
      globalThis.completedBrowserSuggestionQueries.push(query)
      if (query === 'offline') return new Response('', { status: 503 })
      return new Response(JSON.stringify([query, [query + ' result']]), { headers: { 'Content-Type': 'application/json' } })
    })
  })
  app.process().stderr.on('data', (data) => console.error('ELECTRON STDERR', String(data)))
  const page = await app.firstWindow()
  page.on('console', (message) => {
    if (/^(NAVIGATION|STARTUP)/.test(message.text())) console.log(message.text())
  })
  page.on('pageerror', (error) => console.error('PAGE ERROR', String(error)))
  page.on('requestfailed', (request) => console.error('REQUEST FAILED', request.url(), request.failure()?.errorText))
  page.setDefaultTimeout(15000)
  page.on('console', (message) => {
    if (message.type() === 'error') console.error('APP ERROR', message.text())
  })
  await expect(page.locator('#Workbench')).toBeVisible({ timeout: 15000 })

  const runCommand = async (label) => {
    await page.keyboard.press('Control+Shift+P')
    const input = page.locator('[name="QuickPickInput"]')
    await expect(input).toBeVisible()
    await input.fill(`>${label}`)
    await expect(page.getByRole('option', { name: label, exact: true })).toBeVisible()
    await input.press('Enter')
  }
  await page.getByRole('treeitem', { name: 'example.txt', exact: true }).dblclick()
  await expect(page.locator('[name="editor"]')).toBeAttached()
  await page.locator('[name="editor"]').focus()
  await page.evaluate(() => {
    localStorage.setItem('simple-browser-search-history', JSON.stringify(['known first', 'known second', 'offline local']))
    localStorage.setItem('simple-browser-history', JSON.stringify([{ date: Date.now(), url: 'https://known.example/article' }]))
  })
  await page.keyboard.press('Control+a')
  await page.keyboard.press('Control+c')
  await expect.poll(() => app.evaluate(({ clipboard }) => clipboard.readText())).toContain('second line')
  const selectedEditorText = await app.evaluate(({ clipboard }) => clipboard.readText())
  await runCommand('Simple Browser: Toggle Full Width')
  await expect(page.locator('.BrowserFullWidth')).toBeVisible()
  const address = page.locator('[name="simple-browser-address"]')
  await expect(page.locator('.SimpleBrowserTabSelected')).toHaveAttribute('aria-label', 'Example Domain')
  await expect(address).toHaveValue('https://example.com/')
  await expect(page.locator('.SimpleBrowser .MaskIconRefresh')).toBeVisible()
  await address.click()
  await expect(address).toBeFocused()
  console.log(
    'STAGE navigate',
    await page.evaluate(() => ({
      address: document.querySelector('[name="simple-browser-address"]')?.value,
      history: location.protocol === 'data:' ? null : localStorage.getItem('simple-browser-history'),
    })),
  )
  await address.fill(url)
  await address.press('Enter')
  const guestSnapshot = (targetId) =>
    app.evaluate(
      async ({ webContents }, { targetId, urlPrefix }) => {
        const contents = webContents.getAllWebContents().find((item) => (targetId ? item.id === targetId : item.getURL().startsWith(urlPrefix)))
        if (!contents) return undefined
        return {
          id: contents.id,
          listeners: Object.fromEntries(
            ['before-input-event', 'before-mouse-event', 'focus', 'blur', 'context-menu'].map((name) => [name, contents.listenerCount(name)]),
          ),
          data: await contents.executeJavaScript(
            '({ token: documentToken, draft: document.querySelector("#draft").value, scroll: scrollY, audio: window.audioContext?.state })',
          ),
        }
      },
      { targetId, urlPrefix: url },
    )
  await expect.poll(guestSnapshot).toBeTruthy()
  const focusedGuest = await guestSnapshot()
  if (!focusedGuest) throw new Error('Expected the browser page to remain available before focusing the address')
  const focusedAddress = await address.inputValue()
  // DOM focus alone can be emulated while the native page still owns focus.
  await address.click()
  await expect(address).toBeFocused()
  await app.evaluate(async ({ webContents }, targetId) => {
    const guest = webContents.getAllWebContents().find((item) => item.id === targetId)
    if (!guest) throw new Error(`Expected browser WebContents ${targetId} to remain available while the address is focused`)
    await guest.executeJavaScript("history.pushState({}, '', '/pushed-while-address-focused')")
  }, focusedGuest.id)
  await expect
    .poll(() =>
      app.evaluate(({ webContents }) => webContents.getAllWebContents().some((item) => item.getURL().endsWith('/pushed-while-address-focused'))),
    )
    .toBe(true)
  await expect(address).toBeFocused()
  console.log(
    'STAGE preserved',
    await page.evaluate(() => ({
      address: document.querySelector('[name="simple-browser-address"]')?.value,
      history: location.protocol === 'data:' ? null : localStorage.getItem('simple-browser-history'),
    })),
  )
  await expect(address).toHaveValue(focusedAddress)
  console.log(
    'STAGE navigate',
    await page.evaluate(() => ({
      address: document.querySelector('[name="simple-browser-address"]')?.value,
      history: location.protocol === 'data:' ? null : localStorage.getItem('simple-browser-history'),
    })),
  )
  await address.fill(url)
  await address.press('Enter')
  await expect
    .poll(() =>
      app.evaluate(
        ({ webContents }, { targetId, urlPrefix }) =>
          webContents.getAllWebContents().some((item) => item.id === targetId && item.getURL().startsWith(urlPrefix)),
        { targetId: focusedGuest.id, urlPrefix: url },
      ),
    )
    .toBe(true)
  console.log(
    'STAGE before-draft',
    await page.evaluate(() => ({
      address: document.querySelector('[name="simple-browser-address"]')?.value,
      history: location.protocol === 'data:' ? null : localStorage.getItem('simple-browser-history'),
    })),
  )
  await app.evaluate(async ({ webContents }, targetId) => {
    const guest = webContents.getAllWebContents().find((item) => item.id === targetId)
    await guest.executeJavaScript(
      'document.querySelector("#draft").value="keep this draft";document.querySelector("#play").click();scrollTo(0,300)',
      true,
    )
  }, focusedGuest.id)
  await app.evaluate(({ webContents }, targetId) => {
    const guest = webContents.getAllWebContents().find((item) => item.id === targetId)
    guest.focus()
    guest.sendInputEvent({ type: 'keyDown', keyCode: 'L', modifiers: ['control'] })
    guest.sendInputEvent({ type: 'keyUp', keyCode: 'L', modifiers: ['control'] })
  }, focusedGuest.id)
  await expect(address).toBeFocused()
  await expect.poll(() => address.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([0, url.length])
  console.log(
    'STAGE after-focus',
    await page.evaluate(() => ({
      address: document.querySelector('[name="simple-browser-address"]')?.value,
      history: location.protocol === 'data:' ? null : localStorage.getItem('simple-browser-history'),
    })),
  )
  const cdp = await page.context().newCDPSession(page)
  // Playwright's focus emulation suppresses native WebContentsView blur events.
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false })
  try {
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.focus())
    await address.focus()
    await address.press('Control+a')
    await expect.poll(() => address.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([0, url.length])
    await app.evaluate(({ webContents }, prefix) => {
      webContents
        .getAllWebContents()
        .find((item) => item.getURL().startsWith(prefix))
        .focus()
    }, url)
    await expect.poll(() => address.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([0, 0])
    await expect(address).toHaveValue(url)
    await app.evaluate(({ webContents }, prefix) => {
      const guest = webContents.getAllWebContents().find((item) => item.getURL().startsWith(prefix))
      guest.sendInputEvent({ type: 'keyDown', keyCode: 'L', modifiers: ['control'] })
      guest.sendInputEvent({ type: 'keyUp', keyCode: 'L', modifiers: ['control'] })
    }, url)
    await expect.poll(() => address.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([0, url.length])
  } finally {
    await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true })
    await cdp.detach()
  }
  await address.press('Control+a')
  let typedQuery = ''
  for (const character of 'known') {
    typedQuery += character
    await address.pressSequentially(character)
    await expect(address).toHaveValue(typedQuery)
    await expect.poll(() => address.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([typedQuery.length, typedQuery.length])
    if (typedQuery.length >= 2) await expect(page.locator('.SimpleBrowserSuggestions')).toBeVisible()
  }
  await expect(page.getByRole('option', { name: 'known first', exact: true })).toBeVisible()
  await expect(page.locator('.SimpleBrowserSuggestionSelected')).toHaveCount(0)
  await address.press('ArrowDown')
  await expect(page.locator('.SimpleBrowserSuggestionSelected')).toHaveText('known first')
  await expect(page.getByRole('option', { name: 'known result', exact: true })).toBeVisible()
  await expect(page.locator('.SimpleBrowserSuggestionSelected')).toHaveText('known first')
  await address.press('Escape')
  await expect(page.locator('.SimpleBrowserSuggestions')).toHaveCount(0)
  await expect(address).toHaveValue('known')
  await address.fill('slow')
  await expect.poll(() => app.evaluate(() => globalThis.browserSuggestionQueries.includes('slow'))).toBe(true)
  await address.fill('fast')
  await expect(page.getByRole('option', { name: 'fast result', exact: true })).toBeVisible()
  await expect.poll(() => app.evaluate(() => globalThis.completedBrowserSuggestionQueries.includes('slow'))).toBe(true)
  await expect(page.getByRole('option', { name: 'fast result', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'slow result', exact: true })).toHaveCount(0)
  await address.fill('dismiss')
  await expect.poll(() => app.evaluate(() => globalThis.browserSuggestionQueries.includes('dismiss'))).toBe(true)
  await address.press('Escape')
  await expect.poll(() => app.evaluate(() => globalThis.completedBrowserSuggestionQueries.includes('dismiss'))).toBe(true)
  await expect(page.locator('.SimpleBrowserSuggestions')).toHaveCount(0)
  await address.fill('offline')
  await expect.poll(() => app.evaluate(() => globalThis.completedBrowserSuggestionQueries.includes('offline'))).toBe(true)
  await expect(page.getByRole('option', { name: 'offline local', exact: true })).toBeVisible()
  await address.press('Escape')
  await address.fill('known.example')
  await expect(page.getByRole('option', { name: 'https://known.example/article', exact: true })).toBeVisible()
  await address.press('Escape')
  await address.fill(url)
  await address.press('Escape')
  const tokenBeforeMouseNavigation = (await guestSnapshot(focusedGuest.id)).data.token
  await address.fill(url.slice(0, -3))
  await page.getByRole('option', { name: url, exact: true }).click()
  await expect(page.locator('.SimpleBrowserSuggestions')).toHaveCount(0)
  await expect.poll(async () => (await guestSnapshot(focusedGuest.id)).data.token).not.toBe(tokenBeforeMouseNavigation)
  await app.evaluate(async ({ webContents }, targetId) => {
    await webContents
      .getAllWebContents()
      .find((item) => item.id === targetId)
      .executeJavaScript('document.querySelector("#draft").value="keep this draft";document.querySelector("#play").click();scrollTo(0,300)', true)
  }, focusedGuest.id)
  const before = await guestSnapshot(focusedGuest.id)
  const button = page.locator('.SimpleBrowserFullWidthButton')
  await button.click()
  await expect(page.locator('[name="editor"]')).toBeFocused()
  const sash = await page.locator('.SashPreview').boundingBox()
  await page.mouse.move(sash.x + sash.width / 2, sash.y + sash.height / 2)
  await page.mouse.down()
  await page.mouse.move(sash.x - 100, sash.y + sash.height / 2, { steps: 4 })
  await page.mouse.up()
  await expect.poll(async () => Math.round((await page.locator('.SimpleBrowser').boundingBox()).x)).toBe(Math.round(sash.x - 100))
  const codingBrowserBounds = await page.locator('.SimpleBrowser').boundingBox()
  await button.click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  const timings = []
  for (let index = 0; index < 50; index++) {
    const start = performance.now()
    await button.click()
    await expect(page.locator('.BrowserFullWidth')).toHaveCount(index % 2 === 0 ? 0 : 1)
    timings.push(performance.now() - start)
    if (index % 2 === 0) assert.deepEqual(await page.locator('.SimpleBrowser').boundingBox(), codingBrowserBounds)
  }
  assert.deepEqual(await guestSnapshot(focusedGuest.id), before)
  const dimensions = await page.locator('.SimpleBrowser').boundingBox()
  assert.equal(dimensions.x, 0)
  assert.equal(dimensions.width, await page.evaluate(() => innerWidth))
  const doubleControl = async (guestFocused, targetUrl = url, measure = false) =>
    app.evaluate(
      async ({ BrowserWindow, webContents }, { guestFocused, url, measure }) => {
        const window = BrowserWindow.getAllWindows()[0]
        window.focus()
        const target = guestFocused ? webContents.getAllWebContents().find((item) => item.getURL().startsWith(url)) : window.webContents
        target.focus()
        if (guestFocused) await target.executeJavaScript('document.querySelector("#draft").focus()')
        const settled = measure
          ? new Promise((resolve, reject) => {
              const start = Date.now()
              const timer = setInterval(() => {
                const views = window.contentView.children.filter(
                  (view) => 'webContents' in view && view.getVisible() && view.webContents.getURL().startsWith('http://127.0.0.1:'),
                )
                if (views.length === 1 && views[0].webContents === target && views[0].getBounds().x === 0 && target.isFocused()) {
                  clearInterval(timer)
                  resolve(Date.now() - start)
                } else if (Date.now() - start > 2000) {
                  clearInterval(timer)
                  reject(new Error('Browser bounds and focus did not settle'))
                }
              }, 1)
            })
          : undefined
        for (const type of ['keyDown', 'keyUp', 'keyDown', 'keyUp']) target.sendInputEvent({ type, keyCode: 'Control' })
        return settled
      },
      { guestFocused, url: targetUrl, measure },
    )
  await doubleControl(true)
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
  await expect(page.locator('[name="editor"]')).toBeFocused()
  await app.evaluate(({ clipboard }) => clipboard.clear())
  await page.keyboard.press('Control+c')
  await expect.poll(() => app.evaluate(({ clipboard }) => clipboard.readText())).toBe(selectedEditorText)
  await address.click()
  await doubleControl(true)
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await expect
    .poll(() =>
      app.evaluate(
        ({ webContents }, targetUrl) =>
          webContents
            .getAllWebContents()
            .find((item) => item.getURL().startsWith(targetUrl))
            .isFocused(),
        url,
      ),
    )
    .toBe(true)
  await doubleControl(true)
  await expect(page.locator('[name="editor"]')).toBeFocused()
  await doubleControl(false)
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await button.click()
  await expect(page.locator('[name="editor"]')).toBeFocused()
  await address.click()
  await expect.poll(() => address.evaluate((input) => input.selectionEnd - input.selectionStart)).toBe((await address.inputValue()).length)
  await address.fill('keep this address edit')
  await address.evaluate((input) => input.setSelectionRange(2, 8))
  await doubleControl(false)
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await expect(address).toBeFocused()
  await expect(address).toHaveValue('keep this address edit')
  await expect.poll(() => address.evaluate((input) => [input.selectionStart, input.selectionEnd])).toEqual([2, 8])
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1100, 800))
  await expect.poll(async () => (await page.locator('.SimpleBrowser').boundingBox()).width).toBe(1100)
  await button.click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
  assert.equal((await guestSnapshot(focusedGuest.id)).id, before.id)
  const evidence = join(root, '.tmp/browser-workspace-evidence')
  await mkdir(evidence, { recursive: true })
  await page.screenshot({ path: join(evidence, 'split.png') })
  await button.click()
  await page.screenshot({ path: join(evidence, 'full-width.png') })
  await runCommand('Layout: Toggle Panel')
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
  await expect(page.locator('[name="editor"]')).toBeFocused()
  await runCommand('Simple Browser: Open')
  await expect(page.locator('.SimpleBrowser')).toHaveCount(2)
  const mainBrowser = page.locator('.Main .SimpleBrowser')
  await mainBrowser.locator('.SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await page.locator('.SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.SimpleBrowser')).toHaveCount(2)
  const mainUrl = `${url}?main`
  const mainAddress = mainBrowser.locator('[name="simple-browser-address"]')
  await expect(mainBrowser.locator('.SimpleBrowserFullWidthButton')).toHaveAttribute('aria-pressed', 'false')
  await mainAddress.click()
  await mainAddress.fill(mainUrl)
  await mainAddress.press('Enter')
  await expect
    .poll(() => app.evaluate(({ webContents }, targetUrl) => webContents.getAllWebContents().some((item) => item.getURL() === targetUrl), mainUrl))
    .toBe(true)
  const nativePages = () =>
    app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0]
      return window.contentView.children.flatMap((view) =>
        'webContents' in view && view.getVisible() && view.webContents.getURL().startsWith('http://127.0.0.1:') ? [view.webContents.getURL()] : [],
      )
    })
  await expect.poll(nativePages).toHaveLength(2)
  const started = Date.now()
  const nativeGestureFocusMs = await doubleControl(true, mainUrl, true)
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await expect(page.locator('[name="simple-browser-address"]')).toHaveValue(mainUrl)
  await expect.poll(nativePages).toEqual([mainUrl])
  const nativeGestureRoundTripMs = Date.now() - started
  await page.locator('.SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.SimpleBrowser')).toHaveCount(2)
  await expect.poll(nativePages).toHaveLength(2)
  await page.locator('.PreviewArea .SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await expect.poll(nativePages).toEqual([url])
  await page.locator('.SimpleBrowserFullWidthButton').click()
  await expect.poll(nativePages).toHaveLength(2)
  // Capture the real Electron menu so its native entries can be exercised without
  // platform-specific menu keyboard navigation. Right-click still travels through
  // the embedded page, event bridge, worker menu construction and native process.
  await app.evaluate(({ Menu, webContents }) => {
    Menu.prototype.popup = function (options) {
      globalThis.workspaceMenu = { menu: this, options }
    }
  })
  const openPageMenu = async (selector, targetUrl = mainUrl) => {
    await app.evaluate(
      async ({ webContents }, { selector, targetUrl }) => {
        globalThis.workspaceMenu = undefined
        globalThis.workspaceContextEvent = undefined
        const guest = webContents.getAllWebContents().find((item) => item.getURL() === targetUrl)
        guest.focus()
        guest.once('context-menu', (...args) => {
          globalThis.workspaceContextEvent = {
            x: args[1].x,
            y: args[1].y,
            id: guest.id,
            selectionText: args[1].selectionText,
            isEditable: args[1].isEditable,
            types: args.map((item) => typeof item),
          }
        })
        const position = await guest.executeJavaScript(
          `(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.scrollIntoView(); const r = element.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } })()`,
        )
        guest.sendInputEvent({ type: 'mouseDown', button: 'right', clickCount: 1, ...position })
        guest.sendInputEvent({ type: 'mouseUp', button: 'right', clickCount: 1, ...position })
      },
      { selector, targetUrl },
    )
    try {
      await expect.poll(() => app.evaluate(() => Boolean(globalThis.workspaceMenu))).toBe(true)
    } catch (error) {
      console.error('CONTEXT EVENT', await app.evaluate(() => globalThis.workspaceContextEvent))
      throw error
    }
    return app.evaluate(() => globalThis.workspaceMenu.menu.items.map((item) => ({ label: item.label, enabled: item.enabled })))
  }
  const chooseNativeItem = async (label) =>
    app.evaluate(({ BrowserWindow }, label) => {
      const { menu, options } = globalThis.workspaceMenu
      const item = menu.items.find((item) => item.label === label)
      if (!item?.enabled) throw new Error(`Missing or disabled native item: ${label}`)
      item.click(item, BrowserWindow.getAllWindows()[0], {})
      options.callback()
    }, label)
  const labels = await openPageMenu('a')
  assert(labels.some((item) => item.label === 'Open Link in New Tab'))
  assert(labels.some((item) => item.label === 'Toggle Developer Tools'))
  const tabCount = await mainBrowser.locator('.SimpleBrowserTab').count()
  await chooseNativeItem('Open Link in New Tab')
  await expect(mainBrowser.locator('.SimpleBrowserTab')).toHaveCount(tabCount + 1)
  await expect(mainAddress).toHaveValue(mainUrl)
  await expect
    .poll(() =>
      app.evaluate(
        ({ webContents }, targetUrl) =>
          webContents
            .getAllWebContents()
            .find((item) => item.getURL() === targetUrl)
            .isFocused(),
        mainUrl,
      ),
    )
    .toBe(true)
  for (const button of ['left', 'middle']) {
    const existingContents = await app.evaluate(({ webContents }) => webContents.getAllWebContents().map((item) => item.id))
    const previousTabs = await mainBrowser.locator('.SimpleBrowserTab').count()
    await app.evaluate(
      async ({ webContents }, { targetUrl, button }) => {
        const guest = webContents.getAllWebContents().find((item) => item.getURL() === targetUrl)
        guest.focus()
        const position = await guest.executeJavaScript(
          '(() => { const a = document.querySelector("a"); a.scrollIntoView(); const r = a.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } })()',
        )
        const modifiers = button === 'left' ? ['control'] : []
        guest.sendInputEvent({ type: 'mouseDown', button, clickCount: 1, modifiers, ...position })
        guest.sendInputEvent({ type: 'mouseUp', button, clickCount: 1, modifiers, ...position })
      },
      { targetUrl: mainUrl, button },
    )
    await expect(mainBrowser.locator('.SimpleBrowserTab')).toHaveCount(previousTabs + 1)
    await expect
      .poll(() =>
        app.evaluate(
          ({ webContents }, { existingContents, targetUrl }) =>
            webContents.getAllWebContents().some((item) => !existingContents.includes(item.id) && item.getURL() === targetUrl && !item.isLoading()),
          { existingContents, targetUrl: new URL('/second', mainUrl).href },
        ),
      )
      .toBe(true)
    await expect(mainAddress).toHaveValue(mainUrl)
    await expect
      .poll(() =>
        app.evaluate(
          ({ webContents }, targetUrl) =>
            webContents
              .getAllWebContents()
              .find((item) => item.getURL() === targetUrl)
              .isFocused(),
          mainUrl,
        ),
      )
      .toBe(true)
  }
  await app.evaluate(({ clipboard }) => clipboard.writeText('native paste'))
  await openPageMenu('#draft')
  await chooseNativeItem('Paste')
  await expect
    .poll(() =>
      app.evaluate(
        async ({ webContents }, targetUrl) =>
          webContents
            .getAllWebContents()
            .find((item) => item.getURL() === targetUrl)
            .executeJavaScript('document.querySelector("#draft").value'),
        mainUrl,
      ),
    )
    .toBe('native paste')
  await mainBrowser.locator('.SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await openPageMenu('h1')
  await chooseNativeItem('Toggle Developer Tools')
  await expect
    .poll(() =>
      app.evaluate(
        ({ webContents }, targetUrl) =>
          webContents
            .getAllWebContents()
            .find((item) => item.getURL() === targetUrl)
            .isDevToolsOpened(),
        mainUrl,
      ),
    )
    .toBe(true)
  assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.isDevToolsOpened()), false)
  await app.evaluate(
    ({ webContents }, targetUrl) =>
      webContents
        .getAllWebContents()
        .find((item) => item.getURL() === targetUrl)
        .closeDevTools(),
    mainUrl,
  )
  await page.locator('.SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
  const beforeZoomBounds = await mainBrowser.boundingBox()
  await app.evaluate(({ BrowserWindow, webContents }, targetUrl) => {
    BrowserWindow.getAllWindows()[0].webContents.setZoomLevel(1)
    const guest = webContents.getAllWebContents().find((item) => item.getURL() === targetUrl)
    guest.setZoomLevel(1)
    const inspect = guest.inspectElement.bind(guest)
    guest.inspectElement = (x, y) => {
      globalThis.workspaceInspection = { x, y, id: guest.id }
      inspect(x, y)
    }
  }, mainUrl)
  await openPageMenu('h1')
  const expectedInspection = await app.evaluate(() => globalThis.workspaceContextEvent)
  await chooseNativeItem('Inspect Element')
  await expect
    .poll(() => app.evaluate(() => globalThis.workspaceInspection))
    .toEqual({ x: expectedInspection.x, y: expectedInspection.y, id: expectedInspection.id })
  await expect
    .poll(() =>
      app.evaluate(
        ({ webContents }, targetUrl) =>
          webContents
            .getAllWebContents()
            .find((item) => item.getURL() === targetUrl)
            .devToolsWebContents?.isLoadingMainFrame(),
        mainUrl,
      ),
    )
    .toBe(false)
  await app.evaluate(
    ({ webContents }, targetUrl) =>
      webContents
        .getAllWebContents()
        .find((item) => item.getURL() === targetUrl)
        .closeDevTools(),
    mainUrl,
  )
  await app.evaluate(({ BrowserWindow, webContents }, targetUrl) => {
    BrowserWindow.getAllWindows()[0].webContents.setZoomLevel(0)
    webContents
      .getAllWebContents()
      .find((item) => item.getURL() === targetUrl)
      .setZoomLevel(0)
  }, mainUrl)
  await expect.poll(() => mainBrowser.boundingBox()).toEqual(beforeZoomBounds)
  await expect
    .poll(() =>
      app.evaluate(
        ({ BrowserWindow }, targetUrl) =>
          BrowserWindow.getAllWindows()[0]
            .contentView.children.find((view) => view.webContents?.getURL() === targetUrl)
            ?.getBounds().width,
        mainUrl,
      ),
    )
    .toBe(Math.round(beforeZoomBounds.width))
  for (const expanded of [false, true]) {
    if (expanded) {
      await mainBrowser.locator('.SimpleBrowserFullWidthButton').click()
      await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
    }
    const imageEntries = await openPageMenu('#picture')
    assert(imageEntries.some((item) => item.label === 'Open Image in New Tab'))
    await chooseNativeItem('Copy Image')
    await expect
      .poll(() =>
        app.evaluate(async ({ clipboard }) => {
          const items = await clipboard.read()
          const image = items.find((item) => item.types.includes('image/png'))
          return image ? (await image.getType('image/png')).size > 0 : false
        }),
      )
      .toBe(true)
    await app.evaluate(async ({ webContents }, targetUrl) => {
      await webContents
        .getAllWebContents()
        .find((item) => item.getURL() === targetUrl)
        .executeJavaScript(
          '{ const range = document.createRange(); range.selectNodeContents(document.querySelector("h1")); getSelection().removeAllRanges(); getSelection().addRange(range) }',
        )
    }, mainUrl)
    await openPageMenu('h1')
    await chooseNativeItem('Copy')
    await expect.poll(() => app.evaluate(({ clipboard }) => clipboard.readText())).toBe('Workspace article')
  }
  await app.evaluate(({ webContents }, targetUrl) => {
    const guest = webContents.getAllWebContents().find((item) => item.getURL() === targetUrl)
    guest.focus()
    guest.sendInputEvent({ type: 'keyDown', keyCode: 'I', modifiers: ['control', 'shift'] })
    guest.sendInputEvent({ type: 'keyUp', keyCode: 'I', modifiers: ['control', 'shift'] })
  }, mainUrl)
  await expect
    .poll(() =>
      app.evaluate(
        ({ webContents }, targetUrl) =>
          webContents
            .getAllWebContents()
            .find((item) => item.getURL() === targetUrl)
            .isDevToolsOpened(),
        mainUrl,
      ),
    )
    .toBe(true)
  await app.evaluate(
    ({ webContents }, targetUrl) =>
      webContents
        .getAllWebContents()
        .find((item) => item.getURL() === targetUrl)
        .closeDevTools(),
    mainUrl,
  )
  await page.locator('.SimpleBrowserFullWidthButton').click()
  await page.locator('.PanelTab[name="Terminals"]').click()
  const terminalInput = page.locator('.xterm-helper-textarea')
  await expect(terminalInput).toBeFocused()
  const terminal = page.locator('.XtermTerminal')
  await expect(terminal).toContainText(/[$#>%]/)
  const terminalCommand = "printf 'workspace-%s\\n' terminal"
  await page.keyboard.insertText(terminalCommand)
  await expect(terminal).toContainText(terminalCommand)
  await terminalInput.press('Enter')
  await expect(terminal).toContainText('workspace-terminal')
  await terminalInput.evaluate((element) => {
    window.workspaceTerminalInput = element
  })
  await doubleControl(false)
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await doubleControl(true)
  await expect(terminalInput).toBeFocused()
  assert.equal(await terminalInput.evaluate((element) => element === window.workspaceTerminalInput), true)
  await expect(page.locator('.XtermTerminal')).toContainText('workspace-terminal')
  await page.locator('.PreviewArea .SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await runCommand('Layout: Hide Preview')
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
  await expect(terminalInput).toBeFocused()
  await mainBrowser.locator('.SimpleBrowserFullWidthButton').click()
  await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  await page.evaluate(() => {
    localStorage.removeItem('Layout')
    document.dispatchEvent(new Event('pointerleave'))
  })
  await page.waitForFunction(() => localStorage.getItem('Layout'))
  const savedLayout = await page.evaluate(() => JSON.parse(localStorage.getItem('Layout')))
  assert.equal(savedLayout.browserFullWidth, undefined)
  await app.close()
  app = await _electron.launch(launchOptions)
  const restartedPage = await app.firstWindow()
  await expect(restartedPage.locator('#Workbench')).toBeVisible({ timeout: 15000 })
  await expect(restartedPage.locator('.BrowserFullWidth')).toHaveCount(0)
  await expect(restartedPage.locator('.Main')).toBeVisible()
  console.log(
    JSON.stringify({
      switches: 50,
      preserved: before.data,
      nativeGestureRoundTripMs,
      nativeGestureFocusMs,
      maximumAutomationRoundTripMs: Math.max(...timings),
      profile,
    }),
  )
} finally {
  try {
    await mkdir('.diagnostics', { recursive: true })
    for (const [index, window] of ((await app?.windows()) || []).entries()) {
      await writeFile(
        '.diagnostics/workspace-' + index + '.json',
        JSON.stringify(
          await window.evaluate(() => ({
            url: location.href,
            html: document.body.innerHTML,
            capture: globalThis.__browserCapture,
            history: location.protocol === 'data:' ? null : localStorage.getItem('simple-browser-history'),
          })),
        ),
      )
      await window.screenshot({ path: '.diagnostics/workspace-' + index + '.png' })
    }
  } catch (error) {
    console.error('CAPTURE ERROR', String(error))
  }

  await app?.close()
  await writeFile(rendererPath, rendererSource)
  await rm(profile, { recursive: true, force: true })
  await new Promise((resolveClose) => server.close(resolveClose))
}
