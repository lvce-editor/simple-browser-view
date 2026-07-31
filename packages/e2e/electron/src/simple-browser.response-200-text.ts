import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-200-text'
// TODO enable when the Simple Browser reliably navigates between response-test server URLs
export const skip = 1

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'plain text response',
    expectedText: 'plain text response',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
