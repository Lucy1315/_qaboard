import { Hero } from 'qanow';

const noop = () => {};

/** 로그인 상태 — 비공개 안내 문구가 나온다. */
export const Default = () => <Hero isAnon={false} onWrite={noop} onMyQuestions={noop} />;

/** 비회원 — 질문 작성이 로그인 후 가능하다는 안내로 바뀐다. */
export const ForGuest = () => <Hero isAnon onWrite={noop} onMyQuestions={noop} />;
