import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-408-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'Request Timeout',
    expectedText: 'Request Timeout',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 408,
  })
}
