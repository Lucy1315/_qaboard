/* T032 — FR-041 / design.md 11.1절.
   - 로딩·빈 목록·오류 상태에서는 건수를 감추고 탭을 비활성화한다.
     "질문이 없습니다"와 "전체 2"가 함께 보이는 모순을 막기 위함이다.
   - 건수가 0인 구분도 비활성화한다. 결과 없는 목록 화면은 design.md 14절에 정의되어 있지 않으므로
     새 상태를 만들지 않고 도달 자체를 막는다(헌장 원칙 IV). */
import styles from './StatusTabs.module.css';

export type StatusFilter = 'all' | 'wait' | 'done';

export type FilterCounts = { all: number; wait: number; done: number };

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'wait', label: '답변 대기' },
  { key: 'done', label: '답변 완료' },
];

export function StatusTabs({
  value,
  counts,
  enabled,
  onChange,
}: {
  value: StatusFilter;
  /** 데이터가 준비되지 않았으면 null 을 넘긴다. 건수가 사라지고 탭이 비활성화된다. */
  counts: FilterCounts | null;
  enabled: boolean;
  onChange: (next: StatusFilter) => void;
}) {
  return (
    <div className={styles.tabs} role="group" aria-label="답변 상태로 좁혀 보기">
      {TABS.map((t) => {
        const n = counts ? counts[t.key] : null;
        const disabled = !enabled || counts === null || n === 0;
        return (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${value === t.key ? styles.on : ''}`}
            aria-pressed={value === t.key}
            disabled={disabled}
            onClick={() => onChange(t.key)}
          >
            {t.label}
            {n !== null ? <span className={styles.count}>{n}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
