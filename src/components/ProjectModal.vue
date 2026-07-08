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
                    :alt="displayImageAlt(currentImageIndex)"
                    class="gallery-image"
                    @error="handleGalleryImageError"
                  />
                </div>
                <div class="gallery-progress-bar">
                  <div class="progress-fill" :style="{ width: imageAutoPlayProgress + '%' }"></div>
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
              <div v-if="demoCount > 0" class="video-embed">
                <div class="video-player">
                  <iframe
                    v-if="currentDemo() && currentDemo().type === 'youtube'"
                    ref="ytIframe"
                    :src="`https://www.youtube.com/embed/${currentDemo().id}?enablejsapi=1&rel=0&modestbranding=1&autoplay=0`"
                    title="Project Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="video-iframe"
                    @load="onYtIframeLoad"
                  ></iframe>
                  <iframe
                    v-else-if="currentDemo() && currentDemo().type === 'vimeo'"
                    :src="`https://player.vimeo.com/video/${currentDemo().id}`"
                    title="Project Demo"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    class="video-iframe"
                  ></iframe>
                </div>
                <div v-if="demoCount > 1" class="gallery-progress-bar">
                  <div class="progress-fill" :style="{ width: demoAutoPlayProgress + '%' }"></div>
                </div>
                <div v-if="demoCount > 1" class="gallery-controls">
                  <button @click="prevDemo" class="gallery-btn" :aria-label="'Previous demo'">←</button>
                  <div class="gallery-indicator">{{ currentDemoIndex + 1 }} / {{ demoCount }}</div>
                  <button @click="nextDemo" class="gallery-btn" :aria-label="'Next demo'">→</button>
                </div>
              </div>
            </div>

            <!-- Text Content -->
            <div class="text-section">
              <div class="modal-title-row">
                <h2 :id="`modal-title-${project.id}`" class="modal-title">{{ project.title }}</h2>
                <span v-if="project.year" class="modal-year">{{ project.year }}</span>
              </div>

              <p v-if="project.short" class="modal-short">{{ project.short }}</p>

              <div class="modal-description">{{ project.description }}</div>

              <!-- Meta Info -->
              <div v-if="project.role" class="modal-meta">
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
                  v-for="(g, idx) in normalizedLinks.github"
                  :key="`gh-${idx}`"
                  :href="g.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  <span>{{ linkLabel(g.label) }}</span>
                  <ExternalLinkIcon />
                </a>

                <a
                  v-for="(l, idx) in normalizedLinks.live"
                  :key="`live-${idx}`"
                  :href="l.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  <span>{{ linkLabel(l.label) }}</span>
                  <ExternalLinkIcon />
                </a>

                <a
                  v-for="(f, idx) in normalizedLinks.figma"
                  :key="`figma-${idx}`"
                  :href="f.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="modal-link-btn"
                >
                  <span>{{ linkLabel(f.label) }}</span>
                  <ExternalLinkIcon />
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
import { toDarkAsset } from '../utils/themeAssets.js'
import ExternalLinkIcon from './ExternalLinkIcon.vue'

