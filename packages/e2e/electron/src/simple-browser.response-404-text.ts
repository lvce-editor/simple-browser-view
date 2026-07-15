import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-404-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'The requested page was not found.',
    expectedText: 'The requested page was not found.',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 404,
  })
}
