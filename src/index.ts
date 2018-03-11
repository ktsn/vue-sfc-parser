import mapValues from 'lodash.mapvalues'
import {
  parseComponent as _parseComponent,
  SFCBlockRaw,
  SFCDescriptorRaw
} from './sfc-parser'
import { SFCDiffWatcher } from './diff-watcher'
import { equalsRecord } from './utils'

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

  equals(block: SFCBlock): boolean {
    if (this === block) {
      return true
    }

    return (
      this.type === block.type &&
      this.content === block.content &&
      this.start === block.start &&
      this.end === block.end &&
      this.lang === block.lang &&
      this.src === block.src &&
      this.scoped === block.scoped &&
      this.module === block.module &&
      equalsRecord(this.attrs, block.attrs)
    )
  }

  calcGlobalOffset(offset: number): number {
    return this.start + offset
  }

  calcGlobalRange(range: [number, number]): [number, number] {
    return [this.calcGlobalOffset(range[0]), this.calcGlobalOffset(range[1])]
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

export function createDiffWatcher(): SFCDiffWatcher {
  return new SFCDiffWatcher()
}
