/* T020 — 행 높이를 실제 목록 행과 같은 58px 로 고정해 레이아웃이 튀지 않게 한다 (design.md 11.2·14절). */
import styles from './Skeleton.module.css';

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className={styles.row} key={i}>
          <div className={`${styles.bar} pulse`} style={{ flex: 1 }} />
          <div className={`${styles.bar} pulse`} style={{ width: 96 }} />
          <div className={`${styles.bar} pulse`} style={{ width: 72 }} />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className={styles.block} aria-hidden="true">
      <div className={`${styles.bar} pulse`} style={{ width: '70%', height: 22, marginBottom: 18 }} />
      <div className={`${styles.bar} pulse`} style={{ width: '100%' }} />
      <div className={`${styles.bar} pulse`} style={{ width: '100%' }} />
      <div className={`${styles.bar} pulse`} style={{ width: '60%' }} />
    </div>
  );
}
