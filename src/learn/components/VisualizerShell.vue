<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  player: { type: Object, required: true },
  pseudocode: { type: Array, default: () => [] },
  legend: { type: Array, default: () => [] }, // [[label, cssVar], ...]
  showPlayer: { type: Boolean, default: true },
})

const caption = computed(() => props.player.frame.value?.desc || '')
const activeLine = computed(() => {
  const l = props.player.frame.value?.line
  return typeof l === 'number' ? l : -1
})

function onKey(e) {
  const tag = (e.target?.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.key === 'ArrowRight') { e.preventDefault(); props.player.stepF() }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); props.player.stepB() }
  else if (e.key === ' ') { e.preventDefault(); props.player.toggle() }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="viz-wrap">
    <div class="viz-main">
      <div v-if="$slots.inputs" class="panel viz-inputs">
        <slot name="inputs" />
      </div>

      <div class="panel">
        <div class="viz-canvas">
          <slot />
        </div>
        <div v-if="legend.length" class="viz-legend">
          <span v-for="[label, colorVar] in legend" :key="label" class="k">
            <span class="swatch" :style="{ background: `var(${colorVar})` }"></span>{{ label }}
          </span>
        </div>
      </div>

      <div v-if="caption" class="viz-caption">{{ caption }}</div>

      <div v-if="showPlayer && player.frames.value.length > 1" class="panel player">
        <input
          class="player-progress"
          type="range"
          min="0"
          :max="Math.max(0, player.frames.value.length - 1)"
          :value="player.index.value"
          @input="player.seek(Number($event.target.value))"
        />
        <div class="player-meta">
          <span>step {{ player.frames.value.length ? player.index.value + 1 : 0 }} / {{ player.frames.value.length }}</span>
          <span>space = play · ← → = step</span>
        </div>
        <div class="player-row">
          <button class="btn btn-sm" :disabled="player.atStart.value" @click="player.restart()" title="Restart">|«</button>
          <button class="btn btn-sm" :disabled="player.atStart.value" @click="player.stepB()" title="Step back">‹</button>
          <button class="btn btn-primary btn-sm" @click="player.toggle()">
            {{ player.playing.value ? 'pause' : 'play' }}
          </button>
          <button class="btn btn-sm" :disabled="player.atEnd.value" @click="player.stepF()" title="Step forward">›</button>
          <div class="player-speed">
            <input type="range" min="0.25" max="4" step="0.25" v-model.number="player.speed.value" />
            <span>{{ player.speed.value }}x</span>
          </div>
        </div>
      </div>
    </div>

    <div class="viz-side">
      <div v-if="pseudocode.length" class="panel">
        <div class="panel-title">pseudocode</div>
        <div class="pseudo">
          <span
            v-for="(lineText, i) in pseudocode"
            :key="i"
            class="pseudo-line"
            :class="{ active: i === activeLine }"
          >{{ lineText }}</span>
        </div>
      </div>
      <slot name="state" />
    </div>
  </div>
</template>
