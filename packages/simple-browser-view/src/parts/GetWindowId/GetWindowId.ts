import * as SharedProcess from '../SharedProcess/SharedProcess.ts'
import * as WebContentsId from '../WebContentsId/WebContentsId.ts'

// TODO cache window id

export const getWindowId = async (): Promise<number> => {
  const webContentsId = WebContentsId.get()
  const windowId = await SharedProcess.invoke('GetWindowId.getWindowId', webContentsId)
  return windowId
}
