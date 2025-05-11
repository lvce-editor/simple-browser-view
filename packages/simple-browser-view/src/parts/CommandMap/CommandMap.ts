import * as CancelNavigation from '../CancelNavigation/CancelNavigation.ts'
import * as Create from '../Create/Create.ts'
import * as Diff2 from '../Diff2/Diff2.ts'
import * as Dispose from '../Dispose/Dispose.ts'
import * as GetCommandIds from '../GetCommandIds/GetCommandIds.ts'
import * as GetKeyBindings from '../GetKeyBindings/GetKeyBindings.ts'
import * as LoadContent from '../LoadContent/LoadContent.ts'
import * as OpenDevtools from '../OpenDevtools/OpenDevtools.ts'
import * as OpenExternal from '../OpenExternal/OpenExternal.ts'
import * as Render2 from '../Render2/Render2.ts'
import * as RenderEventListeners from '../RenderEventListeners/RenderEventListeners.ts'
import * as WrapCommand from '../SimpleBrowserStates/SimpleBrowserStates.ts'
import * as Terminate from '../Terminate/Terminate.ts'

export const commandMap = {
  'SimpleBrowser.loadContent': WrapCommand.wrapCommand(LoadContent.loadContent),
  'SimpleBrowser.cancelNavigation': WrapCommand.wrapCommand(CancelNavigation.cancelNavigation),
  'SimpleBrowser.openDevtools': WrapCommand.wrapCommand(OpenDevtools.openDevtools),
  'SimpleBrowser.dispose': WrapCommand.wrapCommand(Dispose.dispose),

  // not wrapped
  'SimpleBrowser.diff2': Diff2.diff2,
  'SimpleBrowser.openExternal': OpenExternal.openExternal,
  'SimpleBrowser.create': Create.create,
  'SimpleBrowser.getCommandIds': GetCommandIds.getCommandIds,
  'SimpleBrowser.getKeyBindings': GetKeyBindings.getKeyBindings,
  'SimpleBrowser.render2': Render2.render2,
  'SimpleBrowser.renderEventListeners': RenderEventListeners.renderEventListeners,
  'SimpleBrowser.terminate': Terminate.terminate,
}
