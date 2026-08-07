<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const mode = ref('lucky') // 'lucky' | 'race' | 'mutex'
const player = usePlayer()

const PSEUDO = [
  '// counter += 1 is NOT one step.',
  '// the CPU actually runs three:',
  'LOAD  r, counter   // copy shared value into a register',
  'ADD   r, 1         // bump the PRIVATE copy',
  'STORE counter, r   // write the copy back',
  '// 2 threads x 2 increments each: expect +4',
]

const LINE = { LOAD: 2, ADD: 3, STORE: 4 }

function programFor(m) {
  const inc = ['LOAD r, counter', 'ADD r, 1', 'STORE counter, r']
  if (m === 'mutex') return ['acquire(m)', ...inc, 'release(m)', 'acquire(m)', ...inc, 'release(m)']
  return [...inc, ...inc]
}

function buildFrames(m) {
  const frames = []
  const prog = programFor(m)
  const st = {
    counter: 0,
    r: { A: null, B: null },
    pc: { A: 0, B: 0 },
    blocked: { A: false, B: false },
  }
  let lock = null
  const other = (t) => (t === 'A' ? 'B' : 'A')
  const clsFor = (t) => (t === 'A' ? 'active' : 'compare')

  const push = (desc, line = null, actor = null, idx = -1) => {
    const list = (t) =>
      prog.map((text, i) => {
        let cls = ''
        if (actor === t && idx === i) cls = clsFor(t)
        else if (st.blocked[t] && st.pc[t] === i) cls = 'special'
        else if (i < st.pc[t]) cls = 'done'
        return { text, cls }
      })
    frames.push({
      desc,
      line,
      mode: m,
      a: list('A'),
      b: list('B'),
      counter: st.counter,
      rA: st.r.A,
      rB: st.r.B,
      lock,
      memCls: actor !== null && idx >= 0 && prog[idx].startsWith('STORE') ? clsFor(actor) : '',
    })
  }

  // Execute the next instruction of thread t and emit one frame.
  const exec = (t, override = null) => {
    const i = st.pc[t]
    const op = prog[i]
    let desc = ''
    let line = null

    if (op.startsWith('acquire')) {
      if (lock === null) {
        lock = t
        st.blocked[t] = false
        st.pc[t] = i + 1
        desc = `Thread ${t}: acquire(m) succeeds, the mutex was free. ${t} now owns the only ticket into the critical section.`
        push(override || desc, line, t, i)
      } else {
        st.blocked[t] = true
        desc = `Thread ${t} calls acquire(m), but ${lock} holds the mutex. ${t} BLOCKS right here: it cannot even LOAD until the lock is released. Waiting is the price of correctness.`
        push(override || desc)
      }
      return
    }
    if (op.startsWith('release')) {
      lock = null
      st.pc[t] = i + 1
      desc = `Thread ${t}: release(m). The critical section is over and the mutex is free; any thread blocked on it can now win it.`
      push(override || desc, line, t, i)
      return
    }
    if (op.startsWith('LOAD')) {
      st.r[t] = st.counter
      st.pc[t] = i + 1
      line = LINE.LOAD
      desc = `Thread ${t}: LOAD copies counter (${st.counter}) into its private register r${t}. From this moment ${t} works on a snapshot; it will not notice anything written afterwards.`
    } else if (op.startsWith('ADD')) {
      st.r[t] = st.r[t] + 1
      st.pc[t] = i + 1
      line = LINE.ADD
      desc = `Thread ${t}: ADD bumps the private copy, r${t} = ${st.r[t]}. The shared counter still reads ${st.counter}; thread ${other(t)} can see none of this yet.`
    } else {
      st.counter = st.r[t]
      st.pc[t] = i + 1
      line = LINE.STORE
      desc = `Thread ${t}: STORE publishes r${t} = ${st.r[t]}. The shared counter is now ${st.counter}.`
    }
    push(override || desc, line, t, i)
  }

  if (m === 'lucky') {
    push('Two threads must each run counter += 1 twice. In this LUCKY schedule the OS happens to run thread A to completion before thread B ever starts. Note: nothing enforces this ordering.', 0)
    for (let k = 0; k < 6; k++) exec('A')
    push('Thread A finished: counter = 2, exactly its two increments. Only now does the scheduler switch to thread B, which will read the fresh value.', null)
    for (let k = 0; k < 6; k++) exec('B')
    push('Final counter = 4. Expected 4, got 4: correct. But we got the right answer by scheduling luck, not by design. The SAME code under a different interleaving gives a different result, as the race mode shows.', 5)
  } else if (m === 'race') {
    push('Same code, unlucky schedule. The OS may pause a thread between ANY two instructions. Watch what happens when both threads LOAD before either one STOREs.', 0)
    exec('A')
    exec('B', 'Thread B: LOAD also reads counter = 0, the SAME value A is still holding in rA. This is the doomed step: two increments will now be computed from one snapshot, so one of them is already lost, no matter what happens next.')
    exec('A')
    exec('B')
    exec('A')
    exec('B', 'Thread B: STORE writes rB = 1 on top of the 1 that A just stored. A\'s increment is silently erased: a LOST UPDATE. Two increments ran, the counter moved by one.')
    exec('A')
    exec('A')
    exec('B', 'Thread B: LOAD reads counter = 1, but A has already computed rA = 2 and simply not published it yet. Same doomed pattern: B is again working from a value that is about to go stale.')
    exec('A')
    exec('B')
    exec('B', 'Thread B: STORE writes 2 over the 2 that A stored a moment ago. Another update vanishes without any error being raised.')
    push('Final counter = 2, expected 4. Half the increments were lost and the program never crashed or warned: it just computed the wrong answer. That is a race condition: correctness depends on a thread schedule you do not control.', 5)
  } else {
    push('Same code, but every LOAD-ADD-STORE is wrapped in acquire(m) ... release(m). The mutex makes the three steps effectively atomic: only one thread at a time may be between acquire and release.', 0)
    exec('A')
    exec('B')
    exec('A')
    exec('A')
    exec('A', 'Thread A: STORE publishes counter = 1. B is still blocked, so no stale read could sneak in between A\'s LOAD and this STORE.')
    exec('A')
    exec('B', 'Thread B wakes and wins the mutex. Crucially it has not LOADed anything yet, so it will now read the FRESH value 1, not a stale snapshot. That is exactly what the lock bought us.')
    exec('A', 'Roles flip: thread A wants its second increment, but B now holds the mutex, so A blocks. Blocking works both ways; fairness comes from the lock, not the scheduler.')
    exec('B')
    exec('B')
    exec('B')
    exec('B')
    exec('A')
    exec('A')
    exec('A')
    exec('A')
    exec('A')
    exec('B')
    exec('B')
    exec('B')
    exec('B')
    exec('B')
    push('Final counter = 4. Expected 4, got 4, and this time it is guaranteed for EVERY possible schedule: mutual exclusion turned three fragile steps into one atomic one. The costs: time spent blocked, and a brand-new failure mode called deadlock (see the next visualizer).', 5)
  }

  player.setFrames(frames)
}

