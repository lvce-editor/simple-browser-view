import { expect, test } from '@jest/globals'
import type { SimpleBrowserTab } from '../src/parts/SimpleBrowserTab/SimpleBrowserTab.ts'
import * as ClassNames from '../src/parts/ClassNames/ClassNames.ts'
import { getSimpleBrowserTabsVirtualDom } from '../src/parts/GetSimpleBrowserTabsVirtualDom/GetSimpleBrowserTabsVirtualDom.ts'

const createTab = (browserViewId: number, title: string): SimpleBrowserTab => ({
  browserViewId,
  canGoBack: false,
  canGoForward: false,
  iframeSrc: 'https://example.com',
  inputValue: 'https://example.com',
  isLoading: false,
  title,
})

test('renders multiple tabs, their close buttons, and a new tab button', () => {
  const dom = getSimpleBrowserTabsVirtualDom([createTab(12, 'Music'), createTab(24, 'GitHub')], 24)

  expect(dom[0]).toEqual(
    expect.objectContaining({
      childCount: 3,
      className: ClassNames.MainTabs,
      onDragLeave: 'handleDragLeave',
      onDragOver: 'handleTabsDragOver',
      onDrop: 'handleDrop',
      role: 'tablist',
    }),
  )
  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        'aria-selected': false,
        className: ClassNames.MainTab,
        'data-id': '12',
        'data-index': '0',
        draggable: true,
        onDragEnd: 'handleDragEnd',
        onDragOver: 'handleTabDragOver',
        onDragStart: 'handleDragStart',
        onMouseUp: 'handleTabMouseUp',
        title: 'Music',
      }),
      expect.objectContaining({
        'aria-selected': true,
        className: `${ClassNames.MainTab} ${ClassNames.MainTabSelected}`,
        'data-id': '24',
        title: 'GitHub',
      }),
      expect.objectContaining({
        'aria-label': 'Close Music',
        'data-id': '12',
        onClick: 'handleClickCloseTab',
      }),
      expect.objectContaining({
        'aria-label': 'Close GitHub',
        'data-id': '24',
        onClick: 'handleClickCloseTab',
      }),
      expect.objectContaining({
        'aria-label': 'New Tab',
        onClick: 'handleClickNewTab',
      }),
    ]),
  )
})

test('renders the white insertion line before a target tab', () => {
  const dom = getSimpleBrowserTabsVirtualDom([createTab(12, 'Music'), createTab(24, 'GitHub')], 24, 1)
  const tabs = dom.filter((node) => node.role === 'tab')

  expect(tabs[0].style).toBeUndefined()
  expect(tabs[1].style).toBe('box-shadow:inset 2px 0 0 white;')
})

test('renders the white insertion line after the final tab', () => {
  const dom = getSimpleBrowserTabsVirtualDom([createTab(12, 'Music'), createTab(24, 'GitHub')], 24, 2)
  const tabs = dom.filter((node) => node.role === 'tab')

  expect(tabs[0].style).toBeUndefined()
  expect(tabs[1].style).toBe('box-shadow:inset -2px 0 0 white;')
})

test('does not render an insertion line without a drop target', () => {
  const dom = getSimpleBrowserTabsVirtualDom([createTab(12, 'Music'), createTab(24, 'GitHub')], 24)

  expect(dom.filter((node) => node.role === 'tab').every((tab) => tab.style === undefined)).toBe(true)
})

test('uses a fallback title while a page title is unavailable', () => {
  const dom = getSimpleBrowserTabsVirtualDom([createTab(12, '')], 12)
  const tab = dom.find((node) => node.role === 'tab')

  expect(tab?.title).toBe('Simple Browser')
  expect(dom).toEqual(expect.arrayContaining([expect.objectContaining({ text: 'Simple Browser' })]))
})
