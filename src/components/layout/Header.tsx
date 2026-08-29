/* T014·T036 — design.md 7절. 항목 3개 고정, 접이식 메뉴를 두지 않는다.
   라우터·인증 컨텍스트에 의존하지 않으므로 단독으로 렌더할 수 있다(디자인 시스템 동기화 대상). */
import styles from './Header.module.css';

export type HeaderRole = 'anon' | 'member' | 'admin';

const ROLE_LABEL: Record<HeaderRole, string> = {
  anon: '비회원',
  member: '회원',
  admin: '관리자',
};

export function Header({
  role,
  current,
  onHome,
  onList,
}: {
  role: HeaderRole;
  current: 'home' | 'list' | null;
  onHome: () => void;
  onList: () => void;
}) {
  const onHomePage = current === 'home';
  const onListPage = current === 'list';

  return (
    <header className={`${styles.hd} surfaceDark`}>
      <div className={styles.left}>
        <button type="button" className={styles.logo} onClick={onHome}>
          QANOW
        </button>
        <nav className={styles.nav} aria-label="주요 메뉴">
          <button
            type="button"
            className={`${styles.link} ${onHomePage ? styles.current : ''}`}
            onClick={onHome}
            aria-current={onHomePage ? 'page' : undefined}
          >
            서비스 소개
          </button>
          <button
            type="button"
            className={`${styles.link} ${onListPage ? styles.current : ''}`}
            onClick={onList}
            aria-current={onListPage ? 'page' : undefined}
          >
            {role === 'admin' ? '문의 관리' : '내 질문'}
          </button>
        </nav>
      </div>
      <div className={styles.right}>
        <span className={styles.role}>{ROLE_LABEL[role]}</span>
      </div>
    </header>
  );
}
