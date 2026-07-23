import * as CancelNavigation from '../CancelNavigation/CancelNavigation.ts'
import * as Create from '../Create/Create.ts'
import * as Diff2 from '../Diff2/Diff2.ts'
import * as Dispose from '../Dispose/Dispose.ts'
import * as GetCommandIds from '../GetCommandIds/GetCommandIds.ts'
import * as GetKeyBindings from '../GetKeyBindings/GetKeyBindings.ts'
import * as HandleDidNavigate from '../HandleDidNavigate/HandleDidNavigate.ts'
import * as HandleTitleUpdated from '../HandleTitleUpdated/HandleTitleUpdated.ts'
import * as HandleWillNavigate from '../HandleWillNavigate/HandleWillNavigate.ts'
import * as LoadContent from '../LoadContent/LoadContent.ts'
import * as OpenDevtools from '../OpenDevtools/OpenDevtools.ts'
import * as OpenExternal from '../OpenExternal/OpenExternal.ts'
import * as Render2 from '../Render2/Render2.ts'
import * as RenderEventListeners from '../RenderEventListeners/RenderEventListeners.ts'
import * as WrapCommand from '../SimpleBrowserStates/SimpleBrowserStates.ts'
import * as Terminate from '../Terminate/Terminate.ts'

export const commandMap = {
  'SimpleBrowser.cancelNavigation': WrapCommand.wrapCommand(CancelNavigation.cancelNavigation),
  'SimpleBrowser.create': Create.create,
  // not wrapped
  'SimpleBrowser.diff2': Diff2.diff2,
  'SimpleBrowser.dispose': WrapCommand.wrapCommand(Dispose.dispose),
  'SimpleBrowser.getCommandIds': GetCommandIds.getCommandIds,
  'SimpleBrowser.getKeyBindings': GetKeyBindings.getKeyBindings,
  'SimpleBrowser.handleClickOpenDevtools': WrapCommand.wrapCommand(OpenDevtools.openDevtools),
  'SimpleBrowser.handleDidNavigate': WrapCommand.wrapCommand(HandleDidNavigate.handleDidNavigate),
  'SimpleBrowser.handleTitleUpdated': WrapCommand.wrapCommand(HandleTitleUpdated.handleTitleUpdated),
  'SimpleBrowser.handleWillNavigate': WrapCommand.wrapCommand(HandleWillNavigate.handleWillNavigate),
  'SimpleBrowser.loadContent': WrapCommand.wrapCommand(LoadContent.loadContent),
  'SimpleBrowser.openDevtools': WrapCommand.wrapCommand(OpenDevtools.openDevtools),
  'SimpleBrowser.openExternal': OpenExternal.openExternal,
  'SimpleBrowser.render2': Render2.render2,
  'SimpleBrowser.renderEventListeners': RenderEventListeners.renderEventListeners,
  'SimpleBrowser.terminate': Terminate.terminate,
}
