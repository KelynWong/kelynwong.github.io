import ProjectCard from './components/ProjectCard.vue'
import ProjectModal from './components/ProjectModal.vue'
import ThreeJSModel from './components/ThreeJSModel.vue'
import Footer from './components/Footer.vue'
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
} from './data/index.js'


function buildPhotoGroup(id, label, year, count, extOverrides = {}) {
  return {
    id,
    label,
    items: Array.from({ length: count }, (_, idx) => {
      const i = idx + 1
      const ext = extOverrides[i] || 'JPG'
      return {
        id: i,
        title: `${label} #${i}`,
        location: label,
        year,
        img: `/src/assets/images/photography/${id}/${i}.${ext}`,
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

      // UI state
      activeCat: 'clay',
      activePhotoPlace: 'dopamineLand2026',
      activeVideoCat: 'travel',

      photoGroups: photoGroupDefs.map((d) => buildPhotoGroup(d.id, d.label, d.year, d.count, d.extOverrides || {})),

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
      galleryAspects: {
        clay: {},
        drawing: {},
        photo: {},
      },
      galleryLightboxOpen: false,
      galleryLightboxSection: '',
      galleryLightboxItems: [],
      galleryLightboxIndex: 0,

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
    currentTrack() {
      return this.currentTrackIdx !== null ? this.tracks[this.currentTrackIdx] : null
    },
    currentGalleryLightboxItem() {
      return this.galleryLightboxItems[this.galleryLightboxIndex] || null
    },
    groupedProjects() {
      const grouped = PROJECT_CATEGORY_ORDER.map((category) => ({
        ...category,
        items: this.projects.filter((project) => (project.category || 'fullstack') === category.key),
      }))

      const uncategorized = this.projects.filter(
        (project) => !PROJECT_CATEGORY_ORDER.some((category) => category.key === (project.category || 'fullstack'))
      )

      if (uncategorized.length) {
        grouped.push({ key: 'other', label: 'Other Projects', items: uncategorized })
      }

      return grouped.filter((group) => group.items.length)
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
  },

  mounted() {
    this.fitHeroVerbs()
    this._heroResizeHandler = () => this.fitHeroVerbs()
    this._socialScrollHandler = () => this.triggerSocialBounce()
    this._galleryKeyHandler = (event) => this.handleGalleryKeydown(event)
    window.addEventListener('resize', this._heroResizeHandler)
    window.addEventListener('scroll', this._socialScrollHandler, { passive: true })
    window.addEventListener('keydown', this._galleryKeyHandler)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.fitHeroVerbs())
    }
    this.startHeroTypingSequence()
  },

  beforeUnmount() {
    if (this._heroResizeHandler) {
      window.removeEventListener('resize', this._heroResizeHandler)
    }
    if (this._socialScrollHandler) {
      window.removeEventListener('scroll', this._socialScrollHandler)
    }
    if (this._galleryKeyHandler) {
      window.removeEventListener('keydown', this._galleryKeyHandler)
    }
    this.stopHeroTypingSequence()
  },

  methods: {
    fitHeroVerbs() {
      const heroLeft = document.querySelector('.hero-left')
      const heroVerbs = document.querySelector('.hero-verbs')
      if (!heroLeft || !heroVerbs) return

      heroVerbs.style.fontSize = ''
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
      if (section === 'clay') return this.clayItems
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

    openGalleryLightbox(section, items, startIndex = 0) {
      this.galleryLightboxSection = section
      this.galleryLightboxItems = Array.isArray(items) ? items : []
      this.galleryLightboxIndex = startIndex
      this.galleryLightboxOpen = true
      document.body.style.overflow = 'hidden'
    },

    closeGalleryLightbox() {
      this.galleryLightboxOpen = false
      this.galleryLightboxSection = ''
      this.galleryLightboxItems = []
      this.galleryLightboxIndex = 0
      document.body.style.overflow = ''
    },

    nextGalleryImage() {
      if (!this.galleryLightboxItems.length) return
      this.galleryLightboxIndex = (this.galleryLightboxIndex + 1) % this.galleryLightboxItems.length
    },

    prevGalleryImage() {
      if (!this.galleryLightboxItems.length) return
      this.galleryLightboxIndex =
        (this.galleryLightboxIndex - 1 + this.galleryLightboxItems.length) % this.galleryLightboxItems.length
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

