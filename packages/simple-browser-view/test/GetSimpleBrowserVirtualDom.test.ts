import { expect, test } from '@jest/globals'
import * as ClassNames from '../src/parts/ClassNames/ClassNames.ts'
import { getSimpleBrowserVirtualDom } from '../src/parts/GetSimpleBrowserVirtualDom/GetSimpleBrowserVirtualDom.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

const tabs = [
  {
    browserViewId: 12,
    canGoBack: true,
    canGoForward: true,
    iframeSrc: 'https://example.com',
    inputValue: 'https://example.com',
    isLoading: false,
    title: 'Example Domain',
  },
]

test('groups the left buttons in a container', () => {
  const dom = getSimpleBrowserVirtualDom(true, true, false, 'https://example.com', tabs, 12)
  const headerIndex = dom.findIndex((node) => node.className === ClassNames.SimpleBrowserHeader)

  expect(dom[headerIndex]).toEqual({
    childCount: 4,
    className: ClassNames.SimpleBrowserHeader,
    type: VirtualDomElements.Div,
  })
  expect(dom[headerIndex + 1]).toEqual({
    childCount: 3,
    className: ClassNames.SimlpeBrowserButtonsLeft,
    type: VirtualDomElements.Div,
  })
  expect([dom[headerIndex + 2].title, dom[headerIndex + 4].title, dom[headerIndex + 6].title]).toEqual(['Back', 'Forward', 'Reload'])
})

test('wraps the input box in a container', () => {
  const dom = getSimpleBrowserVirtualDom(true, true, false, 'https://example.com', tabs, 12)
  const inputIndex = dom.findIndex((node) => node.className === ClassNames.InputBox)

  expect(dom[inputIndex - 1]).toEqual({
    childCount: 1,
    type: VirtualDomElements.Div,
  })
  expect(dom[inputIndex]).toEqual({
    className: ClassNames.InputBox,
    enterKeyHint: 'Go',
    inputType: 'url',
    onBlur: 'handleBlur',
    onFocus: 'handleFocus',
    onInput: 'handleInput',
    type: VirtualDomElements.Input,
    value: 'https://example.com',
  })
})

test('renders the developer tools button as the rightmost header control', () => {
  const dom = getSimpleBrowserVirtualDom(true, true, false, 'https://example.com', tabs, 12)

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
