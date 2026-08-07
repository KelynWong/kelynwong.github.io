<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { parseNums, randArray } from '../utils.js'

const arrayIn = ref('2, 7, 11, 15, 19, 23, 30, 41')
const targetIn = ref(34)

const player = usePlayer()

const PSEUDO = [
  'l = 0, r = n - 1',
  'while l < r:',
  '  sum = a[l] + a[r]',
  '  if sum == target: return (l, r)',
  '  if sum < target:',
  '    l += 1     // need a bigger sum',
  '  else:',
  '    r -= 1     // need a smaller sum',
  'return no pair',
]

function buildFrames(a, target) {
  const frames = []
  const f = (desc, line, l, r, marks = {}, extra = {}) => {
    const faded = {}
    for (let i = 0; i < a.length; i++) if (i < l || i > r) faded[i] = true
    frames.push({ a: [...a], l, r, marks, faded, desc, line, ...extra })
  }
  let l = 0, r = a.length - 1
  f(`Find two numbers summing to ${target}. Brute force would try all ${(a.length * (a.length - 1)) / 2} pairs, but the array is sorted, so we can be smarter.`, 0, l, r)
  let checks = 0
  while (l < r) {
    const sum = a[l] + a[r]
    checks++
    f(`a[${l}] + a[${r}] = ${a[l]} + ${a[r]} = ${sum}.`, 2, l, r, { [l]: 'active', [r]: 'compare' }, { sum })
    if (sum === target) {
      f(`${a[l]} + ${a[r]} = ${target}: pair found in ${checks} checks instead of up to ${(a.length * (a.length - 1)) / 2}. O(N).`, 3, l, r, { [l]: 'done', [r]: 'done' }, { sum })
      player.setFrames(frames)
      return
    }
    if (sum < target) {
      f(`${sum} < ${target}: the sum is too small. a[${l}]=${a[l]} paired with the *largest* available number still fell short, so a[${l}] can't be in any answer. Move l right.`, 5, l + 1, r, {}, { sum })
      l++
    } else {
      f(`${sum} > ${target}: too big. a[${r}]=${a[r]} paired with the *smallest* available number still overshot, which means a[${r}] is out. Move r left.`, 7, l, r - 1, {}, { sum })
      r--
    }
  }
  f(`Pointers met: no pair sums to ${target}. Each element was ruled out with a proof, in one pass.`, 8, l, r)
  player.setFrames(frames)
}

watchEffect(() => {
  const a = parseNums(arrayIn.value, { fallback: [2, 7, 11, 15] }).sort((x, y) => x - y)
  buildFrames(a, Math.floor(targetIn.value))
})

function randomize() {
  const a = [...new Set(randArray(9, 1, 50))].sort((x, y) => x - y)
  arrayIn.value = a.join(', ')
  const i = Math.floor(Math.random() * a.length)
  let j = Math.floor(Math.random() * a.length)
  if (i === j) j = (j + 1) % a.length
  targetIn.value = a[i] + a[j]
}

const view = computed(() => player.frame.value || { a: [], marks: {}, faded: {} })

const legend = [
  ['left pointer', '--viz-active'],
  ['right pointer', '--viz-compare'],
  ['answer pair', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>sorted array</label>
      <input class="input" style="flex: 1; min-width: 180px" v-model="arrayIn" />
      <label>target</label>
      <input class="input" style="width: 64px" type="number" v-model.number="targetIn" />
      <button class="btn" @click="randomize">randomize</button>
    </template>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px">
      <div class="cells">
        <div v-for="(v, i) in view.a" :key="i" class="cellcol">
          <div class="cell" :class="[view.marks[i], { faded: view.faded[i] }]">{{ v }}</div>
          <div class="cell-idx">[{{ i }}]</div>
          <div class="cell-ptr" :class="{ lo: view.l === i, hi: view.r === i }">
            {{ view.l === i && view.r === i ? 'l=r' : view.l === i ? 'l →' : view.r === i ? '← r' : '' }}
          </div>
        </div>
      </div>
      <div v-if="view.sum !== undefined" class="chip" :class="view.sum === Math.floor(targetIn) ? 'done' : 'active'" style="font-size: var(--fs-2xs); padding: 6px 14px">
        sum = {{ view.sum }} · target = {{ Math.floor(targetIn) }}
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>Why it's safe to move a pointer:</strong> each move is a tiny proof. Sorted order means
        "too small with the biggest partner" rules an element out forever. N elements, each ruled out
        once → O(N). The same converging-pointer idea powers container-with-most-water, 3-sum,
        palindrome checks and array de-duplication.
      </div>
    </template>
  </VisualizerShell>
</template>
