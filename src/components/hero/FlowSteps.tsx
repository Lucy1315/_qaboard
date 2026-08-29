/* T024 — design.md 2·9절. 문구를 임의로 바꾸지 않는다 (FR-033). */
import styles from './Hero.module.css';

const STEPS = [
  { no: '01', title: '질문 작성', desc: '제목과 내용을 남기면 접수됩니다.' },
  { no: '02', title: '관리자 확인', desc: '담당 관리자가 질문을 확인합니다.' },
  { no: '03', title: '답변 확인', desc: '답변이 등록되면 내 질문에서 바로 볼 수 있습니다.' },
] as const;

export function FlowSteps() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.kicker}>이용 흐름</div>
        <h2 className={styles.h2}>질문 작성 → 관리자 확인 → 답변 확인</h2>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <div className={styles.step} key={s.no}>
              <div className={styles.stepNo}>{s.no}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
