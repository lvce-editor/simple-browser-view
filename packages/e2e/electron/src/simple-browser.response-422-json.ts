import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-422-json'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  const body = '{"error":"validation failed","fields":["name"]}'
  await ResponseTest.run(context, {
    body,
    expectedText: body,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    statusCode: 422,
  })
}
