/*!
 * Vue SFC Parser
 * Copyright (c) Evan You
 * MIT License
 * Original code is from https://github.com/vuejs/vue
 */

import { parseHTML } from './html-parser'
import { makeMap } from './utils'

const splitRE = /\r?\n/g
const replaceRE = /./g
const isSpecialTag = makeMap('script,style,template', true) as (
  key: string
) => key is 'script' | 'style' | 'template'

interface Attribute {
  name: string
  value: string
}

export interface SFCDescriptorRaw {
  template: SFCBlockRaw | null
  script: SFCBlockRaw | null
  styles: SFCBlockRaw[]
  customBlocks: SFCBlockRaw[]
}

export interface SFCBlockRaw {
  type: string
  content: string
  attrs: Record<string, string | true>
  start: number
  end: number
  lang?: string
  src?: string
  scoped?: true
  module?: string | true
}

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 */
export function parseComponent(
  content: string,
  options: Record<string, any> = {}
): SFCDescriptorRaw {
  const sfc: SFCDescriptorRaw = {
    template: null,
    script: null,
    styles: [],
    customBlocks: []
  }
  let depth = 0
  let currentBlock: SFCBlockRaw | null = null

  function start(
    tag: string,
    attrs: Array<Attribute>,
    unary: boolean,
    start: number,
    end: number
  ) {
    if (depth === 0) {
      currentBlock = {
        type: tag,
        content: '',
        start: end,
        end,
        attrs: attrs.reduce(
          (cumulated, { name, value }) => {
            cumulated[name] = value || true
            return cumulated
          },
          {} as Record<string, string | true>
        )
      }
      if (isSpecialTag(tag)) {
        checkAttrs(currentBlock, attrs)
        if (tag === 'style') {
          sfc.styles.push(currentBlock)
        } else {
          sfc[tag] = currentBlock
        }
      } else {
        // custom blocks
        sfc.customBlocks.push(currentBlock)
      }
    }
    if (!unary) {
      depth++
    }
  }

  function checkAttrs(block: SFCBlockRaw, attrs: Attribute[]) {
    for (const attr of attrs) {
      if (attr.name === 'lang') {
        block.lang = attr.value
      }
      if (attr.name === 'scoped') {
        block.scoped = true
      }
      if (attr.name === 'module') {
        block.module = attr.value || true
      }
      if (attr.name === 'src') {
        block.src = attr.value
      }
    }
  }

  function end(tag: string, start: number, end: number) {
    if (depth === 1 && currentBlock) {
      currentBlock.end = start
      currentBlock.content = content.slice(currentBlock.start, currentBlock.end)
      currentBlock = null
    }
    depth--
  }

  parseHTML(content, {
    start,
    end
  })

  return sfc
}
