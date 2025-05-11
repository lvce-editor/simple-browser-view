import * as Rpc from '../ParentRpc/ParentRpc.ts'

export const openUri = async (path: string, focus = true, props = {}): Promise<void> => {
  await Rpc.invoke(/* Main.openUri */ 'Main.openUri', /* uri */ path, /* focus */ focus, props)
}
