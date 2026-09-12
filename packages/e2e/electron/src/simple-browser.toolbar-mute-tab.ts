import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_toolbarCases.ts'

export const name = 'simple-browser.toolbar-mute-tab'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'mute-tab')
