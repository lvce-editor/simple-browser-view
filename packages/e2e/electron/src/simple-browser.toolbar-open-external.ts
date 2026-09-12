import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_toolbarCases.ts'

export const name = 'simple-browser.toolbar-open-external'
export const test = async (context: ElectronTestContext): Promise<void> => run(context, 'open-external')
