import { parseComponent } from '../src/index'

describe('Vue SFC Parser', () => {
  it('should parse block contents', () => {
    const code = `
    <template>
      <p>Hi</p>
    </template>

    <script>
    export default {}
    </script>

    <style>
    p {
      color: blue;
    }
    </style>

    <docs>
    # Test Component
    </docs>
    `
    const res = parseComponent(code)
    const templateExpected = `
      <p>Hi</p>
    `
    const scriptExpected = `
    export default {}
    `
    const styleExpected = `
    p {
      color: blue;
    }
    `
    const docsExpected = `
    # Test Component
    `
    expect(res.template!.content).toEqual(templateExpected)
    expect(res.script!.content).toEqual(scriptExpected)
    expect(res.styles[0].content).toEqual(styleExpected)
    expect(res.customBlocks[0].type).toBe('docs')
    expect(res.customBlocks[0].content).toEqual(docsExpected)
  })

  it('should provide modified position', () => {
    const code = `
    <template>
      <p>Hi</p>
    </template>
    <script lang="ts">
    export default {}
    </script>
    `
    const res = parseComponent(code)
    expect(res.template!.modifyOffset(7)).toBe(22)
    expect(res.script!.modifyOffset(5)).toBe(75)
  })
})
