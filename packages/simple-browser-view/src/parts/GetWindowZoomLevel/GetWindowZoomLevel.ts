import * as GetWindowId from '../GetWindowId/GetWindowId.ts'
import * as SharedProcess from '../SharedProcess/SharedProcess.ts'

export const getWindowZoomLevel = async (): Promise<number> => {
  // TODO speed up resizing by avoid too many round trips
  const windowId = await GetWindowId.getWindowId()
  const zoomLevel = await SharedProcess.invoke('ElectronWindow.getZoom', windowId)
  return zoomLevel
}
