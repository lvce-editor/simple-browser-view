import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_toolbarCases.ts'

export const name = 'simple-browser.toolbar-zoom-reset'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'zoom-reset')
