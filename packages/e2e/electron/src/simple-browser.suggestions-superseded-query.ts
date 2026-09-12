import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_suggestionsCases.ts'

export const name = 'simple-browser.suggestions-superseded-query'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'superseded-query')
