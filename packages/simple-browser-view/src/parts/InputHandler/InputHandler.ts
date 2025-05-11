import type { SimpleBrowserState } from '../SimpleBrowserState/SimpleBrowserState.ts'

export interface InputHandler {
  (state: SimpleBrowserState, value: string, inputSource?: number): Promise<SimpleBrowserState>
}
