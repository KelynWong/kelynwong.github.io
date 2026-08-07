<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { parseNums, randArray } from '../utils.js'

const arrayIn = ref('4, 2, 9, 7, 5, 3, 8, 6, 1')
const kIn = ref(3)

const player = usePlayer()

const PSEUDO = [
  'sum = a[0] + ... + a[k-1]   // first window',
  'best = sum',
  'for r = k to n - 1:',
  '  sum += a[r]        // element enters',
  '  sum -= a[r - k]    // element leaves',
  '  best = max(best, sum)',
  'return best',
]

function buildFrames(a, k) {
  const frames = []
  const f = (desc, line, wl, wr, marks = {}, extra = {}) =>
    frames.push({ a: [...a], wl, wr, marks, desc, line, ...extra })

  if (k > a.length) k = a.length
  let sum = 0
  for (let i = 0; i < k; i++) sum += a[i]
  let best = sum, bestL = 0
  f(`Goal: max sum of any window of ${k} consecutive elements. Naive way: recompute each of the ${a.length - k + 1} windows from scratch, which is O(N·k). Instead, we'll slide.`, 0, 0, k - 1, {}, { sum, best })
  f(`First window [0..${k - 1}] sums to ${sum}. That's the only full addition we'll ever do.`, 1, 0, k - 1, {}, { sum, best })
  for (let r = k; r < a.length; r++) {
    const enter = a[r], leave = a[r - k]
    f(`Slide right: ${enter} enters the window…`, 3, r - k + 1, r, { [r]: 'active' }, { sum, best, bestL })
    sum += enter - leave
    f(`…and ${leave} leaves. New sum = old − ${leave} + ${enter} = ${sum}. Two operations, not ${k}.`, 4, r - k + 1, r, { [r - k]: 'compare' }, { sum, best, bestL })
    if (sum > best) {
      best = sum
      bestL = r - k + 1
      f(`${sum} beats the previous best, so record window [${bestL}..${r}].`, 5, r - k + 1, r, {}, { sum, best, bestL, isBest: true })
    } else {
      f(`best stays ${best}.`, 5, r - k + 1, r, {}, { sum, best, bestL })
    }
  }
  const marks = {}
  for (let i = bestL; i < bestL + k; i++) marks[i] = 'done'
  f(`Done: the best window is [${bestL}..${bestL + k - 1}] with sum ${best}. Total work: one pass, O(N).`, 6, bestL, bestL + k - 1, marks, { sum, best, bestL })
  player.setFrames(frames)
}

watchEffect(() => {
  const a = parseNums(arrayIn.value, { fallback: [4, 2, 9, 7] })
  const k = Math.max(1, Math.min(Math.floor(kIn.value) || 1, a.length))
  buildFrames(a, k)
})

function randomize() {
  arrayIn.value = randArray(9, 1, 9).join(', ')
  kIn.value = 3
}

const view = computed(() => player.frame.value || { a: [], marks: {} })

const legend = [
  ['entering', '--viz-active'],
  ['leaving', '--viz-compare'],
  ['best window', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>array</label>
      <input class="input" style="flex: 1; min-width: 170px" v-model="arrayIn" />
      <label>k</label>
      <input class="input" style="width: 52px" type="number" min="1" v-model.number="kIn" />
      <button class="btn" @click="randomize">randomize</button>
    </template>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
      <div class="cells" style="position: relative; padding-top: 12px">
        <div v-for="(v, i) in view.a" :key="i" class="cellcol">
          <div
            class="cell"
            :class="view.marks[i]"
            :style="i >= view.wl && i <= view.wr && !view.marks[i] ? 'border-color: var(--viz-active); box-shadow: 0 -3px 0 -1px var(--viz-active) inset' : ''"
          >{{ v }}</div>
          <div class="cell-idx">[{{ i }}]</div>
          <div class="cell-ptr lo">{{ i === view.wl ? '⌊win' : i === view.wr ? 'win⌋' : '' }}</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px">
        <span class="chip active">window sum = {{ view.sum }}</span>
        <span class="chip" :class="{ done: view.isBest }">best = {{ view.best }}</span>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>The trick:</strong> consecutive windows overlap in all but two elements, so recomputing
        the whole window wastes work. Keep a running aggregate; add what enters, subtract what leaves.
        The same pattern (with a hash set instead of a sum) solves "longest substring without repeating
        characters" and most other subarray/substring problems.
      </div>
    </template>
  </VisualizerShell>
</template>
