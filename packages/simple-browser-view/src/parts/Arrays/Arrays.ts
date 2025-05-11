// based on https://github.com/microsoft/vscode/blob/c0769274fa136b45799edeccc0d0a2f645b75caf/src/vs/base/common/arrays.ts#L625 (License MIT)

export const isLastIndex = <T>(array: readonly T[], index: number): boolean => {
  return index === array.length - 1
}

export const lastIndex = <T>(array: readonly T[]): number => {
  return array.length - 1
}

export const remove = <T>(array: readonly T[], index: number, deleteCount: number): readonly T[] => {
  return array.toSpliced(index, deleteCount)
}
