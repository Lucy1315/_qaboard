/* T028 — Mock 세션. `?as=guest|member|admin` 은 Mock 모드 전용 개발 도구이며
   Supabase 모드에서는 무시된다(plan.md 15절). */
import { createContext, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isMock } from '../lib/env';
import { MOCK_ME } from '../data/fixtures';
import type { Role, Viewer } from '../data/types';

export type AuthState =
  | { status: 'anon'; viewer: Viewer }
  | { status: 'authed'; viewer: Extract<Viewer, { role: Role }> };

export const AuthContext = createContext<AuthState>({ status: 'anon', viewer: { role: 'anon' } });

const EMAILS: Record<Role, string> = { member: MOCK_ME, admin: 'admin@qanow.kr' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const as = isMock ? params.get('as') : null;

  const value = useMemo<AuthState>(() => {
    const role: Role | 'guest' = as === 'admin' ? 'admin' : as === 'guest' ? 'guest' : 'member';
    if (role === 'guest') return { status: 'anon', viewer: { role: 'anon' } };
    return {
      status: 'authed',
      viewer: { role, userId: `mock-${role}`, email: EMAILS[role] },
    };
  }, [as]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
