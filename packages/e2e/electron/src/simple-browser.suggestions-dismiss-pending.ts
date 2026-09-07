import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_suggestionsCases.ts'

export const name = 'simple-browser.suggestions-dismiss-pending'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'dismiss-pending')
