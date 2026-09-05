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
      params: ['handleClickTab', 'event.currentTarget.dataset.id', 'event.button'],
    },
    {
      name: 'handleTabDragOver',
      params: [
        'handleTabDragOver',
        'event.currentTarget.dataset.index',
        'event.currentTarget.offsetLeft',
        'event.currentTarget.offsetWidth',
        'event.currentTarget.parentElement.scrollLeft',
        'event.clientX',
      ],
      preventDefault: true,
      stopPropagation: true,
    },
    {
      name: 'handleTabsDragOver',
      params: ['handleTabsDragOver'],
      preventDefault: true,
      stopPropagation: true,
    },
    {
      dragEffect: 'copyMove',
      name: 'handleDragStart',
      params: ['handleDragStart'],
    },
    {
      name: 'handleDragEnd',
      params: ['handleDragEnd'],
    },
    {
      name: 'handleTabMouseUp',
      params: ['handleTabMouseUp'],
    },
    {
      name: 'handleDragLeave',
      params: ['handleDragLeave'],
    },
    {
      name: 'handleDrop',
      params: ['handleDrop'],
      preventDefault: true,
    },
  ])
})
