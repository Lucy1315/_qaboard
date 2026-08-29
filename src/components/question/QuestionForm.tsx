/* T033 — design.md 12절. 작성과 수정이 같은 폼을 쓴다. */
import { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { InputField, TextareaField } from '../ui/Field';
import { Badge } from '../ui/Badge';
import { HELP, LIMITS, countOf, validateBody, validateTitle } from '../../data/validation';
import styles from './Question.module.css';

type Props = {
  mode: 'new' | 'edit';
  initial?: { title: string; body: string };
  saving: boolean;
  serverError?: { field: 'title' | 'body'; message: string } | null;
  onCancel: () => void;
  onSubmit: (v: { title: string; body: string }) => void;
};

export function QuestionForm({ mode, initial, saving, serverError, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [touched, setTouched] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const titleErr = touched ? validateTitle(title) : null;
  const bodyErr = touched ? validateBody(body) : null;

  const submit = () => {
    setTouched(true);
    /* 오류가 있으면 첫 오류 필드로 포커스를 옮긴다(plan.md 21절). */
    if (validateTitle(title)) {
      titleRef.current?.focus();
      return;
    }
    if (validateBody(body)) {
      bodyRef.current?.focus();
      return;
    }
    onSubmit({ title, body });
  };

  return (
    <div>
      <InputField
        label="제목"
        help={HELP.title}
        error={serverError?.field === 'title' ? serverError.message : titleErr}
        count={{ now: countOf(title), max: LIMITS.title }}
        inputRef={titleRef}
        value={title}
        placeholder="질문 제목을 입력하세요"
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextareaField
        label="내용"
        help={HELP.body}
        error={serverError?.field === 'body' ? serverError.message : bodyErr}
        count={{ now: countOf(body), max: LIMITS.body }}
        inputRef={bodyRef}
        value={body}
        placeholder="문의하실 내용을 자세히 적어 주세요"
        onChange={(e) => setBody(e.target.value)}
      />
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="primary" loading={saving} onClick={submit}>
          {mode === 'edit' ? '저장하기' : '등록하기'}
        </Button>
        {saving ? <Badge tone="saving">저장 중입니다...</Badge> : null}
      </div>
    </div>
  );
}
