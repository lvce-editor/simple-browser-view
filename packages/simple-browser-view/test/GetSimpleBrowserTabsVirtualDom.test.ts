import { expect, test } from '@jest/globals'
import * as ClassNames from '../src/parts/ClassNames/ClassNames.ts'
import { getSimpleBrowserTabsVirtualDom } from '../src/parts/GetSimpleBrowserTabsVirtualDom/GetSimpleBrowserTabsVirtualDom.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('renders the visible page title in a selected tab', () => {
  expect(getSimpleBrowserTabsVirtualDom('Example Domain')).toEqual([
    {
      childCount: 1,
      className: ClassNames.MainTabs,
      role: 'tablist',
      type: VirtualDomElements.Div,
    },
    {
      'aria-selected': true,
      childCount: 1,
      className: `${ClassNames.MainTab} ${ClassNames.MainTabSelected}`,
      role: 'tab',
      title: 'Example Domain',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: ClassNames.TabTitle,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      text: 'Example Domain',
      type: VirtualDomElements.Text,
    },
  ])
})

test('uses a fallback title while the page title is unavailable', () => {
  const dom = getSimpleBrowserTabsVirtualDom('')

  expect(dom[1].title).toBe('Simple Browser')
  expect(dom[3].text).toBe('Simple Browser')
})
