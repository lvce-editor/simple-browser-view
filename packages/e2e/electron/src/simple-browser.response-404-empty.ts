import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-404-empty'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    expectedText: '',
    statusCode: 404,
  })
}
