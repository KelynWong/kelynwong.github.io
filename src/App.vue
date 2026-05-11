<template>
  <div id="app">
    <nav class="nav">
      <div class="nav-logo"><img src="./assets/images/logo.png" alt="logo" style="max-height: 32px;"></div>
      <div class="nav-links">
        <a href="#about">_About</a>
        <a href="#work">_Work</a>
        <a href="#education">_Education</a>
        <a href="#projects">_Projects</a>
        <a href="#interests">_Interests</a>
        <a href="#contact">_Contact</a>
      </div>
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
          <p class="annotation-text">This is a 3D model of my<br>personal workspace at home!</p>
        </div>

        <div class="hero-model-wrap">
          <ThreeJSModel />
        </div>

        <div class="hero-3d-hint">
          <div class="hint-dot"></div>
          drag to rotate · scroll to zoom
        </div>
      </div>
      <div class="hero-scroll">
        <div class="scroll-line"></div>
        <span>scroll</span>
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
        <div class="sec-header">
          <span class="sec-prefix">01.</span>
          <span class="sec-title">_About Me</span>
          <div class="sec-line"></div>
        </div>
        <div class="about-grid">
          <div class="about-text">
            <p>Hi hi, I'm <strong>Kelyn Wong</strong>! A software engineer that dabbles in anything and everything from <strong>backend, frontend, mobile, and cloud</strong>. My recent work has centered on DevOps, building Azure infrastructure, improving CI/CD pipelines and automating deployment processes.</p>
            <p>I enjoy building systems that improve efficiency. When I'm not at my desk, I'm probably making something with my hands - clay models, drawings, and music.</p>
            <p>I'm currently open to <strong>fresh graduate</strong> opportunities. Let's build something together.</p>
          </div>
          <div class="skills-block">
            <div class="skills-label">// tech stack</div>
            <div v-for="group in skillGroups" :key="group.name" class="skill-group">
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
        <div class="sec-header">
          <span class="sec-prefix">02.</span>
          <span class="sec-title">_Work Experience</span>
          <div class="sec-line"></div>
        </div>
        <div v-for="job in jobs" :key="job.filename" class="job-block">
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
        <div class="sec-header">
          <span class="sec-prefix">03.</span>
          <span class="sec-title">_My Education</span>
          <div class="sec-line"></div>
        </div>
        <div class="edu-items">
          <div v-for="edu in education" :key="edu.school" class="edu-card">
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
    <section id="projects" class="section">
      <div class="container">
        <div class="sec-header">
          <span class="sec-prefix">04.</span>
          <span class="sec-title">_Projects</span>
          <div class="sec-line"></div>
        </div>
        <div class="projects-grid">
          <ProjectCard
            v-for="proj in projects"
            :key="proj.id"
            :project="proj"
            @open-project="activeProject = $event; showProjectModal = true; currentImageIndex = 0; videoVisible = false"
          />
        </div>
      </div>
    </section>

    <!-- Interests Section -->
    <section id="interests" class="section">
      <div class="container">
        <div class="sec-header">
          <span class="sec-prefix">05.</span>
          <span class="sec-title">_Other Interests</span>
          <div class="sec-line"></div>
        </div>
        <p class="interests-text">
          {{ interestsIntro.para1 }}
        </p>
        <p class="interests-text">
          {{ interestsIntro.para2 }}
        </p>
        <div class="creative-tabs">
          <button
            v-for="cat in interestCategories"
            :key="cat.id"
            class="ctab"
            :class="{active: activeCat === cat.id}"
            @click="activeCat = cat.id"
          >{{ cat.label }}</button>
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
            <div v-for="(item, idx) in clayItems" :key="item.id" class="gallery-item" :class="{ 'gallery-item-landscape': isGalleryLandscape('clay', item.id) }">
              <button class="gallery-img-wrap gallery-img-button" :style="galleryImageStyle('clay', item.id)" @click="openGalleryLightbox('clay', clayItems, idx)">
                <img v-if="item.img" :src="item.img" :alt="item.title" loading="lazy" @load="recordGalleryAspect('clay', item.id, $event)" />
                <div v-else class="gallery-placeholder"><span>🏺</span><span>clay model</span></div>
              </button>
              <div class="gallery-caption">
                <div class="gallery-caption-title">{{ item.title }}</div>
                <div class="gallery-caption-sub">{{ item.year }}</div>
              </div>
            </div>
            <div class="gallery-item add-more-card"><span>more clay models coming soon...</span></div>
          </div>

          <div v-if="cat.id === 'photo'">
            <div class="photo-place-tabs">
              <button
                v-for="place in photoPlaces"
                :key="place.id"
                class="photo-place-pill"
                :class="{ active: activePhotoPlace === place.id }"
                @click="activePhotoPlace = place.id"
              >
                {{ place.label }}
                <span class="photo-place-count">{{ place.count }}</span>
              </button>
            </div>

            <div class="gallery-grid">
              <div v-for="(item, idx) in activePhotoItems" :key="`${activePhotoPlace}-${item.id}`" class="gallery-item" :class="{ 'gallery-item-landscape': isGalleryLandscape('photo', activePhotoPlace + '-' + item.id) }">
                <button class="gallery-img-wrap gallery-img-button" :style="galleryImageStyle('photo', activePhotoPlace + '-' + item.id)" @click="openGalleryLightbox('photo', activePhotoItems, idx)">
                  <img v-if="item.img" :src="item.img" :alt="item.title" loading="lazy" @load="recordGalleryAspect('photo', activePhotoPlace + '-' + item.id, $event)" />
                  <div v-else class="gallery-placeholder"><span>📷</span><span>photograph</span></div>
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
                @click="activeVideoCat = vc.id"
              >
                <span class="vid-cat-icon">{{ vc.icon }}</span>
                {{ vc.label }}
                <span class="vid-cat-count">{{ vc.count }}</span>
              </button>
            </div>

            <div v-if="activeVideoCat === 'travel'">
              <div v-for="trip in videoTravel" :key="trip.title" class="vid-group">
                <div class="vid-group-header">
                  <span class="vid-group-title">{{ trip.title }}</span>
                  <span class="vid-group-meta">{{ trip.dates }}</span>
                </div>
                <div :class="trip.shorts ? 'vid-grid-shorts' : 'vid-grid-wide'">
                  <div v-for="v in trip.parts" :key="v.id" :class="trip.shorts ? 'vid-card-short' : 'vid-card-wide'">
                    <div :class="trip.shorts ? 'vid-thumb-short' : 'vid-thumb-wide'">
                      <iframe
                        :src="ytEmbed(v.id, trip.shorts)"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                    <div class="vid-card-caption">
                      <span class="vid-card-label">{{ v.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeVideoCat === 'recaps'">
              <div v-for="yr in videoRecaps" :key="yr.year" class="vid-group">
                <div class="vid-group-header">
                  <span class="vid-group-title">{{ yr.year }}</span>
                  <span class="vid-group-meta">{{ yr.parts.length }} part{{ yr.parts.length > 1 ? 's' : '' }}</span>
                </div>
                <div class="vid-grid-shorts">
                  <div v-for="v in yr.parts" :key="v.id" class="vid-card-short">
                    <div class="vid-thumb-short">
                      <iframe
                        :src="ytEmbed(v.id, true)"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                    <div class="vid-card-caption">
                      <span class="vid-card-label">{{ v.label }}</span>
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
                    <div v-if="v.multi" class="vid-bs-badge">multi</div>
                  </div>
                  <div class="vid-bs-info">
                    <div class="vid-bs-title">{{ v.title }}</div>
                    <div class="vid-bs-artist">{{ v.artist }}</div>
                  </div>
                </a>
              </div>
              <div class="creative-note">// opens on YouTube — 39 clips and counting 🎮</div>
            </div>

            <div v-if="activeVideoCat === 'tiktoks'">
              <div v-for="tg in videoTiktoks" :key="tg.group" class="vid-group">
                <div class="vid-group-header">
                  <span class="vid-group-title">{{ tg.icon }} {{ tg.group }}</span>
                </div>
                <div class="vid-grid-shorts">
                  <div v-for="v in tg.items" :key="v.id" class="vid-card-short">
                    <div class="vid-thumb-short">
                      <iframe
                        :src="ytEmbed(v.id, true)"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                    <div class="vid-card-caption">
                      <span class="vid-card-label">{{ v.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="cat.id === 'music'" class="music-player-tab">
            <div class="music-player">
              <div class="player-bar">
                <div class="player-info">
                  <div class="player-track-name">{{ currentTrack ? currentTrack.displayTitle : 'Select a track' }}</div>
                  <div class="player-track-sub">{{ currentTrack ? currentTrack.detail : '— —' }}</div>
                </div>
                <div class="player-controls">
                  <button class="pctrl" @click="prevTrack" title="Previous">⏮</button>
                  <button class="pctrl pplay" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
                  <button class="pctrl" @click="nextTrack" title="Next">⏭</button>
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
                  <span class="track-tag">{{ track.genre }}</span>
                  <span class="track-dur">{{ track.duration }}</span>
                </div>
              </div>
              <audio ref="audioEl" @timeupdate="onTimeUpdate" @ended="nextTrack" @loadedmetadata="onMeta" style="display:none"></audio>
            </div>
            <div class="creative-note">// stay tuned for more music</div>
          </div>

          <div v-if="cat.id === 'drawing'" class="gallery-grid">
            <div v-for="(item, idx) in drawingItems" :key="item.id" class="gallery-item" :class="{ 'gallery-item-landscape': isGalleryLandscape('drawing', item.id) }">
              <button class="gallery-img-wrap gallery-img-button" :style="galleryImageStyle('drawing', item.id)" @click="openGalleryLightbox('drawing', drawingItems, idx)">
                <img v-if="item.img" :src="item.img" :alt="item.title" loading="lazy" @load="recordGalleryAspect('drawing', item.id, $event)" />
                <div v-else class="gallery-placeholder"><span>✏️</span><span>drawing</span></div>
              </button>
              <div class="gallery-caption">
                <div class="gallery-caption-title">{{ item.title }}</div>
                <div class="gallery-caption-sub">{{ item.medium }}</div>
              </div>
            </div>
            <div class="gallery-item add-more-card"><span>more drawings coming soon...</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section">
      <div class="container">
        <div class="sec-header">
          <span class="sec-prefix">06.</span>
          <span class="sec-title">_Contact Me</span>
          <div class="sec-line"></div>
        </div>
        <div class="contact-grid">
          <div>
            <h2 class="contact-heading">Let's <span class="hl">connect</span></h2>
            <p class="contact-sub">Whether it's a job opportunity, a collaboration, or just saying hello - my inbox is always open.</p>
            <div class="contact-links">
              <a href="mailto:kelynwonget@gmail.com" class="contact-link">
                <span class="contact-icon">✉</span>
                kelynwonget@gmail.com
                <span class="contact-label">email</span>
              </a>
              <a href="https://github.com/kelynwong" class="contact-link" target="_blank" rel="noreferrer noopener">
                <span class="contact-icon">⌥</span>
                github.com/kelynwong
                <span class="contact-label">github</span>
              </a>
              <a href="https://linkedin.com/in/kelyn-wong" class="contact-link" target="_blank" rel="noreferrer noopener">
                <span class="contact-icon">◈</span>
                linkedin.com/in/kelyn-wong
                <span class="contact-label">linkedin</span>
              </a>
            </div>
          </div>
          <form class="contact-form-block" @submit.prevent="submitForm">
            <div class="form-title">// send a quick message to my telegram inbox</div>
            <div class="form-field">
              <label>NAME</label>
              <input v-model="form.name" type="text" placeholder="your name" />
            </div>
            <div class="form-field">
              <label>EMAIL</label>
              <input v-model="form.email" type="email" placeholder="your@email.com" />
            </div>
            <div class="form-field">
              <label>MESSAGE</label>
              <textarea v-model="form.message" rows="4" placeholder="what's on your mind?"></textarea>
            </div>
            <button type="submit" class="btn btn-primary form-submit" :disabled="isSubmitting">
              {{ isSubmitting ? './sending_message' : './send_message' }}
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

          <div class="gallery-lightbox-meta">
            <div>
              <div class="gallery-lightbox-title">{{ currentGalleryLightboxItem?.title }}</div>
              <div class="gallery-lightbox-subtitle">{{ gallerySectionLabel(galleryLightboxSection) }}</div>
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

  </div>
</template>

<script>
import ProjectCard from './components/ProjectCard.vue'
import ProjectModal from './components/ProjectModal.vue'
import ThreeJSModel from './components/ThreeJSModel.vue'
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
  projects
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

export default {
  name: 'App',
  components: {
    ProjectCard,
    ProjectModal,
    ThreeJSModel,
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
      activePhotoPlace: 'balloonMuseum2025',
      activeVideoCat: 'travel',

      photoGroups: [
        buildPhotoGroup('balloonMuseum2025', 'Balloon Museum', 2025, 14),
        buildPhotoGroup('christmasWonderland2025', 'Christmas Wonderland', 2025, 45),
        buildPhotoGroup('dopamineLand2026', 'Dopamine Land', 2026, 5),
        buildPhotoGroup('ilight2025', 'i Light Singapore', 2025, 16),
        buildPhotoGroup('illumi2024', 'Illumi', 2024, 19, { 4: 'jpg', 6: 'jpg' }),
        buildPhotoGroup('nationalOrchidGarden2024', 'National Orchid Garden', 2024, 19),
        buildPhotoGroup('sgDesignWeek2025', 'SG Design Week', 2025, 51),
        buildPhotoGroup('sgNightFest2025', 'SG Night Fest', 2025, 38),
        buildPhotoGroup('studioGhibli2025', 'Studio Ghibli', 2025, 19),
      ],

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
      heroNameText: 'Kelyn Wong',
      heroRoleTexts: ['Software Engineer', 'DevOps Engineer', 'Cloud Engineer'],
      heroVerbsText: 'Analyze. Design. Prototype. Develop. Implement. Integrate. Refactor. Optimize. Test. Debug. Configure. Deploy. Automate. Monitor. Maintain.',
      typedHeroName: '',
      typedHeroRole: '',
      typedHeroVerbs: '',
      heroTypingActive: false,
      heroTypingTimeouts: [],
      tracks: [
        {
          src: '/src/assets/audio/Benson_Boone__What_Was_a_nylek_cover.mp3',
          displayTitle: 'What Was',
          detail: 'Benson Boone — A cover by me',
          genre: 'cover',
          duration: '03:34',
        },
        {
          src: '/src/assets/audio/cry__cigarettes_after_sex_the_other_persons_pov_inspired_by_sally_kim.mp3',
          displayTitle: 'Cry',
          detail: 'Cigarettes After Sex — A cover by me (inspired by Sally Kim)',
          genre: 'cover',
          duration: '01:50',
        },
        {
          src: '/src/assets/audio/for_crying_out_loud__finneas_a_nylek_cover.mp3',
          displayTitle: 'For Crying Out Loud',
          detail: 'Finneas — A cover by me',
          genre: 'cover',
          duration: '03:36',
        },
        {
          src: '/src/assets/audio/golden_years__christian_french_nylek_cover.mp3',
          displayTitle: 'Golden Years',
          detail: 'Christian French — A cover by me',
          genre: 'cover',
          duration: '02:50',
        },
        {
          src: '/src/assets/audio/it_is_what_it_is__abe_parker_a_nylek_cover.mp3',
          displayTitle: 'It Is What It Is',
          detail: 'Abe Parker — A cover by me',
          genre: 'cover',
          duration: '03:16',
        },
        {
          src: '/src/assets/audio/scared_to_start__michael_marcagi_a_nylek_cover.mp3',
          displayTitle: 'Scared to Start',
          detail: 'Michael Marcagi — A cover by me',
          genre: 'cover',
          duration: '02:39',
        },
        {
          src: '/src/assets/audio/the_race__chris_james_nylek_cover.mp3',
          displayTitle: 'The Race',
          detail: 'Chris James — A cover by me',
          genre: 'cover',
          duration: '02:22',
        },
        {
          src: '/src/assets/audio/your_idol__saja_boys_intro_only.mp3',
          displayTitle: 'Your Idol',
          detail: 'Saja Boys — A cover by me (intro only)',
          genre: 'cover',
          duration: '00:27',
        },
      ],
    }
  },

  computed: {
    currentTrack() {
      return this.currentTrackIdx !== null ? this.tracks[this.currentTrackIdx] : null
    },
    currentGalleryLightboxItem() {
      return this.galleryLightboxItems[this.galleryLightboxIndex] || null
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
</script>

<style scoped>
/* Core styles from index.html */
#app {
  width: 100%;
}

nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 52px;
  background: rgba(13,13,13,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.nav-logo {
  font-size: 12px;
  color: var(--accent1);
  letter-spacing: 0.08em;
}

.nav-logo span { color: var(--text-dim); }

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-links a {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 0.06em;
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--accent1); }

section {
  padding: 80px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 40px;
}

.sec-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.sec-prefix { color: var(--accent3); font-size: 11px; }
.sec-title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text);
}
.sec-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-decoration: none;
  border-radius: var(--radius);
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--accent1);
  color: #0d0d0d;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: #7bc0e8;
  transform: translateY(-1px);
}

/* Hero */
.hero {
  height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  width: 100%;
  min-height: 100vh;
  padding-top: 52px;
  position: relative;
  overflow: hidden;
}

.hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px 40px 140px 120px;
  border-right: 1px solid var(--border);
  min-width: 0;
}

