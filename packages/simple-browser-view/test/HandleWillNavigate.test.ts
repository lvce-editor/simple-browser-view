import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandleWillNavigate from '../src/parts/HandleWillNavigate/HandleWillNavigate.ts'

test('shows the loading state when navigation starts', () => {
  const state = Create.create(1, 0, 0, 800, 600)

  expect(HandleWillNavigate.handleWillNavigate(state, 'https://example.com')).toEqual({
    ...state,
    iframeSrc: 'https://example.com',
    isLoading: true,
  })
})
