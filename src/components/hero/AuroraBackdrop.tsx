/* T022 — Aurora · Grid · Scrim 세 겹을 한 컴포넌트로 캡슐화한다 (design.md 10절). */
import styles from './AuroraBackdrop.module.css';

export function AuroraBackdrop() {
  return (
    <>
      <div className={`${styles.aurora} drift`} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.scrim} data-testid="hero-scrim" aria-hidden="true" />
    </>
  );
}
