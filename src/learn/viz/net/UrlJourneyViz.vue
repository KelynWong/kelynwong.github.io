<script setup>
import { computed, onMounted } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const player = usePlayer()

const PSEUDO = [
  'check local caches (browser, OS)',
  'resolve DNS: root -> TLD -> authoritative',
  'TCP 3-way handshake with the IP',
  'TLS handshake: encrypt the channel',
  'HTTP GET / and 200 response',
  'fetch subresources (CSS, JS, images)',
  'parse and render the page',
]

// ---- actor layout (SVG coordinates) ----
const BW = 96
const BH = 34
const ACTORS = {
  browser: { label: 'Browser', x: 80, y: 165 },
  os: { label: 'OS / cache', x: 218, y: 62 },
  resolver: { label: 'Recursive resolver', x: 368, y: 62 },
  root: { label: 'Root NS', x: 560, y: 30 },
  tld: { label: '.dev TLD NS', x: 560, y: 100 },
  auth: { label: 'Authoritative NS', x: 560, y: 170 },
  server: { label: 'Server 185.199.108.153', x: 430, y: 258 },
}

// ---- frame construction ----
function buildFrames() {
  const frames = []
  const arrows = [] // { id, from, to, label, phase, off }
  const log = []
  const actorState = {} // key -> '' | 'active' | 'done'
  let id = 0
  let clock = 0
  let rtts = 0
  let lock = false
  let page = false

  function focus(...keys) {
    for (const k of Object.keys(actorState)) if (actorState[k] === 'active') actorState[k] = 'done'
    keys.forEach((k) => { actorState[k] = 'active' })
  }

  function addLog(msg) {
    log.push({ t: `+${Math.round(clock)}ms`, msg })
  }

  function arrow(from, to, label, phase, off = 0) {
    arrows.push({ id: id++, from, to, label, phase, off })
  }

  function snap(desc, phase) {
    frames.push({
      desc,
      line: phase,
      lock,
      page,
      rtts,
      clock: Math.round(clock),
      actors: { ...actorState },
      // keep only the current and previous phase so the canvas stays readable;
      // previous-phase arrows render faded, current-phase render live
      arrows: arrows
        .filter((a) => a.phase >= phase - 1)
        .map((a, i, arr) => ({
          ...a,
          cls: a.phase < phase ? 'faded' : a.id === arrows[arrows.length - 1].id ? 'active' : 'recent',
        })),
      log: log.map((e) => ({ ...e })),
    })
  }

  // phase 0: local caches
  focus('browser')
  addLog('enter pressed on kelynwong.dev')
  snap('You type kelynwong.dev and press Enter. Nothing can be sent yet: the network routes packets to IP addresses, not names, so job one is turning this name into an IP.', 0)

  addLog('browser DNS cache: MISS')
  snap('The browser checks its own DNS cache first. A hit here would cost roughly 0ms and skip the entire DNS journey below. Today it is a miss.', 0)

  clock += 1
  arrow('browser', 'os', 'IP for kelynwong.dev?', 0, 8)
  focus('browser', 'os')
  addLog('OS cache + hosts file: MISS')
  snap('Next shortcut: the operating system. Its resolver cache and the hosts file both miss too. Every layer of this journey is a cache that can short-circuit the layers after it.', 0)

  // phase 1: DNS
  clock += 8
  arrow('os', 'resolver', 'recursive query: A kelynwong.dev?', 1, 8)
  focus('os', 'resolver')
  addLog('recursive query sent to resolver')
  snap('The OS forwards the question to its configured recursive resolver (your ISP, or a public one like 1.1.1.1). Recursive means the resolver promises to chase down the full answer itself.', 1)

  snap('The resolver checks ITS cache. For popular names this is almost always a hit, which is the whole point of sharing a resolver with thousands of users. Assume a cold cache so we see the full hierarchy once.', 1)

  clock += 12
  arrow('resolver', 'root', 'who handles .dev?', 1, 8)
  focus('resolver', 'root')
  addLog('asked a root nameserver')
  snap('No single server could hold every domain on earth, so DNS is a delegation hierarchy. The resolver starts at a root server; the 13 root addresses are baked into every resolver.', 1)

  clock += 12
  arrow('root', 'resolver', 'referral: try the .dev TLD servers', 1, 8)
  rtts++
  addLog('root referred us to .dev TLD')
  snap('The root does not know kelynwong.dev. It replies with a referral: the addresses of the .dev top-level-domain servers. Referrals instead of answers are what let the hierarchy scale.', 1)

  clock += 11
  arrow('resolver', 'tld', 'who is authoritative for kelynwong.dev?', 1, 8)
  focus('resolver', 'tld')
  snap('Down one level: the resolver asks the .dev TLD servers about kelynwong.dev.', 1)

  clock += 11
  arrow('tld', 'resolver', 'referral: ask ns1.kelynwong.dev', 1, 8)
  rtts++
  addLog('TLD referred us to the authoritative NS')
  snap('The TLD knows exactly one thing about this domain: which nameservers are authoritative for it. That mapping was created when the domain was registered.', 1)

  clock += 10
  arrow('resolver', 'auth', 'A record for kelynwong.dev?', 1, 8)
  focus('resolver', 'auth')
  snap('Final hop: the authoritative nameserver, the one that actually owns the records for this zone.', 1)

  clock += 10
  arrow('auth', 'resolver', 'A = 185.199.108.153, TTL 3600', 1, 8)
  rtts++
  addLog('got answer: 185.199.108.153')
  snap('The authoritative server returns the IP plus a TTL: everyone along the way is allowed to cache this answer for 3600 seconds.', 1)

  clock += 8
  arrow('resolver', 'os', 'answer (cached, TTL 3600)', 1, 24)
  arrow('browser', 'os', 'answer cached here too', 1, 24)
  focus('resolver', 'os', 'browser')
  addLog('answer cached at every layer')
  snap('The answer flows back and is cached at every hop: resolver, OS, browser. The next lookup, from you or anyone sharing this resolver, skips all three round trips. Caching is why DNS feels free.', 1)

  // phase 2: TCP
  clock += 12
  arrow('browser', 'server', 'SYN', 2, -16)
  focus('browser', 'server')
  addLog('TCP SYN sent to 185.199.108.153')
  snap('Now the browser can finally address the server. TCP first: a 3-way handshake so both sides agree to a connection and sync sequence numbers before any real data flows.', 2)

  clock += 12
  arrow('server', 'browser', 'SYN-ACK', 2, 0)
  snap('The server answers SYN-ACK: it accepts, and proves it received our SYN.', 2)

  clock += 12
  arrow('browser', 'server', 'ACK', 2, 16)
  rtts++
  addLog('TCP established (1 RTT)')
  snap('Final ACK: connection ESTABLISHED after one round trip. TCP gives us an ordered, reliable byte stream; everything above rides on it.', 2)

  // phase 3: TLS
  clock += 12
  arrow('browser', 'server', 'ClientHello: ciphers + key share', 3, -16)
  addLog('TLS ClientHello sent')
  snap('The connection works but anyone on the path could read it. TLS next: the browser offers its supported cipher suites and a key share.', 3)

  clock += 12
  arrow('server', 'browser', 'ServerHello + certificate', 3, 0)
  snap('The server picks a cipher and sends its certificate. The browser verifies the chain up to a trusted CA: this is the proof we reached the real kelynwong.dev and not an imposter on the same IP path.', 3)

  clock += 12
  arrow('browser', 'server', 'Finished (session keys derived)', 3, 16)
  rtts++
  lock = true
  addLog('TLS established: channel encrypted')
  snap('Both sides derive the same symmetric session keys; from here everything is encrypted (padlock). TLS 1.3 fits this into one extra round trip; older TLS needed two, and QUIC merges it with transport setup.', 3)

  // phase 4: HTTP
  clock += 14
  arrow('browser', 'server', 'GET /  host: kelynwong.dev', 4, -8)
  addLog('HTTP GET / sent')
  snap('At last, the actual request: GET / over the encrypted connection. Notice that everything up to now was pure setup, which is exactly what CDNs and connection reuse try to amortize.', 4)

  clock += 16
  arrow('server', 'browser', '200 OK + index.html', 4, 8)
  rtts++
  addLog('200 OK, HTML received')
  snap('The server (or a CDN edge) responds 200 with the HTML. Response headers like cache-control decide whether the browser may reuse this copy next visit without even asking.', 4)

  // phase 5: subresources
  focus('browser')
  snap('The browser parses the HTML top to bottom and discovers it needs more files: style.css, app.js, hero.jpg. Each one is another request.', 5)

  clock += 8
  arrow('browser', 'server', 'GET /style.css', 5, -20)
  arrow('browser', 'server', 'GET /app.js', 5, -4)
  arrow('browser', 'server', 'GET /hero.jpg', 5, 12)
  focus('browser', 'server')
  addLog('3 subresource requests in parallel')
  snap('It fetches them in PARALLEL over the same connection: HTTP/2 multiplexes many streams onto one TCP + TLS setup, so no new handshakes are paid.', 5)

  clock += 18
  arrow('server', 'browser', '200 x3  (cache-control: max-age)', 5, 28)
  rtts++
  addLog('assets received with caching headers')
  snap('Responses arrive with caching headers. On a repeat visit these come from browser cache in about 0ms; assets that never change get a year-long max-age plus a hashed filename.', 5)

  // phase 6: render
  focus('browser')
  page = true
  clock += 20
  addLog('DOM + CSSOM built')
  snap('HTML becomes the DOM tree and CSS becomes the CSSOM; together they form the render tree. JavaScript can modify both, which is why an undeferred script download can block rendering.', 6)

  clock += 15
  addLog(`first paint at ~${Math.round(clock)}ms`)
  snap(`Layout computes every box's position and size, paint fills in pixels, and the compositor puts it on screen. First paint lands at roughly ${Math.round(clock)}ms.`, 6)

  snap(`Done: ${rtts} round trips before a complete page. A CDN would shrink EVERY one of them by terminating DNS, TCP, TLS, and cache hits at an edge near you, and caching removes some round trips entirely.`, 6)

  player.setFrames(frames)
}

