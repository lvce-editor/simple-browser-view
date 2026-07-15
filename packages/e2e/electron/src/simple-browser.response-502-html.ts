import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-502-html'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: '<!doctype html><html><body><h1>Bad Gateway</h1><p>The upstream server failed.</p></body></html>',
    expectedText: 'Bad GatewayThe upstream server failed.',
    headers: { 'content-type': 'text/html; charset=utf-8' },
    statusCode: 502,
  })
}
