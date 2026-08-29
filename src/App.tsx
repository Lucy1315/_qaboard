/* T029 — plan.md 2.1절 라우트. 작성·상세·수정을 별도 주소로 분리한다(US3-1 인수 조건). */
import type { ReactNode } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { RequireAuth } from './auth/RequireAuth';
import { useAuth } from './auth/useAuth';
import { HomePage } from './pages/HomePage';
import { QuestionListPage } from './pages/QuestionListPage';
import { QuestionNewPage } from './pages/QuestionNewPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { QuestionEditPage } from './pages/QuestionEditPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** 순수 Header 에 라우터·인증 상태를 주입한다. Header 자체는 둘 다 모른다. */
function AppHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { viewer } = useAuth();
  const go = (to: string) => () => navigate({ pathname: to, search: window.location.search });
  const current = pathname === '/' ? 'home' : pathname.startsWith('/questions') ? 'list' : null;
  return <Header role={viewer.role} current={current} onHome={go('/')} onList={go('/questions')} />;
}

/** 비회원에게는 화면 자리에 로그인 안내를 렌더한다 (FR-020, design.md 14절). */
function guard(node: ReactNode) {
  return <RequireAuth>{node}</RequireAuth>;
}

export function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions" element={guard(<QuestionListPage />)} />
        <Route path="/questions/new" element={guard(<QuestionNewPage />)} />
        <Route path="/questions/:id" element={guard(<QuestionDetailPage />)} />
        <Route path="/questions/:id/edit" element={guard(<QuestionEditPage />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
