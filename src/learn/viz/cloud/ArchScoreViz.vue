<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const player = usePlayer() // shell requires one; this page is fully reactive instead

const PALETTE = [
  { type: 'lb', label: 'load balancer', color: 'var(--accent1)', max: 2 },
  { type: 'app', label: 'app server', color: 'var(--accent3)', max: 4 },
  { type: 'dbP', label: 'db-primary', color: 'var(--code4)', max: 2 },
  { type: 'dbR', label: 'db-replica', color: 'var(--code4)', max: 2 },
  { type: 'cache', label: 'cache', color: 'var(--code5)', max: 2 },
  { type: 'hc', label: 'health checks', color: 'var(--code3)', max: 1 },
]
const byType = Object.fromEntries(PALETTE.map((p) => [p.type, p]))

let nextId = 1
const placed = ref([]) // {id, type, zone: 'A' | 'B'}
const dragType = ref(null)
const dragOverZone = ref(null)
const hint = ref('Drag a component into a zone, or click one to drop it into zone A.')

function countOf(type, zone = null) {
  return placed.value.filter((c) => c.type === type && (zone === null || c.zone === zone)).length
}

function addTo(zone, type) {
  const t = type || dragType.value
  if (!t) return
  if (countOf(t) >= byType[t].max) {
    hint.value = `You already placed the maximum number of ${byType[t].label} components for this demo.`
    return
  }
  placed.value.push({ id: nextId++, type: t, zone })
  hint.value = `Added ${byType[t].label} to zone ${zone}.`
}

function remove(id) {
  const c = placed.value.find((x) => x.id === id)
  placed.value = placed.value.filter((x) => x.id !== id)
  if (c) hint.value = `Removed ${byType[c.type].label} from zone ${c.zone}.`
}

function onDrop(zone) {
  addTo(zone)
  dragType.value = null
  dragOverZone.value = null
}

function clearAll() {
  placed.value = []
  hint.value = 'Canvas cleared. Drag components in to design your system.'
}

function preset(kind) {
  clearAll()
  const put = (type, zone) => placed.value.push({ id: nextId++, type, zone })
  if (kind === 'risky') {
    put('app', 'A'); put('dbP', 'A')
    hint.value = 'Loaded the risky starter: one app talking to one database, all in one zone. Check the findings.'
  } else {
    put('lb', 'A'); put('app', 'A'); put('app', 'B'); put('dbP', 'A'); put('dbR', 'B'); put('cache', 'A'); put('hc', 'A')
    hint.value = 'Loaded a resilient layout: redundant apps behind a LB, the replica in the other zone, plus cache and health checks.'
  }
}
preset('risky')

const findings = computed(() => {
  const out = []
  const apps = countOf('app')
  const lbs = countOf('lb')
  const primaries = countOf('dbP')
  const replicas = countOf('dbR')
  const caches = countOf('cache')
  const checks = countOf('hc')
  const usedZones = new Set(placed.value.map((c) => c.zone))

  if (apps === 0) out.push({ severity: 'crit', delta: -30, text: 'No app servers placed. Nothing can serve a single request.' })
  else if (apps === 1) out.push({ severity: 'crit', delta: -25, text: 'Only one app instance. One crash or one bad deploy is a full outage. This is a single point of failure (SPOF).' })
  else out.push({ severity: 'ok', delta: 0, text: `${apps} app instances: one can die and the others absorb the traffic (N+1 redundancy).` })

  if (apps > 1 && lbs === 0) out.push({ severity: 'crit', delta: -15, text: 'Multiple app instances but no load balancer, so clients can only reach one of them. The rest is wasted redundancy.' })
  else if (lbs >= 1) out.push({ severity: 'ok', delta: 0, text: 'A load balancer spreads traffic and routes around dead instances. (Managed LBs are internally replicated, so the LB itself is not a SPOF.)' })

  if (primaries === 0) out.push({ severity: 'crit', delta: -20, text: 'No primary database. There is nowhere to write data.' })
  else if (primaries > 1) out.push({ severity: 'warn', delta: -10, text: 'Two primaries invite split-brain: both accept writes and the data diverges. Keep one primary and promote a replica when it fails.' })

  if (primaries >= 1) {
    if (replicas === 0) {
      out.push({ severity: 'crit', delta: -25, text: 'No database replica. The DB is a SPOF, and a disk failure means data loss.' })
    } else {
      const primaryZones = new Set(placed.value.filter((c) => c.type === 'dbP').map((c) => c.zone))
      const replicaApart = placed.value.some((c) => c.type === 'dbR' && !primaryZones.has(c.zone))
      if (replicaApart) out.push({ severity: 'ok', delta: 0, text: 'The DB replica lives in a different zone than the primary, so it survives instance failures AND zone failures.' })
      else out.push({ severity: 'warn', delta: -8, text: 'A replica exists, but it shares a zone with the primary. A zone outage takes out both copies at once.' })
    }
  }

  if (placed.value.length > 0) {
    if (usedZones.size < 2) out.push({ severity: 'warn', delta: -15, text: 'Everything lives in one availability zone. A datacenter-level outage (power, cooling, network) takes down every layer at once.' })
    else out.push({ severity: 'ok', delta: 0, text: 'Components are spread across both zones, so a zone failure is survivable.' })
  }

  if (checks === 0) out.push({ severity: 'warn', delta: -12, text: 'No health checks or auto-restart. Failures go unnoticed until users complain, and redundancy only helps if traffic stops flowing to dead instances.' })
  else out.push({ severity: 'ok', delta: 0, text: 'Health checks detect failures and reroute automatically.' })

  if (caches === 0) out.push({ severity: 'warn', delta: -8, text: 'No cache layer. Every read hits the database, which becomes the bottleneck as traffic grows.' })
  else out.push({ severity: 'ok', delta: 0, text: 'A cache absorbs repeated reads: lower latency, and the DB survives traffic spikes.' })

  return out
})

