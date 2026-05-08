<template>
  <article class="project-card group">
    <!-- Cover Image -->
    <div class="project-image-wrapper">
      <img
        :src="project.coverImage"
        :alt="project.coverAlt || project.title"
        loading="lazy"
        decoding="async"
        class="project-image"
      />
      <div class="image-overlay">
        <button
          @click="$emit('open-project', project)"
          class="view-details-btn"
          :aria-label="`View details for ${project.title}`"
        >
          View Details
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="project-content">
      <h3 class="project-title">{{ project.title }}</h3>
      <p v-if="project.short" class="project-short">{{ project.short }}</p>
      <p class="project-description">{{ truncate(project.description, 120) }}</p>

      <!-- Tags -->
      <div v-if="project.tags && project.tags.length" class="project-tags">
        <span v-for="tag in project.tags.slice(0, 5)" :key="tag" class="project-tag">
          {{ tag }}
        </span>
        <span v-if="project.tags.length > 5" class="project-tag-more">
          +{{ project.tags.length - 5 }}
        </span>
      </div>
    </div>

    <!-- Action Links -->
    <div class="project-actions">
      <a
        v-if="project.links?.github"
        :href="project.links.github"
        class="proj-link"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`GitHub repo for ${project.title}`"
      >
        GitHub ↗
      </a>
      <a
        v-if="project.links?.live"
        :href="project.links.live"
        class="proj-link"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Live demo for ${project.title}`"
      >
        Live ↗
      </a>
      <button
        v-if="project.demo || project.screenshots?.length"
        @click="$emit('open-project', project)"
        class="proj-link proj-view-btn"
        :aria-label="`View ${project.title} details and media`"
      >
        View ↗
      </button>
    </div>
  </article>
</template>

<script>
export default {
  name: 'ProjectCard',
  props: {
    project: {
      type: Object,
      required: true,
      validator(obj) {
        return obj.id && obj.title;
      },
    },
  },
  emits: ['open-project'],
  methods: {
    truncate(text, length) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '…' : text;
    },
  },
};
</script>

<style scoped>
.project-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-card:hover {
  border-color: var(--accent2);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.project-image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 66.66%; /* 3:2 aspect ratio */
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
}

.project-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .project-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .image-overlay {
  opacity: 1;
}

.view-details-btn {
  padding: 8px 20px;
  background: var(--accent1);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.view-details-btn:hover {
  background: var(--accent2);
}

.project-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.project-short {
  font-size: 11px;
  color: var(--accent2);
  margin: 0;
  font-weight: 500;
}

.project-description {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;
}

.project-tag {
  font-size: 9px;
  padding: 2px 6px;
  background: rgba(74, 114, 176, 0.12);
  color: var(--accent2);
  border: 1px solid rgba(74, 114, 176, 0.2);
  border-radius: 2px;
  white-space: nowrap;
}

.project-tag-more {
  font-size: 9px;
  padding: 2px 6px;
  color: var(--text-faint);
}

.project-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.proj-link {
  color: var(--text-faint);
  text-decoration: none;
  font-size: 10px;
  cursor: pointer;
  transition: color 0.2s;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
}

.proj-link:hover {
  color: var(--accent1);
}

.proj-view-btn {
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .project-card {
    border-radius: calc(var(--radius) - 2px);
  }

  .project-title {
    font-size: 13px;
  }

  .project-description {
    font-size: 11px;
  }
}
</style>
