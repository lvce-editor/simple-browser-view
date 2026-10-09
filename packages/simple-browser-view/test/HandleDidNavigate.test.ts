import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandleDidNavigate from '../src/parts/HandleDidNavigate/HandleDidNavigate.ts'

test('updates the current url after every navigation', () => {
  const state = {
    ...Create.create(1, 0, 0, 800, 600),
    isLoading: true,
  }

  const newState = HandleDidNavigate.handleDidNavigate(state, 'https://example.com/one')
  expect(newState).toEqual({
    ...state,
    iframeSrc: 'https://example.com/one',
    inputValue: 'https://example.com/one',
    isLoading: false,
  })

  expect(HandleDidNavigate.handleDidNavigate(newState, 'https://example.com/two')).toEqual({
    ...newState,
    iframeSrc: 'https://example.com/two',
    inputValue: 'https://example.com/two',
  })
})

test('preserves the active address draft while focused', () => {
  const state = {
    ...Create.create(1, 0, 0, 800, 600, 'https://example.com/draft'),
    browserViewId: 12,
    focused: true,
    iframeSrc: 'https://example.com/one',
    inputValue: 'https://example.com/draft',
  }

  expect(HandleDidNavigate.handleDidNavigate(state, 12, 'https://example.com/two')).toEqual({
    ...state,
    iframeSrc: 'https://example.com/two',
    inputValue: 'https://example.com/draft',
    isLoading: false,
  })
})

test('preserves the active tab draft while focused', () => {
  const state = {
    ...Create.create(1, 0, 0, 800, 600, 'https://example.com/draft'),
    browserViewId: 12,
    focused: true,
    iframeSrc: 'https://example.com/one',
    inputValue: 'https://example.com/draft',
    tabs: [
      {
        browserViewId: 12,
        canGoBack: false,
        canGoForward: false,
        iframeSrc: 'https://example.com/one',
        inputValue: 'https://example.com/draft',
        isLoading: true,
        title: 'One',
      },
    ],
  }

  const newState = HandleDidNavigate.handleDidNavigate(state, 12, 'https://example.com/two')
  expect(newState.tabs[0]).toEqual({
    ...state.tabs[0],
    iframeSrc: 'https://example.com/two',
    inputValue: 'https://example.com/draft',
    isLoading: false,
  })
})

test('updates a background tab without changing the active address draft', () => {
  const state = {
    ...Create.create(1, 0, 0, 800, 600, 'https://example.com/draft'),
    browserViewId: 12,
    focused: true,
    iframeSrc: 'https://example.com/one',
    inputValue: 'https://example.com/draft',
    tabs: [
      {
        browserViewId: 12,
        canGoBack: false,
        canGoForward: false,
        iframeSrc: 'https://example.com/one',
        inputValue: 'https://example.com/draft',
        isLoading: false,
        title: 'One',
      },
      {
        browserViewId: 24,
        canGoBack: false,
        canGoForward: false,
        iframeSrc: 'https://example.com/background',
        inputValue: 'https://example.com/background',
        isLoading: false,
        title: 'Background',
      },
    ],
  }

  const newState = HandleDidNavigate.handleDidNavigate(state, 24, 'https://example.com/background-updated')
  expect(newState.inputValue).toBe('https://example.com/draft')
  expect(newState.tabs[1]).toEqual({
    ...state.tabs[1],
    iframeSrc: 'https://example.com/background-updated',
    inputValue: 'https://example.com/background-updated',
    isLoading: false,
  })
})
