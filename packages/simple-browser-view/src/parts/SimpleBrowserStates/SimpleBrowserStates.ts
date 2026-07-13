import * as ViewletRegistry from '@lvce-editor/viewlet-registry'
import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export const { dispose, get, getKeys, set, wrapCommand } = ViewletRegistry.create<SimpleBrowserState>()
