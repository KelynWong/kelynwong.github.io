<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const mode = ref('merge') // 'merge' | 'rebase'
const player = usePlayer()

const PSEUDO_MERGE = [
  'git checkout main',
  'git merge feature:',
  '  find the merge base (common ancestor)',
  '  combine diffs base..main + base..feature',
  '  create a commit with TWO parents',
  '  move main forward to it',
]

const PSEUDO_REBASE = [
  'git checkout feature',
  'git rebase main:',
  '  find the merge base',
  '  for each feature commit since the base:',
  '    re-apply its diff on the new base',
  '    (a NEW commit with a NEW hash)',
  '  move feature to the last copy',
  'git checkout main && git merge feature  // fast-forward',
]

// fixed starting history: m1 <- m2 on main; feature branches at m2 with f1, f2; main advanced with m3
const MAIN_Y = 185
const FEAT_Y = 95

function baseState() {
  return {
    commits: [
      { id: 'm1', label: 'a1f9', x: 70, y: MAIN_Y, cls: '', ghost: false },
      { id: 'm2', label: 'b7c2', x: 150, y: MAIN_Y, cls: '', ghost: false },
      { id: 'm3', label: 'c9e4', x: 230, y: MAIN_Y, cls: '', ghost: false },
      { id: 'f1', label: 'd2a8', x: 230, y: FEAT_Y, cls: '', ghost: false },
      { id: 'f2', label: 'e5b1', x: 310, y: FEAT_Y, cls: '', ghost: false },
    ],
    edges: [
      { from: 'm2', to: 'm1', cls: '' },
      { from: 'm3', to: 'm2', cls: '' },
      { from: 'f1', to: 'm2', cls: '' },
      { from: 'f2', to: 'f1', cls: '' },
    ],
    refs: { main: 'm3', feature: 'f2', HEAD: 'main' },
  }
}

