import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-451-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'Unavailable For Legal Reasons',
    expectedText: 'Unavailable For Legal Reasons',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 451,
    statusMessage: 'Unavailable For Legal Reasons',
  })
}
