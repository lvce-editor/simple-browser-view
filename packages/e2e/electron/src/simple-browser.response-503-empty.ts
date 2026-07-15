import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-503-empty'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    expectedText: '',
    headers: { 'retry-after': '120' },
    statusCode: 503,
  })
}
