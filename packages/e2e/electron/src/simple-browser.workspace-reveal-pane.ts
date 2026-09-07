import type { ElectronTestContext } from './_responseTest.ts'
import { run } from './_workspaceCases.ts'

export const name = 'simple-browser.workspace-reveal-pane'
export const test = (context: ElectronTestContext): Promise<void> => run(context, 'reveal-pane')
