<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const aIn = ref('kitten')
const bIn = ref('sitting')

const player = usePlayer()

const PSEUDO = [
  '// dp[i][j] = min edits to turn',
  '// a[0..i) into b[0..j)',
  'dp[i][0] = i   // delete everything',
  'dp[0][j] = j   // insert everything',
  'for i = 1..m, for j = 1..n:',
  '  if a[i] == b[j]:',
  '    dp[i][j] = dp[i-1][j-1]   // free!',
  '  else: dp[i][j] = 1 + min(',
  '    dp[i-1][j],     // delete a[i]',
  '    dp[i][j-1],     // insert b[j]',
  '    dp[i-1][j-1])   // substitute',
  'answer = dp[m][n]',
]

let finalDp = []
const path = ref({ cells: new Set(), ops: [], from: null })

function buildFrames(a, b) {
  const frames = []
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null))
  path.value = { cells: new Set(), ops: [], from: null }

  const f = (desc, line, marks = {}) =>
    frames.push({ a, b, grid: dp.map((r) => [...r]), marks: { ...marks }, desc, line })

  f(`How many single-character edits (insert / delete / substitute) turn "${a}" into "${b}"? Guessing is hopeless, but every prefix-vs-prefix subproblem has one best answer, so we tabulate.`, 1)
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  const baseMarks = {}
  for (let i = 0; i <= m; i++) baseMarks[`${i},0`] = 'active'
  for (let j = 0; j <= n; j++) baseMarks[`0,${j}`] = 'active'
  f(`Base cases: turning any prefix into an empty string costs its length in deletes (first column); building b's prefix from nothing costs its length in inserts (first row).`, 2, baseMarks)

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const same = a[i - 1] === b[j - 1]
      const deps = { [`${i - 1},${j}`]: 'special', [`${i},${j - 1}`]: 'special', [`${i - 1},${j - 1}`]: 'special' }
      if (same) {
        dp[i][j] = dp[i - 1][j - 1]
        f(`'${a[i - 1]}' = '${b[j - 1]}'. The characters agree, so no edit is needed: copy the diagonal (${dp[i][j]}).`, 6, { ...deps, [`${i},${j}`]: 'compare' })
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        f(`'${a[i - 1]}' ≠ '${b[j - 1]}', so pay 1 edit on top of the cheapest neighbour: ↑ delete (${dp[i - 1][j]}), ← insert (${dp[i][j - 1]}), ↖ substitute (${dp[i - 1][j - 1]}) → ${dp[i][j]}.`, 7, { ...deps, [`${i},${j}`]: 'compare' })
      }
    }
  }
  f(`Edit distance = ${dp[m][n]}. Now click ANY cell to see the exact insert/delete/substitute path that produced its cost.`, 11, { [`${m},${n}`]: 'done' })
  finalDp = dp
  player.setFrames(frames)
}

watchEffect(() => {
  const a = aIn.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
  const b = bIn.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
  buildFrames(a, b)
})

function traceback(i0, j0) {
  if (!finalDp.length || finalDp[i0]?.[j0] == null) return
  player.seek(player.frames.value.length - 1)
  const a = player.frame.value.a, b = player.frame.value.b
  const cells = new Set()
  const ops = []
  let i = i0, j = j0
  cells.add(`${i},${j}`)
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && finalDp[i][j] === finalDp[i - 1][j - 1]) {
      ops.unshift(`keep '${a[i - 1]}'`)
      i--; j--
    } else if (i > 0 && j > 0 && finalDp[i][j] === finalDp[i - 1][j - 1] + 1) {
      ops.unshift(`substitute '${a[i - 1]}' → '${b[j - 1]}'`)
      i--; j--
    } else if (i > 0 && finalDp[i][j] === finalDp[i - 1][j] + 1) {
      ops.unshift(`delete '${a[i - 1]}'`)
      i--
    } else {
      ops.unshift(`insert '${b[j - 1]}'`)
      j--
    }
    cells.add(`${i},${j}`)
  }
  path.value = { cells, ops, from: `dp[${i0}][${j0}] = ${finalDp[i0][j0]}` }
}

const view = computed(() => player.frame.value || { a: '', b: '', grid: [], marks: {} })

function cellCls(i, j) {
  if (path.value.cells.has(`${i},${j}`)) return 'special'
  return view.value.marks[`${i},${j}`] || ''
}

const legend = [
  ['base cases', '--viz-active'],
  ['being computed', '--viz-compare'],
  ['traceback path', '--viz-special'],
  ['final distance', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>from</label>
      <input class="input" style="width: 100px" v-model="aIn" />
      <label>to</label>
      <input class="input" style="width: 100px" v-model="bIn" />
      <span class="cell-idx" style="margin-left: auto">click any filled cell to trace its edits</span>
    </template>

    <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; overflow-x: auto">
      <!-- header row: characters of b -->
      <div style="display: flex; gap: 4px">
        <div class="cell ghost" style="min-width: 40px; height: 40px; border: none"></div>
        <div class="cell ghost" style="min-width: 40px; height: 40px">ε</div>
        <div v-for="(c, j) in view.b.split('')" :key="j" class="cell ghost" style="min-width: 40px; height: 40px; color: var(--accent1)">{{ c }}</div>
      </div>
      <div v-for="(row, i) in view.grid" :key="i" style="display: flex; gap: 4px">
        <div class="cell ghost" style="min-width: 40px; height: 40px; border: none; color: var(--accent1)">{{ i === 0 ? 'ε' : view.a[i - 1] }}</div>
        <div
          v-for="(v, j) in row"
          :key="j"
          class="cell"
          :class="v === null ? 'ghost' : cellCls(i, j)"
          style="min-width: 40px; height: 40px; cursor: pointer"
          @click="traceback(i, j)"
        >{{ v === null ? '·' : v }}</div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">edit path {{ path.from ? '· ' + path.from : '' }}</div>
        <div class="state-body">
          <div v-if="path.ops.length" style="display: flex; flex-direction: column; gap: 4px">
            <span
              v-for="(op, i) in path.ops"
              :key="i"
              class="chip"
              :class="op.startsWith('keep') ? 'done' : 'active'"
              style="align-self: flex-start"
            >{{ i + 1 }}. {{ op }}</span>
          </div>
          <div v-else class="state-empty">Play the fill animation, then click a cell to see which operations built its cost.</div>
        </div>
      </div>
      <div class="note">
        <strong>Same grid, different formula.</strong> This is the exact table-filling idea from the
        Dynamic Programming topic; only the cell rule changed. Edit distance (Levenshtein) powers
        spell-checkers, fuzzy search, and DNA sequence alignment. The traceback you get by clicking is
        how tools reconstruct <em>which</em> edits to make, not just how many.
      </div>
    </template>
  </VisualizerShell>
</template>
