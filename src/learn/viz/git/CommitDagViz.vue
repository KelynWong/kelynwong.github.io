<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const player = usePlayer()

const W = 640, H = 300
const MAIN_Y = 200, FEAT_Y = 120
const MAX_COMMITS = 8

// Deterministic short-hash sequence: no randomness, so replays look identical.
const HASHES = ['a1f9', 'b7e2', 'c9d4', 'e3a8', 'f5c1', '9b2e', '71d6', '84aa', '2c5b', 'd0f3', '4e8c', '66b1']
let hashIdx = 0
function nextHash() { return HASHES[hashIdx++ % HASHES.length] }

// model: commits are immutable snapshots; branches are just movable pointers.
const commits = ref([])          // {hash, x, y, parents: [hash]}
const refsMap = ref({ main: null, feature: null })
const head = ref('main')         // name of the branch HEAD points at
const log = ref([])              // git commands run so far

function init() {
  hashIdx = 0
  const h0 = nextHash()
  const h1 = nextHash()
  commits.value = [
    { hash: h0, x: 60, y: MAIN_Y, parents: [] },
    { hash: h1, x: 135, y: MAIN_Y, parents: [h0] },
  ]
  refsMap.value = { main: h1, feature: null }
  head.value = 'main'
  log.value = []
  player.setFrames([])
}
init()

function byHash() {
  return Object.fromEntries(commits.value.map((c) => [c.hash, c]))
}

function isAncestor(anc, tip) {
  const map = byHash()
  const stack = [tip]
  const seen = new Set()
  while (stack.length) {
    const h = stack.pop()
    if (h === anc) return true
    if (seen.has(h)) continue
    seen.add(h)
    const c = map[h]
    if (c) stack.push(...c.parents)
  }
  return false
}

