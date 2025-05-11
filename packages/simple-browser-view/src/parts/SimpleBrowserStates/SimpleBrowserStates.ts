import * as ViewletRegistry from '@lvce-editor/viewlet-registry'
import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const { get, set, dispose, getKeys, wrapCommand } = ViewletRegistry.create<SimpleBrowserState>()
