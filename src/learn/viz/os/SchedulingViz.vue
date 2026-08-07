<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const mode = ref('fcfs') // 'fcfs' | 'sjf' | 'rr'
const player = usePlayer()

const PROCS = [
  { id: 1, name: 'P1', arrive: 0, burst: 5, colorVar: '--accent1' },
  { id: 2, name: 'P2', arrive: 1, burst: 3, colorVar: '--accent3' },
  { id: 3, name: 'P3', arrive: 2, burst: 1, colorVar: '--code4' },
  { id: 4, name: 'P4', arrive: 3, burst: 2, colorVar: '--code5' },
]
const TOTAL_TICKS = PROCS.reduce((s, p) => s + p.burst, 0)
const QUANTUM = 2

const FCFS_PSEUDO = [
  'queue = jobs in ARRIVAL order',
  'while jobs remain:',
  '  p = queue.dequeue()  // the front',
  '  run p to COMPLETION',
  '  // no preemption: late short jobs',
  '  // wait behind early long ones',
]
const SJF_PSEUDO = [
  'while jobs remain:',
  '  wait until some job is ready',
  '  p = ready job w/ SHORTEST burst',
  '  run p to COMPLETION',
  '  // non-preemptive, and it must',
  '  // PREDICT burst lengths!',
]
const RR_PSEUDO = [
  'quantum = 2',
  'while queue not empty:',
  '  p = queue.dequeue()',
  '  run p for min(quantum, remaining)',
  '  if p not finished:',
  '    queue.enqueue(p)  // to the BACK',
]

const INTROS = {
  fcfs: 'First-Come First-Served: run jobs strictly in arrival order, each to completion. Workload: P1 (arrive 0, burst 5), P2 (1, 3), P3 (2, 1), P4 (3, 2).',
  sjf: 'Shortest Job First, non-preemptive: whenever the CPU frees up, pick the READY job with the smallest burst. Same workload: P1 (0, 5), P2 (1, 3), P3 (2, 1), P4 (3, 2).',
  rr: 'Round Robin, quantum 2: each dispatch gets at most 2 ticks, then the job goes to the BACK of the queue. Same workload: P1 (0, 5), P2 (1, 3), P3 (2, 1), P4 (3, 2).',
}

