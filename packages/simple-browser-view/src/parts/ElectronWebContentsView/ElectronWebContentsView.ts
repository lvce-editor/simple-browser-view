import * as EmbedsWorker from '../EmbedsWorker/EmbedsWorker.ts'

const state = {
  refs: 0,
}

export const createWebContentsView = async (restoreId: number, fallThroughKeyBindings: readonly any[]): Promise<void> => {
  state.refs++
  return EmbedsWorker.invoke('ElectronWebContentsView.createWebContentsView', restoreId, fallThroughKeyBindings)
}

export const disposeWebContentsView = async (id: number): Promise<void> => {
  await EmbedsWorker.invoke('ElectronWebContentsView.disposeWebContentsView', id)
  state.refs--
  if (state.refs === 0) {
    // @ts-ignore
    await EmbedsWorker.dispose()
  }
}
