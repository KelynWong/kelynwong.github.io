<template>
  <div class="vid-video-list">
    <div
      v-for="(row, rowIdx) in rows"
      :key="row[0]?.key || `vid-row-${rowIdx}`"
      class="vid-video-row"
    >
      <div
        v-for="group in row"
        :key="group.key"
        class="vid-group"
        :style="{ gridColumn: `span ${group.span || 1}` }"
      >
        <div class="vid-group-header">
          <span class="vid-group-title">{{ group.title }}</span>
          <span class="vid-group-meta">{{ group.meta }}</span>
        </div>
        <div class="vid-grid-dynamic" :style="{ '--group-cols': group.span || 1 }">
          <div
            v-for="block in group.items"
            :key="block.key"
            :class="block.shorts ? 'vid-card-short' : 'vid-card-wide'"
          >
            <div :class="block.shorts ? 'vid-thumb-short' : 'vid-thumb-wide'">
              <iframe
                :src="ytEmbed(block.id)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div class="vid-card-caption">
              <span class="vid-card-label">{{ block.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoRowList',
  props: {
    // rows of grouped video blocks (see App's activeVideoRows computed)
    rows: { type: Array, default: () => [] },
  },
  methods: {
    ytEmbed(id) {
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
    },
  },
}
</script>
