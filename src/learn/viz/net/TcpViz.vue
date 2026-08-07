<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const mode = ref('normal') // 'normal' | 'loss'
const player = usePlayer()

const PSEUDO = [
  'handshake: SYN / SYN-ACK / ACK',
  'transfer: data segments + cumulative ACKs',
  'loss: duplicate ACKs + RTO timer + retransmit',
  'teardown: FIN / ACK / FIN / ACK',
]

// ---- sequence diagram geometry ----
const CX = 150 // client lifeline x
const SX = 500 // server lifeline x
const TOP = 64 // y of first message
const ROW = 30 // vertical spacing per message
const SLANT = 12 // arrows slope downward to show travel time

// ---- frame construction: everything is derived from a message list ----
function makeBuilder() {
  const frames = []
  const msgs = [] // { type:'msg'|'ev', from, label, t, lost, side }
  let t = 0
  const st = { c: 'CLOSED', s: 'LISTEN', bytes: 0, timer: null }

  function snap(desc, line) {
    frames.push({
      desc,
      line,
      cState: st.c,
      sState: st.s,
      bytes: st.bytes,
      timer: st.timer,
      msgs: msgs.map((m, i) => ({ ...m, active: i === msgs.length - 1 })),
      rows: 0, // filled in by finish()
    })
  }

  function msg(from, label, opts = {}) {
    msgs.push({ type: 'msg', from, label, t: t++, lost: false, ...opts })
  }

  function ev(side, label) {
    msgs.push({ type: 'ev', side, label, t: t++ })
  }

  function finish() {
    for (const fr of frames) fr.rows = t
    player.setFrames(frames)
  }

  return { frames, snap, msg, ev, st, finish }
}

function buildNormal() {
  const b = makeBuilder()
  const { snap, msg, st } = b

  snap('A TCP connection starts asymmetric: the server sits in LISTEN, passively waiting, and the client initiates. Watch the numbers on each arrow: sequence numbers count BYTES, not packets.', 0)

  msg('c', 'SYN seq=100')
  st.c = 'SYN_SENT'
  snap('The client sends SYN with a random initial sequence number, here 100. It means: my byte stream starts counting at 100. A random ISN makes stale or forged segments hard to confuse with this connection.', 0)

  msg('s', 'SYN-ACK seq=300 ack=101')
  st.s = 'SYN_RCVD'
  snap('The server answers two things at once. ack=101 proves it RECEIVED the SYN (the SYN consumes one sequence number, so the next expected byte is 101), and its own SYN proposes 300 for its stream.', 0)

  msg('c', 'ACK ack=301')
  st.c = 'ESTABLISHED'
  st.s = 'ESTABLISHED'
  snap('Why three messages and not two? Each side must prove it can both send AND receive. The SYN-ACK gave the client that proof for both directions; this final ACK gives the server proof its own SYN made it across.', 0)

  msg('c', 'seq=101, 100 bytes')
  snap('Data flows. This segment carries bytes 101 through 200: the seq number labels the FIRST byte in the segment and the length implies the rest.', 1)

  msg('s', 'ACK ack=201')
  st.bytes = 100
  snap('ack=201 means: I hold every byte up to 200, send 201 next. ACKs are cumulative, so one number summarizes everything received in order so far.', 1)

  msg('c', 'seq=201, 100 bytes')
  snap('Next segment starts exactly where the last one ended: seq=201. The sender keeps a copy of every unacknowledged byte, just in case.', 1)

  msg('s', 'ACK ack=301')
  st.bytes = 200
  snap('Notice the arithmetic: each 100-byte segment advances the ACK by exactly 100. If TCP counted packets instead of bytes, a split or coalesced segment would wreck the bookkeeping.', 1)

  msg('c', 'seq=301, 100 bytes')
  snap('Third segment, bytes 301 through 400.', 1)

  msg('s', 'ACK ack=401')
  st.bytes = 300
  snap('300 bytes delivered and acknowledged. These same ACKs also pace the sender: flow control and congestion control both ride on this feedback loop.', 1)

  msg('c', 'FIN seq=401')
  st.c = 'FIN_WAIT_1'
  snap('Closing is a negotiation too. FIN says: I have nothing more to send. Like SYN, it consumes one sequence number.', 3)

  msg('s', 'ACK ack=402')
  st.s = 'CLOSE_WAIT'
  st.c = 'FIN_WAIT_2'
  snap('The server ACKs the FIN but may still have data of its own to flush. This half-closed state is why a clean teardown takes four messages, not two.', 3)

  msg('s', 'FIN seq=301')
  st.s = 'LAST_ACK'
  snap('When the server is done, it sends its own FIN.', 3)

  msg('c', 'ACK ack=302')
  st.c = 'TIME_WAIT'
  st.s = 'CLOSED'
  snap('The client ACKs and lingers in TIME_WAIT (about two max-segment-lifetimes) so it can re-ACK if this last packet is lost, and so stray old segments die off before the port is reused.', 3)

  st.c = 'CLOSED'
  snap('Full lifecycle: 3 packets to open, 4 to close, and in between every byte accounted for by seq/ack arithmetic. An ordered, reliable stream built on top of an unreliable packet network.', 3)

  b.finish()
}

