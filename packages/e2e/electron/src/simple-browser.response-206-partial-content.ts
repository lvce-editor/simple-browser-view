import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-206-partial-content'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: 'partial content',
    expectedText: 'partial content',
    headers: {
      'content-range': 'bytes 0-14/30',
      'content-type': 'text/plain; charset=utf-8',
    },
    statusCode: 206,
  })
}
