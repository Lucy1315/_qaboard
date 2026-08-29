/* T041 — Supabase 클라이언트. Mock 모드에서는 생성하지 않는다. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isMock, missingEnv } from './env';

let client: SupabaseClient | null = null;

/** Supabase 모드에서만 호출한다. 환경 변수가 비어 있으면 즉시 실패시킨다. */
export function getSupabase(): SupabaseClient {
  if (isMock) throw new Error('Mock 모드에서는 Supabase 클라이언트를 쓰지 않는다.');
  if (client) return client;
  const missing = missingEnv();
  if (missing.length > 0) throw new Error(`환경 변수가 비어 있다: ${missing.join(', ')}`);
  client = createClient(
    (import.meta.env.VITE_SUPABASE_URL as string).trim(),
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string).trim(),
    { auth: { persistSession: true, autoRefreshToken: true } },
  );
  return client;
}
