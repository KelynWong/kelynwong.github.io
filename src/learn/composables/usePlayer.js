import { ref, computed, watch, onBeforeUnmount } from 'vue'

// Frame-based playback model shared by every visualizer.
// A "frame" is a plain object snapshot of the visual state, by convention:
//   { desc: 'what just happened', line: <active pseudocode line index | null>, ...vizState }
// Visualizers precompute an array of frames; the player just moves an index
// through it, which makes play / pause / step-back / scrubbing trivial.
export function usePlayer() {
  const frames = ref([])
  const index = ref(0)
  const playing = ref(false)
  const speed = ref(1)

  let timer = null

  const frame = computed(() => frames.value[index.value] || null)
  const atEnd = computed(() => index.value >= frames.value.length - 1)
  const atStart = computed(() => index.value <= 0)

  function clearTimer() {
    if (timer) { clearInterval(timer); timer = null }
  }

  function startTimer() {
    clearTimer()
    timer = setInterval(() => {
      if (index.value < frames.value.length - 1) {
        index.value += 1
      } else {
        pause()
      }
    }, 900 / speed.value)
  }

  function play() {
    if (!frames.value.length) return
    if (atEnd.value) index.value = 0
    playing.value = true
    startTimer()
  }

  function pause() {
    playing.value = false
    clearTimer()
  }

  function toggle() { playing.value ? pause() : play() }

  function stepF() { pause(); if (!atEnd.value) index.value += 1 }
  function stepB() { pause(); if (!atStart.value) index.value -= 1 }
  function seek(i) { pause(); index.value = Math.max(0, Math.min(frames.value.length - 1, i)) }
  function restart() { pause(); index.value = 0 }

  function setFrames(arr, { autoplay = false } = {}) {
    pause()
    frames.value = arr || []
    index.value = 0
    if (autoplay && frames.value.length > 1) play()
  }

  watch(speed, () => { if (playing.value) startTimer() })

  onBeforeUnmount(clearTimer)

  return { frames, index, frame, playing, speed, atEnd, atStart, play, pause, toggle, stepF, stepB, seek, restart, setFrames }
}
