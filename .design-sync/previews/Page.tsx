import { Page, PageHeader } from 'qanow';

/** 기본 — 최대 960px 컨테이너. */
export const Default = () => (
  <Page>
    <PageHeader title="내 질문" desc="내가 남긴 질문과 답변 상태를 확인할 수 있습니다." />
  </Page>
);

/** 읽기 폭 — 질문·답변 본문은 720px 로 제한해 한 줄 길이를 통제한다. */
export const ProseWidth = () => (
  <Page prose>
    <PageHeader title="질문 작성" desc="제목과 내용을 남기면 관리자가 확인합니다." stacked />
  </Page>
);
