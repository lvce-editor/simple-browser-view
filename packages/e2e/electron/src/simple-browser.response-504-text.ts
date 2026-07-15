import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-504-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'Gateway Timeout',
    expectedText: 'Gateway Timeout',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 504,
  })
}
