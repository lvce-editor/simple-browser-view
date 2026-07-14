import { expect, test } from '@jest/globals'
import * as Create from '../src/parts/Create/Create.ts'
import * as DiffItems from '../src/parts/DiffItems/DiffItems.ts'

test('page title changes require a render', () => {
  const oldState = Create.create(1, 0, 0, 800, 600)
  const newState = {
    ...oldState,
    title: 'Example Domain',
  }

  expect(DiffItems.isEqual(oldState, newState)).toBe(false)
})
