<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const rowsIn = ref(4)
const colsIn = ref(5)
const player = usePlayer()

const PSEUDO = [
  '// robot walks only RIGHT or DOWN',
  '// how many paths corner to corner?',
  'dp[0][j] = 1 for all j   // top row',
  'dp[i][0] = 1 for all i   // left col',
  'for i = 1 to m-1:',
  '  for j = 1 to n-1:',
  '    dp[i][j] = dp[i-1][j]   // from above',
  '            + dp[i][j-1]    // from left',
  'return dp[m-1][n-1]',
]

function buildFrames(m, n) {
  const frames = []
  const grid = Array.from({ length: m }, () => Array(n).fill(null))
  const f = (desc, line, marks = {}) =>
    frames.push({ grid: grid.map((r) => [...r]), marks: { ...marks }, desc, line, m, n })

  f(`A robot starts top-left and can only move right or down. How many distinct routes reach the bottom-right of this ${m}×${n} grid? Brute force would walk all of them (exponentially many).`, 1)
  f(`The DP move: define dp[i][j] = number of ways to reach cell (i,j). Answer each tiny question once, store it, build upwards.`, 1)

  for (let j = 0; j < n; j++) {
    grid[0][j] = 1
    f(`Base case: dp[0][${j}] = 1: the only way to reach a top-row cell is to slide straight right.`, 2, { [`0,${j}`]: 'active' })
  }
  for (let i = 1; i < m; i++) {
    grid[i][0] = 1
    f(`Base case: dp[${i}][0] = 1, since left-column cells are only reachable by going straight down.`, 3, { [`${i},0`]: 'active' })
  }
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      f(`Cell (${i},${j}): a robot can only arrive from ABOVE (${grid[i - 1][j]} ways) or from the LEFT (${grid[i][j - 1]} ways). Both are already solved; that's why the fill order matters.`, 6, { [`${i},${j}`]: 'compare', [`${i - 1},${j}`]: 'special', [`${i},${j - 1}`]: 'special' })
      grid[i][j] = grid[i - 1][j] + grid[i][j - 1]
      f(`dp[${i}][${j}] = ${grid[i - 1][j]} + ${grid[i][j - 1]} = ${grid[i][j]}. Stored, so no path through here is ever recounted.`, 7, { [`${i},${j}`]: 'active', [`${i - 1},${j}`]: 'faded-dep', [`${i},${j - 1}`]: 'faded-dep' })
    }
  }
  f(`Answer: dp[${m - 1}][${n - 1}] = ${grid[m - 1][n - 1]} paths, computed with just ${m * n} cell fills instead of exploring ${grid[m - 1][n - 1]} routes. That's O(m·n).`, 8, { [`${m - 1},${n - 1}`]: 'done' })
  player.setFrames(frames)
}

watchEffect(() => {
  const m = Math.max(2, Math.min(7, Math.floor(rowsIn.value) || 4))
  const n = Math.max(2, Math.min(8, Math.floor(colsIn.value) || 5))
  buildFrames(m, n)
})

const view = computed(() => player.frame.value || { grid: [], marks: {} })

function cellCls(i, j) {
  const m = view.value.marks[`${i},${j}`]
  if (m === 'faded-dep') return ''
  return m
}

const legend = [
  ['just filled', '--viz-active'],
  ['being computed', '--viz-compare'],
  ['its two subproblems', '--viz-special'],
  ['final answer', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>rows</label>
      <input class="input" style="width: 52px" type="number" min="2" max="7" v-model.number="rowsIn" />
      <label>cols</label>
      <input class="input" style="width: 52px" type="number" min="2" max="8" v-model.number="colsIn" />
      <span class="cell-idx" style="margin-left: auto">robot: top-left → bottom-right, only → and ↓</span>
    </template>

    <div style="display: flex; flex-direction: column; gap: 6px; align-items: center">
      <div v-for="(row, i) in view.grid" :key="i" style="display: flex; gap: 6px">
        <div
          v-for="(v, j) in row"
          :key="j"
          class="cell"
          :class="v === null ? 'ghost' : cellCls(i, j)"
          style="min-width: 52px; height: 52px"
        >{{ v === null ? '·' : v }}</div>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>DP = recursion + memory.</strong> The Recursion visualizer showed fib(n) recomputing the
        same subproblems exponentially many times (the yellow nodes). DP fixes that two ways:
        <em>memoization</em> (top-down: recurse, but cache every answer) and <em>tabulation</em>, the one
        you're watching (bottom-up: fill a table so every dependency is ready before it's needed).
        Spot it in the wild: "count the ways", "min/max cost", overlapping subproblems.
        Edit distance, knapsack and longest-common-subsequence are all just different cell formulas
        on this same grid.
      </div>
    </template>
  </VisualizerShell>
</template>