.hero-hello {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 6px;
  font-weight: 300;
}

.hero-name {
  font-size: clamp(30px, 4vw, 52px);
  font-weight: 400;
  color: #fff;
  margin-bottom: 28px;
}

.hero-iam { font-size: 13px; color: var(--text-dim); }
.hero-role { font-size: clamp(20px, 2.8vw, 36px); color: var(--accent1); margin-bottom: 28px; }
.hero-i-prefix { font-size: 13px; color: var(--text-dim); }

.hero-verbs-wrap {
  position: relative;
  flex: 1;
  min-height: 180px;
  width: 100%;
  align-self: flex-start;
}

.hero-verbs {
  font-size: 30px;
  line-height: 1.3;
  position: relative;
  z-index: 1;
  width: 100%;
  white-space: normal;
  max-width: 100%;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.hero-verb-tone-1 { color: var(--accent3); }
.hero-verb-tone-2 { color: var(--code3); }
.hero-verb-tone-3 { color: var(--code4); }
.hero-verb-tone-4 { color: var(--code5); }

.typing-caret {
  display: inline-block;
  width: 0.06em;
  height: 0.95em;
  margin-left: 0.08em;
  vertical-align: -0.08em;
  background: currentColor;
  animation: heroCaretBlink 1s steps(1, end) infinite;
}

@keyframes heroCaretBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.hv-1 { color: var(--accent3); }
.hv-2 { color: var(--code4); }
.hv-3 { color: var(--accent3); }

.hero-avatar-wrap {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  right: auto;
  width: clamp(220px, 22vw, 320px);
  z-index: 6;
  pointer-events: none;
  user-select: none;
}

.hero-avatar-glow {
  position: absolute;
  width: 160%;
  height: 160%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -38%);
  background: radial-gradient(ellipse 60% 55% at 50% 52%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.04) 55%, transparent 72%);
  border-radius: 50%;
  z-index: 1;
  opacity: 0.7;
}

