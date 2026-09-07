import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_navigationCases.ts'

export const name = 'simple-browser.navigation-middle-click'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'middle-click')
