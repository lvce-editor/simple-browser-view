import { expect, test } from '@jest/globals'
import * as ClassNames from '../src/parts/ClassNames/ClassNames.ts'
import { getSimpleBrowserVirtualDom } from '../src/parts/GetSimpleBrowserVirtualDom/GetSimpleBrowserVirtualDom.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('groups the left buttons in a container', () => {
  const dom = getSimpleBrowserVirtualDom(true, true, false, 'https://example.com')

  expect(dom[1]).toEqual({
    childCount: 3,
    className: ClassNames.SimpleBrowserHeader,
    type: VirtualDomElements.Div,
  })
  expect(dom[2]).toEqual({
    childCount: 3,
    className: ClassNames.SimlpeBrowserButtonsLeft,
    type: VirtualDomElements.Div,
  })
  expect([dom[3].title, dom[5].title, dom[7].title]).toEqual(['Back', 'Forward', 'Reload'])
})
