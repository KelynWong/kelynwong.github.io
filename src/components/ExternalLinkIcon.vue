<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="external-icon"
    aria-hidden="true"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
</template>

<script>
export default {
  name: 'ExternalLinkIcon',
  props: {
    size: { type: [Number, String], default: 14 },
  },
}
</script>
