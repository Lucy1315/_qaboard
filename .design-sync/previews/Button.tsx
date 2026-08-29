import { Button } from 'qanow';

/** 밝은 표면의 세 종류. 한 화면에 Primary 는 하나만 둔다. */
export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="primary">질문 작성하기</Button>
    <Button variant="secondary">취소</Button>
    <Button variant="destructive">삭제하기</Button>
  </div>
);

/** 어두운 표면(Hero·헤더) 위에서 쓰는 조합. 포커스 링은 --focus-dark 로 바뀐다. */
export const OnDarkSurface = () => (
  <div
    className="surfaceDark"
    style={{ display: 'flex', gap: 12, padding: 20, borderRadius: 12, background: 'var(--ink900)' }}
  >
    <Button variant="primary">질문 작성하기</Button>
    <Button variant="darkSecondary">내 질문 확인하기</Button>
  </div>
);

/** 저장 중에는 비활성과 라벨 교체가 함께 일어나 중복 제출을 막는다. */
export const LoadingAndDisabled = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="primary" loading>
      등록하기
    </Button>
    <Button variant="primary" disabled>
      등록하기
    </Button>
    <Button variant="secondary" size="sm">
      다시 시도
    </Button>
  </div>
);

/** 모바일은 48px 로 커지고 전폭이 된다. */
export const BlockOnMobile = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 350 }}>
    <Button variant="primary" block>
      질문 작성하기
    </Button>
    <Button variant="secondary" block>
      내 질문 확인하기
    </Button>
  </div>
);
