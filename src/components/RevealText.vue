<template>
  <p class="reveal-text">
    <template v-for="(part, i) in parts" :key="i"><span
        v-if="part.isWord"
        class="reveal-word"
        :style="{ animationDelay: `${part.delay}ms` }"
      >{{ part.token }}</span><template v-else>{{ part.token }}</template></template>
  </p>
</template>

<script>
// Renders text word-by-word and fades/rises each word in sequence the first time
// the paragraph scrolls into view. Whitespace tokens are preserved so wrapping and
// spacing read exactly like normal text.
export default {
  name: 'RevealText',
  props: {
    text: { type: String, default: '' },
    // ms between each word
    stagger: { type: Number, default: 35 },
    // ms before the first word starts (e.g. to wait for a previous paragraph)
    startDelay: { type: Number, default: 0 },
  },
  computed: {
    parts() {
      const tokens = (this.text || '').split(/(\s+)/).filter((token) => token.length)
      let wordIndex = 0
      return tokens.map((token) => {
        const isWord = /\S/.test(token)
        const part = {
          token,
          isWord,
          delay: isWord ? this.startDelay + wordIndex * this.stagger : 0,
        }
        if (isWord) wordIndex += 1
        return part
      })
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