function buildFrames(algo) {
  const frames = []
  const procs = PROCS.map((p) => ({ ...p, rem: p.burst, finish: null }))
  const byId = {}
  procs.forEach((p) => { byId[p.id] = p })
  const gantt = []
  let queue = []
  let t = 0
  let running = null
  let slice = 0
  const arrived = new Set()

  const arrive = () => {
    for (const p of procs) {
      if (p.arrive <= t && !arrived.has(p.id)) { arrived.add(p.id); queue.push(p.id) }
    }
  }

  const snap = (desc, line, extra = {}) => frames.push({
    desc, line, t,
    gantt: gantt.map((g) => ({ ...g })),
    ready: queue.map((id) => ({ id, name: byId[id].name, rem: byId[id].rem })),
    running: running !== null ? { id: running, name: byId[running].name, rem: byId[running].rem } : null,
    table: null,
    ...extra,
  })

  snap(INTROS[algo], 0)

  while (procs.some((p) => p.rem > 0)) {
    arrive()
    if (running === null) {
      if (!queue.length) {
        gantt.push({ t, id: null, name: 'idle' })
        snap(`t=${t}: no process is ready yet, the CPU idles.`, 1)
        t++
        continue
      }
      let id
      if (algo === 'sjf') {
        id = queue.reduce((best, q) => (byId[q].rem < byId[best].rem ? q : best), queue[0])
        queue = queue.filter((q) => q !== id)
      } else {
        id = queue.shift()
      }
      running = id
      slice = QUANTUM
      const p = byId[id]
      let why
      if (algo === 'fcfs') {
        why = `t=${t}: CPU is free. FCFS dispatches ${p.name} because it sits at the FRONT of the queue (earliest arrival).`
        const shorter = queue.filter((q) => byId[q].rem < p.rem).map((q) => byId[q].name)
        if (shorter.length) why += ` Note ${shorter.join(' and ')} would finish sooner, but FCFS never looks past the front: the convoy effect.`
      } else if (algo === 'sjf') {
        why = `t=${t}: CPU is free. SJF scans the ready jobs and picks ${p.name}, the shortest burst (${p.rem} tick${p.rem === 1 ? '' : 's'}).`
        const earlier = queue.filter((q) => byId[q].arrive < p.arrive).map((q) => byId[q].name)
        if (earlier.length) why += ` ${earlier.join(' and ')} arrived earlier but must keep waiting: shortest job wins.`
      } else {
        why = `t=${t}: ${p.name} is dequeued and gets the CPU for a quantum of up to ${QUANTUM} ticks (${p.rem} remaining).`
      }
      snap(why, 2)
    }

    // execute one tick
    const p = byId[running]
    gantt.push({ t, id: p.id, name: p.name })
    p.rem--
    slice--
    t++
    arrive() // a process arriving right now joins the queue before any preempted one

    if (p.rem === 0) {
      p.finish = t
      snap(`t=${t}: ${p.name} FINISHES. Turnaround = finish - arrival = ${t} - ${p.arrive} = ${t - p.arrive} ticks.`, 3)
      running = null
    } else if (algo === 'rr' && slice === 0) {
      queue.push(running)
      snap(`t=${t}: ${p.name}'s quantum expired with ${p.rem} tick${p.rem === 1 ? '' : 's'} left. PREEMPT it and requeue it at the BACK: everyone gets a turn soon, at the price of a context switch.`, 5)
      running = null
    } else {
      snap(`t=${t}: ${p.name} keeps the CPU, ${p.rem} tick${p.rem === 1 ? '' : 's'} of burst remaining${algo === 'rr' ? `, ${slice} of quantum left` : ''}.`, 3)
    }
  }

  const table = procs.map((p) => {
    const turn = p.finish - p.arrive
    return { name: p.name, colorVar: p.colorVar, arrive: p.arrive, burst: p.burst, finish: p.finish, turn, wait: turn - p.burst }
  })
  const avg = (k) => (table.reduce((s, r) => s + r[k], 0) / table.length).toFixed(2)
  const finals = {
    fcfs: `All done at t=${t}. Average wait ${avg('wait')}, average turnaround ${avg('turn')}. Simple and fair by arrival, but P3 waited 6 ticks for a 1-tick job stuck behind P1: the convoy effect. Rerun with SJF or RR to compare.`,
    sjf: `All done at t=${t}. Average wait ${avg('wait')}: provably the minimum among non-preemptive schedules. The catch: the OS must PREDICT burst lengths, and a steady stream of short jobs can starve a long one forever. Compare with FCFS and RR.`,
    rr: `All done at t=${t}. Average wait ${avg('wait')}, the worst of the three, plus extra context switches. But no job waited long for its FIRST tick: that responsiveness is why interactive systems slice time like this. Compare with FCFS and SJF.`,
  }
  snap(finals[algo], null, { table, avgWait: avg('wait'), avgTurn: avg('turn') })

  player.setFrames(frames)
}

watchEffect(() => buildFrames(mode.value))

const pseudocode = computed(() => (mode.value === 'fcfs' ? FCFS_PSEUDO : mode.value === 'sjf' ? SJF_PSEUDO : RR_PSEUDO))
const view = computed(() => player.frame.value || { t: 0, gantt: [], ready: [], running: null, table: null })

const legend = PROCS.map((p) => [`${p.name} (arrive ${p.arrive}, burst ${p.burst})`, p.colorVar])

const colorById = {}
PROCS.forEach((p) => { colorById[p.id] = `var(${p.colorVar})` })