export default {
  name: 'ProjectModal',
  components: { ExternalLinkIcon },
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
      currentDemoIndex: 0,
      imageAutoPlayInterval: null,
      demoAutoPlayInterval: null,
      demoAutoPlayProgressInterval: null,
      demoAutoPlayProgress: 0,
      imageAutoPlayProgressInterval: null,
      imageAutoPlayProgress: 0,
    };
  },
  computed: {
    displayImages() {
      const imgs = [];
      // Prefer the cover image as the first image if present
      if (this.project.coverImage) {
        imgs.push(this.project.coverImage);
      }
      if (this.project.screenshots?.length) {
        for (const s of this.project.screenshots) {
          if (!imgs.includes(s)) imgs.push(s);
        }
      }
      return imgs;
    },
    demoList() {
      if (!this.project) return [];
      if (Array.isArray(this.project.demos)) return this.project.demos;
      if (Array.isArray(this.project.demo)) return this.project.demo;
      return this.project.demo ? [this.project.demo] : [];
    },
    demoCount() {
      return this.demoList.length;
    },
    hasMedia() {
      return this.displayImages.length > 0 || this.demoCount > 0;
    },
    hasLinks() {
      return this.project.links?.github || this.project.links?.live || this.project.links?.figma;
    },
    normalizedLinks() {
      const out = { github: [], live: [], figma: [] }
      const links = this.project.links || {}

      const normalize = (value, defaultLabel) => {
        if (!value) return []
        if (typeof value === 'string') return [{ link: value, label: defaultLabel }]
        if (Array.isArray(value)) {
          return value.map((item) => {
            if (!item) return null
            if (typeof item === 'string') return { link: item, label: defaultLabel }
            // assume object with link and optional label
            return { link: item.link || item.url || '', label: item.label || defaultLabel }
          }).filter(Boolean)
        }
        if (typeof value === 'object') {
          return [{ link: value.link || value.url || '', label: value.label || defaultLabel }]
        }
        return []
      }

      out.github = normalize(links.github, 'GitHub Repository')
      out.live = normalize(links.live, 'Live Demo')
      out.figma = normalize(links.figma, 'Figma Design')

      return out
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
        this.currentDemoIndex = 0;
        // Delay auto-play slightly to ensure displayImages is computed
        this.$nextTick(() => {
          this.maybeStartAutoPlay();
        });
        window.addEventListener('message', this.handleYtMessage);
      } else {
        document.body.style.overflow = '';
        this.stopImageAutoPlay();
        this.stopDemoAutoPlay();
        window.removeEventListener('message', this.handleYtMessage);
      }
    },
    displayImages(newImages) {
      if (!this.isOpen || !newImages?.length) return;

      if (this.currentImageIndex >= newImages.length) {
        this.currentImageIndex = 0;
      }

      this.maybeStartAutoPlay();
    },
    demoList(newDemos) {
      if (!this.isOpen || !newDemos?.length) return;

      if (this.currentDemoIndex >= newDemos.length) {
        this.currentDemoIndex = 0;
      }

      this.maybeStartAutoPlay();
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    linkLabel(label) {
      return String(label || '').replace(/^→\s*/, '').trim();
    },
    displayImageAlt(index) {
      // If the cover image is used as the first image, prefer its alt text
      if (index === 0 && this.project.coverImage) {
        return this.project.coverAlt || this.project.title;
      }

      return `${this.project.title} image ${index + 1}`;
    },
    nextImage() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.displayImages.length;
      this.restartImageAutoPlay();
    },
    prevImage() {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.displayImages.length) % this.displayImages.length;
      this.restartImageAutoPlay();
    },
    startImageAutoPlay() {
      if (this.displayImages.length <= 1) return;
      this.stopImageAutoPlay();
      this.imageAutoPlayProgress = 0;
      // Update progress every 50ms (will go 0-100 over 5 seconds)
      this.imageAutoPlayProgressInterval = setInterval(() => {
        this.imageAutoPlayProgress = Math.min(this.imageAutoPlayProgress + 1, 100);
      }, 50);
      // Advance to next image every 5 seconds
      this.imageAutoPlayInterval = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.displayImages.length;
        this.imageAutoPlayProgress = 0;
      }, 5000);
    },
    stopImageAutoPlay() {
      if (this.imageAutoPlayInterval) {
        clearInterval(this.imageAutoPlayInterval);
        this.imageAutoPlayInterval = null;
      }
      if (this.imageAutoPlayProgressInterval) {
        clearInterval(this.imageAutoPlayProgressInterval);
        this.imageAutoPlayProgressInterval = null;
      }
      this.imageAutoPlayProgress = 0;
    },
    restartImageAutoPlay() {
      if (this.displayImages.length > 1) {
        this.startImageAutoPlay();
      }
    },
    startDemoAutoPlay() {
      if (this.demoCount <= 1) return;
      this.stopDemoAutoPlay();
      this.demoAutoPlayProgress = 0;
      // fill the bar over the same 5s the advance timer uses
      this.demoAutoPlayProgressInterval = setInterval(() => {
        this.demoAutoPlayProgress = Math.min(this.demoAutoPlayProgress + 1, 100);
      }, 50);
      this.demoAutoPlayInterval = setInterval(() => {
        this.currentDemoIndex = (this.currentDemoIndex + 1) % this.demoCount;
        this.demoAutoPlayProgress = 0;
      }, 5000);
    },
    stopDemoAutoPlay() {
      if (this.demoAutoPlayInterval) {
        clearInterval(this.demoAutoPlayInterval);
        this.demoAutoPlayInterval = null;
      }
      if (this.demoAutoPlayProgressInterval) {
        clearInterval(this.demoAutoPlayProgressInterval);
        this.demoAutoPlayProgressInterval = null;
      }
      this.demoAutoPlayProgress = 0;
    },
    restartDemoAutoPlay() {
      if (this.demoCount > 1) {
        this.startDemoAutoPlay();
      }
    },
    // Ask the YouTube embed (enablejsapi=1) to start posting player-state events.
    onYtIframeLoad() {
      const iframe = this.$refs.ytIframe;
      if (!iframe || !iframe.contentWindow) return;
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: 'projectDemo', channel: 'widget' }),
          '*'
        );
      } catch (e) {
        /* noop */
      }
    },
    // Pause the demo auto-advance while a video is actually playing (state 1),
    // resume when it's paused (2) or ended (0). Only matters with multiple demos.
    handleYtMessage(event) {
      if (typeof event.data !== 'string' || !event.origin || event.origin.indexOf('youtube.com') === -1) return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      const state =
        data && data.event === 'onStateChange'
          ? data.info
          : data && data.event === 'infoDelivery' && data.info
            ? data.info.playerState
            : undefined;
      if (state === undefined) return;
      if (state === 1) {
        this.stopDemoAutoPlay();
      } else if ((state === 2 || state === 0) && this.demoCount > 1) {
        this.startDemoAutoPlay();
      }
    },
    maybeStartAutoPlay() {
      // Start each autoplay independently so both galleries can rotate.
      if (this.displayImages.length > 1) {
        this.startImageAutoPlay();
      } else {
        this.stopImageAutoPlay();
      }

      if (this.demoCount > 1) {
        this.startDemoAutoPlay();
      } else {
        this.stopDemoAutoPlay();
      }
    },
    currentDemo() {
      return this.demoList[this.currentDemoIndex];
    },
    nextDemo() {
      if (this.demoCount === 0) return;
      this.currentDemoIndex = (this.currentDemoIndex + 1) % this.demoCount;
      this.restartDemoAutoPlay();
    },
    prevDemo() {
      if (this.demoCount === 0) return;
      this.currentDemoIndex = (this.currentDemoIndex - 1 + this.demoCount) % this.demoCount;
      this.restartDemoAutoPlay();
    },
    handleGalleryImageError(event) {
      const target = event && event.target ? event.target : null;
      if (!target) return;
      const fallback = toDarkAsset(String(target.currentSrc || target.src || ''));
      if (!fallback || fallback === target.src) return;
      target.onerror = null;
      target.src = fallback;
    },
  },
  mounted() {
    // the modal is mounted already-open (v-if in the parent), so the isOpen
    // watcher won't fire — wire the message listener up here too.
    if (this.isOpen) {
      window.addEventListener('message', this.handleYtMessage);
      this.$nextTick(() => {
        this.maybeStartAutoPlay();
      });
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
    this.stopImageAutoPlay();
    this.stopDemoAutoPlay();
    window.removeEventListener('message', this.handleYtMessage);
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
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
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 20px 60px rgba(var(--shadow-rgb), 0.45);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
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
  width: 100%;
}

.media-section {
  flex-shrink: 0;
  width: 100%;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

.gallery-progress-bar {
  width: 100%;
  height: 3px;
  background: var(--bg1);
  border-top: 1px solid var(--border);
}

.progress-fill {
  height: 100%;
  background: var(--accent1);
  transition: width 0.05s linear;
}

.video-embed {
  padding: 16px;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  width: 100%;
}

.video-player {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
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
  width: 100%;
}

.modal-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.modal-year {
  font-size: 11px;
  color: var(--text-faint);
  letter-spacing: 0.08em;
  white-space: nowrap;
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
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-link-btn {
  flex: 1 1 220px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.modal-link-btn .external-icon {
  flex-shrink: 0;
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

  .modal-close {
    top: 10px;
    right: 10px;
  }

  .modal-description {
    font-size: 13px;
  }

  .modal-meta {
    flex-direction: column;
    gap: 8px;
  }

  .modal-links {
    flex-direction: column;
  }

  /* in a column, `flex-basis: 220px` was being used as the button HEIGHT —
     reset so each link is its natural height */
  .modal-link-btn {
    flex: 0 0 auto;
  }
}
</style>
