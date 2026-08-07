<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const W = 640, H = 340

const vertices = ref([]) // {id, label, x, y}
const edges = ref([])    // {a, b}  (a -> b when directed)
const directed = ref(false)
const selected = ref(null)
const hint = ref('Click empty space to add a vertex. Click one vertex, then another, to connect them.')

let nextV = 0
const player = usePlayer() // unused frames; shell is used for consistent layout only

function labelOf(i) { return String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '') }

function svgPoint(evt) {
  const svg = evt.currentTarget
  const rect = svg.getBoundingClientRect()
  return {
    x: ((evt.clientX - rect.left) / rect.width) * W,
    y: ((evt.clientY - rect.top) / rect.height) * H,
  }
}

function onCanvasClick(evt) {
  const { x, y } = svgPoint(evt)
  // ignore clicks close to an existing vertex (those are handled by vertex click)
  if (vertices.value.some((v) => (v.x - x) ** 2 + (v.y - y) ** 2 < 30 ** 2)) return
  if (vertices.value.length >= 12) { hint.value = 'Max 12 vertices in this demo.'; return }
  const v = { id: nextV++, label: labelOf(vertices.value.length), x, y }
  vertices.value.push(v)
  selected.value = null
  hint.value = `Added vertex ${v.label}. Select two vertices to create an edge.`
}

function onVertexClick(v) {
  if (selected.value === null) {
    selected.value = v.id
    hint.value = `Selected ${v.label}. Now click another vertex to ${directed.value ? 'draw an edge from ' + v.label : 'connect them'} (or click it again to deselect).`
    return
  }
  if (selected.value === v.id) {
    selected.value = null
    hint.value = 'Deselected.'
    return
  }
  const a = selected.value, b = v.id
  const existing = edges.value.findIndex(
    (e) => (e.a === a && e.b === b) || (!directed.value && e.a === b && e.b === a)
  )
  if (existing >= 0) {
    edges.value.splice(existing, 1)
    hint.value = 'Edge removed (selecting the same pair toggles it).'
  } else {
    edges.value.push({ a, b })
    const la = vertices.value.find((x) => x.id === a).label
    hint.value = directed.value
      ? `Edge ${la} → ${v.label} added. In the adjacency list, ${v.label} appears under ${la} only.`
      : `Edge ${la} – ${v.label} added. Note it appears in *both* adjacency lists.`
  }
  selected.value = null
}

function removeVertex(v) {
  vertices.value = vertices.value.filter((x) => x.id !== v.id)
  edges.value = edges.value.filter((e) => e.a !== v.id && e.b !== v.id)
  selected.value = null
  hint.value = `Removed ${v.label} and every edge touching it.`
}

function clearAll() {
  vertices.value = []; edges.value = []; selected.value = null; nextV = 0
  hint.value = 'Cleared. Click empty space to add a vertex.'
}

