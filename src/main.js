import ProjectCard from './components/ProjectCard.vue'
import ProjectModal from './components/ProjectModal.vue'
import ThreeJSModel from './components/ThreeJSModel.vue'
import Footer from './components/Footer.vue'
import FilterPills from './components/FilterPills.vue'
import SectionHeader from './components/SectionHeader.vue'
import ExternalLinkIcon from './components/ExternalLinkIcon.vue'
import VideoRowList from './components/VideoRowList.vue'
import GalleryGrid from './components/GalleryGrid.vue'
import BrandIcon from './components/BrandIcon.vue'
import RevealText from './components/RevealText.vue'
import { themedAsset, toDarkAsset } from './utils/themeAssets.js'
import {
  skillGroups,
  jobs,
  education,
  interestCategories,
  clayItems,
  sketchPaintItems,
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

const aboutPhotoFiles = import.meta.glob('./assets/images/about/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
})

const aboutPhotos = Object.entries(aboutPhotoFiles)
  .sort((left, right) => {
    const leftIndex = Number((left[0].match(/(\d+)/) || [])[1] || 0)
    const rightIndex = Number((right[0].match(/(\d+)/) || [])[1] || 0)
    return leftIndex - rightIndex
  })
  .map(([, src], index) => ({ src, alt: `Kelyn — photo ${index + 1}` }))

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
    SectionHeader,
    ExternalLinkIcon,
    VideoRowList,
    GalleryGrid,
    BrandIcon,
    RevealText,
  },
  data() {
    return {
      // Section data
      skillGroups,
      aboutPhotos,
      jobs,
      education,
      interestCategories,
      clayItems,
      sketchPaintItems,
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
      // direction of the interests tab slide ('forward' = clicked tab is to the right)
      tabSlideForward: true,
      // gate the project grid so its cards pop in when scrolled into view
      projectsGridReady: false,
      activePhotoPlace: 'sgNightFest2026',
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
        sketchpaint: {},
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
    tabSlideName() {
      return this.tabSlideForward ? 'tab-fwd' : 'tab-back'
    },

    // keep the photo-wall scroll speed roughly constant regardless of how many
    // photos there are (~4s of travel per photo)
    aboutMarqueeStyle() {
      const seconds = Math.max(20, this.aboutPhotos.length * 4)
      return { animationDuration: `${seconds}s` }
    },

    // delay para 2's word reveal until para 1 has finished (para 1 stagger 35ms
    // per word + ~0.5s word animation)
    interestsPara2Delay() {
      const words = (this.interestsIntro.para1 || '').split(/\s+/).filter(Boolean).length
      return words * 35 + 450
    },

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
    this.initBlobField()
    this.initCustomCursor()
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
      // the featured carousel + grid only mount once the projects section loads in
      if (ready) {
        this.setupFeaturedHeightSync()
        this.setupProjectsGridReveal()
      }
    },
  },

  beforeUnmount() {
    this.stopBlobField()
    this.stopCustomCursor()
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
    if (this._projectsGridObserver) {
      this._projectsGridObserver.disconnect()
      this._projectsGridObserver = null
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
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {})
      this.audioCtx = null
    }
  },

  methods: {
    initBlobField() {
      if (typeof window === 'undefined' || typeof document === 'undefined') return
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const canvas = this.resolveDomElement(this.$refs.blobFieldCanvas)
      if (!canvas) return

      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) return

      const parseRgb = (value) => {
        const cleaned = String(value || '').trim()
        const parts = cleaned.split(',').map((part) => Number.parseFloat(part.trim()))
        if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
          return [47, 111, 170]
        }
        return parts
      }

      const createBlob = (index, width, height) => {
        const baseR = Math.min(width, height) * (0.14 + Math.random() * 0.08)
        const x = width * (0.18 + Math.random() * 0.64)
        const y = height * (0.16 + Math.random() * 0.68)
        const heading = Math.random() * Math.PI * 2
        return {
          index,
          x,
          y,
          vx: Math.cos(heading) * (1.1 + Math.random() * 1.2),
          vy: Math.sin(heading) * (1.1 + Math.random() * 1.2),
          baseR,
          pulseAmp: baseR * (0.06 + Math.random() * 0.08),
          pulseFreq: 0.09 + Math.random() * 0.16,
          pulsePhase: Math.random() * Math.PI * 2,
          shapeSeedA: Math.random() * Math.PI * 2,
          shapeSeedB: Math.random() * Math.PI * 2,
          shapeSeedC: Math.random() * Math.PI * 2,
          shapeFreqA: 1.7 + Math.random() * 1.3,
          shapeFreqB: 2.3 + Math.random() * 1.6,
          shapeFreqC: 3.1 + Math.random() * 1.8,
          morphSpeedA: 0.08 + Math.random() * 0.16,
          morphSpeedB: 0.07 + Math.random() * 0.13,
          morphSpeedC: 0.05 + Math.random() * 0.12,
          hueMix: 0.2 + Math.random() * 0.6,
          heading,
          turnFreq: 0.07 + Math.random() * 0.18,
          turnRate: 0.5 + Math.random() * 0.7,
          drive: 0.025 + Math.random() * 0.035,
          targetSpeed: 0.95 + Math.random() * 1.25,
          spin: Math.random() > 0.5 ? 1 : -1,
        }
      }

      const state = {
        canvas,
        ctx,
        parseRgb,
        blobs: [],
        rafId: null,
        resizeHandler: null,
        width: 0,
        height: 0,
        dpr: 1,
        lastTs: 0,
        neonRgb: [47, 111, 170],
        accentRgb: [139, 184, 122],
      }

      this._blobFieldState = state

      const resize = () => {
        const nextDpr = Math.min(2, window.devicePixelRatio || 1)
        const nextWidth = window.innerWidth
        const nextHeight = window.innerHeight
        state.width = nextWidth
        state.height = nextHeight
        state.dpr = nextDpr
        canvas.width = Math.floor(nextWidth * nextDpr)
        canvas.height = Math.floor(nextHeight * nextDpr)
        canvas.style.width = `${nextWidth}px`
        canvas.style.height = `${nextHeight}px`
        ctx.setTransform(nextDpr, 0, 0, nextDpr, 0, 0)

        const blobCount = nextWidth < 800 ? 3 : 4
        if (!state.blobs.length) {
          state.blobs = Array.from({ length: blobCount }, (_, i) => createBlob(i, nextWidth, nextHeight))
          return
        }

        if (state.blobs.length < blobCount) {
          const missing = blobCount - state.blobs.length
          const offset = state.blobs.length
          state.blobs.push(...Array.from({ length: missing }, (_, i) => createBlob(offset + i, nextWidth, nextHeight)))
        }
        if (state.blobs.length > blobCount) {
          state.blobs.length = blobCount
        }

        state.blobs.forEach((blob) => {
          blob.x = Math.min(nextWidth, Math.max(0, blob.x))
          blob.y = Math.min(nextHeight, Math.max(0, blob.y))
          blob.baseR = Math.min(blob.baseR, Math.min(nextWidth, nextHeight) * 0.24)
        })
      }

      const syncPalette = () => {
        const rootStyles = window.getComputedStyle(document.documentElement)
        state.neonRgb = parseRgb(rootStyles.getPropertyValue('--neon-rgb'))
        state.accentRgb = parseRgb('139, 184, 122')
      }

      const drawBlob = (blob, tSeconds) => {
        const cx = blob.x
        const cy = blob.y
        const pulse = Math.sin(tSeconds * blob.pulseFreq * Math.PI * 2 + blob.pulsePhase) * blob.pulseAmp
        const radius = blob.baseR + pulse

        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.15)
        const neon = state.neonRgb
        const accent = state.accentRgb
        const innerR = Math.round(neon[0] * (1 - blob.hueMix) + accent[0] * blob.hueMix)
        const innerG = Math.round(neon[1] * (1 - blob.hueMix) + accent[1] * blob.hueMix)
        const innerB = Math.round(neon[2] * (1 - blob.hueMix) + accent[2] * blob.hueMix)
        gradient.addColorStop(0, `rgba(${innerR}, ${innerG}, ${innerB}, 0.2)`)
        gradient.addColorStop(0.5, `rgba(${innerR}, ${innerG}, ${innerB}, 0.12)`)
        gradient.addColorStop(1, `rgba(${innerR}, ${innerG}, ${innerB}, 0)`)

        ctx.beginPath()
        const points = 46
        for (let i = 0; i <= points; i += 1) {
          const a = (i / points) * Math.PI * 2
          const warpA = Math.sin(a * blob.shapeFreqA + tSeconds * blob.morphSpeedA + blob.shapeSeedA)
          const warpB = Math.sin(a * blob.shapeFreqB - tSeconds * blob.morphSpeedB + blob.shapeSeedB)
          const warpC = Math.cos(a * blob.shapeFreqC + tSeconds * blob.morphSpeedC + blob.shapeSeedC)
          const radial = radius * (1 + warpA * 0.07 + warpB * 0.05 + warpC * 0.035)
          const px = cx + Math.cos(a) * radial
          const py = cy + Math.sin(a) * radial
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
      }

      const step = (ts) => {
        const dt = Math.min(0.033, Math.max(0.008, (ts - (state.lastTs || ts)) / 1000))
        state.lastTs = ts
        const tSeconds = ts / 1000

        const w = state.width
        const h = state.height

        for (let i = 0; i < state.blobs.length; i += 1) {
          const a = state.blobs[i]

          // Self-propelled heading drift keeps motion alive without any center gravity.
          const headingNoise =
            Math.sin(tSeconds * (a.turnFreq * Math.PI * 2) + a.shapeSeedA) * 0.9 +
            Math.cos(tSeconds * (a.turnFreq * 0.73 * Math.PI * 2) + a.shapeSeedB) * 0.55
          a.heading += headingNoise * a.turnRate * dt * 0.35
          a.vx += Math.cos(a.heading) * a.drive
          a.vy += Math.sin(a.heading) * a.drive

          for (let j = i + 1; j < state.blobs.length; j += 1) {
            const b = state.blobs[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.hypot(dx, dy) || 0.0001
            const directionX = dx / dist
            const directionY = dy / dist

            // Pair interaction is only local repel + tangential swirl (no long-range attraction).
            const interactionRadius = (a.baseR + b.baseR) * 0.9
            if (dist < interactionRadius) {
              const overlap = (interactionRadius - dist) / interactionRadius
              const repel = Math.min(0.09, overlap * 0.085)
              a.vx -= directionX * repel
              a.vy -= directionY * repel
              b.vx += directionX * repel
              b.vy += directionY * repel

              const tangentX = -directionY
              const tangentY = directionX
              const swirl = repel * 0.35
              a.vx += tangentX * swirl * a.spin
              a.vy += tangentY * swirl * a.spin
              b.vx -= tangentX * swirl * b.spin
              b.vy -= tangentY * swirl * b.spin
            }
          }
        }

        state.blobs.forEach((blob) => {
          const margin = blob.baseR * 0.35
          if (blob.x < margin) {
            blob.x = margin
            blob.vx = Math.abs(blob.vx) * 0.94
            blob.heading = Math.PI - blob.heading
          } else if (blob.x > w - margin) {
            blob.x = w - margin
            blob.vx = -Math.abs(blob.vx) * 0.94
            blob.heading = Math.PI - blob.heading
          }

          if (blob.y < margin) {
            blob.y = margin
            blob.vy = Math.abs(blob.vy) * 0.94
            blob.heading = -blob.heading
          } else if (blob.y > h - margin) {
            blob.y = h - margin
            blob.vy = -Math.abs(blob.vy) * 0.94
            blob.heading = -blob.heading
          }

          blob.vx *= 0.997
          blob.vy *= 0.997

          const speed = Math.hypot(blob.vx, blob.vy)
          if (speed < blob.targetSpeed * 0.7) {
            const boost = (blob.targetSpeed * 0.7 - speed) * 0.065
            blob.vx += Math.cos(blob.heading) * boost
            blob.vy += Math.sin(blob.heading) * boost
          } else if (speed > blob.targetSpeed * 2.6) {
            const clamp = (blob.targetSpeed * 2.6) / speed
            blob.vx *= clamp
            blob.vy *= clamp
          }

          blob.x += blob.vx * dt * 60
          blob.y += blob.vy * dt * 60
        })

        ctx.clearRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'screen'
        state.blobs.forEach((blob) => drawBlob(blob, tSeconds))
        ctx.globalCompositeOperation = 'source-over'

        state.rafId = window.requestAnimationFrame(step)
      }

      state.syncPalette = syncPalette
      state.resize = resize
      syncPalette()
      resize()
      state.resizeHandler = () => resize()
      window.addEventListener('resize', state.resizeHandler, { passive: true })
      state.rafId = window.requestAnimationFrame(step)
    },

    stopBlobField() {
      const state = this._blobFieldState
      if (!state) return
      if (state.rafId) {
        cancelAnimationFrame(state.rafId)
      }
      if (state.resizeHandler) {
        window.removeEventListener('resize', state.resizeHandler)
      }
      this._blobFieldState = null
    },

    initCustomCursor() {
      if (typeof window === 'undefined' || typeof document === 'undefined') return
      if (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches) return

      const cursor = this.resolveDomElement(this.$refs.siteCursor)
      if (!cursor) return

      const interactiveSelector = [
        'a',
        'button',
        '[role="button"]',
        'input',
        'textarea',
        'select',
        'summary',
        '.btn',
        '.ctab',
        '.nav-link',
        '.nav-toggle',
        '.nav-theme-toggle',
        '.social-icon',
        '.contact-link',
        '.track',
        '.li-link',
        '.gallery-img-button',
        '.gallery-lightbox-nav',
        '.gallery-lightbox-close',
        '.photo-place-pill',
        '.vid-cat-pill',
        '.pctrl',
      ].join(', ')

      const projectCardActionSelector = [
        '.project-card .view-details-btn',
        '.project-card .proj-link',
        '.project-card .proj-view-btn',
      ].join(', ')

      // The cursor is not pinned to one z-index: it rides just above whichever
      // fixed overlay the pointer is currently inside, and drops to BASE_LAYER
      // over ordinary page content. That way an outline on a card that is half
      // scrolled under the nav gets clipped by the nav, instead of floating on
      // top of it -- while an outline on a nav button itself still shows.
      // Ordered most-specific first; values track the z-index of each overlay
      // in style.css / ProjectModal.vue.
      const BASE_CURSOR_LAYER = 99
      const cursorLayers = [
        ['.gallery-lightbox-overlay', 1003],
        ['.toast', 1002],
        ['.modal-overlay', 1001],
        ['.social-float', 201],
        ['nav', 101],
      ]

      const resolveCursorLayer = (element) => {
        if (!(element instanceof Element)) return BASE_CURSOR_LAYER
        for (const [selector, layer] of cursorLayers) {
          if (element.closest(selector)) return layer
        }
        return BASE_CURSOR_LAYER
      }

      this._cursorState = {
        el: cursor,
        currentX: window.innerWidth / 2 - 14,
        currentY: window.innerHeight / 2 - 14,
        targetX: window.innerWidth / 2 - 14,
        targetY: window.innerHeight / 2 - 14,
        currentWidth: 28,
        currentHeight: 28,
        targetWidth: 28,
        targetHeight: 28,
        currentRadius: 999,
        targetRadius: 999,
        currentScale: 1,
        targetScale: 1,
        visible: false,
        borderMode: false,
        isDown: false,
        activeTarget: null,
        suppressNativeBorder: false,
        layer: BASE_CURSOR_LAYER,
        appliedLayer: null,
        lastX: null,
        lastY: null,
        revalidateTick: 0,
        rafId: null,
      }

      const canSuppressNativeBorder = (element) => {
        return element.matches(
          '.nav-links a, .nav-toggle, .nav-theme-toggle, .ctab, .photo-place-pill, .vid-cat-pill, .contact-link, .kofi-button, .btn, .pctrl, .gallery-lightbox-nav, .gallery-lightbox-close, .li-link, .social-icon, .view-details-btn, .proj-link, .proj-view-btn'
        )
      }

      const isAllowedProjectCardTarget = (target) => {
        if (!(target instanceof Element)) return false
        return target.matches(projectCardActionSelector)
      }

      const resolveInteractiveTarget = (element) => {
        if (!(element instanceof Element)) return null
        const target = element.closest(interactiveSelector)
        if (!target) return null

        // Keep card containers free-move, but still allow card action controls.
        if (target.closest('.project-card') && !isAllowedProjectCardTarget(target)) {
          return null
        }

        return target
      }

      const resetToDotMode = (state) => {
        clearNativeBorderSuppression(state)
        state.activeTarget = null
        state.borderMode = false
        state.targetWidth = 28
        state.targetHeight = 28
        state.targetRadius = 999
        state.targetScale = state.isDown ? 0.88 : 1
      }

      const setActiveTarget = (state, target) => {
        if (!state) return
        if (!target) {
          resetToDotMode(state)
          return
        }

        if (state.activeTarget && state.activeTarget !== target) {
          clearNativeBorderSuppression(state)
        }

        state.activeTarget = target
        state.visible = true
        state.borderMode = true
        syncCursorToTarget(state, target)
        state.targetScale = 1

        state.suppressNativeBorder = canSuppressNativeBorder(target)
        if (state.suppressNativeBorder) {
          target.classList.add('cursor-outline-active')
        }
      }

      const syncCursorToTarget = (state, target) => {
        const rect = target.getBoundingClientRect()
        const targetStyle = window.getComputedStyle(target)
        const minSide = Math.max(1, Math.min(rect.width, rect.height))
        const borderRadius = Number.parseFloat(targetStyle.borderRadius) || 0
        const isTabLike = target.matches('.ctab, .photo-place-pill, .vid-cat-pill, .nav-links a, .contact-link')
        const isControlLike = target.matches('button, .btn, .nav-toggle, .nav-theme-toggle, .gallery-lightbox-nav, .gallery-lightbox-close, .pctrl')
        const padding = isTabLike ? 2 : isControlLike ? 3 : 2
        const clampedRadius = Math.max(2, Math.min(borderRadius, minSide * 0.5))
        state.targetX = rect.left - padding
        state.targetY = rect.top - padding
        state.targetWidth = rect.width + padding * 2
        state.targetHeight = rect.height + padding * 2
        state.targetRadius = clampedRadius + Math.min(2, padding)
      }

      const clearNativeBorderSuppression = (state) => {
        if (state?.activeTarget && state.suppressNativeBorder) {
          state.activeTarget.classList.remove('cursor-outline-active')
        }
        if (state) {
          state.suppressNativeBorder = false
        }
      }

      const step = () => {
        const state = this._cursorState
        if (!state) return

        // Cheap poll (~15x/sec) so an outline left behind by something opening
        // or scrolling under a stationary pointer clears itself, rather than
        // hanging around until the next mouse move.
        state.revalidateTick = (state.revalidateTick + 1) % 4
        if (state.revalidateTick === 0 && state.visible && state.lastX !== null) {
          updateCursorFromPoint(state, state.lastX, state.lastY)
        }

        if (state.borderMode && state.activeTarget instanceof Element && state.activeTarget.isConnected) {
          syncCursorToTarget(state, state.activeTarget)
        }

        if (state.layer !== state.appliedLayer) {
          state.el.style.zIndex = String(state.layer)
          state.appliedLayer = state.layer
        }

        state.currentX += (state.targetX - state.currentX) * 0.18
        state.currentY += (state.targetY - state.currentY) * 0.18
        state.currentWidth += (state.targetWidth - state.currentWidth) * 0.2
        state.currentHeight += (state.targetHeight - state.currentHeight) * 0.2
        state.currentRadius += (state.targetRadius - state.currentRadius) * 0.2
        state.currentScale += (state.targetScale - state.currentScale) * 0.15

        state.el.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0) scale(${state.currentScale})`
        state.el.style.width = `${state.currentWidth}px`
        state.el.style.height = `${state.currentHeight}px`
        state.el.style.borderRadius = `${state.currentRadius}px`
        state.el.classList.toggle('is-visible', state.visible)
        state.el.classList.toggle('is-border-mode', state.borderMode)
        state.el.classList.toggle('is-down', state.isDown)
        state.rafId = window.requestAnimationFrame(step)
      }

      // Re-resolve everything from a viewport point. Called on pointermove and,
      // less often, from the rAF loop -- the page can change under a stationary
      // pointer (lightbox opens, modal opens, scroll) and the outline must not
      // stay latched to a target that is no longer under the cursor.
      const updateCursorFromPoint = (state, x, y) => {
        const hoveredElement = document.elementFromPoint(x, y)
        state.layer = resolveCursorLayer(hoveredElement)

        const target = resolveInteractiveTarget(hoveredElement)

        if (target) {
          if (state.activeTarget !== target || !state.borderMode) {
            setActiveTarget(state, target)
          }
          return
        }

        if (!state.borderMode || state.activeTarget) {
          resetToDotMode(state)
        }

        if (!state.borderMode) {
          state.targetX = x - 14
          state.targetY = y - 14
          state.targetWidth = 28
          state.targetHeight = 28
          state.targetRadius = 999
        }
      }

      this._cursorMoveHandler = (event) => {
        const state = this._cursorState
        if (!state) return
        state.visible = true
        state.lastX = event.clientX
        state.lastY = event.clientY
        updateCursorFromPoint(state, event.clientX, event.clientY)
      }

      this._cursorDownHandler = () => {
        const state = this._cursorState
        if (!state) return
        state.isDown = true
        state.targetScale = state.borderMode ? 0.96 : 0.88
      }

      this._cursorUpHandler = () => {
        const state = this._cursorState
        if (!state) return
        state.isDown = false
        state.targetScale = 1
      }

      this._cursorLeaveHandler = () => {
        const state = this._cursorState
        if (!state) return
        clearNativeBorderSuppression(state)
        state.visible = false
        state.borderMode = false
        state.activeTarget = null
        state.isDown = false
        state.targetScale = 1
        state.targetWidth = 28
        state.targetHeight = 28
        state.targetRadius = 999
      }

      document.body.classList.add('cursor-enabled')
      window.addEventListener('pointermove', this._cursorMoveHandler, { passive: true })
      window.addEventListener('pointerdown', this._cursorDownHandler)
      window.addEventListener('pointerup', this._cursorUpHandler)
      window.addEventListener('blur', this._cursorLeaveHandler)
      document.addEventListener('mouseleave', this._cursorLeaveHandler)

      this._cursorState.rafId = window.requestAnimationFrame(step)
    },

    stopCustomCursor() {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('cursor-enabled')
      }

      if (this._cursorState?.activeTarget && this._cursorState.suppressNativeBorder) {
        this._cursorState.activeTarget.classList.remove('cursor-outline-active')
      }

      if (this._cursorState?.rafId) {
        cancelAnimationFrame(this._cursorState.rafId)
      }

      if (this._cursorMoveHandler) {
        window.removeEventListener('pointermove', this._cursorMoveHandler)
        this._cursorMoveHandler = null
      }
      if (this._cursorDownHandler) {
        window.removeEventListener('pointerdown', this._cursorDownHandler)
        this._cursorDownHandler = null
      }
      if (this._cursorUpHandler) {
        window.removeEventListener('pointerup', this._cursorUpHandler)
        this._cursorUpHandler = null
      }
      if (this._cursorLeaveHandler) {
        window.removeEventListener('blur', this._cursorLeaveHandler)
        document.removeEventListener('mouseleave', this._cursorLeaveHandler)
        this._cursorLeaveHandler = null
      }

      this._cursorState = null
    },

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

    // Render the project grid (and fire its pop-in) only once the grid area is
    // actually scrolled into view, rather than when the section lazy-mounts.
    setupProjectsGridReveal() {
      if (this.projectsGridReady) return

      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion || typeof IntersectionObserver === 'undefined') {
        this.projectsGridReady = true
        return
      }

      this.$nextTick(() => {
        const sentinel = this.resolveDomElement(this.$refs.projectsGridSentinel)
        if (!sentinel) {
          this.projectsGridReady = true
          return
        }

        this._projectsGridObserver = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.projectsGridReady = true
                obs.disconnect()
              }
            })
          },
          { threshold: 0, rootMargin: '0px 0px -5% 0px' }
        )
        this._projectsGridObserver.observe(sentinel)
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

      let pos = 0
      let initialized = false

      const step = () => {
        const track = this.resolveDomElement(this.$refs.featuredScroll)
        if (track) {
          const max = track.scrollWidth - track.clientWidth
          if (this.featuredScrollPaused) {
            pos = track.scrollLeft
            initialized = true
          } else if (max > 0) {
            if (!initialized) {
              pos = track.scrollLeft
              initialized = true
            }
            pos += 0.5
            if (pos >= max) pos = 0
            track.scrollLeft = pos
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
      if (this._blobFieldState?.syncPalette) {
        this._blobFieldState.syncPalette()
      }
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
      if (section === 'sketchpaint') return this.sketchPaintItems
      if (section === 'photo') return this.activePhotoItems
      return []
    },

    gallerySectionLabel(section) {
      if (section === 'clay') return 'Clay Models'
      if (section === 'sketchpaint') return 'Sketch & Paint'
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

    selectCategory(catId/*, evt */) {
      if (catId === this.activeCat) return
      // slide direction from the relative position of the clicked tab
      const order = this.interestCategories.map((cat) => cat.id)
      this.tabSlideForward = order.indexOf(catId) >= order.indexOf(this.activeCat)
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

    // iOS locks <audio>.volume to the hardware buttons (setting it in JS is ignored),
    // so route playback through a Web Audio GainNode whose gain IS adjustable — this
    // makes the volume slider work on mobile too.
    ensureAudioGraph() {
      if (this.gainNode || typeof window === 'undefined') return
      const audio = this.getAudio()
      if (!audio) return
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      try {
        this.audioCtx = new AudioCtx()
        this.mediaSource = this.audioCtx.createMediaElementSource(audio)
        this.gainNode = this.audioCtx.createGain()
        this.mediaSource.connect(this.gainNode)
        this.gainNode.connect(this.audioCtx.destination)
        this.applyVolume()
      } catch (e) {
        // createMediaElementSource throws if the element is already tapped — ignore
      }
    },

    resumeAudioCtx() {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {})
      }
    },

    applyVolume() {
      const audio = this.getAudio()
      if (this.gainNode) {
        this.gainNode.gain.value = this.volume
        // the element volume must stay at 1, else it double-attenuates the gain
        if (audio) audio.volume = 1
      } else if (audio) {
        audio.volume = this.volume
      }
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
      audio.load()
      this.ensureAudioGraph()
      this.resumeAudioCtx()
      this.applyVolume()
      audio.play().then(() => { this.isPlaying = true }).catch(() => {})
      this.scheduleLyricsScroll()
    },

    togglePlay() {
      const audio = this.getAudio()
      if (!audio) return
      if (this.currentTrackIdx === null) { this.selectTrack(0); return }
      if (this.isPlaying) { audio.pause(); this.isPlaying = false }
      else {
        this.ensureAudioGraph()
        this.resumeAudioCtx()
        audio.play().then(() => { this.isPlaying = true }).catch(() => {})
      }
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
      this.applyVolume()
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

