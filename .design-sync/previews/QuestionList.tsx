import { QuestionList } from 'qanow';

const noop = () => {};

const memberItems = [
  {
    id: 'q1',
    title: '결제 내역은 어디에서 확인하나요?',
    createdAt: '2026-08-29T14:02:00+09:00',
    status: 'wait' as const,
  },
  {
    id: 'q3',
    title: '작성한 질문을 다시 고칠 수 있나요?',
    createdAt: '2026-08-27T18:15:00+09:00',
    status: 'done' as const,
  },
];

const adminItems = [
  { ...memberItems[0], authorEmail: 'member@qanow.kr' },
  {
    id: 'q2',
    title: '비밀번호를 바꾸면 다른 기기의 로그인이 함께 풀리나요?',
    createdAt: '2026-08-28T09:41:00+09:00',
    status: 'wait' as const,
    authorEmail: 'guest@qanow.kr',
  },
  { ...memberItems[1], authorEmail: 'member@qanow.kr' },
];

/** 회원 — 제목·작성일·상태. 답변 대기 행에 좌측 강조선이 붙는다. */
export const MemberList = () => (
  <QuestionList items={memberItems} isAdmin={false} onOpen={noop} />
);

/** 관리자 — 작성자 열이 하나 늘어난다. */
export const AdminList = () => <QuestionList items={adminItems} isAdmin onOpen={noop} />;

/** 답변 대기만 좁혀 본 상태. 관리자가 처음 들어오면 이 화면을 본다. */
export const AdminWaitingOnly = () => (
  <QuestionList items={adminItems.filter((i) => i.status === 'wait')} isAdmin onOpen={noop} />
);
