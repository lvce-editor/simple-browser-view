import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_navigationCases.ts'

export const name = 'simple-browser.navigation-reload-preserves-url'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'reload-preserves-url')
