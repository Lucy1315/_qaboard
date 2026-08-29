import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// T001·T002 — 개발 포트 5174 / Supabase 모드 5175 (헌장 추가 제약: 3777~3779 회피)
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
});
