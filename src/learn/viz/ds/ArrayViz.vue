<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { rint } from '../utils.js'

const SIZE = 8
const BASE = 0x1000

const values = ref([12, 47, 8, 93, 25, 61, 34, 79])
const accessIdx = ref(3)
const searchVal = ref(61)

const player = usePlayer()

const view = computed(() => player.frame.value || { values: values.value, marks: {}, faded: {} })

function addr(i) {
  return '0x' + (BASE + i * 4).toString(16).toUpperCase()
}

function snapshot(marks = {}, desc = '', extra = {}) {
  return { values: [...values.value], marks, desc, ...extra }
}

function runAccess() {
  const i = Math.max(0, Math.min(SIZE - 1, Math.floor(accessIdx.value)))
  accessIdx.value = i
  player.setFrames([
    snapshot({}, `access(${i}): the array knows its base address (${addr(0)}) and that every element is 4 bytes wide.`),
    snapshot({}, `Compute the address directly: ${addr(0)} + ${i} × 4 bytes = ${addr(i)}. No scanning needed.`),
    snapshot({ [i]: 'active' }, `Jump straight to ${addr(i)} and read the value ${values.value[i]}. One step, no matter how big the array is. That's O(1).`),
  ], { autoplay: true })
}

function runSearch() {
  const target = Math.floor(searchVal.value)
  const frames = [snapshot({}, `search(${target}). The array is unsorted, so there's no shortcut: we must check each cell one by one.`)]
  for (let i = 0; i < SIZE; i++) {
    if (values.value[i] === target) {
      frames.push(snapshot({ [i]: 'done' }, `values[${i}] = ${target}. Found it after checking ${i + 1} cell${i ? 's' : ''}. Linear search is O(N).`))
      player.setFrames(frames, { autoplay: true })
      return
    }
    frames.push(snapshot({ [i]: 'compare' }, `Check values[${i}] = ${values.value[i]}. Not ${target}, keep scanning.`))
  }
  frames.push(snapshot({}, `Scanned all ${SIZE} cells and ${target} is not in the array. Worst case we touch every element: O(N).`))
  player.setFrames(frames, { autoplay: true })
}

function shuffle() {
  values.value = Array.from({ length: SIZE }, () => rint(5, 99))
  player.setFrames([snapshot({}, 'New random values. The block of memory itself never moves or grows, because an array is fixed-size.')])
}

const legend = [
  ['direct access', '--viz-active'],
  ['comparing', '--viz-compare'],
  ['found', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>index</label>
      <input class="input" style="width: 60px" type="number" min="0" :max="SIZE - 1" v-model.number="accessIdx" />
      <button class="btn" @click="runAccess">access(i)</button>
      <label style="margin-left: 12px">value</label>
      <input class="input" style="width: 70px" type="number" v-model.number="searchVal" />
      <button class="btn" @click="runSearch">search(v)</button>
      <button class="btn" style="margin-left: auto" @click="shuffle">randomize</button>
    </template>

    <div class="cells" style="justify-content: center">
      <div v-for="(v, i) in view.values" :key="i" class="cellcol">
        <div class="cell" :class="view.marks[i]">{{ v }}</div>
        <div class="cell-idx">[{{ i }}]</div>
        <div class="cell-idx" style="opacity: 0.7">{{ addr(i) }}</div>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>Why O(1) access?</strong> All {{ SIZE }} elements sit in one contiguous block of memory.
        The address of element <em>i</em> is just <em>base + i × elementSize</em>: a single multiplication,
        never a scan. The trade-off: the size is fixed at creation, and inserting in the middle means
        shifting everything after it.
      </div>
    </template>
  </VisualizerShell>
</template>
