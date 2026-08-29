/* T027 — Mock 데이터. 단위·컴포넌트 테스트와 공용이다.
   실계정 시드에는 @example.com 을 쓰지 않는다(호스티드 Auth 가 거부). */
export type MockQuestion = {
  id: string;
  authorEmail: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  answer: { body: string; createdAt: string; updatedAt: string } | null;
};

export const MOCK_ME = 'jisu@example.com';

export const mockQuestions: MockQuestion[] = [
  {
    id: 'q1',
    authorEmail: MOCK_ME,
    title: '결제 내역은 어디에서 확인하나요?',
    body: '안녕하세요. 지난달 결제한 내역을 다시 확인하고 싶은데 어느 화면에서 볼 수 있는지 찾지 못했습니다.\n\n마이페이지를 둘러보았지만 결제 항목이 보이지 않았고, 모바일과 데스크톱 둘 다 확인해 보았습니다. 혹시 별도의 경로가 있다면 알려주시면 감사하겠습니다.',
    createdAt: '2026-08-29T14:02:00+09:00',
    updatedAt: '2026-08-29T14:02:00+09:00',
    answer: null,
  },
  {
    id: 'q2',
    authorEmail: 'minho@example.com',
    title: '비밀번호를 바꾸면 로그인이 풀리나요?',
    body: '비밀번호를 변경한 뒤에도 다른 기기의 로그인이 유지되는지 궁금합니다.',
    createdAt: '2026-08-28T09:41:00+09:00',
    updatedAt: '2026-08-28T09:41:00+09:00',
    answer: null,
  },
  {
    id: 'q3',
    authorEmail: MOCK_ME,
    title: '작성한 질문을 다시 고칠 수 있나요?',
    body: '질문을 올린 뒤 내용을 조금 다듬고 싶습니다. 수정이 가능한지 알려주세요.',
    createdAt: '2026-08-27T18:15:00+09:00',
    updatedAt: '2026-08-27T18:15:00+09:00',
    answer: {
      body: '문의 감사합니다. 답변이 등록되기 전까지는 내 질문 화면에서 수정하실 수 있습니다.\n\n답변이 달린 뒤에는 수정과 삭제가 제한되니 이 점 참고해 주세요.',
      createdAt: '2026-08-27T20:02:00+09:00',
      updatedAt: '2026-08-27T20:02:00+09:00',
    },
  },
  {
    id: 'q4',
    authorEmail: 'sora@example.com',
    title: '답변은 보통 얼마나 걸리나요?',
    body: '문의를 남기면 답변까지 보통 얼마나 걸리는지 궁금합니다.',
    createdAt: '2026-08-26T11:30:00+09:00',
    updatedAt: '2026-08-26T11:30:00+09:00',
    answer: {
      body: '영업일 기준 1~2일 안에 답변드리고 있습니다. 문의가 몰리는 시기에는 조금 더 걸릴 수 있습니다.',
      createdAt: '2026-08-26T15:10:00+09:00',
      updatedAt: '2026-08-26T15:10:00+09:00',
    },
  },
];