function buildFrames() {
  const frames = []
  const s = baseState()
  const f = (desc, line = null) =>
    frames.push({
      desc, line,
      commits: s.commits.map((c) => ({ ...c })),
      edges: s.edges.map((e) => ({ ...e })),
      refs: { ...s.refs },
    })
  const mark = (id, cls) => { const c = s.commits.find((x) => x.id === id); if (c) c.cls = cls }
  const markEdge = (from, to, cls) => { const e = s.edges.find((x) => x.from === from && x.to === to); if (e) e.cls = cls }

  if (mode.value === 'merge') {
    s.refs.HEAD = 'main'
    f('The setup every team hits daily: feature branched at b7c2, gained d2a8 and e5b1, while main moved on with c9e4. The histories have DIVERGED: neither tip contains the other.', 0)
    mark('m3', 'active'); mark('f2', 'active')
    f('git merge feature, standing on main. Git looks at the two tips: main is at c9e4, feature is at e5b1.', 1)
    mark('m2', 'special')
    f('Step 1: walk both histories backwards until they meet. b7c2 is the MERGE BASE, the last commit both sides agree on. Merging is a three-way comparison: base vs main vs feature.', 2)
    f('Step 2: compute what main changed since the base, and what feature changed since the base, then combine both sets of changes into one tree. (If both sides touched the same lines, THIS is where you get conflicts.)', 3)
    s.commits.push({ id: 'M', label: 'f8d3', x: 390, y: MAIN_Y, cls: 'done', ghost: false })
    s.edges.push({ from: 'M', to: 'm3', cls: 'active' })
    s.edges.push({ from: 'M', to: 'f2', cls: 'active' })
    f('Step 3: a MERGE COMMIT f8d3 is created with TWO parents, one edge to each tip. This is the only kind of commit with two parents, and it is what makes the diamond shape in git log.', 4)
    s.refs.main = 'M'
    f('main moves forward to the merge commit. Notice what did NOT happen: d2a8 and e5b1 kept their hashes, and history shows the true story: work happened in parallel and joined here.', 5)
    mark('m2', ''); mark('m3', ''); mark('f2', ''); markEdge('M', 'm3', ''); markEdge('M', 'f2', '')
    f('Trade-off: merge preserves the truth and never rewrites anything, but a busy repo accumulates merge-commit noise, and git log stops being a straight line.', 5)
  } else {
    s.refs.HEAD = 'feature'
    f('Same diverged history, other strategy. This time we stand on feature and run git rebase main: "replay my work as if I had started from the CURRENT main".', 0)
    mark('m2', 'special')
    f('Step 1: find the merge base b7c2, same as merge. The commits to replay are everything on feature since then: d2a8, then e5b1, in order.', 2)
    mark('f1', 'compare')
    f('Step 2: take the DIFF of d2a8 and re-apply it on top of c9e4, the tip of main...', 4)
    s.commits.push({ id: 'f1p', label: "d2a8'→ 71aa", x: 310, y: MAIN_Y, cls: 'done', ghost: false })
    s.edges.push({ from: 'f1p', to: 'm3', cls: '' })
    const f1 = s.commits.find((c) => c.id === 'f1'); f1.ghost = true; f1.cls = ''
    f('...creating 71aa, a NEW commit. Same changes, same message, DIFFERENT hash, because a commit hash covers its parent, and the parent changed. Rebase never moves commits, it re-creates them.', 5)
    mark('f2', 'compare')
    f('Step 3: replay e5b1 the same way, on top of the copy.', 4)
    s.commits.push({ id: 'f2p', label: "e5b1'→ 82bb", x: 390, y: MAIN_Y, cls: 'done', ghost: false })
    s.edges.push({ from: 'f2p', to: 'f1p', cls: '' })
    const f2c = s.commits.find((c) => c.id === 'f2'); f2c.ghost = true; f2c.cls = ''
    f('82bb is the second copy. The original d2a8 and e5b1 are now unreferenced ghosts: still in the object store (reflog can recover them), but no branch points at them anymore.', 5)
    s.refs.feature = 'f2p'
    f('Step 4: the feature pointer moves to the last copy. The branch now sits directly on top of main, as if the divergence never happened.', 6)
    s.refs.main = 'f2p'; s.refs.HEAD = 'main'
    mark('m2', '')
    f('Step 5: back on main, the merge is now a FAST-FORWARD: main just slides its pointer up. No merge commit, one perfectly straight line of history.', 7)
    f('Trade-off: a clean, linear, bisect-friendly log, but history was REWRITTEN. Anyone who had the old d2a8/e5b1 now disagrees with you, which is why the golden rule exists: never rebase commits that others already have.', 7)
  }
  player.setFrames(frames)
}

watchEffect(buildFrames)

const view = computed(() => player.frame.value || baseState())
const byId = computed(() => Object.fromEntries(view.value.commits.map((c) => [c.id, c])))

const clsColor = { active: 'var(--viz-active)', compare: 'var(--viz-compare)', done: 'var(--viz-done)', special: 'var(--viz-special)' }

function edgeCoords(e) {
  const a = byId.value[e.from], b = byId.value[e.to]
  if (!a || !b) return null
  const dx = b.x - a.x, dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const r = 18
  return { x1: a.x + (dx / d) * r, y1: a.y + (dy / d) * r, x2: b.x - (dx / d) * r, y2: b.y - (dy / d) * r }
}

// refs grouped by target commit so labels stack instead of overlapping
const refLabels = computed(() => {
  const out = []
  const refs = view.value.refs
  for (const name of ['main', 'feature']) {
    const c = byId.value[refs[name]]
    if (!c) continue
    const isHead = refs.HEAD === name
    out.push({
      name: isHead ? `${name} ← HEAD` : name,
      x: c.x,
      y: name === 'main' ? c.y + 38 : c.y - 38,
      color: name === 'main' ? 'var(--accent1)' : 'var(--accent3)',
      lineY: name === 'main' ? c.y + 22 : c.y - 22,
      cy: c.y,
    })
  }
  return out
})

