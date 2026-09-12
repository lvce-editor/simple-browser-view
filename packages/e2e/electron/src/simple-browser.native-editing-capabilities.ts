import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_nativeCases.ts'

export const name = 'simple-browser.native-editing-capabilities'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'editing-capabilities')
