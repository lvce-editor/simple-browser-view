import { mkdir } from 'node:fs/promises'
import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.basic-auth'

const username = 'test-user'
const password = ['test', 'password'].join('-')
const credentials = [username, password].join(':')
const expectedAuthorization = `Basic ${Buffer.from(credentials).toString('base64')}`

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  let stage = 'initial challenge'
  const responses: string[] = []
  await mkdir('.test-with-playwright/artifacts', { recursive: true })
  await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true })
  const server = await TestServer.start((request, response) => {
    if (request.url !== '/private') {
      response.writeHead(404)
      response.end()
      return
    }
    responses.push(request.headers.authorization === expectedAuthorization ? 'accepted' : 'challenged')
    if (request.headers.authorization !== expectedAuthorization) {
      response.writeHead(401, {
        'content-type': 'text/plain; charset=utf-8',
        'www-authenticate': 'Basic realm="Simple Browser Test"',
      })
      response.end('Authentication required')
      return
    }
    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
    })
    response.end('<!doctype html><html><head><link rel="icon" href="data:,"></head><body><h1>Authenticated content</h1></body></html>')
  })
  const privateUrl = `${server.url}/private`
  try {
    await SimpleBrowser.show(page)
    await SimpleBrowser.setUrl(page, privateUrl)

    const dialog = page.getByRole('dialog', { name: 'Sign in to website' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('“Simple Browser Test” requires a username and password.')
    await expect(dialog).toContainText('127.0.0.1')
    const passwordInput = dialog.getByLabel('Password')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(dialog.getByLabel('Username')).toBeFocused()
    await dialog.getByLabel('Username').fill(username)
    await passwordInput.fill('incorrect-password')
    await passwordInput.press('Enter')
    await expect(passwordInput).toHaveValue('')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Username')).toBeFocused()
    stage = 'cancel retry challenge'
    await dialog.getByRole('button', { exact: true, name: 'Cancel' }).press('Enter')
    await expect(dialog).toBeHidden()

    await SimpleBrowser.setUrl(page, privateUrl)
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Username')).toBeFocused()
    await dialog.getByLabel('Username').fill(username)
    stage = 'submit valid credentials'
    await passwordInput.fill(password)
    await passwordInput.press('Enter')
    await expect(dialog).toBeHidden()

    const webContentsPage = await SimpleBrowser.waitForWebContentsPage(page, privateUrl)
    await expect(webContentsPage.getByRole('heading', { name: 'Authenticated content' })).toBeVisible()
  } catch (error) {
    const form = await page.locator('.SimpleBrowserLoginForm').evaluateAll((forms) => forms.map((form) => ({
      focused: globalThis.document.activeElement?.getAttribute('name') || globalThis.document.activeElement?.getAttribute('value'),
      passwordLength: (form.querySelector('[name=password]') as HTMLInputElement)?.value.length,
      requestId: (form as HTMLElement).dataset.requestid,
      usernameLength: (form.querySelector('[name=username]') as HTMLInputElement)?.value.length,
    })))
    throw new Error(JSON.stringify({ form, responses, stage }), { cause: error })
  } finally {
    await page.context().tracing.stop({ path: '.test-with-playwright/artifacts/basic-auth.zip' })
    await server.close()
  }
}
