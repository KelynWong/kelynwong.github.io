<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const mode = ref('acts') // 'acts' | 'coins'
const player = usePlayer()

const ACTS_PSEUDO = [
  'sort activities by FINISH time',
  'lastFinish = -∞',
  'for each activity (start, finish):',
  '  if start >= lastFinish:',
  '    pick it!',
  '    lastFinish = finish',
  '  else:',
  '    skip (overlaps a pick)',
]

const COINS_PSEUDO = [
  'coins = {4, 3, 1}, amount = 6',
  'while amount > 0:',
  '  take the LARGEST coin <= amount',
  '  amount -= coin',
  '// greedy: is that optimal here?',
]

const RAW_ACTS = [
  { name: 'standup', s: 0, e: 2 },
  { name: 'review', s: 1, e: 4 },
  { name: 'gym', s: 3, e: 5 },
  { name: 'lunch', s: 4, e: 6 },
  { name: 'deploy', s: 5, e: 8 },
  { name: '1:1 call', s: 6, e: 9 },
  { name: 'demo', s: 8, e: 10 },
  { name: 'retro', s: 9, e: 12 },
]

function buildActFrames() {
  const frames = []
  const f = (desc, line, acts, lastFinish = null) =>
    frames.push({ kind: 'acts', acts: acts.map((a) => ({ ...a })), lastFinish, desc, line })

  let acts = RAW_ACTS.map((a) => ({ ...a, cls: '' }))
  f(`Goal: attend as MANY non-overlapping activities as possible. ${acts.length} candidates, all overlapping somewhere. Which do we grab first?`, 0, acts)
  acts = [...acts].sort((x, y) => x.e - y.e)
  f(`Greedy insight: sort by FINISH time. The activity that frees you up earliest leaves the most room for everything after, which is the locally optimal choice worth being greedy about. (Sorting by start or by duration can be proven worse.)`, 0, acts)
  let lastFinish = -Infinity
  let picked = 0
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i]
    acts[i] = { ...a, cls: 'compare' }
    f(`Consider "${a.name}" (${a.s}–${a.e}): does it start after our last pick ends${lastFinish === -Infinity ? '' : ` (${lastFinish})`}?`, 3, acts, lastFinish === -Infinity ? null : lastFinish)
    if (a.s >= lastFinish) {
      acts[i] = { ...a, cls: 'done' }
      lastFinish = a.e
      picked++
      f(`Yes: pick "${a.name}". Commit and never look back: lastFinish = ${a.e}.`, 5, acts, lastFinish)
    } else {
      acts[i] = { ...a, cls: 'faded' }
      f(`No. "${a.name}" starts at ${a.s} < ${lastFinish}; it overlaps a committed pick. Skip forever.`, 7, acts, lastFinish)
    }
  }
  f(`Done: ${picked} activities in one O(N log N) pass, no backtracking, and for THIS problem the greedy choice is provably optimal.`, 4, acts, lastFinish)
  player.setFrames(frames)
}

function buildCoinFrames() {
  const frames = []
  const f = (desc, line, picked, remaining, extra = {}) =>
    frames.push({ kind: 'coins', picked: [...picked], remaining, desc, line, ...extra })

  const coins = [4, 3, 1]
  let remaining = 6
  const picked = []
  f(`Make 6 with coins {1, 3, 4}, using as FEW coins as possible. Greedy instinct: always grab the biggest coin that fits.`, 0, picked, remaining)
  while (remaining > 0) {
    const c = coins.find((x) => x <= remaining)
    picked.push(c)
    f(`Largest coin ≤ ${remaining} is ${c}. Take it, no second thoughts.`, 2, picked, remaining)
    remaining -= c
    f(`amount = ${remaining}.`, 3, picked, remaining)
  }
  f(`Greedy result: ${picked.join(' + ')} = 6 using ${picked.length} coins. Looks reasonable…`, 4, picked, remaining)
  f(`…but 3 + 3 = 6 uses only 2 coins. Greedy committed to the 4 and could never un-choose it. For coin systems like this one, you need Dynamic Programming, which considers all options. (US coins {25,10,5,1} happen to be greedy-safe.)`, 4, picked, remaining, { optimal: [3, 3] })
  player.setFrames(frames)
}