const cellStyle = (g) => (g.id === null ? {} : {
  background: colorById[g.id],
  borderColor: colorById[g.id],
  color: 'var(--bg2)',
  fontWeight: 700,
})

const thStyle = { padding: '4px 12px', border: '1px solid var(--border)', color: 'var(--text-dim)', fontWeight: 600, textAlign: 'right' }
const tdStyle = { padding: '4px 12px', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'right' }
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="pseudocode" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': mode === 'fcfs' }" @click="mode = 'fcfs'">FCFS</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'sjf' }" @click="mode = 'sjf'">SJF (non-preemptive)</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'rr' }" @click="mode = 'rr'">Round Robin (q=2)</button>
      <span class="cell-idx" style="margin-left: auto">same 4 processes every run; only the policy changes</span>
    </template>

    <div style="display: flex; flex-direction: column; gap: 18px; align-items: flex-start; width: 100%">
      <div class="cells" style="flex-wrap: wrap">
        <div v-for="g in view.gantt" :key="g.t" class="cellcol">
          <div class="cell" :class="{ ghost: g.id === null }" :style="cellStyle(g)">{{ g.name }}</div>
          <span class="cell-idx">t={{ g.t }}</span>
        </div>
        <div v-if="!view.table && view.gantt.length < TOTAL_TICKS" class="cellcol">
          <div class="cell ghost">?</div>
          <span class="cell-idx">t={{ view.gantt.length }}</span>
        </div>
      </div>

      <div v-if="view.table" style="overflow-x: auto; max-width: 100%">
        <table style="border-collapse: collapse; font-family: var(--mono); font-size: 12px">
          <thead>
            <tr>
              <th :style="{ ...thStyle, textAlign: 'left' }">process</th>
              <th :style="thStyle">arrive</th>
              <th :style="thStyle">burst</th>
              <th :style="thStyle">finish</th>
              <th :style="thStyle">turnaround</th>
              <th :style="thStyle">waiting</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in view.table" :key="r.name">
              <td :style="{ ...tdStyle, textAlign: 'left', color: `var(${r.colorVar})`, fontWeight: 700 }">{{ r.name }}</td>
              <td :style="tdStyle">{{ r.arrive }}</td>
              <td :style="tdStyle">{{ r.burst }}</td>
              <td :style="tdStyle">{{ r.finish }}</td>
              <td :style="tdStyle">{{ r.turn }}</td>
              <td :style="tdStyle">{{ r.wait }}</td>
            </tr>
            <tr>
              <td :style="{ ...tdStyle, textAlign: 'left', color: 'var(--text-dim)' }">average</td>
              <td :style="tdStyle"></td>
              <td :style="tdStyle"></td>
              <td :style="tdStyle"></td>
              <td :style="{ ...tdStyle, fontWeight: 700 }">{{ view.avgTurn }}</td>
              <td :style="{ ...tdStyle, fontWeight: 700 }">{{ view.avgWait }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">CPU + ready queue (front → back)</div>
        <div class="state-body">
          <div v-if="view.running || view.ready.length" class="state-chips">
            <span v-if="view.running" class="chip active">CPU: {{ view.running.name }} ({{ view.running.rem }} left)</span>
            <span v-for="r in view.ready" :key="r.id" class="chip muted">{{ r.name }} ({{ r.rem }})</span>
          </div>
          <div v-else class="state-empty">nothing waiting</div>
        </div>
      </div>
      <div class="note">
        <strong>No free lunch.</strong> FCFS is fair and dead simple but suffers the convoy effect. SJF
        minimizes average waiting time but risks starving long jobs and needs burst-length predictions
        the OS does not really have. Round Robin trades raw throughput for responsiveness, which is what
        an interactive machine actually wants. Real OSes hedge with multilevel feedback queues: RR-style
        levels where CPU hogs sink to lower priority and interactive jobs float up.
      </div>
    </template>
  </VisualizerShell>
</template>
