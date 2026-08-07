<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const nIn = ref(5)
const player = usePlayer()

const PSEUDO = [
  'fib(n):',
  '  if n <= 1:',
  '    return n          // base case',
  '  a = fib(n - 1)      // recurse left',
  '  b = fib(n - 2)      // recurse right',
  '  return a + b        // combine',
]

function buildFrames(N) {
  // 1) build the full call tree (naive fib) with layout
  let nextId = 0
  const tree = []
  function build(n, depth, parent) {
    const node = { id: nextId++, n, depth, parent, children: [], x: 0 }
    tree.push(node)
    if (n > 1) {
      node.children = [build(n - 1, depth + 1, node.id), build(n - 2, depth + 1, node.id)]
    }
    return node
  }
  const root = build(N, 0, null)

  // 2) layout: leaves left-to-right, parents centered above children
  let leafX = 0
  function place(node) {
    if (!node.children.length) {
      node.x = 34 + leafX * 46
      leafX++
    } else {
      node.children.forEach(place)
      node.x = (node.children[0].x + node.children[1].x) / 2
    }
  }
  place(root)

  // 3) simulate execution depth-first, recording frames
  const frames = []
  const status = {} // id -> 'active' | 'done'
  const values = {}
  const seenArgs = new Map() // arg -> first computed value (to flag repeats)
  const repeats = new Set()
  const stack = []
  let calls = 0

  const f = (desc, line, current = null) => {
    const nodes = tree
      .filter((t) => status[t.id])
      .map((t) => ({
        id: t.id,
        label: `f(${t.n})`,
        x: t.x,
        y: 30 + t.depth * 58,
        cls: t.id === current ? 'compare' : repeats.has(t.id) && status[t.id] === 'done' ? 'warn' : status[t.id] === 'done' ? 'done' : 'active',
        sub: values[t.id] !== undefined ? `= ${values[t.id]}` : '',
      }))
    const edges = tree
      .filter((t) => status[t.id] && t.parent !== null && status[t.parent])
      .map((t) => ({ from: t.parent, to: t.id }))
    frames.push({ nodes, edges, stack: stack.map((s) => `fib(${s})`), desc, line, calls })
  }

  function run(node) {
    calls++
    stack.push(node.n)
    status[node.id] = 'active'
    const isRepeat = seenArgs.has(node.n)
    if (isRepeat) repeats.add(node.id)
    f(
      isRepeat
        ? `Call fib(${node.n}), call #${calls}. We've *already computed* fib(${node.n}) = ${seenArgs.get(node.n)} elsewhere in this tree (yellow = wasted work). Memoization would return it instantly.`
        : `Call fib(${node.n}) and push it onto the call stack (call #${calls}).`,
      0, node.id
    )
    let result
    if (node.n <= 1) {
      result = node.n
      values[node.id] = result
      f(`fib(${node.n}) is a base case → return ${result}. Without base cases, recursion never stops.`, 2, node.id)
    } else {
      f(`fib(${node.n}) needs fib(${node.n - 1}) first, so this call *pauses* on the stack while its child runs.`, 3, node.id)
      const a = run(node.children[0])
      f(`Back in fib(${node.n}): left child returned ${a}. Now the second recursive call.`, 4, node.id)
      const b = run(node.children[1])
      result = a + b
      values[node.id] = result
      f(`fib(${node.n}) combines: ${a} + ${b} = ${result}.`, 5, node.id)
    }
    if (!seenArgs.has(node.n)) seenArgs.set(node.n, result)
    status[node.id] = 'done'
    stack.pop()
    f(`fib(${node.n}) returns ${result}. Pop it off the stack; control resumes in its caller.`, 5)
    return result
  }
  const answer = run(root)
  const unique = seenArgs.size
  f(`fib(${N}) = ${answer}, using ${calls} calls, but only ${unique} *distinct* subproblems exist. Every yellow node is a repeat. That gap (${calls} vs ${unique}) is exactly what Dynamic Programming eliminates.`, 5)
  player.setFrames(frames)
}

watchEffect(() => {
  const n = Math.max(2, Math.min(8, Math.floor(nIn.value) || 5))
  buildFrames(n)
})

const view = computed(() => player.frame.value || { nodes: [], edges: [], stack: [] })

const legend = [
  ['on the call stack', '--viz-active'],
  ['executing now', '--viz-compare'],
  ['returned', '--viz-done'],
  ['repeated subproblem', '--viz-warn'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>fib(n), n =</label>
      <input class="input" style="width: 56px" type="number" min="2" max="8" v-model.number="nIn" />
      <span class="cell-idx" style="margin-left: auto">calls so far: {{ view.calls || 0 }}</span>
    </template>

    <TreeSvg :nodes="view.nodes" :edges="view.edges" :r="17" />

    <template #state>
      <div class="panel">
        <div class="panel-title">call stack (bottom → top)</div>
        <div class="state-body">
          <div v-if="view.stack.length" class="state-chips">
            <span v-for="(s, i) in view.stack" :key="i" class="chip" :class="{ active: i === view.stack.length - 1 }">{{ s }}</span>
          </div>
          <div v-else class="state-empty">empty</div>
        </div>
      </div>
      <div class="note">
        <strong>Recursion = a function trusting a smaller version of itself.</strong> Watch the tree grow
        depth-first, exactly like the DFS visualizer, because recursion IS depth-first traversal of this
        call tree. Bump n up and watch the call count roughly double each time: O(2ⁿ). The yellow
        repeats are the bridge to the Dynamic Programming topic.
      </div>
    </template>
  </VisualizerShell>
</template>
