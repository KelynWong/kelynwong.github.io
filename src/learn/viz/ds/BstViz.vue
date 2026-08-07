<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { rint } from '../utils.js'

// tree stored as map: id -> {v, left, right}; root id
let nextId = 1
const nodes = ref({})
const root = ref(null)
const valIn = ref(50)

function makeNode(v) {
  const id = nextId++
  nodes.value[id] = { v, left: null, right: null }
  return id
}

function seed(values) {
  nodes.value = {}
  root.value = null
  nextId = 1
  for (const v of values) insertSilent(v)
}

function insertSilent(v) {
  const id = makeNode(v)
  if (root.value === null) { root.value = id; return }
  let cur = root.value
  for (;;) {
    const n = nodes.value[cur]
    if (v < n.v) {
      if (n.left === null) { n.left = id; return }
      cur = n.left
    } else {
      if (n.right === null) { n.right = id; return }
      cur = n.right
    }
  }
}

seed([50, 30, 70, 20, 40, 60, 80])

const player = usePlayer()

// ---- layout: x = in-order rank, y = depth ----
function layout(marksById = {}, hotEdges = new Set()) {
  const list = []
  const edges = []
  let rank = 0
  function walk(id, depth) {
    if (id === null) return
    const n = nodes.value[id]
    walk(n.left, depth + 1)
    const x = 40 + rank * 52
    rank += 1
    list.push({ id, label: n.v, x, y: 34 + depth * 62, cls: marksById[id] || '' })
    walk(n.right, depth + 1)
  }
  function walkEdges(id) {
    if (id === null) return
    const n = nodes.value[id]
    for (const c of [n.left, n.right]) {
      if (c !== null) {
        edges.push({ from: id, to: c, cls: hotEdges.has(`${id}-${c}`) ? 'active' : '' })
        walkEdges(c)
      }
    }
  }
  walk(root.value, 0)
  walkEdges(root.value)
  return { nodes: list, edges }
}

const view = computed(() => player.frame.value || { ...layout(), output: [], desc: '' })

function frameOf(desc, marks = {}, hotEdges = new Set(), output = []) {
  return { ...layout(marks, hotEdges), desc, output: [...output] }
}

function countNodes() { return Object.keys(nodes.value).length }

function insert() {
  const v = Math.floor(valIn.value)
  if (!Number.isFinite(v)) return
  if (countNodes() >= 15) {
    player.setFrames([frameOf('Tree is full for this demo. Reset to keep going.')])
    return
  }
  const frames = []
  if (root.value === null) {
    const id = makeNode(v)
    root.value = id
    frames.push(frameOf(`Tree was empty, so ${v} becomes the root.`, { [id]: 'done' }))
    player.setFrames(frames, { autoplay: true })
    return
  }
  let cur = root.value
  const hot = new Set()
  for (;;) {
    const n = nodes.value[cur]
    if (v === n.v) {
      frames.push(frameOf(`${v} is already in the tree, and BSTs here keep values unique. Nothing to do.`, { [cur]: 'compare' }, new Set(hot)))
      break
    }
    const goLeft = v < n.v
    frames.push(frameOf(
      `Compare ${v} with ${n.v}: ${v} ${goLeft ? '<' : '>'} ${n.v}, so go ${goLeft ? 'left' : 'right'}. Every comparison discards the entire other subtree.`,
      { [cur]: 'compare' }, new Set(hot)
    ))
    const child = goLeft ? n.left : n.right
    if (child === null) {
      const id = makeNode(v)
      if (goLeft) n.left = id; else n.right = id
      hot.add(`${cur}-${id}`)
      frames.push(frameOf(`The ${goLeft ? 'left' : 'right'} child is empty, so attach ${v} here. Path length ≈ log N when the tree stays balanced.`, { [id]: 'done' }, new Set(hot)))
      break
    }
    hot.add(`${cur}-${child}`)
    cur = child
  }
  player.setFrames(frames, { autoplay: true })
}

