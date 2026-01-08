export interface SimpleBrowserState {
  readonly focus: number
  readonly focused: boolean
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly uid: number
  readonly inputValue: string
  readonly browserViewId: number
  readonly isLoading: boolean
  readonly canGoBack: boolean
  readonly canGoForward: boolean
  readonly iframeSrc: string
  readonly suggestionsEnabled: boolean
  readonly hasSuggestionsOverlay: boolean
  readonly shortcuts: readonly any[]
  readonly headerHeight: number
  readonly uri: string
  readonly title: string
}
