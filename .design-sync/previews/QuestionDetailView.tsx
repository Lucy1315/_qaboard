import { QuestionDetailView } from 'qanow';

const BODY = `안녕하세요. 지난달 결제한 내역을 다시 확인하고 싶은데 어느 화면에서 볼 수 있는지 찾지 못했습니다.

마이페이지를 둘러보았지만 결제 항목이 보이지 않았고, 모바일과 데스크톱 둘 다 확인해 보았습니다. 혹시 별도의 경로가 있다면 알려주시면 감사하겠습니다.`;

const ANSWER = `문의 감사합니다. 결제 내역은 상단 메뉴의 '내 질문'이 아니라 계정 화면에서 확인하실 수 있습니다.

데스크톱은 우측 상단, 모바일은 하단 탭에서 같은 화면으로 이동합니다. 불편을 드려 죄송합니다.`;

const waiting = {
  id: 'q1',
  title: '결제 내역은 어디에서 확인하나요?',
  body: BODY,
  createdAt: '2026-08-29T14:02:00+09:00',
  updatedAt: '2026-08-29T14:02:00+09:00',
  status: 'wait' as const,
  answer: null,
};

const answered = {
  ...waiting,
  status: 'done' as const,
  answer: {
    body: ANSWER,
    createdAt: '2026-08-29T15:20:00+09:00',
    updatedAt: '2026-08-29T15:20:00+09:00',
  },
};

const noop = () => {};

/** 회원 · 답변 전 — 수정과 삭제를 할 수 있다. */
export const MemberBeforeAnswer = () => (
  <QuestionDetailView q={waiting} isMember isAdmin={false} onEdit={noop} onDelete={noop} onAnswer={noop} />
);

/** 회원 · 답변 후 — 수정·삭제 버튼이 존재하지 않고 안내 문구만 남는다. */
export const MemberAfterAnswer = () => (
  <QuestionDetailView q={answered} isMember isAdmin={false} onEdit={noop} onDelete={noop} onAnswer={noop} />
);

/** 관리자 · 답변 전 — 답변 작성 버튼이 붙고 작성자 이메일이 함께 보인다. */
export const AdminBeforeAnswer = () => (
  <QuestionDetailView
    q={{ ...waiting, authorEmail: 'member@qanow.kr' }}
    isMember={false}
    isAdmin
    onEdit={noop}
    onDelete={noop}
    onAnswer={noop}
  />
);

/** 관리자 · 답변 후 — 답변 수정으로 라벨이 바뀐다. */
export const AdminAfterAnswer = () => (
  <QuestionDetailView
    q={{ ...answered, authorEmail: 'member@qanow.kr' }}
    isMember={false}
    isAdmin
    onEdit={noop}
    onDelete={noop}
    onAnswer={noop}
  />
);
