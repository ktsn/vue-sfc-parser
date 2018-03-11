import assert = require('assert')
import { SFCBlock, parseComponent, SFCDescriptor } from './index'

export class SFCDiffWatcher {
  private prevMap: Record<string, SFCDescriptor> = {}

  add(filename: string, content: string): SFCDescriptor {
    return (this.prevMap[filename] = parseComponent(content))
  }

  remove(filename: string): void {
    delete this.prevMap[filename]
  }

  diff(filename: string, content: string): SFCDiff {
    assert(
      this.prevMap.hasOwnProperty(filename),
      'must call `add` before calling `diff`'
    )

    const prev = this.prevMap[filename]
    const curr = (this.prevMap[filename] = parseComponent(content))
    return new SFCDiff(prev, curr)
  }
}

export class SFCDiff {
  constructor(private prev: SFCDescriptor, private curr: SFCDescriptor) {}

  template(cb: (block: SFCBlock | null) => void): this {
    const prev = this.prev.template
    const curr = this.curr.template
    if (this.hasDiff(prev, curr)) {
      cb(curr)
    }

    return this
  }

  script(cb: (block: SFCBlock | null) => void): this {
    const prev = this.prev.script
    const curr = this.curr.script
    if (this.hasDiff(prev, curr)) {
      cb(curr)
    }

    return this
  }

  styles(cb: (blocks: SFCBlock[]) => void): this {
    const prev = this.prev.styles
    const curr = this.curr.styles
    if (this.hasListDiff(prev, curr)) {
      cb(curr)
    }

    return this
  }

  customBlocks(name: string, cb: (blocks: SFCBlock[]) => void): this {
    const prev = this.prev.customBlocks
    const curr = this.curr.customBlocks
    if (this.hasListDiff(prev, curr)) {
      cb(curr)
    }

    return this
  }

  private hasDiff(prev: SFCBlock | null, curr: SFCBlock | null): boolean {
    if (prev === null || curr === null) {
      return prev !== curr
    }

    return !prev.equals(curr)
  }

  private hasListDiff(prev: SFCBlock[], curr: SFCBlock[]): boolean {
    if (prev.length !== curr.length) {
      return true
    }

    return prev.reduce((acc, p, i) => {
      return acc && this.hasDiff(p, curr[i])
    }, true)
  }
}
