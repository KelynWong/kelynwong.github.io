<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

// LRU cache, capacity 4. The doubly linked list is modeled as an array
// where index 0 is the head (MRU) and the last index is the tail (LRU).
// The hash map is drawn separately: one entry per key pointing at its node.
const CAP = 4
const list = ref([])
const stats = ref({ hits: 0, misses: 0, evictions: 0 })
const keyIn = ref('a')
const valIn = ref('9')

function seed() {
  list.value = [
    { k: 'c', v: '3' },
    { k: 'b', v: '2' },
    { k: 'a', v: '1' },
  ]
  stats.value = { hits: 0, misses: 0, evictions: 0 }
}
seed()

const player = usePlayer()

function snap(desc, listMarks = {}, mapMarks = {}) {
  return {
    desc,
    list: list.value.map((n) => ({ k: n.k, v: n.v, cls: listMarks[n.k] || '' })),
    map: [...list.value]
      .map((n) => ({ k: n.k, cls: mapMarks[n.k] || '' }))
      .sort((x, y) => (x.k < y.k ? -1 : 1)),
    stats: { ...stats.value },
  }
}

const view = computed(() => player.frame.value || snap(''))

// ---- frame builders (append to a shared array so the demo can chain ops) ----
function getFrames(frames, key) {
  frames.push(snap(`get("${key}"): ask the hash map first. One O(1) lookup, no walking the list to find the key.`, {}, { [key]: 'active' }))
  const i = list.value.findIndex((n) => n.k === key)
  if (i === -1) {
    stats.value.misses++
    frames.push(snap(`The map has no entry for "${key}": a MISS. In a real system this is the moment you pay for the slow backing store (database, origin server) and then put() the result.`))
    return
  }
  stats.value.hits++
  const node = list.value[i]
  frames.push(snap(`HIT: the map entry points straight at the node ("${key}": ${node.v}), no matter where it sits in the list.`, { [key]: 'active' }, { [key]: 'active' }))
  if (i === 0) {
    frames.push(snap(`"${key}" is already the head (MRU), so no reordering is needed. Return ${node.v}.`, { [key]: 'done' }))
  } else {
    frames.push(snap(`"${key}" was just used, so it must become most-recent. Unlink it: because the list is doubly linked, its two neighbors splice around it in O(1).`, { [key]: 'compare' }))
    list.value.splice(i, 1)
    list.value.unshift(node)
    frames.push(snap(`Relink "${key}" at the head. Recency order is current again, and the value ${node.v} is returned. Total work: two pointer updates, zero scanning.`, { [key]: 'done' }))
  }
}

function putFrames(frames, key, val) {
  frames.push(snap(`put("${key}", ${val}): check the hash map to see if the key already exists.`, {}, { [key]: 'active' }))
  const i = list.value.findIndex((n) => n.k === key)
  if (i !== -1) {
    const node = list.value[i]
    node.v = val
    frames.push(snap(`"${key}" already exists, so overwrite its value with ${val} in place.`, { [key]: 'active' }, { [key]: 'active' }))
    if (i > 0) {
      list.value.splice(i, 1)
      list.value.unshift(node)
      frames.push(snap(`A write counts as a use, so "${key}" also moves to the head (MRU).`, { [key]: 'done' }))
    } else {
      frames.push(snap(`"${key}" is already the MRU head, so nothing to reorder.`, { [key]: 'done' }))
    }
    return
  }
  if (list.value.length >= CAP) {
    const tail = list.value[list.value.length - 1]
    frames.push(snap(`No entry for "${key}", and the cache is full (${CAP}/${CAP}). Someone must go, and the tail node "${tail.k}" is the Least Recently Used: untouched the longest, so statistically the least likely to be needed again.`, { [tail.k]: 'compare' }, { [tail.k]: 'compare' }))
    list.value.pop()
    stats.value.evictions++
    frames.push(snap(`Evict "${tail.k}": drop the tail node and delete its map entry. Both are O(1); no search was needed to find the victim because the list order IS the recency order.`))
  } else {
    frames.push(snap(`No entry for "${key}", and there is room (${list.value.length}/${CAP}): no eviction needed.`))
  }
  list.value.unshift({ k: key, v: val })
  frames.push(snap(`Insert node ("${key}": ${val}) at the head and add the map entry "${key}" pointing to it. Newest = most recently used.`, { [key]: 'done' }, { [key]: 'done' }))
}

