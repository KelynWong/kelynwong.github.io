<template>
  <div id="app">
    <nav class="nav" :class="{ 'nav-open': isNavOpen }">
      <div class="nav-logo"><img :src="logoSrc" alt="logo" style="max-height: 32px;" @error="handleThemeImageError($event, logoDarkSrc)"></div>
      <div class="nav-links" :class="{ 'nav-links-open': isNavOpen }">
        <a v-for="link in appText.navLinks" :key="link.href" :href="link.href" @click.prevent="handleNavLinkClick(link.href)">{{ link.label }}</a>
      </div>
      <button class="nav-theme-toggle" type="button" @click="toggleTheme" :aria-label="themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <svg class="theme-toggle-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <mask id="themeToggleMask">
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <circle class="theme-toggle-cutout" cx="17" cy="11" r="6" fill="black" />
          </mask>
          <circle class="theme-toggle-core" cx="12" cy="12" r="6" fill="currentColor" mask="url(#themeToggleMask)" />
          <g class="theme-toggle-rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="1.5" x2="12" y2="3.5" />
            <line x1="12" y1="20.5" x2="12" y2="22.5" />
            <line x1="3.5" y1="3.5" x2="4.9" y2="4.9" />
            <line x1="19.1" y1="19.1" x2="20.5" y2="20.5" />
            <line x1="1.5" y1="12" x2="3.5" y2="12" />
            <line x1="20.5" y1="12" x2="22.5" y2="12" />
            <line x1="3.5" y1="20.5" x2="4.9" y2="19.1" />
            <line x1="19.1" y1="4.9" x2="20.5" y2="3.5" />
          </g>
        </svg>
      </button>
      <button class="nav-toggle" type="button" @click="isNavOpen = !isNavOpen" :aria-expanded="isNavOpen" aria-label="Toggle navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <section id="hero" class="hero">
      <div class="hero-left">
        <div class="hero-hello">Hello there! My name is</div>
        <h1 class="hero-name">{{ typedHeroName }}<span class="typing-caret" aria-hidden="true"></span></h1>
        <div class="hero-iam">I am a</div>
        <h2 class="hero-role">{{ typedHeroRole }}<span class="typing-caret" aria-hidden="true"></span></h2>
        <div class="hero-i-prefix">I...</div>
        <div class="hero-verbs-wrap">
          <div class="hero-verbs">
            <span
              v-for="(token, idx) in typedHeroVerbTokens"
              :key="`verb-${idx}`"
              :class="`hero-verb-tone-${(idx % 4) + 1}`"
            >{{ token }}</span><span class="typing-caret" aria-hidden="true"></span>
          </div>
          <div class="hero-avatar-wrap">
            <div class="hero-avatar-glow"></div>
            <img src="./assets/images/computer.png" alt="Kelyn bitmoji at laptop" />
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-annotation">
          <svg class="annotation-arrow" viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M52 4 C40 4, 10 8, 6 38" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round" fill="none" />
            <path d="M2 34 L6 38 L10 32" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
          <p class="annotation-text" v-html="appText.annotationText.replace(/\n/g, '<br>')"></p>
        </div>

        <div class="hero-model-wrap">
          <ThreeJSModel :theme-mode="themeMode" />
        </div>

        <div class="hero-3d-hint">
          <div class="hint-dot"></div>
          {{ appText.hero3dHint }}
        </div>
      </div>
      <div class="hero-scroll">
        <div class="scroll-line"></div>
        <span>{{ appText.heroScrollText }}</span>
      </div>
    </section>

    <div class="social-float">
      <a href="https://github.com/kelynwong" class="social-icon" target="_blank" title="GitHub">
        <svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
      </a>
      <a href="https://linkedin.com/in/kelyn-wong" class="social-icon" target="_blank" title="LinkedIn">
        <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href="https://instagram.com/_kelynwong_" class="social-icon" target="_blank" title="Instagram">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a>
      <a href="https://facebook.com/kelynwong.9" class="social-icon" target="_blank" title="Facebook">
        <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href="https://twitter.com/_kelynwong_" class="social-icon" target="_blank" title="Twitter / X">
        <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>

    <section id="about" class="section">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">01.</span>
          <span class="sec-title">{{ appText.sectionTitles.about }}</span>
          <div class="sec-line"></div>
        </div>
        <div class="about-grid">
            <div class="about-text" v-reveal>
              <p v-for="(p, idx) in appText.aboutParagraphs" :key="idx" v-html="p"></p>
            </div>
          <div class="skills-block">
            <div class="skills-label" v-reveal>{{ appText.skillsLabel }}</div>
            <div v-for="(group, idx) in skillGroups" :key="group.name" class="skill-group" v-reveal="{ delay: idx * 90 }">
              <div class="skill-group-name">{{ group.name }}</div>
              <div class="skill-chips">
                <span v-for="skill in group.skills" :key="skill.name" :class="['chip', skill.color]">
                  {{ skill.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="work" class="section">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">02.</span>
          <span class="sec-title">{{ appText.sectionTitles.work }}</span>
          <div class="sec-line"></div>
        </div>
        <div v-for="job in jobs" :key="job.filename" class="job-block" v-reveal>
          <div class="job-header">
            <div class="job-header-left">
              <div class="job-dots">
                <div class="dot dot-red"></div>
                <div class="dot dot-yellow"></div>
                <div class="dot dot-green"></div>
              </div>
              <span class="job-filename">{{ job.filename }}</span>
            </div>
            <span class="job-date">{{ job.period }}</span>
          </div>
          <div class="job-body">
            <div v-for="(line, i) in job.codeLines" :key="i" class="code-line">
              <span class="ln">{{ i + 1 }}</span>
              <span class="code-content" v-html="line"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="education" class="section">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">03.</span>
          <span class="sec-title">{{ appText.sectionTitles.education }}</span>
          <div class="sec-line"></div>
        </div>
        <div class="edu-items">
          <div v-for="(edu, idx) in education" :key="edu.school" class="edu-card" v-reveal="{ delay: idx * 110 }">
            <div class="edu-card-header">
              <div class="edu-tab-bar">
                <div class="edu-tab edu-tab-active">{{ edu.tabName }}</div>
                <div class="edu-tab edu-tab-inactive">notes.md</div>
              </div>
              <span class="edu-status" :class="edu.ongoing ? 'status-ongoing' : 'status-done'">
                {{ edu.ongoing ? '● active' : '✓ completed' }}
              </span>
            </div>
            <div class="edu-card-body">
              <div class="edu-code-block">
                <div class="code-line">
                  <span class="ln">1</span>
                  <span class="code-content"><span class="kw">class</span> <span class="fn">{{ edu.className }}</span> <span class="punc">{</span></span>
                </div>
                <div class="code-line">
                  <span class="ln">2</span>
                  <span class="code-content">&nbsp;&nbsp;<span class="prop">school</span><span class="punc">:</span> <span class="str edu-school">"{{ edu.school }}"</span><span class="punc">;</span></span>
                </div>
                <div class="code-line">
                  <span class="ln">3</span>
                  <span class="code-content">&nbsp;&nbsp;<span class="prop">degree</span><span class="punc">:</span> <span class="edu-degree">"{{ edu.degree }}"</span><span class="punc">;</span></span>
                </div>
                <div class="code-line">
                  <span class="ln">4</span>
                  <span class="code-content">&nbsp;&nbsp;<span class="prop">period</span><span class="punc">:</span> <span class="edu-period">{{ edu.period }}</span><span class="punc">;</span></span>
                </div>
                <div v-if="edu.gpa" class="code-line">
                  <span class="ln">5</span>
                  <span class="code-content">&nbsp;&nbsp;<span class="prop">gpa</span><span class="punc">:</span> <span class="num">{{ edu.gpa }}</span><span class="punc">;</span></span>
                </div>
                <div class="code-line">
                  <span class="ln" style="padding-top:4px">{{ edu.gpa ? 6 : 5 }}</span>
                  <span class="code-content"><span class="punc">}</span></span>
                </div>
              </div>
              <div class="edu-desc">{{ edu.desc }}</div>
              <div class="edu-tags">
                <span v-for="tag in edu.tags" :key="tag" class="chip chip-gray">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->

    <!-- Projects Section -->
    <section id="projects" class="section" data-load-section="projects">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">04.</span>
          <span class="sec-title">{{ appText.sectionTitles.projects }}</span>
          <div class="sec-line"></div>
        </div>
        <template v-if="isSectionReady('projects')">
          <div class="projects-groups">
            <div v-if="featuredProjectSlides.length" class="projects-featured">
              <div class="projects-featured-carousel" ref="featuredProjectCarousel" :style="featuredCarouselStyle" aria-label="Featured projects carousel">
                <div
                  v-for="slide in featuredProjectSlides"
                  :key="slide.project.id"
                  class="projects-featured-slot"
                  :class="slide.positionClass"
                >
                  <ProjectCard
                    :project="slide.project"
                    @open-project="activeProject = $event; showProjectModal = true; currentImageIndex = 0; videoVisible = false"
                  />
                </div>
              </div>
            </div>
            <div class="projects-filter-row">
              <FilterPills
                :items="projectCategories"
                :active="activeProjectFilter"
                @select="setProjectFilter"
                :show-all="true"
                all-label="All"
                button-class="ctab projects-filter-pill"
              />
            </div>
            <div v-for="group in groupedProjects" :key="group.key" class="projects-group">
              <div class="projects-group-header">
                <div class="projects-group-title">{{ group.label }}</div>
                <div class="projects-group-count">{{ group.items.length }} project{{ group.items.length === 1 ? '' : 's' }}</div>
              </div>
              <transition-group name="projects" tag="div" class="projects-grid" appear>
                <ProjectCard
                  v-for="proj in group.items"
                  :key="proj.id"
                  :project="proj"
                  @open-project="activeProject = $event; showProjectModal = true; currentImageIndex = 0; videoVisible = false"
                />
              </transition-group>
            </div>
          </div>
        </template>
        <div v-else class="section-loader" aria-busy="true" aria-live="polite">
          <div class="section-loader-copy">
            <div class="section-loader-kicker">Loading projects</div>
            <div class="section-loader-title">Coding up the full stack, frontend, backend, mobile and IoT projects...</div>
            <div class="section-loader-text">Please be patient, I promise it is worth the wait!</div>
          </div>
          <div class="section-loader-grid projects-loader-grid">
            <div v-for="n in 6" :key="`projects-loader-${n}`" class="section-loader-card">
              <div class="section-loader-thumb"></div>
              <div class="section-loader-line section-loader-line-lg"></div>
              <div class="section-loader-line"></div>
              <div class="section-loader-chip-row">
                <span v-for="chip in 3" :key="chip" class="section-loader-chip"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured / LinkedIn Section -->
    <section id="featured" class="section">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">05.</span>
          <span class="sec-title">{{ appText.sectionTitles.featured }}</span>
          <div class="sec-line"></div>
        </div>
        <p class="featured-intro">{{ featuredIntro }}</p>
        <div class="featured-strip">
          <div
            class="featured-track"
            ref="featuredScroll"
            @mouseenter="pauseFeaturedScroll"
            @mouseleave="resumeFeaturedScroll"
            @touchstart="pauseFeaturedScroll"
            @touchend="resumeFeaturedScroll"
          >
            <article
              v-for="post in featuredPosts"
              :key="post.id"
              class="featured-card li-card"
              :class="post.platform === 'instagram' ? 'li-ig' : 'li-in'"
            >
              <header class="li-card-head">
                <span class="li-avatar" :style="post.avatarColor ? { background: post.avatarColor } : null" aria-hidden="true">{{ post.avatar }}</span>
                <div class="li-meta">
                  <div class="li-author">{{ post.author }}</div>
                  <div v-if="post.subtitle" class="li-sub">{{ post.subtitle }}</div>
                  <div v-if="post.date" class="li-date">
                    {{ post.date }} · 
                    <span aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display: inline-block; vertical-align: text-bottom;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </span>
                  </div>
                </div>
                <svg v-if="post.platform === 'instagram'" class="li-brand" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <svg v-else class="li-brand" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </header>

              <div
                class="li-text clamped"
                :data-post-id="post.id"
                ref="featuredText"
                v-html="formatPostText(post.text)"
              ></div>
              <span v-if="featuredNeedsToggle[post.id]" class="li-more" aria-hidden="true">…more</span>

              <footer class="li-foot">
                <span class="li-stats">
                  <span class="li-react" aria-hidden="true">{{ post.reactions }} {{ post.platform === 'instagram' ? 'likes' : 'reactions' }}</span>
                  <template v-if="post.comments"> · {{ post.comments }} comment{{ post.comments === 1 ? '' : 's' }}</template>
                </span>
                <a :href="post.url" target="_blank" rel="noreferrer noopener" class="li-link">View on {{ post.platform === 'instagram' ? 'Instagram' : 'LinkedIn' }} 
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="external-icon">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Interests Section -->
    <section id="interests" class="section" data-load-section="interests">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">06.</span>
          <span class="sec-title">{{ appText.sectionTitles.interests }}</span>
          <div class="sec-line"></div>
        </div>
        <template v-if="isSectionReady('interests')">
          <p class="interests-text">
            {{ interestsIntro.para1 }}
          </p>
          <p class="interests-text">
            {{ interestsIntro.para2 }}
          </p>
          <div class="creative-tabs">
            <FilterPills
              :items="interestCategories"
              :active="activeCat"
              @select="selectCategory"
              :show-all="false"
              button-class="ctab"
            />
          </div>
          <div v-for="cat in interestCategories" :key="cat.id" v-show="activeCat === cat.id">
            <div class="cat-backstory">
              <div class="cat-backstory-icon">{{ cat.icon }}</div>
              <div class="cat-backstory-text">
                <div class="cat-backstory-title">{{ cat.name }}</div>
                <p>{{ cat.story }}</p>
              </div>
            </div>

            <div v-if="cat.id === 'clay'" class="gallery-grid">
              <div v-for="(item, idx) in clayItemsForTheme" :key="item.id" class="gallery-item" :class="{ 'gallery-item-landscape': isGalleryLandscape('clay', item.id) }">
                <button class="gallery-img-wrap gallery-img-button" :style="galleryImageStyle('clay', item.id)" @click="openGalleryLightbox('clay', clayItemsForTheme, idx)">
                  <img
                    v-if="item.img"
                    :key="`${themeMode}-${item.id}`"
                    :src="item.img"
                    :alt="item.title"
                    loading="lazy"
                    @load="recordGalleryAspect('clay', item.id, $event)"
                    @error="handleThemeImageError($event, item.img)"
                  />
                  <div v-else class="gallery-placeholder"><span>🏺</span><span>{{ appText.placeholders.clay }}</span></div>
                </button>
                <div class="gallery-caption">
                  <div class="gallery-caption-title">{{ item.title }}</div>
                  <div class="gallery-caption-sub">{{ item.description }}</div>
                </div>
              </div>
              <div class="gallery-item add-more-card"><span>{{ appText.moreComing.clay }}</span></div>
            </div>

            <div v-if="cat.id === 'photo'">
              <div class="photo-place-tabs">
                <FilterPills
                  :items="photoPlaces"
                  :active="activePhotoPlace"
                  @select="selectPhotoPlace"
                  :show-all="false"
                  button-class="ctab photo-place-pill"
                  :show-counts="true"
                />
                <button class="photo-place-pill pill-muted" type="button" disabled>
                  {{ appText.moreComing.photo }}
                </button>
              </div>

              <div class="gallery-grid">
                <div v-for="(item, idx) in activePhotoItems" :key="`${activePhotoPlace}-${item.id}`" class="gallery-item" :class="{ 'gallery-item-landscape': isGalleryLandscape('photo', activePhotoPlace + '-' + item.id) }">
                  <button class="gallery-img-wrap gallery-img-button" :style="galleryImageStyle('photo', activePhotoPlace + '-' + item.id)" @click="openGalleryLightbox('photo', activePhotoItems, idx)">
                    <img v-if="item.img" :src="item.img" :alt="item.title" loading="lazy" @load="recordGalleryAspect('photo', activePhotoPlace + '-' + item.id, $event)" />
                    <div v-else class="gallery-placeholder"><span>📷</span><span>{{ appText.placeholders.photo }}</span></div>
                  </button>
                  <div class="gallery-caption">
                    <div class="gallery-caption-title">{{ item.title }}</div>
                    <div class="gallery-caption-sub">{{ item.location }} · {{ item.year }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="cat.id === 'video'">
              <div class="vid-cat-bar">
                <button
                  v-for="vc in videoCats"
                  :key="vc.id"
                  class="vid-cat-pill"
                  :class="{ active: activeVideoCat === vc.id }"
                  @click="selectVideoCat(vc.id, $event)"
                >
                  <span class="vid-cat-icon">{{ vc.icon }}</span>
                  {{ vc.label }}
                  <span class="vid-cat-count">{{ vc.count }}</span>
                </button>
                <button class="vid-cat-pill pill-muted" type="button" disabled>
                  more content coming soon...
                </button>
              </div>

              <div v-if="activeVideoCat === 'travel'" class="vid-video-list">
                <div v-for="row in activeVideoRows" :key="row[0]?.key || 'travel-row'" class="vid-video-row">
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
                            :src="ytEmbed(block.id, block.shorts)"
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

              <div v-if="activeVideoCat === 'recaps'" class="vid-video-list">
                <div v-for="row in activeVideoRows" :key="row[0]?.key || 'recaps-row'" class="vid-video-row">
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
                            :src="ytEmbed(block.id, block.shorts)"
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

              <div v-if="activeVideoCat === 'beatsaber'">
                <div class="vid-bs-grid">
                  <a
                    v-for="v in videoBeatSaber"
                    :key="v.id"
                    :href="'https://youtube.com/shorts/' + v.id"
                    target="_blank"
                    class="vid-bs-card"
                  >
                    <div class="vid-bs-thumb">
                      <img :src="'https://img.youtube.com/vi/' + v.id + '/mqdefault.jpg'" :alt="v.title" loading="lazy" />
                      <div class="vid-bs-play">▶</div>
                      <div v-if="v.multi" class="vid-bs-badge">multiplayer</div>
                    </div>
                    <div class="vid-bs-info">
                      <div class="vid-bs-title">{{ v.title }}</div>
                      <div class="vid-bs-artist">{{ v.artist }}</div>
                    </div>
                  </a>
                </div>
                <div class="creative-note">// opens on YouTube — 39 clips and counting 🎮</div>
              </div>

              <div v-if="activeVideoCat === 'tiktoks'" class="vid-video-list">
                <div v-for="row in activeVideoRows" :key="row[0]?.key || 'tiktoks-row'" class="vid-video-row">
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
                            :src="ytEmbed(block.id, block.shorts)"
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
            </div>

            <div v-if="cat.id === 'music'" class="music-player-tab">
            <div class="music-player">
              <div class="player-bar">
                <div class="player-now-playing">
                  <div class="player-art">
                    <img :src="currentTrack ? currentTrack.cover : '/src/assets/images/favicon.ico'" :alt="currentTrack ? `${currentTrack.displayTitle} cover art` : 'music cover art'" />
                  </div>
                  <div class="player-info">
                    <div class="player-track-name">{{ currentTrack ? currentTrack.displayTitle : 'Select a track below' }}</div>
                    <div class="player-track-sub">{{ currentTrack ? currentTrack.detail : '— —' }}</div>
                  </div>
                </div>

                <div class="player-center">
                  <div class="player-controls">
                    <button class="pctrl" @click="prevTrack" title="Previous">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                      </svg>
                    </button>

                    <button class="pctrl pplay" @click="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
                      <svg v-if="isPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>

                    <button class="pctrl" @click="nextTrack" title="Next">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6zm10-12h2v12h-2z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="player-time">
                    <span>{{ formatTime(currentTime) }}</span>
                    <div class="player-progress-wrap" @click="seekTo($event)">
                      <div class="player-progress-bg"></div>
                      <div class="player-progress-fill" :style="{width: progressPct + '%'}"></div>
                    </div>
                    <span>{{ formatTime(duration) }}</span>
                  </div>
                </div>

                <div class="player-volume">
                  <span class="volume-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </span>
                  <input
                    class="volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="volume"
                    @input="setVolume"
                    :style="{ '--volume-level': `${volume * 100}%` }"
                    aria-label="Volume"
                  />
                  <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
                </div>
              </div>
              <div class="lyrics-sync-shell">
                <div class="lyrics-sync-header">
                  <div class="lyrics-sync-title">Lyrics</div>
                  <div class="lyrics-sync-meta">{{ currentTrack ? currentTrack.displayTitle + ' - ' + currentTrack.detail : 'No track selected' }}</div>
                </div>

                <div class="lyrics-sync-stage">
                  <div class="lyrics-sync-list" ref="lyricsScrollList">
                    <div class="lyrics-sync-track" ref="lyricsTrackList">
                      <div class="lyrics-sync-spacer" aria-hidden="true"></div>
                      <div
                        v-for="line in visibleLyricLines"
                        :key="`${currentTrack.src}-${line.time}-${line.text}`"
                        class="lyrics-sync-line"
                        :class="{ active: line.isActive }"
                        :style="{ '--line-opacity': line.opacity }"
                      >
                        <span class="lyrics-sync-line-text">{{ line.text }}</span>
                      </div>
                      <div class="lyrics-sync-spacer" aria-hidden="true"></div>
                    </div>
                    <div v-if="!currentTrackLyricsEntries.length" class="lyrics-sync-empty">
                      select a track below
                    </div>
                  </div>
                  <div class="lyrics-sync-focus" ref="lyricsFocusBox" aria-hidden="true"></div>
                </div>
              </div>
              <div class="music-grid">
                <div
                  v-for="(track, i) in tracks"
                  :key="track.src"
                  class="track"
                  :class="{active: currentTrackIdx === i}"
                  @click="selectTrack(i)"
                >
                  <span class="track-num">{{ String(i + 1).padStart(2, '0') }}</span>
                  <div>
                    <div class="track-name">{{ track.displayTitle }}</div>
                    <div class="track-detail">{{ track.detail }}</div>
                  </div>
                  <div class="track-tags">
                    <span
                      v-for="(genre, gIndex) in track.genre"
                      :key="gIndex"
                      class="track-tag"
                    >
                      {{ genre }}
                    </span>
                  </div>
                  <span class="track-dur">{{ track.duration }}</span>
                </div>
              </div>
              <div class="gallery-item add-more-card music-more-card"><span>{{ appText.moreComing.music }}</span></div>
              <audio ref="audioEl" @timeupdate="onTimeUpdate" @ended="nextTrack" @loadedmetadata="onMeta" style="display:none"></audio>
            </div>
            <div class="creative-note">// all credits goes to the respective artists</div>
          </div>

          <div v-if="cat.id === 'drawing'" class="gallery-grid">
            <div v-for="(item, idx) in drawingItems" :key="item.id" class="gallery-item" :class="{ 'gallery-item-landscape': isGalleryLandscape('drawing', item.id) }">
              <button class="gallery-img-wrap gallery-img-button" :style="galleryImageStyle('drawing', item.id)" @click="openGalleryLightbox('drawing', drawingItems, idx)">
                <img v-if="item.img" :src="item.img" :alt="item.title" loading="lazy" @load="recordGalleryAspect('drawing', item.id, $event)" />
                <div v-else class="gallery-placeholder"><span>✏️</span><span>{{ appText.placeholders.drawing }}</span></div>
              </button>
              <div class="gallery-caption">
                <div class="gallery-caption-title">{{ item.title }}</div>
                <div class="gallery-caption-sub">{{ item.medium }}</div>
              </div>
            </div>
            <div class="gallery-item add-more-card"><span>{{ appText.moreComing.drawings }}</span></div>
          </div>
          </div>
        </template>
        <div v-else class="section-loader interests-loader" aria-busy="true" aria-live="polite">
          <div class="section-loader-copy">
            <div class="section-loader-kicker">Loading interests section</div>
            <div class="section-loader-title">Baking clay models, framing photos, creating videos, recording music and drawing cute characters</div>
            <div class="section-loader-text">Please be patient, I promise it is worth the wait!</div>
          </div>
          <div class="section-loader-grid interests-loader-grid">
            <div v-for="n in 4" :key="`interests-loader-${n}`" class="section-loader-card section-loader-card-wide">
              <div class="section-loader-thumb section-loader-thumb-tall"></div>
              <div class="section-loader-line section-loader-line-lg"></div>
              <div class="section-loader-line"></div>
              <div class="section-loader-chip-row">
                <span v-for="chip in 4" :key="chip" class="section-loader-chip"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section">
      <div class="container">
        <div class="sec-header" v-reveal>
          <span class="sec-prefix">07.</span>
          <span class="sec-title">{{ appText.sectionTitles.contact }}</span>
          <div class="sec-line"></div>
        </div>
        <div class="contact-grid">
          <div v-reveal.left>
            <h2 class="contact-heading">{{ appText.contact.headingPrefix }} <span class="hl">{{ appText.contact.headingHighlight }}</span></h2>
            <p class="contact-sub">{{ appText.contact.sub }}</p>
            <div class="contact-links">
              <a :href="`mailto:${appText.contact.emailDisplay}`" class="contact-link">
                <span class="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </span>
                {{ appText.contact.emailDisplay }}
                <span class="contact-label">{{ appText.contact.emailLabel }}</span>
              </a>
              <a href="https://github.com/kelynwong" class="contact-link" target="_blank" rel="noreferrer noopener">
                <span class="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </span>
                {{ appText.contact.githubDisplay }}
                <span class="contact-label">{{ appText.contact.githubLabel }}</span>
              </a>
              <a href="https://linkedin.com/in/kelyn-wong" class="contact-link" target="_blank" rel="noreferrer noopener">
                <span class="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
                  </svg>
                </span>
                {{ appText.contact.linkedinDisplay }}
                <span class="contact-label">{{ appText.contact.linkedinLabel }}</span>
              </a>
            </div>
          </div>
          <form class="contact-form-block" @submit.prevent="submitForm" v-reveal.right>
            <div class="form-title">{{ appText.form.title }}</div>
            <div class="form-field">
              <label>{{ appText.form.nameLabel }}</label>
              <input v-model="form.name" type="text" :placeholder="appText.form.namePlaceholder" />
            </div>
            <div class="form-field">
              <label>{{ appText.form.emailLabel }}</label>
              <input v-model="form.email" type="email" :placeholder="appText.form.emailPlaceholder" />
            </div>
            <div class="form-field">
              <label>{{ appText.form.messageLabel }}</label>
              <textarea v-model="form.message" rows="4" :placeholder="appText.form.messagePlaceholder"></textarea>
            </div>
            <button type="submit" class="btn btn-primary form-submit" :disabled="isSubmitting">
              {{ isSubmitting ? appText.form.submitSending : appText.form.submitDefault }}
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- Project Modal -->
    <transition name="gallery-lightbox-fade">
      <div v-if="galleryLightboxOpen" class="gallery-lightbox-overlay" @click.self="closeGalleryLightbox">
        <div class="gallery-lightbox" role="dialog" aria-modal="true" :aria-label="`${gallerySectionLabel(galleryLightboxSection)} slideshow`">
          <button class="gallery-lightbox-close" @click="closeGalleryLightbox" aria-label="Close gallery slideshow">✕</button>

          <div class="gallery-lightbox-stage">
            <button class="gallery-lightbox-nav" @click="prevGalleryImage" :disabled="galleryLightboxItems.length < 2" aria-label="Previous image">←</button>

            <div class="gallery-lightbox-media">
              <img
                v-if="currentGalleryLightboxItem?.img"
                :src="currentGalleryLightboxItem.img"
                :alt="currentGalleryLightboxItem.title"
                class="gallery-lightbox-image"
              />
            </div>

            <button class="gallery-lightbox-nav" @click="nextGalleryImage" :disabled="galleryLightboxItems.length < 2" aria-label="Next image">→</button>
          </div>

          <div v-if="galleryLightboxItems.length > 1" class="gallery-lightbox-progress-bar">
            <div class="gallery-lightbox-progress-fill" :style="{ width: galleryAutoPlayProgress + '%' }"></div>
          </div>

          <div class="gallery-lightbox-meta">
            <div>
              <div class="gallery-lightbox-title">{{ currentGalleryLightboxItem?.title }}</div>
              <div class="gallery-lightbox-subtitle">{{ galleryLightboxMeta(currentGalleryLightboxItem) }}</div>
            </div>
            <div class="gallery-lightbox-counter">{{ galleryLightboxIndex + 1 }} / {{ galleryLightboxItems.length }}</div>
          </div>
        </div>
      </div>
    </transition>

    <ProjectModal
      v-if="showProjectModal && activeProject"
      :is-open="showProjectModal"
      :project="activeProject"
      @close="showProjectModal = false; activeProject = null"
    />

    <!-- Toast Notification -->
    <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
      <div class="toast-icon">{{ toast.icon }}</div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div class="toast-text">{{ toast.text }}</div>
      </div>
      <button class="toast-close" @click="hideToast">✕</button>
    </div>

    <section class="kofi-support" aria-label="Support section">
      <div class="container kofi-support-inner" v-reveal>
        <h3 class="kofi-support-heading">
          You scrolled this far, RESPECT! Enjoyed the website? Help fund my AI token usage :)
        </h3>
        <p class="kofi-support-cta">
          <a href="https://ko-fi.com/kelynwong" target="_blank" rel="noreferrer noopener" class="kofi-button" aria-label="Fund Kelyn's AI token usage on Ko-fi">
            <img src="/src/assets/gif/Sparkle mug.gif" alt="" class="kofi-gif" />
            Fund Kelyn's AI token usage
          </a>
        </p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script src="./main.js"></script>
