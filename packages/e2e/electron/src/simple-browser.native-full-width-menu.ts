import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_nativeCases.ts'

export const name = 'simple-browser.native-full-width-menu'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'full-width-menu')
