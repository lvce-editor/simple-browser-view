import * as CancelNavigation from '../CancelNavigation/CancelNavigation.ts'
import * as CloseTab from '../CloseTab/CloseTab.ts'
import * as Create from '../Create/Create.ts'
import * as Diff2 from '../Diff2/Diff2.ts'
import * as Dispose from '../Dispose/Dispose.ts'
import * as GetCommandIds from '../GetCommandIds/GetCommandIds.ts'
import * as GetComponentState from '../GetComponentState/GetComponentState.ts'
import * as GetKeyBindings from '../GetKeyBindings/GetKeyBindings.ts'
import * as HandleDidNavigate from '../HandleDidNavigate/HandleDidNavigate.ts'
import * as HandleDragLeave from '../HandleDragLeave/HandleDragLeave.ts'
import * as HandleDragStart from '../HandleDragStart/HandleDragStart.ts'
import * as HandleDrop from '../HandleDrop/HandleDrop.ts'
import * as HandleTabDragOver from '../HandleTabDragOver/HandleTabDragOver.ts'
import * as HandleTabMouseDown from '../HandleTabMouseDown/HandleTabMouseDown.ts'
import * as HandleTitleUpdated from '../HandleTitleUpdated/HandleTitleUpdated.ts'
import * as HandleWillNavigate from '../HandleWillNavigate/HandleWillNavigate.ts'
import * as HideOverlay from '../HideOverlay/HideOverlay.ts'
import * as LoadContent from '../LoadContent/LoadContent.ts'
import * as NewTab from '../NewTab/NewTab.ts'
import * as OpenDevtools from '../OpenDevtools/OpenDevtools.ts'
import * as OpenExternal from '../OpenExternal/OpenExternal.ts'
import * as Render2 from '../Render2/Render2.ts'
import * as RenderEventListeners from '../RenderEventListeners/RenderEventListeners.ts'
import * as ResetTabDrag from '../ResetTabDrag/ResetTabDrag.ts'
import * as SetComponentState from '../SetComponentState/SetComponentState.ts'
import * as ShowOverlay from '../ShowOverlay/ShowOverlay.ts'
import * as WrapCommand from '../SimpleBrowserStates/SimpleBrowserStates.ts'
import * as Terminate from '../Terminate/Terminate.ts'

export const commandMap = {
  'SimpleBrowser.cancelNavigation': WrapCommand.wrapCommand(CancelNavigation.cancelNavigation),
  'SimpleBrowser.create': Create.create,
  // not wrapped
  'SimpleBrowser.diff2': Diff2.diff2,
  'SimpleBrowser.dispose': WrapCommand.wrapCommand(Dispose.dispose),
  'SimpleBrowser.getCommandIds': GetCommandIds.getCommandIds,
  'SimpleBrowser.getComponentState': GetComponentState.getComponentState,
  'SimpleBrowser.getKeyBindings': GetKeyBindings.getKeyBindings,
  'SimpleBrowser.handleClickCloseTab': WrapCommand.wrapCommand(CloseTab.closeTab),
  'SimpleBrowser.handleClickNewTab': WrapCommand.wrapCommand(NewTab.newTab),
  'SimpleBrowser.handleClickOpenDevtools': WrapCommand.wrapCommand(OpenDevtools.openDevtools),
  'SimpleBrowser.handleClickTab': WrapCommand.wrapCommand(HandleTabMouseDown.handleTabMouseDown),
  'SimpleBrowser.handleDidNavigate': WrapCommand.wrapCommand(HandleDidNavigate.handleDidNavigate),
  'SimpleBrowser.handleDragEnd': WrapCommand.wrapCommand(ResetTabDrag.resetTabDrag),
  'SimpleBrowser.handleDragLeave': WrapCommand.wrapCommand(HandleDragLeave.handleDragLeave),
  'SimpleBrowser.handleDragStart': WrapCommand.wrapCommand(HandleDragStart.handleDragStart),
  'SimpleBrowser.handleDrop': WrapCommand.wrapCommand(HandleDrop.handleDrop),
  'SimpleBrowser.handleTabDragOver': WrapCommand.wrapCommand(HandleTabDragOver.handleTabDragOver),
  'SimpleBrowser.handleTabMouseUp': WrapCommand.wrapCommand(ResetTabDrag.resetTabDrag),
  'SimpleBrowser.handleTabsDragOver': WrapCommand.wrapCommand(HandleTabDragOver.handleTabsDragOver),
  'SimpleBrowser.handleTitleUpdated': WrapCommand.wrapCommand(HandleTitleUpdated.handleTitleUpdated),
  'SimpleBrowser.handleWillNavigate': WrapCommand.wrapCommand(HandleWillNavigate.handleWillNavigate),
  'SimpleBrowser.hideOverlay': WrapCommand.wrapCommand(HideOverlay.hideOverlay),
  'SimpleBrowser.loadContent': WrapCommand.wrapCommand(LoadContent.loadContent),
  'SimpleBrowser.openDevtools': WrapCommand.wrapCommand(OpenDevtools.openDevtools),
  'SimpleBrowser.openExternal': OpenExternal.openExternal,
  'SimpleBrowser.render2': Render2.render2,
  'SimpleBrowser.renderEventListeners': RenderEventListeners.renderEventListeners,
  'SimpleBrowser.setComponentState': SetComponentState.setComponentState,
  'SimpleBrowser.showOverlay': WrapCommand.wrapCommand(ShowOverlay.showOverlay),
  'SimpleBrowser.terminate': Terminate.terminate,
}
