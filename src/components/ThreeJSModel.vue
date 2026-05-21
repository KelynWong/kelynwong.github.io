<template>
  <canvas ref="canvas" class="hero-canvas"></canvas>
</template>

<script>
import * as THREE from 'three'

export default {
  name: 'ThreeJSModel',
  props: {
    themeMode: {
      type: String,
      default: 'dark',
    },
  },
  data() {
    return {
      renderer: null,
      scene: null,
      camera: null,
      animationId: null,
      handlers: null,
      allowTouchControls: true,
      themeObjects: null,
    }
  },
  mounted() {
    this.initScene()
  },
  beforeUnmount() {
    this.disposeScene()
  },
  methods: {
    initScene() {
      const canvas = this.$refs.canvas
      if (!canvas) return

      this.allowTouchControls = window.innerWidth > 1024

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x141414)

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.set(3.5, 2.8, 4.5)
      camera.lookAt(0, 0.3, 0)

      this.renderer = renderer
      this.scene = scene
      this.camera = camera

      const resize = () => {
        const host = canvas.parentElement
        if (!host) return
        const w = host.clientWidth
        const h = host.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      window.addEventListener('resize', resize)

      const matDesk = new THREE.MeshStandardMaterial({ color: 0x2a1f14, roughness: 0.8 })
      const matLeg = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.9 })
      const matMonBody = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.3, metalness: 0.6 })
      const matScreen = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: 0.0, metalness: 0.1, emissive: 0x1a3a5c, emissiveIntensity: 0.6 })
      const matKeyb = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.5 })
      const matMouse = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.3, metalness: 0.5 })
      const matLamp = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.7 })
      const matLampShd = new THREE.MeshStandardMaterial({ color: 0x888866, roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide })
      const matMug = new THREE.MeshStandardMaterial({ color: 0x5baadc, roughness: 0.5, metalness: 0.1 })
      const matBook1 = new THREE.MeshStandardMaterial({ color: 0x8bb87a, roughness: 0.9 })
      const matBook2 = new THREE.MeshStandardMaterial({ color: 0xb87db8, roughness: 0.9 })
      const matBook3 = new THREE.MeshStandardMaterial({ color: 0xc4836a, roughness: 0.9 })
      const matPlant = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 })
      const matPot = new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.8 })
      const matWall = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 })
      const matFloor = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.9 })
      const matCable = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 })

      this.themeObjects = {
        scene,
        renderer,
        materials: {
          matDesk,
          matLeg,
          matMonBody,
          matScreen,
          matKeyb,
          matMouse,
          matLamp,
          matLampShd,
          matMug,
          matBook1,
          matBook2,
          matBook3,
          matPlant,
          matPot,
          matWall,
          matFloor,
          matCable,
          chairMat,
        },
        lights: {},
      }

      const box = (w, h, d, mat, x, y, z, rx = 0, ry = 0) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
        m.position.set(x, y, z)
        m.rotation.x = rx
        m.rotation.y = ry
        m.castShadow = true
        m.receiveShadow = true
        scene.add(m)
        return m
      }
      const cyl = (rt, rb, h, seg, mat, x, y, z, rx = 0) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)
        m.position.set(x, y, z)
        m.rotation.x = rx
        m.castShadow = true
        m.receiveShadow = true
        scene.add(m)
        return m
      }
      const sph = (r, mat, x, y, z) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat)
        m.position.set(x, y, z)
        m.castShadow = true
        scene.add(m)
        return m
      }

      box(12, 0.05, 10, matFloor, 0, -0.025, 0)
      box(12, 6, 0.05, matWall, 0, 3, -3)
      box(0.05, 6, 10, matWall, -4.5, 3, 0)

      const deskY = 0.75
      box(2.6, 0.06, 1.1, matDesk, 0, deskY, 0)
      box(0.06, deskY, 0.06, matLeg, -1.2, deskY / 2, 0.45)
      box(0.06, deskY, 0.06, matLeg, 1.2, deskY / 2, 0.45)
      box(0.06, deskY, 0.06, matLeg, -1.2, deskY / 2, -0.45)
      box(0.06, deskY, 0.06, matLeg, 1.2, deskY / 2, -0.45)

      const mBase = deskY + 0.03
      box(0.22, 0.02, 0.16, matMonBody, 0, mBase + 0.01, -0.2)
      box(0.04, 0.28, 0.04, matMonBody, 0, mBase + 0.15, -0.2)
      box(1.02, 0.62, 0.04, matMonBody, 0, mBase + 0.58, -0.2)
      box(0.94, 0.54, 0.01, matScreen, 0, mBase + 0.58, -0.18)

      const lineColors = [0x5baadc, 0x8bb87a, 0xb87db8, 0xc8c87a, 0xc4836a]
      for (let i = 0; i < 8; i += 1) {
        const lMat = new THREE.MeshStandardMaterial({
          color: lineColors[i % lineColors.length],
          emissive: lineColors[i % lineColors.length],
          emissiveIntensity: 0.9,
        })
        const len = 0.2 + Math.random() * 0.45
        const lx = -0.37 + len / 2
        const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.014, 0.005), lMat)
        m.position.set(lx, mBase + 0.72 - i * 0.065, -0.175)
        scene.add(m)
      }

      box(0.62, 0.018, 0.22, matKeyb, -0.1, mBase + 0.03, 0.22)
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 12; c += 1) {
          const km = new THREE.Mesh(
            new THREE.BoxGeometry(0.038, 0.01, 0.038),
            new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.4, metalness: 0.5 })
          )
          km.position.set(-0.38 + c * 0.048, mBase + 0.045, 0.12 + r * 0.047)
          scene.add(km)
        }
      }

      const mouseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.044, 0.022, 20), matMouse)
      mouseMesh.position.set(0.55, mBase + 0.025, 0.22)
      mouseMesh.scale.x = 0.7
      scene.add(mouseMesh)

      cyl(0.06, 0.07, 0.018, 16, matLamp, -1.05, mBase + 0.009, -0.3)
      box(0.018, 0.32, 0.018, matLamp, -1.05, mBase + 0.17, -0.3)
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.28, 0.018), matLamp)
      arm2.position.set(-0.92, mBase + 0.42, -0.3)
      arm2.rotation.z = 0.5
      scene.add(arm2)
      cyl(0.001, 0.1, 0.12, 20, matLampShd, -0.75, mBase + 0.52, -0.3, Math.PI)
      const lampLight = new THREE.PointLight(0xffe8b0, 1.2, 1.8)
      lampLight.position.set(-0.75, mBase + 0.56, -0.3)
      lampLight.castShadow = true
      scene.add(lampLight)

      cyl(0.055, 0.048, 0.1, 20, matMug, 0.95, mBase + 0.083, -0.28)
      const handleG = new THREE.TorusGeometry(0.032, 0.008, 8, 16, Math.PI)
      const handle = new THREE.Mesh(handleG, matMug)
      handle.position.set(1.008, mBase + 0.083, -0.28)
      handle.rotation.y = Math.PI / 2
      scene.add(handle)
      const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.046, 20), new THREE.MeshStandardMaterial({ color: 0x2a1200, roughness: 0.3 }))
      coffee.position.set(0.95, mBase + 0.135, -0.28)
      coffee.rotation.x = -Math.PI / 2
      scene.add(coffee)

      box(0.18, 0.03, 0.13, matBook1, -0.88, mBase + 0.045, -0.3)
      box(0.16, 0.025, 0.12, matBook2, -0.88, mBase + 0.072, -0.3)
      box(0.19, 0.022, 0.13, matBook3, -0.88, mBase + 0.096, -0.3)

      cyl(0.05, 0.06, 0.07, 14, matPot, 0.9, mBase + 0.065, -0.12)
      sph(0.07, matPlant, 0.9, mBase + 0.15, -0.12)
      sph(0.05, matPlant, 0.86, mBase + 0.13, -0.08)
      sph(0.05, matPlant, 0.94, mBase + 0.14, -0.16)

      const cablePts = []
      for (let t = 0; t <= 1; t += 0.1) {
        cablePts.push(new THREE.Vector3(0 + t * 0.05, mBase - t * 0.25, -0.17 - t * 0.1))
      }
      const cableCurve = new THREE.CatmullRomCurve3(cablePts)
      const cableTube = new THREE.TubeGeometry(cableCurve, 12, 0.006, 6, false)
      scene.add(new THREE.Mesh(cableTube, matCable))

      box(0.56, 0.04, 0.5, chairMat, 0, 0.52, 0.9)
      box(0.56, 0.6, 0.04, chairMat, 0, 0.82, 1.15)
      for (const [cx, cz] of [[-0.24, 0.65], [0.24, 0.65], [-0.24, 1.15], [0.24, 1.15]]) {
        cyl(0.018, 0.018, 0.52, 8, chairMat, cx, 0.26, cz)
      }

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
      scene.add(ambientLight)
      const sun = new THREE.DirectionalLight(0xffffff, 0.9)
      sun.position.set(3, 5, 4)
      sun.castShadow = true
      sun.shadow.mapSize.set(1024, 1024)
      scene.add(sun)
      const fill = new THREE.DirectionalLight(0x6090c0, 0.3)
      fill.position.set(-3, 2, -2)
      scene.add(fill)
      const screenGlow = new THREE.PointLight(0x1a6aaa, 0.7, 1.5)
      screenGlow.position.set(0, mBase + 0.58, -0.14)
      scene.add(screenGlow)
      this.themeObjects.lights = {
        ambientLight,
        sun,
        fill,
        screenGlow,
        lampLight,
      }

      this.applyTheme(this.themeMode)

      let isDragging = false
      let prevMouse = { x: 0, y: 0 }
      const spherical = { theta: 0.6, phi: 0.55, radius: 6.5 }

      const updateCamera = () => {
        const st = Math.sin(spherical.theta)
        const ct = Math.cos(spherical.theta)
        const sp = Math.sin(spherical.phi)
        const cp = Math.cos(spherical.phi)
        camera.position.set(spherical.radius * sp * st, spherical.radius * cp, spherical.radius * sp * ct)
        camera.lookAt(0, 0.6, 0)
      }
      updateCamera()

      const onMouseDown = (e) => {
        isDragging = true
        prevMouse = { x: e.clientX, y: e.clientY }
      }
      const onMouseUp = () => {
        isDragging = false
      }
      const onMouseMove = (e) => {
        if (!isDragging) return
        const dx = (e.clientX - prevMouse.x) * 0.008
        const dy = (e.clientY - prevMouse.y) * 0.006
        spherical.theta -= dx
        spherical.phi = Math.max(0.15, Math.min(1.4, spherical.phi + dy))
        prevMouse = { x: e.clientX, y: e.clientY }
        updateCamera()
      }
      const onWheel = (e) => {
        spherical.radius = Math.max(3, Math.min(12, spherical.radius + e.deltaY * 0.01))
        updateCamera()
        e.preventDefault()
      }

      let lastTouchDist = 0
      const onTouchStart = (e) => {
        if (e.touches.length === 1) {
          isDragging = true
          prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }
        if (e.touches.length === 2) {
          lastTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          )
        }
      }
      const onTouchEnd = () => {
        isDragging = false
      }
      const onTouchMove = (e) => {
        if (e.touches.length === 1 && isDragging) {
          const dx = (e.touches[0].clientX - prevMouse.x) * 0.008
          const dy = (e.touches[0].clientY - prevMouse.y) * 0.006
          spherical.theta -= dx
          spherical.phi = Math.max(0.15, Math.min(1.4, spherical.phi + dy))
          prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
          updateCamera()
        }
        if (e.touches.length === 2) {
          const d = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          )
          spherical.radius = Math.max(3, Math.min(12, spherical.radius - (d - lastTouchDist) * 0.02))
          lastTouchDist = d
          updateCamera()
        }
        e.preventDefault()
      }

      let idleTimer = null
      let autoRotate = true
      const resetIdle = () => {
        autoRotate = false
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          autoRotate = true
        }, 3000)
      }

      canvas.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('wheel', onWheel, { passive: false })
      if (this.allowTouchControls) {
        canvas.addEventListener('touchstart', onTouchStart)
        canvas.addEventListener('touchend', onTouchEnd)
        canvas.addEventListener('touchmove', onTouchMove, { passive: false })
        canvas.addEventListener('mousedown', resetIdle)
        canvas.addEventListener('touchstart', resetIdle)
      }

      this.handlers = {
        resize,
        onMouseUp,
        onMouseMove,
        onMouseDown,
        onWheel,
        onTouchStart,
        onTouchEnd,
        onTouchMove,
        resetIdle,
      }

      const animate = () => {
        this.animationId = requestAnimationFrame(animate)
        if (autoRotate) {
          spherical.theta += 0.003
          updateCamera()
        }
        renderer.render(scene, camera)
      }
      animate()
    },

    applyTheme(mode) {
      if (!this.themeObjects) return

      const isLight = mode === 'light'
      const { scene, renderer, materials, lights } = this.themeObjects

      const palette = isLight
        ? {
            background: 0xf5f2ea,
            desk: 0xd8c3a5,
            leg: 0x7b6a58,
            monBody: 0xd5d7db,
            screen: 0xf4f7fb,
            screenEmissive: 0x6ea6d8,
            screenEmissiveIntensity: 0.26,
            keyb: 0xc4c8ce,
            mouse: 0xc7cacf,
            lamp: 0xb7b1a6,
            lampShade: 0xf0eadf,
            mug: 0x7cb9de,
            book1: 0xa8c29a,
            book2: 0xc59cc6,
            book3: 0xd0a08a,
            plant: 0x5a8b46,
            pot: 0xb27c54,
            wall: 0xf9f6f0,
            floor: 0xeee6da,
            cable: 0x6f6a63,
            chair: 0xd7d0c5,
            ambientIntensity: 0.9,
            sunIntensity: 1.05,
            fillIntensity: 0.55,
            screenGlowIntensity: 0.35,
            lampLightIntensity: 0.85,
          }
        : {
            background: 0x141414,
            desk: 0x2a1f14,
            leg: 0x1a1208,
            monBody: 0x1c1c1c,
            screen: 0x0d1117,
            screenEmissive: 0x1a3a5c,
            screenEmissiveIntensity: 0.6,
            keyb: 0x222222,
            mouse: 0x1c1c1c,
            lamp: 0x333333,
            lampShade: 0x888866,
            mug: 0x5baadc,
            book1: 0x8bb87a,
            book2: 0xb87db8,
            book3: 0xc4836a,
            plant: 0x4a7a3a,
            pot: 0x8a5a3a,
            wall: 0x111111,
            floor: 0x0e0e0e,
            cable: 0x333333,
            chair: 0x111111,
            ambientIntensity: 0.35,
            sunIntensity: 0.9,
            fillIntensity: 0.3,
            screenGlowIntensity: 0.7,
            lampLightIntensity: 1.2,
          }

      scene.background = new THREE.Color(palette.background)
      renderer.setClearColor(palette.background, 1)

      materials.matDesk.color.setHex(palette.desk)
      materials.matLeg.color.setHex(palette.leg)
      materials.matMonBody.color.setHex(palette.monBody)
      materials.matScreen.color.setHex(palette.screen)
      materials.matScreen.emissive.setHex(palette.screenEmissive)
      materials.matScreen.emissiveIntensity = palette.screenEmissiveIntensity
      materials.matKeyb.color.setHex(palette.keyb)
      materials.matMouse.color.setHex(palette.mouse)
      materials.matLamp.color.setHex(palette.lamp)
      materials.matLampShd.color.setHex(palette.lampShade)
      materials.matMug.color.setHex(palette.mug)
      materials.matBook1.color.setHex(palette.book1)
      materials.matBook2.color.setHex(palette.book2)
      materials.matBook3.color.setHex(palette.book3)
      materials.matPlant.color.setHex(palette.plant)
      materials.matPot.color.setHex(palette.pot)
      materials.matWall.color.setHex(palette.wall)
      materials.matFloor.color.setHex(palette.floor)
      materials.matCable.color.setHex(palette.cable)
      materials.chairMat.color.setHex(palette.chair)

      lights.ambientLight.intensity = palette.ambientIntensity
      lights.sun.intensity = palette.sunIntensity
      lights.fill.intensity = palette.fillIntensity
      lights.screenGlow.intensity = palette.screenGlowIntensity
      lights.lampLight.intensity = palette.lampLightIntensity
      lights.sun.color.setHex(isLight ? 0xfff5e8 : 0xffffff)
      lights.fill.color.setHex(isLight ? 0xbad2ef : 0x6090c0)
      lights.screenGlow.color.setHex(isLight ? 0x7db6ea : 0x1a6aaa)
      lights.lampLight.color.setHex(isLight ? 0xffe9bf : 0xffe8b0)
    },

    disposeScene() {
      const canvas = this.$refs.canvas
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }

      if (canvas && this.handlers) {
        canvas.removeEventListener('mousedown', this.handlers.onMouseDown)
        canvas.removeEventListener('wheel', this.handlers.onWheel)
        if (this.allowTouchControls) {
          canvas.removeEventListener('touchstart', this.handlers.onTouchStart)
          canvas.removeEventListener('touchend', this.handlers.onTouchEnd)
          canvas.removeEventListener('touchmove', this.handlers.onTouchMove)
          canvas.removeEventListener('mousedown', this.handlers.resetIdle)
          canvas.removeEventListener('touchstart', this.handlers.resetIdle)
        }
      }
      if (this.handlers) {
        window.removeEventListener('resize', this.handlers.resize)
        window.removeEventListener('mouseup', this.handlers.onMouseUp)
        window.removeEventListener('mousemove', this.handlers.onMouseMove)
      }

      if (this.scene) {
        this.scene.traverse((obj) => {
          if (!obj.isMesh) return
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
            else obj.material.dispose()
          }
        })
      }

      if (this.renderer) {
        this.renderer.dispose()
      }

      this.themeObjects = null
    },
  },
  watch: {
    themeMode(mode) {
      this.applyTheme(mode)
    },
  },
}
</script>

<style scoped>
.hero-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
}

.hero-canvas:active {
  cursor: grabbing;
}
</style>
  