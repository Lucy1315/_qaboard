import { DetailSkeleton, LoadingNote } from 'qanow';

/** 질문 상세를 불러오는 동안 제목 한 줄과 본문 세 줄 자리를 잡아 둔다. */
export const Default = () => (
  <div style={{ maxWidth: 720 }}>
    <DetailSkeleton />
    <LoadingNote />
  </div>
);
