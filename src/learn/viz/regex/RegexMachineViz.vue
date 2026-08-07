<script setup>
import { ref, computed, watchEffect } from 'vue'
import VisualizerShell from '../../components/VisualizerShell.vue'
import { usePlayer } from '../../composables/usePlayer.js'

const patternIn = ref('a.*b')
const textIn = ref('axbxb')

const player = usePlayer()

const PSEUDO = [
  'match(tokens, text):    // full match',
  '  if no tokens left:',
  '    success iff no text left',
  '  tok = first token',
  '  if tok is quantified (* or +):',
  '    greedily grab as many chars as possible',
  '    try to match the rest…',
  '    …on failure, GIVE BACK one char',
  '    and retry (backtracking!)',
  '  else:',
  '    tok matches current char → advance both',
  '    otherwise → this branch fails',
]

const MAX_STEPS = 350

// pattern → tokens: {ch, quant} where ch is a literal or '.', quant in '' | '*' | '+' | '?'
function tokenize(p) {
  const toks = []
  for (let i = 0; i < p.length; i++) {
    const c = p[i]
    if ('*+?'.includes(c)) {
      if (!toks.length || toks[toks.length - 1].quant) return { error: `unexpected "${c}" at position ${i}` }
      toks[toks.length - 1].quant = c
      continue
    }
    if (!/[a-z0-9. ]/i.test(c)) return { error: `unsupported character "${c}": this mini-engine supports letters, digits, ".", "*", "+", "?"` }
    toks.push({ ch: c, quant: '' })
    if (toks.length > 10) return { error: 'pattern too long for this demo (max 10 tokens)' }
  }
  return { toks }
}

function label(t) { return t.ch + t.quant }

