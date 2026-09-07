import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-200-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'plain text response',
    expectedText: 'plain text response',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
