import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'
import * as TestServer from './_testServer.ts'

export const name = 'simple-browser.basic-auth'

const username = 'test-user'
const password = ['test', 'password'].join('-')
const credentials = [username, password].join(':')
const expectedAuthorization = `Basic ${Buffer.from(credentials).toString('base64')}`

export const test = async ({ expect, page }: ElectronTestContext): Promise<void> => {
  const server = await TestServer.start((request, response) => {
    if (request.url !== '/private') {
      response.writeHead(404)
      response.end()
      return
    }
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
    await dialog.getByLabel('Username').fill(username)
    const passwordInput = dialog.getByLabel('Password')
    await passwordInput.fill(password)
    await passwordInput.press('Enter')
    await expect(dialog).toBeHidden()

    const webContentsPage = await SimpleBrowser.waitForWebContentsPage(page, privateUrl)
    await expect(webContentsPage.getByRole('heading', { name: 'Authenticated content' })).toBeVisible()
  } finally {
    await server.close()
  }
}
