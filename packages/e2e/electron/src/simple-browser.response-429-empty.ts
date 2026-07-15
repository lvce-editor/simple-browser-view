import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-429-empty'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    expectedText: '',
    headers: { 'retry-after': '60' },
    statusCode: 429,
  })
}
