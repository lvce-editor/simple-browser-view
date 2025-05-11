import { expect, test } from '@jest/globals'
import type { SimpleBrowserState } from '../src/parts/SimpleBrowserState/SimpleBrowserState.ts'
import * as Create from '../src/parts/Create/Create.ts'

test('create', () => {
  const state: SimpleBrowserState = {
    ...Create.create(0, 0, 0, 0, 0, ''),
  }
  expect(state).toBeDefined()
})