.hero-avatar-wrap img {
  width: 100%;
  display: block;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.08));
}

.hero-right {
  position: relative;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-width: 0;
}

.hero-model-wrap {
  width: 100%;
  height: 100%;
}

.hero-annotation {
  position: absolute;
  top: 24px;
  right: 28px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  z-index: 5;
  pointer-events: none;
}

.annotation-text {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text-dim);
  text-align: left;
  line-height: 1.45;
  max-width: 180px;
}

.annotation-arrow {
  width: 60px;
  height: 40px;
  flex-shrink: 0;
}

.hero-3d-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--text-faint);
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  background: rgba(13, 13, 13, 0.6);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  z-index: 5;
}

.hint-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent1);
  animation: blink 1.8s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.hero-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  color: var(--text-faint);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  z-index: 7;
  pointer-events: none;
}

.scroll-line {
  width: 1px;
  height: 44px;
  background: var(--border2);
  position: relative;
  overflow: hidden;
}

.scroll-line::after {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, transparent, var(--accent1), transparent);
  animation: scrollDrop 1.8s ease-in-out infinite;
}

@keyframes scrollDrop {
  0% { top: -60%; opacity: 0; }
  15% { opacity: 1; }
  85% { top: 120%; opacity: 1; }
  100% { top: 120%; opacity: 0; }
}

