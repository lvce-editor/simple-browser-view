import { expect, test } from '@jest/globals'
import * as ClassNames from '../src/parts/ClassNames/ClassNames.ts'
import { getSimpleBrowserVirtualDom } from '../src/parts/GetSimpleBrowserVirtualDom/GetSimpleBrowserVirtualDom.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('groups the left buttons in a container', () => {
  const dom = getSimpleBrowserVirtualDom(true, true, false, 'https://example.com', 'Example Domain')

  expect(dom[5]).toEqual({
    childCount: 4,
    className: ClassNames.SimpleBrowserHeader,
    type: VirtualDomElements.Div,
  })
  expect(dom[6]).toEqual({
    childCount: 3,
    className: ClassNames.SimlpeBrowserButtonsLeft,
    type: VirtualDomElements.Div,
  })
  expect([dom[7].title, dom[9].title, dom[11].title]).toEqual(['Back', 'Forward', 'Reload'])
})

test('renders the developer tools button as the rightmost header control', () => {
  const dom = getSimpleBrowserVirtualDom(true, true, false, 'https://example.com', 'Example Domain')

  expect(dom.at(-2)).toEqual({
    childCount: 1,
    className: ClassNames.IconButton,
    onClick: 'handleClickOpenDevtools',
    title: 'Toggle Developer Tools',
    type: VirtualDomElements.Button,
  })
  expect(dom.at(-1)).toEqual({
    childCount: 0,
    className: 'MaskIcon MaskIconDebugAlt2',
    type: VirtualDomElements.Div,
  })
})
