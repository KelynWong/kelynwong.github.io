<script setup>
import { reactive } from 'vue'
import { categories, topicsFor } from '../registry.js'
import { navigate } from '../router.js'
import CategoryIcon from './CategoryIcon.vue'

// draggable category icons: grab, toss around a little, spring back home
const drag = reactive({ id: null, dx: 0, dy: 0, sx: 0, sy: 0, moved: false, springId: null })
let suppressClick = false

const clamp = (v, lim) => Math.max(-lim, Math.min(lim, v))

function iconDown(e, id) {
  e.preventDefault()
  drag.id = id
  drag.sx = e.clientX
  drag.sy = e.clientY
  drag.dx = 0
  drag.dy = 0
  drag.moved = false
  window.addEventListener('pointermove', iconMove)
  window.addEventListener('pointerup', iconUp)
}

function iconMove(e) {
  if (drag.id === null) return
  drag.dx = clamp(e.clientX - drag.sx, 90)
  drag.dy = clamp(e.clientY - drag.sy, 90)
  if (Math.abs(drag.dx) + Math.abs(drag.dy) > 6) drag.moved = true
}

function iconUp() {
  window.removeEventListener('pointermove', iconMove)
  window.removeEventListener('pointerup', iconUp)
  const id = drag.id
  drag.id = null
  if (drag.moved) suppressClick = true
  drag.springId = id
  setTimeout(() => {
    if (drag.springId === id) drag.springId = null
    suppressClick = false
  }, 700)
}

function iconStyle(id) {
  if (drag.id === id) {
    return { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx * 0.12}deg)` }
  }
  if (drag.springId === id) {
    return { transform: 'translate(0px, 0px) rotate(0deg)' }
  }
  return null
}

function go(cat) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  navigate(`/${cat.id}`)
}
</script>

<template>
  <div>
    <header class="hub-hero">
      <h1>learn by <span class="accent">watching it run</span><span class="cursor">_</span></h1>
      <p>
        I'm a visual learner. When I was learning these concepts, I struggled a lot to grasp
        them by staring at code and manually stepping through everything in my head. And when
        it came to system design, there was never really a way to judge how well my design
        actually held up. So I built this: a place where the invisible parts become something
        you can watch, poke at, and break.
      </p>
      <p>
        It started as a way for me to learn better, and hopefully it helps other aspiring
        software engineers (or even experienced ones) strengthen their foundational concepts
        too. Every topic lets you feed in your own input, step through the execution one
        operation at a time, and see exactly which line of pseudocode is doing what.
      </p>
    </header>

    <div class="cat-grid">
      <div v-for="cat in categories" :key="cat.id" class="cat-card" @click="go(cat)">
        <div
          class="cat-icon-wrap"
          :class="{
            dragging: drag.id === cat.id,
            springing: drag.springId === cat.id,
            floaty: drag.id !== cat.id && drag.springId !== cat.id,
          }"
          :style="iconStyle(cat.id)"
          @pointerdown="iconDown($event, cat.id)"
        >
          <CategoryIcon :cat="cat.id" :size="64" />
        </div>
        <h2>{{ cat.name }}</h2>
        <p>{{ cat.tagline }}</p>
        <div class="cat-foot">
          <span class="badge">{{ topicsFor(cat.id).length }} topics</span>
          <span class="cat-go">explore →</span>
        </div>
      </div>
    </div>

    <p class="cell-idx" style="text-align: center; margin-top: 22px">
      psst: the icons are grabbable. go on, fling one.
    </p>
  </div>
</template>
