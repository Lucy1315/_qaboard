/* T014 — design.md 7절. 항목 3개 고정, 접이식(햄버거) 메뉴를 만들지 않는다.
   세 화면이 이 헤더 하나를 공유한다 (FR-039). */
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import styles from './Header.module.css';

const ROLE_LABEL = { anon: '비회원', member: '회원', admin: '관리자' } as const;

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { viewer, isAdmin } = useAuth();
  const onHome = pathname === '/';
  const onList = pathname.startsWith('/questions');

  const keep = (to: string) => () => navigate({ pathname: to, search: window.location.search });

  return (
    <header className={`${styles.hd} surfaceDark`}>
      <div className={styles.left}>
        <button type="button" className={styles.logo} onClick={keep('/')}>
          QANOW
        </button>
        <nav className={styles.nav} aria-label="주요 메뉴">
          <button
            type="button"
            className={`${styles.link} ${onHome ? styles.current : ''}`}
            onClick={keep('/')}
            aria-current={onHome ? 'page' : undefined}
          >
            서비스 소개
          </button>
          <button
            type="button"
            className={`${styles.link} ${onList ? styles.current : ''}`}
            onClick={keep('/questions')}
            aria-current={onList ? 'page' : undefined}
          >
            {isAdmin ? '문의 관리' : '내 질문'}
          </button>
        </nav>
      </div>
      <div className={styles.right}>
        <span className={styles.role}>{ROLE_LABEL[viewer.role]}</span>
      </div>
    </header>
  );
}
