import { Header } from 'qanow';

const noop = () => {};

/** 비회원 — 두 번째 링크는 '내 질문'이다. */
export const Guest = () => <Header role="anon" current="home" onHome={noop} onList={noop} />;

/** 회원 — 목록 화면에 있을 때 현재 위치가 굵게 표시된다. */
export const Member = () => <Header role="member" current="list" onHome={noop} onList={noop} />;

/** 관리자 — 두 번째 링크가 '문의 관리'로 바뀐다. */
export const Admin = () => <Header role="admin" current="list" onHome={noop} onList={noop} />;
