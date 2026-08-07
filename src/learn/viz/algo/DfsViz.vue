<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { GRAPH8, neighborsOf } from '../shared/sampleGraphs.js'

const startIn = ref(0)
const player = usePlayer()

const PSEUDO = [
  'dfs(u):',
  '  mark u visited        // push onto call stack',
  '  for each neighbor v of u:',
  '    if v not visited:',
  '      dfs(v)            // dive deeper immediately',
  '  // all neighbors done → backtrack (pop u)',
]

const labels = GRAPH8.nodes.map((n) => n.label)

function buildFrames(start) {
  const adj = neighborsOf(GRAPH8.edges)
  const frames = []
  const state = {} // 'onstack' | 'done'
  const treeEdges = new Set()
  const order = []

  const f = (desc, line, stack, current = null) => {
    const nodes = GRAPH8.nodes.map((n) => ({
      ...n,
      cls: n.id === current ? 'compare' : state[n.id] === 'done' ? 'done' : state[n.id] === 'onstack' ? 'active' : '',
      sub: order.includes(n.id) ? `#${order.indexOf(n.id) + 1}` : '',
    }))
    const edges = GRAPH8.edges.map(([a, b]) => ({
      from: a, to: b,
      cls: treeEdges.has(`${a}-${b}`) || treeEdges.has(`${b}-${a}`) ? 'done' : '',
    }))
    frames.push({ nodes, edges, stack: stack.map((s) => labels[s]), desc, line })
  }

  const stack = []
  function dfs(u, from) {
    stack.push(u)
    state[u] = 'onstack'
    order.push(u)
    if (from !== undefined) treeEdges.add(`${from}-${u}`)
    f(`Visit ${labels[u]} (visit #${order.length}): push it onto the stack and immediately look for somewhere deeper to go.`, 1, stack, u)
    for (const v of adj[u] || []) {
      if (!state[v]) {
        f(`${labels[u]} → ${labels[v]}: unvisited. Dive in: depth first, breadth later.`, 4, stack, u)
        dfs(v, u)
        f(`Returned to ${labels[u]}. ${labels[v]}'s entire branch is fully explored.`, 2, stack, u)
      } else {
        f(`${labels[u]} → ${labels[v]}: already ${state[v] === 'onstack' ? 'on the stack (an ancestor, so this edge closes a cycle!)' : 'finished'}. Skip.`, 3, stack, u)
      }
    }
    stack.pop()
    state[u] = 'done'
    f(`${labels[u]} has no unvisited neighbors left, so backtrack: pop it off the stack.`, 5, stack)
  }
  dfs(Number(start))
  f(`Stack is empty, so the traversal is complete. Note the visit order (#) versus BFS: DFS ran to the bottom of one branch before ever touching siblings. O(V + E).`, 0, [])
  player.setFrames(frames)
}

watchEffect(() => buildFrames(startIn.value))

const view = computed(() => player.frame.value || { nodes: [], edges: [], stack: [] })

const legend = [
  ['on the stack (current path)', '--viz-active'],
  ['being processed', '--viz-compare'],
  ['fully explored', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>start vertex</label>
      <select class="input" v-model="startIn">
        <option v-for="n in GRAPH8.nodes" :key="n.id" :value="n.id">{{ n.label }}</option>
      </select>
      <span class="cell-idx" style="margin-left: auto">#n = visit order · blue chain = the current path</span>
    </template>

    <TreeSvg :nodes="view.nodes" :edges="view.edges" />

    <template #state>
      <div class="panel">
        <div class="panel-title">stack (bottom → top)</div>
        <div class="state-body">
          <div v-if="view.stack.length" class="state-chips">
            <span v-for="(s, i) in view.stack" :key="i" class="chip" :class="{ active: i === view.stack.length - 1 }">{{ s }}</span>
          </div>
          <div v-else class="state-empty">empty</div>
        </div>
      </div>
      <div class="note">
        <strong>The stack IS the path:</strong> at any moment, the blue vertices are exactly the route
        from the start to where you're standing, which is what makes DFS the tool for maze solving,
        cycle detection, topological sort and connected components. Recursive calls and an explicit
        stack are the same thing; recurse too deep and you get a literal stack overflow.
      </div>
    </template>
  </VisualizerShell>
</template>
