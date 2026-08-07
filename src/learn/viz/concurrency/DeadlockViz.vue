<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const mode = ref('deadlock') // 'deadlock' | 'fix'
const player = usePlayer()

const PROG_A = ['lock(L1)', 'lock(L2)', 'balance += 10', 'unlock(L2)', 'unlock(L1)']
const PROG_B_BAD = ['lock(L2)', 'lock(L1)', 'balance -= 5', 'unlock(L1)', 'unlock(L2)']
const PROG_B_FIX = ['lock(L1)', 'lock(L2)', 'balance -= 5', 'unlock(L2)', 'unlock(L1)']

function buildFrames() {
  const bad = mode.value === 'deadlock'
  const progB = bad ? PROG_B_BAD : PROG_B_FIX
  const frames = []

  const f = (desc, s) =>
    frames.push({
      desc,
      progB,
      aPc: s.aPc, bPc: s.bPc,
      aState: s.aState, bState: s.bState,
      locks: { ...s.locks },
      waiting: { ...s.waiting },
      cycle: s.cycle || false,
    })

  const s = {
    aPc: -1, bPc: -1,
    aState: 'READY', bState: 'READY',
    locks: { L1: null, L2: null },
    waiting: { A: null, B: null },
  }

  f(
    bad
      ? 'Two threads, two locks. Thread A takes L1 then L2; Thread B takes them in the OPPOSITE order. Each order looks fine on its own.'
      : 'Same two threads, but now BOTH acquire L1 first, then L2. One global lock order for everyone.',
    s
  )

  if (bad) {
    s.aPc = 0; s.aState = 'RUNNING'; s.locks.L1 = 'A'
    f('Thread A runs lock(L1) and gets it: L1 is free. A now HOLDS L1.', s)
    s.bPc = 0; s.bState = 'RUNNING'; s.locks.L2 = 'B'
    f('The scheduler switches. Thread B runs lock(L2) and gets it: L2 is free. B now HOLDS L2. Nothing is wrong yet.', s)
    s.aPc = 1; s.aState = 'BLOCKED'; s.waiting.A = 'L2'
    f('Thread A tries lock(L2), but B holds it. A BLOCKS and waits. Blocking is normal: A assumes L2 will be released soon.', s)
    s.bPc = 1; s.bState = 'BLOCKED'; s.waiting.B = 'L1'
    f('Thread B tries lock(L1), but A holds it. B BLOCKS too. Now look at the wait-for graph on the canvas.', s)
    s.aState = 'DEADLOCKED'; s.bState = 'DEADLOCKED'; s.cycle = true
    f('A waits for L2 (held by B), and B waits for L1 (held by A). That is a CYCLE in the wait-for graph, and a cycle IS a deadlock: neither thread can ever run again. All four Coffman conditions are met: mutual exclusion, hold-and-wait, no preemption, circular wait.', s)
    f('The program is frozen forever. No error is thrown, no CPU is burned, it just... stops. This is why deadlocks are so nasty in production: everything looks idle. Switch to the "lock ordering fix" mode to break the cycle.', s)
  } else {
    s.aPc = 0; s.aState = 'RUNNING'; s.locks.L1 = 'A'
    f('Thread A runs lock(L1) and gets it.', s)
    s.bPc = 0; s.bState = 'BLOCKED'; s.waiting.B = 'L1'
    f('Thread B ALSO wants L1 first (same order for everyone). A holds it, so B blocks here, before it holds anything. B waits while holding NOTHING, so no cycle can form.', s)
    s.aPc = 1; s.locks.L2 = 'A'
    f('Thread A takes L2 freely: B is not holding it, because B could never get past L1. A holds both locks.', s)
    s.aPc = 2
    f('A does its work safely inside the critical section.', s)
    s.aPc = 3; s.locks.L2 = null
    f('A releases L2...', s)
    s.aPc = 4; s.locks.L1 = null; s.aState = 'DONE'
    s.bState = 'RUNNING'; s.waiting.B = null; s.locks.L1 = 'B'
    f('...and releases L1. B immediately wakes up and grabs L1. The queue moved: no one waited forever.', s)
    s.bPc = 1; s.locks.L2 = 'B'
    f('B takes L2, does its work, and will release both. A total order on locks means the wait-for graph can never contain a cycle.', s)
    s.bPc = 4; s.locks.L1 = null; s.locks.L2 = null; s.bState = 'DONE'
    f('Both threads finished. Same code, same locks, zero deadlocks: the only change was agreeing on ONE acquisition order.', s)
  }
  player.setFrames(frames)
}

watchEffect(buildFrames)

const view = computed(
  () =>
    player.frame.value || {
      progB: mode.value === 'deadlock' ? PROG_B_BAD : PROG_B_FIX,
      aPc: -1, bPc: -1, aState: 'READY', bState: 'READY',
      locks: { L1: null, L2: null }, waiting: { A: null, B: null }, cycle: false,
    }
)

// wait-for graph geometry
const POS = { A: { x: 90, y: 110 }, B: { x: 510, y: 110 }, L1: { x: 230, y: 40 }, L2: { x: 370, y: 180 } }

const stateColor = { RUNNING: 'var(--viz-active)', READY: 'var(--text-dim)', BLOCKED: 'var(--viz-warn)', DEADLOCKED: 'var(--viz-compare)', DONE: 'var(--viz-done)' }

function holdEdges() {
  const out = []
  for (const L of ['L1', 'L2']) {
    const owner = view.value.locks[L]
    if (owner) out.push({ from: POS[L], to: POS[owner], cls: view.value.cycle ? 'hot' : '' })
  }
  return out
}
function waitEdges() {
  const out = []
  for (const T of ['A', 'B']) {
    const L = view.value.waiting[T]
    if (L) out.push({ from: POS[T], to: POS[L], cls: view.value.cycle ? 'hot' : '' })
  }
  return out
}

