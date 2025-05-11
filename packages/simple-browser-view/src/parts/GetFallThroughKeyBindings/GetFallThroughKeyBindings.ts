import * as WhenExpression from '../WhenExpression/WhenExpression.ts'

const isFallThroughKeyBinding = (keyBinding: any): any => {
  return !keyBinding.when || keyBinding.when == WhenExpression.BrowserElectron
}

const getKey = (keyBinding: any): any => {
  return keyBinding.key
}

export const getFallThroughKeyBindings = (keyBindings: readonly any[]): readonly any[] => {
  const fallThroughKeyBindings = keyBindings.filter(isFallThroughKeyBinding)
  const keys = fallThroughKeyBindings.map(getKey)
  return keys
}
