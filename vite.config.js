import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

function copySourceAssets() {
  return {
    name: 'copy-source-assets',
    apply: 'build',
    writeBundle() {
      const sourceDir = path.resolve('src/assets')
      const targetDir = path.resolve('dist/src/assets')

      fs.rmSync(targetDir, { recursive: true, force: true })
      fs.mkdirSync(path.dirname(targetDir), { recursive: true })
      fs.cpSync(sourceDir, targetDir, { recursive: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.jpg', '**/*.JPG', '**/*.jpeg', '**/*.JPEG', '**/*.png', '**/*.PNG', '**/*.webp', '**/*.WEBP'],
  plugins: [vue(), copySourceAssets()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        learn: path.resolve('learn/index.html'),
      },
    },
  },
})
