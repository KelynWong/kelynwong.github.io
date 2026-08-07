<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

// B-tree of order 3: at most 2 keys per node, at most 3 children.
// Stored as a map id -> { keys: [], children: [] } plus a root id,
// exactly like a database page cache: node id ~ disk page number.
let nextId = 1
const tree = ref({})
const rootId = ref(null)
const valIn = ref(45)

function makeNode(keys = [], children = []) {
  const id = nextId++
  tree.value[id] = { keys, children }
  return id
}

function insertSilent(v) {
  if (rootId.value === null) { rootId.value = makeNode([v]); return }
  const path = []
  let cur = rootId.value
  for (;;) {
    const n = tree.value[cur]
    if (n.keys.includes(v)) return
    if (!n.children.length) break
    let i = 0
    while (i < n.keys.length && v > n.keys[i]) i++
    path.push(cur)
    cur = n.children[i]
  }
  const leaf = tree.value[cur]
  let i = 0
  while (i < leaf.keys.length && v > leaf.keys[i]) i++
  leaf.keys.splice(i, 0, v)
  let nodeId = cur
  while (tree.value[nodeId].keys.length > 2) {
    const n = tree.value[nodeId]
    const median = n.keys[1]
    const rightId = makeNode([n.keys[2]], n.children.length ? n.children.slice(2) : [])
    n.keys = [n.keys[0]]
    if (n.children.length) n.children = n.children.slice(0, 2)
    if (!path.length) {
      rootId.value = makeNode([median], [nodeId, rightId])
      break
    }
    const parentId = path.pop()
    const p = tree.value[parentId]
    const idx = p.children.indexOf(nodeId)
    p.keys.splice(idx, 0, median)
    p.children.splice(idx + 1, 0, rightId)
    nodeId = parentId
  }
}

const SEED = [40, 20, 60, 10, 30, 50, 70, 80]
function seed() {
  tree.value = {}
  rootId.value = null
  nextId = 1
  SEED.forEach(insertSilent)
}
seed()

function totalKeys() {
  return Object.values(tree.value).reduce((s, n) => s + n.keys.length, 0)
}

// All keys in sorted order with their location, i.e. the row order a
// full scan of the sorted data would visit.
function sortedKeys() {
  const out = []
  function walk(id) {
    const n = tree.value[id]
    for (let i = 0; i < n.keys.length; i++) {
      if (n.children.length) walk(n.children[i])
      out.push({ id, i, k: n.keys[i] })
    }
    if (n.children.length) walk(n.children[n.keys.length])
  }
  if (rootId.value !== null) walk(rootId.value)
  return out
}

function locateMark(v, cls) {
  const e = sortedKeys().find((x) => x.k === v)
  return e ? { [`${e.id}:${e.i}`]: cls } : {}
}

// ---- layout: leaves evenly spaced left to right, parents centered ----
const KW = 30 // width per key slot
const NH = 38 // node rect height
const LEVEL_H = 84
const LEAF_GAP = 22

function layout(marks = {}, keyMarks = {}) {
  const nodes = []
  const edges = []
  if (rootId.value === null) return { nodes, edges, width: 320, height: 120 }
  let cursor = 16
  let maxDepth = 0
  function place(id, depth) {
    const n = tree.value[id]
    maxDepth = Math.max(maxDepth, depth)
    const w = n.keys.length * KW + 8
    let x
    if (!n.children.length) {
      x = cursor + w / 2
      cursor += w + LEAF_GAP
    } else {
      const xs = n.children.map((c) => place(c, depth + 1))
      x = (xs[0] + xs[xs.length - 1]) / 2
    }
    nodes.push({
      id, x, y: 16 + depth * LEVEL_H, w,
      cls: marks[id] || '',
      keys: n.keys.map((k, i) => ({ k, cls: keyMarks[`${id}:${i}`] || '' })),
      childIds: [...n.children],
    })
    return x
  }
  place(rootId.value, 0)
  const byId = {}
  nodes.forEach((n) => { byId[n.id] = n })
  for (const n of nodes) {
    for (const c of n.childIds) {
      const ch = byId[c]
      edges.push({ id: `${n.id}-${c}`, x1: n.x, y1: n.y + NH, x2: ch.x, y2: ch.y })
    }
  }
  return { nodes, edges, width: Math.max(cursor + 8, 320), height: 16 + maxDepth * LEVEL_H + NH + 16 }
}

