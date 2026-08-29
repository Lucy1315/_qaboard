/* T030·T031·T032 — design.md 3.2·11·14절 (FR-007·FR-008·FR-029·FR-041) */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../components/layout/Page';
import { Button } from '../components/ui/Button';
import { LoadingNote, StateBox } from '../components/ui/StateBox';
import { ListSkeleton } from '../components/ui/Skeleton';
import { StatusTabs, type FilterCounts, type StatusFilter } from '../components/ui/StatusTabs';
import { QuestionList } from '../components/question/QuestionList';
import { repository } from '../data/repository';
import type { QuestionSummary } from '../data/types';
import { useAuth } from '../auth/useAuth';

type View =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'empty' }
  | { kind: 'ready'; items: QuestionSummary[] };

export function QuestionListPage() {
  const navigate = useNavigate();
  const { viewer, isAdmin, isMember } = useAuth();
  const [view, setView] = useState<View>({ kind: 'loading' });
  // FR-041 — 관리자는 "답변 대기"로 들어온다 (SC-003)
  const [filter, setFilter] = useState<StatusFilter>(isAdmin ? 'wait' : 'all');

  const load = useCallback(() => {
    setView({ kind: 'loading' });
    repository
      .listQuestions(viewer)
      .then((items) => setView(items.length === 0 ? { kind: 'empty' } : { kind: 'ready', items }))
      .catch(() => setView({ kind: 'error' }));
  }, [viewer]);

  useEffect(load, [load]);

  const counts: FilterCounts | null = useMemo(() => {
    if (view.kind !== 'ready') return null;
    return {
      all: view.items.length,
      wait: view.items.filter((q) => q.status === 'wait').length,
      done: view.items.filter((q) => q.status === 'done').length,
    };
  }, [view]);

  // 선택된 구분에 결과가 없으면 전체로 되돌린다(빈 결과 화면을 만들지 않는다).
  useEffect(() => {
    if (counts && counts[filter] === 0 && counts.all > 0) setFilter('all');
  }, [counts, filter]);

  const visible = view.kind === 'ready'
    ? view.items.filter((q) => (filter === 'all' ? true : filter === 'wait' ? q.status === 'wait' : q.status === 'done'))
    : [];

  const go = (to: string) => () => navigate({ pathname: to, search: window.location.search });

  return (
    <Page>
      <PageHeader
        title={isAdmin ? '문의 관리' : '내 질문'}
        desc={
          isAdmin
            ? '답변이 필요한 질문을 먼저 확인해 주세요.'
            : '내가 남긴 질문과 답변 상태를 확인할 수 있습니다.'
        }
        action={
          isMember ? (
            <Button variant="primary" onClick={go('/questions/new')}>
              새 질문 작성
            </Button>
          ) : undefined
        }
      />

      <StatusTabs
        value={filter}
        counts={counts}
        enabled={view.kind === 'ready'}
        onChange={setFilter}
      />

      {view.kind === 'loading' ? (
        <>
          <ListSkeleton />
          <LoadingNote />
        </>
      ) : null}

      {view.kind === 'error' ? (
        <StateBox
          variant="errorList"
          actions={
            <Button variant="secondary" onClick={load}>
              다시 시도
            </Button>
          }
        />
      ) : null}

      {view.kind === 'empty' ? (
        <StateBox
          variant={isAdmin ? 'emptyAdmin' : 'emptyMember'}
          actions={
            isMember ? (
              <Button variant="primary" onClick={go('/questions/new')}>
                질문 작성하기
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {view.kind === 'ready' ? (
        <QuestionList
          items={visible}
          isAdmin={isAdmin}
          onOpen={(id) => navigate({ pathname: `/questions/${id}`, search: window.location.search })}
        />
      ) : null}
    </Page>
  );
}
