import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_workspaceCases.ts'

export const name = 'simple-browser.workspace-escape-keeps-layout'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'escape-keeps-layout')
