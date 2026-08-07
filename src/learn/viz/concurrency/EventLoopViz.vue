<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const preset = ref('classic') // 'classic' | 'nested'
const player = usePlayer()

const CODE = {
  classic: [
    "console.log('start')",
    "setTimeout(() => console.log('timeout'), 0)",
    "Promise.resolve().then(() => console.log('promise'))",
    "console.log('end')",
  ],
  nested: [
    "console.log('A')",
    "setTimeout(() => console.log('B'), 0)",
    'Promise.resolve()',
    "  .then(() => { console.log('C')",
    "    setTimeout(() => console.log('D'), 0) })",
    "  .then(() => console.log('E'))",
    "console.log('F')",
  ],
}

function buildFrames() {
  const frames = []
  const s = { stack: [], micro: [], macro: [], output: [] }
  const f = (desc, line = null) =>
    frames.push({ desc, line, stack: [...s.stack], micro: [...s.micro], macro: [...s.macro], output: [...s.output] })

  const push = (name) => s.stack.push(name)
  const pop = () => s.stack.pop()

  if (preset.value === 'classic') {
    push('main()')
    f('The script starts running as one big task: main() is on the call stack. JavaScript will run it to completion before touching any queue.', 0)
    push("log('start')"); s.output.push('start')
    f("Line 1: console.log runs synchronously on the stack and prints 'start'.", 0)
    pop()
    push('setTimeout(...)')
    f('Line 2: setTimeout does NOT run your callback. It hands the timer to the browser (a Web API) and returns immediately.', 1)
    pop(); s.macro.push("() => log('timeout')")
    f('The 0ms timer fires straight away, so the browser drops the callback into the MACROTASK queue. It still cannot run: the stack is busy.', 1)
    push('.then(...)')
    f('Line 3: the promise is already resolved, so its .then callback is scheduled... but into the MICROTASK queue, a different, higher-priority queue.', 2)
    pop(); s.micro.push("() => log('promise')")
    f('Microtask queued. Two callbacks are now waiting in two different queues. The order they run in is the whole lesson here.', 2)
    push("log('end')"); s.output.push('end')
    f("Line 4: still synchronous code, so 'end' prints before either callback. Sync code always finishes first.", 3)
    pop(); pop()
    f('main() returns and the call stack is EMPTY. Only now does the event loop wake up. Rule: drain ALL microtasks before taking even one macrotask.', null)
    s.micro.shift(); push("log('promise')"); s.output.push('promise')
    f("The microtask runs first: 'promise' prints. This is why a resolved promise always beats setTimeout(0).", 2)
    pop()
    f('Microtask queue is empty. The event loop may now take ONE task from the macrotask queue.', null)
    s.macro.shift(); push("log('timeout')"); s.output.push('timeout')
    f("The timeout callback finally runs: 'timeout' prints last, even though its delay was 0ms. The 0 means 'at least 0ms AND after the stack clears AND after all microtasks'.", 1)
    pop()
    f('Done. Final order: start, end, promise, timeout. One thread, zero race conditions, but strict queue priority.', null)
  } else {
    push('main()')
    f('The nested preset: a then-chain that schedules MORE work while the queues are being drained. Watch which queue each new callback lands in.', 0)
    push("log('A')"); s.output.push('A')
    f("'A' prints synchronously.", 0)
    pop(); s.macro.push("() => log('B')")
    f('The first setTimeout queues callback B into the MACROTASK queue.', 1)
    s.micro.push('then#1')
    f('The resolved promise schedules its first .then (which logs C and sets a timer) into the MICROTASK queue. The second .then is NOT queued yet: it waits for the first to finish.', 3)
    push("log('F')"); s.output.push('F')
    f("'F' prints: sync code still outruns every queue.", 6)
    pop(); pop()
    f('Stack empty. Event loop: drain microtasks first. then#1 is up.', null)
    s.micro.shift(); push('then#1'); s.output.push('C')
    f("then#1 runs and logs 'C'...", 3)
    s.macro.push("() => log('D')")
    f('...and it calls setTimeout, so callback D joins the MACROTASK queue, BEHIND B. New macrotasks always go to the back of the line.', 4)
    pop(); s.micro.push('then#2')
    f('then#1 returned, so the promise chain resolves the next link: then#2 joins the MICROTASK queue. Microtasks scheduled during microtasks run in the SAME drain.', 5)
    s.micro.shift(); push('then#2'); s.output.push('E')
    f("then#2 runs and logs 'E'. The microtask queue is drained fully before any timer gets a turn, even though B was queued way back at line 2.", 5)
    pop()
    f('Microtasks done. NOW the event loop takes one macrotask: B, the oldest timer.', null)
    s.macro.shift(); push("log('B')"); s.output.push('B')
    f("'B' prints.", 1)
    pop(); s.macro.shift(); push("log('D')"); s.output.push('D')
    f("Next loop iteration, next macrotask: 'D' prints last. Final order: A, F, C, E, B, D.", 4)
    pop()
    f('The takeaway: promises can starve timers. An infinite microtask chain would freeze rendering forever, while timers merely wait their turn.', null)
  }
  player.setFrames(frames)
}

