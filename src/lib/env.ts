/* T007 — 배포 플랫폼은 값 없이 만든 환경 변수를 빈 문자열로 주입한다.
   `x ?? '기본값'` 이 동작하지 않으므로 "존재 + 비어 있지 않음"을 함께 검사한다. */
export type DataSource = 'mock' | 'supabase';

function read(name: string): string {
  const raw = (import.meta.env as Record<string, unknown>)[name];
  return typeof raw === 'string' ? raw.trim() : '';
}

export const dataSource: DataSource = read('VITE_DATA_SOURCE') === 'supabase' ? 'supabase' : 'mock';
export const isMock = dataSource === 'mock';

/** Supabase 모드에서만 필요한 변수. 비어 있으면 이름을 돌려준다. */
export function missingEnv(): string[] {
  if (isMock) return [];
  return ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((n) => read(n) === '');
}
