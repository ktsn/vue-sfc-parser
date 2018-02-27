import mapValues from 'lodash.mapvalues'
import {
  parseComponent as _parseComponent,
  SFCBlockRaw,
  SFCDescriptorRaw
} from './sfc-parser'

export class SFCBlock {
  type!: string
  content!: string
  attrs!: Record<string, string | true>
  start!: number
  end!: number
  lang?: string
  src?: string
  scoped?: true
  module?: string | true

  constructor(block: SFCBlockRaw) {
    Object.keys(block).forEach(_key => {
      const key = _key as keyof SFCBlockRaw
      this[key] = block[key]
    })
  }

  modifyOffset(offset: number): number {
    return this.start + offset
  }

  modifyRange(range: [number, number]): [number, number] {
    return [this.modifyOffset(range[0]), this.modifyOffset(range[1])]
  }

  modifyPosition(position: {
    start: number
    end: number
  }): { start: number; end: number } {
    return {
      start: this.modifyOffset(position.start),
      end: this.modifyOffset(position.end)
    }
  }
}

export interface SFCDescriptor {
  template: SFCBlock | null
  script: SFCBlock | null
  styles: SFCBlock[]
  customBlocks: SFCBlock[]
}

export function parseComponent(code: string): SFCDescriptor {
  return mapValues(_parseComponent(code), (value, key) => {
    if (Array.isArray(value)) {
      return value.map(v => new SFCBlock(v))
    } else {
      return value && new SFCBlock(value)
    }
  }) as SFCDescriptor
}
