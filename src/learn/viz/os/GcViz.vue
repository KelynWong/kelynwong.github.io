<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import TreeSvg from '../shared/TreeSvg.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const player = usePlayer()

const PSEUDO = [
  'gc():  // stop the world',
  '  // MARK: trace what is reachable',
  '  for root in {stack, globals}:',
  '    for ref in root: dfs(ref)',
  '  dfs(obj):',
  '    if obj.marked: return  // cycle-safe',
  '    obj.marked = true',
  '    for ref in obj: dfs(ref)',
  '  // SWEEP: free the unmarked',
  '  for obj in heap (address order):',
  '    if not obj.marked: free(obj)',
  '    else: obj.marked = false',
]

const ROOTS = [
  { id: 'stack', label: 'stack', x: 115, y: 42 },
  { id: 'globals', label: 'globals', x: 330, y: 42 },
]
const OBJS = [
  { id: 'A', x: 55, y: 145, bytes: 24, addr: '0x100' },
  { id: 'B', x: 165, y: 145, bytes: 16, addr: '0x118' },
  { id: 'C', x: 285, y: 145, bytes: 32, addr: '0x128' },
  { id: 'D', x: 400, y: 145, bytes: 24, addr: '0x148' },
  { id: 'E', x: 110, y: 250, bytes: 48, addr: '0x160' },
  { id: 'F', x: 215, y: 250, bytes: 16, addr: '0x190' },
  { id: 'G', x: 320, y: 250, bytes: 40, addr: '0x1A0' },
  { id: 'H', x: 425, y: 250, bytes: 40, addr: '0x1C8' },
]
const OBJ = {}
OBJS.forEach((o) => { OBJ[o.id] = o })

// cut: which named root reference an unlink button removes
const EDGES = [
  { from: 'stack', to: 'A', cut: 'A' },
  { from: 'stack', to: 'B' },
  { from: 'globals', to: 'C', cut: 'C' },
  { from: 'globals', to: 'D', cut: 'D' },
  { from: 'A', to: 'E' },
  { from: 'B', to: 'E' },
  { from: 'B', to: 'F' },
  { from: 'C', to: 'G' },
  { from: 'G', to: 'H', label: 'cycle' },
  { from: 'H', to: 'G' },
  { from: 'D', to: 'H' },
]

const cuts = ref({ A: false, C: false, D: false })
const freed = ref([]) // object ids removed by previous GC runs

const isAlive = (id) => id === 'stack' || id === 'globals' || !freed.value.includes(id)
const edgeKey = (e) => e.from + '-' + e.to

function liveEdges() {
  return EDGES.filter((e) => !(e.cut && cuts.value[e.cut]) && isAlive(e.from) && isAlive(e.to))
}

function aliveObjs() {
  return OBJS.filter((o) => !freed.value.includes(o.id))
}

function baseNodes(clsMap = {}, gone = new Set(), marked = new Set()) {
  const roots = ROOTS.map((r) => ({ ...r, cls: clsMap[r.id] || 'special', sub: 'root' }))
  const objs = aliveObjs()
    .filter((o) => !gone.has(o.id))
    .map((o) => ({
      id: o.id, label: o.id, x: o.x, y: o.y,
      cls: clsMap[o.id] || (marked.has(o.id) ? 'done' : ''),
      sub: `${o.addr} · ${o.bytes}B`,
    }))
  return [...roots, ...objs]
}

function baseEdges(gone = new Set(), traced = new Set()) {
  return liveEdges()
    .filter((e) => !gone.has(e.from) && !gone.has(e.to))
    .map((e) => ({ from: e.from, to: e.to, label: e.label, cls: traced.has(edgeKey(e)) ? 'done' : '' }))
}

