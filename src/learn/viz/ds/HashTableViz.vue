<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const B = 7 // bucket count (deliberately small so collisions happen)
const buckets = ref(Array.from({ length: B }, () => []))
const keyIn = ref('cat')
const valIn = ref('9')

// preload a few entries so the shape is visible
;[['ada', 1], ['bob', 7], ['eve', 3]].forEach(([k, v]) => {
  buckets.value[hashOf(k)].push({ k, v })
})

function hashOf(key) {
  let sum = 0
  for (const ch of key) sum += ch.charCodeAt(0)
  return sum % B
}

const player = usePlayer()
const view = computed(() => player.frame.value || snapshot(''))

function snapshot(desc, marks = {}, hashInfo = null) {
  // marks: { `${b}:${i}`: cls, [`bucket${b}`]: cls }
  return { buckets: buckets.value.map((chain) => chain.map((e) => ({ ...e }))), marks, hashInfo, desc }
}

function hashFrames(key, op) {
  const frames = []
  let sum = 0
  const parts = []
  for (const ch of key) {
    sum += ch.charCodeAt(0)
    parts.push(`'${ch}'=${ch.charCodeAt(0)}`)
  }
  frames.push(snapshot(`${op}("${key}"). First, hash the key: sum the character codes. ${parts.join(' + ')} = ${sum}.`, {}, { text: `hash("${key}") = ${parts.join(' + ')} = ${sum}` }))
  const b = sum % B
  frames.push(snapshot(`${sum} mod ${B} buckets = ${b}. The hash jumps us straight to bucket ${b}, with no scanning of other buckets, ever.`, { [`bucket${b}`]: 'active' }, { text: `${sum} mod ${B} = ${b}` }))
  return { frames, b }
}

function set() {
  const key = keyIn.value.trim().toLowerCase().slice(0, 8)
  if (!key) return
  const val = valIn.value.trim() || '0'
  const { frames, b } = hashFrames(key, 'set')
  const chain = buckets.value[b]
  let found = -1
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].k === key) {
      frames.push(snapshot(`Bucket ${b} already has "${chain[i].k}". Same key, so update its value to ${val}.`, { [`bucket${b}`]: 'active', [`${b}:${i}`]: 'compare' }))
      found = i
      break
    }
    frames.push(snapshot(`Bucket ${b} isn't empty. Collision! Walk its chain: "${chain[i].k}" ≠ "${key}".`, { [`bucket${b}`]: 'active', [`${b}:${i}`]: 'compare' }))
  }
  if (found >= 0) {
    chain[found] = { k: key, v: val }
    frames.push(snapshot(`Updated "${key}" → ${val}.`, { [`${b}:${found}`]: 'done' }))
  } else {
    chain.push({ k: key, v: val })
    frames.push(snapshot(
      chain.length > 1
        ? `Append "${key}" to bucket ${b}'s chain. Two different keys hashed to the same bucket, but chaining handles it.`
        : `Bucket ${b} was empty, so store "${key}" → ${val} directly. O(1).`,
      { [`${b}:${chain.length - 1}`]: 'done' }
    ))
  }
  player.setFrames(frames, { autoplay: true })
}

function get() {
  const key = keyIn.value.trim().toLowerCase().slice(0, 8)
  if (!key) return
  const { frames, b } = hashFrames(key, 'get')
  const chain = buckets.value[b]
  let ok = false
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].k === key) {
      frames.push(snapshot(`"${key}" found in bucket ${b} → value ${chain[i].v}. Total work: 1 hash + ${i + 1} comparison${i ? 's' : ''}.`, { [`${b}:${i}`]: 'done' }))
      ok = true
      break
    }
    frames.push(snapshot(`Walk bucket ${b}'s chain: "${chain[i].k}" ≠ "${key}", keep going.`, { [`bucket${b}`]: 'active', [`${b}:${i}`]: 'compare' }))
  }
  if (!ok) frames.push(snapshot(`Chain exhausted: "${key}" is not in the table. Still only bucket ${b} was ever touched.`, { [`bucket${b}`]: 'active' }))
  player.setFrames(frames, { autoplay: true })
}

function del() {
  const key = keyIn.value.trim().toLowerCase().slice(0, 8)
  if (!key) return
  const { frames, b } = hashFrames(key, 'delete')
  const chain = buckets.value[b]
  const i = chain.findIndex((e) => e.k === key)
  if (i >= 0) {
    frames.push(snapshot(`Found "${key}" in bucket ${b}. Unlink it from the chain.`, { [`${b}:${i}`]: 'compare' }))
    chain.splice(i, 1)
    frames.push(snapshot(`"${key}" removed.`, { [`bucket${b}`]: 'active' }))
  } else {
    frames.push(snapshot(`"${key}" isn't in bucket ${b}, so there's nothing to delete.`, { [`bucket${b}`]: 'active' }))
  }
  player.setFrames(frames, { autoplay: true })
}

const count = computed(() => view.value.buckets.reduce((s, c) => s + c.length, 0))
const legend = [
  ['target bucket', '--viz-active'],
  ['comparing keys', '--viz-compare'],
  ['stored / found', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>key</label>
      <input class="input" style="width: 90px" v-model="keyIn" placeholder="cat" @keyup.enter="set" />
      <label>value</label>
      <input class="input" style="width: 60px" v-model="valIn" placeholder="9" @keyup.enter="set" />
      <button class="btn btn-primary" @click="set">set</button>
      <button class="btn" @click="get">get</button>
      <button class="btn" @click="del">delete</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 10px; max-width: 560px; margin: 0 auto; width: 100%">
      <div v-if="view.hashInfo" class="chip active" style="align-self: center; font-size: var(--fs-2xs); padding: 6px 12px">
        {{ view.hashInfo.text }}
      </div>
      <div v-for="(chain, b) in view.buckets" :key="b" style="display: flex; align-items: center; gap: 10px">
        <div
          class="cell"
          :class="view.marks[`bucket${b}`]"
          style="min-width: 54px; height: 36px; font-size: var(--fs-3xs)"
        >[{{ b }}]</div>
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap">
          <template v-for="(e, i) in chain" :key="e.k">
            <span v-if="i > 0" style="color: var(--text-faint)">→</span>
            <span class="chip" :class="view.marks[`${b}:${i}`]" style="font-size: var(--fs-3xs)">{{ e.k }}: {{ e.v }}</span>
          </template>
          <span v-if="!chain.length" class="state-empty">empty</span>
        </div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">state</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip">{{ count }} entries</span>
            <span class="chip">{{ B }} buckets</span>
            <span class="chip" :class="{ active: count / B > 0.7 }">load factor = {{ (count / B).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Why O(1) on average:</strong> the hash function converts any key directly into a bucket
        index in one arithmetic step. Collisions (two keys, same bucket) are handled here by
        <em>chaining</em>: each bucket holds a small list. As the load factor grows, chains get longer and
        real tables resize (like the dynamic array) to keep chains near length 1. Try keys
        <em>"ab"</em> and <em>"ba"</em>: same characters, same hash, guaranteed collision.
      </div>
    </template>
  </VisualizerShell>
</template>
