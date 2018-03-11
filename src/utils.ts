export const no = (): boolean => false

export const identity = <T>(x: T): T => x

export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | void {
  const map = Object.create(null)
  const list = str.split(',')
  for (const item of list) {
    map[item] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

export function equalsRecord(
  a: Record<string, any>,
  b: Record<string, any>
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) {
    return false
  }

  return aKeys.reduce((acc, key) => {
    return acc && key in b && a[key] === b[key]
  }, true)
}
