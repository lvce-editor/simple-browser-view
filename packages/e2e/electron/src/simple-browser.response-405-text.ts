import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-405-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'Method Not Allowed',
    expectedText: 'Method Not Allowed',
    headers: { allow: 'POST', 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 405,
  })
}
