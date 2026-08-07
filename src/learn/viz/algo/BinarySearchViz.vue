<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { parseNums, randArray } from '../utils.js'

const arrayIn = ref('3, 9, 14, 21, 27, 38, 42, 55, 67, 71, 84, 92')
const targetIn = ref(42)

const player = usePlayer()

const PSEUDO = [
  'lo = 0, hi = n - 1',
  'while lo <= hi:',
  '  mid = (lo + hi) / 2',
  '  if a[mid] == target:',
  '    return mid',
  '  else if a[mid] < target:',
  '    lo = mid + 1        // discard left half',
  '  else:',
  '    hi = mid - 1        // discard right half',
  'return NOT_FOUND',
]

function buildFrames(a, target) {
  const frames = []
  const f = (desc, line, lo, hi, mid = null, marks = {}) => {
    const faded = {}
    for (let i = 0; i < a.length; i++) if (i < lo || i > hi) faded[i] = true
    frames.push({ a: [...a], lo, hi, mid, marks, faded, desc, line })
  }
  let lo = 0, hi = a.length - 1
  f(`Searching for ${target}. The array is sorted, which is the precondition that makes all of this work.`, 0, lo, hi)
  let steps = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    steps++
    f(`Window is [${lo}..${hi}] (${hi - lo + 1} candidates). Probe the middle: mid = ${mid}.`, 2, lo, hi, mid, { [mid]: 'special' })
    if (a[mid] === target) {
      f(`a[${mid}] = ${target}: found in ${steps} probe${steps === 1 ? '' : 's'}! Linear search could have taken ${a.length}.`, 4, lo, hi, mid, { [mid]: 'done' })
      player.setFrames(frames)
      return
    }
    if (a[mid] < target) {
      f(`a[${mid}] = ${a[mid]} < ${target}. Since the array is sorted, the answer can't be at ${mid} or anywhere left of it, so discard ${mid - lo + 1} elements at once.`, 6, mid + 1, hi, null, {})
      lo = mid + 1
    } else {
      f(`a[${mid}] = ${a[mid]} > ${target}. Everything from ${mid} rightwards is too big. Discard ${hi - mid + 1} elements at once.`, 8, lo, mid - 1, null, {})
      hi = mid - 1
    }
  }
  f(`lo crossed hi, so the window is empty. ${target} is not in the array. Only ${steps} probes for ${a.length} elements: O(log N).`, 9, lo, hi)
  player.setFrames(frames)
}

watchEffect(() => {
  const a = parseNums(arrayIn.value, { fallback: [3, 9, 14, 21] }).sort((x, y) => x - y)
  buildFrames(a, Math.floor(targetIn.value))
})

function randomize() {
  const a = [...new Set(randArray(12, 1, 99))].sort((x, y) => x - y)
  arrayIn.value = a.join(', ')
  targetIn.value = a[Math.floor(Math.random() * a.length)]
}

const view = computed(() => player.frame.value || { a: [], marks: {}, faded: {} })

const legend = [
  ['mid probe', '--viz-special'],
  ['found', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>sorted array</label>
      <input class="input" style="flex: 1; min-width: 190px" v-model="arrayIn" />
      <label>target</label>
      <input class="input" style="width: 64px" type="number" v-model.number="targetIn" />
      <button class="btn" @click="randomize">randomize</button>
    </template>

    <div class="cells" style="justify-content: center">
      <div v-for="(v, i) in view.a" :key="i" class="cellcol">
        <div class="cell-ptr mid">{{ view.mid === i ? 'mid' : '' }}</div>
        <div class="cell" :class="[view.marks[i], { faded: view.faded[i] }]">{{ v }}</div>
        <div class="cell-idx">[{{ i }}]</div>
        <div class="cell-ptr" :class="{ lo: view.lo === i, hi: view.hi === i }">
          {{ view.lo === i && view.hi === i ? 'lo=hi' : view.lo === i ? 'lo' : view.hi === i ? 'hi' : '' }}
        </div>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>The power of halving:</strong> every probe eliminates half of what's left. 12 elements
        need at most 4 probes; a <em>billion</em> elements need just 30. Grayed-out cells are memory the
        algorithm never has to look at again.
      </div>
    </template>
  </VisualizerShell>
</template>
