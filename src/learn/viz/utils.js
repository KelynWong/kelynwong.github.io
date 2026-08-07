export function rint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randArray(n, min = 5, max = 99) {
  return Array.from({ length: n }, () => rint(min, max))
}

export function parseNums(str, { max = 16, fallback = [] } = {}) {
  const nums = String(str)
    .split(/[\s,]+/)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
    .slice(0, max)
  return nums.length ? nums : fallback
}