function chipsNow(gone = new Set(), reclaimed = 0) {
  const alive = aliveObjs().filter((o) => !gone.has(o.id))
  const freedBytes = freed.value.reduce((s, id) => s + OBJ[id].bytes, 0) + reclaimed
  return {
    live: alive.length,
    freedCount: freed.value.length + gone.size,
    freedBytes,
    usedBytes: alive.reduce((s, o) => s + o.bytes, 0),
  }
}

function restingFrame(desc = null, line = null) {
  return { desc, line, nodes: baseNodes(), edges: baseEdges(), ...chipsNow() }
}

const view = computed(() => player.frame.value || restingFrame())

function unlink(which) {
  cuts.value = { ...cuts.value, [which]: true }
  const cAndD = cuts.value.C && cuts.value.D
  const msgs = {
    A: 'Removed the stack reference to A. A is unreachable now, but E is safe: B still points to it. Nothing is freed yet; garbage only disappears when the GC actually runs.',
    C: cAndD
      ? 'Removed the global reference to C. With D also gone, G and H now point only at EACH OTHER: an unreachable cycle. Run GC to watch mark-and-sweep collect what reference counting never could.'
      : 'Removed the global reference to C. C is unreachable, but G and H are still safe: D reaches H, and the cycle links G back in. Run GC to collect just C.',
    D: cAndD
      ? 'Removed the global reference to D. With C also gone, G and H keep each other alive in an unreachable CYCLE: their reference counts never hit zero, so a ref-counting GC would leak them forever. Run GC to see tracing do better.'
      : 'Removed the global reference to D. D is unreachable, but H survives: C still reaches G, and G points to H. Run GC to collect just D.',
  }
  player.setFrames([restingFrame(msgs[which])])
}

function reset() {
  cuts.value = { A: false, C: false, D: false }
  freed.value = []
  player.setFrames([restingFrame('Heap restored: 8 objects, 240 bytes, every reference back in place. Unlink something, then run GC.')])
}

