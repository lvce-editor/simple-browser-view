import * as ApplyRender from '../ApplyRender/ApplyRender.ts'
import * as Diff from '../Diff/Diff.ts'
import * as SearchViewStates from '../SimpleBrowserStates/SimpleBrowserStates.ts'

export const doRender = (uid: number): readonly any[] => {
  const { oldState, newState } = SearchViewStates.get(uid)
  const diffResult = Diff.diff(oldState, newState)
  const commands = ApplyRender.applyRender(oldState, newState, diffResult)
  return commands
}
