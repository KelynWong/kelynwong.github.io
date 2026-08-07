<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { WGRAPH, neighborsOf } from '../shared/sampleGraphs.js'

const startIn = ref(0)
const targetIn = ref(7)
const player = usePlayer()

const PSEUDO = [
  'dist[all] = ∞; dist[start] = 0',
  'pq = {(0, start)}      // min-heap by dist',
  'while pq not empty:',
  '  u = pq.extractMin()',
  '  if u already settled: skip',
  '  settle u: dist[u] is now FINAL',
  '  for each edge (u, v, w):',
  '    if dist[u] + w < dist[v]:',
  '      dist[v] = dist[u] + w   // relax',
  '      prev[v] = u; pq.add(dist[v], v)',
]

const labels = WGRAPH.nodes.map((n) => n.label)

function buildFrames(start, target) {
  const adj = neighborsOf(WGRAPH.edges, true)
  const frames = []
  const dist = {}
  const prev = {}
  const settled = new Set()
  const treeEdges = new Set()

  const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)

  const f = (desc, line, pq, current = null, hotEdge = null, pathEdges = null) => {
    const nodes = WGRAPH.nodes.map((n) => ({
      ...n,
      cls: n.id === current ? 'compare' : settled.has(n.id) ? 'done' : dist[n.id] !== undefined ? 'active' : '',
      sub: dist[n.id] !== undefined ? `d=${dist[n.id]}` : 'd=∞',
    }))
    const edges = WGRAPH.edges.map(([a, b, w]) => ({
      from: a, to: b, label: w,
      cls: pathEdges && pathEdges.has(edgeKey(a, b)) ? 'special'
        : hotEdge && edgeKey(a, b) === hotEdge ? 'active'
        : treeEdges.has(edgeKey(a, b)) ? 'done' : '',
    }))
    frames.push({
      nodes, edges, desc, line,
      pq: [...pq].sort((x, y) => x[0] - y[0]).map(([d, v]) => `${labels[v]}:${d}`),
    })
  }

  dist[start] = 0
  const pq = [[0, start]]
  f(`Dijkstra from ${labels[start]}: every distance starts at ∞ except the start at 0. The priority queue always hands us the closest unsettled vertex.`, 1, pq)

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()
    if (settled.has(u)) {
      f(`Pop ${labels[u]}:${d}, but ${labels[u]} is already settled with a better value. Discard the stale entry.`, 4, pq, u)
      continue
    }
    settled.add(u)
    if (prev[u] !== undefined) treeEdges.add(edgeKey(prev[u], u))
    f(`Extract-min → ${labels[u]} (dist ${d}). Settle it: no undiscovered route can beat ${d}, because every alternative must leave through a vertex that's already ≥ ${d} away. Lock it green.`, 5, pq, u)
    for (const { to: v, w } of adj[u] || []) {
      if (settled.has(v)) continue
      const nd = d + w
      if (dist[v] === undefined || nd < dist[v]) {
        const old = dist[v] === undefined ? '∞' : dist[v]
        dist[v] = nd
        prev[v] = u
        pq.push([nd, v])
        f(`Relax edge ${labels[u]}→${labels[v]} (weight ${w}): ${d} + ${w} = ${nd} beats ${old}. Update dist[${labels[v]}] = ${nd}.`, 8, pq, u, edgeKey(u, v))
      } else {
        f(`Edge ${labels[u]}→${labels[v]} (weight ${w}): ${d} + ${w} = ${nd} ≥ current ${dist[v]}: no improvement, leave it.`, 7, pq, u, edgeKey(u, v))
      }
    }
  }

  // trace shortest path to target
  const pathEdges = new Set()
  const path = []
  let cur = Number(target)
  while (cur !== undefined && cur !== Number(start)) {
    path.unshift(labels[cur])
    if (prev[cur] === undefined) break
    pathEdges.add(edgeKey(prev[cur], cur))
    cur = prev[cur]
  }
  path.unshift(labels[start])
  f(`All settled. Shortest path ${labels[start]} → ${labels[target]}: ${path.join(' → ')} with total cost ${dist[target]}. Green edges form the shortest-path tree; purple is your route.`, 2, [], null, null, pathEdges)
  player.setFrames(frames)
}

watchEffect(() => buildFrames(Number(startIn.value), Number(targetIn.value)))

const view = computed(() => player.frame.value || { nodes: [], edges: [], pq: [] })

const legend = [
  ['discovered (tentative)', '--viz-active'],
  ['being processed', '--viz-compare'],
  ['settled (final)', '--viz-done'],
  ['shortest path', '--viz-special'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>start</label>
      <select class="input" v-model="startIn">
        <option v-for="n in WGRAPH.nodes" :key="n.id" :value="n.id">{{ n.label }}</option>
      </select>
      <label>target</label>
      <select class="input" v-model="targetIn">
        <option v-for="n in WGRAPH.nodes" :key="n.id" :value="n.id">{{ n.label }}</option>
      </select>
      <span class="cell-idx" style="margin-left: auto">edge numbers = weights</span>
    </template>

    <TreeSvg :nodes="view.nodes" :edges="view.edges" />

    <template #state>
      <div class="panel">
        <div class="panel-title">priority queue (min first)</div>
        <div class="state-body">
          <div v-if="view.pq.length" class="state-chips">
            <span v-for="(q, i) in view.pq" :key="i" class="chip" :class="{ active: i === 0 }">{{ q }}</span>
          </div>
          <div v-else class="state-empty">empty</div>
        </div>
      </div>
      <div class="note">
        <strong>BFS's weighted sibling:</strong> BFS counts hops; Dijkstra sums weights, and the
        priority queue (a heap!) replaces the plain queue. The greedy bet ("the closest unsettled
        vertex can be finalized now") is only valid because weights can't be negative. This is the
        core of GPS routing and network routing (OSPF).
      </div>
    </template>
  </VisualizerShell>
</template>