watchEffect(buildFrames)

const view = computed(() => player.frame.value || { stack: [], micro: [], macro: [], output: [] })

const legend = [
  ['on the call stack', '--viz-active'],
  ['microtask (promise)', '--viz-special'],
  ['macrotask (timer)', '--viz-compare'],
  ['logged', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="CODE[preset]" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': preset === 'classic' }" @click="preset = 'classic'">timeout vs promise</button>
      <button class="btn" :class="{ 'btn-primary': preset === 'nested' }" @click="preset = 'nested'">nested scheduling</button>
      <span class="cell-idx" style="margin-left: auto">guess the output order before pressing play</span>
    </template>

    <div style="display: flex; gap: 22px; justify-content: center; flex-wrap: wrap; align-items: flex-start">
      <!-- call stack -->
      <div style="display: flex; flex-direction: column; gap: 5px; min-width: 180px">
        <div class="cell-idx" style="text-align: left">call stack (top runs)</div>
        <div style="display: flex; flex-direction: column-reverse; gap: 5px; min-height: 150px; justify-content: flex-start">
          <div v-for="(fr, i) in view.stack" :key="i" class="cell" :class="i === view.stack.length - 1 ? 'active' : ''" style="min-width: 180px; height: 32px; font-size: var(--fs-3xs)">{{ fr }}</div>
          <div v-if="!view.stack.length" class="cell ghost" style="min-width: 180px; height: 32px">empty (loop can run)</div>
        </div>
      </div>

      <!-- microtask queue -->
      <div style="display: flex; flex-direction: column; gap: 5px; min-width: 170px">
        <div class="cell-idx" style="text-align: left">microtask queue ⚡</div>
        <div v-for="(m, i) in view.micro" :key="i" class="cell special" style="min-width: 170px; height: 32px; font-size: var(--fs-3xs)">{{ m }}</div>
        <div v-if="!view.micro.length" class="cell ghost" style="min-width: 170px; height: 32px">empty</div>
        <div class="cell-idx" style="text-align: left; opacity: 0.7">drained FULLY first</div>
      </div>

      <!-- macrotask queue -->
      <div style="display: flex; flex-direction: column; gap: 5px; min-width: 170px">
        <div class="cell-idx" style="text-align: left">macrotask queue ⏰</div>
        <div v-for="(m, i) in view.macro" :key="i" class="cell compare" style="min-width: 170px; height: 32px; font-size: var(--fs-3xs)">{{ m }}</div>
        <div v-if="!view.macro.length" class="cell ghost" style="min-width: 170px; height: 32px">empty</div>
        <div class="cell-idx" style="text-align: left; opacity: 0.7">one per loop turn</div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">console output</div>
        <div class="state-body" style="display: flex; flex-direction: column; gap: 3px; font-size: var(--fs-2xs)">
          <div v-for="(line, i) in view.output" :key="i" style="color: var(--viz-done)">
            <span style="color: var(--text-faint)">&gt;</span> {{ line }}
          </div>
          <div v-if="!view.output.length" class="state-empty">nothing logged yet</div>
        </div>
      </div>
      <div class="note">
        <strong>One thread, two queues.</strong> JavaScript never runs two things at once: the event
        loop just picks what runs next when the stack empties, and microtasks (promises, queueMicrotask,
        MutationObserver) always beat macrotasks (setTimeout, setInterval, I/O, clicks). async/await is
        pure sugar over promises, so everything after an await is a microtask too. And because
        microtasks drain fully, an endless promise chain starves rendering, while an endless setTimeout
        chain stays responsive.
      </div>
    </template>
  </VisualizerShell>
</template>
