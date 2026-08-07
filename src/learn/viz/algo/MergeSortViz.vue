<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { parseNums, randArray } from '../utils.js'

const arrayIn = ref('38, 12, 71, 25, 90, 8, 54, 43')

const player = usePlayer()

const PSEUDO = [
  'mergeSort(a, l, r):',
  '  if l == r: return          // one element',
  '  m = (l + r) / 2',
  '  mergeSort(a, l, m)         // sort left half',
  '  mergeSort(a, m + 1, r)     // sort right half',
  '  merge(l, m, r):',
  '    while both halves have items:',
  '      take the smaller front item',
  '    append whatever remains',
]

function buildFrames(a0) {
  const a = [...a0]
  const frames = []
  const f = (desc, line, range, marks = {}, aux = null) => {
    const faded = {}
    if (range) for (let i = 0; i < a.length; i++) if (i < range[0] || i > range[1]) faded[i] = true
    frames.push({ vals: [...a], marks, faded, desc, line, range, aux: aux ? [...aux] : null })
  }

  f(`${a.length} unsorted elements. Merge sort's insight: merging two already-sorted lists is easy (O(N)), so keep splitting until sorting is trivial, then merge upwards.`, 0, null)

  function ms(l, r, depth) {
    if (l === r) {
      f(`[${l}..${r}] is a single element (${a[l]}), which is trivially sorted. Recursion bottoms out.`, 1, [l, r], { [l]: 'active' })
      return
    }
    const m = Math.floor((l + r) / 2)
    const marks = {}
    for (let i = l; i <= m; i++) marks[i] = 'active'
    for (let i = m + 1; i <= r; i++) marks[i] = 'compare'
    f(`(depth ${depth}) Split [${l}..${r}] at the middle: [${l}..${m}] and [${m + 1}..${r}]. No sorting yet, just divide.`, 2, [l, r], marks)
    ms(l, m, depth + 1)
    ms(m + 1, r, depth + 1)

    // merge with visible aux array
    const left = a.slice(l, m + 1), right = a.slice(m + 1, r + 1)
    const aux = []
    let i = 0, j = 0
    f(`Merge [${l}..${m}] and [${m + 1}..${r}]: both halves are now sorted, so the smallest remaining item is always at one of the two fronts.`, 5, [l, r], {}, aux)
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        aux.push(left[i])
        f(`Fronts: ${left[i]} vs ${right[j]} → take ${left[i]} from the left half.`, 7, [l, r], { [l + i]: 'active' }, aux)
        i++
      } else {
        aux.push(right[j])
        f(`Fronts: ${left[i]} vs ${right[j]} → take ${right[j]} from the right half.`, 7, [l, r], { [m + 1 + j]: 'compare' }, aux)
        j++
      }
    }
    while (i < left.length) { aux.push(left[i]); f(`Right half exhausted, so append remaining ${left[i]}.`, 8, [l, r], { [l + i]: 'active' }, aux); i++ }
    while (j < right.length) { aux.push(right[j]); f(`Left half exhausted; append remaining ${right[j]}.`, 8, [l, r], { [m + 1 + j]: 'compare' }, aux); j++ }
    for (let k2 = 0; k2 < aux.length; k2++) a[l + k2] = aux[k2]
    const doneMarks = {}
    for (let k2 = l; k2 <= r; k2++) doneMarks[k2] = 'done'
    f(`Copy the merged run back: [${l}..${r}] is now sorted.`, 5, [l, r], doneMarks)
  }
  ms(0, a.length - 1, 0)
  const all = {}
  for (let i = 0; i < a.length; i++) all[i] = 'done'
  f(`Sorted. Exactly log N levels of merging, each level touching all N elements → guaranteed O(N log N), best AND worst case. The price: the aux array, O(N) extra memory.`, 0, null, all)
  player.setFrames(frames)
}

watchEffect(() => {
  buildFrames(parseNums(arrayIn.value, { fallback: [5, 3, 8, 1], max: 12 }))
})

function randomize() {
  arrayIn.value = randArray(8, 5, 99).join(', ')
}

const view = computed(() => player.frame.value || { vals: [], marks: {}, faded: {}, aux: null })
const maxV = computed(() => Math.max(...view.value.vals, 1))

const legend = [
  ['left half', '--viz-active'],
  ['right half', '--viz-compare'],
  ['merged / sorted', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>array</label>
      <input class="input" style="flex: 1; min-width: 200px" v-model="arrayIn" />
      <button class="btn" @click="randomize">randomize</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 20px; align-items: center">
      <div class="bars" style="justify-content: center; width: 100%">
        <div
          v-for="(v, i) in view.vals"
          :key="i"
          class="bar"
          :class="[view.marks[i], { faded: view.faded[i] }]"
          :style="{ height: (v / maxV) * 100 + '%' }"
        >{{ v }}</div>
      </div>
      <div v-if="view.aux" style="display: flex; align-items: center; gap: 10px">
        <span class="cell-idx">merge buffer →</span>
        <div class="cells">
          <div v-for="(v, i) in view.aux" :key="i" class="cell done" style="min-width: 38px; height: 34px">{{ v }}</div>
          <div v-if="!view.aux.length" class="cell ghost" style="min-width: 38px; height: 34px">·</div>
        </div>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>Divide & conquer in its purest form:</strong> the "divide" steps do no work at all:
        all the sorting happens in the merges on the way back up. Merge sort is <em>stable</em> (equal
        items keep their order), which is why it backs Python's <em>sorted()</em> (Timsort) and Java's
        object sort, and it's also the standard way to sort data too big for RAM.
      </div>
    </template>
  </VisualizerShell>
</template>
