export interface SimpleBrowserState {
  readonly browserViewId: number
  readonly canGoBack: boolean
  readonly canGoForward: boolean
  readonly focus: number
  readonly focused: boolean
  readonly hasSuggestionsOverlay: boolean
  readonly headerHeight: number
  readonly height: number
  readonly iframeSrc: string
  readonly inputValue: string
  readonly isLoading: boolean
  readonly shortcuts: readonly any[]
  readonly suggestionsEnabled: boolean
  readonly title: string
  readonly uid: number
  readonly uri: string
  readonly width: number
  readonly x: number
  readonly y: number
}