#hero-3d-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* About */
#about {
  border-top: 1px solid var(--border);
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.about-text p {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.8;
  margin-bottom: 16px;
}

.about-text p:last-child {
  margin-bottom: 0;
}

.about-text strong {
  color: var(--accent1);
  font-family: var(--mono);
}

.skills-block {
  margin-top: 0;
}

.skills-label {
  font-size: 10px;
  color: var(--text-faint);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

/* Skills */
.skills-container {
  display: grid;
  gap: 24px;
}

.skill-group {
  display: grid;
  gap: 8px;
}

.skill-group-name {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 3px;
  border: 1px solid;
}

.chip-blue {
  background: rgba(91, 170, 220, 0.1);
  color: var(--accent1);
  border-color: rgba(91, 170, 220, 0.3);
}

.chip-green {
  background: rgba(139, 184, 122, 0.1);
  color: var(--accent3);
  border-color: rgba(139, 184, 122, 0.3);
}

.chip-gray {
  background: rgba(112, 112, 112, 0.1);
  color: var(--text-dim);
  border-color: rgba(112, 112, 112, 0.3);
}

/* Work Experience */
.job-block {
  margin-bottom: 32px;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
}

.job-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.job-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-red { background: #C4836A; }
.dot-yellow { background: var(--code5); }
.dot-green { background: var(--accent3); }

.job-filename {
  font-size: 11px;
  color: var(--text-dim);
}

.job-date {
  font-size: 10px;
  color: var(--text-faint);
}

.job-body {
  padding: 20px;
  background: var(--bg);
}

.code-line {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.ln {
  color: var(--text-faint);
  font-size: 11px;
  width: 20px;
  text-align: right;
  user-select: none;
}

.code-content {
  flex: 1;
  font-size: 12px;
}

.code-content :deep(.kw) { color: var(--accent2); }
.code-content :deep(.fn) { color: var(--accent3); }
.code-content :deep(.punc) { color: var(--text-dim); }
.code-content :deep(.str) { color: var(--code5); }
.code-content :deep(.val) { color: var(--code3); }
.code-content :deep(.num) { color: var(--code4); }
.code-content :deep(.prop) { color: var(--code1); }
.code-content :deep(.cmt) { color: var(--text-faint); }

/* Education */
.edu-items { display: flex; flex-direction: column; gap: 24px; }
.edu-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.2s;
}

.edu-card:hover { border-color: var(--border2); }

.edu-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
}

.edu-tab-bar { display: flex; gap: 2px; }

.edu-tab {
  padding: 4px 14px;
  font-size: 10px;
  border-radius: 3px 3px 0 0;
  letter-spacing: 0.06em;
}

.edu-tab-active {
  background: var(--bg3);
  color: var(--accent1);
  border: 1px solid var(--border2);
  border-bottom: 1px solid var(--bg3);
}

.edu-tab-inactive {
  background: transparent;
  color: var(--text-faint);
}

.edu-status {
  font-size: 10px;
  padding: 2px 10px;
  border-radius: 10px;
}

.status-done {
  background: rgba(139,184,122,0.15);
  color: var(--accent3);
  border: 1px solid rgba(139,184,122,0.25);
}

.status-ongoing {
  background: rgba(91,170,220,0.15);
  color: var(--accent1);
  border: 1px solid rgba(91,170,220,0.25);
}

.edu-card-body { padding: 20px; }

.edu-code-block { font-size: 12px; }

.edu-desc {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.7;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.edu-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Interests */
.interests-text {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.7;
  margin-bottom: 24px;
}

.creative-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
}

.ctab {
  padding: 8px 20px;
  font-size: 11px;
  letter-spacing: 0.08em;
  cursor: pointer;
  background: none;
  color: var(--text-dim);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 0;
  font-family: var(--mono);
  transition: all 0.2s;
}

.ctab.active {
  color: var(--accent1);
  border-bottom-color: var(--accent1);
}

.ctab:hover:not(.active) { color: var(--text); }

.cat-backstory {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 16px;
  margin-bottom: 32px;
  padding: 16px;
  background: var(--bg2);
  border-radius: 4px;
}

.cat-backstory-icon {
  font-size: 40px;
  line-height: 1;
}

.cat-backstory-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.cat-backstory-text p {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.6;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  grid-auto-flow: dense;
}

.gallery-item {
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg2);
  grid-column: span 1;
}

