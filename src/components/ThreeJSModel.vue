<template>
    <div ref="container" class="w-full h-full"></div>
  </template>
  
  <script>
  import { onUnmounted } from 'vue';
  import * as THREE from 'three';
  
  export default {
    name: 'ThreeJSModel',
    mounted() {
      this.initScene();
    },
    methods: {
      initScene() {
        // Set up the scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5; // Make sure the camera is far enough from the object
  
        // Create a 3D object (a green cube)
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
  
        // Set up the renderer with a transparent background
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(this.$refs.container.offsetWidth, this.$refs.container.offsetHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        this.$refs.container.appendChild(renderer.domElement);
  
        // Resize handling for responsiveness
        const resize = () => {
          const width = this.$refs.container.offsetWidth;
          const height = this.$refs.container.offsetHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
  
        window.addEventListener('resize', resize);
  
        // Add mouse interactivity
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
  
        const onMouseDown = () => (isDragging = true);
        const onMouseMove = (event) => {
          if (isDragging) {
            const deltaMove = {
              x: event.clientX - previousMousePosition.x,
              y: event.clientY - previousMousePosition.y,
            };
            cube.rotation.y += deltaMove.x * 0.005;
            cube.rotation.x += deltaMove.y * 0.005;
          }
          previousMousePosition = { x: event.clientX, y: event.clientY };
        };
        const onMouseUp = () => (isDragging = false);
  
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('mouseleave', onMouseUp);
  
        // Animate the scene
        const animate = () => {
          requestAnimationFrame(animate);
          cube.rotation.x += 0.01; // Rotate cube slightly
          cube.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        animate();
  
        // Cleanup on component unmount
        onUnmounted(() => {
          window.removeEventListener('resize', resize);
          renderer.domElement.removeEventListener('mousedown', onMouseDown);
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
          renderer.domElement.removeEventListener('mouseup', onMouseUp);
          renderer.domElement.removeEventListener('mouseleave', onMouseUp);
        });
      },
    },
  };
  </script>
  
  <style scoped>
  /* Make the container take the full size of its parent */
  div {
    position: relative;
    width: 100%;
    height: 100%;
  }
  canvas {
    display: block;
  }
  </style>
  