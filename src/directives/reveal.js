// Scroll-reveal directive: fades + slides an element into view the first time it
// crosses the viewport. Registered globally in entry.js so any component can use it.
//   Usage:  v-reveal              (fade up)
//           v-reveal.left         (slide in from the left)
//           v-reveal.right        (slide in from the right)
//           v-reveal="{ delay: 120 }"   (stagger, ms)
export const reveal = {
  mounted(el, binding) {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      el.classList.add('reveal', 'is-visible')
      return
    }

    el.classList.add('reveal')
    if (binding.modifiers.left) el.classList.add('reveal-left')
    if (binding.modifiers.right) el.classList.add('reveal-right')
    if (binding.modifiers.pop) el.classList.add('reveal-pop')
    const delay = binding.value && binding.value.delay
    if (delay) el.style.animationDelay = `${delay}ms`

    // For pop reveals (project cards), strip the reveal classes once the animation
    // finishes so the element returns to its natural state — otherwise the
    // animation's fill keeps holding `transform`, blocking the card's hover lift.
    if (binding.modifiers.pop) {
      const onAnimationEnd = (event) => {
        if (event.animationName !== 'reveal-pop') return
        el.classList.remove('reveal', 'is-visible', 'reveal-pop')
        el.style.animationDelay = ''
        el.removeEventListener('animationend', onAnimationEnd)
        el._revealAnimEnd = null
      }
      el.addEventListener('animationend', onAnimationEnd)
      el._revealAnimEnd = onAnimationEnd
    }

    const observer = new IntersectionObserver(
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
    observer.observe(el)
    el._revealObserver = observer
  },
  unmounted(el) {
    if (el._revealObserver) {
      el._revealObserver.disconnect()
      el._revealObserver = null
    }
    if (el._revealAnimEnd) {
      el.removeEventListener('animationend', el._revealAnimEnd)
      el._revealAnimEnd = null
    }
  },
}

export default reveal
