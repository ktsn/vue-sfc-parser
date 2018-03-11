# Vue SFC Parser

Vue.js single file component parser for static analysis.

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

### `parseComponent(code: string): SFCDescriptor`

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

### `createDiffWatcher(): SFCDiffWatcher`

Create a watcher object which will detect each SFC block's diff. `SFCDiffWatcher` has following methods:

* `add(filename: string, content: string): void`
* `remove(filename: string): void`
* `diff(filename: string, content: string): SFCDiff`

You can add/remove SFC file to the watcher by using `add`/`remove` methods. Then you obtain each SFC block's diff by using `diff` method. It returns an object having some methods which you can register callbacks that will called when the corresponding blocks are changed.

Example:

```js
const { createDiffWatcher } = require('vue-sfc-parser')
const fs = require('fs')
const chokidar = require('chokidar')

const watcher = createDiffWatcher()

chokidar
  .watch('**/*.vue')
  .on('add', filename => {
    watcher.add(filename, fs.readFileSync(filename, 'utf8'))
  })
  .on('unlink', filename => {
    watcher.add(filename)
  })
  .on('change', filename => {
    watcher
      .diff(filename, fs.readFileSync(filename, 'utf8'))
      .template(template => {
        console.log(template.content)
      })
      .script(script => {
        console.log(script.content)
      })
      .styles(styles => {
        styles.forEach(s => {
          console.log(s.content)
        })
      })
      .customBlocks('block-name', blocks => {
        blocks.forEach(b => {
          console.log(b.content)
        })
      })
  })
```

## License

MIT
