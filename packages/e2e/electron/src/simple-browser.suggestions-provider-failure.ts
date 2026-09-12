import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_suggestionsCases.ts'

export const name = 'simple-browser.suggestions-provider-failure'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'provider-failure')
