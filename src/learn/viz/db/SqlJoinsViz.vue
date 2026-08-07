<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

// Two tiny fixed tables. Carol (id 3) has no orders; order 104 points at
// user_id 7, which matches no user. Those two rows are where the four
// join types disagree.
const USERS = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'Dan' },
]
const ORDERS = [
  { id: 101, user_id: 1, item: 'keyboard' },
  { id: 102, user_id: 2, item: 'mouse' },
  { id: 103, user_id: 4, item: 'monitor' },
  { id: 104, user_id: 7, item: 'webcam' },
]

const mode = ref('INNER')
const player = usePlayer()

const SQL = {
  INNER: ['SELECT u.name, o.item', 'FROM users u', 'INNER JOIN orders o', '  ON u.id = o.user_id'],
  LEFT: ['SELECT u.name, o.item', 'FROM users u', 'LEFT JOIN orders o', '  ON u.id = o.user_id'],
  RIGHT: ['SELECT u.name, o.item', 'FROM users u', 'RIGHT JOIN orders o', '  ON u.id = o.user_id'],
  FULL: ['SELECT u.name, o.item', 'FROM users u', 'FULL OUTER JOIN orders o', '  ON u.id = o.user_id'],
}
const pseudocode = computed(() => SQL[mode.value])

const INTRO = {
  INNER: 'INNER JOIN: keep only pairs where the ON condition matches. Rows with no partner on the other side simply vanish.',
  LEFT: 'LEFT JOIN: every users row survives no matter what. If a user has no matching order, the order columns are padded with NULLs.',
  RIGHT: 'RIGHT JOIN: every orders row survives no matter what. If an order has no matching user, the user columns are padded with NULLs.',
  FULL: 'FULL OUTER JOIN: nothing is dropped from either side. Unmatched rows from both tables get NULL-padded into the result.',
}

