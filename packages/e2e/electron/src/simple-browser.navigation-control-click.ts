import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_navigationCases.ts'

export const name = 'simple-browser.navigation-control-click'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'control-click')