function buildLoss() {
  const b = makeBuilder()
  const { snap, msg, ev, st } = b

  snap('Same connection, but this time the network will drop a segment. TCP assumes an UNRELIABLE network: packets can silently vanish and nobody sends an error. Watch how ACKs plus a timer detect it.', 0)

  msg('c', 'SYN seq=100')
  st.c = 'SYN_SENT'
  snap('Handshake as before: SYN with initial sequence number 100.', 0)

  msg('s', 'SYN-ACK seq=300 ack=101')
  st.s = 'SYN_RCVD'
  snap('SYN-ACK: the server acknowledges byte 100 and proposes its own ISN of 300.', 0)

  msg('c', 'ACK ack=301')
  st.c = 'ESTABLISHED'
  st.s = 'ESTABLISHED'
  snap('ACK completes the handshake; both sides are ESTABLISHED.', 0)

  msg('c', 'seq=101, 100 bytes')
  snap('Segment 1: bytes 101 through 200. Arrives fine.', 1)

  msg('s', 'ACK ack=201')
  st.bytes = 100
  snap('Acknowledged: ack=201, meaning everything up to byte 200 is safely delivered.', 1)

  msg('c', 'seq=201, 100 bytes', { lost: true })
  st.timer = 4
  snap('Segment 2 is DROPPED by a congested router mid-path. Crucially, nothing announces this: the sender only learns about loss from what does NOT happen. It armed a retransmission timer (RTO) when it sent the segment.', 2)

  msg('c', 'seq=301, 100 bytes')
  st.timer = 3
  snap('The sender does not know yet, so it keeps going and transmits segment 3 (bytes 301 through 400).', 2)

  msg('s', 'dup ACK ack=201')
  st.timer = 2
  snap('The server received bytes 301-400 but is MISSING 201-300. A cumulative ACK can only vouch for contiguous data, so it repeats ack=201. Duplicate ACKs are the receiver shouting: I am still waiting for byte 201.', 2)

  ev('c', 'RTO timer: 1')
  st.timer = 1
  snap('Real TCP would already resend after three duplicate ACKs (fast retransmit). Our simple sender waits on its timer, which keeps counting down while no ACK covers byte 201.', 2)

  ev('c', 'RTO expired!')
  st.timer = 0
  snap('Timeout. No ACK ever advanced past 201, so the sender concludes segment 2 is gone. This is the core trick of reliability: keep a copy of everything unacked, and retransmit until acknowledged.', 2)

  msg('c', 'RETRANSMIT seq=201, 100 bytes')
  st.timer = null
  snap('The sender retransmits bytes 201-300 from its buffer. Meanwhile the receiver has been holding bytes 301-400 out of order this whole time, waiting to fill the hole.', 2)

  msg('s', 'ACK ack=401')
  st.bytes = 300
  snap('The hole is filled, so the cumulative ACK JUMPS straight to 401: one ACK covers both the retransmitted segment and the buffered one. All 300 bytes delivered, in order, despite the loss.', 2)

  snap('That is TCP in one picture: sequence numbers detect gaps and restore order, ACKs confirm delivery, timers recover from silence. The application above sees only a clean byte stream.', 2)

  b.finish()
}

watchEffect(() => {
  if (mode.value === 'normal') buildNormal()
  else buildLoss()
})

const view = computed(
  () => player.frame.value || { msgs: [], cState: 'CLOSED', sState: 'LISTEN', bytes: 0, timer: null, rows: 10 }
)

const svgH = computed(() => TOP + view.value.rows * ROW + 20)

// project each message onto coordinates; purely derived from the frame data
const drawn = computed(() =>
  (view.value.msgs || []).map((m, idx) => {
    const y1 = TOP + m.t * ROW
    if (m.type === 'ev') {
      return { key: idx, type: 'ev', x: CX - 14, y: y1 + 8, label: m.label }
    }
    const c2s = m.from === 'c'
    const x1 = c2s ? CX + 6 : SX - 6
    const midX = (CX + SX) / 2
    const x2 = m.lost ? midX + (c2s ? 30 : -30) : c2s ? SX - 6 : CX + 6
    const y2 = m.lost ? y1 + SLANT / 2 + 2 : y1 + SLANT
    const color = m.lost ? 'var(--viz-compare)' : m.active ? 'var(--viz-active)' : 'var(--text-dim)'
    return {
      key: idx,
      type: 'msg',
      x1, y1, x2, y2,
      lx: (x1 + x2) / 2,
      ly: (y1 + y2) / 2 - 6,
      label: m.label,
      color,
      w: m.active || m.lost ? 2 : 1.4,
      lost: m.lost,
      marker: m.lost ? '' : m.active ? 'url(#tcp-act)' : 'url(#tcp-dim)',
    }
  })
)