.gallery-item.gallery-item-landscape {
  grid-column: span 2;
}

.gallery-img-wrap {
  width: 100%;
  aspect-ratio: var(--gallery-aspect, auto);
  background: var(--bg3);
}

.gallery-img-button {
  padding: 0;
  border: 0;
  background: none;
  appearance: none;
  display: block;
  width: 100%;
  cursor: zoom-in;
  text-align: inherit;
}

.gallery-img-button:hover img {
  transform: scale(1.02);
}

.gallery-img-wrap img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.25s ease;
}

.gallery-placeholder {
  width: 100%;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  gap: 6px;
}

.gallery-caption {
  padding: 10px;
}

.gallery-caption-title {
  font-size: 11px;
  color: var(--text);
}

.gallery-caption-sub {
  font-size: 10px;
  color: var(--text-dim);
}

.add-more-card {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  min-height: 190px;
  text-align: center;
  grid-column: 1 / -1;
  order: 999;
}

@media (max-width: 1100px) {
  .gallery-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-item.gallery-item-landscape {
    grid-column: span 2;
  }
}

@media (max-width: 560px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-item.gallery-item-landscape {
    grid-column: span 1;
  }
}

.gallery-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 1002;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.gallery-lightbox {
  position: relative;
  width: min(1100px, 100%);
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: 8px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  padding: 16px;
}

