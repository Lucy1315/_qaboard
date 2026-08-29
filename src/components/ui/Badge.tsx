/* T018 — design.md 19.5절.
   children 이 필수 prop 이므로 텍스트 없는 배지를 만들 수 없다 (FR-030). */
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'wait' | 'done' | 'error' | 'neutral' | 'saving' | 'darkWait' | 'darkDone';

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <i className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  );
}
