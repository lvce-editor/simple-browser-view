import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-418-text'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: "I'm a teapot",
    expectedText: "I'm a teapot",
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    statusCode: 418,
  })
}
