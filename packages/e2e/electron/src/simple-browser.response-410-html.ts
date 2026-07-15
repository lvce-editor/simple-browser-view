import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-410-html'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: '<!doctype html><html><body><h1>Gone</h1><p>This resource is no longer available.</p></body></html>',
    expectedText: 'GoneThis resource is no longer available.',
    headers: { 'content-type': 'text/html; charset=utf-8' },
    statusCode: 410,
  })
}
