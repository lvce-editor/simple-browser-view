import { root, fixtureUrl } from './fixture.mjs'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The OS keyring and all application state belong to this scenario, including restarts.
if (!process.env.PASSWORD_TEST_PROFILE) {
  const profile = await mkdtemp(join(tmpdir(), 'lvce-browser-passwords-'))
  try {
    const env = { ...process.env, PASSWORD_TEST_PROFILE: profile }
    for (const key of ['CONFIG', 'DATA', 'STATE', 'CACHE']) {
      env[`XDG_${key}_HOME`] = join(profile, key.toLowerCase())
      await mkdir(env[`XDG_${key}_HOME`], { recursive: true })
    }
    const result = spawnSync('dbus-run-session', ['--', process.execPath, import.meta.filename], { env, stdio: 'inherit', timeout: 180000 })
    if (result.error) throw result.error
    assert.equal(result.status, 0)
  } finally {
    await rm(profile, { recursive: true, force: true })
  }
} else {
  const profile = process.env.PASSWORD_TEST_PROFILE
  const keyring = spawnSync('gnome-keyring-daemon', ['--unlock', '--components=secrets'], {
    input: 'isolated-scenario-keyring',
    stdio: ['pipe', 'ignore', 'inherit'],
  })
  assert.equal(keyring.status, 0)
  const requireTests = createRequire(join(root, 'packages/extension-host-worker-tests/package.json'))
  const requireBuild = createRequire(join(root, 'packages/build/package.json'))
  const { _electron } = requireTests('playwright')
  const { expect } = requireTests('@playwright/test')
  const { build } = requireBuild('esbuild')
  const { parseKeyBindingString } = await import(
    new URL('packages/renderer-worker/src/parts/ParseKeyBindingString/ParseKeyBindingString.js', fixtureUrl)
  )
  await mkdir(join(profile, 'config/lvce-oss'), { recursive: true })
  await writeFile(
    join(profile, 'config/lvce-oss/settings.json'),
    JSON.stringify({ 'simpleBrowser.tabs.enabled': true, 'simpleBrowser.nativeContextMenu': false }),
  )
  await writeFile(
    join(profile, 'config/lvce-oss/keybindings.json'),
    JSON.stringify([{ source: 'User', key: parseKeyBindingString('Ctrl+Alt+1'), command: 'Main.openUri', args: ['simple-browser://'] }]),
  )
  const rendererPath = join(root, 'packages/renderer-worker/node_modules/@lvce-editor/renderer-process/dist/rendererProcessMain.js')
  const original = await readFile(rendererPath, 'utf8')
  const bundleUrl = '/packages/renderer-worker/dist/passwordTestMain.js'
  await build({
    entryPoints: [join(root, 'packages/renderer-worker/src/rendererWorkerMain.ts')],
    outfile: join(root, bundleUrl),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    external: ['node:*', '/static/*', 'electron'],
    logLevel: 'error',
  })
  let app
  let page
  const closeApp = async () => {
    if (!app) return
    const closing = app
    app = undefined
    const timer = setTimeout(() => closing.process().kill('SIGKILL'), 5000)
    try {
      await closing.close()
    } finally {
      clearTimeout(timer)
    }
  }
  const url = 'https://password-test.invalid/login'
  const launch = async (insecure = false) => {
    const env = {
      ...process.env,
      DEV: '1',
      LVCE_ROOT: root,
      LVCE_SHARED_PROCESS_PATH: join(root, 'packages/shared-process/src/sharedProcessMain.ts'),
    }
    delete env.ELECTRON_RUN_AS_NODE
    app = await _electron.launch({
      executablePath: join(root, 'packages/main-process/node_modules/electron/dist/electron'),
      args: [
        '--no-sandbox',
        '--disable-http-cache',
        `--password-store=${insecure ? 'basic' : 'gnome-libsecret'}`,
        '--user-data-dir=' + join(profile, 'chromium'),
        '.',
        profile,
      ],
      cwd: join(root, 'packages/main-process'),
      env,
      timeout: 60000,
    })
    console.log('Electron launched')
    const actual = await app.evaluate(({ app, safeStorage }) => ({
      config: process.env.XDG_CONFIG_HOME,
      userData: app.getPath('userData'),
      backend: safeStorage.getSelectedStorageBackend(),
    }))
    assert.equal(actual.config, join(profile, 'config'))
    assert.ok(actual.userData.startsWith(profile))
    assert.equal(actual.backend, insecure ? 'basic_text' : 'gnome_libsecret')
    page = await app.firstWindow()
    await expect(page.locator('#Workbench')).toBeVisible({ timeout: 60000 })
    console.log('Workbench ready')
    await expect(page.getByRole('tree', { name: 'Files Explorer' })).toBeVisible({ timeout: 60000 })
    await app.evaluate(({ session, dialog, Menu }) => {
      session
        .fromPartition('persist:browserView')
        .protocol.handle(
          'https',
          () =>
            new Response(
              '<!doctype html><title>Password fixture</title><form><label>Username<input id="username" autocomplete="username"></label><label>Password<input id="password" type="password"></label></form>',
              { headers: { 'content-type': 'text/html' } },
            ),
        )
      // Drive native UI responses deterministically. The real toolbar, RPC, origin checks,
      // isolated-world DOM access, encryption and disk storage remain in the application.
      globalThis.passwordTest = { dialogs: [], menus: [], response: 0, account: 'alice' }
      dialog.showMessageBox = async (_window, options) => {
        globalThis.passwordTest.dialogs.push({ detail: options.detail, buttons: options.buttons })
        return { response: globalThis.passwordTest.response, checkboxChecked: false }
      }
      Menu.buildFromTemplate = (entries) => ({
        closePopup: () => {},
        popup: ({ callback }) => {
          globalThis.passwordTest.menus.push(entries.map((entry) => entry.label))
          const selected = entries.find((entry) => entry.label.includes(globalThis.passwordTest.account))
          selected?.click()
          callback()
        },
      })
    })
    await page.keyboard.press('Control+Alt+1')
    console.log('Browser command sent')
    const address = page.locator('[name="simple-browser-address"]')
    await expect(address).toBeVisible()
    console.log('Browser address ready')
    await expect(page.locator('.SimpleBrowser .MaskIconRefresh')).toBeVisible()
    await address.fill(url)
    await address.evaluate((input) => input.form.requestSubmit())
    await expect(page.locator('.SimpleBrowserTabSelected')).toHaveAttribute('aria-label', 'Password fixture')
    await expect(page.locator('.SimpleBrowser .MaskIconRefresh')).toBeVisible()
  }
  const guest = (code) =>
    app.evaluate(
      ({ webContents }, { url, code }) =>
        webContents
          .getAllWebContents()
          .find((contents) => contents.getURL() === url)
          .executeJavaScript(code),
      { url, code },
    )
  const action = async (label) => {
    await page.locator('.SimpleBrowserMenuButton').click()
    const item = page.locator('#Menu-0 .MenuItem').filter({ hasText: new RegExp(`^${label}$`) })
    await expect(item).toBeVisible()
    await item.click()
    await expect(page.locator('#Menu-0')).toBeHidden()
  }
  const configure = (response = 1, account = 'alice') =>
    app.evaluate((_electron, values) => Object.assign(globalThis.passwordTest, values), { response, account })
  const dialogCount = () => app.evaluate(() => globalThis.passwordTest.dialogs.length)
  const vaultPath = join(profile, 'config/lvce-oss/website-passwords.json')
  const vault = async () => {
    try {
      return JSON.parse(await readFile(vaultPath, 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') return undefined
      throw error
    }
  }
  const setFields = (username, password) =>
    guest(
      `document.querySelector('#username').value=${JSON.stringify(username)};document.querySelector('#password').value=${JSON.stringify(password)}`,
    )
  try {
    await writeFile(rendererPath, original.replace('/packages/renderer-worker/src/rendererWorkerMain.ts', bundleUrl))
    await launch()
    await setFields('alice', 'synthetic-one')
    await action('Save Password')
    await expect.poll(dialogCount).toBe(1)
    await assert.rejects(readFile(vaultPath), { code: 'ENOENT' })
    await configure()
    await action('Save Password')
    await expect.poll(vault).toHaveProperty('version', 1)
    const first = await readFile(vaultPath, 'utf8')
    assert.equal(first.includes('synthetic-one'), false)
    assert.equal(first.includes('alice'), false)
    await setFields('bob', 'synthetic-two')
    await action('Save Password')
    await expect.poll(async () => (await readFile(vaultPath, 'utf8')) !== first).toBe(true)
    await closeApp()
    await launch()
    await configure(1, 'bob')
    await action('Fill Password')
    await expect
      .poll(() => guest(`[document.querySelector('#username').value,document.querySelector('#password').value]`))
      .toEqual(['bob', 'synthetic-two'])
    await guest(`document.querySelector('#username').remove();document.querySelector('#password').value=''`)
    await configure(1, 'alice')
    await action('Fill Password')
    await expect.poll(() => guest(`document.querySelector('#password').value`)).toBe('synthetic-one')
    await guest(`document.querySelector('#password').value='synthetic-updated'`)
    const beforeUpdate = await readFile(vaultPath, 'utf8')
    await action('Save Password')
    await expect.poll(async () => (await readFile(vaultPath, 'utf8')) !== beforeUpdate).toBe(true)
    await guest(`document.querySelector('#password').value=''`)
    await action('Fill Password')
    await expect.poll(() => guest(`document.querySelector('#password').value`)).toBe('synthetic-updated')
    const beforeDelete = await readFile(vaultPath, 'utf8')
    await action('Manage Passwords')
    await expect.poll(async () => (await readFile(vaultPath, 'utf8')) !== beforeDelete).toBe(true)
    await guest(`document.querySelector('#password').value=''`)
    await configure(1, 'bob')
    await action('Fill Password')
    await expect.poll(() => guest(`document.querySelector('#password').value`)).toBe('synthetic-two')
    await closeApp()
    await launch(true)
    await action('Fill Password')
    await expect.poll(() => app.evaluate(() => globalThis.passwordTest.dialogs.at(-1)?.detail)).toContain('OS keyring')
    assert.equal(await guest(`document.querySelector('#password').value`), '')
    console.log('PASS: toolbar save/decline, encrypted restart persistence, multiple accounts, confirmation form, update/delete, unavailable keyring')
  } finally {
    await closeApp()
    await writeFile(rendererPath, original)
  }
}
