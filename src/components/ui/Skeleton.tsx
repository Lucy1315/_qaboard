/* T020 — 행 높이를 실제 목록 행과 같은 58px 로 고정해 레이아웃이 튀지 않게 한다
   (design.md 11.2·14절). 폭은 전부 CSS 클래스로 둔다 — 인라인 style 을 쓰지 않는다. */
import styles from './Skeleton.module.css';

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className={styles.row} key={i}>
          <div className={`${styles.bar} ${styles.barGrow} pulse`} />
          <div className={`${styles.bar} ${styles.barMd} pulse`} />
          <div className={`${styles.bar} ${styles.barSm} pulse`} />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className={styles.block} aria-hidden="true">
      <div className={`${styles.bar} ${styles.barTitle} pulse`} />
      <div className={`${styles.bar} ${styles.barFull} pulse`} />
      <div className={`${styles.bar} ${styles.barFull} pulse`} />
      <div className={`${styles.bar} ${styles.barShort} pulse`} />
    </div>
  );
}
