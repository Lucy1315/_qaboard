/* T033 — design.md 13.1절. 관리자만 렌더된다 (FR-017). */
import { useState } from 'react';
import { Button } from '../ui/Button';
import { TextareaField } from '../ui/Field';
import { Badge } from '../ui/Badge';
import { HELP, LIMITS, countOf, validateAnswer } from '../../data/validation';
import styles from './Question.module.css';

type Props = {
  initial: string;
  answered: boolean;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (body: string) => void;
};

export function AnswerForm({ initial, answered, saving, onCancel, onSubmit }: Props) {
  const [body, setBody] = useState(initial);
  const [touched, setTouched] = useState(false);
  const err = touched ? validateAnswer(body) : null;

  return (
    <div>
      <TextareaField
        label={answered ? '답변 수정' : '답변'}
        help={HELP.answer}
        error={err}
        count={{ now: countOf(body), max: LIMITS.answer }}
        value={body}
        placeholder="답변 내용을 입력하세요"
        onChange={(e) => setBody(e.target.value)}
      />
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button
          variant="primary"
          loading={saving}
          onClick={() => {
            setTouched(true);
            if (validateAnswer(body)) return;
            onSubmit(body);
          }}
        >
          {answered ? '답변 저장' : '답변 등록'}
        </Button>
        {saving ? <Badge tone="saving">저장 중입니다...</Badge> : null}
      </div>
    </div>
  );
}
