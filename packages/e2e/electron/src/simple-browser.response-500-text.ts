import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-500-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'Internal Server Error',
    expectedText: 'Internal Server Error',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 500,
  })
}