watchEffect(() => buildFrames(mode.value))

const view = computed(
  () =>
    player.frame.value || {
      mode: mode.value,
      a: [],
      b: [],
      counter: 0,
      rA: null,
      rB: null,
      lock: null,
      memCls: '',
    }
)

const legend = [
  ['thread A executing', '--viz-active'],
  ['thread B executing', '--viz-compare'],
  ['instruction retired', '--viz-done'],
  ['blocked on mutex', '--viz-special'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': mode === 'lucky' }" @click="mode = 'lucky'">lucky interleaving</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'race' }" @click="mode = 'race'">race (lost update)</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'mutex' }" @click="mode = 'mutex'">with mutex</button>
    </template>

    <div style="display: flex; gap: 28px; justify-content: center; align-items: flex-start; flex-wrap: wrap">
      <!-- thread A -->
      <div style="display: flex; flex-direction: column; gap: 6px; align-items: stretch">
        <div class="cell-idx" style="text-align: center; color: var(--viz-active); font-weight: 600">Thread A</div>
        <span class="chip" style="align-self: center" :class="{ active: view.rA !== null }">rA = {{ view.rA === null ? '?' : view.rA }}</span>
        <div
          v-for="(ins, i) in view.a"
          :key="'a' + i"
          class="cell"
          :class="ins.cls"
          style="min-width: 185px; justify-content: flex-start; font-family: var(--mono); font-size: 12px; padding: 6px 10px"
        >
          {{ ins.text }}
        </div>
      </div>

      <!-- shared memory -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 34px">
        <div class="cell-idx">shared memory</div>
        <div class="cell" :class="view.memCls" style="min-width: 140px; font-family: var(--mono)">counter = {{ view.counter }}</div>
        <template v-if="view.mode === 'mutex'">
          <div class="cell-idx" style="margin-top: 10px">mutex m</div>
          <div class="cell" :class="view.lock ? 'special' : ''" style="min-width: 140px; font-family: var(--mono)">
            {{ view.lock ? 'held by ' + view.lock : 'free' }}
          </div>
        </template>
        <div class="cell-idx" style="margin-top: 10px; max-width: 150px; text-align: center">
          registers are private; only STOREs are visible here
        </div>
      </div>

      <!-- thread B -->
      <div style="display: flex; flex-direction: column; gap: 6px; align-items: stretch">
        <div class="cell-idx" style="text-align: center; color: var(--viz-compare); font-weight: 600">Thread B</div>
        <span class="chip" style="align-self: center" :class="{ active: view.rB !== null }">rB = {{ view.rB === null ? '?' : view.rB }}</span>
        <div
          v-for="(ins, i) in view.b"
          :key="'b' + i"
          class="cell"
          :class="ins.cls"
          style="min-width: 185px; justify-content: flex-start; font-family: var(--mono); font-size: 12px; padding: 6px 10px"
        >
          {{ ins.text }}
        </div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">machine state</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip active">counter = {{ view.counter }}</span>
            <span class="chip" :class="{ muted: view.rA === null }">rA = {{ view.rA === null ? '?' : view.rA }}</span>
            <span class="chip" :class="{ muted: view.rB === null }">rB = {{ view.rB === null ? '?' : view.rB }}</span>
            <span v-if="view.mode === 'mutex'" class="chip" :class="{ done: !view.lock }">lock: {{ view.lock || 'free' }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Why counter += 1 races:</strong> it is a read-modify-write, three machine instructions
        with a gap between them, and the scheduler can interleave another thread into any gap. Bugs like
        this are heisenbugs: rare, timing dependent, and prone to vanishing under a debugger. Fixes:
        a mutex around the whole read-modify-write, hardware atomics (fetch-and-add, compare-and-swap),
        or designing so threads do not share mutable state at all.
      </div>
    </template>
  </VisualizerShell>
</template>
