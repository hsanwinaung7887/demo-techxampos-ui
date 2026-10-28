import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,         // 💡 5173 ကို ပြန်ပြောင်းပေးပါ
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8083', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})