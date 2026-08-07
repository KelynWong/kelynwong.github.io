<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const MAX = 8
let nextTask = 4
const items = ref([{ id: 1, label: 'task-1' }, { id: 2, label: 'task-2' }, { id: 3, label: 'task-3' }])
const processed = ref([])

const player = usePlayer()
const view = computed(() => player.frame.value || { items: items.value, marks: {}, incoming: null })

function frameOf(arr, marks = {}, desc = '', incoming = null) {
  return { items: arr.map((x) => ({ ...x })), marks, desc, incoming }
}

function enqueue() {
  if (items.value.length >= MAX) {
    player.setFrames([frameOf(items.value, {}, 'Queue is full. In real systems this is backpressure: producers must wait or messages get dropped.')])
    return
  }
  const t = { id: nextTask, label: `task-${nextTask}` }
  nextTask += 1
  const frames = [frameOf(items.value, {}, `enqueue(${t.label}): new work always joins at the rear.`, t.label)]
  items.value = [...items.value, t]
  frames.push(frameOf(items.value, { [items.value.length - 1]: 'done' }, `${t.label} is now at the rear. The front is untouched. O(1).`))
  player.setFrames(frames, { autoplay: true })
}

function dequeue() {
  if (!items.value.length) {
    player.setFrames([frameOf(items.value, {}, 'dequeue() on an empty queue. A worker would just block and wait for work.')])
    return
  }
  const t = items.value[0]
  const frames = [frameOf(items.value, { 0: 'compare' }, `dequeue(): the front (${t.label}) has waited longest, so it's served first. First In, First Out.`)]
  items.value = items.value.slice(1)
  processed.value.push(t.label)
  frames.push(frameOf(items.value, {}, `${t.label} handed to a worker. Everyone effectively moves up one place.`))
  player.setFrames(frames, { autoplay: true })
}

function reset() {
  items.value = []
  processed.value = []
  nextTask = 1
  player.setFrames([frameOf([], {}, 'Queue cleared.')])
}

const legend = [
  ['dequeuing', '--viz-compare'],
  ['just enqueued', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <button class="btn btn-primary" @click="enqueue">enqueue()</button>
      <button class="btn" @click="dequeue">dequeue()</button>
      <button class="btn" style="margin-left: auto" @click="reset">clear</button>
    </template>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
      <div class="cells">
        <div class="cellcol">
          <div class="cell ghost" style="border: none; background: transparent">out ←</div>
          <div class="cell-ptr"></div>
        </div>
        <div v-for="(t, i) in view.items" :key="t.id" class="cellcol">
          <div class="cell" :class="view.marks[i]" style="min-width: 64px">{{ t.label }}</div>
          <div class="cell-ptr" :class="{ lo: i === 0, hi: i === view.items.length - 1 }">
            {{ i === 0 ? 'front' : i === view.items.length - 1 ? 'rear' : '' }}
          </div>
        </div>
        <div v-if="view.incoming" class="cellcol">
          <div class="cell ghost" style="min-width: 64px">{{ view.incoming }}</div>
          <div class="cell-ptr">joining…</div>
        </div>
        <div v-if="!view.items.length && !view.incoming" class="state-empty">queue is empty</div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">processed (in order)</div>
        <div class="state-body">
          <div v-if="processed.length" class="state-chips">
            <span v-for="(p, i) in processed" :key="i" class="chip done">{{ p }}</span>
          </div>
          <div v-else class="state-empty">Nothing processed yet. Dequeue some tasks.</div>
        </div>
      </div>
      <div class="note">
        <strong>Where you've met queues:</strong> print jobs, message brokers (RabbitMQ, SQS), CPU task
        scheduling, and BFS graph traversal. Fairness is the point: order in = order out.
      </div>
    </template>
  </VisualizerShell>
</template>
