<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { parseNums, rint } from '../utils.js'

const arrayIn = ref('-2, 4, -1, 5, -6, 3, 2, -3')
const player = usePlayer()

const PSEUDO = [
  'maxSub(l, r):',
  '  if l == r: return a[l]      // one element',
  '  m = (l + r) / 2',
  '  L = maxSub(l, m)            // best fully in left',
  '  R = maxSub(m+1, r)          // best fully in right',
  '  C = best sum crossing m     // expand out from middle',
  '  return max(L, R, C)',
]

function buildFrames(a) {
  const frames = []
  let nextId = 0
  const tnodes = []

  const f = (desc, line, cellMarks = {}, current = null) => {
    const nodes = tnodes
      .filter((t) => t.visible)
      .map((t) => ({
        id: t.id,
        label: t.l === t.r ? `[${t.l}]` : `[${t.l}..${t.r}]`,
        x: t.x, y: 26 + t.depth * 56,
        cls: t.id === current ? 'compare' : t.best !== undefined ? 'done' : 'active',
        sub: t.best !== undefined ? `best ${t.best}` : '',
      }))
    const edges = tnodes
      .filter((t) => t.visible && t.parent !== null && tnodes[t.parent].visible)
      .map((t) => ({ from: t.parent, to: t.id }))
    frames.push({ a: [...a], cellMarks, nodes, edges, desc, line })
  }

  function makeNode(l, r, depth, parent) {
    const node = { id: nextId++, l, r, depth, parent, visible: false, x: 0 }
    tnodes.push(node)
    return node
  }

  // pre-build tree for layout
  function build(l, r, depth, parent) {
    const node = makeNode(l, r, depth, parent)
    if (l < r) {
      const m = Math.floor((l + r) / 2)
      node.kids = [build(l, m, depth + 1, node.id), build(m + 1, r, depth + 1, node.id)]
    }
    return node
  }
  const root = build(0, a.length - 1, 0, null)
  let leafX = 0
  function place(node) {
    if (!node.kids) { node.x = 44 + leafX * 62; leafX++ }
    else { node.kids.forEach(place); node.x = (node.kids[0].x + node.kids[1].x) / 2 }
  }
  place(root)

  const rangeMarks = (l, r, cls) => {
    const m = {}
    for (let i = l; i <= r; i++) m[i] = cls
    return m
  }

  function solve(node) {
    node.visible = true
    const { l, r } = node
    if (l === r) {
      node.best = a[l]
      f(`[${l}..${r}] is a single element, so its best subarray is itself: ${a[l]}.`, 1, rangeMarks(l, r, 'active'), node.id)
      return a[l]
    }
    const m = Math.floor((l + r) / 2)
    f(`DIVIDE [${l}..${r}] at m=${m} into two independent halves.`, 2, rangeMarks(l, r, 'active'), node.id)
    const L = solve(node.kids[0])
    const R = solve(node.kids[1])

    // combine: best crossing sum
    f(`COMBINE [${l}..${r}]: halves say L=${L}, R=${R}, but the true best might straddle the middle. Expand outward from m=${m}.`, 5, rangeMarks(l, r, 'active'), node.id)
    let sum = 0, bestL = -Infinity, bl = m
    for (let i = m; i >= l; i--) {
      sum += a[i]
      if (sum > bestL) { bestL = sum; bl = i }
    }
    let sumR = 0, bestR = -Infinity, br = m + 1
    for (let i = m + 1; i <= r; i++) {
      sumR += a[i]
      if (sumR > bestR) { bestR = sumR; br = i }
    }
    const C = bestL + bestR
    const crossMarks = { ...rangeMarks(l, r, 'faded'), ...rangeMarks(bl, br, 'special') }
    f(`Best stretch ending at m: ${bestL} (from ${bl}). Best starting at m+1: ${bestR} (to ${br}). Crossing sum C = ${bestL} + ${bestR} = ${C}.`, 5, crossMarks, node.id)
    const best = Math.max(L, R, C)
    node.best = best
    const winner = best === C ? 'the crossing sum' : best === L ? 'the left half' : 'the right half'
    f(`max(L=${L}, R=${R}, C=${C}) = ${best}: ${winner} wins for [${l}..${r}].`, 6, rangeMarks(l, r, 'done'), node.id)
    return best
  }

  f(`Find the contiguous subarray with the largest sum. Divide & conquer: a best subarray either lives entirely in one half… or crosses the middle. That's the whole case analysis.`, 0, {})
  const ans = solve(root)
  f(`Answer: ${ans}. Every level does O(N) combine work across ~log N levels → O(N log N). (Kadane's algorithm, covered in Dynamic Programming, does it in O(N), but this decomposition pattern generalizes to sorting, closest-pair, FFT…)`, 6, {})
  player.setFrames(frames)
}

watchEffect(() => {
  const a = parseNums(arrayIn.value, { fallback: [-2, 4, -1, 5], max: 8 })
  buildFrames(a)
})

function randomize() {
  arrayIn.value = Array.from({ length: 8 }, () => rint(-6, 9)).join(', ')
}

const view = computed(() => player.frame.value || { a: [], cellMarks: {}, nodes: [], edges: [] })

const legend = [
  ['current range', '--viz-active'],
  ['crossing candidate', '--viz-special'],
  ['solved', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>array (± numbers)</label>
      <input class="input" style="flex: 1; min-width: 190px" v-model="arrayIn" />
      <button class="btn" @click="randomize">randomize</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 22px; align-items: center">
      <div class="cells">
        <div v-for="(v, i) in view.a" :key="i" class="cellcol">
          <div class="cell" :class="view.cellMarks[i]" :style="v < 0 ? 'color: var(--code3)' : ''">{{ v }}</div>
          <div class="cell-idx">[{{ i }}]</div>
        </div>
      </div>
      <TreeSvg :nodes="view.nodes" :edges="view.edges" :r="24" />
    </div>

    <template #state>
      <div class="note">
        <strong>The recipe:</strong> ① <em>Divide</em> into independent subproblems, ② <em>Conquer</em>
        each recursively, ③ <em>Combine</em>, and the combine step is where the real thinking lives
        (here: the crossing sum; in merge sort: the merge). If your subproblems <em>overlap</em> instead
        of being independent, you don't want divide & conquer; you want Dynamic Programming.
      </div>
    </template>
  </VisualizerShell>
</template>
