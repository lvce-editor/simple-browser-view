import { expect, test } from '@jest/globals'
import { applyRender } from '../src/parts/ApplyRender/ApplyRender.ts'
import { commandMap } from '../src/parts/CommandMap/CommandMap.ts'
import { create } from '../src/parts/Create/Create.ts'
import { diff } from '../src/parts/Diff/Diff.ts'
import { handleAddressBlur } from '../src/parts/HandleAddressBlur/HandleAddressBlur.ts'
import { handleAddressFocus } from '../src/parts/HandleAddressFocus/HandleAddressFocus.ts'

const value = 'https://example.com'

test('input focus and native web contents blur render selection changes through the worker', () => {
  const initial = create(1, 0, 0, 800, 600, value)
  const focused = handleAddressFocus(initial, value)
  expect(applyRender(initial, focused, diff(initial, focused))).toContainEqual([
    'Viewlet.setSelectionByName',
    1,
    'simple-browser-address',
    0,
    value.length,
  ])
  const blurred = handleAddressBlur(focused)
  expect(applyRender(focused, blurred, diff(focused, blurred))).toContainEqual(['Viewlet.setSelectionByName', 1, 'simple-browser-address', 0, 0])
  expect(blurred.inputValue).toBe(value)
  const refocused = handleAddressFocus(blurred, value)
  expect(refocused.addressSelection).toEqual({ end: value.length, start: 0 })
})

test('focus leaves the caret after a query when suggestions are visible', () => {
  const initial = { ...create(2, 0, 0, 800, 600, value), hasSuggestionsOverlay: true }
  expect(handleAddressFocus(initial, value).addressSelection).toEqual({ end: value.length, start: value.length })
})

test('the renderer worker bridge shares selection behavior and preserves a restored range', () => {
  const getSelection = commandMap['SimpleBrowser.getAddressSelection']
  expect(getSelection(false, value)).toEqual({ end: 0, start: 0 })
  expect(getSelection(true, value)).toEqual({ end: value.length, start: 0 })
  expect(getSelection(true, value, false, { end: 8, start: 2 })).toEqual({ end: 8, start: 2 })
})
