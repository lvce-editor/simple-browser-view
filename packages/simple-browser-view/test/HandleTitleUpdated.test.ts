import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandleTitleUpdated from '../src/parts/HandleTitleUpdated/HandleTitleUpdated.ts'

test('updates the visible page title', () => {
  const state = Create.create(1, 0, 0, 800, 600)

  expect(HandleTitleUpdated.handleTitleUpdated(state, 'Example Domain')).toEqual({
    ...state,
    title: 'Example Domain',
  })
})

test('updates the title of a background tab without changing the active tab', () => {
  const activeTab = {
    browserViewId: 10,
    canGoBack: false,
    canGoForward: false,
    iframeSrc: 'https://music.example.com',
    inputValue: 'https://music.example.com',
    isLoading: false,
    title: 'Music',
  }
  const backgroundTab = {
    ...activeTab,
    browserViewId: 20,
    iframeSrc: 'https://github.com',
    inputValue: 'https://github.com',
    title: 'GitHub',
  }
  const state = {
    ...Create.create(1, 0, 0, 800, 600),
    ...activeTab,
    tabs: [activeTab, backgroundTab],
  }

  const newState = HandleTitleUpdated.handleTitleUpdated(state, 20, 'Pull requests')

  expect(newState.browserViewId).toBe(10)
  expect(newState.title).toBe('Music')
  expect(newState.tabs[1].title).toBe('Pull requests')
})
