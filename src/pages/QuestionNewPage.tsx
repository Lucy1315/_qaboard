/* T033 — design.md 12절 (FR-005·FR-026·FR-031) */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../components/layout/Page';
import { QuestionForm } from '../components/question/QuestionForm';
import { repository } from '../data/repository';
import { ValidationError } from '../data/errors';
import { useAuth } from '../auth/useAuth';

export function QuestionNewPage() {
  const navigate = useNavigate();
  const { viewer } = useAuth();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<{ field: 'title' | 'body'; message: string } | null>(
    null,
  );

  const back = () => navigate({ pathname: '/questions', search: window.location.search });

  return (
    <Page prose>
      <PageHeader title="질문 작성" desc="제목과 내용을 남기면 관리자가 확인합니다." stacked />
      <QuestionForm
        mode="new"
        saving={saving}
        serverError={serverError}
        onCancel={back}
        onSubmit={(v) => {
          setSaving(true);
          setServerError(null);
          repository
            .createQuestion(v, viewer)
            .then(back)
            .catch((e: unknown) => {
              if (e instanceof ValidationError && e.field !== 'answer') {
                setServerError({ field: e.field, message: e.message });
              }
            })
            .finally(() => setSaving(false));
        }}
      />
    </Page>
  );
}
