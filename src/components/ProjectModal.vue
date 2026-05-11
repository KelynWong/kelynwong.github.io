<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container" @click.stop role="dialog" :aria-labelledby="`modal-title-${project?.id}`">
          <!-- Close button -->
          <button
            class="modal-close"
            @click="closeModal"
            :aria-label="`Close ${project?.title} details`"
          >
            ✕
          </button>

          <!-- Main content scrollable -->
          <div class="modal-content">
            <!-- Hero / Gallery Section -->
            <div v-if="hasMedia" class="media-section">
              <!-- Screenshots Carousel -->
              <div v-if="displayImages.length > 0" class="gallery-wrapper">
                <div class="gallery-main">
                  <img
                    :src="displayImages[currentImageIndex]"
                    :alt="`${project.title} - image ${currentImageIndex + 1}`"
                    class="gallery-image"
                  />
                </div>
                <div v-if="displayImages.length > 1" class="gallery-controls">
                  <button
                    @click="prevImage"
                    class="gallery-btn"
                    :aria-label="'Previous image'"
                  >
                    ←
                  </button>
                  <div class="gallery-indicator">
                    {{ currentImageIndex + 1 }} / {{ displayImages.length }}
                  </div>
                  <button
                    @click="nextImage"
                    class="gallery-btn"
                    :aria-label="'Next image'"
                  >
                    →
                  </button>
                </div>
              </div>

              <!-- Video Embed -->
              <div v-if="project.demo" class="video-embed">
                <button
                  v-if="!videoVisible"
                  @click="videoVisible = true"
                  class="play-btn"
                  :aria-label="`Play demo video for ${project.title}`"
                >
                  ▶ Play Demo
                </button>
                <div v-else class="video-player">
                  <iframe
                    v-if="project.demo.type === 'youtube'"
                    :src="`https://www.youtube.com/embed/${project.demo.id}?autoplay=1`"
                    title="Project Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="video-iframe"
                  ></iframe>
                  <iframe
                    v-else-if="project.demo.type === 'vimeo'"
                    :src="`https://player.vimeo.com/video/${project.demo.id}?autoplay=1`"
                    title="Project Demo"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    class="video-iframe"
                  ></iframe>
                </div>
              </div>
            </div>

            <!-- Text Content -->
            <div class="text-section">
              <h2 :id="`modal-title-${project.id}`" class="modal-title">{{ project.title }}</h2>

              <p v-if="project.short" class="modal-short">{{ project.short }}</p>

              <div class="modal-description">{{ project.description }}</div>

              <!-- Meta Info -->
              <div v-if="project.year || project.role" class="modal-meta">
                <div v-if="project.year" class="meta-item">
                  <span class="meta-label">Year:</span>
                  <span class="meta-value">{{ project.year }}</span>
                </div>
                <div v-if="project.role" class="meta-item">
                  <span class="meta-label">Role:</span>
                  <span class="meta-value">{{ project.role }}</span>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="project.tags?.length" class="modal-tags">
                <span v-for="tag in project.tags" :key="tag" class="modal-tag">
                  {{ tag }}
                </span>
              </div>

              <!-- Links Section -->
              <div v-if="hasLinks" class="modal-links">
                <a
                  v-if="project.links?.github"
                  :href="project.links.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  → GitHub Repository
                </a>
                <a
                  v-if="project.links?.live"
                  :href="project.links.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  → Live Demo
                </a>
                <a
                  v-if="project.links?.figma"
                  :href="project.links.figma"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  → Figma Design
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'ProjectModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    project: {
      type: Object,
      required: true,
      validator(obj) {
        return obj && obj.id;
      },
    },
  },
  emits: ['close'],
  data() {
    return {
      currentImageIndex: 0,
      videoVisible: false,
    };
  },
  computed: {
    displayImages() {
      const imgs = [];
      if (this.project.screenshots?.length) {
        imgs.push(...this.project.screenshots);
      }
      if (this.project.coverImage && !imgs.includes(this.project.coverImage)) {
        imgs.push(this.project.coverImage);
      }
      return imgs;
    },
    hasMedia() {
      return this.displayImages.length > 0 || this.project.demo;
    },
    hasLinks() {
      return this.project.links?.github || this.project.links?.live || this.project.links?.figma;
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Trap focus and prevent body scroll
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          this.$el?.querySelector('.modal-close')?.focus();
        });
        this.currentImageIndex = 0;
        this.videoVisible = false;
      } else {
        document.body.style.overflow = '';
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    nextImage() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.displayImages.length;
    },
    prevImage() {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.displayImages.length) % this.displayImages.length;
    },
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  position: relative;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.modal-close {
  position: sticky;
  top: 0;
  right: 0;
  float: right;
  margin: 12px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg2);
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--accent1);
  color: white;
  border-color: var(--accent1);
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.media-section {
  flex-shrink: 0;
}

.gallery-wrapper {
  position: relative;
  width: 100%;
}

.gallery-main {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg2);
  border-top: 1px solid var(--border);
}

.gallery-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.gallery-btn:hover {
  background: var(--accent1);
  color: white;
  border-color: var(--accent1);
}

.gallery-indicator {
  font-size: 12px;
  color: var(--text-dim);
  min-width: 60px;
  text-align: center;
}

.video-embed {
  padding: 16px;
  background: var(--bg2);
  border-top: 1px solid var(--border);
}

.play-btn {
  width: 100%;
  padding: 16px;
  background: var(--accent1);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.play-btn:hover {
  background: var(--accent2);
}

.video-player {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  margin-top: 12px;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid var(--border);
  border-radius: 4px;
}

.text-section {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.modal-short {
  font-size: 13px;
  color: var(--accent2);
  font-weight: 500;
  margin: 0;
}

.modal-description {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.7;
  white-space: pre-wrap;
}

.modal-meta {
  display: flex;
  gap: 24px;
  padding: 12px;
  background: var(--bg2);
  border-radius: 4px;
  border: 1px solid var(--border);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.meta-label {
  color: var(--text-faint);
  font-weight: 500;
}

.meta-value {
  color: var(--text);
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: rgba(74, 114, 176, 0.12);
  color: var(--accent2);
  border: 1px solid rgba(74, 114, 176, 0.2);
  border-radius: 3px;
}

.modal-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-link-btn {
  padding: 12px 16px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--accent1);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  text-align: center;
}

.modal-link-btn:hover {
  background: var(--accent1);
  color: white;
  border-color: var(--accent1);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 8px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .text-section {
    padding: 16px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-description {
    font-size: 13px;
  }

  .modal-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
