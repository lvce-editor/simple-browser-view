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