.gallery-lightbox-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: rgba(20, 20, 20, 0.92);
  color: var(--text);
  cursor: pointer;
  z-index: 2;
}

.gallery-lightbox-stage {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.gallery-lightbox-media {
  min-width: 0;
  max-height: 78vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background: var(--bg2);
}

.gallery-lightbox-image {
  display: block;
  max-width: 100%;
  max-height: 78vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

.gallery-lightbox-nav {
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: rgba(20, 20, 20, 0.92);
  color: var(--text);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.gallery-lightbox-nav:hover:not(:disabled) {
  color: var(--accent1);
  border-color: var(--accent1);
  background: rgba(91, 170, 220, 0.12);
}

.gallery-lightbox-nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.gallery-lightbox-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.gallery-lightbox-title {
  font-size: 14px;
  color: var(--text);
}

.gallery-lightbox-fade-enter-active,
.gallery-lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}

.gallery-lightbox-fade-enter-from,
.gallery-lightbox-fade-leave-to {
  opacity: 0;
}

.gallery-lightbox-subtitle,
.gallery-lightbox-counter {
  font-size: 10px;
  color: var(--text-faint);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.photo-place-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.photo-place-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid var(--border2);
  border-radius: 20px;
  background: var(--bg2);
  color: var(--text-dim);
  font-family: var(--mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.photo-place-pill:hover { border-color: var(--accent1); color: var(--text); }

.photo-place-pill.active {
  border-color: var(--accent1);
  color: var(--accent1);
  background: rgba(91,170,220,0.08);
}

.photo-place-count {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  background: var(--bg4);
  color: var(--text-faint);
}

.photo-place-pill.active .photo-place-count {
  background: rgba(91,170,220,0.15);
  color: var(--accent1);
}

.vid-cat-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.vid-cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid var(--border2);
  border-radius: 20px;
  background: var(--bg2);
  color: var(--text-dim);
  font-family: var(--mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.vid-cat-pill:hover { border-color: var(--accent1); color: var(--text); }

.vid-cat-pill.active {
  border-color: var(--accent1);
  color: var(--accent1);
  background: rgba(91,170,220,0.08);
}

.vid-cat-icon { font-size: 13px; }

.vid-cat-count {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  background: var(--bg4);
  color: var(--text-faint);
}

.vid-cat-pill.active .vid-cat-count {
  background: rgba(91,170,220,0.15);
  color: var(--accent1);
}

.vid-group { margin-bottom: 40px; }
.vid-group:last-child { margin-bottom: 0; }

.vid-group-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.vid-group-title { font-size: 13px; font-weight: 500; color: var(--text); }
.vid-group-meta { font-size: 10px; color: var(--text-faint); letter-spacing: 0.06em; }

.vid-grid-shorts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.vid-card-short {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg2);
  transition: border-color 0.2s;
}

.vid-card-short:hover { border-color: var(--accent3); }

.vid-thumb-short {
  position: relative;
  aspect-ratio: 9 / 16;
  background: var(--bg3);
  overflow: hidden;
}

.vid-thumb-short iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.vid-grid-wide {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.vid-card-wide {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg2);
  transition: border-color 0.2s;
}

.vid-card-wide:hover { border-color: var(--accent1); }

.vid-thumb-wide {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--bg3);
  overflow: hidden;
}

.vid-thumb-wide iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.vid-card-caption {
  padding: 8px 12px;
  font-size: 10px;
  color: var(--text-dim);
}

.vid-card-label { display: block; }

.vid-bs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.vid-bs-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg2);
  text-decoration: none;
  transition: border-color 0.2s, transform 0.15s;
  display: block;
}

.vid-bs-card:hover { border-color: var(--code4); transform: translateY(-2px); }

.vid-bs-thumb {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--bg3);
}