watchEffect(() => {
  if (mode.value === 'acts') buildActFrames()
  else buildCoinFrames()
})

const pseudocode = computed(() => (mode.value === 'acts' ? ACTS_PSEUDO : COINS_PSEUDO))
const view = computed(() => player.frame.value || { kind: 'acts', acts: [] })

const HOUR = 46
const clsColor = { done: 'var(--viz-done)', compare: 'var(--viz-compare)' }

const legend = computed(() =>
  mode.value === 'acts'
    ? [['considering', '--viz-compare'], ['picked', '--viz-done']]
    : [['greedy picks', '--viz-compare'], ['optimal answer', '--viz-done']]
)
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="pseudocode" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': mode === 'acts' }" @click="mode = 'acts'">activity selection (greedy wins)</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'coins' }" @click="mode = 'coins'">coin change (greedy fails)</button>
    </template>

    <!-- activity timeline -->
    <svg v-if="view.kind === 'acts'" class="viz-svg" :viewBox="`0 0 ${12 * HOUR + 90} ${view.acts.length * 34 + 50}`">
      <g v-for="h in 13" :key="h">
        <line :x1="70 + (h - 1) * HOUR" y1="14" :x2="70 + (h - 1) * HOUR" :y2="view.acts.length * 34 + 26" stroke="var(--border)" stroke-width="1" />
        <text :x="70 + (h - 1) * HOUR" :y="view.acts.length * 34 + 42" text-anchor="middle" fill="var(--text-faint)" font-size="10">{{ h - 1 }}:00</text>
      </g>
      <line
        v-if="view.lastFinish !== null && view.lastFinish !== undefined"
        :x1="70 + view.lastFinish * HOUR" y1="8" :x2="70 + view.lastFinish * HOUR" :y2="view.acts.length * 34 + 26"
        stroke="var(--viz-active)" stroke-width="2" stroke-dasharray="5 4"
      />
      <g v-for="(a, i) in view.acts" :key="a.name" :opacity="a.cls === 'faded' ? 0.28 : 1">
        <rect
          :x="70 + a.s * HOUR" :y="20 + i * 34" :width="(a.e - a.s) * HOUR" height="24" rx="4"
          fill="var(--bg3)"
          :stroke="clsColor[a.cls] || 'var(--border2)'" stroke-width="1.6"
        />
        <text :x="70 + a.s * HOUR + 8" :y="20 + i * 34 + 16" :fill="clsColor[a.cls] || 'var(--text-dim)'" font-size="11">{{ a.name }} ({{ a.s }}–{{ a.e }})</text>
      </g>
    </svg>

    <!-- coin demo -->
    <div v-else style="display: flex; flex-direction: column; align-items: center; gap: 20px">
      <div style="display: flex; align-items: center; gap: 12px">
        <span class="cell-idx">greedy:</span>
        <div class="cells">
          <div v-for="(c, i) in view.picked" :key="i" class="cell compare" style="border-radius: 50%; min-width: 48px; height: 48px">{{ c }}</div>
          <div v-if="!view.picked.length" class="cell ghost" style="border-radius: 50%; min-width: 48px; height: 48px">?</div>
        </div>
        <span class="chip" :class="{ active: view.remaining > 0 }">remaining: {{ view.remaining }}</span>
      </div>
      <div v-if="view.optimal" style="display: flex; align-items: center; gap: 12px">
        <span class="cell-idx">optimal:</span>
        <div class="cells">
          <div v-for="(c, i) in view.optimal" :key="i" class="cell done" style="border-radius: 50%; min-width: 48px; height: 48px">{{ c }}</div>
        </div>
        <span class="chip done">2 coins beats {{ view.picked.length }}</span>
      </div>
    </div>

    <template #state>
      <div class="note">
        <strong>Greedy = commit locally, never backtrack.</strong> It's fast and simple (when it works).
        It works when the problem has the <em>greedy-choice property</em>: a locally best pick is always
        part of some globally best solution (provable for activity selection, Dijkstra, Huffman coding,
        MSTs). The coin demo shows the failure mode: an early "obviously good" choice locks you out of
        the true optimum. When choices interact like that → Dynamic Programming.
      </div>
    </template>
  </VisualizerShell>
</template>
