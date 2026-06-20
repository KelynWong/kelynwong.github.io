<template>
  <div class="sec-header" v-reveal>
    <span class="sec-prefix">{{ prefix }}</span>
    <span class="sec-title">{{ title }}</span>
    <div class="sec-line"></div>
  </div>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    // e.g. "01."
    prefix: { type: String, required: true },
    // e.g. "_About Me"
    title: { type: String, required: true },
  },
}
</script>
