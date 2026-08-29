/* T033 — design.md 12절 (FR-010·FR-012) */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page, PageHeader } from '../components/layout/Page';
import { QuestionForm } from '../components/question/QuestionForm';
import { StateBox } from '../components/ui/StateBox';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { LoadingNote } from '../components/ui/StateBox';
import { Button } from '../components/ui/Button';
import { repository } from '../data/repository';
import { UnauthorizedError, ValidationError } from '../data/errors';
import type { QuestionDetail } from '../data/types';
import { useAuth } from '../auth/useAuth';

type View =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'unauthorized' }
  | { kind: 'ready'; q: QuestionDetail };

export function QuestionEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { viewer } = useAuth();
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<{ field: 'title' | 'body'; message: string } | null>(
    null,
  );

  const load = useCallback(() => {
    setView({ kind: 'loading' });
    repository
      .getQuestion(id, viewer)
      .then((q) => setView({ kind: 'ready', q }))
      .catch((e: unknown) =>
        setView(e instanceof UnauthorizedError ? { kind: 'unauthorized' } : { kind: 'error' }),
      );
  }, [id, viewer]);

  useEffect(load, [load]);

  const back = () => navigate({ pathname: `/questions/${id}`, search: window.location.search });
  const toList = () => navigate({ pathname: '/questions', search: window.location.search });

  return (
    <Page prose>
      <PageHeader title="질문 수정" desc="답변이 등록되기 전에만 수정할 수 있습니다." stacked />

      {view.kind === 'loading' ? (
        <>
          <DetailSkeleton />
          <LoadingNote />
        </>
      ) : null}

      {view.kind === 'error' ? (
        <StateBox
          variant="errorDetail"
          actions={
            <Button variant="secondary" onClick={load}>
              다시 시도
            </Button>
          }
        />
      ) : null}

      {view.kind === 'unauthorized' ? (
        <StateBox
          variant="unauthorized"
          actions={
            <Button variant="secondary" onClick={toList}>
              목록으로 이동
            </Button>
          }
        />
      ) : null}

      {view.kind === 'ready' ? (
        <QuestionForm
          mode="edit"
          initial={{ title: view.q.title, body: view.q.body }}
          saving={saving}
          serverError={serverError}
          onCancel={back}
          onSubmit={(v) => {
            setSaving(true);
            setServerError(null);
            repository
              .updateQuestion(id, v, viewer)
              .then(back)
              .catch((e: unknown) => {
                if (e instanceof ValidationError && e.field !== 'answer') {
                  setServerError({ field: e.field, message: e.message });
                }
              })
              .finally(() => setSaving(false));
          }}
        />
      ) : null}
    </Page>
  );
}
