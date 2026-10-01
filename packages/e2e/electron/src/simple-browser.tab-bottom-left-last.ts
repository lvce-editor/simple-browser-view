import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_bottomLeftCase.ts'

export const name = 'simple-browser.tab-bottom-left-last'
export const test = (context: ElectronTestContext): Promise<void> => run(context, true)
