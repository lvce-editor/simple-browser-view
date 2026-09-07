import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_nativeCases.ts'

export const name = 'simple-browser.native-open-image-background'
export const test = async (context: ElectronTestContext): Promise<void> => run(context, 'open-image-background')
