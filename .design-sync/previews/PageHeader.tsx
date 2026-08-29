import { Button, PageHeader } from 'qanow';

/** 회원 — 우측에 새 질문 작성 버튼이 붙는다. */
export const MemberWithAction = () => (
  <PageHeader
    title="내 질문"
    desc="내가 남긴 질문과 답변 상태를 확인할 수 있습니다."
    action={<Button variant="primary">새 질문 작성</Button>}
  />
);

/** 관리자 — 질문을 작성하지 않으므로 행동 버튼이 없다. */
export const AdminNoAction = () => (
  <PageHeader title="문의 관리" desc="답변이 필요한 질문을 먼저 확인해 주세요." />
);

/** 폼 화면 — 제목과 설명만 세로로 쌓는다. */
export const StackedForForm = () => (
  <PageHeader title="질문 작성" desc="제목과 내용을 남기면 관리자가 확인합니다." stacked />
);
