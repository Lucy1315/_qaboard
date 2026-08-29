/* T016 — design.md 19.2절. variant 5종 외에 추가하지 않는다.
   loading 이 disabled 와 라벨 교체를 함께 처리해 중복 제출을 막는다 (FR-031). */
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

/* design.md 19.2절. darkPrimary 는 primary 와 CSS 가 완전히 같아 통합했다.
   어두운 표면에서도 Primary 는 파란 채움 하나로 충분하다. */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'darkSecondary';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  size?: 'md' | 'sm';
  block?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  variant,
  size = 'md',
  block = false,
  loading = false,
  loadingLabel = '저장 중입니다...',
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: Props) {
  const cls = [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    block ? styles.block : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading ? loadingLabel : children}
    </button>
  );
}
