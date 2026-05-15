import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // 파일 변화를 계속 감시하도록 설정 (수정 즉시 반영에 도움)
    },
  },
})