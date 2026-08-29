/* T033·T034 — design.md 13·14절 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackToList, Page } from '../components/layout/Page';
import { Button } from '../components/ui/Button';
import { StateBox } from '../components/ui/StateBox';
import { LoadingNote } from '../components/ui/LoadingNote';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { QuestionDetailView } from '../components/question/QuestionDetailView';
import { AnswerForm } from '../components/question/AnswerForm';
import { repository } from '../data/repository';
import { UnauthorizedError } from '../data/errors';
import type { QuestionDetail } from '../data/types';
import { useAuth } from '../auth/useAuth';

type View =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'unauthorized' }
  | { kind: 'ready'; q: QuestionDetail };

export function QuestionDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { viewer, isMember, isAdmin } = useAuth();
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [answering, setAnswering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const nav = (to: string) => navigate({ pathname: to, search: window.location.search });
  const toList = () => nav('/questions');

  return (
    <Page prose>
      <BackToList onClick={toList} />

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
        <QuestionDetailView
          q={view.q}
          isMember={isMember}
          isAdmin={isAdmin}
          deleting={deleting}
          onEdit={() => nav(`/questions/${id}/edit`)}
          onAnswer={() => setAnswering(true)}
          onDelete={() => {
            setDeleting(true);
            repository
              .deleteQuestion(id, viewer)
              .then(toList)
              .catch(() => setView({ kind: 'error' }))
              .finally(() => setDeleting(false));
          }}
          answerForm={
            isAdmin && answering ? (
              <AnswerForm
                initial={view.q.answer?.body ?? ''}
                answered={view.q.answer !== null}
                saving={saving}
                onCancel={() => setAnswering(false)}
                onSubmit={(body) => {
                  setSaving(true);
                  repository
                    .upsertAnswer(id, body, viewer)
                    .then(() => {
                      setAnswering(false);
                      load();
                    })
                    .catch(() => setView({ kind: 'error' }))
                    .finally(() => setSaving(false));
                }}
              />
            ) : undefined
          }
        />
      ) : null}
    </Page>
  );
}
