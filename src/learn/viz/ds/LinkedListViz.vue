<script setup>
import { ref, computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'
import { rint } from '../utils.js'

const MAX = 6
const list = ref([42, 17, 88])
const insertIdx = ref(1)
const searchVal = ref(88)

const player = usePlayer()
const view = computed(() => player.frame.value || baseFrame(''))

const NODE_W = 74
const NODE_H = 44
const GAP = 46
const X0 = 78
const Y = 60
const FLOAT_Y = 150

function nodeX(i) { return X0 + i * (NODE_W + GAP) }

function baseFrame(desc) {
  return { nodes: list.value.map((v) => ({ v, cls: '' })), floating: null, cut: null, bypass: null, desc }
}

function walkFrames(desc, upTo) {
  // highlight the walk from head to index upTo (inclusive)
  const frames = []
  for (let i = 0; i <= upTo; i++) {
    const f = baseFrame(`${desc}. Walk the chain: at node ${i} (${list.value[i]}). We can only reach a node through the one before it.`)
    for (let j = 0; j < i; j++) f.nodes[j].cls = 'faded'
    f.nodes[i].cls = 'compare'
    frames.push(f)
  }
  return frames
}

function insertAt(pos) {
  if (list.value.length >= MAX) {
    player.setFrames([baseFrame('List is full for this demo. Delete something first.')])
    return
  }
  const v = rint(5, 99)
  const k = Math.max(0, Math.min(list.value.length, Math.floor(pos)))
  const frames = []

  if (k === 0) {
    frames.push(baseFrame(`insertHead(${v}) needs no walking: we always hold a pointer to the head.`))
    let f = baseFrame(`Create the new node ${v}. It exists in memory but nothing points to it yet.`)
    f.floating = { v, afterIdx: -1, cls: 'active', linkNext: false, linkPrev: false }
    frames.push(f)
    f = baseFrame(`Point new.next at the current head (${list.value[0] ?? 'null'}).`)
    f.floating = { v, afterIdx: -1, cls: 'active', linkNext: true, linkPrev: false }
    frames.push(f)
    f = baseFrame(`Move HEAD to the new node. Two pointer writes in total: O(1), regardless of list length.`)
    f.floating = { v, afterIdx: -1, cls: 'active', linkNext: true, linkPrev: true }
    frames.push(f)
  } else {
    frames.push(...walkFrames(`insertAt(${k}, ${v})`, k - 1))
    let f = baseFrame(`Create the new node ${v}. It will slot in after node ${k - 1}.`)
    f.nodes[k - 1].cls = 'active'
    f.floating = { v, afterIdx: k - 1, cls: 'active', linkNext: false, linkPrev: false }
    frames.push(f)
    f = baseFrame(`Step 1: point new.next at node ${k}${list.value[k] !== undefined ? ` (${list.value[k]})` : ' (null)'} . The old link is still intact, so the list is never broken.`)
    f.nodes[k - 1].cls = 'active'
    f.floating = { v, afterIdx: k - 1, cls: 'active', linkNext: true, linkPrev: false }
    frames.push(f)
    f = baseFrame(`Step 2: rewire node ${k - 1}.next to the new node. Just two pointer writes, with no shifting of elements, ever.`)
    f.nodes[k - 1].cls = 'active'
    f.cut = k - 1
    f.floating = { v, afterIdx: k - 1, cls: 'active', linkNext: true, linkPrev: true }
    frames.push(f)
  }

  list.value = [...list.value.slice(0, k), v, ...list.value.slice(k)]
  const done = baseFrame(`Done: ${v} is now at position ${k}. The insert itself was O(1); reaching the position cost O(${k}).`)
  done.nodes[k].cls = 'done'
  frames.push(done)
  player.setFrames(frames, { autoplay: true })
}

function deleteAt(pos) {
  if (!list.value.length) return
  const k = Math.max(0, Math.min(list.value.length - 1, Math.floor(pos)))
  const frames = []
  if (k > 0) frames.push(...walkFrames(`deleteAt(${k})`, k - 1))
  let f = baseFrame(`Node ${k} (${list.value[k]}) is the one to remove.`)
  if (k > 0) f.nodes[k - 1].cls = 'active'
  f.nodes[k].cls = 'compare'
  frames.push(f)
  f = baseFrame(
    k === 0
      ? `Move HEAD past it: HEAD = head.next. Nothing points at ${list.value[k]} anymore.`
      : `Bypass it: node ${k - 1}.next = node ${k + 1 < list.value.length ? k + 1 : 'null'}. Nothing points at ${list.value[k]} anymore, so the garbage collector reclaims it.`
  )
  if (k > 0) f.nodes[k - 1].cls = 'active'
  f.nodes[k].cls = 'faded'
  f.bypass = k
  frames.push(f)
  list.value = list.value.filter((_, i) => i !== k)
  frames.push(baseFrame(`Done. One pointer write to unlink: O(1) once you're standing at the right node.`))
  player.setFrames(frames, { autoplay: true })
}

function search() {
  const target = Math.floor(searchVal.value)
  const frames = []
  for (let i = 0; i < list.value.length; i++) {
    if (list.value[i] === target) {
      const f = baseFrame(`Found ${target} at position ${i} after following ${i} pointer${i === 1 ? '' : 's'}. No shortcut exists, which is why search is O(N).`)
      for (let j = 0; j < i; j++) f.nodes[j].cls = 'faded'
      f.nodes[i].cls = 'done'
      frames.push(f)
      player.setFrames(frames, { autoplay: true })
      return
    }
    const f = baseFrame(`search(${target}): node ${i} holds ${list.value[i]}, not ${target}. Follow .next.`)
    for (let j = 0; j < i; j++) f.nodes[j].cls = 'faded'
    f.nodes[i].cls = 'compare'
    frames.push(f)
  }
  frames.push(baseFrame(`Reached null, so ${target} isn't in the list. We had to touch every node: O(N).`))
  player.setFrames(frames, { autoplay: true })
}

function cls(nodeCls) {
  const map = {
    active: 'var(--viz-active)',
    compare: 'var(--viz-compare)',
    done: 'var(--viz-done)',
  }
  return map[nodeCls] || 'var(--border2)'
}

const svgW = computed(() => Math.max(560, X0 + (view.value.nodes.length + 1) * (NODE_W + GAP)))

const legend = [
  ['walking / target', '--viz-compare'],
  ['pointer being rewired', '--viz-active'],
  ['inserted', '--viz-done'],
]
</script>

<template>
  <VisualizerShell :player="player" :legend="legend">
    <template #inputs>
      <label>index</label>
      <input class="input" style="width: 56px" type="number" min="0" v-model.number="insertIdx" />
      <button class="btn" @click="insertAt(0)">insertHead</button>
      <button class="btn" @click="insertAt(insertIdx)">insertAt(i)</button>
      <button class="btn" @click="deleteAt(insertIdx)">deleteAt(i)</button>
      <label style="margin-left: 10px">value</label>
      <input class="input" style="width: 62px" type="number" v-model.number="searchVal" />
      <button class="btn" @click="search">search(v)</button>
    </template>

    <svg class="viz-svg" :viewBox="`0 0 ${svgW} 210`" :style="{ minWidth: svgW * 0.8 + 'px' }">
      <defs>
        <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
        <marker id="ll-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-active)" />
        </marker>
      </defs>

      <!-- HEAD label -->
      <text :x="8" :y="Y + NODE_H / 2 + 4" fill="var(--text-dim)" font-size="11">HEAD</text>
      <line
        v-if="view.nodes.length || view.floating"
        :x1="46" :y1="Y + NODE_H / 2"
        :x2="view.floating && view.floating.afterIdx === -1 && view.floating.linkPrev ? nodeX(0) - (NODE_W + GAP) / 2 + 20 : nodeX(0) - 6"
        :y2="view.floating && view.floating.afterIdx === -1 && view.floating.linkPrev ? FLOAT_Y + 8 : Y + NODE_H / 2"
        :stroke="view.floating && view.floating.afterIdx === -1 && view.floating.linkPrev ? 'var(--viz-active)' : 'var(--text-dim)'"
        stroke-width="1.5"
        :marker-end="view.floating && view.floating.afterIdx === -1 && view.floating.linkPrev ? 'url(#ll-arrow-hot)' : 'url(#ll-arrow)'"
      />

      <!-- nodes -->
      <g v-for="(n, i) in view.nodes" :key="i" :opacity="n.cls === 'faded' ? 0.3 : 1">
        <rect :x="nodeX(i)" :y="Y" :width="NODE_W" :height="NODE_H" rx="4" fill="var(--bg3)" :stroke="cls(n.cls)" stroke-width="1.5" />
        <line :x1="nodeX(i) + NODE_W - 22" :y1="Y" :x2="nodeX(i) + NODE_W - 22" :y2="Y + NODE_H" stroke="var(--border2)" stroke-width="1" />
        <text :x="nodeX(i) + (NODE_W - 22) / 2" :y="Y + NODE_H / 2 + 5" text-anchor="middle" :fill="n.cls ? cls(n.cls) : 'var(--text)'" font-size="14">{{ n.v }}</text>
        <circle :cx="nodeX(i) + NODE_W - 11" :cy="Y + NODE_H / 2" r="3" fill="var(--text-dim)" />
        <text :x="nodeX(i) + NODE_W / 2" :y="Y + NODE_H + 18" text-anchor="middle" fill="var(--text-faint)" font-size="10">{{ i }}</text>

        <!-- next pointer -->
        <template v-if="view.bypass !== i && view.cut !== i">
          <line
            v-if="i < view.nodes.length - 1"
            :x1="nodeX(i) + NODE_W - 11" :y1="Y + NODE_H / 2"
            :x2="nodeX(i + 1) - 6" :y2="Y + NODE_H / 2"
            stroke="var(--text-dim)" stroke-width="1.5" marker-end="url(#ll-arrow)"
          />
          <text v-else :x="nodeX(i) + NODE_W + 12" :y="Y + NODE_H / 2 + 4" fill="var(--text-faint)" font-size="11">∅</text>
        </template>

        <!-- bypass arc (delete) : prev jumps over deleted node -->
        <path
          v-if="view.bypass === i && i > 0"
          :d="`M ${nodeX(i - 1) + NODE_W - 11} ${Y + NODE_H / 2} C ${nodeX(i - 1) + NODE_W + 30} ${Y - 42}, ${nodeX(i + 1) - 40} ${Y - 42}, ${i + 1 < view.nodes.length ? nodeX(i + 1) - 6 : nodeX(i) + NODE_W + 40} ${i + 1 < view.nodes.length ? Y + NODE_H / 2 : Y - 10}`"
          fill="none" stroke="var(--viz-active)" stroke-width="1.5" marker-end="url(#ll-arrow-hot)"
        />
        <line
          v-if="view.bypass === i && i === 0"
          :x1="46" :y1="Y + NODE_H / 2 - 8"
          :x2="i + 1 < view.nodes.length ? nodeX(i + 1) - 6 : 60" :y2="Y + NODE_H / 2 - 8"
          stroke="var(--viz-active)" stroke-width="1.5" marker-end="url(#ll-arrow-hot)"
        />
      </g>

      <!-- floating new node -->
      <g v-if="view.floating">
        <rect
          :x="nodeX(view.floating.afterIdx) + NODE_W + GAP / 2 - NODE_W / 2" :y="FLOAT_Y"
          :width="NODE_W" :height="NODE_H" rx="4"
          fill="var(--bg3)" stroke="var(--viz-active)" stroke-width="1.5" stroke-dasharray="4 3"
        />
        <text
          :x="nodeX(view.floating.afterIdx) + NODE_W + GAP / 2 - 11"
          :y="FLOAT_Y + NODE_H / 2 + 5" text-anchor="middle" fill="var(--viz-active)" font-size="14"
        >{{ view.floating.v }}</text>
        <!-- new.next -->
        <path
          v-if="view.floating.linkNext"
          :d="`M ${nodeX(view.floating.afterIdx) + NODE_W + GAP / 2 + NODE_W / 2 - 10} ${FLOAT_Y + 8} C ${nodeX(view.floating.afterIdx + 1) - 20} ${FLOAT_Y}, ${nodeX(view.floating.afterIdx + 1)} ${Y + NODE_H + 30}, ${nodeX(view.floating.afterIdx + 1) + 10} ${Y + NODE_H + 4}`"
          fill="none" stroke="var(--viz-done)" stroke-width="1.5" marker-end="url(#ll-arrow-hot)"
        />
        <!-- prev.next = new -->
        <path
          v-if="view.floating.linkPrev && view.floating.afterIdx >= 0"
          :d="`M ${nodeX(view.floating.afterIdx) + NODE_W - 11} ${Y + NODE_H} C ${nodeX(view.floating.afterIdx) + NODE_W} ${FLOAT_Y - 10}, ${nodeX(view.floating.afterIdx) + NODE_W} ${FLOAT_Y - 6}, ${nodeX(view.floating.afterIdx) + NODE_W + GAP / 2 - NODE_W / 2 - 4} ${FLOAT_Y + 14}`"
          fill="none" stroke="var(--viz-active)" stroke-width="1.5" marker-end="url(#ll-arrow-hot)"
        />
      </g>
    </svg>

    <template #state>
      <div class="note">
        <strong>The core trade-off vs arrays:</strong> no contiguous memory means no O(1) indexing, so
        you must walk pointer by pointer. In exchange, inserting or deleting is just rewiring one or two
        pointers, with zero shifting. Great when you're always working near the head (LRU caches,
        adjacency lists, undo chains).
      </div>
    </template>
  </VisualizerShell>
</template>