onMounted(buildFrames)

const view = computed(() => player.frame.value || { actors: {}, arrows: [], log: [], rtts: 0, clock: 0, lock: false, page: false })

// ---- arrow geometry (data-driven from actor positions) ----
function edgeTrim(dx, dy) {
  const tx = dx !== 0 ? BW / 2 / Math.abs(dx) : Infinity
  const ty = dy !== 0 ? BH / 2 / Math.abs(dy) : Infinity
  return Math.min(tx, ty) + 5
}

function arrowGeom(a) {
  const A = ACTORS[a.from]
  const B = ACTORS[a.to]
  let dx = B.x - A.x
  let dy = B.y - A.y
  const len = Math.hypot(dx, dy) || 1
  dx /= len
  dy /= len
  // canonical normal per unordered pair, so offsets are consistent both directions
  const flip = a.from < a.to ? 1 : -1
  const nx = -dy * flip
  const ny = dx * flip
  const off = a.off || 0
  const tA = edgeTrim(dx, dy)
  const tB = edgeTrim(dx, dy)
  const x1 = A.x + dx * tA + nx * off
  const y1 = A.y + dy * tA + ny * off
  const x2 = B.x - dx * tB + nx * off
  const y2 = B.y - dy * tB + ny * off
  return { x1, y1, x2, y2, lx: (x1 + x2) / 2, ly: (y1 + y2) / 2 - 5 }
}

