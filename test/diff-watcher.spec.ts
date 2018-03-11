import { createDiffWatcher, SFCBlock } from '../src/index'

describe('Diff Watcher', () => {
  it('should watch template diff', () => {
    const mock1 = jest.fn((template: SFCBlock) => {
      expect(template.content).toBe('Hi')
    })
    const mock2 = jest.fn()
    const mock3 = jest.fn((template: SFCBlock) => {
      expect(template.content).toBe('Hello')
    })
    const watcher = createDiffWatcher()

    watcher.diff('test.vue', '<template>Hi</template>').template(mock1)
    watcher.diff('test.vue', '<template>Hi</template>').template(mock2)
    watcher.diff('test.vue', '<template>Hello</template>').template(mock3)

    expect(mock1).toHaveBeenCalled()
    expect(mock2).not.toHaveBeenCalled()
    expect(mock3).toHaveBeenCalled()
  })

  it('should watch script diff', () => {
    const mock1 = jest.fn((script: SFCBlock) => {
      expect(script.content).toBe('export default {}')
    })
    const mock2 = jest.fn()
    const mock3 = jest.fn((script: SFCBlock) => {
      expect(script.content).toBe('export default { name: "Test" }')
    })
    const watcher = createDiffWatcher()

    watcher.diff('test.vue', '<script>export default {}</script>').script(mock1)
    watcher.diff('test.vue', '<script>export default {}</script>').script(mock2)
    watcher
      .diff('test.vue', '<script>export default { name: "Test" }</script>')
      .script(mock3)

    expect(mock1).toHaveBeenCalled()
    expect(mock2).not.toHaveBeenCalled()
    expect(mock3).toHaveBeenCalled()
  })

  it('should watch style diff', () => {
    const mock1 = jest.fn((styles: SFCBlock[]) => {
      expect(styles[0].content).toBe('p { color: red; }')
    })
    const mock2 = jest.fn()
    const mock3 = jest.fn((styles: SFCBlock[]) => {
      expect(styles[0].content).toBe('p { color: blue; }')
    })
    const watcher = createDiffWatcher()

    watcher.diff('test.vue', '<style>p { color: red; }</style>').styles(mock1)
    watcher.diff('test.vue', '<style>p { color: red; }</style>').styles(mock2)
    watcher.diff('test.vue', '<style>p { color: blue; }</style>').styles(mock3)

    expect(mock1).toHaveBeenCalled()
    expect(mock2).not.toHaveBeenCalled()
    expect(mock3).toHaveBeenCalled()
  })

  it('should watch custom block diff', () => {
    const mock1 = jest.fn((blocks: SFCBlock[]) => {
      expect(blocks[0].content).toBe('# Hello')
    })
    const mock2 = jest.fn()
    const mock3 = jest.fn((blocks: SFCBlock[]) => {
      expect(blocks[0].content).toBe('# World')
    })
    const watcher = createDiffWatcher()

    watcher.diff('test.vue', '<docs># Hello</docs>').customBlocks('docs', mock1)
    watcher.diff('test.vue', '<docs># Hello</docs>').customBlocks('docs', mock2)
    watcher.diff('test.vue', '<docs># World</docs>').customBlocks('docs', mock3)

    expect(mock1).toHaveBeenCalled()
    expect(mock2).not.toHaveBeenCalled()
    expect(mock3).toHaveBeenCalled()
  })
})
