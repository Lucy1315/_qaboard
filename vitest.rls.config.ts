import { defineConfig } from 'vitest/config';

/* RLS 계약 테스트는 실제 Supabase 프로젝트가 필요하므로 기본 테스트에서 분리한다. */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/rls/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
