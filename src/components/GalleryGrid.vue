<template>
  <div class="gallery-grid">
    <div
      v-for="(item, idx) in items"
      :key="keyFor(item)"
      class="gallery-item"
      :class="{ 'gallery-item-landscape': isLandscape(item) }"
    >
      <button
        class="gallery-img-wrap gallery-img-button"
        :style="styleFor(item)"
        @click="$emit('open', idx)"
      >
        <img
          v-if="item.img"
          :key="imgKey(item)"
          :src="item.img"
          :alt="item.title"
          loading="lazy"
          @load="$emit('record-aspect', keyFor(item), $event)"
          @error="$emit('img-error', $event, item)"
        />
        <div v-else class="gallery-placeholder">
          <span>{{ placeholderIcon }}</span>
          <span>{{ placeholderText }}</span>
        </div>
      </button>
      <div class="gallery-caption">
        <div class="gallery-caption-title">{{ item.title }}</div>
        <div class="gallery-caption-sub"><slot name="sub" :item="item" /></div>
      </div>
    </div>
    <div v-if="moreLabel" class="gallery-item add-more-card"><span>{{ moreLabel }}</span></div>
  </div>
</template>

<script>
export default {
  name: 'GalleryGrid',
  props: {
    items: { type: Array, default: () => [] },
    // the section's aspect-ratio map (key -> ratio), owned by the parent
    aspects: { type: Object, default: () => ({}) },
    // prefix for the aspect/lightbox key, e.g. the active photo place
    keyPrefix: { type: String, default: '' },
    // optional extra prefix to force <img> remount (e.g. theme mode)
    imgKeyPrefix: { type: String, default: '' },
    placeholderIcon: { type: String, default: '' },
    placeholderText: { type: String, default: '' },
    // when set, render the trailing "more coming" card
    moreLabel: { type: String, default: '' },
  },
  emits: ['open', 'record-aspect', 'img-error'],
  methods: {
    keyFor(item) {
      return this.keyPrefix ? `${this.keyPrefix}-${item.id}` : item.id
    },
    imgKey(item) {
      return this.imgKeyPrefix ? `${this.imgKeyPrefix}-${this.keyFor(item)}` : this.keyFor(item)
    },
    styleFor(item) {
      const ratio = this.aspects[this.keyFor(item)]
      return ratio ? { '--gallery-aspect': ratio } : null
    },
    isLandscape(item) {
      const ratio = this.aspects[this.keyFor(item)]
      return typeof ratio === 'number' && ratio > 1.15
    },
  },
}
</script>
