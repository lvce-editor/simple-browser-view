import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-403-html'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: '<!doctype html><html><body><h1>Forbidden</h1><p>You cannot access this page.</p></body></html>',
    expectedText: 'ForbiddenYou cannot access this page.',
    headers: { 'content-type': 'text/html; charset=utf-8' },
    statusCode: 403,
  })
}
