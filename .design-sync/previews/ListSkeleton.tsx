import { ListSkeleton, LoadingNote } from 'qanow';

/** 행 높이를 실제 목록 행과 같은 58px 로 고정해 콘텐츠 도착 시 화면이 튀지 않는다. */
export const Default = () => (
  <div>
    <ListSkeleton />
    <LoadingNote />
  </div>
);

/** 행 수는 조절할 수 있다. */
export const TwoRows = () => <ListSkeleton rows={2} />;