const legend = [
  ['tips being merged', '--viz-active'],
  ['merge base', '--viz-special'],
  ['being replayed', '--viz-compare'],
  ['new commit', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="mode === 'merge' ? PSEUDO_MERGE : PSEUDO_REBASE" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': mode === 'merge' }" @click="mode = 'merge'">git merge feature</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'rebase' }" @click="mode = 'rebase'">git rebase main</button>
      <span class="cell-idx" style="margin-left: auto">same starting history, two endings</span>
    </template>

    <svg class="viz-svg" viewBox="0 0 480 250" style="max-width: 560px; margin: 0 auto">
      <defs>
        <marker id="mr-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
      </defs>

      <text x="12" y="100" fill="var(--text-faint)" font-size="9">feature lane</text>
      <text x="12" y="190" fill="var(--text-faint)" font-size="9">main lane</text>

      <g v-for="(e, i) in view.edges" :key="'e' + i" :opacity="byId[e.from]?.ghost ? 0.25 : 1">
        <line
          v-if="edgeCoords(e)"
          v-bind="edgeCoords(e)"
          :stroke="e.cls ? clsColor[e.cls] : 'var(--text-dim)'"
          :stroke-width="e.cls ? 2.2 : 1.4"
          marker-end="url(#mr-a)"
        />
      </g>

      <g v-for="c in view.commits" :key="c.id" :opacity="c.ghost ? 0.25 : 1">
        <circle :cx="c.x" :cy="c.y" r="16" fill="var(--bg3)" :stroke="c.cls ? clsColor[c.cls] : 'var(--border2)'" :stroke-width="c.cls ? 2.4 : 1.5" :stroke-dasharray="c.ghost ? '4 3' : ''" />
        <text :x="c.x" :y="c.y + 3.5" text-anchor="middle" :fill="c.cls ? clsColor[c.cls] : 'var(--text)'" font-size="8.5">{{ c.label.split('→')[0] }}</text>
        <text v-if="c.label.includes('→')" :x="c.x" :y="c.y - 24" text-anchor="middle" fill="var(--viz-done)" font-size="8.5">new: {{ c.label.split('→')[1] }}</text>
      </g>

      <g v-for="r in refLabels" :key="r.name">
        <line :x1="r.x" :y1="r.lineY" :x2="r.x" :y2="r.cy + (r.lineY > r.cy ? 18 : -18)" :stroke="r.color" stroke-width="1.2" stroke-dasharray="2 2" />
        <rect :x="r.x - 40" :y="r.lineY > r.cy ? r.lineY : r.lineY - 16" width="80" height="16" rx="3" fill="var(--bg2)" :stroke="r.color" stroke-width="1.2" />
        <text :x="r.x" :y="(r.lineY > r.cy ? r.lineY : r.lineY - 16) + 11" text-anchor="middle" :fill="r.color" font-size="9">{{ r.name }}</text>
      </g>
    </svg>

    <template #state>
      <div class="panel">
        <div class="panel-title">refs</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" style="color: var(--accent1); border-color: var(--accent1)">main → {{ byId[view.refs.main]?.label.split('→').pop().trim() }}</span>
            <span class="chip" style="color: var(--accent3); border-color: var(--accent3)">feature → {{ byId[view.refs.feature]?.label.split('→').pop().trim() }}</span>
            <span class="chip">HEAD → {{ view.refs.HEAD }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>The golden rule:</strong> rebase your own unpushed work as much as you like, but never
        rebase commits other people already have, because their copies keep the old hashes and the
        histories fork. Teams usually pick a convention: merge commits for the true story, rebase for a
        clean line, or squash-merge as the middle ground (one commit per feature, original history
        discarded). All three end with the same code, they just tell different stories.
      </div>
    </template>
  </VisualizerShell>
</template>
