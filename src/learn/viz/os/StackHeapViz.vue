<script setup>
import { computed } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const player = usePlayer()

const PSEUDO = [
  'main():',
  '  int x = 5',
  '  Node* list = makeList()',
  '  int r = process(list, x)',
  '  // list goes out of scope',
  'makeList():',
  '  Node* a = alloc(Node{7})  // heap!',
  '  Node* b = alloc(Node{9})',
  '  a.next = b',
  '  return a  // the ADDRESS escapes',
  'process(list, n):',
  '  int sum = n + list.val',
  '  return sum',
]

const NODE_BYTES = 16
const ADDR = { 1: '0x10', 2: '0x20' }

function buildFrames() {
  const frames = []
  const stack = [] // [{ name, locals: [{ name, val, ptr }] }]
  const heap = [] // [{ id, addr, val, next }]

  const snap = (desc, line) => {
    // reachability: heap ids referenced by any stack local, plus next chains
    const reach = new Set()
    for (const fr of stack) for (const l of fr.locals) if (l.ptr) reach.add(l.ptr)
    let grew = true
    while (grew) {
      grew = false
      for (const h of heap) {
        if (reach.has(h.id) && h.next && !reach.has(h.next)) { reach.add(h.next); grew = true }
      }
    }
    frames.push({
      desc, line,
      stack: stack.map((fr, i) => ({
        name: fr.name,
        active: i === stack.length - 1,
        locals: fr.locals.map((l) => ({ ...l })),
      })),
      heap: heap.map((h) => ({ ...h, live: reach.has(h.id) })),
      depth: stack.length,
      bytes: heap.length * NODE_BYTES,
      reach: reach.size,
    })
  }

  snap('A process gets two memory regions: a STACK for function calls (managed automatically) and a HEAP for data you request with alloc. Watch who owns what, and for how long.', null)

  const main = { name: 'main', locals: [] }
  stack.push(main)
  snap('Calling main() pushes a stack frame: a box of memory that lives exactly as long as the call does.', 0)

  main.locals.push({ name: 'x', val: '5', ptr: null })
  snap('int x = 5: the value 5 is stored INSIDE main\'s frame. Stack allocation is just bumping a pointer, nearly free, and it is freed automatically on return.', 1)

  const mk = { name: 'makeList', locals: [] }
  stack.push(mk)
  snap('main() calls makeList(): a new frame is pushed ON TOP. main is paused underneath with its locals intact; the stack grows upward.', 2)

  heap.push({ id: 1, addr: '0x10', val: 7, next: null })
  mk.locals.push({ name: 'a', val: '0x10', ptr: 1 })
  snap('alloc(Node{7}) asks the HEAP for 16 bytes and returns an ADDRESS, 0x10. The node itself lives on the heap; only the small pointer a lives on the stack.', 6)

  heap.push({ id: 2, addr: '0x20', val: 9, next: null })
  mk.locals.push({ name: 'b', val: '0x20', ptr: 2 })
  snap('A second alloc returns 0x20. Heap blocks sit wherever the allocator finds room, and nothing frees them automatically.', 7)

  heap[0].next = 2
  snap('a.next = b writes the address 0x20 into block 0x10. The heap now holds its own internal pointer: a 2-node linked list that exists independently of any function.', 8)

  snap('return a: what returns to the caller is the ADDRESS 0x10, a small value copied like any other. The nodes themselves never move.', 9)

  stack.pop()
  main.locals.push({ name: 'list', val: '0x10', ptr: 1 })
  snap('makeList\'s frame is popped: locals a and b are gone forever. But the heap blocks SURVIVE, and the returned address now lives in main\'s list. Outliving your creator is the whole point of the heap.', 2)

  const pr = { name: 'process', locals: [] }
  pr.locals.push({ name: 'list', val: '0x10', ptr: 1 })
  pr.locals.push({ name: 'n', val: '5', ptr: null })
  stack.push(pr)
  snap('main() calls process(list, x). Arguments are COPIED into the new frame: a second pointer to the same block 0x10, and the value 5. Two arrows, one block.', 3)

  pr.locals.push({ name: 'sum', val: '12', ptr: null })
  snap('sum = n + list.val: the CPU follows the pointer to 0x10 (dereferencing) and reads val 7, so sum = 5 + 7 = 12. sum is a plain stack local, cheap and temporary.', 11)

  snap('return sum: 12 is copied back to main, and everything process owns is about to vanish.', 12)

  stack.pop()
  snap('process\'s frame is popped, taking its pointer copy with it. Block 0x10 is still reachable, because main\'s list still holds the address.', 3)

  main.locals.pop() // drop list
  snap('main is done with the list and the variable goes out of scope. NO stack local stores 0x10 anymore, so both heap blocks just became unreachable (orange).', 4)

  stack.pop()
  snap('In C nobody called free(): those 32 bytes are LEAKED until the process exits. A garbage-collected language instead finds exactly these orphaned blocks and reclaims them. See the Garbage Collection topic to watch that happen.', 4)

  player.setFrames(frames)
}

