<script setup>
defineProps({
  topic: { type: Object, required: true },
  category: { type: Object, default: null },
})
</script>

<template>
  <div>
    <header class="topic-head">
      <h1>{{ topic.title }}</h1>
      <p class="topic-desc">{{ topic.blurb }}</p>
      <div class="topic-badges">
        <span v-for="[label, tone] in topic.badges" :key="label" class="badge" :class="tone">{{ label }}</span>
      </div>
    </header>

    <component :is="topic.component" v-if="topic.component" />
    <div v-else class="note">This visualizer is coming soon.</div>
  </div>
</template>
