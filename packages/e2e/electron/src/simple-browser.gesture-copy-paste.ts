import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_gestureCases.ts'

export const name = 'simple-browser.gesture-copy-paste'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'copy-paste')
