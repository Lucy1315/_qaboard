import { StatusTabs } from 'qanow';

const noop = () => {};

/** 회원 기본 — 전체가 선택되어 있다. */
export const MemberDefault = () => (
  <StatusTabs value="all" counts={{ all: 2, wait: 1, done: 1 }} enabled onChange={noop} />
);

/** 관리자 기본 — 답변 대기로 들어온다. 대기 질문을 먼저 보게 하기 위함이다. */
export const AdminDefault = () => (
  <StatusTabs value="wait" counts={{ all: 4, wait: 2, done: 2 }} enabled onChange={noop} />
);

/** 로딩·빈 목록·오류에서는 건수를 감추고 탭을 비활성화한다. */
export const DisabledWhileNotReady = () => (
  <StatusTabs value="all" counts={null} enabled={false} onChange={noop} />
);

/** 건수가 0인 구분은 비활성화한다 — 결과 없는 목록 화면을 만들지 않는다. */
export const ZeroCountDisabled = () => (
  <StatusTabs value="all" counts={{ all: 2, wait: 0, done: 2 }} enabled onChange={noop} />
);
