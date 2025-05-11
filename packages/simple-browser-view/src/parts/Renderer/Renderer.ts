import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export interface Renderer {
  (oldState: SimpleBrowserState, newState: SimpleBrowserState): readonly any[]
}
