import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'
import * as ParentRpc from '../ParentRpc/ParentRpc.ts'

export const openExternal = async (state: SimpleBrowserState): Promise<SimpleBrowserState> => {
  const { iframeSrc } = state
  // @ts-ignore
  await ParentRpc.invoke('Open.openExternal', iframeSrc)
  return state
}
