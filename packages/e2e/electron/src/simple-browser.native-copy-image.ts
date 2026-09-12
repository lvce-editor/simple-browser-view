import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_nativeCases.ts'

export const name = 'simple-browser.native-copy-image'
export const test = async (context: ElectronTestContext): Promise<void> => run(context, 'copy-image')