function buildFrames(p, s) {
  const frames = []
  const { toks, error } = tokenize(p)
  if (error) {
    player.setFrames([{ toks: [], s, pi: -1, si: -1, desc: `Pattern error: ${error}`, line: null, steps: 0, backtracks: 0 }])
    return
  }
  let steps = 0
  let backtracks = 0
  let capped = false

  const f = (desc, line, pi, si, ev = '') => {
    if (frames.length > MAX_STEPS + 5) return
    frames.push({ toks, s, pi, si, ev, desc, line, steps, backtracks })
  }

  const single = (t, c) => c !== undefined && (t.ch === '.' || t.ch === c)

  function match(pi, si) {
    steps++
    if (steps > MAX_STEPS) { capped = true; return false }
    if (pi === toks.length) {
      if (si === s.length) { f(`All tokens used AND all text consumed, so the match succeeds!`, 2, pi, si, 'ok'); return true }
      f(`All tokens used, but "${s.slice(si)}" is left over, so this branch fails.`, 2, pi, si, 'fail')
      return false
    }
    const t = toks[pi]
    if (t.quant === '*' || t.quant === '+') {
      // greedy: consume max run, then back off
      let max = 0
      while (single(t, s[si + max])) max++
      const min = t.quant === '+' ? 1 : 0
      f(`Token "${label(t)}" is greedy: it can match ${max} char${max === 1 ? '' : 's'} here. Grab all ${max} first.`, 5, pi, si + max, 'try')
      for (let k = max; k >= min; k--) {
        if (k < max) {
          backtracks++
          f(`BACKTRACK: "${label(t)}" gives back one char (now holding ${k}) and we retry the rest from position ${si + k}.`, 7, pi, si + k, 'back')
        }
        if (match(pi + 1, si + k)) return true
      }
      f(`"${label(t)}" has nothing left to give back, so this branch fails.`, 11, pi, si, 'fail')
      return false
    }
    if (t.quant === '?') {
      if (single(t, s[si])) {
        f(`Token "${label(t)}" is optional, so first try WITH it matching '${s[si]}'.`, 4, pi, si + 1, 'try')
        if (match(pi + 1, si + 1)) return true
        backtracks++
        f(`BACKTRACK: retry "${label(t)}" matching nothing.`, 7, pi, si, 'back')
      }
      return match(pi + 1, si)
    }
    if (single(t, s[si])) {
      f(`Token "${label(t)}" matches '${s[si]}' at position ${si}, so advance both pointers.`, 10, pi + 1, si + 1, 'ok')
      return match(pi + 1, si + 1)
    }
    f(`Token "${label(t)}" ${si >= s.length ? 'has no character left to match' : `can't match '${s[si]}'`}, so this branch fails.`, 11, pi, si, 'fail')
    return false
  }

  f(`Match pattern /${p}/ against "${s}" (full match). The engine walks both pointers forward, and rewinds them when a greedy guess turns out wrong.`, 0, 0, 0)
  const ok = match(0, 0)
  if (capped) {
    f(`Stopped after ${MAX_STEPS} steps! Patterns with stacked quantifiers (try a*a*a*b vs aaaaaa) explode combinatorially. This is "catastrophic backtracking", the cause of real-world regex outages.`, 8, -1, -1, 'fail')
  } else {
    f(ok
      ? `MATCH after ${steps} steps and ${backtracks} backtrack${backtracks === 1 ? '' : 's'}.`
      : `NO MATCH: every possible branch was tried (${steps} steps, ${backtracks} backtracks).`,
      2, -1, -1, ok ? 'ok' : 'fail')
  }
  player.setFrames(frames)
}

watchEffect(() => buildFrames(patternIn.value.slice(0, 14), textIn.value.slice(0, 12)))

function preset(p, t) { patternIn.value = p; textIn.value = t }

const view = computed(() => player.frame.value || { toks: [], s: '', pi: -1, si: -1 })

const legend = [
  ['current position', '--viz-active'],
  ['consumed so far', '--viz-done'],
  ['backtracking', '--viz-warn'],
  ['branch failed', '--viz-compare'],
]
</script>

<template>
  <VisualizerShell :player="player" :pseudocode="PSEUDO" :legend="legend">
    <template #inputs>
      <label>pattern</label>
      <input class="input" style="width: 110px" v-model="patternIn" />
      <label>text</label>
      <input class="input" style="width: 110px" v-model="textIn" />
      <span style="width: 6px"></span>
      <button class="btn btn-sm" @click="preset('a.*b', 'axbxb')">greedy backtrack</button>
      <button class="btn btn-sm" @click="preset('colou?r', 'color')">optional ?</button>
      <button class="btn btn-sm" @click="preset('a*a*a*b', 'aaaaaa')">catastrophic!</button>
    </template>

    <div style="display: flex; flex-direction: column; gap: 26px; align-items: center">
      <div style="display: flex; align-items: center; gap: 12px">
        <span class="cell-idx" style="width: 60px; text-align: right">pattern</span>
        <div class="cells">
          <div v-for="(t, i) in view.toks" :key="i" class="cellcol">
            <div
              class="cell"
              :class="i === view.pi ? (view.ev === 'back' ? 'special' : view.ev === 'fail' ? 'compare' : 'active') : i < view.pi ? 'done' : ''"
              style="min-width: 40px"
            >{{ label(t) }}</div>
          </div>
          <div v-if="view.pi === view.toks.length" class="cell ghost" style="min-width: 40px">✓</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px">
        <span class="cell-idx" style="width: 60px; text-align: right">text</span>
        <div class="cells">
          <div v-for="(c, i) in view.s.split('')" :key="i" class="cellcol">
            <div
              class="cell"
              :class="i < view.si ? 'done' : ''"
              style="min-width: 40px"
            >{{ c }}</div>
            <div class="cell-ptr" :class="view.ev === 'back' ? 'mid' : 'lo'">{{ i === view.si ? '▲' : '' }}</div>
          </div>
          <div class="cellcol">
            <div class="cell ghost" style="min-width: 40px">∅</div>
            <div class="cell-ptr lo">{{ view.si === view.s.length ? '▲' : '' }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #state>
      <div class="panel">
        <div class="panel-title">engine stats</div>
        <div class="state-body">
          <div class="state-chips">
            <span class="chip">steps: {{ view.steps ?? 0 }}</span>
            <span class="chip" :class="{ active: (view.backtracks ?? 0) > 0 }">backtracks: {{ view.backtracks ?? 0 }}</span>
          </div>
        </div>
      </div>
      <div class="note">
        <strong>Greedy + backtracking</strong> is how classic regex engines (Perl, Python, JavaScript)
        actually work: quantifiers grab as much as they can, then give characters back one at a time when
        the rest of the pattern can't match. Watch the ▲ pointer move <em>backwards</em>: that's the
        backtrack. The "catastrophic!" preset shows why nested quantifiers can hang production systems
        (ReDoS), and why engines like RE2 and Rust's regex forbid backtracking entirely.
      </div>
    </template>
  </VisualizerShell>
</template>
