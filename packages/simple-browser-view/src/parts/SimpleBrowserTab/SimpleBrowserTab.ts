export interface SimpleBrowserTab {
  readonly browserViewId: number
  readonly canGoBack: boolean
  readonly canGoForward: boolean
  readonly iframeSrc: string
  readonly inputValue: string
  readonly isLoading: boolean
  readonly title: string
}
