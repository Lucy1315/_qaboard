/* T015 — design.md 4·8·18절. 최대 폭과 여백 컨테이너, Page Header, Footer. */
import type { ReactNode } from 'react';
import styles from './Page.module.css';

export function Page({ children, prose = false }: { children: ReactNode; prose?: boolean }) {
  return <main className={styles.page}>{prose ? <div className={styles.prose}>{children}</div> : children}</main>;
}

export function PageHeader({
  title,
  desc,
  action,
  stacked = false,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  stacked?: boolean;
}) {
  return (
    <div className={`${styles.title} ${stacked ? styles.stacked : ''}`}>
      <div>
        <h1>{title}</h1>
        {desc ? <p>{desc}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** design.md 5절 — 역할과 무관하게 문구를 고정한다. */
export function BackToList({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.back} onClick={onClick}>
      ← 목록으로 돌아가기
    </button>
  );
}

export function Footer() {
  return (
    <footer className={`${styles.footer} surfaceDark`}>
      <span className={styles.wordmark}>QANOW</span>
      <span>회원 질문 · 관리자 답변 게시판</span>
    </footer>
  );
}
