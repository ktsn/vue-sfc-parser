# Vue SFC Parser

Vue.js single file component parser with some helpers.

## Usage

Vue SFC Parser is similar to [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler)'s `parseComponent` but has some useful helpers for code analysis.

```js
const { parseComponent } = require('vue-sfc-parser')

const code = `
<template>
  <p>Hi</p>
</template>

<script lang="ts">
export default {}
</script>
`

const res = parseComponent(code)
console.log(res.template.calcGlobalOffset(7))
console.log(res.script.calcGlobalOffset(5))
```

## References

* `parseComponent(code: string): SFCDescriptor`

  This is almost same as `vue-template-compiler`'s `parseComponent`. `SFCDescriptor` is looks like following:

  ```ts
  interface SFCDescriptor {
    template: SFCBlock | null
    script: SFCBlock | null
    styles: SFCBlock[]
    customBlocks: SFCBlock[]
  }
  ```

  The `SFCBlcok` is similar to `vue-template-compiler` one too, but having additional helper methods.

### Additional Helpers of SFCBlock

* `calcGlobalOffset(offset: number): number`
* `calcGlobalRange(range: [number, number]): [number, number]`

  These methods are for calcurating global position from block position. For example:

  ```vue
  <docs>Test Docs</docs>
  <template>
    <p>Hi</p>
  </template>
  ```

  On the above SFC, if you provide `5` to `template.calcGlobalOffset` which indicates the position from the beggining of template block, it will return `38` which is the position from the beggining of the file.

## License

MIT
