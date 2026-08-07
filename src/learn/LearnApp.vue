<script setup>
import { ref, computed, onMounted } from 'vue'
import { route } from './router.js'
import { categories, findTopic } from './registry.js'
import HubPage from './components/HubPage.vue'
import CategoryPage from './components/CategoryPage.vue'
import TopicPage from './components/TopicPage.vue'

const themeMode = ref('dark')

function applyTheme(mode) {
  themeMode.value = mode === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', themeMode.value)
  document.documentElement.style.colorScheme = themeMode.value
  try { localStorage.setItem('themeMode', themeMode.value) } catch (e) {}
}

function toggleTheme() {
  applyTheme(themeMode.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  let saved = 'dark'
  try { saved = localStorage.getItem('themeMode') || 'dark' } catch (e) {}
  applyTheme(saved)
})

const currentTopic = computed(() => (route.value.topic ? findTopic(route.value.cat, route.value.topic) : null))
const currentCategory = computed(() => categories.find((c) => c.id === route.value.cat) || null)
</script>

<template>
  <div class="lrn-container">
    <nav class="lrn-nav">
      <div class="lrn-nav-left">
        <a class="lrn-logo" href="#/"><span class="prompt">&gt;_</span>Learn</a>
        <span v-if="currentTopic" class="lrn-crumb">
          <a href="#/">home</a><span class="sep">/</span>
          <a :href="`#/${currentCategory?.id}`">{{ currentCategory?.name.toLowerCase() }}</a><span class="sep">/</span>
          <span class="here">{{ currentTopic.title.toLowerCase() }}</span>
        </span>
        <span v-else-if="currentCategory" class="lrn-crumb">
          <a href="#/">home</a><span class="sep">/</span>
          <span class="here">{{ currentCategory.name.toLowerCase() }}</span>
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px">
        <a class="lrn-nav-link" href="/">_Portfolio</a>
        <button class="nav-theme-toggle" type="button" @click="toggleTheme" :aria-label="themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <span aria-hidden="true">{{ themeMode === 'dark' ? '☾' : '☀' }}</span>
        </button>
      </div>
    </nav>

    <TopicPage v-if="currentTopic" :key="currentTopic.id" :topic="currentTopic" :category="currentCategory" />
    <CategoryPage v-else-if="currentCategory" :key="currentCategory.id" :category="currentCategory" />
    <HubPage v-else />
  </div>
</template>
