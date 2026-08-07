<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { parseNums, randArray } from '../utils.js'

const arrayIn = ref('38, 12, 71, 25, 90, 8, 54, 43, 67, 19')

const player = usePlayer()

const PSEUDO = [
  'quickSort(a, lo, hi):',
  '  if lo >= hi: return      // 0 or 1 items',
  '  pivot = a[hi]',
  '  i = lo                   // boundary of "< pivot" zone',
  '  for j = lo to hi - 1:',
  '    if a[j] < pivot:',
  '      swap(a[i], a[j]); i += 1',
  '  swap(a[i], a[hi])        // pivot to final home',
  '  quickSort(a, lo, i - 1)',
  '  quickSort(a, i + 1, hi)',
]

function buildFrames(a0) {
  const a = [...a0]
  const frames = []
  const sorted = new Set()
  const f = (desc, line, range, marks = {}) => {
    const m = { ...marks }
    for (const s of sorted) if (!m[s]) m[s] = 'done'
    const faded = {}
    if (range) for (let i = 0; i < a.length; i++) if (i < range[0] || i > range[1]) faded[i] = true
    frames.push({ vals: [...a], marks: m, faded, desc, line, range })
  }

  f(`Unsorted input, ${a.length} elements. Quick sort's plan: pick a pivot, put everything smaller on its left, bigger on its right, then recurse on the two sides.`, 0, null)

  function qs(lo, hi, depth) {
    if (lo >= hi) {
      if (lo === hi) {
        sorted.add(lo)
        f(`Range [${lo}..${hi}] has one element, so it's already sorted by definition.`, 1, [lo, hi])
      }
      return
    }
    const pivot = a[hi]
    f(`(depth ${depth}) Partition [${lo}..${hi}]. Pivot = a[${hi}] = ${pivot}. Everything else will be compared against it.`, 2, [lo, hi], { [hi]: 'special' })
    let i = lo
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivot) {
        if (i !== j) {
          f(`a[${j}]=${a[j]} < pivot ${pivot} → swap it into the "smaller" zone at index ${i}.`, 6, [lo, hi], { [hi]: 'special', [j]: 'compare', [i]: 'active' })
          ;[a[i], a[j]] = [a[j], a[i]]
        } else {
          f(`a[${j}]=${a[j]} < pivot ${pivot} → already at the zone boundary, just grow the zone.`, 6, [lo, hi], { [hi]: 'special', [j]: 'active' })
        }
        i++
      } else {
        f(`a[${j}]=${a[j]} ≥ pivot ${pivot} → leave it; it belongs on the right side.`, 5, [lo, hi], { [hi]: 'special', [j]: 'compare' })
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    sorted.add(i)
    f(`Swap the pivot into the boundary: index ${i} is ${pivot}'s FINAL sorted position. It never moves again. Left of it: smaller. Right: bigger.`, 7, [lo, hi], {})
    qs(lo, i - 1, depth + 1)
    qs(i + 1, hi, depth + 1)
  }
  qs(0, a.length - 1, 0)
  const all = {}
  for (let i = 0; i < a.length; i++) all[i] = 'done'
  f('Sorted. Average O(N log N): each level of recursion touches all N elements, and random pivots give ~log N levels. A sorted input with this pivot choice gives the dreaded O(N²).', 0, null, all)
  player.setFrames(frames)
}

watchEffect(() => {
  buildFrames(parseNums(arrayIn.value, { fallback: [5, 3, 8, 1], max: 14 }))
})

function randomize() {
  arrayIn.value = randArray(10, 5, 99).join(', ')
}

const view = computed(() => player.frame.value || { vals: [], marks: {}, faded: {} })
const maxV = computed(() => Math.max(...view.value.vals, 1))

const legend = [
  ['pivot', '--viz-special'],
  ['comparing', '--viz-compare'],
  ['"smaller" zone boundary', '--viz-active'],
  ['locked in place', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>array</label>
      <input class="input" style="flex: 1; min-width: 200px" v-model="arrayIn" />
      <button class="btn" @click="randomize">randomize</button>
    </template>

    <div class="bars" style="justify-content: center">
      <div
        v-for="(v, i) in view.vals"
        :key="i"
        class="bar"
        :class="[view.marks[i], { faded: view.faded[i] }]"
        :style="{ height: (v / maxV) * 100 + '%' }"
      >{{ v }}</div>
    </div>

    <template #state>
      <div class="note">
        <strong>Watch for:</strong> after every partition, exactly one bar turns green: the pivot has
        found its forever-home, splitting the problem in two. Grayed bars belong to other subproblems
        and are untouched. In-place, cache-friendly, and the default sort in most standard libraries
        (as introsort, which switches strategy to dodge the O(N²) worst case).
      </div>
    </template>
  </VisualizerShell>
</template>
