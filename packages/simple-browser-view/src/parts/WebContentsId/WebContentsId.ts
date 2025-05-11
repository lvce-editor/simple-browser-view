const state = {
  id: 0,
}

export const set = (value: number): void => {
  state.id = value
}

export const get = (): number => {
  return state.id
}