buildFrames()

const view = computed(() => player.frame.value || { stack: [], heap: [], depth: 0, bytes: 0, reach: 0 })

const layout = computed(() => {
  const v = view.value
  const frames = []
  let yBottom = 302
  for (const fr of v.stack) {
    const h = 28 + fr.locals.length * 22 + 4
    const yTop = yBottom - h
    frames.push({
      name: fr.name,
      active: fr.active,
      x: 28, y: yTop, w: 194, h,
      locals: fr.locals.map((l, j) => ({ ...l, cy: yTop + 28 + j * 22 + 11 })),
    })
    yBottom = yTop - 6
  }
  const HEAP_Y = { 1: 46, 2: 168 }
  const blocks = v.heap.map((b) => ({ ...b, x: 344, y: HEAP_Y[b.id], w: 168, h: 64 }))
  const byId = {}
  for (const b of blocks) byId[b.id] = b
  const ptrs = []
  for (const fr of frames) {
    for (const l of fr.locals) {
      if (l.ptr && byId[l.ptr]) {
        ptrs.push({ key: fr.name + '.' + l.name, x1: 224, y1: l.cy, x2: 338, y2: byId[l.ptr].y + 32, active: fr.active })
      }
    }
  }
  const nexts = []
  for (const b of blocks) {
    if (b.next && byId[b.next]) {
      const t = byId[b.next]
      nexts.push({
        key: b.addr,
        d: `M ${b.x + b.w} ${b.y + 48} C ${b.x + b.w + 38} ${b.y + 48}, ${t.x + t.w + 38} ${t.y + 10}, ${t.x + t.w} ${t.y + 14}`,
        orphan: !b.live,
      })
    }
  }
  return { frames, blocks, ptrs, nexts }
})

