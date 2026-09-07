import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_navigationCases.ts'

export const name = 'simple-browser.navigation-background-link'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'background-link')
