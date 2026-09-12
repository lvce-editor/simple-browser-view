import type { Renderer } from '../Renderer/Renderer.ts'
import * as DiffType from '../DiffType/DiffType.ts'
import { renderAddressSelection } from '../RenderAddressSelection/RenderAddressSelection.ts'
import * as RenderDragData from '../RenderDragData/RenderDragData.ts'
import * as RenderItems from '../RenderItems/RenderItems.ts'

export const getRenderer = (diffType: number): Renderer => {
  switch (diffType) {
    case DiffType.RenderAddressSelection:
      return renderAddressSelection
    case DiffType.RenderDragData:
      return RenderDragData.renderDragData
    case DiffType.RenderItems:
      return RenderItems.renderItems
    default:
      throw new Error('unknown renderer')
  }
}