const player = usePlayer()

function frameOf(desc, marks = {}, keyMarks = {}, stats = null) {
  return { ...layout(marks, keyMarks), desc, stats: stats ? { ...stats } : null }
}

const view = computed(() => player.frame.value || { ...layout(), desc: '', stats: null })

// Describes which branch we take inside a node during descent.
function branchText(v, keys, i) {
  if (i === 0) return `${v} < ${keys[0]}, so follow the leftmost child pointer.`
  if (i === keys.length) return `${v} > ${keys[keys.length - 1]}, so follow the rightmost child pointer.`
  return `${keys[i - 1]} < ${v} < ${keys[i]}, so follow the middle child pointer.`
}

function readInput() {
  const v = Math.floor(valIn.value)
  return Number.isFinite(v) ? v : null
}

function insertOp() {
  const v = readInput()
  if (v === null) return
  if (totalKeys() >= 17) {
    player.setFrames([frameOf('The demo tree is full. Press reset to keep experimenting.')])
    return
  }
  const frames = []
  const stats = { reads: 0, comps: 0 }
  if (rootId.value === null) {
    rootId.value = makeNode([v])
    frames.push(frameOf(`The tree was empty, so ${v} becomes the root (which is also a leaf).`, { [rootId.value]: 'done' }, {}, stats))
    player.setFrames(frames, { autoplay: true })
    return
  }
  const path = []
  let cur = rootId.value
  let exists = false
  for (;;) {
    const n = tree.value[cur]
    stats.reads++
    frames.push(frameOf(`Disk read #${stats.reads}: load node [${n.keys.join(', ')}]. In a real database each node is one page, and reads are the expensive part.`, { [cur]: 'active' }, {}, stats))
    let i = 0
    let matched = false
    while (i < n.keys.length) {
      stats.comps++
      if (v === n.keys[i]) { matched = true; break }
      if (v < n.keys[i]) break
      i++
    }
    if (matched) {
      frames.push(frameOf(`${v} is already here. Keys in this index are unique, so there is nothing to insert.`, { [cur]: 'compare' }, { [`${cur}:${i}`]: 'compare' }, stats))
      exists = true
      break
    }
    if (!n.children.length) {
      n.keys.splice(i, 0, v)
      frames.push(frameOf(`This is a leaf, and insertions always land in a leaf. Slot ${v} into sorted position.`, { [cur]: 'active' }, { [`${cur}:${i}`]: 'done' }, stats))
      break
    }
    frames.push(frameOf(branchText(v, n.keys, i), { [cur]: 'active' }, {}, stats))
    path.push(cur)
    cur = n.children[i]
  }
  if (!exists) {
    let nodeId = cur
    while (tree.value[nodeId].keys.length > 2) {
      const n = tree.value[nodeId]
      frames.push(frameOf(`Overflow! Node [${n.keys.join(', ')}] now holds 3 keys, one more than order 3 allows. It must split.`, { [nodeId]: 'compare' }, {}, stats))
      const median = n.keys[1]
      const rightId = makeNode([n.keys[2]], n.children.length ? n.children.slice(2) : [])
      n.keys = [n.keys[0]]
      if (n.children.length) n.children = n.children.slice(0, 2)
      if (!path.length) {
        const newRoot = makeNode([median], [nodeId, rightId])
        rootId.value = newRoot
        frames.push(frameOf(`The split node was the root, so the median ${median} becomes a brand new root. The tree grows one level taller, and growing at the top is the only way a B-tree gains height, which keeps every leaf at the same depth.`, { [newRoot]: 'done', [nodeId]: 'compare', [rightId]: 'compare' }, {}, stats))
        nodeId = newRoot
      } else {
        const parentId = path.pop()
        const p = tree.value[parentId]
        const idx = p.children.indexOf(nodeId)
        p.keys.splice(idx, 0, median)
        p.children.splice(idx + 1, 0, rightId)
        frames.push(frameOf(`Split: the median ${median} moves up into the parent, and the two halves become siblings. If the parent overflows too, the split cascades upward.`, { [parentId]: 'active', [nodeId]: 'compare', [rightId]: 'compare' }, { [`${parentId}:${idx}`]: 'done' }, stats))
        nodeId = parentId
      }
    }
    frames.push(frameOf(`Done: ${v} inserted after ${stats.reads} node read${stats.reads === 1 ? '' : 's'}. The tree stays balanced automatically; no rebalancing pass is ever needed.`, {}, locateMark(v, 'done'), stats))
  }
  player.setFrames(frames, { autoplay: true })
}

