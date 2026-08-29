/* T010 — design.md 17절 대비를 tokens.css 에서 계산한다.
   과거 사례: 보조 텍스트가 4.45:1(기준 4.5:1)이었는데 육안·시안 대조·시각 회귀 24장을
   전부 통과하고 자동 검사에서만 걸렸다. 대비는 계산해야 안다. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve('src/styles/tokens.css'), 'utf8');

function token(name: string): string {
  const m = css.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`토큰을 찾을 수 없다: --${name}`);
  return m[1];
}

const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => lin(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

type Check = { label: string; fg: string; bg: string; min: number };
const checks: Check[] = [
  { label: '다크 헤드라인', fg: 'on-dark', bg: 'ink900', min: 4.5 },
  { label: '다크 본문', fg: 'on-dark-2', bg: 'ink900', min: 4.5 },
  { label: '다크 캡션', fg: 'on-dark-3', bg: 'ink900', min: 4.5 },
  { label: '다크 카드 본문', fg: 'on-dark-2', bg: 'ink700', min: 4.5 },
  { label: '라이트 본문', fg: 'fg', bg: 'canvas', min: 4.5 },
  { label: '라이트 보조', fg: 'fg2', bg: 'canvas', min: 4.5 },
  { label: '라이트 보조(흰 배경)', fg: 'fg2', bg: 'sur', min: 4.5 },
  { label: '링크', fg: 'pri', bg: 'sur', min: 4.5 },
  { label: '입력 테두리', fg: 'input-border', bg: 'sur', min: 3 },
  { label: '밝은 포커스 링', fg: 'focus', bg: 'sur', min: 3 },
  { label: '어두운 포커스 링', fg: 'focus-dark', bg: 'ink900', min: 3 },
  { label: '배지 답변 대기', fg: 'bdg-wait-fg', bg: 'bdg-wait-bg', min: 4.5 },
  { label: '배지 답변 완료', fg: 'bdg-done-fg', bg: 'bdg-done-bg', min: 4.5 },
  { label: '배지 오류', fg: 'bdg-err-fg', bg: 'bdg-err-bg', min: 4.5 },
  { label: '배지 권한 없음', fg: 'bdg-neutral-fg', bg: 'bdg-neutral-bg', min: 4.5 },
  { label: '배지 저장 중', fg: 'bdg-save-fg', bg: 'bdg-save-bg', min: 4.5 },
  { label: '배지 대기(다크)', fg: 'bdg-dwait-fg', bg: 'bdg-dwait-bg', min: 4.5 },
  { label: '배지 완료(다크)', fg: 'bdg-ddone-fg', bg: 'bdg-ddone-bg', min: 4.5 },
];

let failed = 0;
console.log('조합                        전경      배경      대비    기준  판정');
for (const c of checks) {
  const fg = token(c.fg);
  const bg = token(c.bg);
  const r = ratio(fg, bg);
  const ok = r >= c.min;
  if (!ok) failed++;
  console.log(
    `${c.label.padEnd(24)} ${fg}  ${bg}  ${r.toFixed(2).padStart(6)}  ${String(c.min).padStart(4)}  ${ok ? 'PASS' : 'FAIL'}`,
  );
}
console.log(`\n${checks.length - failed}/${checks.length} 통과`);
if (failed > 0) {
  console.error(`${failed}개 조합이 기준에 미달한다.`);
  process.exit(1);
}
