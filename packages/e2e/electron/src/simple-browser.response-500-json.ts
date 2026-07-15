import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-500-json'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  const body = '{"error":"internal server error","requestId":"test-123"}'
  await ResponseTest.run(context, {
    body,
    expectedText: body,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    statusCode: 500,
  })
}
