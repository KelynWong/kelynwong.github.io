<template>
  <p class="reveal-text">
    <template v-for="(part, i) in parts" :key="i"><a
        v-if="part.link"
        :href="part.href"
        class="reveal-word reveal-text-link"
        :style="{ animationDelay: `${part.delay}ms` }"
        @click.prevent="$emit('navigate', part.href)"
      >{{ part.token }}</a><span
        v-else-if="part.isWord"
        class="reveal-word"
        :style="{ animationDelay: `${part.delay}ms` }"
      >{{ part.token }}</span><template v-else>{{ part.token }}</template></template>
  </p>
</template>

<script>
// Renders text word-by-word and fades/rises each word in sequence the first time
// the paragraph scrolls into view. Whitespace tokens are preserved so wrapping and
// spacing read exactly like normal text. An optional `link` ({ phrase, href })
// turns one phrase into a clickable link (revealed as a single chunk).
export default {
  name: 'RevealText',
  emits: ['navigate'],
  props: {
    text: { type: String, default: '' },
    // ms between each word
    stagger: { type: Number, default: 35 },
    // ms before the first word starts (e.g. to wait for a previous paragraph)
    startDelay: { type: Number, default: 0 },
    // { phrase, href } — make `phrase` within the text a clickable link
    link: { type: Object, default: null },
  },
  computed: {
    parts() {
      const text = this.text || ''
      const phrase = this.link && this.link.phrase
      const idx = phrase ? text.indexOf(phrase) : -1

      // split into [before, link phrase, after] when a link phrase is present
      const segments =
        idx === -1
          ? [{ text, link: false }]
          : [
              { text: text.slice(0, idx), link: false },
              { text: phrase, link: true },
              { text: text.slice(idx + phrase.length), link: false },
            ]

      let wordIndex = 0
      const parts = []
      segments.forEach((segment) => {
        if (segment.link) {
          parts.push({
            token: segment.text,
            isWord: true,
            link: true,
            href: this.link.href,
            delay: this.startDelay + wordIndex * this.stagger,
          })
          wordIndex += 1
          return
        }
        segment.text
          .split(/(\s+)/)
          .filter((token) => token.length)
          .forEach((token) => {
            const isWord = /\S/.test(token)
            parts.push({
              token,
              isWord,
              link: false,
              delay: isWord ? this.startDelay + wordIndex * this.stagger : 0,
            })
            if (isWord) wordIndex += 1
          })
      })
      return parts
    },
  },
  mounted() {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      this.$el.classList.add('is-visible')
      return
    }

    this._observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    )
    this._observer.observe(this.$el)
  },
  unmounted() {
    if (this._observer) {
      this._observer.disconnect()
      this._observer = null
    }
  },
}
</script>
