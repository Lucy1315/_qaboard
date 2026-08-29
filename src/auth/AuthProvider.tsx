/* T028·T048 — 인증 상태.
   Mock 모드: `?as=guest|member|admin` 으로 역할을 바꾼다(개발 도구, Supabase 모드에서는 무시).
   Supabase 모드: 세션을 구독하고, 역할은 세션이 아니라 profiles.role 에서 1회 읽는다.
   클라이언트가 보관한 역할은 화면 분기용일 뿐이며 권한 근거가 아니다 — 판정은 RLS 가 한다(원칙 II). */
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isMock } from '../lib/env';
import { getSupabase } from '../lib/supabase';
import { MOCK_ME } from '../data/fixtures';
import type { Role, Viewer } from '../data/types';

export type AuthState =
  | { status: 'loading'; viewer: Viewer }
  | { status: 'anon'; viewer: Viewer }
  | { status: 'authed'; viewer: Extract<Viewer, { role: Role }> };

const ANON: AuthState = { status: 'anon', viewer: { role: 'anon' } };

export const AuthContext = createContext<AuthState>(ANON);

const MOCK_EMAILS: Record<Role, string> = { member: MOCK_ME, admin: 'admin@qanow.kr' };

export function AuthProvider({ children }: { children: ReactNode }) {
  return isMock ? <MockAuthProvider>{children}</MockAuthProvider> : <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}

/* ── Mock ───────────────────────────────────────────────────────────────── */
function MockAuthProvider({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const as = params.get('as');

  const value = useMemo<AuthState>(() => {
    const role: Role | 'guest' = as === 'admin' ? 'admin' : as === 'guest' ? 'guest' : 'member';
    if (role === 'guest') return ANON;
    return { status: 'authed', viewer: { role, userId: `mock-${role}`, email: MOCK_EMAILS[role] } };
  }, [as]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Supabase ───────────────────────────────────────────────────────────── */
function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', viewer: { role: 'anon' } });

  useEffect(() => {
    const supabase = getSupabase();
    let alive = true;

    /** 역할은 profiles 에서 읽는다. JWT 커스텀 클레임을 쓰지 않는다(research R4). */
    async function resolve(userId: string | undefined, email: string | undefined) {
      if (!userId) {
        if (alive) setState(ANON);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('role,email')
        .eq('id', userId)
        .maybeSingle();
      if (!alive) return;
      if (error || !data) {
        // 프로필을 못 읽으면 최소 권한으로 둔다. 실제 차단은 RLS 가 한다.
        console.error('[auth] 프로필 조회 실패', error);
        setState({ status: 'authed', viewer: { role: 'member', userId, email: email ?? '' } });
        return;
      }
      const row = data as { role: Role; email: string };
      setState({
        status: 'authed',
        viewer: { role: row.role === 'admin' ? 'admin' : 'member', userId, email: row.email ?? email ?? '' },
      });
    }

    supabase.auth.getSession().then(({ data }) => {
      void resolve(data.session?.user.id, data.session?.user.email);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolve(session?.user.id, session?.user.email);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
