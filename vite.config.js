import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages - change 'golf-repair-tracker' to your repo name
  base: process.env.GITHUB_ACTIONS ? '/golf-repair-tracker/' : '/',
})
