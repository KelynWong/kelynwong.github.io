<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { rint } from '../utils.js'

// resting state
const items = ref([7, 21])
const capacity = ref(4)
const totalCopies = ref(0)

const player = usePlayer()

const view = computed(
  () => player.frame.value || { items: items.value, cap: capacity.value, marks: {}, newBlock: null }
)

function frameOf(itemsArr, cap, marks = {}, desc = '', newBlock = null) {
  return { items: [...itemsArr], cap, marks, desc, newBlock }
}

function push() {
  const v = rint(5, 99)
  const frames = []
  if (items.value.length < capacity.value) {
    frames.push(frameOf(items.value, capacity.value, {}, `push(${v}): size ${items.value.length} < capacity ${capacity.value}, so there's a free slot.`))
    items.value = [...items.value, v]
    frames.push(frameOf(items.value, capacity.value, { [items.value.length - 1]: 'done' }, `Write ${v} into the next free slot. That's all it takes: O(1).`))
  } else {
    const oldCap = capacity.value
    const newCap = oldCap * 2
    frames.push(frameOf(items.value, oldCap, {}, `push(${v}), but size ${items.value.length} = capacity ${oldCap}. The block is full and can't grow in place.`))
    frames.push({ ...frameOf(items.value, oldCap, {}, `Allocate a brand new block, twice the size: capacity ${newCap}.`), newBlock: { cap: newCap, items: [], marks: {} } })
    const copied = []
    for (let i = 0; i < items.value.length; i++) {
      copied.push(items.value[i])
      frames.push({
        ...frameOf(items.value, oldCap, { [i]: 'compare' }, `Copy element ${i} (${items.value[i]}) into the new block (${i + 1} of ${items.value.length} copies).`),
        newBlock: { cap: newCap, items: [...copied], marks: { [i]: 'compare' } },
      })
    }
    totalCopies.value += items.value.length
    const finalItems = [...items.value, v]
    frames.push({
      ...frameOf(items.value, oldCap, {}, 'Free the old block. The new block is now "the array".'),
      oldFreed: true,
      newBlock: { cap: newCap, items: [...copied], marks: {} },
    })
    items.value = finalItems
    capacity.value = newCap
    frames.push(frameOf(items.value, newCap, { [finalItems.length - 1]: 'done' }, `Finally write ${v}. This push cost O(N), but doubling means the *next* ${newCap - finalItems.length} pushes are free. Averaged out: amortized O(1).`))
  }
  player.setFrames(frames, { autoplay: true })
}

function pop() {
  if (!items.value.length) return
  const v = items.value[items.value.length - 1]
  const frames = [frameOf(items.value, capacity.value, { [items.value.length - 1]: 'compare' }, `pop() removes the last element (${v}).`)]
  items.value = items.value.slice(0, -1)
  frames.push(frameOf(items.value, capacity.value, {}, `Size is now ${items.value.length}. Capacity stays ${capacity.value}, since most implementations don't shrink eagerly.`))
  player.setFrames(frames, { autoplay: true })
}

function reset() {
  items.value = [7, 21]
  capacity.value = 4
  totalCopies.value = 0
  player.setFrames([frameOf(items.value, 4, {}, 'Reset: size 2, capacity 4.')])
}

function renderSlots(arr, cap) {
  return Array.from({ length: cap }, (_, i) => (i < arr.length ? arr[i] : null))
}

const legend = [
  ['being copied', '--viz-compare'],
  ['just written', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <button class="btn btn-primary" @click="push">push()</button>
      <button class="btn" @click="pop">pop()</button>
      <button class="btn" style="margin-left: auto" @click="reset">reset</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 22px; align-items: center">
      <div>
        <div class="cell-idx" style="margin-bottom: 6px; text-align: left" :style="view.oldFreed ? 'color: var(--code3)' : ''">
          {{ view.newBlock && view.oldFreed ? 'old block (freed)' : 'current block' }}
        </div>
        <div class="cells" :style="view.oldFreed ? 'opacity: 0.25' : ''">
          <div v-for="(v, i) in renderSlots(view.items, view.cap)" :key="i" class="cellcol">
            <div class="cell" :class="v === null ? 'ghost' : view.marks[i]">{{ v === null ? '·' : v }}</div>
            <div class="cell-idx">[{{ i }}]</div>
          </div>
        </div>
      </div>

      <div v-if="view.newBlock">
        <div class="cell-idx" style="margin-bottom: 6px; text-align: left; color: var(--accent1)">new block (2× capacity)</div>
        <div class="cells">
          <div v-for="(v, i) in renderSlots(view.newBlock.items, view.newBlock.cap)" :key="i" class="cellcol">
            <div class="cell" :class="v === null ? 'ghost' : view.newBlock.marks[i]">{{ v === null ? '·' : v }}</div>
            <div class="cell-idx">[{{ i }}]</div>
          </div>
        </div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">state</div>
        <div class="state-body">
          <div class="state-chips" style="margin-bottom: 8px">
            <span class="chip">size = {{ items.length }}</span>
            <span class="chip">capacity = {{ capacity }}</span>
            <span class="chip" :class="{ active: totalCopies > 0 }">total copies = {{ totalCopies }}</span>
          </div>
          <div class="state-empty">Keep pushing until the block fills up to trigger a resize.</div>
        </div>
      </div>
      <div class="note">
        <strong>Amortized O(1):</strong> a resize copies all N elements, but doubling means resizes get
        rarer and rarer as the array grows. Spread the copy cost across all the cheap pushes and each push
        averages out to constant time. This is exactly how Python's <em>list</em> and Java's <em>ArrayList</em> work.
      </div>
    </template>
  </VisualizerShell>
</template>
