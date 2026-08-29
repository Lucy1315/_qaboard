/* T019 — design.md 14절. 다섯 변형을 한 컴포넌트로 렌더한다.
   모든 상태에 텍스트가 있으며 색·아이콘만으로 구분하지 않는다 (FR-029·FR-030).
   오류 문구에 내부 예외를 담지 않는다 (FR-032). */
import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { STATE_COPY } from './stateCopy';
import styles from './StateBox.module.css';

export type StateVariant =
  | 'emptyMember'
  | 'emptyAdmin'
  | 'errorList'
  | 'errorDetail'
  | 'unauthorized'
  | 'loginRequired';

const TONE = {
  emptyMember: 'neutral',
  emptyAdmin: 'neutral',
  errorList: 'error',
  errorDetail: 'error',
  unauthorized: 'neutral',
  loginRequired: 'neutral',
} as const;

export function StateBox({
  variant,
  actions,
}: {
  variant: StateVariant;
  actions?: ReactNode;
}) {
  const copy = STATE_COPY[variant];
  const isError = variant === 'errorList' || variant === 'errorDetail';
  return (
    <div className={`${styles.box} ${isError ? styles.error : ''}`} role={isError ? 'alert' : undefined}>
      <Badge tone={TONE[variant]}>{copy.badge}</Badge>
      <h3 className={styles.title}>{copy.title}</h3>
      <p className={styles.desc}>{copy.desc}</p>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

/** 로딩은 해당 영역 안에서만 표시한다. 화면 전체를 덮지 않는다. */
export function LoadingNote() {
  return (
    <p className={styles.loading} role="status">
      <span className={`${styles.spinner} spin`} aria-hidden="true" />
      {STATE_COPY.loading.label}
    </p>
  );
}
