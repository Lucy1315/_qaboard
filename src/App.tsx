/* T029 — plan.md 2.1절 라우트. 작성·상세·수정을 별도 주소로 분리한다(US3-1 인수 조건). */
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { RequireAuth } from './auth/RequireAuth';
import { Page } from './components/layout/Page';
import { HomePage } from './pages/HomePage';
import { QuestionListPage } from './pages/QuestionListPage';
import { QuestionNewPage } from './pages/QuestionNewPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { QuestionEditPage } from './pages/QuestionEditPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** 비회원에게는 화면 자리에 로그인 안내를 렌더한다 (FR-020, design.md 14절). */
function Guarded({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Page>{children}</Page>
    </RequireAuth>
  );
}

export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions" element={<QuestionListRoute />} />
        <Route path="/questions/new" element={<QuestionNewRoute />} />
        <Route path="/questions/:id" element={<QuestionDetailRoute />} />
        <Route path="/questions/:id/edit" element={<QuestionEditRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

/* 각 페이지가 이미 <Page> 를 포함하므로, 가드는 안내 화면일 때만 <Page> 를 씌운다. */
function guard(node: ReactNode) {
  return <RequireAuth>{node}</RequireAuth>;
}

function QuestionListRoute() {
  return guard(<QuestionListPage />);
}
function QuestionNewRoute() {
  return guard(<QuestionNewPage />);
}
function QuestionDetailRoute() {
  return guard(<QuestionDetailPage />);
}
function QuestionEditRoute() {
  return guard(<QuestionEditPage />);
}

export { Guarded };
