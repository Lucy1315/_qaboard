/* T021 — design.md 2·9절. 문구는 확정본 그대로이다 (FR-033·FR-034). */
import { Button } from '../ui/Button';
import { AuroraBackdrop } from './AuroraBackdrop';
import { FloatingQaCards } from './FloatingQaCards';
import styles from './Hero.module.css';

export function Hero({
  isAnon,
  onWrite,
  onMyQuestions,
}: {
  isAnon: boolean;
  onWrite: () => void;
  onMyQuestions: () => void;
}) {
  return (
    <>
      <section className={`${styles.hero} surfaceDark`}>
        <AuroraBackdrop />
        <div className={styles.inner}>
          <div>
            <span className={styles.eyebrow}>비공개 1:1 문의</span>
            <h1 className={styles.h1}>
              질문은 빠르게,
              <br />
              답변은 명확하게.
            </h1>
            <p className={styles.lead}>궁금한 점을 남기면 관리자가 확인하고 답변해드립니다.</p>
            <div className={styles.cta}>
              <Button variant="primary" onClick={onWrite}>
                질문 작성하기
              </Button>
              <Button variant="darkSecondary" onClick={onMyQuestions}>
                내 질문 확인하기
              </Button>
            </div>
            <p className={styles.note}>
              {isAnon
                ? 'QANOW의 질문은 작성자 본인과 관리자에게만 보입니다. 질문 작성은 로그인 후 가능합니다.'
                : 'QANOW의 질문은 작성자 본인과 관리자에게만 보입니다. 다른 사용자에게 공개되지 않습니다.'}
            </p>
          </div>
          <FloatingQaCards />
        </div>
      </section>
      <div className={styles.fade} aria-hidden="true" />
    </>
  );
}

export function ClosingCta({ onWrite }: { onWrite: () => void }) {
  return (
    <section className={styles.close}>
      <div>
        <h3>궁금한 점이 생겼다면 지금 남겨보세요.</h3>
        <p>답변이 등록되면 내 질문 목록에서 상태가 바뀝니다.</p>
      </div>
      <Button variant="primary" onClick={onWrite}>
        질문 작성하기
      </Button>
    </section>
  );
}
