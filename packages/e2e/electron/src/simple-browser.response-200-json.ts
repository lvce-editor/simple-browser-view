import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-200-json'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  const body = '{"status":"ok","items":[1,2,3]}'
  await ResponseTest.run(context, {
    body,
    expectedText: body,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
