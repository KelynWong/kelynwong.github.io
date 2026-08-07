<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const player = usePlayer() // shell requires one; this page is a live simulation instead

const APP_CAPACITY = 100 // rps each
const FAILOVER_TICKS = 4

const rps = ref(60)
const comps = reactive({
  lb: { label: 'load balancer', alive: true },
  app1: { label: 'app-1', alive: true },
  app2: { label: 'app-2', alive: true },
  dbP: { label: 'db-primary', alive: true },
  dbR: { label: 'db-replica', alive: true },
})
const promoted = ref(false)      // replica promoted to primary
const failoverT = ref(0)         // countdown while failover is in progress
const queue = ref(0)
const metrics = reactive({ latency: 40, errPct: 0, servedPct: 100 })
const log = ref([])
let tickN = 0
let timer = null

function addLog(msg, kind = '') {
  log.value.unshift({ t: `t+${tickN}`, msg, kind })
  if (log.value.length > 9) log.value.pop()
}

function toggle(id) {
  const c = comps[id]
  c.alive = !c.alive
  if (!c.alive) {
    addLog(`${c.label} KILLED`, 'bad')
    if (id === 'dbP' && comps.dbR.alive && !promoted.value) {
      failoverT.value = FAILOVER_TICKS
      addLog('primary DB lost. health checks detecting failure…', 'warn')
    }
    if (id === 'lb') addLog('the LB was a single point of failure, so nothing can route!', 'bad')
  } else {
    addLog(`${c.label} restored`, 'good')
    if (id === 'dbP' && promoted.value) {
      addLog('old primary is back, and it rejoins as the new REPLICA (the promotion is not undone)', 'warn')
    }
  }
}

function reset() {
  for (const k of Object.keys(comps)) comps[k].alive = true
  promoted.value = false
  failoverT.value = 0
  queue.value = 0
  rps.value = 60
  log.value = []
  tickN = 0
  addLog('simulation reset: all components healthy')
}

const dbWriteOk = computed(() => (promoted.value ? comps.dbR.alive : comps.dbP.alive) || failoverT.value > 0)

function tick() {
  tickN++
  const healthyApps = ['app1', 'app2'].filter((a) => comps[a].alive)

  // failover state machine
  if (failoverT.value > 0) {
    failoverT.value--
    if (failoverT.value === 0) {
      promoted.value = true
      addLog('db-replica PROMOTED to primary, so writes resume', 'good')
    }
  }

  // no route at all
  if (!comps.lb.alive || healthyApps.length === 0) {
    queue.value = 0
    metrics.latency = 0
    metrics.errPct = 100
    metrics.servedPct = 0
    return
  }

  const primaryUp = promoted.value ? comps.dbR.alive : comps.dbP.alive
  const dbDown = !primaryUp || failoverT.value > 0

  const perApp = rps.value / healthyApps.length
  const util = perApp / APP_CAPACITY
  const overflow = Math.max(0, rps.value - healthyApps.length * APP_CAPACITY)

  queue.value = Math.max(0, Math.min(500, queue.value + overflow - (overflow === 0 ? 60 : 0)))

  let latency = 40 + Math.max(0, util - 0.6) * 220 + queue.value * 1.2
  let err = 0
  if (queue.value > 250) { err += Math.min(60, (queue.value - 250) / 4); if (tickN % 5 === 0) addLog('queues saturated, so requests are being shed (backpressure)', 'warn') }
  if (util > 1 && tickN % 5 === 1) addLog(`apps at ${Math.round(util * 100)}% capacity, queue backing up (${Math.round(queue.value)})`, 'warn')
  if (dbDown) {
    err = Math.max(err, failoverT.value > 0 ? 70 : 100)
    latency += 300
  }
  metrics.latency = Math.round(latency)
  metrics.errPct = Math.round(Math.min(100, err))
  metrics.servedPct = 100 - metrics.errPct
}

onMounted(() => {
  addLog('simulation started. try killing things')
  timer = setInterval(tick, 700)
})
onBeforeUnmount(() => clearInterval(timer))

// ---- drawing ----
const P = {
  client: { x: 60, y: 150 }, lb: { x: 200, y: 150 },
  app1: { x: 360, y: 80 }, app2: { x: 360, y: 220 },
  dbP: { x: 540, y: 110 }, dbR: { x: 540, y: 210 },
}
function boxColor(alive, degraded = false) {
  if (!alive) return 'var(--code3)'
  if (degraded) return 'var(--viz-warn)'
  return 'var(--viz-done)'
}
const appDegraded = computed(() => rps.value / Math.max(1, ['app1', 'app2'].filter((a) => comps[a].alive).length) > APP_CAPACITY * 0.8)

const statusText = computed(() => {
  if (!comps.lb.alive) return { text: 'TOTAL OUTAGE: the load balancer was a single point of failure', cls: 'bad' }
  if (!comps.app1.alive && !comps.app2.alive) return { text: 'TOTAL OUTAGE: no app servers left to serve traffic', cls: 'bad' }
  if (failoverT.value > 0) return { text: `FAILING OVER: replica promotion in ${failoverT.value} tick(s), writes erroring`, cls: 'warn' }
  if (!dbWriteOk.value) return { text: 'DATABASE DOWN: no replica available to promote', cls: 'bad' }
  if (metrics.errPct > 0) return { text: 'DEGRADED: shedding load', cls: 'warn' }
  if (appDegraded.value) return { text: 'HOT: apps near capacity, latency climbing', cls: 'warn' }
  return { text: 'HEALTHY: all requests served', cls: 'good' }
})
</script>

