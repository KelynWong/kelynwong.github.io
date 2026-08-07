<script setup>
import { computed } from 'vue'
import { topicsFor } from '../registry.js'
import CategoryIcon from './CategoryIcon.vue'

const props = defineProps({
  category: { type: Object, required: true },
})

const catTopics = computed(() => topicsFor(props.category.id))
</script>

<template>
  <div>
    <header class="cat-head">
      <div class="cat-head-icon"><CategoryIcon :cat="category.id" :size="58" /></div>
      <div>
        <h1>{{ category.name }}</h1>
        <p class="topic-desc">{{ category.tagline }}</p>
      </div>
    </header>

    <div class="topic-grid">
      <a
        v-for="t in catTopics"
        :key="t.id"
        :href="`#/${category.id}/${t.id}`"
        class="topic-card"
      >
        <h3>{{ t.title }}</h3>
        <p>{{ t.blurb }}</p>
        <div class="topic-badges">
          <span v-for="[label, tone] in t.badges" :key="label" class="badge" :class="tone">{{ label }}</span>
        </div>
      </a>
    </div>
  </div>
</template>