const drawnArrows = computed(() =>
  (view.value.arrows || []).map((a) => {
    const g = arrowGeom(a)
    const s =
      a.cls === 'active'
        ? { stroke: 'var(--viz-active)', w: 2, marker: 'url(#uj-act)', op: 1, dash: '', showLabel: true, lfill: 'var(--viz-active)' }
        : a.cls === 'recent'
        ? { stroke: 'var(--text-dim)', w: 1.4, marker: 'url(#uj-dim)', op: 1, dash: '', showLabel: true, lfill: 'var(--text-dim)' }
        : { stroke: 'var(--border2)', w: 1, marker: 'url(#uj-fad)', op: 0.55, dash: '3 3', showLabel: false, lfill: 'var(--text-faint)' }
    return { key: a.id, label: a.label, ...g, ...s }
  })
)

function actorStroke(k) {
  const s = view.value.actors?.[k]
  if (s === 'active') return 'var(--viz-active)'
  if (s === 'done') return 'var(--viz-done)'
  return 'var(--border2)'
}

const legend = [
  ['talking now', '--viz-active'],
  ['already answered', '--viz-done'],
  ['earlier phase (faded)', '--border2'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>address bar</label>
      <span class="chip active" style="font-family: var(--mono)">https://kelynwong.dev</span>
      <span class="cell-idx">press play to hit Enter</span>
      <button class="btn btn-sm" style="margin-left: auto" @click="player.restart()">restart</button>
    </template>

    <svg class="viz-svg" viewBox="0 0 720 300">
      <defs>
        <marker id="uj-act" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--viz-active)" />
        </marker>
        <marker id="uj-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
        </marker>
        <marker id="uj-fad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border2)" />
        </marker>
      </defs>

      <!-- arrows -->
      <g v-for="a in drawnArrows" :key="a.key" :opacity="a.op">
        <line :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" :stroke="a.stroke" :stroke-width="a.w" :stroke-dasharray="a.dash" :marker-end="a.marker" />
        <text v-if="a.showLabel" :x="a.lx" :y="a.ly" text-anchor="middle" :fill="a.lfill" font-size="8.5">{{ a.label }}</text>
      </g>

      <!-- actors -->
      <g v-for="(pos, k) in ACTORS" :key="k">
        <rect
          :x="pos.x - BW / 2" :y="pos.y - BH / 2" :width="BW" :height="BH" rx="5"
          fill="var(--bg3)" :stroke="actorStroke(k)" stroke-width="1.8"
          :opacity="view.actors?.[k] ? 1 : 0.75"
        />
        <text :x="pos.x" :y="pos.y + 3.5" text-anchor="middle" :fill="view.actors?.[k] ? 'var(--text)' : 'var(--text-dim)'" font-size="9.5">
          {{ pos.label }}
        </text>
      </g>

      <!-- padlock once TLS is up -->
      <g v-if="view.lock" transform="translate(232, 190)">
        <path d="M -5 2 v -3 a 5 5 0 0 1 10 0 v 3" fill="none" stroke="var(--viz-done)" stroke-width="2" />
        <rect x="-8" y="2" width="16" height="12" rx="2.5" fill="var(--viz-done)" />
        <text x="16" y="12" fill="var(--viz-done)" font-size="9">encrypted</text>
      </g>

      <!-- mini rendered page -->
      <g v-if="view.page" transform="translate(120, 214)">
        <rect x="0" y="0" width="92" height="66" rx="4" fill="var(--bg2)" stroke="var(--viz-done)" stroke-width="1.6" />
        <rect x="6" y="6" width="80" height="10" rx="2" fill="var(--viz-special)" opacity="0.7" />
        <rect x="6" y="22" width="52" height="5" rx="2" fill="var(--text-dim)" opacity="0.6" />
        <rect x="6" y="31" width="66" height="5" rx="2" fill="var(--text-dim)" opacity="0.45" />
        <rect x="6" y="40" width="44" height="5" rx="2" fill="var(--text-dim)" opacity="0.45" />
        <rect x="62" y="24" width="24" height="21" rx="2" fill="var(--viz-done)" opacity="0.55" />
        <rect x="6" y="51" width="72" height="5" rx="2" fill="var(--text-dim)" opacity="0.35" />
        <text x="46" y="78" text-anchor="middle" fill="var(--viz-done)" font-size="8.5">rendered</text>
      </g>
    </svg>

    <template #state>
      <div class="panel">
        <div class="panel-title">totals</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip" :class="view.rtts ? 'active' : 'muted'">round trips: {{ view.rtts }}</span>
            <span class="chip" :class="view.clock ? 'active' : 'muted'">elapsed ~{{ view.clock }}ms</span>
            <span class="chip" :class="view.lock ? 'done' : 'muted'">{{ view.lock ? 'TLS on' : 'plaintext' }}</span>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">timeline log</div>
        <div class="state-body" style="display: flex; flex-direction: column; gap: 3px; font-size: var(--fs-3xs)">
          <div v-if="!view.log?.length" class="state-empty">nothing yet</div>
          <div v-for="(e, i) in view.log" :key="i" style="color: var(--text-dim)">
            <span style="color: var(--text-faint); font-family: var(--mono)">{{ e.t }}</span> {{ e.msg }}
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Lead:</strong> the interview answer in 5 beats: ① DNS turns the name into an IP
        (browser cache, OS cache, then resolver walks root, TLD, authoritative). ② TCP 3-way handshake
        to the IP. ③ TLS handshake to authenticate and encrypt. ④ HTTP request and response.
        ⑤ Browser parses, fetches subresources in parallel, and renders. Then name where caching
        short-circuits the journey: browser cache skips everything, resolver cache skips the DNS walk,
        and a CDN edge answers from a server milliseconds away instead of an origin oceans away.
      </div>
    </template>
  </VisualizerShell>
</template>