<template>
  <VisualizerShell :player="player" :show-player="false">
    <template #inputs>
      <label>traffic</label>
      <input type="range" min="10" max="300" step="10" v-model.number="rps" style="width: 130px; accent-color: var(--accent1)" />
      <span class="chip active">{{ rps }} req/s</span>
      <span style="width: 8px"></span>
      <button v-for="(c, id) in comps" :key="id" class="btn btn-sm" :style="c.alive ? '' : 'border-color: var(--code3); color: var(--code3)'" @click="toggle(id)">
        {{ c.alive ? 'kill' : 'restore' }} {{ c.label }}
      </button>
      <button class="btn" style="margin-left: auto" @click="reset">reset</button>
    </template>

    <svg class="viz-svg" viewBox="0 0 650 300">
      <defs>
        <marker id="fo-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
      </defs>

      <!-- edges -->
      <line :x1="P.client.x + 38" :y1="P.client.y" :x2="P.lb.x - 42" :y2="P.lb.y" stroke="var(--text-dim)" :stroke-width="comps.lb.alive ? 1.8 : 1" :stroke-dasharray="comps.lb.alive ? '' : '4 4'" marker-end="url(#fo-a)" />
      <line v-for="a in ['app1', 'app2']" :key="a" :x1="P.lb.x + 42" :y1="P.lb.y" :x2="P[a].x - 42" :y2="P[a].y"
        :stroke="comps.lb.alive && comps[a].alive ? 'var(--text-dim)' : 'var(--border2)'"
        :stroke-width="comps.lb.alive && comps[a].alive ? 1.8 : 1" :stroke-dasharray="comps.lb.alive && comps[a].alive ? '' : '4 4'" marker-end="url(#fo-a)" />
      <line v-for="a in ['app1', 'app2']" :key="a + 'db'" :x1="P[a].x + 42" :y1="P[a].y"
        :x2="(promoted ? P.dbR : P.dbP).x - 42" :y2="(promoted ? P.dbR : P.dbP).y"
        :stroke="comps[a].alive && dbWriteOk ? 'var(--text-dim)' : 'var(--border2)'" stroke-width="1.4"
        :stroke-dasharray="comps[a].alive && dbWriteOk ? '' : '4 4'" marker-end="url(#fo-a)" />
      <line :x1="P.dbP.x" :y1="P.dbP.y + 22" :x2="P.dbR.x" :y2="P.dbR.y - 22"
        :stroke="comps.dbP.alive && comps.dbR.alive && !promoted ? 'var(--accent2)' : 'var(--border2)'"
        stroke-width="1.3" stroke-dasharray="3 3" />
      <text :x="P.dbP.x + 6" :y="(P.dbP.y + P.dbR.y) / 2 + 3" fill="var(--text-faint)" font-size="9">{{ promoted ? '' : 'replication' }}</text>

      <!-- nodes -->
      <g v-for="(pos, id) in { client: P.client, lb: P.lb, app1: P.app1, app2: P.app2, dbP: P.dbP, dbR: P.dbR }" :key="id">
        <rect
          :x="pos.x - 40" :y="pos.y - 22" width="80" height="44" rx="5"
          fill="var(--bg3)"
          :stroke="id === 'client' ? 'var(--border2)' : boxColor(comps[id].alive, ['app1', 'app2'].includes(id) ? appDegraded : id === 'dbP' && failoverT > 0)"
          stroke-width="1.8"
          :opacity="id !== 'client' && !comps[id].alive ? 0.45 : 1"
        />
        <text :x="pos.x" :y="pos.y - 2" text-anchor="middle" fill="var(--text)" font-size="10.5">
          {{ id === 'client' ? 'clients' : comps[id].label }}
        </text>
        <text :x="pos.x" :y="pos.y + 12" text-anchor="middle" fill="var(--text-dim)" font-size="9">
          {{ id === 'client' ? rps + ' req/s'
            : id === 'dbR' ? (promoted ? '★ now primary' : comps.dbR.alive ? 'standby' : 'DOWN')
            : id === 'dbP' ? (comps.dbP.alive ? (promoted ? 'demoted' : 'writes') : 'DOWN')
            : comps[id].alive ? (['app1', 'app2'].includes(id) ? Math.round(rps / Math.max(1, ['app1','app2'].filter(a => comps[a].alive).length)) + ' req/s' : 'routing') : 'DOWN' }}
        </text>
      </g>
    </svg>

    <div class="viz-caption" :style="{ borderLeftColor: statusText.cls === 'bad' ? 'var(--code3)' : statusText.cls === 'warn' ? 'var(--code5)' : 'var(--accent3)' }">
      {{ statusText.text }}
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">live metrics</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="{ active: metrics.latency > 150 }">latency ≈ {{ metrics.latency }}ms</span>
            <span class="chip" :class="metrics.errPct > 0 ? 'active' : 'done'">errors {{ metrics.errPct }}%</span>
            <span class="chip" :class="{ active: queue > 0 }">queue {{ Math.round(queue) }}</span>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">event log</div>
        <div class="state-body" style="display: flex; flex-direction: column; gap: 3px; font-size: var(--fs-3xs)">
          <div v-for="(e, i) in log" :key="i" :style="{ color: e.kind === 'bad' ? 'var(--code3)' : e.kind === 'warn' ? 'var(--code5)' : e.kind === 'good' ? 'var(--accent3)' : 'var(--text-dim)' }">
            <span style="color: var(--text-faint)">{{ e.t }}</span> {{ e.msg }}
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Things to try:</strong> ① Kill <em>db-primary</em> and watch the failover: errors spike
        until health checks promote the replica (that gap is your RTO). ② Kill one app server at high
        traffic, and the survivor overloads and queues back up. ③ Kill the <em>load balancer</em>: in this
        layout it's a single point of failure, which is why real LBs are managed, redundant services.
        ④ Restore the old primary: it comes back as a replica, not the boss.
      </div>
    </template>
  </VisualizerShell>
</template>
