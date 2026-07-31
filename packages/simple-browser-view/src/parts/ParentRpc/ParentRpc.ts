import { RendererWorker } from '@lvce-editor/rpc-registry'

export const invoke: typeof RendererWorker.invoke = (method, ...params) => RendererWorker.invoke(method, ...params)

export const invokeAndTransfer: typeof RendererWorker.invokeAndTransfer = (method, ...params) => RendererWorker.invokeAndTransfer(method, ...params)

export const set: typeof RendererWorker.set = (rpc) => {
  RendererWorker.set(rpc)
}
