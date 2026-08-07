import { ref, computed } from 'vue'

// Tiny hash router: '#/' -> hub, '#/<catId>/<topicId>' -> topic page.
const hash = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  hash.value = window.location.hash
  window.scrollTo({ top: 0 })
})

export const route = computed(() => {
  const parts = hash.value.replace(/^#\/?/, '').split('/').filter(Boolean)
  return { cat: parts[0] || null, topic: parts[1] || null }
})

export function navigate(path) {
  window.location.hash = path
}