function search() {
  const v = Math.floor(valIn.value)
  const frames = []
  let cur = root.value
  const hot = new Set()
  let steps = 0
  while (cur !== null) {
    const n = nodes.value[cur]
    steps += 1
    if (v === n.v) {
      frames.push(frameOf(`Found ${v} in ${steps} comparison${steps === 1 ? '' : 's'}. The other ~${Math.max(0, countNodes() - steps)} nodes were never touched.`, { [cur]: 'done' }, new Set(hot)))
      player.setFrames(frames, { autoplay: true })
      return
    }
    const goLeft = v < n.v
    frames.push(frameOf(`${v} vs ${n.v}: ${v} ${goLeft ? '<' : '>'} ${n.v} → go ${goLeft ? 'left' : 'right'}.`, { [cur]: 'compare' }, new Set(hot)))
    const child = goLeft ? n.left : n.right
    if (child !== null) hot.add(`${cur}-${child}`)
    cur = child
  }
  frames.push(frameOf(`Hit a null child: ${v} is not in the tree. Only ${steps} comparisons for ${countNodes()} nodes.`, {}, hot))
  player.setFrames(frames, { autoplay: true })
}

function traverse(kind) {
  const frames = []
  const output = []
  function inorder(id) {
    if (id === null) return
    const n = nodes.value[id]
    if (kind === 'pre') { output.push(n.v); frames.push(frameOf(`Visit ${n.v} (root before children).`, { [id]: 'active' }, new Set(), output)) }
    inorder(n.left)
    if (kind === 'in') { output.push(n.v); frames.push(frameOf(`Visit ${n.v} (left subtree done, now the node itself).`, { [id]: 'active' }, new Set(), output)) }
    inorder(n.right)
    if (kind === 'post') { output.push(n.v); frames.push(frameOf(`Visit ${n.v} (both children done first).`, { [id]: 'active' }, new Set(), output)) }
  }
  inorder(root.value)
  const names = { in: 'In-order', pre: 'Pre-order', post: 'Post-order' }
  frames.push(frameOf(
    kind === 'in'
      ? `${names[kind]} done. Notice the output is perfectly sorted. That's the defining magic of a BST.`
      : `${names[kind]} traversal done.`,
    {}, new Set(), output
  ))
  player.setFrames(frames, { autoplay: true })
}

function randomize() {
  const vals = new Set()
  while (vals.size < 7) vals.add(rint(1, 99))
  seed([...vals])
  player.setFrames([frameOf('New random tree. Note: insertion order shapes the tree: sorted input would produce a degenerate “linked list” tree with O(N) search.')])
}

const legend = [
  ['comparing', '--viz-compare'],
  ['visiting', '--viz-active'],
  ['found / inserted', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>value</label>
      <input class="input" style="width: 64px" type="number" v-model.number="valIn" @keyup.enter="insert" />
      <button class="btn btn-primary" @click="insert">insert</button>
      <button class="btn" @click="search">search</button>
      <span style="width: 8px"></span>
      <button class="btn btn-sm" @click="traverse('in')">in-order</button>
      <button class="btn btn-sm" @click="traverse('pre')">pre-order</button>
      <button class="btn btn-sm" @click="traverse('post')">post-order</button>
      <button class="btn" style="margin-left: auto" @click="randomize">randomize</button>
    </template>

    <TreeSvg :nodes="view.nodes" :edges="view.edges" />

    <template #state>
      <div class="panel">
        <div class="panel-title">traversal output</div>
        <div class="state-body">
          <div v-if="view.output && view.output.length" class="state-chips">
            <span v-for="(v, i) in view.output" :key="i" class="chip" :class="{ active: i === view.output.length - 1 }">{{ v }}</span>
          </div>
          <div v-else class="state-empty">Run a traversal to see the visit order.</div>
        </div>
      </div>
      <div class="note">
        <strong>O(log N), with an asterisk.</strong> Each comparison discards half the remaining tree,
        but only if the tree is <em>balanced</em>. Insert 1, 2, 3, 4, 5 in order and you get a diagonal
        chain: O(N) search. Real-world trees (AVL and Red-Black, used by <em>std::map</em>, Java's
        <em>TreeMap</em>) rebalance themselves to keep the guarantee.
      </div>
    </template>
  </VisualizerShell>
</template>