const score = computed(() => Math.max(0, 100 + findings.value.reduce((s, f) => s + f.delta, 0)))
const grade = computed(() => (score.value >= 90 ? 'A' : score.value >= 75 ? 'B' : score.value >= 60 ? 'C' : score.value >= 40 ? 'D' : 'F'))
const gradeColor = computed(() => (score.value >= 75 ? 'var(--accent3)' : score.value >= 60 ? 'var(--code5)' : 'var(--code3)'))
const sevColor = { crit: 'var(--code3)', warn: 'var(--code5)', ok: 'var(--accent3)' }

const captionText = computed(() => {
  if (score.value >= 90) return 'Production-ready shape: no single points of failure, and failures get detected automatically.'
  if (score.value >= 60) return 'Decent, but the findings below would eventually page you at 3am.'
  return 'This design has outage written all over it. Check the critical findings below.'
})
</script>

<template>
  <VisualizerShell :player="player" :show-player="false">
    <template #inputs>
      <span class="cell-idx">components:</span>
      <button
        v-for="p in PALETTE"
        :key="p.type"
        class="btn btn-sm"
        draggable="true"
        :style="{ borderColor: p.color, color: p.color, cursor: 'grab', opacity: countOf(p.type) >= p.max ? 0.4 : 1 }"
        @dragstart="dragType = p.type"
        @click="addTo('A', p.type)"
      >+ {{ p.label }}</button>
      <span style="flex: 1"></span>
      <button class="btn btn-sm" @click="preset('risky')">risky starter</button>
      <button class="btn btn-sm" @click="preset('good')">resilient example</button>
      <button class="btn btn-sm" @click="clearAll">clear</button>
    </template>

    <div style="display: flex; gap: 14px; flex-wrap: wrap">
      <div
        v-for="zone in ['A', 'B']"
        :key="zone"
        style="flex: 1; min-width: 240px; min-height: 190px; border: 2px dashed var(--border2); border-radius: 6px; padding: 12px; transition: border-color 0.15s ease, background 0.15s ease"
        :style="dragOverZone === zone ? 'border-color: var(--accent1); background: color-mix(in srgb, var(--accent1) 6%, transparent)' : ''"
        @dragover.prevent="dragOverZone = zone"
        @dragleave="dragOverZone === zone && (dragOverZone = null)"
        @drop.prevent="onDrop(zone)"
      >
        <div class="cell-idx" style="text-align: left; margin-bottom: 10px">availability zone {{ zone }}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start">
          <span
            v-for="c in placed.filter((x) => x.zone === zone)"
            :key="c.id"
            class="chip"
            :style="{ borderColor: byType[c.type].color, color: byType[c.type].color, display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 10px' }"
          >
            {{ byType[c.type].label }}
            <button
              style="background: none; border: none; padding: 0; cursor: pointer; color: var(--text-dim); font-size: 13px; line-height: 1"
              :aria-label="`remove ${byType[c.type].label}`"
              @click="remove(c.id)"
            >×</button>
          </span>
          <span v-if="!placed.filter((x) => x.zone === zone).length" class="state-empty">drop components here</span>
        </div>
      </div>
    </div>
    <div class="cell-idx" style="margin-top: 10px; text-align: center">{{ hint }}</div>

    <div class="viz-caption" :style="{ borderLeftColor: gradeColor, marginTop: '14px' }">
      Architecture score: <strong>{{ score }}/100, grade {{ grade }}</strong>. {{ captionText }}
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">findings</div>
        <div class="state-body" style="display: flex; flex-direction: column; gap: 8px">
          <div v-for="(fd, i) in findings" :key="i" style="display: flex; gap: 8px; align-items: baseline; font-size: var(--fs-3xs); line-height: 1.55">
            <span class="chip" :style="{ color: sevColor[fd.severity], borderColor: sevColor[fd.severity], flexShrink: 0 }">
              {{ fd.severity === 'ok' ? 'pass' : fd.delta }}
            </span>
            <span :style="{ color: fd.severity === 'ok' ? 'var(--text-dim)' : 'var(--text)' }">{{ fd.text }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>The core question of system design:</strong> "what happens when this box dies?"
        Build your layout by dragging components into the two zones and watch the score react.
        Every red finding is a box whose death takes your service (or your data) down with it.
        When your design scores well, head to the Failover Simulator and try to break it anyway.
      </div>
    </template>
  </VisualizerShell>
</template>