function runGC() {
  const frames = []
  const adj = {}
  const edges = liveEdges()
  edges.forEach((e) => { (adj[e.from] = adj[e.from] || []).push(e.to) })
  const order = aliveObjs().map((o) => o.id) // address order
  const marked = new Set()
  const traced = new Set()
  const gone = new Set()
  let reclaimed = 0

  const snap = (desc, line, clsMap = {}) => frames.push({
    desc, line,
    nodes: baseNodes(clsMap, gone, marked),
    edges: baseEdges(gone, traced),
    ...chipsNow(gone, reclaimed),
  })

  snap('run GC: stop the world. The program pauses completely while we MARK everything reachable from the roots, then SWEEP everything else. Reachability, not scope, decides who lives.', 0)

  const isCycleEdge = (from, to) => (from === 'G' && to === 'H') || (from === 'H' && to === 'G')

  function dfs(from, to) {
    traced.add(from + '-' + to)
    if (marked.has(to)) {
      if (isCycleEdge(from, to)) {
        snap(`${from} → ${to} closes a CYCLE, but ${to} is already marked, so dfs simply stops. A reachable cycle is perfectly fine for tracing GC. (The dangerous case, an UNREACHABLE cycle, is exactly what reference counting leaks: try unlinking C and D.)`, 5, { [to]: 'active' })
      } else {
        snap(`${from} points to ${to}, which is ALREADY marked: stop. This visited-check is why shared objects are counted once and cycles never loop forever.`, 5, { [to]: 'active' })
      }
      return
    }
    marked.add(to)
    snap(`Follow ${from} → ${to}: reachable, so mark it (${marked.size} marked so far) and recurse into everything ${to} references.`, 6, { [to]: 'active' })
    for (const nxt of adj[to] || []) dfs(to, nxt)
  }

  for (const r of ['stack', 'globals']) {
    const kids = adj[r] || []
    snap(`MARK phase, root "${r}": anything ${r === 'stack' ? 'a stack variable' : 'a global'} can reach must survive. It currently references ${kids.length ? kids.join(', ') : 'nothing'}.`, 2, { [r]: 'active' })
    for (const nxt of kids) dfs(r, nxt)
  }

  snap(`MARK done: ${marked.size} of ${order.length} heap objects are reachable (green). SWEEP now walks the WHOLE heap in address order, ignoring pointers entirely, and frees whatever has no mark.`, 8)

  for (const id of order) {
    const o = OBJ[id]
    if (marked.has(id)) {
      snap(`Sweep ${o.addr}: ${id} is marked, keep it and clear its mark bit for the next collection.`, 11, { [id]: 'active' })
    } else {
      const cycleLeak = (id === 'G' || id === 'H') && !marked.has('G') && !marked.has('H')
      snap(
        cycleLeak
          ? `Sweep ${o.addr}: ${id} was never marked. Note ${id} still sits in the G-H cycle, so its reference count is not zero: ref counting would NEVER free it. Mark-and-sweep only asks "did marking reach you?", so free its ${o.bytes} bytes.`
          : `Sweep ${o.addr}: ${id} was never marked, so no root can reach it. Free its ${o.bytes} bytes.`,
        10,
        { [id]: 'compare' }
      )
      gone.add(id)
      reclaimed += o.bytes
      snap(`${id}'s ${o.bytes} bytes go back on the free list. Reclaimed so far: ${reclaimed} B.`, 10)
    }
  }

  const survivors = order.length - gone.size
  const usedNow = aliveObjs().filter((o) => !gone.has(o.id)).reduce((s, o) => s + o.bytes, 0)
  if (gone.size) {
    snap(`GC complete: freed ${gone.size} object${gone.size === 1 ? '' : 's'} (${reclaimed} B); ${survivors} object${survivors === 1 ? '' : 's'} (${usedNow} B) survive. The world resumes. This is exactly what would rescue the orphaned blocks in the Stack vs Heap topic.`, null)
  } else {
    snap('GC complete: every object was reachable, so nothing was freed (a full pause for zero bytes, which is why GCs try not to run too often). Unlink C and D, then run GC again to watch an unreachable cycle get collected.', null)
  }

  freed.value = [...freed.value, ...gone]
  player.setFrames(frames, { autoplay: true })
}

const legend = [
  ['root', '--viz-special'],
  ['visiting now', '--viz-active'],
  ['marked reachable', '--viz-done'],
  ['being freed', '--viz-compare'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <button class="btn btn-sm" :disabled="cuts.A || freed.includes('A')" @click="unlink('A')">unlink stack → A</button>
      <button class="btn btn-sm" :disabled="cuts.C || freed.includes('C')" @click="unlink('C')">unlink globals → C</button>
      <button class="btn btn-sm" :disabled="cuts.D || freed.includes('D')" @click="unlink('D')">unlink globals → D</button>
      <button class="btn btn-primary btn-sm" @click="runGC">run GC</button>
      <button class="btn btn-sm" @click="reset">reset</button>
    </template>

    <TreeSvg :nodes="view.nodes" :edges="view.edges" :r="21" />

    <template #state>
      <div class="panel">
        <div class="panel-title">heap accounting</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="{ active: view.live > 0 }">live objects: {{ view.live }}</span>
            <span class="chip" :class="{ done: view.freedCount > 0 }">freed: {{ view.freedCount }} ({{ view.freedBytes }} B)</span>
            <span class="chip">heap used: {{ view.usedBytes }} B</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Garbage = unreachable, not out-of-scope.</strong> The collector never asks who created
        an object or where; it asks whether any root still leads to it. That answer costs a
        stop-the-world pause, which is why real collectors lean on the generational hypothesis (most
        objects die young, so scan the nursery often and the old space rarely). And it is precisely what
        the Stack vs Heap topic was missing: the orphaned orange blocks there are unreachable, so this
        sweep would reclaim them automatically.
      </div>
    </template>
  </VisualizerShell>
</template>
