import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_suggestionsCases.ts'

export const name = 'simple-browser.suggestions-url-history'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'url-history')