// ---- operations ----
function cleanKey() {
  return keyIn.value.trim().toLowerCase().slice(0, 6)
}

function doGet() {
  const k = cleanKey()
  if (!k) return
  const frames = []
  getFrames(frames, k)
  player.setFrames(frames, { autoplay: true })
}

function doPut() {
  const k = cleanKey()
  if (!k) return
  const v = String(valIn.value).trim().slice(0, 6) || '0'
  const frames = []
  putFrames(frames, k, v)
  player.setFrames(frames, { autoplay: true })
}

function demo() {
  list.value = []
  stats.value = { hits: 0, misses: 0, evictions: 0 }
  const frames = []
  frames.push(snap('Demo: start from an empty cache (capacity 4) and run a realistic access pattern: four inserts, a re-read, then one insert too many.'))
  putFrames(frames, 'a', '1')
  putFrames(frames, 'b', '2')
  putFrames(frames, 'c', '3')
  putFrames(frames, 'd', '4')
  getFrames(frames, 'a')
  putFrames(frames, 'e', '5')
  getFrames(frames, 'b')
  frames.push(snap('Done: 1 hit, 1 miss, 1 eviction. Notice that get("a") saved "a" from eviction by moving it to the head, so "b" got evicted instead. Reordering on every access is what makes LRU adapt to your workload.'))
  player.setFrames(frames, { autoplay: true })
}

function resetOp() {
  seed()
  player.setFrames([snap('Cache reset with 3 entries. Try put with two new keys to force an eviction, or run the demo sequence.')])
}

const legend = [
  ['map lookup / current', '--viz-active'],
  ['unlinking / evicting', '--viz-compare'],
  ['at head / inserted', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>key</label>
      <input class="input" style="width: 70px" v-model="keyIn" placeholder="a" @keyup.enter="doGet" />
      <label>value</label>
      <input class="input" style="width: 60px" v-model="valIn" placeholder="9" @keyup.enter="doPut" />
      <button class="btn btn-primary" @click="doGet">get</button>
      <button class="btn" @click="doPut">put</button>
      <button class="btn" @click="demo">demo sequence</button>
      <button class="btn btn-sm" style="margin-left: auto" @click="resetOp">reset</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 22px; align-items: center; width: 100%">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center">
        <span class="cell-idx">head<br />(MRU)</span>
        <template v-for="(n, i) in view.list" :key="n.k">
          <span v-if="i > 0" style="color: var(--text-faint); font-size: 16px">⇄</span>
          <div class="cell" :class="n.cls" style="min-width: 60px; height: 48px; flex-direction: column; gap: 0">
            <span>{{ n.k }}</span>
            <span class="cell-idx">{{ n.v }}</span>
          </div>
        </template>
        <span v-if="!view.list.length" class="state-empty">list is empty</span>
        <span class="cell-idx">tail<br />(LRU)</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 480px">
        <span class="cell-idx">hash map</span>
        <span
          v-for="e in view.map"
          :key="e.k"
          class="chip"
          :class="{ active: e.cls === 'active', done: e.cls === 'done' }"
          :style="e.cls === 'compare' ? { borderColor: 'var(--viz-compare)', color: 'var(--viz-compare)' } : {}"
        >{{ e.k }} → node({{ e.k }})</span>
        <span v-if="!view.map.length" class="state-empty">empty</span>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">counters</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="{ done: view.stats.hits > 0 }">hits: {{ view.stats.hits }}</span>
            <span class="chip" :class="{ active: view.stats.misses > 0 }">misses: {{ view.stats.misses }}</span>
            <span class="chip" :class="{ muted: view.stats.evictions === 0 }">evictions: {{ view.stats.evictions }}</span>
            <span class="chip">size: {{ view.list.length }}/{{ CAP }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Why two structures:</strong> the hash map gives O(1) "where is this key?", and the doubly
        linked list gives O(1) "reorder by recency" plus O(1) "who is oldest?" (the tail). Neither alone
        can do both. This exact design is LeetCode 146, the eviction policy CDNs and page caches lean on,
        and what Redis approximates with <em>maxmemory-policy allkeys-lru</em> (it samples keys instead
        of keeping a perfect list, trading exactness for memory).
      </div>
    </template>
  </VisualizerShell>
</template>
