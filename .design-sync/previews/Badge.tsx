import { Badge } from 'qanow';

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/** 밝은 표면의 다섯 가지. 배지는 색과 함께 항상 텍스트를 갖는다. */
export const OnLightSurface = () => (
  <Row>
    <Badge tone="wait">답변 대기</Badge>
    <Badge tone="done">답변 완료</Badge>
    <Badge tone="error">오류</Badge>
    <Badge tone="neutral">권한 없음</Badge>
    <Badge tone="saving">저장 중</Badge>
  </Row>
);

/** 어두운 표면(Hero 카드) 전용 두 가지. */
export const OnDarkSurface = () => (
  <div style={{ display: 'flex', gap: 8, padding: 20, borderRadius: 12, background: 'var(--ink900)' }}>
    <Badge tone="darkWait">답변 대기</Badge>
    <Badge tone="darkDone">답변 완료</Badge>
  </div>
);

/** 회색조로 바꿔도 글자로 구분된다 — 색만으로 상태를 전달하지 않는다. */
export const GrayscaleProof = () => (
  <div style={{ filter: 'grayscale(1)' }}>
    <Row>
      <Badge tone="wait">답변 대기</Badge>
      <Badge tone="done">답변 완료</Badge>
      <Badge tone="error">오류</Badge>
      <Badge tone="neutral">권한 없음</Badge>
      <Badge tone="saving">저장 중</Badge>
    </Row>
  </div>
);
