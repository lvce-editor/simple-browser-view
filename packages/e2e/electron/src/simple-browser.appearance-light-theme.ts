import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_appearanceCases.ts'

export const name = 'simple-browser.appearance-light-theme'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'light-theme')
