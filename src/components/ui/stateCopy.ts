/* T019 — design.md 14절 문구 표를 그대로 옮긴다. 화면마다 다시 쓰지 않는다 (FR-039). */
export const STATE_COPY = {
  loading: { label: '불러오는 중입니다.' },
  emptyMember: {
    badge: '빈 목록',
    title: '아직 남긴 질문이 없습니다.',
    desc: '첫 질문을 남겨보세요.',
    action: '질문 작성하기',
  },
  emptyAdmin: {
    badge: '빈 목록',
    title: '등록된 질문이 없습니다.',
    desc: '새 문의가 들어오면 이 목록에 표시됩니다.',
  },
  errorList: {
    badge: '오류',
    title: '목록을 불러오지 못했습니다.',
    desc: '잠시 후 다시 시도해 주세요.',
    action: '다시 시도',
  },
  errorDetail: {
    badge: '오류',
    title: '내용을 불러오지 못했습니다.',
    desc: '잠시 후 다시 시도해 주세요.',
    action: '다시 시도',
  },
  unauthorized: {
    badge: '권한 없음',
    title: '이 질문에 접근할 권한이 없습니다.',
    desc: '내가 작성한 질문만 열어볼 수 있습니다.',
    action: '목록으로 이동',
  },
  loginRequired: {
    badge: '로그인 필요',
    title: '로그인이 필요한 화면입니다.',
    desc: '로그인하면 내가 남긴 질문과 답변을 확인할 수 있습니다.',
  },
  saving: { label: '저장 중입니다...' },
} as const;