function shrink(p1, p2, r1, r2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y
  const d = Math.hypot(dx, dy) || 1
  return { x1: p1.x + (dx / d) * r1, y1: p1.y + (dy / d) * r1, x2: p2.x - (dx / d) * r2, y2: p2.y - (dy / d) * r2 }
}

const legend = [
  ['running', '--viz-active'],
  ['blocked (waiting)', '--viz-warn'],
  ['deadlocked cycle', '--viz-compare'],
  ['done', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': mode === 'deadlock' }" @click="mode = 'deadlock'">opposite order (deadlock)</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'fix' }" @click="mode = 'fix'">lock ordering fix</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 20px">
      <!-- thread programs -->
      <div style="display: flex; gap: 28px; justify-content: center; flex-wrap: wrap">
        <div v-for="t in ['A', 'B']" :key="t" style="display: flex; flex-direction: column; gap: 5px">
          <div class="cell-idx" style="text-align: left">
            Thread {{ t }}
            <span class="chip" style="margin-left: 6px; font-size: var(--fs-4xs)" :style="{ color: stateColor[t === 'A' ? view.aState : view.bState], borderColor: stateColor[t === 'A' ? view.aState : view.bState] }">
              {{ t === 'A' ? view.aState : view.bState }}
            </span>
          </div>
          <div
            v-for="(ins, i) in t === 'A' ? PROG_A : view.progB"
            :key="i"
            class="cell"
            :class="(t === 'A' ? view.aPc : view.bPc) === i ? ((t === 'A' ? view.aState : view.bState) === 'BLOCKED' || (t === 'A' ? view.aState : view.bState) === 'DEADLOCKED' ? 'compare' : 'active') : (t === 'A' ? view.aPc : view.bPc) > i ? 'done' : ''"
            style="min-width: 170px; height: 32px; justify-content: flex-start; font-size: var(--fs-3xs)"
          >{{ ins }}</div>
        </div>
      </div>

      <!-- wait-for graph -->
      <svg class="viz-svg" viewBox="0 0 600 230" style="max-width: 620px; margin: 0 auto">
        <defs>
          <marker id="dl-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
          </marker>
          <marker id="dl-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-compare)" />
          </marker>
        </defs>

        <g v-for="(e, i) in holdEdges()" :key="'h' + i">
          <line v-bind="shrink(e.from, e.to, 26, 30)" :stroke="e.cls === 'hot' ? 'var(--viz-compare)' : 'var(--text-dim)'" stroke-width="1.8" :marker-end="e.cls === 'hot' ? 'url(#dl-hot)' : 'url(#dl-a)'" />
          <text :x="(e.from.x + e.to.x) / 2" :y="(e.from.y + e.to.y) / 2 - 7" text-anchor="middle" fill="var(--text-faint)" font-size="9.5">held by</text>
        </g>
        <g v-for="(e, i) in waitEdges()" :key="'w' + i">
          <line v-bind="shrink(e.from, e.to, 30, 26)" :stroke="e.cls === 'hot' ? 'var(--viz-compare)' : 'var(--viz-warn)'" stroke-width="1.8" stroke-dasharray="5 4" :marker-end="e.cls === 'hot' ? 'url(#dl-hot)' : 'url(#dl-a)'" />
          <text :x="(e.from.x + e.to.x) / 2" :y="(e.from.y + e.to.y) / 2 + 14" text-anchor="middle" :fill="e.cls === 'hot' ? 'var(--viz-compare)' : 'var(--viz-warn)'" font-size="9.5">waiting for</text>
        </g>

        <g v-for="t in ['A', 'B']" :key="t">
          <circle :cx="POS[t].x" :cy="POS[t].y" r="26" fill="var(--bg3)" :stroke="stateColor[t === 'A' ? view.aState : view.bState]" stroke-width="2.2" />
          <text :x="POS[t].x" :y="POS[t].y + 5" text-anchor="middle" fill="var(--text)" font-size="14">{{ t }}</text>
        </g>
        <g v-for="L in ['L1', 'L2']" :key="L">
          <rect :x="POS[L].x - 24" :y="POS[L].y - 20" width="48" height="40" rx="5" fill="var(--bg3)" :stroke="view.locks[L] ? (view.cycle ? 'var(--viz-compare)' : 'var(--viz-active)') : 'var(--border2)'" stroke-width="2" />
          <text :x="POS[L].x" :y="POS[L].y - 1" text-anchor="middle" fill="var(--text)" font-size="12">{{ L }}</text>
          <text :x="POS[L].x" :y="POS[L].y + 13" text-anchor="middle" fill="var(--text-dim)" font-size="8.5">{{ view.locks[L] ? 'owner: ' + view.locks[L] : 'free' }}</text>
        </g>
        <text v-if="view.cycle" x="300" y="222" text-anchor="middle" fill="var(--viz-compare)" font-size="11">circular wait: A → L2 → B → L1 → A</text>
      </svg>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">lock table</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="{ active: !!view.locks.L1 }">L1: {{ view.locks.L1 || 'free' }}</span>
            <span class="chip" :class="{ active: !!view.locks.L2 }">L2: {{ view.locks.L2 || 'free' }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Deadlock needs all four Coffman conditions:</strong> mutual exclusion, hold-and-wait,
        no preemption, and circular wait. Break any ONE and deadlock is impossible. The classic fixes:
        acquire locks in a single global order (kills circular wait, which is what this demo shows),
        use try-lock with backoff (kills hold-and-wait), or add timeouts. Databases instead detect the
        cycle at runtime and kill one transaction as the "deadlock victim".
      </div>
    </template>
  </VisualizerShell>
</template>
