import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import * as VirtualDomElements from '../VirtualDomElements/VirtualDomElements.ts'

export const text = (data: string): VirtualDomNode => {
  return {
    childCount: 0,
    text: data,
    type: VirtualDomElements.Text,
  }
}