function buildFrames(m) {
  const frames = []
  const result = []
  let emitted = 0
  let dropped = 0
  const f = (desc, line, uMarks = {}, oMarks = {}) =>
    frames.push({ desc, line, uMarks, oMarks, result: result.map((r) => ({ ...r })), emitted, dropped })

  f(INTRO[m], 2)

  if (m !== 'RIGHT') {
    // Nested loop driven from the left (users) side.
    for (let ui = 0; ui < USERS.length; ui++) {
      const u = USERS[ui]
      f(`Take users row (${u.id}, ${u.name}) and scan every orders row looking for user_id = ${u.id}.`, 1, { [ui]: 'active' })
      let matched = false
      for (let oi = 0; oi < ORDERS.length; oi++) {
        const o = ORDERS[oi]
        if (o.user_id === u.id) {
          matched = true
          result.push({ key: `u${u.id}-o${o.id}`, name: u.name, item: o.item, cls: 'done' })
          emitted++
          f(`orders ${o.id}: user_id ${o.user_id} = ${u.id}? Yes! Emit the pair (${u.name}, ${o.item}) into the result.`, 0, { [ui]: 'active' }, { [oi]: 'done' })
        } else {
          f(`orders ${o.id}: user_id ${o.user_id} = ${u.id}? No, skip it.`, 3, { [ui]: 'active' }, { [oi]: 'compare' })
        }
      }
      if (!matched) {
        if (m === 'INNER') {
          dropped++
          f(`User ${u.id} ${u.name} has no orders, so INNER drops her entirely. If your report suddenly loses customers, this is usually why.`, 2, { [ui]: 'compare' })
        } else {
          result.push({ key: `u${u.id}-null`, name: u.name, item: null, cls: 'special' })
          emitted++
          f(`User ${u.id} ${u.name} has no orders, but ${m === 'FULL' ? 'FULL OUTER' : 'LEFT'} JOIN keeps her anyway: emit (${u.name}, NULL).`, 2, { [ui]: 'special' })
        }
      }
    }
  }

  if (m === 'RIGHT') {
    // Drive from the right (orders) side instead.
    for (let oi = 0; oi < ORDERS.length; oi++) {
      const o = ORDERS[oi]
      f(`Take orders row (${o.id}, ${o.item}) and scan users looking for id = ${o.user_id}.`, 1, {}, { [oi]: 'active' })
      let matched = false
      for (let ui = 0; ui < USERS.length; ui++) {
        const u = USERS[ui]
        if (u.id === o.user_id) {
          matched = true
          result.push({ key: `o${o.id}-u${u.id}`, name: u.name, item: o.item, cls: 'done' })
          emitted++
          f(`users ${u.id}: id ${u.id} = ${o.user_id}? Yes! Emit (${u.name}, ${o.item}).`, 0, { [ui]: 'done' }, { [oi]: 'active' })
        } else {
          f(`users ${u.id}: id ${u.id} = ${o.user_id}? No, skip.`, 3, { [ui]: 'compare' }, { [oi]: 'active' })
        }
      }
      if (!matched) {
        result.push({ key: `o${o.id}-null`, name: null, item: o.item, cls: 'special' })
        emitted++
        f(`Order ${o.id} (${o.item}) points at user_id ${o.user_id}, which does not exist (an orphaned row!). RIGHT JOIN keeps it: emit (NULL, ${o.item}).`, 2, {}, { [oi]: 'special' })
      }
    }
    for (let ui = 0; ui < USERS.length; ui++) {
      const u = USERS[ui]
      if (!ORDERS.some((o) => o.user_id === u.id)) {
        dropped++
        f(`Note the casualty: user ${u.id} ${u.name} has no orders, and RIGHT JOIN only protects the right table, so ${u.name} is dropped.`, 2, { [ui]: 'compare' })
      }
    }
  } else if (m === 'FULL') {
    f('Every users row is handled. FULL OUTER now sweeps the orders side for rows no user ever matched.', 2)
    for (let oi = 0; oi < ORDERS.length; oi++) {
      const o = ORDERS[oi]
      const matched = USERS.some((u) => u.id === o.user_id)
      if (!matched) {
        result.push({ key: `o${o.id}-null`, name: null, item: o.item, cls: 'special' })
        emitted++
        f(`Order ${o.id} (${o.item}) has user_id ${o.user_id}, matching no user. FULL OUTER keeps it too: emit (NULL, ${o.item}).`, 2, {}, { [oi]: 'special' })
      }
    }
  } else {
    // INNER and LEFT never revisit the right side, so orphaned orders
    // silently fall out. Make that loss visible.
    for (let oi = 0; oi < ORDERS.length; oi++) {
      const o = ORDERS[oi]
      if (!USERS.some((u) => u.id === o.user_id)) {
        dropped++
        f(`One more casualty: order ${o.id} (${o.item}) points at user_id ${o.user_id}, which matches no user. ${m} JOIN never revisits the right side, so this orphaned row is dropped without a trace.`, 2, {}, { [oi]: 'compare' })
      }
    }
  }

  const tail = {
    INNER: `INNER done: ${emitted} rows. Carol (no orders) and order 104 (no user) were both silently dropped, which is exactly what you want for "users AND their orders", and exactly wrong for "ALL users".`,
    LEFT: `LEFT done: ${emitted} rows. Carol survives with NULLs, but the orphaned order 104 is still dropped, since LEFT only protects the left table.`,
    RIGHT: `RIGHT done: ${emitted} rows. The orphaned webcam order survives with a NULL name, but Carol is gone, since RIGHT only protects the right table.`,
    FULL: `FULL OUTER done: ${emitted} rows. Nothing was lost from either side: Carol AND the orphaned order both appear, each padded with NULLs.`,
  }
  f(tail[m], 0)
  return frames
}

watchEffect(() => {
  player.setFrames(buildFrames(mode.value))
})

const view = computed(() => player.frame.value || { uMarks: {}, oMarks: {}, result: [], emitted: 0, dropped: 0 })

