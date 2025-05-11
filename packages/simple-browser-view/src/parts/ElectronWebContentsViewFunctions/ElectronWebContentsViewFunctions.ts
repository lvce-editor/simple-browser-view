import * as EmbedsWorker from '../EmbedsWorker/EmbedsWorker.ts'
import * as GetWindowZoomLevel from '../GetWindowZoomLevel/GetWindowZoomLevel.ts'
import * as GetZoomLevelPercent from '../GetZoomLevelPercent/GetZoomLevelPercent.ts'

export const resizeWebContentsView = async (id: number, x: number, y: number, width: number, height: number): Promise<void> => {
  const zoomLevel = await GetWindowZoomLevel.getWindowZoomLevel()
  const zoomValue = GetZoomLevelPercent.getZoomLevelToPercentValue(zoomLevel)
  const modifiedWidth = Math.round(width * zoomValue)
  const modifiedHeight = Math.round(height * zoomValue)
  return EmbedsWorker.invoke('ElectronWebContentsView.resizeWebContentsView', id, x, y, modifiedWidth, modifiedHeight)
}

export const setIframeSrc = async (id: number, iframeSrc: string): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.setIframeSrc', id, iframeSrc)
}

export const focus = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.focus', id)
}

export const openDevtools = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.openDevtools', id)
}

export const reload = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.reload', id)
}

export const forward = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.forward', id)
}

export const backward = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.backward', id)
}

export const cancelNavigation = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.cancelNavigation', id)
}

export const show = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.show', id)
}

export const hide = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.hide', id)
}

export const inspectElement = (id: number, x: number, y: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.inspectElement', id, x, y)
}

export const copyImageAt = (id: number, x: number, y: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.copyImageAt', id, x, y)
}

export const setFallthroughKeyBindings = (fallthroughKeyBindings: readonly any[]): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.setFallthroughKeyBindings', fallthroughKeyBindings)
}

export const getStats = (id: number): Promise<any> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.getStats', id)
}
