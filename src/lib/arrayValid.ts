export default function<T> (array: T[], value: T[]): boolean {
  for (const elem of value) {
    if (!~array.indexOf(elem)) { return false }
  }

  return true
}
