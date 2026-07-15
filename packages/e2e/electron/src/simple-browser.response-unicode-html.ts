import * as ResponseTest from './_responseTest.ts'

export const name = 'simple-browser.response-unicode-html'

export const test = async (context: ResponseTest.ElectronTestContext): Promise<void> => {
  await ResponseTest.run(context, {
    body: '<!doctype html><html><body><p>Grüße, 世界 — café ☕</p></body></html>',
    expectedText: 'Grüße, 世界 — café ☕',
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