const legend = [
  ['current segment', '--viz-active'],
  ['lost packet', '--viz-compare'],
  ['timer / warning', '--viz-warn'],
]

function stateChip(s) {
  if (s === 'ESTABLISHED') return 'done'
  if (s === 'CLOSED' || s === 'LISTEN') return 'muted'
  return 'active'
}
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <button class="btn" :class="{ 'btn-primary': mode === 'normal' }" @click="mode = 'normal'">handshake + data</button>
      <button class="btn" :class="{ 'btn-primary': mode === 'loss' }" @click="mode = 'loss'">packet loss</button>
      <span class="cell-idx" style="margin-left: auto">time flows downward</span>
    </template>

    <svg class="viz-svg" :viewBox="`0 0 700 ${svgH}`">
      <defs>
        <marker id="tcp-act" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-active)" />
        </marker>
        <marker id="tcp-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
      </defs>

      <!-- lifeline headers -->
      <g v-for="h in [{ x: CX, name: 'CLIENT', st: view.cState }, { x: SX, name: 'SERVER', st: view.sState }]" :key="h.name">
        <rect :x="h.x - 48" y="6" width="96" height="26" rx="5" fill="var(--bg3)" stroke="var(--border2)" stroke-width="1.5" />
        <text :x="h.x" y="23" text-anchor="middle" fill="var(--text)" font-size="11">{{ h.name }}</text>
        <text :x="h.x" y="46" text-anchor="middle" :fill="h.st === 'ESTABLISHED' ? 'var(--viz-done)' : 'var(--viz-active)'" font-size="9" style="font-family: var(--mono)">{{ h.st }}</text>
        <line :x1="h.x" y1="52" :x2="h.x" :y2="svgH - 8" stroke="var(--border2)" stroke-width="1.2" stroke-dasharray="4 4" />
      </g>

      <!-- messages and events -->
      <g v-for="d in drawn" :key="d.key">
        <template v-if="d.type === 'msg'">
          <line :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2" :stroke="d.color" :stroke-width="d.w" :marker-end="d.marker" />
          <text :x="d.lx" :y="d.ly" text-anchor="middle" :fill="d.color" font-size="9.5" style="font-family: var(--mono)">{{ d.label }}</text>
          <!-- lost packet: truncated arrow ends in an X -->
          <g v-if="d.lost" :stroke="'var(--viz-compare)'" stroke-width="2.2">
            <line :x1="d.x2 - 5" :y1="d.y2 - 5" :x2="d.x2 + 5" :y2="d.y2 + 5" />
            <line :x1="d.x2 - 5" :y1="d.y2 + 5" :x2="d.x2 + 5" :y2="d.y2 - 5" />
          </g>
        </template>
        <template v-else>
          <rect :x="d.x - 100" :y="d.y - 11" width="108" height="17" rx="8" fill="var(--bg3)" stroke="var(--viz-warn)" stroke-width="1.4" />
          <text :x="d.x - 46" :y="d.y + 1.5" text-anchor="middle" fill="var(--viz-warn)" font-size="9" style="font-family: var(--mono)">{{ d.label }}</text>
        </template>
      </g>
    </svg>

    <template #state>
      <div class="panel">
        <div class="panel-title">connection state</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="stateChip(view.cState)">client: {{ view.cState }}</span>
            <span class="chip" :class="stateChip(view.sState)">server: {{ view.sState }}</span>
            <span class="chip" :class="view.bytes ? 'done' : 'muted'">bytes acked: {{ view.bytes }}</span>
            <span v-if="view.timer !== null && view.timer !== undefined" class="chip active">RTO timer: {{ view.timer }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Lead:</strong> TCP sits between raw IP packets (unordered, unreliable, connectionless)
        and your application, manufacturing a reliable ordered byte stream out of seq numbers, ACKs,
        and timers. UDP skips all of that: no handshake, no ordering, no retransmit, which is why
        DNS, games, and video calls use it. QUIC (the transport under HTTP/3) rebuilds TCP's
        reliability on top of UDP so it can merge the transport and TLS handshakes into one round
        trip and avoid head-of-line blocking, where one lost TCP segment stalls every stream sharing
        the connection.
      </div>
    </template>
  </VisualizerShell>
</template>
