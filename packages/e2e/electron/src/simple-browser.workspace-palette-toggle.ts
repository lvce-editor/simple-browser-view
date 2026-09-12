import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_workspaceCases.ts'

export const name = 'simple-browser.workspace-palette-toggle'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'palette-toggle')