const legend = [
  ['active stack frame', '--viz-active'],
  ['live heap block (reachable)', '--viz-done'],
  ['orphaned heap block (leak)', '--viz-compare'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <span class="cell-idx">a tiny C program: main() builds a heap list in makeList(), reads it in process(), then forgets it. Press play.</span>
    </template>

    <svg class="viz-svg" viewBox="0 0 560 322" style="max-width: 560px; margin: 0 auto">
      <defs>
        <marker id="shPtr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-active)" />
        </marker>
        <marker id="shPtrDim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
        <marker id="shNext" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-special)" />
        </marker>
        <marker id="shNextOrphan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-compare)" />
        </marker>
      </defs>

      <text x="28" y="18" fill="var(--text-faint)" font-size="11" letter-spacing="1.5">STACK (grows up)</text>
      <text x="344" y="18" fill="var(--text-faint)" font-size="11" letter-spacing="1.5">HEAP</text>
      <line x1="28" y1="306" x2="222" y2="306" stroke="var(--border2)" stroke-width="2" />
      <text v-if="!layout.frames.length" x="125" y="290" text-anchor="middle" fill="var(--text-faint)" font-size="11">(no frames yet)</text>
      <text v-if="!layout.blocks.length" x="428" y="80" text-anchor="middle" fill="var(--text-faint)" font-size="11">(nothing allocated)</text>

      <g v-for="fr in layout.frames" :key="fr.name">
        <rect
          :x="fr.x" :y="fr.y" :width="fr.w" :height="fr.h" rx="6"
          fill="var(--bg2)"
          :stroke="fr.active ? 'var(--viz-active)' : 'var(--border2)'"
          :stroke-width="fr.active ? 2 : 1.4"
        />
        <text :x="fr.x + 10" :y="fr.y + 18" :fill="fr.active ? 'var(--viz-active)' : 'var(--text-dim)'" font-size="12" font-weight="700">{{ fr.name }}()</text>
        <text
          v-for="l in fr.locals" :key="l.name"
          :x="fr.x + 18" :y="l.cy + 4"
          :fill="l.ptr ? 'var(--viz-active)' : 'var(--text)'"
          font-size="11.5" style="font-family: var(--mono)"
        >{{ l.name }} = {{ l.val }}</text>
      </g>

      <g v-for="b in layout.blocks" :key="b.id">
        <text :x="b.x" :y="b.y - 6" fill="var(--text-faint)" font-size="10" style="font-family: var(--mono)">{{ b.addr }} · 16 bytes</text>
        <rect
          :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="6"
          fill="var(--bg2)"
          :stroke="b.live ? 'var(--viz-done)' : 'var(--viz-compare)'"
          stroke-width="2"
        />
        <text :x="b.x + 12" :y="b.y + 26" fill="var(--text)" font-size="11.5" style="font-family: var(--mono)">val: {{ b.val }}</text>
        <text :x="b.x + 12" :y="b.y + 50" :fill="b.next ? 'var(--viz-special)' : 'var(--text-dim)'" font-size="11.5" style="font-family: var(--mono)">next: {{ b.next ? ADDR[b.next] : 'null' }}</text>
        <text v-if="!b.live" :x="b.x + b.w - 10" :y="b.y + 26" text-anchor="end" fill="var(--viz-compare)" font-size="10" font-weight="700">orphaned</text>
      </g>

      <line
        v-for="p in layout.ptrs" :key="p.key"
        :x1="p.x1" :y1="p.y1" :x2="p.x2" :y2="p.y2"
        :stroke="p.active ? 'var(--viz-active)' : 'var(--text-dim)'"
        stroke-width="1.8"
        :marker-end="p.active ? 'url(#shPtr)' : 'url(#shPtrDim)'"
      />
      <path
        v-for="nx in layout.nexts" :key="nx.key"
        :d="nx.d" fill="none"
        :stroke="nx.orphan ? 'var(--viz-compare)' : 'var(--viz-special)'"
        stroke-width="1.8"
        :marker-end="nx.orphan ? 'url(#shNextOrphan)' : 'url(#shNext)'"
      />
    </svg>

    <template #state>
      <div class="panel">
        <div class="panel-title">memory meters</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="{ active: view.depth > 0 }">stack depth: {{ view.depth }}</span>
            <span class="chip" :class="{ active: view.bytes > 0 }">heap bytes: {{ view.bytes }}</span>
            <span class="chip" :class="view.heap.length && view.reach < view.heap.length ? 'muted' : { done: view.reach > 0 }">reachable blocks: {{ view.reach }} / {{ view.heap.length }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Two lifetimes, two regions.</strong> The stack is automatic, fast, and fixed-size: locals
        die with their function, and too-deep recursion hits the limit as a stack overflow. The heap is
        flexible and survives calls, but someone must free it: you (C) or a garbage collector, and
        exhausting it means out-of-memory. This split is also why closures capture variables to the heap:
        the captured value must outlive the frame that created it.
      </div>
    </template>
  </VisualizerShell>
</template>