// Appends indexed-search frames to `frames`; returns true if found.
function searchFrames(v, frames, stats) {
  let cur = rootId.value
  for (;;) {
    const n = tree.value[cur]
    stats.reads++
    frames.push(frameOf(`Disk read #${stats.reads}: load node [${n.keys.join(', ')}].`, { [cur]: 'active' }, {}, stats))
    let i = 0
    let found = false
    while (i < n.keys.length) {
      stats.comps++
      if (v === n.keys[i]) { found = true; break }
      if (v < n.keys[i]) break
      i++
    }
    if (found) {
      frames.push(frameOf(`Found ${v}! Total cost: ${stats.reads} disk read${stats.reads === 1 ? '' : 's'} and ${stats.comps} comparison${stats.comps === 1 ? '' : 's'}. Every other node was never touched.`, { [cur]: 'done' }, { [`${cur}:${i}`]: 'done' }, stats))
      return true
    }
    if (!n.children.length) {
      frames.push(frameOf(`Reached a leaf and ${v} is not here, so it is not in the tree. Proving absence cost only ${stats.reads} reads.`, { [cur]: 'compare' }, {}, stats))
      return false
    }
    frames.push(frameOf(branchText(v, n.keys, i), { [cur]: 'active' }, {}, stats))
    cur = n.children[i]
  }
}

function searchOp() {
  const v = readInput()
  if (v === null || rootId.value === null) return
  const frames = []
  const stats = { reads: 0, comps: 0 }
  frames.push(frameOf(`search(${v}): start at the root and follow one pointer per level. Each node read narrows the range like binary search, but with 3 branches per step.`, {}, {}, stats))
  searchFrames(v, frames, stats)
  player.setFrames(frames, { autoplay: true })
}

function scanVsIndexOp() {
  const v = readInput()
  if (v === null || rootId.value === null) return
  const frames = []
  const scanStats = { reads: 0, comps: 0 }
  frames.push(frameOf(`Round 1, no index: to find ${v} the database must table-scan, checking every row in order until it hits a match.`, {}, {}, scanStats))
  const all = sortedKeys()
  const trail = {}
  const touched = new Set()
  let foundInScan = false
  for (const e of all) {
    scanStats.comps++
    touched.add(e.id)
    scanStats.reads = touched.size
    const isHit = e.k === v
    frames.push(frameOf(
      isHit
        ? `Row ${e.k}: match! But only after ${scanStats.comps} comparisons.`
        : `Row ${e.k}: not ${v}. Keep scanning (comparison #${scanStats.comps}).`,
      {},
      { ...trail, [`${e.id}:${e.i}`]: isHit ? 'done' : 'compare' },
      scanStats
    ))
    trail[`${e.id}:${e.i}`] = 'faded'
    if (isHit) { foundInScan = true; break }
  }
  const scanComps = scanStats.comps
  frames.push(frameOf(
    foundInScan
      ? `Table scan total: ${scanComps} comparisons across ${scanStats.reads} node reads. Every row before the match had to be checked.`
      : `Table scan total: ${scanComps} comparisons across ${scanStats.reads} node reads, and ${v} was not even there. Without an index, proving absence means checking everything.`,
    {}, trail, scanStats
  ))
  const idxStats = { reads: 0, comps: 0 }
  frames.push(frameOf(`Round 2, with the B-tree index: same target ${v}, but now we descend from the root.`, {}, {}, idxStats))
  searchFrames(v, frames, idxStats)
  frames.push(frameOf(`Verdict: scan = ${scanComps} comparisons, index = ${idxStats.comps} comparisons in ${idxStats.reads} reads. On a million-row table the scan does about a million checks while the index still does 3 or 4 reads. That gap is what CREATE INDEX buys you.`, {}, locateMark(v, foundInScan ? 'done' : 'compare'), idxStats))
  player.setFrames(frames, { autoplay: true })
}

