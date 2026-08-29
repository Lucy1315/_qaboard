/* T030 — design.md 11.2·11.3절.
   데스크톱 행 / 모바일 카드를 CSS 로 전환한다(자바스크립트로 화면 폭을 재지 않는다). */
import { Badge } from '../ui/Badge';
import type { QuestionSummary } from '../../data/types';
import { formatDate, formatDateTime } from '../../lib/format';
import styles from './Question.module.css';

type Props = { items: QuestionSummary[]; isAdmin: boolean; onOpen: (id: string) => void };

export function QuestionList({ items, isAdmin, onOpen }: Props) {
  return (
    <>
      <div className={styles.desktopOnly}>
        <div className={styles.listWrap}>
          <div className={`${styles.rowHead} ${isAdmin ? styles.rowHeadAdmin : ''}`}>
            <span>제목</span>
            {isAdmin ? <span>작성자</span> : null}
            <span>작성일</span>
            <span>상태</span>
          </div>
          {items.map((q) => (
            <button
              type="button"
              key={q.id}
              className={`${styles.row} ${isAdmin ? styles.rowAdmin : ''} ${
                q.status === 'wait' ? styles.rowWait : ''
              }`}
              onClick={() => onOpen(q.id)}
            >
              <span className={styles.rowTitle}>{q.title}</span>
              {isAdmin ? <span className={styles.rowMeta}>{q.authorEmail}</span> : null}
              <span className={styles.rowMeta}>{formatDate(q.createdAt)}</span>
              <Badge tone={q.status === 'done' ? 'done' : 'wait'}>
                {q.status === 'done' ? '답변 완료' : '답변 대기'}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.mobileOnly} ${styles.cards}`}>
        {items.map((q) => (
          <button
            type="button"
            key={q.id}
            className={`${styles.card} ${q.status === 'wait' ? styles.cardWait : ''}`}
            onClick={() => onOpen(q.id)}
          >
            <Badge tone={q.status === 'done' ? 'done' : 'wait'}>
              {q.status === 'done' ? '답변 완료' : '답변 대기'}
            </Badge>
            <p className={styles.cardTitle}>{q.title}</p>
            {isAdmin ? <span className={styles.cardMeta}>작성자 {q.authorEmail}</span> : null}
            <span className={styles.cardMeta}>{formatDateTime(q.createdAt)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
