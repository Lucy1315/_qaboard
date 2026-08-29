/* T029 — 비회원에게는 리다이렉트가 아니라 로그인 안내를 렌더한다 (design.md 14절, FR-020).
   이 가드는 UX 편의이며 실제 차단은 데이터 계층이 한다(원칙 II). */
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { StateBox } from '../components/ui/StateBox';
import { LoadingNote } from '../components/ui/LoadingNote';
import { Page } from '../components/layout/Page';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAnon, isLoading } = useAuth();
  /* 세션을 확인하는 동안 로그인 안내를 먼저 띄우면 깜빡인다. */
  if (isLoading) {
    return (
      <Page>
        <LoadingNote />
      </Page>
    );
  }
  if (isAnon) {
    return (
      <Page>
        <StateBox variant="loginRequired" as="h1" />
      </Page>
    );
  }
  return <>{children}</>;
}
