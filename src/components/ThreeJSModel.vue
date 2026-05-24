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
      camera.position.set(4.2, 3.2, 5.2)
      camera.lookAt(0.1, 1.4, 0.15)

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
      const matLoftFrame = new THREE.MeshStandardMaterial({ color: 0x2e261d, roughness: 0.85 })
      const matMattress = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 1.0 })
      const matBlanket = new THREE.MeshStandardMaterial({ color: 0xaab9d0, roughness: 1.0 })
      const matPillow = new THREE.MeshStandardMaterial({ color: 0xf5f4ef, roughness: 1.0 })
      const matShelf = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 })
      const matLadder = new THREE.MeshStandardMaterial({ color: 0x6f5a45, roughness: 0.9 })
      const matTableTop = new THREE.MeshStandardMaterial({ color: 0x7c5b43, roughness: 0.88 })
      const matTableLeg = new THREE.MeshStandardMaterial({ color: 0x5a4435, roughness: 0.95 })
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
          matLoftFrame,
          matMattress,
          matBlanket,
          matPillow,
          matShelf,
          matLadder,
          matTableTop,
          matTableLeg,
          matWall,
          matFloor,
          matCable,
          chairMat,
        },
        lights: {},
      }

      let currentParent = scene

      const box = (w, h, d, mat, x, y, z, rx = 0, ry = 0) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
        m.position.set(x, y, z)
        m.rotation.x = rx
        m.rotation.y = ry
        m.castShadow = true
        m.receiveShadow = true
        currentParent.add(m)
        return m
      }
      const cyl = (rt, rb, h, seg, mat, x, y, z, rx = 0) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)
        m.position.set(x, y, z)
        m.rotation.x = rx
        m.castShadow = true
        m.receiveShadow = true
        currentParent.add(m)
        return m
      }
      const sph = (r, mat, x, y, z) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat)
        m.position.set(x, y, z)
        m.castShadow = true
        currentParent.add(m)
        return m
      }

      box(20, 0.05, 16, matFloor, 0, -0.025, 0)

      const loftX = 0.95
      const loftZ = 0.25
      const loftWidth = 3.15
      const loftDepth = 1.65
      const loftFloorY = 0.0
      const loftTopY = 2.32
      const loftPostHeight = loftTopY - loftFloorY
      const sceneFocus = { x: loftX, y: loftTopY / 2, z: loftZ }

      const mattressY = loftTopY + 0.14
      const lowerRailY = 0.95

      box(loftWidth, 0.08, loftDepth, matLoftFrame, loftX, loftTopY, loftZ)
      box(0.08, 0.06, loftDepth, matLoftFrame, loftX - loftWidth / 2 + 0.04, lowerRailY, loftZ)
      box(0.08, 0.06, loftDepth, matLoftFrame, loftX + loftWidth / 2 - 0.04, lowerRailY, loftZ)
      box(0.08, loftPostHeight, 0.08, matLoftFrame, loftX - loftWidth / 2 + 0.04, loftPostHeight / 2, loftZ - loftDepth / 2 + 0.04)
      box(0.08, loftPostHeight, 0.08, matLoftFrame, loftX - loftWidth / 2 + 0.04, loftPostHeight / 2, loftZ + loftDepth / 2 - 0.04)
      box(0.08, loftPostHeight, 0.08, matLoftFrame, loftX + loftWidth / 2 - 0.04, loftPostHeight / 2, loftZ - loftDepth / 2 + 0.04)
      box(0.08, loftPostHeight, 0.08, matLoftFrame, loftX + loftWidth / 2 - 0.04, loftPostHeight / 2, loftZ + loftDepth / 2 - 0.04)

      const bedWidth = loftWidth - 0.16
      const bedDepth = loftDepth - 0.16
      const bedX = loftX
      const bedZ = loftZ
      box(bedWidth, 0.18, bedDepth, matMattress, bedX, mattressY, bedZ)
      box(bedWidth - 0.6, 0.1, bedDepth + 0.03, matBlanket, bedX + 0.3, mattressY + 0.05, bedZ)
      box(0.5, 0.12, 0.3, matPillow, loftX - 1.2, mattressY + 0.15, bedZ - bedDepth * 0.25, 0, Math.PI / 2)
      box(0.5, 0.12, 0.3, matPillow, loftX - 1.2, mattressY + 0.15, bedZ + bedDepth * 0.25, 0, Math.PI / 2)

      // top guard rails around the loft frame platform, split into two thin horizontal bands
      const railBandHeight = 0.12
      const railUpperDrop = 0
      const railLowerDrop = 0.18
      const railBandY = mattressY + 0.22 - 0.03
      const railUpperY = railBandY - railUpperDrop
      const railLowerY = railBandY - railLowerDrop
      const railSideThickness = 0.035
      const leftFrameX = loftX - loftWidth / 2 + railSideThickness / 2
      const rightFrameX = loftX + loftWidth / 2 - railSideThickness / 2
      const backFrameZ = loftZ - loftDepth / 2 + railSideThickness / 2
      const frontFrameZ = loftZ + loftDepth / 2 - railSideThickness / 2
      const ladderAccessX = loftX + loftWidth / 2 - 0.16
      const ladderGapHalfWidth = 0.42
      const frontLeftWidth = Math.max(0.02, ladderAccessX - ladderGapHalfWidth - (loftX - loftWidth / 2 + railSideThickness / 2))
      const frontRightWidth = Math.max(0.02, (loftX + loftWidth / 2 - railSideThickness / 2) - (ladderAccessX + ladderGapHalfWidth))
      const frontLeftCenterX = (loftX - loftWidth / 2 + railSideThickness / 2) + frontLeftWidth / 2
      const frontRightCenterX = ladderAccessX + ladderGapHalfWidth + frontRightWidth / 2
      const railTopY = railUpperY + railBandHeight / 2
      const railPostExtraHeight = 0.12
      const railPostHeight = Math.max(0.02, railTopY - loftTopY + railPostExtraHeight)
      const railPostBottomY = loftTopY - 0.01
      const railPostY = railPostBottomY + railPostHeight / 2
      const railPostThickness = 0.05
      const frontGapLeftX = ladderAccessX - ladderGapHalfWidth
      const frontGapRightX = ladderAccessX + ladderGapHalfWidth
      const leftInsetX = loftX - loftWidth / 2 + railPostThickness / 2
      const rightInsetX = loftX + loftWidth / 2 - railPostThickness / 2
      const backInsetZ = loftZ - loftDepth / 2 + railPostThickness / 2
      const frontInsetZ = loftZ + loftDepth / 2 - railPostThickness / 2

      // vertical posts at the corners and rail ends
      box(railPostThickness, railPostHeight, railPostThickness, matLoftFrame, leftInsetX, railPostY, backInsetZ)
      box(railPostThickness, railPostHeight, railPostThickness, matLoftFrame, rightInsetX, railPostY, backInsetZ)
      box(railPostThickness, railPostHeight, railPostThickness, matLoftFrame, leftInsetX, railPostY, frontInsetZ)
      box(railPostThickness, railPostHeight, railPostThickness, matLoftFrame, rightInsetX, railPostY, frontInsetZ)
      box(railPostThickness, railPostHeight, railPostThickness, matLoftFrame, frontGapLeftX + railPostThickness / 2, railPostY, frontInsetZ)

      // back side
      box(loftWidth, railBandHeight, railSideThickness, matLoftFrame, loftX, railUpperY, backFrameZ)
      box(loftWidth, railBandHeight, railSideThickness, matLoftFrame, loftX, railLowerY, backFrameZ)
      // left side
      box(railSideThickness, railBandHeight, loftDepth, matLoftFrame, leftFrameX, railUpperY, loftZ)
      box(railSideThickness, railBandHeight, loftDepth, matLoftFrame, leftFrameX, railLowerY, loftZ)
      // right side
      box(railSideThickness, railBandHeight, loftDepth, matLoftFrame, rightFrameX, railUpperY, loftZ)
      box(railSideThickness, railBandHeight, loftDepth, matLoftFrame, rightFrameX, railLowerY, loftZ)
      // front side, split around the ladder opening
      box(frontLeftWidth, railBandHeight, railSideThickness, matLoftFrame, frontLeftCenterX, railUpperY, frontFrameZ)
      box(frontLeftWidth, railBandHeight, railSideThickness, matLoftFrame, frontLeftCenterX, railLowerY, frontFrameZ)

      const shelfGroup = new THREE.Group()
      shelfGroup.position.z = - 1
      currentParent.add(shelfGroup)
      currentParent = shelfGroup

      const shelfWidth = loftWidth - 0.28
      const shelfHeight = loftTopY - 0.12
      const shelfDepth = 0.34
      const shelfBoardThickness = 0.04
      const shelfX = loftX
      const shelfY = shelfHeight / 2
      const shelfZ = loftZ + loftDepth / 2 - shelfDepth / 2 - 0.21
      const shelfColumnX = shelfX - shelfWidth / 2 + shelfWidth / 3
      const firstThirdCenterX = shelfX - shelfWidth / 3
      const firstThirdDividerY = shelfBoardThickness / 2 + (shelfHeight - shelfBoardThickness) * 0.4
      const firstThirdDividerWidth = shelfWidth / 3 - shelfBoardThickness * 1.5
      box(shelfWidth, shelfBoardThickness, shelfDepth, matShelf, shelfX, shelfHeight - shelfBoardThickness / 2, shelfZ)
      box(shelfWidth, shelfBoardThickness, shelfDepth, matShelf, shelfX, shelfBoardThickness / 2, shelfZ)
      box(shelfBoardThickness, shelfHeight - shelfBoardThickness, shelfDepth, matShelf, shelfX - shelfWidth / 2 + shelfBoardThickness / 2, shelfY, shelfZ)
      box(shelfBoardThickness, shelfHeight - shelfBoardThickness, shelfDepth, matShelf, shelfX + shelfWidth / 2 - shelfBoardThickness / 2, shelfY, shelfZ)
      box(shelfBoardThickness, shelfHeight - shelfBoardThickness, shelfDepth, matShelf, shelfColumnX, shelfY, shelfZ)
      // extend the divider to the full shelf width
      box(shelfWidth, shelfBoardThickness, shelfDepth, matShelf, shelfX, firstThirdDividerY, shelfZ)
      // --- cabinet doors below the first-third divider (two doors opening outwards from the middle)
      const cabinetInnerWidth = firstThirdDividerWidth
      const cabinetBottomY = shelfBoardThickness / 2
      const cabinetTopY = firstThirdDividerY - shelfBoardThickness / 2
      const cabinetInnerHeight = cabinetTopY - cabinetBottomY - 0.02
      const doorWidth = cabinetInnerWidth / 2 - 0.01
      const doorHeight = cabinetInnerHeight
      const doorDepth = shelfBoardThickness * 0.9
      // inset the hinges so the two doors sit closer to each other
      const hingeInset = 0.06
      const hingeRightShift = 0.03
      const hingeLeftX = firstThirdCenterX - cabinetInnerWidth / 2 + hingeInset
      const hingeRightX = firstThirdCenterX + cabinetInnerWidth / 2 - hingeInset + hingeRightShift
      const doorCenterY = cabinetBottomY + doorHeight / 2

      // left door pivot (hinge on outer left edge)
      const leftDoorPivot = new THREE.Group()
      leftDoorPivot.position.set(hingeLeftX, doorCenterY, shelfZ)
      currentParent.add(leftDoorPivot)
      const leftDoorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth)
      const leftDoor = new THREE.Mesh(leftDoorGeom, matShelf)
      // position door so its inner edge sits at the pivot (hinge)
      // shift the thin door so its front face aligns with the shelf front
      leftDoor.position.set(doorWidth / 2, 0, (shelfDepth - doorDepth) / 2)
      leftDoor.castShadow = true
      leftDoorPivot.add(leftDoor)

      // add a small knob on the left door near the center seam
      const knobRadius = 0.02
      const knobOffset = 0.06
      const knobMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.3 })
      const leftKnob = new THREE.Mesh(new THREE.SphereGeometry(knobRadius, 12, 8), knobMat)
      // position relative to door local center: toward inner edge and slightly in front
      leftKnob.position.set(doorWidth / 2 - knobOffset, 0, doorDepth / 2 + 0.01)
      leftDoor.add(leftKnob)

      // right door pivot (hinge on outer right edge)
      const rightDoorPivot = new THREE.Group()
      rightDoorPivot.position.set(hingeRightX, doorCenterY, shelfZ)
      currentParent.add(rightDoorPivot)
      const rightDoorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth)
      const rightDoor = new THREE.Mesh(rightDoorGeom, matShelf)
      // position door so its inner edge sits at the pivot (hinge); extend to the left from hinge
      rightDoor.position.set(-doorWidth / 2, 0, (shelfDepth - doorDepth) / 2)
      rightDoor.castShadow = true
      rightDoorPivot.add(rightDoor)

      // add a small knob on the right door near the center seam
      const rightKnob = new THREE.Mesh(new THREE.SphereGeometry(knobRadius, 12, 8), knobMat)
      rightKnob.position.set(-doorWidth / 2 + knobOffset, 0, doorDepth / 2 + 0.01)
      rightDoor.add(rightKnob)

      // slightly open the doors outwards from the center (tweak angle if you want them more/less open)
      // slightly reduce open angle so doors don't open so wide
      const openAngle = 0.25 // radians
      // reverse opening direction (opposite of previous)
      leftDoorPivot.rotation.y = -openAngle
      rightDoorPivot.rotation.y = openAngle

      // --- additional horizontal divider for the remaining 3/5 of the first-third bay
      const upperSectionBottomY = firstThirdDividerY + shelfBoardThickness / 2
      const upperSectionTopY = shelfHeight - shelfBoardThickness / 2
      const secondDividerY = upperSectionBottomY + (upperSectionTopY - upperSectionBottomY) * 0.5
      // vertical divider in the middle of the compartment right above the cabinet (split left/right)
      const middleCompBottomY = firstThirdDividerY + shelfBoardThickness / 2
      const middleCompTopY = secondDividerY - shelfBoardThickness / 2
      const middleCompHeight = Math.max(0.02, middleCompTopY - middleCompBottomY)
      const middleCompCenterY = middleCompBottomY + middleCompHeight / 2
      box(shelfBoardThickness, middleCompHeight, shelfDepth, matShelf, firstThirdCenterX, middleCompCenterY, shelfZ)
      // extend the upper divider to the full shelf width as well
      box(shelfWidth, shelfBoardThickness, shelfDepth, matShelf, shelfX, secondDividerY, shelfZ)
      box(shelfWidth, shelfHeight - shelfBoardThickness, shelfBoardThickness * 0.5, matShelf, shelfX, shelfY, shelfZ - shelfDepth / 2 + shelfBoardThickness * 0.25)
      // add a horizontal divider in the bottom row of the right 2/3 section
      const rightTwoThirdsWidth = shelfWidth * (2 / 3)
      const rightTwoThirdsCenterX = shelfX + shelfWidth / 6
      const bottomRowY = (shelfBoardThickness / 2 + firstThirdDividerY) / 2
      box(rightTwoThirdsWidth, shelfBoardThickness, shelfDepth, matShelf, rightTwoThirdsCenterX, bottomRowY, shelfZ)
      // --- vertical dividers for the right 2/3 section by row
      const rightTwoLeft = rightTwoThirdsCenterX - rightTwoThirdsWidth / 2
      const rightTwoThirdsOneThirdX = rightTwoLeft + rightTwoThirdsWidth / 3
      const rightTwoThirdsTwoThirdX = rightTwoLeft + (2 * rightTwoThirdsWidth) / 3
      const rightTwoThirdsCenter = rightTwoThirdsCenterX

      // Top row (divide into 3)
      const topBandBottomY = secondDividerY + shelfBoardThickness / 2
      const topBandTopY = shelfHeight - shelfBoardThickness / 2
      const topBandHeight = Math.max(0.02, topBandTopY - topBandBottomY)
      const topBandCenterY = topBandBottomY + topBandHeight / 2
      box(shelfBoardThickness, topBandHeight, shelfDepth, matShelf, rightTwoThirdsOneThirdX, topBandCenterY, shelfZ)
      box(shelfBoardThickness, topBandHeight, shelfDepth, matShelf, rightTwoThirdsTwoThirdX, topBandCenterY, shelfZ)

      // Second row from top (divide into 2)
      const secondBandBottomY = firstThirdDividerY + shelfBoardThickness / 2
      const secondBandTopY = secondDividerY - shelfBoardThickness / 2
      const secondBandHeight = Math.max(0.02, secondBandTopY - secondBandBottomY)
      const secondBandCenterY = secondBandBottomY + secondBandHeight / 2
      box(shelfBoardThickness, secondBandHeight, shelfDepth, matShelf, rightTwoThirdsCenter, secondBandCenterY, shelfZ)

      // Third row from top (divide into 3)
      const thirdBandBottomY = bottomRowY + shelfBoardThickness / 2
      const thirdBandTopY = firstThirdDividerY - shelfBoardThickness / 2
      const thirdBandHeight = Math.max(0.02, thirdBandTopY - thirdBandBottomY)
      const thirdBandCenterY = thirdBandBottomY + thirdBandHeight / 2
      box(shelfBoardThickness, thirdBandHeight, shelfDepth, matShelf, rightTwoThirdsOneThirdX, thirdBandCenterY, shelfZ)
      box(shelfBoardThickness, thirdBandHeight, shelfDepth, matShelf, rightTwoThirdsTwoThirdX, thirdBandCenterY, shelfZ)

      // Bottom row (divide into 2)
      const bottomBandBottomY = shelfBoardThickness / 2
      const bottomBandTopY = bottomRowY - shelfBoardThickness / 2
      const bottomBandHeight = Math.max(0.02, bottomBandTopY - bottomBandBottomY)
      const bottomBandCenterY = bottomBandBottomY + bottomBandHeight / 2
      box(shelfBoardThickness, bottomBandHeight, shelfDepth, matShelf, rightTwoThirdsCenter, bottomBandCenterY, shelfZ)

      // second table in the rightmost cell of the third row up
      const tableXOffset = -0.31
      const tableCellLeftX = rightTwoThirdsTwoThirdX + shelfBoardThickness / 2
      const tableCellRightX = rightTwoLeft + rightTwoThirdsWidth - shelfBoardThickness / 2
      const tableWidthBase = Math.max(0.2, tableCellRightX - tableCellLeftX)
      const tableLengthBase = Math.max(
        0.9,
        (loftZ + loftDepth / 2 - 0.08 + 0.11) - shelfGroup.position.z - (shelfZ + shelfDepth / 2) + 0.08
      )
      const tableWidth = tableWidthBase * 1.47
      const tableLength = tableLengthBase * 1.1
      const tableThickness = 0.05
      // place the table top surface slightly above the firstThirdDividerY
      const topSurfaceOffset = 0.08
      const deskZShift = 0
      const tableZOffset = -0.3 + deskZShift
      const tableTopSurfaceY = firstThirdDividerY + topSurfaceOffset
      const tableCenterY = tableTopSurfaceY - tableThickness / 2
      const tableCenterX = tableCellLeftX + tableWidth / 2 + tableXOffset
      const tableCenterZ = shelfZ + shelfDepth / 2 + tableLength / 2 + tableZOffset
      box(tableWidth, tableThickness, tableLength, matTableTop, tableCenterX, tableCenterY, tableCenterZ)

      const tableSupportHeight = Math.max(0.12, tableCenterY - bottomBandBottomY)
      const shelfSupportDepth = tableLength * 0.2
      const shelfSupportCenterX = tableCellLeftX + tableWidth / 2 + tableXOffset
      const shelfSupportCenterZ = tableCenterZ + tableLength / 2 - shelfSupportDepth / 2
      const shelfSupportCenterY = bottomBandBottomY + tableSupportHeight / 2
      const shelfFrameThickness = shelfBoardThickness * 0.7
      const shelfInnerWidth = Math.max(0.08, tableWidth - shelfFrameThickness * 2)
      const shelfInnerHeight = Math.max(0.08, tableSupportHeight - shelfFrameThickness * 2)
      const shelfInnerDepth = Math.max(0.08, shelfSupportDepth - shelfFrameThickness)

      // outer shell: open front, closed back
      box(tableWidth, shelfFrameThickness, shelfSupportDepth, matShelf, shelfSupportCenterX, shelfSupportCenterY + tableSupportHeight / 2 - shelfFrameThickness / 2, shelfSupportCenterZ)
      box(tableWidth, shelfFrameThickness, shelfSupportDepth, matShelf, shelfSupportCenterX, shelfSupportCenterY - tableSupportHeight / 2 + shelfFrameThickness / 2, shelfSupportCenterZ)
      box(shelfFrameThickness, tableSupportHeight, shelfSupportDepth, matShelf, shelfSupportCenterX - tableWidth / 2 + shelfFrameThickness / 2, shelfSupportCenterY, shelfSupportCenterZ)
      box(shelfFrameThickness, tableSupportHeight, shelfSupportDepth, matShelf, shelfSupportCenterX + tableWidth / 2 - shelfFrameThickness / 2, shelfSupportCenterY, shelfSupportCenterZ)

      // 2x2 dividers inside the hollow shelf
      box(shelfFrameThickness, shelfInnerHeight, shelfInnerDepth, matShelf, shelfSupportCenterX, shelfSupportCenterY, shelfSupportCenterZ - shelfFrameThickness / 2)
      box(tableWidth - shelfFrameThickness * 2, shelfFrameThickness, shelfInnerDepth, matShelf, shelfSupportCenterX, shelfSupportCenterY, shelfSupportCenterZ - shelfFrameThickness / 2)

      // backboard on the rear face of the 2x2 shelf
      box(tableWidth, tableSupportHeight, shelfFrameThickness * 0.5, matShelf, shelfSupportCenterX, shelfSupportCenterY, shelfSupportCenterZ - shelfSupportDepth / 2 + shelfFrameThickness * 0.25)
      
      currentParent = scene

      const ladderOffsetX = -0.15 // move left(-) / right(+)
      const ladderOffsetZ = 0.11 // move back(-) / forward(+)

      // anchor positions
      const ladderX = loftX + loftWidth / 2 - 0.16 + ladderOffsetX
      const ladderZ = loftZ + loftDepth / 2 - 0.08 + ladderOffsetZ

      // set bottom to exactly floor and reduce top inset to make it taller
      const ladderBottom = loftFloorY 
      const ladderTop = loftTopY + 0.03


      box(0.06, ladderTop - ladderBottom, 0.06, matLadder, ladderX - 0.17, (ladderTop + ladderBottom) / 2, ladderZ)
      box(0.06, ladderTop - ladderBottom, 0.06, matLadder, ladderX + 0.17, (ladderTop + ladderBottom) / 2, ladderZ)
      for (let rung = 0; rung < 5; rung += 1) {
        box(0.38, 0.05, 0.06, matLadder, ladderX, ladderBottom + 0.5 + rung * 0.42, ladderZ)
      }

      const deskGroup = new THREE.Group()
      deskGroup.rotation.y = Math.PI / 2
      deskGroup.position.x = -0.1
      deskGroup.position.z = 1.1
      scene.add(deskGroup)
      currentParent = deskGroup

      // set desk height to match the first 1/3 shelf bottom divider
      const deskY = firstThirdDividerY
      const deskX = 0.0
      const monitorDeskZShift = 0.05
      // shorten the desk on the opposite side by 20% (anchor the right edge)
      const deskTopWidth = 2.25
      const shortenPercent = 0.2
      const shortenAmount = deskTopWidth * shortenPercent
      const deskTopWidthNew = deskTopWidth - shortenAmount
      // anchor right edge so the left/front edge is shortened
      const deskRightEdgeX = deskX + deskTopWidth / 2
      const deskTopCenterX = deskRightEdgeX - deskTopWidthNew / 2
      box(deskTopWidthNew, 0.06, 1, matDesk, deskTopCenterX, deskY, 0.02 + monitorDeskZShift)

      const supportHeight = deskY
      const supportY = supportHeight / 2
      const supportCrossZ = 0 + monitorDeskZShift
      const supportBarWidth = 0.5
      const supportBarThickness = 0.07
      // move the left support inward by the same shortenAmount so the leg aligns with the new edge
      const supportXLeft = deskX - 0.98 + shortenAmount
      const supportXRight = deskX + 0.98

      box(0.08, supportHeight, 0.08, matLeg, supportXLeft, supportY, 0.02 + monitorDeskZShift)
      box(0.08, supportHeight, 0.08, matLeg, supportXRight, supportY, 0.02 + monitorDeskZShift)
      box(0.08, supportBarThickness, supportBarWidth, matLeg, supportXLeft, supportBarThickness / 2, supportCrossZ)
      box(0.08, supportBarThickness, supportBarWidth, matLeg, supportXRight, supportBarThickness / 2, supportCrossZ)

      const mBase = deskY + 0.03
      // move monitor closer to loft side (shift X toward positive)
      const monitorX = deskX + 0.6
      const monitorZ = -0.15 + monitorDeskZShift
      box(0.2, 0.02, 0.14, matMonBody, monitorX, mBase + 0.01, monitorZ)
      box(0.04, 0.24, 0.04, matMonBody, monitorX, mBase + 0.13, monitorZ)
      box(1.0, 0.58, 0.04, matMonBody, monitorX, mBase + 0.53, monitorZ)
      box(0.92, 0.5, 0.01, matScreen, monitorX, mBase + 0.53, monitorZ + 0.02)

      const keycapMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.55, metalness: 0.2 })
      const keycaps = [
        [-0.24, 0.055, -0.065, 0.05, 0.014, 0.05],
        [-0.17, 0.055, -0.065, 0.05, 0.014, 0.05],
        [-0.10, 0.055, -0.065, 0.05, 0.014, 0.05],
        [-0.03, 0.055, -0.065, 0.05, 0.014, 0.05],
        [0.04, 0.055, -0.065, 0.05, 0.014, 0.05],
        [0.11, 0.055, -0.065, 0.05, 0.014, 0.05],
        [0.18, 0.055, -0.065, 0.05, 0.014, 0.05],
        [-0.22, 0.055, 0.0, 0.05, 0.014, 0.05],
        [-0.15, 0.055, 0.0, 0.05, 0.014, 0.05],
        [-0.08, 0.055, 0.0, 0.05, 0.014, 0.05],
        [-0.01, 0.055, 0.0, 0.05, 0.014, 0.05],
        [0.06, 0.055, 0.0, 0.05, 0.014, 0.05],
        [0.13, 0.055, 0.0, 0.05, 0.014, 0.05],
        [0.20, 0.055, 0.0, 0.05, 0.014, 0.05],
        [-0.18, 0.055, 0.065, 0.05, 0.014, 0.05],
        [-0.11, 0.055, 0.065, 0.05, 0.014, 0.05],
        [-0.04, 0.055, 0.065, 0.05, 0.014, 0.05],
        [0.03, 0.055, 0.065, 0.05, 0.014, 0.05],
        [0.10, 0.055, 0.065, 0.05, 0.014, 0.05],
        [0.17, 0.055, 0.065, 0.05, 0.014, 0.05],
      ]
      keycaps.forEach(([dx, dy, dz, w, h, d]) => {
        box(w, h, d, keycapMat, monitorX + dx, mBase + dy, 0.05 + dz + monitorDeskZShift)
      })

      const codeBgMat = new THREE.MeshStandardMaterial({ color: 0x10151c, roughness: 0.95 })
      const codeLineMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.25, emissive: 0x3b82f6, emissiveIntensity: 0.35 })
      const codeDimMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.4, emissive: 0x3f3f46, emissiveIntensity: 0.18 })
      const codeAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, emissive: 0xa16207, emissiveIntensity: 0.2 })
      const codeBarMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
      box(0.82, 0.44, 0.004, codeBgMat, monitorX, mBase + 0.53, monitorZ + 0.028)
      box(0.82, 0.045, 0.004, codeBarMat, monitorX, mBase + 0.73, monitorZ + 0.029)
      box(0.12, 0.34, 0.003, codeBgMat, monitorX - 0.35, mBase + 0.52, monitorZ + 0.029)

      const lineYPositions = [0.67, 0.61, 0.55, 0.49, 0.43, 0.37]
      const lineWidths = [0.28, 0.36, 0.22, 0.40, 0.18, 0.31]
      const lineMats = [codeLineMat, codeDimMat, codeAccentMat, codeLineMat, codeDimMat, codeLineMat]
      lineYPositions.forEach((yOffset, index) => {
        box(lineWidths[index], 0.014, 0.003, lineMats[index], monitorX - 0.11, mBase + yOffset, monitorZ + 0.03)
      })
      box(0.04, 0.014, 0.003, codeAccentMat, monitorX - 0.29, mBase + 0.67, monitorZ + 0.03)
      box(0.06, 0.014, 0.003, codeDimMat, monitorX - 0.25, mBase + 0.61, monitorZ + 0.03)
      box(0.10, 0.014, 0.003, codeLineMat, monitorX - 0.21, mBase + 0.55, monitorZ + 0.03)
      box(0.08, 0.014, 0.003, codeAccentMat, monitorX - 0.23, mBase + 0.49, monitorZ + 0.03)
      box(0.14, 0.014, 0.003, codeDimMat, monitorX - 0.18, mBase + 0.43, monitorZ + 0.03)

      // shift keyboard and mouse north toward the end of the table and align X to monitor
      // move keyboard closer to the mouse
      box(0.64, 0.018, 0.2, matKeyb, monitorX, mBase + 0.03, 0.05 + monitorDeskZShift)
      const mouseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.02, 20), matMouse)
      mouseMesh.position.set(monitorX + 0.42, mBase + 0.03, 0.05 + monitorDeskZShift)
      mouseMesh.scale.x = 0.7
      currentParent.add(mouseMesh)

      const lineColors = [0x5baadc, 0x8bb87a, 0xb87db8, 0xc8c87a, 0xc4836a]
      for (let i = 0; i < 6; i += 1) {
        const lMat = new THREE.MeshStandardMaterial({
          color: lineColors[i % lineColors.length],
          emissive: lineColors[i % lineColors.length],
          emissiveIntensity: 0.8,
        })
        const len = 0.18 + Math.random() * 0.35
        const lx = monitorX - 0.3 + len / 2
        const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.012, 0.005), lMat)
        // position decorations on the monitor surface area
        m.position.set(lx, mBase + 0.68 - i * 0.06, monitorZ + 0.02)
        currentParent.add(m)
      }

      const lampLight = new THREE.PointLight(0xffe8b0, 0.95, 1.8)
      lampLight.position.set(deskX - 0.8, mBase + 0.5, -0.14)
      lampLight.castShadow = true
      currentParent.add(lampLight)

      // const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.04, 20), new THREE.MeshStandardMaterial({ color: 0x2a1200, roughness: 0.3 }))
      // coffee.position.set(deskX + 0.5, mBase + 0.03, -0.12)
      // coffee.rotation.x = -Math.PI / 2
      // currentParent.add(coffee)

      const chairGroup = new THREE.Group()
      // position the chair closer to the desk/monitor
      chairGroup.position.set(monitorX, 0.03, 0.95)
      chairGroup.rotation.y = Math.PI
      currentParent.add(chairGroup)
      const prevParent = currentParent
      currentParent = chairGroup

      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.95 })
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 })
      const wheelRadius = 0.045
      const wheelOffset = 0.3
      const wheelY = 0.045
      const hubY = 0.11
      const hubHeight = 0.08
      const stemHeight = 0.43
      const wheelAngles = [0, (Math.PI * 2) / 5, (Math.PI * 4) / 5, (Math.PI * 6) / 5, (Math.PI * 8) / 5]

      wheelAngles.forEach((angle) => {
        const wheelX = Math.cos(angle) * wheelOffset
        const wheelZ = Math.sin(angle) * wheelOffset

        // wheel
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.02, 12),
          wheelMat
        )

        wheel.rotation.z = Math.PI / 2
        wheel.rotation.y = angle
        wheel.position.set(wheelX, wheelY, wheelZ)

        chairGroup.add(wheel)

        // spoke
        const spokeLength = wheelOffset

        const spokeGeo = new THREE.BoxGeometry(0.03, 0.03, spokeLength)

        // make geometry start at origin and extend outward
        spokeGeo.translate(0, 0, spokeLength / 2)

        const spoke = new THREE.Mesh(spokeGeo, hubMat)

        spoke.position.set(0, hubY, 0)
        spoke.rotation.y = angle + Math.PI / 2

        chairGroup.add(spoke)

        // yoke
        const yokeHeight = hubY - wheelY

        const yoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, yokeHeight, 0.03),
          hubMat
        )

        yoke.position.set(
          wheelX,
          wheelY + yokeHeight / 2,
          wheelZ
        )

        chairGroup.add(yoke)
      })

      box(0.18, hubHeight, 0.18, hubMat, 0, hubY, 0)
      // place the central stem so it starts at the hub top and rises to the seat
      cyl(0.05, 0.05, stemHeight, 16, hubMat, 0, hubY + stemHeight / 2, 0)
      box(0.56, 0.1, 0.54, chairMat, 0, 0.54, 0.02)
      // backrest panel (vertical)
      box(0.44, 0.5, 0.1, chairMat, 0, 0.93, -0.26)
      // replace horizontal top rail with a vertical support stem connecting seat to back
      box(0.08, 0.5, 0.08, chairMat, 0, 0.73, -0.32)
      const armInset = 0.22
      box(0.06, 0.32, 0.06, chairMat, -armInset, 0.72, 0.06)
      box(0.06, 0.32, 0.06, chairMat, armInset, 0.72, 0.06)
      // armrest pads: one on each side — rotated to run north-south around their stems
      box(0.32, 0.05, 0.06, chairMat, -armInset, 0.88, 0.06, 0, Math.PI / 2)
      box(0.32, 0.05, 0.06, chairMat, armInset, 0.88, 0.06, 0, Math.PI / 2)

      currentParent = prevParent

      currentParent = scene

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
      screenGlow.position.set(sceneFocus.x, 1.1, sceneFocus.z - 0.12)
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
      const spherical = { theta: 0.6, phi: 0.75, radius: 10 }

      const updateCamera = () => {
        const st = Math.sin(spherical.theta)
        const ct = Math.cos(spherical.theta)
        const sp = Math.sin(spherical.phi)
        const cp = Math.cos(spherical.phi)
        camera.position.set(
          sceneFocus.x + spherical.radius * sp * st,
          sceneFocus.y + spherical.radius * cp,
          sceneFocus.z + spherical.radius * sp * ct
        )
        camera.lookAt(sceneFocus.x, sceneFocus.y, sceneFocus.z)
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
            loftFrame: 0x8c6c4d,
            mattress: 0xf2efe8,
            blanket: 0xd8e3f0,
            pillow: 0xfffcf7,
            shelf: 0xc4a484,
            ladder: 0xa78d6f,
            tableTop: 0xb7906c,
            tableLeg: 0x9b7a60,
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
            loftFrame: 0x2e261d,
            mattress: 0xdfe4ea,
            blanket: 0xaab9d0,
            pillow: 0xf5f4ef,
            shelf: 0x8a6a4a,
            ladder: 0x6f5a45,
            tableTop: 0x7c5b43,
            tableLeg: 0x5a4435,
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
      materials.matLoftFrame.color.setHex(palette.loftFrame)
      materials.matMattress.color.setHex(palette.mattress)
      materials.matBlanket.color.setHex(palette.blanket)
      materials.matPillow.color.setHex(palette.pillow)
      materials.matShelf.color.setHex(palette.shelf)
      materials.matLadder.color.setHex(palette.ladder)
      materials.matTableTop.color.setHex(palette.tableTop)
      materials.matTableLeg.color.setHex(palette.tableLeg)
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
  