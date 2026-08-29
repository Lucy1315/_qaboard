/* T023 — design.md 10.4절. 정적 DOM 이며 실제 질문 데이터를 렌더하지 않는다. */
import { Badge } from '../ui/Badge';
import styles from './Hero.module.css';

export function FloatingQaCards() {
  return (
    <div>
      <div className={`${styles.qa} floaty1`}>
        <div className={styles.qaTop}>
          <span className={styles.qaRole}>Q · 회원</span>
          <Badge tone="darkWait">답변 대기</Badge>
        </div>
        <p className={styles.qaTitle}>결제 내역은 어디에서 확인하나요?</p>
        <p className={styles.qaBody}>지난달 결제 내역을 다시 보고 싶은데 화면을 찾지 못했습니다.</p>
        <p className={styles.qaTime}>2026.08.29 14:02</p>
      </div>

      <div className={styles.link} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.linkLabel}>관리자 확인</span>
      </div>

      <div className={`${styles.qa} ${styles.qaShift} floaty2`}>
        <div className={styles.qaTop}>
          <span className={styles.qaRole}>A · 관리자</span>
          <Badge tone="darkDone">답변 완료</Badge>
        </div>
        <p className={`${styles.qaBody} ${styles.qaBodyStrong}`}>
          내 질문 화면에서 해당 질문을 열면 결제 내역 확인 경로를 함께 안내해 두었습니다.
        </p>
        <p className={styles.qaTime}>2026.08.29 15:20</p>
      </div>
    </div>
  );
}
