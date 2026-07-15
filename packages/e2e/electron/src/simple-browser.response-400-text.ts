import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-400-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'The request was invalid.',
    expectedText: 'The request was invalid.',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 400,
  })
}
