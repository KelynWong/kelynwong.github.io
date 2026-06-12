import ProjectCard from './components/ProjectCard.vue'
import ProjectModal from './components/ProjectModal.vue'
import ThreeJSModel from './components/ThreeJSModel.vue'
import Footer from './components/Footer.vue'
import FilterPills from './components/FilterPills.vue'
import { themedAsset, toDarkAsset } from './utils/themeAssets.js'
import {
  skillGroups,
  jobs,
  education,
  interestCategories,
  clayItems,
  drawingItems,
  videoCats,
  videoTravel,
  videoRecaps,
  videoBeatSaber,
  videoTiktoks,
  interestsIntro,
  projects,
  PROJECT_CATEGORY_ORDER,
  photoGroupDefs,
  annotationText,
  hero3dHint,
  heroScrollText,
  heroNameText,
  heroRoleTexts,
  heroVerbsText,
  tracks,
  navLinks,
  sectionTitles,
  aboutParagraphs,
  skillsLabel,
  placeholders,
  moreComing,
  contact,
  form,
  featuredPosts,
  featuredIntro,
} from './data/index.js'


const photographyImageFiles = import.meta.glob('./assets/images/photography/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
})

function buildPhotoGroup(id, label, year, extOverrides = {}) {
  const imageEntries = Object.entries(photographyImageFiles)
    .filter(([filePath]) => filePath.includes(`/photography/${id}/`))
    .sort((left, right) => {
      const leftIndex = Number((left[0].match(/\/(\d+)\./) || [])[1] || 0)
      const rightIndex = Number((right[0].match(/\/(\d+)\./) || [])[1] || 0)
      return leftIndex - rightIndex
    })

  return {
    id,
    label,
    items: imageEntries.map(([filePath, img], idx) => {
      const i = Number((filePath.match(/\/(\d+)\./) || [])[1] || idx + 1)
      return {
        id: i,
        title: `${label} #${i}`,
        location: label,
        year,
        img,
      }
    }),
  }
}

