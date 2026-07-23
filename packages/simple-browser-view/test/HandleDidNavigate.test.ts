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
