import { Button, StateBox } from 'qanow';

/** 회원의 빈 목록 — 첫 질문으로 유도한다. */
export const EmptyForMember = () => (
  <StateBox variant="emptyMember" actions={<Button variant="primary">질문 작성하기</Button>} />
);

/** 관리자의 빈 목록 — 관리자는 질문을 작성하지 않으므로 행동 버튼이 없다. */
export const EmptyForAdmin = () => <StateBox variant="emptyAdmin" />;

/** 오류 — 내부 예외를 노출하지 않고 다시 시도만 제공한다. */
export const ErrorWithRetry = () => (
  <StateBox variant="errorList" actions={<Button variant="secondary">다시 시도</Button>} />
);

/** 권한 없음 — 질문의 존재 여부를 알려주지 않는다. */
export const Unauthorized = () => (
  <StateBox variant="unauthorized" actions={<Button variant="secondary">목록으로 이동</Button>} />
);

/** 로그인 필요 — 화면에 다른 제목이 없으므로 h1 으로 올린다. */
export const LoginRequired = () => <StateBox variant="loginRequired" as="h1" />;
