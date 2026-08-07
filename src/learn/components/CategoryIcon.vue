<script setup>
defineProps({
  cat: { type: String, required: true },
  size: { type: Number, default: 64 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <!-- data structures: cascading layers of data -->
    <template v-if="cat === 'ds'">
      <rect x="6" y="7" width="30" height="9" rx="2.5" stroke="var(--accent1)" stroke-width="2" />
      <rect x="11" y="19.5" width="30" height="9" rx="2.5" stroke="var(--accent3)" stroke-width="2" />
      <rect x="6" y="32" width="30" height="9" rx="2.5" stroke="var(--code4)" stroke-width="2" />
      <circle cx="41" cy="11.5" r="2" fill="var(--accent1)" />
      <circle cx="6" cy="24" r="2" fill="var(--accent3)" />
      <circle cx="41" cy="36.5" r="2" fill="var(--code4)" />
    </template>

    <!-- algorithms: sorting bars with a step-through arrow -->
    <template v-else-if="cat === 'algo'">
      <rect x="7" y="28" width="8" height="13" rx="2" stroke="var(--accent3)" stroke-width="2" />
      <rect x="20" y="20" width="8" height="21" rx="2" stroke="var(--accent1)" stroke-width="2" />
      <rect x="33" y="11" width="8" height="30" rx="2" stroke="var(--code4)" stroke-width="2" />
      <path d="M9 22 Q 22 2 38 6" stroke="var(--code5)" stroke-width="2" stroke-linecap="round" />
      <path d="M33.5 4.5 L 38 6 L 36 10.5" stroke="var(--code5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- cloud architecture: cloud with connected nodes -->
    <template v-else-if="cat === 'cloud'">
      <path
        d="M36 34 H 13.5 a 8 8 0 1 1 1.8 -15.8 A 11 11 0 0 1 36.5 20 a 7 7 0 0 1 -0.5 14 z"
        stroke="var(--accent1)" stroke-width="2" stroke-linejoin="round"
      />
      <path d="M19 27 L 25.5 22.5 L 31 27.5" stroke="var(--text-dim)" stroke-width="1.6" />
      <circle cx="19" cy="27" r="2.4" fill="var(--accent3)" />
      <circle cx="25.5" cy="22.5" r="2.4" fill="var(--code5)" />
      <circle cx="31" cy="27.5" r="2.4" fill="var(--code4)" />
      <path d="M17 42 h4 M25 42 h4 M33 42 h4" stroke="var(--text-dim)" stroke-width="2" stroke-linecap="round" />
      <path d="M19 34 v8 M27 34 v8 M35 34 v8" stroke="var(--text-faint)" stroke-width="1.4" stroke-dasharray="2 3" />
    </template>

    <!-- concurrency: two threads weaving past each other -->
    <template v-else-if="cat === 'concurrency'">
      <path d="M8 12 C 20 12, 28 36, 40 36" stroke="var(--accent1)" stroke-width="2.4" stroke-linecap="round" />
      <path d="M8 36 C 20 36, 28 12, 40 12" stroke="var(--accent3)" stroke-width="2.4" stroke-linecap="round" />
      <path d="M35.5 9 L 40 12 L 36.5 16" stroke="var(--accent3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M35.5 33 L 40 36 L 36.5 40" stroke="var(--accent1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <circle cx="24" cy="24" r="3.4" stroke="var(--code5)" stroke-width="2" />
    </template>

    <!-- databases: the classic cylinder -->
    <template v-else-if="cat === 'db'">
      <ellipse cx="24" cy="11" rx="15" ry="5.5" stroke="var(--accent1)" stroke-width="2" />
      <path d="M9 11 V 37 c 0 3 6.7 5.5 15 5.5 s 15 -2.5 15 -5.5 V 11" stroke="var(--accent1)" stroke-width="2" />
      <path d="M9 20 c 0 3 6.7 5.5 15 5.5 s 15 -2.5 15 -5.5" stroke="var(--accent3)" stroke-width="2" />
      <path d="M9 29 c 0 3 6.7 5.5 15 5.5 s 15 -2.5 15 -5.5" stroke="var(--code4)" stroke-width="2" />
    </template>

    <!-- networking: globe with routed path -->
    <template v-else-if="cat === 'net'">
      <circle cx="24" cy="24" r="17" stroke="var(--accent1)" stroke-width="2" />
      <ellipse cx="24" cy="24" rx="8" ry="17" stroke="var(--accent1)" stroke-width="1.4" />
      <path d="M7.5 19 h33 M7.5 29 h33" stroke="var(--accent1)" stroke-width="1.4" />
      <circle cx="13" cy="17" r="2.6" fill="var(--accent3)" />
      <circle cx="30" cy="14" r="2.6" fill="var(--code5)" />
      <circle cx="33" cy="32" r="2.6" fill="var(--code4)" />
      <path d="M15 18.5 L 28.5 14.8 M31 16.5 L 32.5 29.5" stroke="var(--text-dim)" stroke-width="1.6" stroke-dasharray="3 3" />
    </template>

    <!-- os fundamentals: cpu chip -->
    <template v-else-if="cat === 'os'">
      <rect x="13" y="13" width="22" height="22" rx="3" stroke="var(--accent1)" stroke-width="2" />
      <rect x="19.5" y="19.5" width="9" height="9" rx="1.5" stroke="var(--accent3)" stroke-width="2" />
      <path d="M18 13 V 6 M24 13 V 6 M30 13 V 6" stroke="var(--code4)" stroke-width="2" stroke-linecap="round" />
      <path d="M18 42 V 35 M24 42 V 35 M30 42 V 35" stroke="var(--code4)" stroke-width="2" stroke-linecap="round" />
      <path d="M13 18 H 6 M13 24 H 6 M13 30 H 6" stroke="var(--code5)" stroke-width="2" stroke-linecap="round" />
      <path d="M42 18 H 35 M42 24 H 35 M42 30 H 35" stroke="var(--code5)" stroke-width="2" stroke-linecap="round" />
    </template>

    <!-- git internals: branching commit graph -->
    <template v-else-if="cat === 'git'">
      <path d="M12 40 V 8" stroke="var(--text-dim)" stroke-width="2" />
      <path d="M12 28 C 12 20, 32 26, 32 16" stroke="var(--text-dim)" stroke-width="2" fill="none" />
      <circle cx="12" cy="8" r="4" stroke="var(--accent1)" stroke-width="2.2" fill="var(--bg)" />
      <circle cx="12" cy="24" r="4" stroke="var(--accent3)" stroke-width="2.2" fill="var(--bg)" />
      <circle cx="12" cy="40" r="4" stroke="var(--accent3)" stroke-width="2.2" fill="var(--bg)" />
      <circle cx="32" cy="14" r="4" stroke="var(--code4)" stroke-width="2.2" fill="var(--bg)" />
      <path d="M38 10 h6 M38 14 h6" stroke="var(--code4)" stroke-width="1.6" stroke-linecap="round" />
    </template>

    <!-- regex & strings: /.*/  with a matcher squiggle -->
    <template v-else-if="cat === 'regex'">
      <path d="M14 8 L 8 30" stroke="var(--code3)" stroke-width="2.4" stroke-linecap="round" />
      <path d="M40 8 L 34 30" stroke="var(--code3)" stroke-width="2.4" stroke-linecap="round" />
      <circle cx="18.5" cy="26" r="2.2" fill="var(--accent1)" />
      <path d="M26 14 v9 M21.5 16.2 l9 4.6 M30.5 16.2 l-9 4.6" stroke="var(--accent3)" stroke-width="2.2" stroke-linecap="round" />
      <path d="M8 39 q 4 -5 8 0 t 8 0 t 8 0 t 8 0" stroke="var(--code5)" stroke-width="2" stroke-linecap="round" />
    </template>
  </svg>
</template>
