<template>
  <div class="filter-pills" role="tablist">
    <button
      v-if="showAll"
      :class="[buttonClass, { active: active === 'all' } ]"
      @click="$emit('select', 'all', $event)"
      type="button"
    >
      {{ allLabel }}
    </button>

    <button
      v-for="item in items"
      :key="item.id || item.key || item"
      :class="[buttonClass, { active: active === (item.id || item.key || item) } ]"
      @click="$emit('select', item.id || item.key || item, $event)"
      :disabled="item.disabled"
      type="button"
    >
      <span class="pill-label">{{ item.label || item.name || item }}</span>
      <span v-if="showCounts && (item.count !== undefined)" class="pill-count">{{ item.count }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'FilterPills',
  props: {
    items: { type: Array, default: () => [] },
    active: { type: [String, Number], default: 'all' },
    showAll: { type: Boolean, default: false },
    allLabel: { type: String, default: 'All' },
    buttonClass: { type: String, default: 'ctab' },
    showCounts: { type: Boolean, default: false },
  },
}
</script>

<style scoped>
.filter-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pill-count { margin-left: 0.5rem; opacity: 0.8; font-size: 0.85em; }

@media (max-width: 820px) {
  .filter-pills {
    flex-wrap: nowrap;
    width: max-content;
  }
}
</style>