const appOptions = {
  name: 'App',
  components: {
    ProjectCard,
    ProjectModal,
    ThreeJSModel,
    Footer,
    FilterPills,
  },
  data() {
    return {
      // Section data
      skillGroups,
      jobs,
      education,
      interestCategories,
      clayItems,
      drawingItems,
      videoCats,
      videoTravel,
      videoRecaps,
      videoBeatSaber,
      videoTiktoks,
      interestsIntro,
      projects,
      featuredPosts,
      featuredIntro,

      featuredScrollPaused: false,
      featuredScrollRaf: null,
      featuredNeedsToggle: {},

      // UI state
      activeCat: 'clay',
      activePhotoPlace: 'dopamineLand2026',
      activeVideoCat: 'travel',
      isNavOpen: false,
      themeMode: 'dark',

      photoGroups: photoGroupDefs.map((d) => buildPhotoGroup(d.id, d.label, d.year, d.extOverrides || {})),

      // Form state
      form: { name: '', email: '', message: '' },
      isSubmitting: false,
      toast: {
        show: false,
        type: 'info',
        title: '',
        text: '',
        icon: '•',
      },
      toastTimer: null,

      // Project modal state
      activeProject: null,
      showProjectModal: false,
      currentImageIndex: 0,
      videoVisible: false,
      // project filtering
      activeProjectFilter: 'all',
      projectCategories: PROJECT_CATEGORY_ORDER,
      featuredRotationMs: 5000,
      featuredSideOffsetLeft: '-112%',
      featuredSideOffsetRight: '12%',
      featuredSideScale: 0.84,
      featuredSideOpacity: 0.58,
      featuredSideBlur: '1.7px',
      featuredProjectRotationIndex: 0,
      featuredProjectRotationInterval: null,
      sectionLoadState: {
        projects: false,
        interests: false,
      },
      galleryAspects: {
        clay: {},
        drawing: {},
        photo: {},
      },
      galleryLightboxOpen: false,
      galleryLightboxSection: '',
      galleryLightboxItems: [],
      galleryLightboxIndex: 0,
      galleryAutoPlayInterval: null,
      galleryAutoPlayProgressInterval: null,
      galleryAutoPlayProgress: 0,
      galleryTl: null,

      // Music player state
      currentTrackIdx: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      progressPct: 0,
      heroNameText,
      heroRoleTexts,
      heroVerbsText,
      typedHeroName: '',
      typedHeroRole: '',
      typedHeroVerbs: '',
      heroTypingActive: false,
      heroTypingTimeouts: [],
      tracks,
      appText: {
        navLinks,
        annotationText,
        hero3dHint,
        heroScrollText,
        sectionTitles,
        aboutParagraphs,
        skillsLabel,
        placeholders,
        moreComing,
        contact,
        form,
      },
    }
  },

  computed: {
    logoDarkSrc() {
      return '/src/assets/images/logo.png'
    },

    logoSrc() {
      return themedAsset(this.logoDarkSrc, this.themeMode, 'logo')
    },

    clayItemsForTheme() {
      return this.clayItems
    },

    themedProjects() {
      return this.projects.map((project) => {
        const darkCover = project.coverImage || ''
        return {
          ...project,
          darkCoverImage: darkCover,
          coverImage: themedAsset(darkCover, this.themeMode, 'projectCover'),
        }
      })
    },

    currentTrack() {
      return this.currentTrackIdx !== null ? this.tracks[this.currentTrackIdx] : null
    },
    currentTrackLyricsEntries() {
      const lyrics = this.currentTrack?.lyrics || ''
      if (!lyrics) return []

      return lyrics
        .split(/\r?\n/)
        .map((line) => {
          const match = line.match(/^\[(\d{2}):(\d{2})(?:\.(\d{1,2}))?\]\s*(.*)$/)
          if (!match) return null
          const minutes = Number(match[1])
          const seconds = Number(match[2])
          const fraction = Number((match[3] || '0').padEnd(2, '0'))
          return {
            time: minutes * 60 + seconds + fraction / 100,
            text: match[4].trim(),
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.time - b.time)
    },
    currentLyricIndex() {
      if (!this.currentTrackLyricsEntries.length) return -1

      let index = 0
      for (let i = 0; i < this.currentTrackLyricsEntries.length; i += 1) {
        if (this.currentTime >= this.currentTrackLyricsEntries[i].time) {
          index = i
        } else {
          break
        }
      }
      return index
    },
    currentLyricLine() {
      return this.currentLyricIndex >= 0 ? this.currentTrackLyricsEntries[this.currentLyricIndex] : null
    },
    visibleLyricLines() {
      if (!this.currentTrackLyricsEntries.length) return []
      return this.currentTrackLyricsEntries.map((entry, index) => {
        const distance = Math.abs(index - this.currentLyricIndex)
        const opacity = this.currentLyricIndex < 0 ? 0.8 : Math.max(0.35, 1 - distance * 0.2)
        return {
          ...entry,
          isActive: index === this.currentLyricIndex,
          opacity: opacity.toFixed(2),
        }
      })
    },
    currentGalleryLightboxItem() {
      return this.galleryLightboxItems[this.galleryLightboxIndex] || null
    },
    groupedProjects() {
      const filtered = this.activeProjectFilter && this.activeProjectFilter !== 'all'
        ? this.themedProjects.filter((p) => (p.category || 'fullstack') === this.activeProjectFilter)
        : this.themedProjects

      const grouped = PROJECT_CATEGORY_ORDER.map((category) => ({
        ...category,
        items: filtered.filter((project) => (project.category || 'fullstack') === category.key),
      }))

      const uncategorized = this.themedProjects.filter(
        (project) => !PROJECT_CATEGORY_ORDER.some((category) => category.key === (project.category || 'fullstack'))
      )

      if (uncategorized.length) {
        grouped.push({ key: 'other', label: 'Other Projects', items: uncategorized })
      }

      return grouped.filter((group) => group.items.length)
    },
    featuredProjects() {
      return this.themedProjects
        .filter((project) => project.featured)
        .sort((left, right) => {
          const leftOrder = left.featuredOrder ?? Number.MAX_SAFE_INTEGER
          const rightOrder = right.featuredOrder ?? Number.MAX_SAFE_INTEGER
          return leftOrder - rightOrder
        })
        .slice(0, 3)
    },
    featuredProjectSlides() {
      const projects = this.featuredProjects
      const total = projects.length
      if (!total) return []

      const activeIndex = this.featuredProjectRotationIndex % total

      return projects.map((project, index) => {
        const offset = (index - activeIndex + total) % total
        const position = offset === 0 ? 'center' : offset === 1 ? 'right' : 'left'

        return {
          project,
          position,
          positionClass: `projects-featured-${position}`,
        }
      })
    },
    featuredCarouselStyle() {
      return {
        '--featured-side-left-x': this.featuredSideOffsetLeft,
        '--featured-side-right-x': this.featuredSideOffsetRight,
        '--featured-side-scale': this.featuredSideScale,
        '--featured-side-opacity': this.featuredSideOpacity,
        '--featured-side-blur': this.featuredSideBlur,
      }
    },
    typedHeroVerbTokens() {
      return this.typedHeroVerbs.match(/\S+\s*/g) || []
    },
    photoPlaces() {
      return this.photoGroups.map((group) => ({ id: group.id, label: group.label, count: group.items.length }))
    },
    activePhotoItems() {
      const group = this.photoGroups.find((g) => g.id === this.activePhotoPlace)
      return group ? group.items : []
    },
    activeVideoGroups() {
      const itemSpan = (item) => (item.shorts ? 1 : 2)
      const groupSpan = (items) => Math.min(4, Math.max(1, items.reduce((total, item) => total + itemSpan(item), 0)))

      if (this.activeVideoCat === 'travel') {
        return videoTravel.map((trip) => ({
          key: `travel-${trip.title}`,
          title: trip.title,
          meta: trip.dates,
          items: trip.parts.map((part) => ({
            key: `${trip.title}-${part.id}-${part.label}`,
            id: part.id,
            label: part.label,
            shorts: !!part.shorts,
          })),
          span: groupSpan(trip.parts),
        }))
      }

      if (this.activeVideoCat === 'recaps') {
        return videoRecaps.map((yearGroup) => ({
          key: `recaps-${yearGroup.year}`,
          title: yearGroup.year,
          meta: `${yearGroup.parts.length} part${yearGroup.parts.length > 1 ? 's' : ''}`,
          items: yearGroup.parts.map((part) => ({
            key: `${yearGroup.year}-${part.id}-${part.label}`,
            id: part.id,
            label: part.label,
            shorts: !!part.shorts,
          })),
          span: groupSpan(yearGroup.parts),
        }))
      }

      if (this.activeVideoCat === 'tiktoks') {
        return videoTiktoks.map((group) => ({
          key: `tiktoks-${group.group}`,
          title: `${group.icon} ${group.group}`,
          meta: '',
          items: group.items.map((item) => ({
            key: `${group.group}-${item.id}-${item.label}`,
            id: item.id,
            label: item.label,
            shorts: !!item.shorts,
          })),
          span: groupSpan(group.items),
        }))
      }

      return []
    },
    activeVideoRows() {
      const groups = this.activeVideoGroups
        .map((group, index) => ({ ...group, index }))
        .sort((left, right) => {
          if (right.span !== left.span) return right.span - left.span
          return left.index - right.index
        })

      const rows = []

      for (const group of groups) {
        let targetRow = null
        let bestRemaining = Infinity

        for (const row of rows) {
          const used = row.reduce((sum, item) => sum + item.span, 0)
          const remaining = 4 - used
          if (group.span <= remaining && remaining - group.span < bestRemaining) {
            targetRow = row
            bestRemaining = remaining - group.span
          }
        }

        if (!targetRow) {
          targetRow = []
          rows.push(targetRow)
        }

        targetRow.push(group)
      }

      return rows
    },

    // normalized current gallery item for template usage
    currentGalleryLightboxItem() {
      return this.galleryLightboxItems[this.galleryLightboxIndex] || null
    },
  },

  mounted() {
    this.initTheme()
    this.fitHeroVerbs()
    this.initSectionLoaders()
    this._heroResizeHandler = () => this.fitHeroVerbs()
    this._socialScrollHandler = () => this.triggerSocialBounce()
    this._navResizeHandler = () => {
      if (window.innerWidth > 900) {
        this.isNavOpen = false
      }
    }
    this._featuredResizeHandler = () => {
      this.syncFeaturedHeight()
      this.checkFeaturedOverflow()
    }
    this._galleryKeyHandler = (event) => this.handleGalleryKeydown(event)
    window.addEventListener('resize', this._heroResizeHandler)
    window.addEventListener('resize', this._navResizeHandler)
    window.addEventListener('resize', this._featuredResizeHandler)
    window.addEventListener('scroll', this._socialScrollHandler, { passive: true })
    window.addEventListener('keydown', this._galleryKeyHandler)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.fitHeroVerbs()
        this.checkFeaturedOverflow()
      })
    }
    this.startHeroTypingSequence()
    this.startFeaturedProjectRotation()
    this.startFeaturedScroll()
    this.setupFeaturedHeightSync()
    this.checkFeaturedOverflow()

    this.$nextTick(() => this.scrollLyricsToActiveLine())

    // Initialize project-card reveal: handled via CSS transition-group rules
  },
  watch: {
    currentLyricIndex() {
      this.$nextTick(() => this.scrollLyricsToActiveLine())
    },
    currentTrackIdx() {
      this.$nextTick(() => this.scrollLyricsToActiveLine())
    },
    'sectionLoadState.projects'(ready) {
      // the featured carousel only mounts once the projects section loads in
      if (ready) this.setupFeaturedHeightSync()
    },
  },

  beforeUnmount() {
    if (this._heroResizeHandler) {
      window.removeEventListener('resize', this._heroResizeHandler)
    }
    if (this._navResizeHandler) {
      window.removeEventListener('resize', this._navResizeHandler)
    }
    if (this._featuredResizeHandler) {
      window.removeEventListener('resize', this._featuredResizeHandler)
    }
    if (this.featuredHeightObserver) {
      this.featuredHeightObserver.disconnect()
      this.featuredHeightObserver = null
    }
    if (this._socialScrollHandler) {
      window.removeEventListener('scroll', this._socialScrollHandler)
    }
    if (this._galleryKeyHandler) {
      window.removeEventListener('keydown', this._galleryKeyHandler)
    }
    if (this.sectionLoadObserver) {
      this.sectionLoadObserver.disconnect()
      this.sectionLoadObserver = null
    }
    this.stopGalleryAutoPlay()
    this.stopHeroTypingSequence()
    if (this._lyricsScrollRaf) {
      cancelAnimationFrame(this._lyricsScrollRaf)
      this._lyricsScrollRaf = null
    }
    this.stopFeaturedProjectRotation()
    this.stopFeaturedScroll()
  },

  methods: {
    // Keep the (absolutely-positioned) featured carousel as tall as its tallest
    // card so the gap to the filter tabs is consistent and nothing overlaps,
    // without a viewport-based min-height that mismatches the actual content.
    syncFeaturedHeight() {
      const carousel = this.resolveDomElement(this.$refs.featuredProjectCarousel)
      if (!carousel) return
      const slots = carousel.querySelectorAll('.projects-featured-slot')
      let tallest = 0
      slots.forEach((slot) => {
        // offsetHeight ignores the scale() transform, so it's the real card height
        tallest = Math.max(tallest, slot.offsetHeight)
      })
      if (tallest > 0) {
        carousel.style.minHeight = `${Math.ceil(tallest)}px`
      }
    },

    setupFeaturedHeightSync() {
      this.$nextTick(() => {
        const carousel = this.resolveDomElement(this.$refs.featuredProjectCarousel)
        if (!carousel) return

        this.syncFeaturedHeight()

        if (typeof ResizeObserver !== 'undefined') {
          if (this.featuredHeightObserver) this.featuredHeightObserver.disconnect()
          this.featuredHeightObserver = new ResizeObserver(() => this.syncFeaturedHeight())
          carousel.querySelectorAll('.projects-featured-slot').forEach((slot) => {
            this.featuredHeightObserver.observe(slot)
          })
        }
      })
    },

    // Render the LinkedIn post text safely: escape HTML, then style hashtags and
    // links and preserve line breaks.
    formatPostText(text) {
      const escaped = this.escapeHtml(text || '')
      return escaped
        .replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noreferrer noopener" class="li-inline-link">$1</a>'
        )
        .replace(/(^|\s)(#[\w]+)/g, '$1<span class="li-tag">$2</span>')
    },

    // Only show the "…more" indicator on cards whose text actually overflows the
    // clamped height (so short posts don't get a pointless indicator).
    checkFeaturedOverflow() {
      this.$nextTick(() => {
        const refs = this.$refs.featuredText
        if (!refs) return
        const nodes = Array.isArray(refs) ? refs : [refs]
        const needs = {}
        nodes.forEach((node) => {
          if (!node) return
          needs[node.dataset.postId] = node.scrollHeight - node.clientHeight > 4
        })
        this.featuredNeedsToggle = needs
      })
    },

    startFeaturedScroll() {
      this.stopFeaturedScroll()
      if (typeof window === 'undefined' || !window.requestAnimationFrame) return

      const step = () => {
        const track = this.resolveDomElement(this.$refs.featuredScroll)
        if (track && !this.featuredScrollPaused) {
          const max = track.scrollWidth - track.clientWidth
          if (max > 0) {
            // gentle continuous drift; wrap back to the start at the end
            track.scrollLeft = track.scrollLeft >= max - 0.5 ? 0 : track.scrollLeft + 0.5
          }
        }
        this.featuredScrollRaf = window.requestAnimationFrame(step)
      }

      this.featuredScrollRaf = window.requestAnimationFrame(step)
    },

    stopFeaturedScroll() {
      if (this.featuredScrollRaf) {
        cancelAnimationFrame(this.featuredScrollRaf)
        this.featuredScrollRaf = null
      }
    },

    pauseFeaturedScroll() {
      this.featuredScrollPaused = true
    },

    resumeFeaturedScroll() {
      this.featuredScrollPaused = false
    },

    scrollFeatured(direction) {
      const track = this.resolveDomElement(this.$refs.featuredScroll)
      if (!track) return
      const amount = Math.max(280, track.clientWidth * 0.8)
      track.scrollBy({ left: direction * amount, behavior: 'smooth' })
    },

    fallbackToDarkAsset(path) {
      return toDarkAsset(path)
    },

    handleThemeImageError(event, explicitFallback = '') {
      const target = event && event.target ? event.target : null
      if (!target) return
      const fallback = explicitFallback || this.fallbackToDarkAsset(target.currentSrc || target.src || '')
      if (!fallback || fallback === target.src) return
      target.onerror = null
      target.src = fallback
    },

    initSectionLoaders() {
      const loadSection = (sectionId) => {
        if (this.sectionLoadState[sectionId] !== true) {
          this.sectionLoadState[sectionId] = true
        }
      }

      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        loadSection('projects')
        loadSection('interests')
        return
      }

      if (this.sectionLoadObserver) {
        this.sectionLoadObserver.disconnect()
      }

      this.sectionLoadObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const sectionId = entry.target?.dataset?.loadSection
          if (!sectionId) continue
          loadSection(sectionId)
          this.sectionLoadObserver.unobserve(entry.target)
        }
      }, {
        rootMargin: '220px 0px',
        threshold: 0.12,
      })

      this.$nextTick(() => {
        const targets = this.$el?.querySelectorAll?.('[data-load-section]')
        if (!targets || !targets.length) return
        targets.forEach((target) => {
          const sectionId = target?.dataset?.loadSection
          if (!sectionId || this.sectionLoadState[sectionId]) return
          this.sectionLoadObserver.observe(target)
        })
      })
    },

    isSectionReady(sectionId) {
      return this.sectionLoadState[sectionId] !== false
    },

    initTheme() {
      let savedTheme = 'dark'
      try {
        savedTheme = localStorage.getItem('themeMode') || 'dark'
      } catch (e) {}
      this.themeMode = savedTheme === 'light' ? 'light' : 'dark'
      this.applyTheme(this.themeMode)
    },

    applyTheme(mode) {
      const nextMode = mode === 'light' ? 'light' : 'dark'
      this.themeMode = nextMode
      document.documentElement.setAttribute('data-theme', nextMode)
      document.documentElement.style.colorScheme = nextMode
      try {
        localStorage.setItem('themeMode', nextMode)
      } catch (e) {}
    },

    toggleTheme() {
      this.applyTheme(this.themeMode === 'dark' ? 'light' : 'dark')
    },

    handleNavLinkClick(href) {
      this.closeNavMenu()

      if (typeof window === 'undefined' || !href || !href.startsWith('#')) return

      const target = document.querySelector(href)
      if (!target) return

      const targetTop = window.scrollY + target.getBoundingClientRect().top

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      })
    },

    resolveDomElement(ref) {
      if (!ref) return null
      if (Array.isArray(ref)) return this.resolveDomElement(ref[0])
      if (ref.$el) return ref.$el
      return ref
    },

    scrollLyricsToActiveLine() {
      const container = this.resolveDomElement(this.$refs.lyricsScrollList)
      const focus = this.resolveDomElement(this.$refs.lyricsFocusBox)
      if (!container || !focus || !this.currentTrackLyricsEntries.length || this.currentLyricIndex < 0) {
        return
      }

      const activeLines = container.querySelectorAll('.lyrics-sync-line')
      const activeLine = activeLines[this.currentLyricIndex]
      if (!activeLine) return

      const focusRect = focus.getBoundingClientRect()
      const activeRect = activeLine.getBoundingClientRect()
      const targetScrollTop = container.scrollTop + (activeRect.top + activeRect.height / 2) - (focusRect.top + focusRect.height / 2)
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight)

      container.scrollTop = Math.min(Math.max(0, targetScrollTop), maxScrollTop)
    },

    scheduleLyricsScroll() {
      if (this._lyricsScrollRaf) {
        cancelAnimationFrame(this._lyricsScrollRaf)
      }

      this._lyricsScrollRaf = requestAnimationFrame(() => {
        this._lyricsScrollRaf = null
        this.$nextTick(() => this.scrollLyricsToActiveLine())
      })
    },

    fitHeroVerbs() {
      const heroLeft = document.querySelector('.hero-left')
      const heroVerbs = document.querySelector('.hero-verbs')
      if (!heroLeft || !heroVerbs) return

      heroVerbs.style.fontSize = ''
    },

    closeNavMenu() {
      this.isNavOpen = false
    },

    galleryImageStyle(section, itemId) {
      const ratio = this.galleryAspects?.[section]?.[itemId]
      return ratio ? { '--gallery-aspect': ratio } : null
    },

    isGalleryLandscape(section, itemId) {
      const ratio = this.galleryAspects?.[section]?.[itemId]
      return typeof ratio === 'number' && ratio > 1.15
    },

    recordGalleryAspect(section, itemId, event) {
      const image = event?.target
      if (!image || !image.naturalWidth || !image.naturalHeight) return

      const ratio = image.naturalWidth / image.naturalHeight
      if (!this.galleryAspects[section]) {
        this.galleryAspects[section] = {}
      }
      this.galleryAspects[section][itemId] = ratio
    },

    getGalleryItems(section) {
      if (section === 'clay') return this.clayItemsForTheme
      if (section === 'drawing') return this.drawingItems
      if (section === 'photo') return this.activePhotoItems
      return []
    },

    gallerySectionLabel(section) {
      if (section === 'clay') return 'Clay Models'
      if (section === 'drawing') return 'Drawings'
      if (section === 'photo') return 'Photography'
      return 'Gallery'
    },

    // set project category filter (animation handled via CSS transition-group)
    setProjectFilter(categoryKey) {
      // simple filter assignment — animations handled by transition-group hooks
      this.activeProjectFilter = categoryKey || 'all'
    },

    startFeaturedProjectRotation() {
      this.stopFeaturedProjectRotation()
      if (this.featuredProjects.length <= 1) return

      this.featuredProjectRotationInterval = setInterval(() => {
        this.featuredProjectRotationIndex = (this.featuredProjectRotationIndex + 1) % this.featuredProjects.length
      }, this.featuredRotationMs)
    },

    stopFeaturedProjectRotation() {
      if (this.featuredProjectRotationInterval) {
        clearInterval(this.featuredProjectRotationInterval)
        this.featuredProjectRotationInterval = null
      }
    },

    // transition-group hooks removed — CSS handles enter/leave animations
    selectCategory(catId/*, evt */) {
      this.activeCat = catId
    },

    selectPhotoPlace(placeId/*, evt */) {
      this.activePhotoPlace = placeId
    },

    selectVideoCat(vcId/*, evt */) {
      this.activeVideoCat = vcId
    },

    galleryLightboxMeta(item) {
      if (!item) return ''

      const details = []
      if (item.description) details.push(item.description)
      if (item.medium) details.push(item.medium)
      if (item.location) details.push(item.location)
      if (item.year) details.push(item.year)

      if (details.length > 0) {
        return details.join(' • ')
      }

      return this.gallerySectionLabel(this.galleryLightboxSection)
    },

    openGalleryLightbox(section, items, startIndex = 0) {
      this.galleryLightboxSection = section
      this.galleryLightboxItems = Array.isArray(items) ? items : []
      this.galleryLightboxIndex = startIndex
      this.galleryLightboxOpen = true
      document.body.style.overflow = 'hidden'
      this.$nextTick(() => {
        if (this.galleryLightboxOpen) {
          this.startGalleryAutoPlay()
        }
      })
    },

    closeGalleryLightbox() {
      this.galleryLightboxOpen = false
      this.galleryLightboxSection = ''
      this.galleryLightboxItems = []
      this.galleryLightboxIndex = 0
      document.body.style.overflow = ''
      this.stopGalleryAutoPlay()
    },

    nextGalleryImage() {
      if (!this.galleryLightboxItems.length) return
      this.galleryLightboxIndex = (this.galleryLightboxIndex + 1) % this.galleryLightboxItems.length
      this.restartGalleryAutoPlay()
    },

    prevGalleryImage() {
      if (!this.galleryLightboxItems.length) return
      this.galleryLightboxIndex =
        (this.galleryLightboxIndex - 1 + this.galleryLightboxItems.length) % this.galleryLightboxItems.length
      this.restartGalleryAutoPlay()
    },

    handleGalleryKeydown(event) {
      if (!this.galleryLightboxOpen) return
      if (event.key === 'Escape') {
        this.closeGalleryLightbox()
      } else if (event.key === 'ArrowRight') {
        this.nextGalleryImage()
      } else if (event.key === 'ArrowLeft') {
        this.prevGalleryImage()
      }
    },

    triggerSocialBounce() {
      const socialFloat = document.querySelector('.social-float')
      if (!socialFloat) return

      socialFloat.classList.remove('is-bouncing')
      void socialFloat.offsetWidth
      socialFloat.classList.add('is-bouncing')

      if (this._socialBounceTimer) {
        clearTimeout(this._socialBounceTimer)
      }
      this._socialBounceTimer = setTimeout(() => {
        socialFloat.classList.remove('is-bouncing')
      }, 650)
    },

    startGalleryAutoPlay() {
      if (!this.galleryLightboxItems || this.galleryLightboxItems.length <= 1) {
        this.stopGalleryAutoPlay()
        return
      }
      this.stopGalleryAutoPlay()
      const autoPlayDurationMs = 3000
      const progressTickMs = 50
      const selector = '.gallery-lightbox-progress-fill'
      const fillEl = document.querySelector(selector)
      if (!fillEl) return

      // ensure any prior timers are cleared
      if (this.galleryAutoPlayInterval) clearInterval(this.galleryAutoPlayInterval)
      if (this.galleryAutoPlayProgressInterval) clearInterval(this.galleryAutoPlayProgressInterval)

      // reset
      this.galleryAutoPlayProgress = 0
      fillEl.style.width = '0%'

      // update visible progress every tick
      const progressStep = (100 * progressTickMs) / autoPlayDurationMs
      this.galleryAutoPlayProgressInterval = setInterval(() => {
        this.galleryAutoPlayProgress = Math.min(this.galleryAutoPlayProgress + progressStep, 100)
        fillEl.style.width = `${this.galleryAutoPlayProgress}%`
      }, progressTickMs)

      // advance image at interval
      this.galleryAutoPlayInterval = setInterval(() => {
        this.galleryLightboxIndex = (this.galleryLightboxIndex + 1) % this.galleryLightboxItems.length
        this.galleryAutoPlayProgress = 0
        fillEl.style.width = '0%'
      }, autoPlayDurationMs)
    },

    stopGalleryAutoPlay() {
      if (this.galleryTl) {
        this.galleryTl = null
      }
      if (this.galleryAutoPlayInterval) {
        clearInterval(this.galleryAutoPlayInterval)
        this.galleryAutoPlayInterval = null
      }
      if (this.galleryAutoPlayProgressInterval) {
        clearInterval(this.galleryAutoPlayProgressInterval)
        this.galleryAutoPlayProgressInterval = null
      }
      this.galleryAutoPlayProgress = 0
      // reset DOM fill if present
      const fill = document.querySelector('.gallery-lightbox-progress-fill')
      if (fill) fill.style.width = '0%'
    },

    restartGalleryAutoPlay() {
      this.startGalleryAutoPlay()
    },

    stopHeroTypingSequence() {
      this.heroTypingActive = false
      for (const timeoutId of this.heroTypingTimeouts) {
        clearTimeout(timeoutId)
      }
      this.heroTypingTimeouts = []
    },

    heroTypingWait(ms) {
      return new Promise((resolve) => {
        if (!this.heroTypingActive) {
          resolve(false)
          return
        }

        const timeoutId = setTimeout(() => {
          this.heroTypingTimeouts = this.heroTypingTimeouts.filter((id) => id !== timeoutId)
          resolve(this.heroTypingActive)
        }, ms)

        this.heroTypingTimeouts.push(timeoutId)
      })
    },

    async typeIntoField(fieldName, text, speed = 70) {
      for (let i = 1; i <= text.length; i += 1) {
        if (!this.heroTypingActive) return false
        this[fieldName] = text.slice(0, i)
        const stillActive = await this.heroTypingWait(speed)
        if (!stillActive) return false
      }
      return true
    },

    async deleteField(fieldName, speed = 45) {
      const current = this[fieldName] || ''
      for (let i = current.length - 1; i >= 0; i -= 1) {
        if (!this.heroTypingActive) return false
        this[fieldName] = current.slice(0, i)
        const stillActive = await this.heroTypingWait(speed)
        if (!stillActive) return false
      }
      return true
    },

    async startHeroRoleLoop(startIndex = 0) {
      if (!this.heroRoleTexts.length) return
      let roleIndex = startIndex % this.heroRoleTexts.length

      while (this.heroTypingActive) {
        const paused = await this.heroTypingWait(1300)
        if (!paused) return

        const deleted = await this.deleteField('typedHeroRole', 45)
        if (!deleted) return

        const typed = await this.typeIntoField('typedHeroRole', this.heroRoleTexts[roleIndex], 70)
        if (!typed) return

        roleIndex = (roleIndex + 1) % this.heroRoleTexts.length
      }
    },

    async startHeroTypingSequence() {
      this.stopHeroTypingSequence()
      this.heroTypingActive = true

      this.typedHeroName = ''
      this.typedHeroRole = ''
      this.typedHeroVerbs = ''

      const nameTyped = await this.typeIntoField('typedHeroName', this.heroNameText, 85)
      if (!nameTyped) return

      const roleTyped = await this.typeIntoField('typedHeroRole', this.heroRoleTexts[0], 70)
      if (!roleTyped) return

      const verbsTyped = await this.typeIntoField('typedHeroVerbs', this.heroVerbsText, 14)
      if (!verbsTyped) return

      const transitioned = await this.heroTypingWait(400)
      if (!transitioned) return

      this.startHeroRoleLoop(1)
    },

    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },

    showToast({ type = 'info', title = 'Notice', text = '', icon = '•' }) {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
        this.toastTimer = null
      }

      this.toast = { show: true, type, title, text, icon }
      this.toastTimer = setTimeout(() => {
        this.toast.show = false
      }, 4500)
    },

    hideToast() {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
        this.toastTimer = null
      }
      this.toast.show = false
    },

    ytEmbed(id) {
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
    },

    async submitForm() {
      const name = this.form.name.trim()
      const email = this.form.email.trim()
      const message = this.form.message.trim()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!name || !email || !message) {
        this.showToast({
          type: 'error',
          title: 'Missing Fields',
          text: 'Please fill in your name, email, and message.',
          icon: '⛔',
        })
        return
      }

      if (!emailRegex.test(email)) {
        this.showToast({
          type: 'error',
          title: 'Invalid Email',
          text: 'Please enter a valid email address.',
          icon: '⛔',
        })
        return
      }

      this.isSubmitting = true

      try {
        const res = await fetch('https://kelynwong-github-io-backend.vercel.app/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          this.showToast({
            type: 'success',
            title: 'Message Sent',
            text: `Thanks ${name}, I received your message and will reply soon.`,
            icon: '✓',
          })

          this.form = { name: '', email: '', message: '' }
          return
        }

        console.error('Server error:', data)
        this.showToast({
          type: 'error',
          title: 'Send Failed',
          text: 'Unable to send right now. Please try again or email me directly.',
          icon: '⛔',
        })

      } catch (err) {
        // Network error
        console.error('Network error:', err)
        this.showToast({
          type: 'error',
          title: 'Network Error',
          text: 'Could not reach server. Please try again in a moment.',
          icon: '⛔',
        })
      } finally {
        this.isSubmitting = false
      }
    },

    // Music player methods
    getAudio() {
      let audio = this.$refs.audioEl
      if (!audio) {
        console.warn('getAudio: audioEl ref not found')
        return null
      }

      if (NodeList.prototype.isPrototypeOf(audio) || Array.isArray(audio)) {
        for (const item of audio) {
          if (!item) continue
          if (item.$el && typeof item.$el.play === 'function') return item.$el
          if (typeof item.play === 'function') return item
        }
        audio = audio[0]
      }

      if (audio && audio.$el && typeof audio.$el.play === 'function') return audio.$el
      if (audio && typeof audio.play === 'function') return audio

      console.warn('getAudio: no playable audio element found')
      return null
    },

    selectTrack(i) {
      const audio = this.getAudio()
      if (!audio) return
      if (this.currentTrackIdx === i) {
        this.togglePlay()
        return
      }
      this.currentTrackIdx = i
      audio.src = this.tracks[i].src
      audio.volume = this.volume
      audio.load()
      audio.play().then(() => { this.isPlaying = true }).catch(() => {})
      this.scheduleLyricsScroll()
    },

    togglePlay() {
      const audio = this.getAudio()
      if (!audio) return
      if (this.currentTrackIdx === null) { this.selectTrack(0); return }
      if (this.isPlaying) { audio.pause(); this.isPlaying = false }
      else { audio.play().then(() => { this.isPlaying = true }).catch(() => {}) }
    },

    nextTrack() {
      const next = this.currentTrackIdx === null ? 0 : (this.currentTrackIdx + 1) % this.tracks.length
      this.selectTrack(next)
    },

    prevTrack() {
      const audio = this.getAudio()
      if (audio && audio.currentTime > 3) { audio.currentTime = 0; return }
      const prev = this.currentTrackIdx === null ? 0 : (this.currentTrackIdx - 1 + this.tracks.length) % this.tracks.length
      this.selectTrack(prev)
    },

    onTimeUpdate() {
      const audio = this.getAudio()
      if (!audio) return
      this.currentTime = audio.currentTime
      this.progressPct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
      this.scheduleLyricsScroll()
    },

    onMeta() {
      const audio = this.getAudio()
      if (!audio) return
      this.duration = audio.duration
      if (this.currentTrackIdx !== null) {
        this.tracks[this.currentTrackIdx].duration = this.formatTime(audio.duration)
      }
    },

    seekTo(e) {
      const audio = this.getAudio()
      if (!audio || !audio.duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      audio.currentTime = pct * audio.duration
    },

    setVolume() {
      const audio = this.getAudio()
      if (audio) audio.volume = this.volume
    },

    formatTime(s) {
      if (!s || isNaN(s)) return '--:--'
      const m = Math.floor(s / 60)
      const sec = Math.floor(s % 60)
      return `${m}:${sec.toString().padStart(2, '0')}`
    },
  },
}

export default appOptions

