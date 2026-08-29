import { AuroraBackdrop } from 'qanow';

/** 세 겹(Aurora · Grid · Scrim)을 캡슐화한다. 부모가 relative + 높이를 가져야 보인다.
 *  Scrim 은 장식이 아니라 헤드라인 대비 17.74:1 을 보장하는 장치다 — 제거하지 않는다. */
export const ThreeLayers = () => (
  <div
    className="surfaceDark"
    style={{ position: 'relative', height: 320, overflow: 'hidden', background: 'var(--ink900)' }}
  >
    <AuroraBackdrop />
    <div style={{ position: 'relative', zIndex: 3, padding: 40 }}>
      <p style={{ margin: 0, font: '700 40px/1.24 var(--sans)', color: 'var(--on-dark)', letterSpacing: '-0.02em' }}>
        질문은 빠르게,
        <br />
        답변은 명확하게.
      </p>
      <p style={{ margin: '16px 0 0', font: '400 16px/1.75 var(--sans)', color: 'var(--on-dark-2)' }}>
        Scrim 이 있어 이 문구가 배경 위에서도 읽힌다.
      </p>
    </div>
  </div>
);
