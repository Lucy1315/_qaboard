/* T033·T034 — design.md 13절. 역할·답변 유무에 따른 행동 영역은 13.1절 표를 그대로 따른다.
   권한 없는 요소는 비활성으로 띄우지 않고 아예 렌더하지 않는다 (FR-017). */
import { useEffect, useId, useRef, useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { QuestionDetail } from '../../data/types';
import { formatDateTime } from '../../lib/format';
import styles from './Question.module.css';

type Props = {
  q: QuestionDetail;
  isMember: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAnswer: () => void;
  answerForm?: React.ReactNode;
  deleting?: boolean;
};

export function QuestionDetailView({
  q,
  isMember,
  isAdmin,
  onEdit,
  onDelete,
  onAnswer,
  answerForm,
  deleting = false,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const answered = q.answer !== null;

  /* 확인 블록이 나타나면 포커스를 옮긴다. 옮기지 않으면 키보드 사용자가
     화면이 바뀐 것을 알 수 없다(원칙 VIII). */
  const confirmRef = useRef<HTMLDivElement>(null);
  const confirmTitleId = useId();
  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  return (
    <div>
      <div className={styles.qhead}>
        <Badge tone={answered ? 'done' : 'wait'}>{answered ? '답변 완료' : '답변 대기'}</Badge>
        <h1>{q.title}</h1>
        <p className={styles.qmeta}>
          {isAdmin ? `작성자 ${q.authorEmail} · ` : ''}
          작성 {formatDateTime(q.createdAt)}
        </p>
      </div>

      <div className={styles.block}>
        <div className={styles.blockLabel}>질문</div>
        <p className={styles.body}>{q.body}</p>
      </div>

      <div className={`${styles.block} ${styles.blockAnswer}`}>
        <div className={styles.blockLabel}>관리자 답변</div>
        {q.answer ? (
          <>
            <p className={styles.body}>{q.answer.body}</p>
            <p className={`${styles.qmeta} ${styles.answerMeta}`}>
              답변 {formatDateTime(q.answer.updatedAt)}
            </p>
          </>
        ) : (
          <div className={styles.waitBox}>
            아직 답변이 등록되지 않았습니다. 관리자가 확인 후 등록합니다.
          </div>
        )}
      </div>

      {answerForm}

      {/* 회원 · 답변 전 */}
      {isMember && !answered && !confirming ? (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onEdit}>
            수정하기
          </Button>
          <Button variant="destructive" onClick={() => setConfirming(true)}>
            삭제하기
          </Button>
        </div>
      ) : null}

      {/* FR-011 — 되돌릴 수 없음을 알리는 확인 단계 */}
      {isMember && !answered && confirming ? (
        <div
          ref={confirmRef}
          tabIndex={-1}
          className={styles.confirm}
          role="group"
          aria-labelledby={confirmTitleId}
        >
          <p>
            <strong id={confirmTitleId}>이 질문을 삭제하시겠습니까?</strong>
            삭제한 질문은 되돌릴 수 없습니다.
          </p>
          <div className={styles.confirmRow}>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              취소
            </Button>
            <Button variant="destructive" loading={deleting} onClick={onDelete}>
              삭제하기
            </Button>
          </div>
        </div>
      ) : null}

      {/* 회원 · 답변 후 — 버튼 없이 안내만 (FR-012) */}
      {isMember && answered ? (
        <div className={styles.lockMsg}>답변이 등록된 질문은 수정하거나 삭제할 수 없습니다.</div>
      ) : null}

      {/* 관리자 */}
      {isAdmin && !answerForm ? (
        <div className={styles.actions}>
          <Button variant="primary" onClick={onAnswer}>
            {answered ? '답변 수정하기' : '답변 작성하기'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
