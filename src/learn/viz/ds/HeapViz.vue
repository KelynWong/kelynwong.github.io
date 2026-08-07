<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { rint } from '../utils.js'

// min-heap stored as a plain array, which is the whole point of this visualizer
const heap = ref([8, 15, 12, 41, 22, 30])
const valIn = ref(5)

const player = usePlayer()
const view = computed(() => player.frame.value || { arr: [...heap.value], marks: {}, desc: '' })

function frameOf(arr, marks = {}, desc = '') {
  return { arr: [...arr], marks: { ...marks }, desc }
}

// ---- tree layout straight from array indices ----
function treeOf(arr, marks) {
  const n = arr.length
  const depth = (i) => Math.floor(Math.log2(i + 1))
  const maxDepth = n ? depth(n - 1) : 0
  const W = Math.max(360, 2 ** maxDepth * 78)
  const nodes = []
  const edges = []
  for (let i = 0; i < n; i++) {
    const d = depth(i)
    const posInRow = i - (2 ** d - 1)
    const slots = 2 ** d
    nodes.push({
      id: i,
      label: arr[i],
      x: (W / slots) * (posInRow + 0.5),
      y: 34 + d * 62,
      cls: marks[i] || '',
      sub: `[${i}]`,
    })
    if (i > 0) edges.push({ from: Math.floor((i - 1) / 2), to: i, cls: marks[i] && marks[Math.floor((i - 1) / 2)] ? 'active' : '' })
  }
  return { nodes, edges }
}

const tree = computed(() => treeOf(view.value.arr, view.value.marks))

function push() {
  const v = Math.floor(valIn.value)
  if (!Number.isFinite(v)) return
  if (heap.value.length >= 15) {
    player.setFrames([frameOf(heap.value, {}, 'Heap is full for this demo. Pop a few first.')])
    return
  }
  const a = [...heap.value]
  const frames = []
  a.push(v)
  let i = a.length - 1
  frames.push(frameOf(a, { [i]: 'active' }, `push(${v}): append at the end of the array (index ${i}), the only spot that keeps the tree complete.`))
  while (i > 0) {
    const p = Math.floor((i - 1) / 2)
    if (a[p] <= a[i]) {
      frames.push(frameOf(a, { [i]: 'active', [p]: 'compare' }, `Parent [${p}]=${a[p]} ≤ ${a[i]}, so the heap property holds. Stop sifting.`))
      break
    }
    frames.push(frameOf(a, { [i]: 'active', [p]: 'compare' }, `Parent [${p}]=${a[p]} > ${a[i]}, which violates min-heap. Swap up. (parent index = ⌊(i−1)/2⌋)`))
    ;[a[p], a[i]] = [a[i], a[p]]
    i = p
    frames.push(frameOf(a, { [i]: 'active' }, `${v} sifted up to index ${i}. Notice the identical move in tree and array: they are the same structure.`))
  }
  heap.value = a
  frames.push(frameOf(a, { 0: 'done' }, `Done. Minimum ${a[0]} is at the root / index 0. Sift-up touched at most log N levels.`))
  player.setFrames(frames, { autoplay: true })
}

function popMin() {
  if (!heap.value.length) return
  const a = [...heap.value]
  const frames = []
  const min = a[0]
  frames.push(frameOf(a, { 0: 'done' }, `popMin(). The answer is always sitting at the root: ${min}. Reading it is O(1).`))
  const last = a.pop()
  if (a.length) {
    a[0] = last
    frames.push(frameOf(a, { 0: 'compare' }, `Move the last element (${last}) into the root to fill the hole, since the tree must stay complete.`))
    let i = 0
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2
      let s = i
      if (l < a.length && a[l] < a[s]) s = l
      if (r < a.length && a[r] < a[s]) s = r
      if (s === i) {
        frames.push(frameOf(a, { [i]: 'active' }, `${last} is ≤ both children, so the heap property is restored.`))
        break
      }
      frames.push(frameOf(a, { [i]: 'compare', [s]: 'active' }, `${a[i]} > smaller child ${a[s]}, so swap down. (children = 2i+1, 2i+2)`))
      ;[a[i], a[s]] = [a[s], a[i]]
      i = s
    }
  }
  heap.value = a
  frames.push(frameOf(a, a.length ? { 0: 'done' } : {}, `Extracted ${min}. ${a.length ? `New minimum ${a[0]} is on top.` : 'The heap is now empty.'} Total: O(log N).`))
  player.setFrames(frames, { autoplay: true })
}

function randomize() {
  const a = []
  for (let i = 0; i < 7; i++) a.push(rint(1, 99))
  // heapify silently
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
    let j = i
    for (;;) {
      const l = 2 * j + 1, r = 2 * j + 2
      let s = j
      if (l < a.length && a[l] < a[s]) s = l
      if (r < a.length && a[r] < a[s]) s = r
      if (s === j) break
      ;[a[j], a[s]] = [a[s], a[j]]
      j = s
    }
  }
  heap.value = a
  player.setFrames([frameOf(a, {}, 'New random heap (already heapified). Root is the minimum; siblings are in no particular order.')])
}

const legend = [
  ['moving element', '--viz-active'],
  ['compared parent/child', '--viz-compare'],
  ['minimum on top', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>value</label>
      <input class="input" style="width: 64px" type="number" v-model.number="valIn" @keyup.enter="push" />
      <button class="btn btn-primary" @click="push">push</button>
      <button class="btn" @click="popMin">popMin</button>
      <button class="btn" style="margin-left: auto" @click="randomize">randomize</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 24px; align-items: center">
      <TreeSvg :nodes="tree.nodes" :edges="tree.edges" />
      <div class="cells">
        <div v-for="(v, i) in view.arr" :key="i" class="cellcol">
          <div class="cell" :class="view.marks[i]">{{ v }}</div>
          <div class="cell-idx">[{{ i }}]</div>
        </div>
        <div v-if="!view.arr.length" class="state-empty">heap is empty</div>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>One structure, two views.</strong> The heap <em>is</em> the array. The tree is just how we
        read it: children of index <em>i</em> live at <em>2i+1</em> and <em>2i+2</em>. No pointers, perfect
        cache locality. Because only the root is guaranteed smallest, finding the min is O(1), which is
        exactly what a <em>priority queue</em> needs (schedulers, Dijkstra, event loops, top-K problems).
      </div>
    </template>
  </VisualizerShell>
</template>