.vid-bs-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.vid-bs-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s;
}

.vid-bs-card:hover .vid-bs-play { opacity: 1; }

.vid-bs-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 9px;
  padding: 2px 6px;
  background: rgba(184,125,184,0.85);
  color: #fff;
  border-radius: 3px;
  letter-spacing: 0.06em;
  font-family: var(--mono);
}

.vid-bs-info { padding: 8px 10px; }
.vid-bs-title { font-size: 11px; color: var(--text); margin-bottom: 2px; line-height: 1.3; }
.vid-bs-artist { font-size: 10px; color: var(--text-faint); }

.creative-note {
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-faint);
}

/* Contact */
#contact {
  border-top: 1px solid var(--border);
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.contact-heading {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 16px;
  color: #fff;
}

.contact-heading .hl {
  color: var(--accent1);
}

.contact-sub {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.75;
  margin-bottom: 28px;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--text);
  font-size: 12px;
  background: var(--bg2);
  transition: border-color 0.2s, color 0.2s;
}

.contact-link:hover {
  border-color: var(--accent1);
  color: var(--accent1);
}

.contact-icon {
  color: var(--text-faint);
  width: 16px;
  text-align: center;
}

.contact-label {
  color: var(--text-dim);
  font-size: 10px;
  margin-left: auto;
}

