import * as EmbedsWorker from '../EmbedsWorker/EmbedsWorker.ts'

export const openDevtools = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.openDevtools', id)
}

export const cancelNavigation = (id: number): Promise<void> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.cancelNavigation', id)
}

export const getStats = (id: number): Promise<any> => {
  return EmbedsWorker.invoke('ElectronWebContentsView.getStats', id)
}
