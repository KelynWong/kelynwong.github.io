<script setup>
import { computed } from 'vue'

// Generic SVG tree/graph node renderer.
// nodes: [{ id, label, x, y, cls, sub }]  (x,y in px; cls: active|compare|done|special|faded; sub: small text under node)
// edges: [{ from, to, cls, label }]
const props = defineProps({
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  r: { type: Number, default: 19 },
  pad: { type: Number, default: 30 },
})

const colorMap = {
  active: 'var(--viz-active)',
  compare: 'var(--viz-compare)',
  done: 'var(--viz-done)',
  special: 'var(--viz-special)',
  warn: 'var(--viz-warn)',
}

function stroke(cls) { return colorMap[cls] || 'var(--border2)' }
function fillText(cls) { return colorMap[cls] || 'var(--text)' }

const byId = computed(() => Object.fromEntries(props.nodes.map((n) => [n.id, n])))

const box = computed(() => {
  const xs = props.nodes.map((n) => n.x)
  const ys = props.nodes.map((n) => n.y)
  if (!xs.length) return { w: 300, h: 120 }
  return {
    w: Math.max(...xs) + props.pad + props.r,
    h: Math.max(...ys) + props.pad + props.r + 14,
  }
})
</script>

<template>
  <svg class="viz-svg" :viewBox="`0 0 ${box.w} ${box.h}`" :style="{ maxWidth: box.w + 'px', margin: '0 auto' }">
    <g v-for="(e, i) in edges" :key="'e' + i">
      <line
        v-if="byId[e.from] && byId[e.to]"
        :x1="byId[e.from].x" :y1="byId[e.from].y"
        :x2="byId[e.to].x" :y2="byId[e.to].y"
        :stroke="e.cls ? stroke(e.cls) : 'var(--border2)'"
        :stroke-width="e.cls ? 2.2 : 1.4"
        :opacity="e.cls === 'faded' ? 0.25 : 1"
      />
      <text
        v-if="e.label !== undefined && byId[e.from] && byId[e.to]"
        :x="(byId[e.from].x + byId[e.to].x) / 2 + 8"
        :y="(byId[e.from].y + byId[e.to].y) / 2 - 4"
        fill="var(--text-dim)" font-size="10"
      >{{ e.label }}</text>
    </g>
    <g v-for="n in nodes" :key="n.id" :opacity="n.cls === 'faded' ? 0.3 : 1">
      <circle :cx="n.x" :cy="n.y" :r="r" fill="var(--bg3)" :stroke="stroke(n.cls)" :stroke-width="n.cls && n.cls !== 'faded' ? 2.2 : 1.4" />
      <text :x="n.x" :y="n.y + 4.5" text-anchor="middle" :fill="fillText(n.cls)" font-size="12.5">{{ n.label }}</text>
      <text v-if="n.sub !== undefined" :x="n.x" :y="n.y + r + 13" text-anchor="middle" fill="var(--text-dim)" font-size="9.5">{{ n.sub }}</text>
    </g>
  </svg>
</template>