.contact-form-block {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
}

.form-title {
  font-size: 11px;
  color: var(--text-faint);
  margin-bottom: 16px;
  letter-spacing: 0.08em;
}

.form-field {
  margin-bottom: 14px;
}

.form-field label {
  display: block;
  font-size: 10px;
  color: var(--text-faint);
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.form-field input,
.form-field textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 9px 12px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--accent2);
}

.form-submit {
  width: 100%;
  justify-content: center;
}

.form-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Social */
.social-float {
  position: fixed;
  top: 64px;
  left: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 0;
  background: rgba(13,13,13,0.88);
  border: 1px solid var(--border);
  border-left: none;
  border-radius: 0 8px 8px 0;
}

.social-float.is-bouncing {
  animation: socialBounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.social-icon {
  color: var(--text-faint);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 34px;
  transition: color 0.2s, background 0.2s;
  border-radius: 4px;
}

.social-icon:hover { color: var(--accent1); background: rgba(91,170,220,0.08); }
.social-icon svg { width: 14px; height: 14px; fill: currentColor; }

@keyframes socialBounce {
  0% { transform: translateX(0) translateY(0) scale(1); }
  25% { transform: translateX(3px) translateY(-3px) scale(1.03); }
  50% { transform: translateX(0) translateY(0) scale(0.99); }
  75% { transform: translateX(2px) translateY(-2px) scale(1.02); }
  100% { transform: translateX(0) translateY(0) scale(1); }
}

.social-float-line {
  width: 20px; height: 1px;
  background: var(--border);
  margin: 2px 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 350px;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-content { flex: 1; }
.toast-title { font-size: 12px; font-weight: 500; color: var(--text); }
.toast-text { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
.toast-close {
  background: none;
  border: none;
  color: var(--text-faint);
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
}

.toast-success { border-color: var(--accent3); }
.toast-error { border-color: var(--code3); }
.toast-info { border-color: var(--accent1); }

/* Music Player */
.music-player { margin-bottom: 8px; }

.player-bar {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  margin-bottom: 10px;
}

.player-track-name {
  font-size: 12px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-track-sub {
  font-size: 10px;
  color: var(--text-faint);
  margin-top: 2px;
}

.player-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.pctrl {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 3px;
  transition: color 0.2s, background 0.2s;
  font-family: var(--mono);
}

.pctrl:hover { color: var(--accent1); background: rgba(91,170,220,0.1); }

.pplay {
  font-size: 16px;
  color: var(--accent1);
  background: rgba(91,170,220,0.12);
  border: 1px solid rgba(91,170,220,0.25);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pplay:hover { background: rgba(91,170,220,0.25); }

.player-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--text-faint);
  flex-shrink: 0;
  min-width: 160px;
}

.player-progress-wrap {
  flex: 1;
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  min-width: 80px;
}

.player-progress-bg { position: absolute; inset: 0; border-radius: 2px; }

.player-progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--accent1);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.music-grid { display: flex; flex-direction: column; gap: 6px; }

.track {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  align-items: center;
  gap: 14px;
  padding: 11px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg2);
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.track:hover { border-color: var(--border2); background: var(--bg3); }

.track.active { border-color: var(--accent2); background: rgba(74,114,176,0.08); }

.track-num { color: var(--text-faint); font-size: 11px; text-align: center; }

.track-name { font-size: 12px; color: var(--text); }

.track-detail { font-size: 10px; color: var(--text-faint); margin-top: 2px; }

.track-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(184,125,184,0.12);
  color: var(--code4);
  border: 1px solid rgba(184,125,184,0.2);
  border-radius: 2px;
  white-space: nowrap;
}

.track-dur { font-size: 11px; color: var(--text-faint); white-space: nowrap; }

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }

  .hero-right {
    min-height: 360px;
  }

  .hero-left {
    padding: 40px 24px 60px;
    border-right: none;
  }

  .hero-avatar-wrap {
    width: clamp(220px, 42vw, 320px);
    left: 50%;
    transform: translateX(-50%);
    bottom: -6px;
  }

  .hero-annotation {
    top: 18px;
    right: 18px;
  }

  .about-grid,
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .social-float {
    display: none;
  }
}
</style>
