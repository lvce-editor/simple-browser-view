import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_navigationCases.ts'

export const name = 'simple-browser.navigation-push-state'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'push-state')