// ---- inline row styling (three small tables built from divs) ----
const markColor = {
  active: 'var(--viz-active)',
  compare: 'var(--viz-compare)',
  done: 'var(--viz-done)',
  special: 'var(--viz-special)',
}
const rowBase = {
  display: 'flex',
  gap: '2px',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1.5px solid var(--border2)',
  background: 'var(--bg3)',
  fontFamily: 'var(--mono)',
  fontSize: 'var(--fs-3xs)',
  transition: 'border-color 0.25s ease, color 0.25s ease',
}
function rowStyle(cls) {
  const c = markColor[cls]
  return c ? { ...rowBase, borderColor: c, color: c } : { ...rowBase, color: 'var(--text-dim)' }
}
const headStyle = {
  display: 'flex',
  gap: '2px',
  padding: '2px 8px',
  fontFamily: 'var(--mono)',
  fontSize: 'var(--fs-4xs)',
  color: 'var(--text-faint)',
}
const colStyle = { width: '64px', flexShrink: 0 }
const colWide = { width: '84px', flexShrink: 0 }

const legend = [
  ['driving row', '--viz-active'],
  ['probing / dropped', '--viz-compare'],
  ['matched pair', '--viz-done'],
  ['kept with NULLs', '--viz-special'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="pseudocode" :legend="legend">
    <template #inputs>
      <button v-for="m in ['INNER', 'LEFT', 'RIGHT', 'FULL']" :key="m" class="btn" :class="{ 'btn-primary': mode === m }" @click="mode = m">
        {{ m }}
      </button>
      <span class="cell-idx" style="margin-left: auto">press play, or step with arrows</span>
    </template>

    <div style="display: flex; flex-direction: column; gap: 18px; align-items: center; width: 100%">
      <div style="display: flex; gap: 28px; flex-wrap: wrap; justify-content: center; align-items: flex-start">
        <div>
          <div class="cell-idx" style="margin-bottom: 4px">users (left)</div>
          <div :style="headStyle"><span :style="colStyle">id</span><span :style="colWide">name</span></div>
          <div style="display: flex; flex-direction: column; gap: 3px">
            <div v-for="(u, i) in USERS" :key="u.id" :style="rowStyle(view.uMarks[i])">
              <span :style="colStyle">{{ u.id }}</span><span :style="colWide">{{ u.name }}</span>
            </div>
          </div>
        </div>
        <div>
          <div class="cell-idx" style="margin-bottom: 4px">orders (right)</div>
          <div :style="headStyle"><span :style="colStyle">id</span><span :style="colStyle">user_id</span><span :style="colWide">item</span></div>
          <div style="display: flex; flex-direction: column; gap: 3px">
            <div v-for="(o, i) in ORDERS" :key="o.id" :style="rowStyle(view.oMarks[i])">
              <span :style="colStyle">{{ o.id }}</span><span :style="colStyle">{{ o.user_id }}</span><span :style="colWide">{{ o.item }}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="width: 100%; max-width: 320px">
        <div class="cell-idx" style="margin-bottom: 4px; text-align: center">result</div>
        <div :style="headStyle"><span :style="colWide">name</span><span :style="colWide">item</span></div>
        <div style="display: flex; flex-direction: column; gap: 3px">
          <div v-for="r in view.result" :key="r.key" :style="rowStyle(r.cls)">
            <span :style="colWide">
              <em v-if="r.name === null" style="color: var(--viz-special)">NULL</em>
              <template v-else>{{ r.name }}</template>
            </span>
            <span :style="colWide">
              <em v-if="r.item === null" style="color: var(--viz-special)">NULL</em>
              <template v-else>{{ r.item }}</template>
            </span>
          </div>
          <div v-if="!view.result.length" class="state-empty" style="text-align: center; padding: 6px">no rows emitted yet</div>
        </div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">tally</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="{ done: view.emitted > 0 }">rows emitted: {{ view.emitted }}</span>
            <span class="chip" :class="{ active: view.dropped > 0 }">rows dropped: {{ view.dropped }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Which join when:</strong> INNER for "only things that match" (users who actually ordered),
        LEFT for "all of my main table, enriched where possible" (every user, orders if any; the everyday
        workhorse), RIGHT is just LEFT with the tables swapped, and FULL for reconciliation jobs where
        losing a row from either side would hide a problem. The animation shows a nested loop for
        clarity; real engines use hash joins or merge joins to avoid the O(N x M) scan, but the rows
        they produce are exactly the same.
      </div>
    </template>
  </VisualizerShell>
</template>
