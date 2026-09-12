import * as DiffAddressSelection from '../DiffAddressSelection/DiffAddressSelection.ts'
import * as DiffDragData from '../DiffDragData/DiffDragData.ts'
import * as DiffItems from '../DiffItems/DiffItems.ts'
import * as DiffType from '../DiffType/DiffType.ts'

export const modules = [DiffItems.isEqual, DiffDragData.isEqual, DiffAddressSelection.isEqual]

export const numbers = [DiffItems.diffType, DiffType.RenderDragData, DiffType.RenderAddressSelection]
