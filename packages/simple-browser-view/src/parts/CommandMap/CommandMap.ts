import * as Create from '../Create/Create.ts'
import * as Diff2 from '../Diff2/Diff2.ts'
import * as GetCommandIds from '../GetCommandIds/GetCommandIds.ts'
import * as GetKeyBindings from '../GetKeyBindings/GetKeyBindings.ts'
import * as LoadContent from '../LoadContent/LoadContent.ts'
import * as Render2 from '../Render2/Render2.ts'
import * as RenderEventListeners from '../RenderEventListeners/RenderEventListeners.ts'
import * as WrapCommand from '../SimpleBrowserStates/SimpleBrowserStates.ts'
import * as Terminate from '../Terminate/Terminate.ts'

export const commandMap = {
  'SimpleBrowser.diff2': Diff2.diff2,

  'SimpleBrowser.loadContent': WrapCommand.wrapCommand(LoadContent.loadContent),

  // not wrapped
  'SimpleBrowser.create': Create.create,
  'SimpleBrowser.getCommandIds': GetCommandIds.getCommandIds,
  'SimpleBrowser.getKeyBindings': GetKeyBindings.getKeyBindings,
  'SimpleBrowser.render2': Render2.render2,
  'SimpleBrowser.renderEventListeners': RenderEventListeners.renderEventListeners,
  'SimpleBrowser.terminate': Terminate.terminate,
}