function preset(kind) {
  clearAll()
  if (kind === 'social') {
    directed.value = false
    const pos = [[120, 80], [300, 60], [480, 100], [180, 220], [380, 240], [540, 250]]
    pos.forEach(([x, y], i) => vertices.value.push({ id: nextV++, label: labelOf(i), x, y }))
    ;[[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [2, 5]].forEach(([a, b]) => edges.value.push({ a, b }))
    hint.value = 'Undirected preset. Think friendships: if A knows B, B knows A.'
  } else {
    directed.value = true
    const pos = [[90, 170], [250, 70], [250, 270], [420, 170], [560, 90]]
    pos.forEach(([x, y], i) => vertices.value.push({ id: nextV++, label: labelOf(i), x, y }))
    ;[[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]].forEach(([a, b]) => edges.value.push({ a, b }))
    hint.value = 'Directed preset. Think build dependencies: A must finish before B starts.'
  }
}

preset('social')

const byId = computed(() => Object.fromEntries(vertices.value.map((v) => [v.id, v])))

const adjacency = computed(() =>
  vertices.value.map((v) => {
    const nbrs = []
    for (const e of edges.value) {
      if (e.a === v.id) nbrs.push(byId.value[e.b]?.label)
      else if (!directed.value && e.b === v.id) nbrs.push(byId.value[e.a]?.label)
    }
    return { label: v.label, nbrs: nbrs.filter(Boolean), degree: nbrs.length }
  })
)

// shorten edge line so arrowheads sit on the circle rim
function edgeCoords(e) {
  const a = byId.value[e.a], b = byId.value[e.b]
  if (!a || !b) return null
  const dx = b.x - a.x, dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const r = 22
  return { x1: a.x + (dx / d) * r, y1: a.y + (dy / d) * r, x2: b.x - (dx / d) * r, y2: b.y - (dy / d) * r }
}
</script>

<template>
  <VisualizerShell :player="player" :show-player="false">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': !directed }" @click="directed = false">undirected</button>
      <button class="btn" :class="{ 'btn-primary': directed }" @click="directed = true">directed</button>
      <span style="width: 10px"></span>
      <button class="btn btn-sm" @click="preset('social')">social network</button>
      <button class="btn btn-sm" @click="preset('deps')">dependency graph</button>
      <button class="btn" style="margin-left: auto" @click="clearAll">clear</button>
    </template>

    <svg
      class="viz-svg"
      :viewBox="`0 0 ${W} ${H}`"
      style="cursor: crosshair; border: 1px dashed var(--border2); border-radius: 4px"
      @click="onCanvasClick"
    >
      <defs>
        <marker id="g-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
      </defs>
      <template v-for="(e, i) in edges" :key="i">
        <line
          v-if="edgeCoords(e)"
          v-bind="edgeCoords(e)"
          stroke="var(--text-dim)"
          stroke-width="1.6"
          :marker-end="directed ? 'url(#g-arrow)' : undefined"
        />
      </template>
      <g
        v-for="v in vertices"
        :key="v.id"
        style="cursor: pointer"
        @click.stop="onVertexClick(v)"
        @dblclick.stop="removeVertex(v)"
      >
        <circle :cx="v.x" :cy="v.y" r="20" fill="var(--bg3)"
          :stroke="selected === v.id ? 'var(--viz-active)' : 'var(--border2)'"
          :stroke-width="selected === v.id ? 2.5 : 1.5" />
        <text :x="v.x" :y="v.y + 4.5" text-anchor="middle"
          :fill="selected === v.id ? 'var(--viz-active)' : 'var(--text)'" font-size="13">{{ v.label }}</text>
      </g>
    </svg>
    <div class="cell-idx" style="margin-top: 10px; text-align: center">{{ hint }} (double-click a vertex to delete it)</div>

    <template #state>
      <div class="panel">
        <div class="panel-title">adjacency list</div>
        <div class="state-body" style="display: flex; flex-direction: column; gap: 4px">
          <div v-for="row in adjacency" :key="row.label" style="display: flex; gap: 8px; align-items: baseline">
            <span class="chip" style="min-width: 34px; text-align: center">{{ row.label }}</span>
            <span style="color: var(--text-faint)">→</span>
            <span style="font-size: var(--fs-3xs); color: var(--text-dim)">
              {{ row.nbrs.length ? '[' + row.nbrs.join(', ') + ']' : '[]' }}
            </span>
          </div>
          <div v-if="!adjacency.length" class="state-empty">No vertices yet.</div>
        </div>
      </div>
      <div class="note">
        <strong>Graphs model relationships:</strong> friends (undirected), dependencies and links
        (directed), roads with distances (weighted; see Dijkstra). The adjacency list on the right is
        how code actually stores this drawing: one list of neighbours per vertex, O(V + E) space.
        BFS, DFS and Dijkstra in the algorithms section all run on exactly this structure.
      </div>
    </template>
  </VisualizerShell>
</template>
