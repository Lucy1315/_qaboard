/* T017 — design.md 19.3절 / 12절.
   라벨을 생략할 수 없고, 도움말·오류·글자 수를 한 곳에서 묶어 접근성 연결을 보장한다. */
import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

type Common = {
  label: string;
  help: string;
  error?: string | null;
  count: { now: number; max: number };
};

export function InputField({
  label,
  help,
  error,
  count,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${styles.control} ${styles.input} ${error ? styles.bad : ''}`}
        aria-describedby={descId}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      <div className={styles.meta}>
        <span id={descId} className={error ? styles.metaError : undefined}>
          {error ?? help}
        </span>
        <span className={styles.count}>
          {count.now} / {count.max}
        </span>
      </div>
    </div>
  );
}

export function TextareaField({
  label,
  help,
  error,
  count,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${styles.control} ${styles.textarea} ${error ? styles.bad : ''}`}
        aria-describedby={descId}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      <div className={styles.meta}>
        <span id={descId} className={error ? styles.metaError : undefined}>
          {error ?? help}
        </span>
        <span className={styles.count}>
          {count.now} / {count.max}
        </span>
      </div>
    </div>
  );
}
