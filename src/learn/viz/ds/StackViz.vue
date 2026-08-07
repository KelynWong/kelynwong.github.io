<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { rint } from '../utils.js'

const MAX = 7
const items = ref([14, 52, 8]) // index 0 = bottom
const history = ref([])

const player = usePlayer()
const view = computed(() => player.frame.value || { items: items.value, marks: {}, incoming: null })

function frameOf(arr, marks = {}, desc = '', incoming = null) {
  return { items: [...arr], marks, desc, incoming }
}

function push() {
  if (items.value.length >= MAX) {
    player.setFrames([frameOf(items.value, {}, 'Stack overflow! This stack is capped at ' + MAX + ' items. Exactly what happens to the call stack with runaway recursion.')])
    return
  }
  const v = rint(5, 99)
  const frames = [frameOf(items.value, {}, `push(${v}): new items can only enter at the top.`, v)]
  items.value = [...items.value, v]
  history.value.push(`push(${v})`)
  frames.push(frameOf(items.value, { [items.value.length - 1]: 'done' }, `${v} is now the top of the stack. O(1), since no other element moved.`))
  player.setFrames(frames, { autoplay: true })
}

function pop() {
  if (!items.value.length) {
    player.setFrames([frameOf(items.value, {}, 'pop() on an empty stack causes underflow. Nothing to remove.')])
    return
  }
  const v = items.value[items.value.length - 1]
  const frames = [frameOf(items.value, { [items.value.length - 1]: 'compare' }, `pop() can only reach the top (${v}). Last In, First Out.`)]
  items.value = items.value.slice(0, -1)
  history.value.push(`pop() → ${v}`)
  frames.push(frameOf(items.value, {}, `${v} removed. The element below it is the new top. O(1).`))
  player.setFrames(frames, { autoplay: true })
}

function peek() {
  if (!items.value.length) {
    player.setFrames([frameOf(items.value, {}, 'peek(), but the stack is empty.')])
    return
  }
  const v = items.value[items.value.length - 1]
  player.setFrames([frameOf(items.value, { [items.value.length - 1]: 'active' }, `peek() → ${v}. Look at the top without removing it.`)], { autoplay: true })
}

function reset() {
  items.value = []
  history.value = []
  player.setFrames([frameOf([], {}, 'Stack cleared.')])
}

const legend = [
  ['top / peeked', '--viz-active'],
  ['popping', '--viz-compare'],
  ['just pushed', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <button class="btn btn-primary" @click="push">push()</button>
      <button class="btn" @click="pop">pop()</button>
      <button class="btn" @click="peek">peek()</button>
      <button class="btn" style="margin-left: auto" @click="reset">clear</button>
    </template>

    <div style="display: flex; justify-content: center; align-items: flex-end; gap: 40px">
      <div style="display: flex; flex-direction: column-reverse; align-items: center; gap: 6px; min-height: 260px; justify-content: flex-start">
        <div class="cell-idx" style="order: -1">bottom</div>
        <div
          v-for="(v, i) in view.items"
          :key="i"
          class="cell"
          :class="view.marks[i]"
          style="width: 120px"
        >
          {{ v }}<span v-if="i === view.items.length - 1 && !view.incoming" class="cell-idx" style="margin-left: 8px">← top</span>
        </div>
        <div v-if="view.incoming !== null" class="cell ghost" style="width: 120px">{{ view.incoming }} ↓</div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">operation history</div>
        <div class="state-body">
          <div v-if="history.length" class="state-chips">
            <span v-for="(h, i) in history.slice(-8)" :key="i" class="chip" :class="{ active: i === history.slice(-8).length - 1 }">{{ h }}</span>
          </div>
          <div v-else class="state-empty">No operations yet.</div>
        </div>
      </div>
      <div class="note">
        <strong>Where you've met stacks:</strong> Ctrl+Z undo history, the browser back button,
        matching brackets in an editor, and the call stack that tracks every function you're inside of.
        Push a return address on call, pop it on return.
      </div>
    </template>
  </VisualizerShell>
</template>
