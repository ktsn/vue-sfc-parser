import { createDiffWatcher, SFCBlock } from '../src/index'

describe('Diff Watcher', () => {
  it('should watch template diff', () => {
    const mock1 = jest.fn()
    const mock2 = jest.fn((template: SFCBlock) => {
      expect(template.content).toBe('Hello')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<template>Hi</template>')
    watcher.diff('test.vue', '<template>Hi</template>').template(mock1)
    watcher.diff('test.vue', '<template>Hello</template>').template(mock2)

    expect(mock1).not.toHaveBeenCalled()
    expect(mock2).toHaveBeenCalled()
  })

  it('should watch script diff', () => {
    const mock1 = jest.fn()
    const mock2 = jest.fn((script: SFCBlock) => {
      expect(script.content).toBe('export default { name: "Test" }')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<script>export default {}</script>')
    watcher.diff('test.vue', '<script>export default {}</script>').script(mock1)
    watcher
      .diff('test.vue', '<script>export default { name: "Test" }</script>')
      .script(mock2)

    expect(mock1).not.toHaveBeenCalled()
    expect(mock2).toHaveBeenCalled()
  })

  it('should watch style diff', () => {
    const mock1 = jest.fn()
    const mock2 = jest.fn((styles: SFCBlock[]) => {
      expect(styles[0].content).toBe('p { color: blue; }')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<style>p { color: red; }</style>')
    watcher.diff('test.vue', '<style>p { color: red; }</style>').styles(mock1)
    watcher.diff('test.vue', '<style>p { color: blue; }</style>').styles(mock2)

    expect(mock1).not.toHaveBeenCalled()
    expect(mock2).toHaveBeenCalled()
  })

  it('should watch custom block diff', () => {
    const mock1 = jest.fn()
    const mock2 = jest.fn((blocks: SFCBlock[]) => {
      expect(blocks[0].content).toBe('# World')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<docs># Hello</docs>')
    watcher.diff('test.vue', '<docs># Hello</docs>').customBlocks('docs', mock1)
    watcher.diff('test.vue', '<docs># World</docs>').customBlocks('docs', mock2)

    expect(mock1).not.toHaveBeenCalled()
    expect(mock2).toHaveBeenCalled()
  })

  it('should return descriptor when add to watcher', () => {
    const watcher = createDiffWatcher()
    const code = `
    <template>Hi</template>
    <script>export default {}</script>
    <style>p { color: red; }</style>
    <docs># Hello</docs>
    `

    const desc = watcher.add('test.vue', code)
    expect(desc.template!.content).toBe('Hi')
    expect(desc.script!.content).toBe('export default {}')
    expect(desc.styles[0].content).toBe('p { color: red; }')
    expect(desc.customBlocks[0].type).toBe('docs')
    expect(desc.customBlocks[0].content).toBe('# Hello')
  })

  it('should remove from watcher', () => {
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<template>Hi</template>')
    watcher.remove('test.vue')
    expect(() => {
      watcher.diff('test.vue', '<template>Hi</template>')
    }).toThrow()
  })

  it('should call when the block is disappeared', () => {
    const mock = jest.fn()
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<template>Hi</template>')
    watcher.diff('test.vue', '').template(mock)

    expect(mock).toHaveBeenCalledWith(null)
  })

  it('should call when the block position is changed', () => {
    const mock = jest.fn((template: SFCBlock) => {
      expect(template.start).toBe(27)
      expect(template.end).toBe(29)
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<template>Hi</template>')
    watcher
      .diff('test.vue', '<script></script><template>Hi</template>')
      .template(mock)

    expect(mock).toHaveBeenCalled()
  })

  it('should call when the lang is changed', () => {
    const mock = jest.fn((script: SFCBlock) => {
      expect(script.lang).toBe('ts')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<script          >export default {}</script>')
    watcher
      .diff('test.vue', '<script lang="ts">export default {}</script>')
      .script(mock)

    expect(mock).toHaveBeenCalled()
  })

  it('should call when the src attribute is changed', () => {
    const mock = jest.fn((script: SFCBlock) => {
      expect(script.src).toBe('./bar.js')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<script src="./foo.js"></script>')
    watcher.diff('test.vue', '<script src="./bar.js"></script>').script(mock)

    expect(mock).toHaveBeenCalled()
  })

  it('should call when the scoped attribute is changed', () => {
    const mock = jest.fn((styles: SFCBlock[]) => {
      expect(styles[0].scoped).toBe(true)
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<style       >p { color: red; }</style>')
    watcher
      .diff('test.vue', '<style scoped>p { color: red; }</style>')
      .styles(mock)

    expect(mock).toHaveBeenCalled()
  })

  it('should call when the module attribute is changed', () => {
    const mock = jest.fn((styles: SFCBlock[]) => {
      expect(styles[0].module).toBe('bar')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<style module="foo">p { color: red; }</style>')
    watcher
      .diff('test.vue', '<style module="bar">p { color: red; }</style>')
      .styles(mock)

    expect(mock).toHaveBeenCalled()
  })

  it('should call when any attributes are changed', () => {
    const mock = jest.fn((test: SFCBlock[]) => {
      expect(test[0].attrs.foo).toBe('world')
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<test foo="hello"># Hello</test>')
    watcher
      .diff('test.vue', '<test foo="world"># Hello</test>')
      .customBlocks('test', mock)

    expect(mock).toHaveBeenCalled()
  })

  it('should call when block number is changed', () => {
    const mock1 = jest.fn((styles: SFCBlock[]) => {
      expect(styles.length).toBe(3)
    })
    const mock2 = jest.fn((styles: SFCBlock[]) => {
      expect(styles.length).toBe(2)
    })
    const watcher = createDiffWatcher()

    watcher.add('test.vue', '<style></style>')
    watcher
      .diff('test.vue', '<style></style><style></style><style></style>')
      .styles(mock1)
    watcher.diff('test.vue', '<style></style><style></style>').styles(mock2)

    expect(mock1).toHaveBeenCalled()
    expect(mock2).toHaveBeenCalled()
  })
})
