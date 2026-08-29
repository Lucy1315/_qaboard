/* T019 — design.md 14절. 로딩은 해당 영역 안에서만 알린다.
   모션이 정지해도 텍스트가 로딩을 알린다(FR-038). */
import { STATE_COPY } from './stateCopy';
import styles from './LoadingNote.module.css';

export function LoadingNote() {
  return (
    <p className={styles.loading} role="status">
      <span className={`${styles.spinner} spin`} aria-hidden="true" />
      {STATE_COPY.loading.label}
    </p>
  );
}
