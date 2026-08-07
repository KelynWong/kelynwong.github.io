<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { GRAPH8, neighborsOf } from '../shared/sampleGraphs.js'

const startIn = ref(0)
const player = usePlayer()

const PSEUDO = [
  'visited = {start}, dist[start] = 0',
  'queue = [start]',
  'while queue is not empty:',
  '  u = queue.dequeue()      // FIFO!',
  '  for each neighbor v of u:',
  '    if v not visited:',
  '      visited.add(v)',
  '      dist[v] = dist[u] + 1',
  '      queue.enqueue(v)',
]

const labels = GRAPH8.nodes.map((n) => n.label)

function buildFrames(start) {
  const adj = neighborsOf(GRAPH8.edges)
  const frames = []
  const dist = {}
  const treeEdges = new Set()
  const state = {} // id -> 'queued' | 'current' | 'done'

  const f = (desc, line, queue, current = null) => {
    const nodes = GRAPH8.nodes.map((n) => ({
      ...n,
      cls: n.id === current ? 'compare' : state[n.id] === 'done' ? 'done' : state[n.id] === 'queued' ? 'active' : '',
      sub: dist[n.id] !== undefined ? `d=${dist[n.id]}` : '',
    }))
    const edges = GRAPH8.edges.map(([a, b]) => ({
      from: a, to: b,
      cls: treeEdges.has(`${a}-${b}`) || treeEdges.has(`${b}-${a}`) ? 'done' : '',
    }))
    frames.push({ nodes, edges, queue: queue.map((q) => labels[q]), desc, line })
  }

  const queue = [start]
  dist[start] = 0
  state[start] = 'queued'
  f(`BFS from ${labels[start]}. It starts in the queue with distance 0. The queue's FIFO order is the whole algorithm.`, 1, queue)

  while (queue.length) {
    const u = queue.shift()
    state[u] = 'current'
    f(`Dequeue ${labels[u]} (dist ${dist[u]}), the oldest entry. Because the queue is FIFO, we always finish distance ${dist[u]} before touching distance ${dist[u] + 1}.`, 3, queue, u)
    for (const v of adj[u] || []) {
      if (dist[v] === undefined) {
        dist[v] = dist[u] + 1
        state[v] = 'queued'
        treeEdges.add(`${u}-${v}`)
        queue.push(v)
        f(`${labels[v]} is unvisited: mark it, set dist = ${dist[v]}, enqueue it. First discovery = shortest path guaranteed.`, 8, queue, u)
      } else {
        f(`Neighbor ${labels[v]} already visited (dist ${dist[v]}), so skip it. Revisiting could only find an equal-or-longer path.`, 5, queue, u)
      }
    }
    state[u] = 'done'
  }
  f(`Queue is empty. Every reachable vertex is labeled with its shortest hop-distance from ${labels[start]}. Total work: each vertex and edge touched once, O(V + E).`, 2, [])
  player.setFrames(frames)
}

watchEffect(() => buildFrames(Number(startIn.value)))

const view = computed(() => player.frame.value || { nodes: [], edges: [], queue: [] })

const legend = [
  ['in queue (frontier)', '--viz-active'],
  ['being processed', '--viz-compare'],
  ['visited', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>start vertex</label>
      <select class="input" v-model="startIn">
        <option v-for="n in GRAPH8.nodes" :key="n.id" :value="n.id">{{ n.label }}</option>
      </select>
      <span class="cell-idx" style="margin-left: auto">green edges = the BFS tree (shortest paths)</span>
    </template>

    <TreeSvg :nodes="view.nodes" :edges="view.edges" />

    <template #state>
      <div class="panel">
        <div class="panel-title">queue (front → rear)</div>
        <div class="state-body">
          <div v-if="view.queue.length" class="state-chips">
            <span v-for="(q, i) in view.queue" :key="i" class="chip" :class="{ active: i === 0 }">{{ q }}</span>
          </div>
          <div v-else class="state-empty">empty</div>
        </div>
      </div>
      <div class="note">
        <strong>Why BFS finds shortest paths:</strong> the queue processes vertices in strict discovery
        order, so the frontier expands one ring at a time, like a ripple. A vertex is always reached
        first via a shortest route. Swap the queue for a stack and you get DFS; swap it for a priority
        queue keyed by distance and you get Dijkstra.
      </div>
    </template>
  </VisualizerShell>
</template>
