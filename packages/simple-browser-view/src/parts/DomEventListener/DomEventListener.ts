export interface DomEventListener {
  readonly name: string
  readonly params: readonly (string | number)[]
  readonly preventDefault?: boolean
  readonly passive?: boolean
}
