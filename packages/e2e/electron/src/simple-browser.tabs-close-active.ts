import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_tabsCases.ts'

export const name = 'simple-browser.tabs-close-active'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'close-active')
