import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as HandleDidNavigate from '../src/parts/HandleDidNavigate/HandleDidNavigate.ts'

test('stops showing the loading state after navigation finishes', () => {
  const state = {
    ...Create.create(1, 0, 0, 800, 600),
    isLoading: true,
  }

  expect(HandleDidNavigate.handleDidNavigate(state, 'https://example.com')).toEqual({
    ...state,
    iframeSrc: 'https://example.com',
    isLoading: false,
  })
})