// child -> parent edge, endpoints pulled back to the circle rims. Cross-lane
// edges get a gentle curve so merges and branch points read clearly.
function edgePath(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const r = 20
  const x1 = a.x + (dx / d) * r, y1 = a.y + (dy / d) * r
  const x2 = b.x - (dx / d) * r, y2 = b.y - (dy / d) * r
  if (a.y === b.y) return `M ${x1} ${y1} L ${x2} ${y2}`
  return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1}, ${x2} ${y2}`
}

// Build one full render snapshot of the current model, with optional highlights.
function snap(desc, { active = [], compare = [], activeEdges = [] } = {}) {
  const map = byHash()
  const nodes = commits.value.map((c) => ({
    hash: c.hash, x: c.x, y: c.y,
    cls: active.includes(c.hash) ? 'active' : compare.includes(c.hash) ? 'compare' : '',
  }))
  const edges = []
  for (const c of commits.value) {
    for (const p of c.parents) {
      const pc = map[p]
      if (!pc) continue
      edges.push({
        id: `${c.hash}>${p}`,
        d: edgePath(c, pc),
        cls: activeEdges.some(([ch, pa]) => ch === c.hash && pa === p) ? 'active' : '',
      })
    }
  }
  const labels = []
  for (const name of ['main', 'feature']) {
    const tip = refsMap.value[name]
    if (!tip || !map[tip]) continue
    labels.push({ name, x: map[tip].x, y: map[tip].y, below: name === 'main' })
  }
  return {
    desc,
    line: null,
    nodes,
    edges,
    labels,
    refs: { ...refsMap.value },
    headOn: head.value,
  }
}

const resting = computed(() => snap(''))
const view = computed(() => player.frame.value || resting.value)
const headLabel = computed(() => view.value.labels.find((l) => l.name === view.value.headOn) || null)

const canMerge = computed(() =>
  head.value === 'main' &&
  !!refsMap.value.feature &&
  refsMap.value.feature !== refsMap.value.main &&
  !isAncestor(refsMap.value.feature, refsMap.value.main)
)

function doCommit() {
  if (commits.value.length >= MAX_COMMITS) return
  const parent = refsMap.value[head.value]
  const c = {
    hash: nextHash(),
    x: 60 + commits.value.length * 75,
    y: head.value === 'feature' ? FEAT_Y : MAIN_Y,
    parents: [parent],
  }
  commits.value = [...commits.value, c]
  const f1 = snap(
    `New commit ${c.hash} snapshots your work. The one piece of history it stores is the hash of its parent, ${parent}: arrows point backward in time, and a commit never knows its children.`,
    { active: [c.hash], activeEdges: [[c.hash, parent]] }
  )
  refsMap.value = { ...refsMap.value, [head.value]: c.hash }
  const f2 = snap(
    `Then the branch ${head.value} advances to ${c.hash}, and HEAD rides along, because HEAD points at the branch, not at any commit.`,
    { active: [c.hash] }
  )
  log.value = [...log.value, 'git commit']
  player.setFrames([f1, f2], { autoplay: true })
}

function doBranch() {
  if (refsMap.value.feature) return
  const tip = refsMap.value[head.value]
  refsMap.value = { ...refsMap.value, feature: tip }
  const f1 = snap(
    `git branch feature wrote one 41-byte file: .git/refs/heads/feature, containing "${tip}". Nothing was copied; a branch is just a movable pointer to a commit.`,
    { active: [tip] }
  )
  const f2 = snap(
    `Notice HEAD still points at ${head.value}: creating a branch does not switch to it. Both labels currently name the same commit.`
  )
  log.value = [...log.value, 'git branch feature']
  player.setFrames([f1, f2], { autoplay: true })
}

function doCheckout() {
  if (!refsMap.value.feature) return
  const from = head.value
  const target = from === 'main' ? 'feature' : 'main'
  const f1 = snap(
    `Leaving ${from}. Watch the graph: nothing in it will change, because checkout is about to move exactly one pointer.`,
    { active: [refsMap.value[from]] }
  )
  head.value = target
  const f2 = snap(
    `HEAD now points at ${target}, and the working directory is rewritten to match ${refsMap.value[target]}. New commits will grow the ${target} branch.`,
    { active: [refsMap.value[target]] }
  )
  log.value = [...log.value, `git checkout ${target}`]
  player.setFrames([f1, f2], { autoplay: true })
}

function doMerge() {
  if (!canMerge.value) return
  const mainTip = refsMap.value.main
  const featTip = refsMap.value.feature
  const frames = []
  if (isAncestor(mainTip, featTip)) {
    // fast-forward: main is strictly behind feature
    frames.push(snap(
      `main (${mainTip}) is an ancestor of feature (${featTip}): feature is directly ahead, with no divergence to reconcile.`,
      { compare: [mainTip, featTip] }
    ))
    refsMap.value = { ...refsMap.value, main: featTip }
    frames.push(snap(
      `Fast-forward: git simply slides the main pointer up to ${featTip}. No merge commit was created; nothing new exists, a label just moved.`,
      { active: [featTip] }
    ))
  } else {
    frames.push(snap(
      `main (${mainTip}) and feature (${featTip}) have diverged: each has commits the other lacks, so no single pointer move can represent both histories.`,
      { compare: [mainTip, featTip] }
    ))
    const m = {
      hash: nextHash(),
      x: 60 + commits.value.length * 75,
      y: MAIN_Y,
      parents: [mainTip, featTip],
    }
    commits.value = [...commits.value, m]
    frames.push(snap(
      `Git creates merge commit ${m.hash} with TWO parents, ${mainTip} and ${featTip}. It is the only kind of commit that joins two histories.`,
      { active: [m.hash], activeEdges: [[m.hash, mainTip], [m.hash, featTip]] }
    ))
    refsMap.value = { ...refsMap.value, main: m.hash }
    frames.push(snap(
      `main and HEAD advance to ${m.hash}. Both lines of work are now reachable from main, and every old commit keeps its original hash.`,
      { active: [m.hash] }
    ))
  }
  log.value = [...log.value, 'git merge feature']
  player.setFrames(frames, { autoplay: true })
}

const hint = computed(() => {
  if (commits.value.length >= MAX_COMMITS) return 'Sandbox is full: press reset to start a fresh repo.'
  if (!refsMap.value.feature) return 'Try: git branch feature, then checkout feature and commit on it.'
  if (canMerge.value) return 'Histories can be merged: press git merge feature while on main.'
  return 'Each button runs a real git operation; the caption narrates exactly what moved.'
})

const CLS_COLOR = {
  active: 'var(--viz-active)',
  compare: 'var(--viz-compare)',
  done: 'var(--viz-done)',
  special: 'var(--viz-special)',
}
function strokeOf(cls) { return CLS_COLOR[cls] || 'var(--border2)' }

const legend = [
  ['just created / moved', '--viz-active'],
  ['merge inputs', '--viz-compare'],
  ['branch pointer', '--viz-done'],
  ['HEAD', '--viz-special'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <button
        class="btn btn-primary btn-sm"
        :disabled="commits.length >= MAX_COMMITS"
        @click="doCommit"
      >git commit</button>
      <button
        class="btn btn-sm"
        :disabled="!!refsMap.feature"
        title="a branch is just a 41-byte pointer file"
        @click="doBranch"
      >git branch feature</button>
      <button
        class="btn btn-sm"
        :disabled="!refsMap.feature"
        @click="doCheckout"
      >git checkout {{ head === 'main' ? 'feature' : 'main' }}</button>
      <button
        class="btn btn-sm"
        :disabled="!canMerge || commits.length >= MAX_COMMITS"
        title="enabled on main, once feature has commits that main lacks"
        @click="doMerge"
      >git merge feature</button>
      <button class="btn btn-sm" style="margin-left: auto" @click="init">reset</button>
    </template>

    <svg class="viz-svg" :viewBox="`0 0 ${W} ${H}`">
      <defs>
        <marker id="cdag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-faint)" />
        </marker>
        <marker id="cdag-arrow-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-active)" />
        </marker>
      </defs>

      <path
        v-for="e in view.edges"
        :key="e.id"
        :d="e.d"
        fill="none"
        :stroke="e.cls === 'active' ? 'var(--viz-active)' : 'var(--text-faint)'"
        :stroke-width="e.cls === 'active' ? 2.4 : 1.6"
        :marker-end="e.cls === 'active' ? 'url(#cdag-arrow-hot)' : 'url(#cdag-arrow)'"
      />

      <g v-for="n in view.nodes" :key="n.hash">
        <circle
          :cx="n.x" :cy="n.y" r="17"
          fill="var(--bg3)"
          :stroke="strokeOf(n.cls)"
          :stroke-width="n.cls ? 2.5 : 1.5"
        />
        <text
          :x="n.x" :y="n.y + 3.5"
          text-anchor="middle" font-size="10"
          :fill="n.cls ? strokeOf(n.cls) : 'var(--text)'"
        >{{ n.hash }}</text>
      </g>

      <g v-for="l in view.labels" :key="l.name">
        <line
          :x1="l.x" :y1="l.below ? l.y + 19 : l.y - 19"
          :x2="l.x" :y2="l.below ? l.y + 32 : l.y - 32"
          stroke="var(--viz-done)" stroke-width="1.2"
        />
        <rect
          :x="l.x - 27" :y="l.below ? l.y + 32 : l.y - 50"
          width="54" height="18" rx="5"
          fill="var(--bg2)" stroke="var(--viz-done)"
        />
        <text
          :x="l.x" :y="(l.below ? l.y + 32 : l.y - 50) + 12.5"
          text-anchor="middle" font-size="10"
          fill="var(--viz-done)"
        >{{ l.name }}</text>
      </g>

      <g v-if="headLabel">
        <line
          :x1="headLabel.x" :y1="headLabel.below ? headLabel.y + 50 : headLabel.y - 50"
          :x2="headLabel.x" :y2="headLabel.below ? headLabel.y + 54 : headLabel.y - 54"
          stroke="var(--viz-special)" stroke-width="1.2"
        />
        <rect
          :x="headLabel.x - 24" :y="headLabel.below ? headLabel.y + 54 : headLabel.y - 71"
          width="48" height="17" rx="5"
          fill="var(--bg2)" stroke="var(--viz-special)"
        />
        <text
          :x="headLabel.x" :y="(headLabel.below ? headLabel.y + 54 : headLabel.y - 71) + 12"
          text-anchor="middle" font-size="10"
          fill="var(--viz-special)"
        >HEAD</text>
      </g>
    </svg>
    <div class="cell-idx" style="margin-top: 10px; text-align: center">{{ hint }}</div>

    <template #state>
      <div class="panel">
        <div class="panel-title">commands run</div>
        <div class="state-body">
          <div v-if="log.length" class="state-chips">
            <span
              v-for="(c, i) in log"
              :key="i"
              class="chip"
              :class="{ active: i === log.length - 1 }"
            >{{ c }}</span>
          </div>
          <div v-else class="state-empty">fresh repo: two commits on main</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">refs (pointers)</div>
        <div class="state-body state-chips">
          <span class="chip done">main → {{ view.refs.main }}</span>
          <span v-if="view.refs.feature" class="chip done">feature → {{ view.refs.feature }}</span>
          <span class="chip" style="color: var(--viz-special); border-color: var(--viz-special)">HEAD → {{ view.headOn }}</span>
        </div>
      </div>
      <div class="note">
        <strong>It is all just this graph:</strong> everything in .git boils down to commits plus a
        handful of pointers at them. Branches are 41-byte files, checkout moves one pointer, and the
        reflog remembers every commit HEAD ever visited, which is why committed work is almost never
        truly lost. Even the dreaded detached HEAD is just HEAD pointing at a commit directly instead
        of through a branch.
      </div>
    </template>
  </VisualizerShell>
</template>