function resetOp() {
  seed()
  player.setFrames([frameOf('Fresh tree seeded with 8 keys. Try inserting 90: the rightmost leaf splits, the root overflows, and the tree grows a whole new level.')])
}

const nodeStroke = {
  active: 'var(--viz-active)',
  compare: 'var(--viz-compare)',
  done: 'var(--viz-done)',
}
const keyStroke = {
  active: 'var(--viz-active)',
  compare: 'var(--viz-compare)',
  done: 'var(--viz-done)',
  faded: 'var(--border)',
}
const keyFill = {
  active: 'var(--viz-active)',
  compare: 'var(--viz-compare)',
  done: 'var(--viz-done)',
}

const legend = [
  ['current node', '--viz-active'],
  ['splitting / scanning', '--viz-compare'],
  ['found / inserted', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>value</label>
      <input class="input" style="width: 64px" type="number" v-model.number="valIn" @keyup.enter="insertOp" />
      <button class="btn btn-primary" @click="insertOp">insert</button>
      <button class="btn" @click="searchOp">search</button>
      <button class="btn" @click="scanVsIndexOp">scan vs index</button>
      <button class="btn" style="margin-left: auto" @click="resetOp">reset</button>
    </template>

    <svg class="viz-svg" :viewBox="`0 0 ${view.width} ${view.height}`" style="max-width: 640px; margin: 0 auto">
      <line
        v-for="e in view.edges" :key="e.id"
        :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
        stroke="var(--border2)" stroke-width="1.4"
      />
      <g v-for="n in view.nodes" :key="n.id">
        <rect
          :x="n.x - n.w / 2" :y="n.y" :width="n.w" height="38" rx="8"
          fill="var(--bg2)"
          :stroke="nodeStroke[n.cls] || 'var(--border2)'"
          :stroke-width="n.cls ? 2 : 1.4"
        />
        <g v-for="(kb, i) in n.keys" :key="i" :opacity="kb.cls === 'faded' ? 0.35 : 1">
          <rect
            :x="n.x - n.w / 2 + 4 + i * 30" :y="n.y + 5" width="28" height="28" rx="5"
            fill="var(--bg3)"
            :stroke="keyStroke[kb.cls] || 'var(--border)'"
            :stroke-width="kb.cls && kb.cls !== 'faded' ? 2 : 1.2"
          />
          <text
            :x="n.x - n.w / 2 + 4 + i * 30 + 14" :y="n.y + 24"
            text-anchor="middle" font-size="11"
            :fill="keyFill[kb.cls] || 'var(--text)'"
          >{{ kb.k }}</text>
        </g>
      </g>
    </svg>

    <template #state>
      <div class="panel">
        <div class="panel-title">operation cost</div>
        <div class="state-body">
          <div v-if="view.stats" class="state-chips">
            <span class="chip active">node reads: {{ view.stats.reads }}</span>
            <span class="chip">comparisons: {{ view.stats.comps }}</span>
          </div>
          <div v-else class="state-empty">Run insert, search, or scan vs index to see costs.</div>
        </div>
      </div>
      <div class="note">
        <strong>Why databases love B-trees:</strong> shallow and wide beats tall and skinny. Each node is
        one disk page holding many keys (hundreds in practice, 2 here so you can watch), so a
        billion-row index is only 3 or 4 levels deep, meaning 3 or 4 disk reads per lookup. Splits keep
        every leaf at exactly the same depth, so worst case equals best case. Every time you run
        <em>CREATE INDEX</em>, this structure (usually the B+ tree variant) is what gets built.
      </div>
    </template>
  </VisualizerShell>
</template>
