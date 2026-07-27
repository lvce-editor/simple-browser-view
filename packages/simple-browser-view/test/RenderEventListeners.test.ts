import { expect, test } from '@jest/globals'
import * as RenderEventListeners from '../src/parts/RenderEventListeners/RenderEventListeners.ts'

test('provides tab lifecycle event parameters', () => {
  expect(RenderEventListeners.renderEventListeners()).toEqual([
    {
      name: 'handleClickCloseTab',
      params: ['handleClickCloseTab', 'event.target.dataset.id'],
    },
    {
      name: 'handleClickNewTab',
      params: ['handleClickNewTab'],
    },
    {
      name: 'handleClickTab',
      params: ['handleClickTab', 'event.target.dataset.id'],
    },
  ])
})
