import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_toolbarCases.ts'

export const name = 'simple-browser.toolbar-downloads'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'downloads')
