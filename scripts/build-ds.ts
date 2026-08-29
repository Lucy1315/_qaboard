/* T037 — 디자인 시스템 미리보기 카드 번들 생성.
   각 카드는 실제 tokens.css / base.css / motion.css 와 해당 컴포넌트의 .module.css 를
   그대로 인라인한다. CSS Modules 원본의 클래스명이 평문이므로 마크업이 1:1로 대응한다.
   Mock 데이터의 구체적인 내용을 쓰지 않고 design.md 의 확정 예시 문구만 쓴다. */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve('.');
const OUT = join(ROOT, 'ds-bundle');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const GLOBAL_CSS = [
  read('src/styles/tokens.css'),
  read('src/styles/base.css'),
  read('src/styles/motion.css'),
].join('\n');

/** 모든 컴포넌트 모듈 CSS 를 모아 인라인한다(카드마다 CSS 를 고르지 않는다). */
function collectModuleCss(): string {
  const dirs = ['ui', 'layout', 'question', 'hero'];
  const out: string[] = [];
  for (const d of dirs) {
    const dir = join(ROOT, 'src/components', d);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.module.css'))) {
      out.push(`/* ---- ${d}/${f} ---- */\n${readFileSync(join(dir, f), 'utf8')}`);
    }
  }
  return out.join('\n');
}
const MODULE_CSS = collectModuleCss();

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">';

const SHELL_CSS = `
  body{margin:0;padding:24px;background:var(--canvas);font-family:var(--sans)}
  .dsStack{display:flex;flex-direction:column;gap:28px}
  .dsRow{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  .dsLabel{font:600 11px/1 var(--mono);letter-spacing:.1em;color:var(--fg2);text-transform:uppercase}
  .dsPanel{padding:20px;border:1px solid var(--divider);border-radius:var(--r-card);background:var(--sur)}
  .dsDark{padding:20px;border-radius:var(--r-card);background:var(--ink900)}
  .dsGray{filter:grayscale(1)}
  .dsFrame{width:390px;border:1px solid var(--divider);border-radius:26px;overflow:hidden;background:var(--canvas)}
  table.dsT{width:100%;border-collapse:collapse;font:400 12px/1.6 var(--sans)}
  table.dsT th{text-align:left;color:var(--fg2);font-weight:700;border-bottom:1px solid var(--divider);padding:0 0 6px}
  table.dsT td{padding:5px 0;border-bottom:1px solid var(--bdg-neutral-bg);color:var(--fg)}
  .sw{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid rgb(0 0 0 / 12%);vertical-align:-2px;margin-right:8px}
`;

function card(name: string, group: string, subtitle: string, body: string, width = 1180) {
  const html = `<!-- @dsCard group="${group}" -->
<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>QANOW — ${name}</title>
<!-- ${subtitle} -->
${FONTS}
<style>${GLOBAL_CSS}\n${MODULE_CSS}\n${SHELL_CSS}</style>
</head><body><div class="dsStack" style="max-width:${width}px">${body}</div></body></html>
`;
  writeFileSync(join(OUT, `${name}.html`), html, 'utf8');
  return { name, group, subtitle };
}

/* ---------- 조각 헬퍼 (실제 컴포넌트 마크업과 동일한 클래스명) ---------- */
const badge = (tone: string, text: string) =>
  `<span class="badge ${tone}"><i class="dot"></i>${text}</span>`;
const btn = (v: string, t: string, extra = '') =>
  `<button class="btn ${v}" ${extra}>${t}</button>`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const cards: { name: string; group: string; subtitle: string }[] = [];

/* ===== Foundations ===== */
const colorRows = [
  ['ink900', 'Hero·헤더·푸터 바탕'], ['ink700', 'Hero 플로팅 카드'],
  ['on-dark', '다크 헤드라인'], ['on-dark-2', '다크 본문'], ['on-dark-3', '다크 캡션'],
  ['canvas', '페이지 바탕'], ['sur', '카드·목록·입력'], ['fg', '본문·제목'], ['fg2', '보조 텍스트'],
  ['divider', '구분선(장식)'], ['input-border', '입력창 테두리'],
  ['pri', '주요 버튼·링크'], ['pri2', 'hover'], ['vio', 'Aurora 장식'],
  ['focus', '밝은 표면 포커스'], ['focus-dark', '어두운 표면 포커스'],
  ['err', '오류'], ['wait-edge', '답변 대기 강조선'],
];
const spacing = [4,6,8,10,12,14,16,17,18,20,22,24,26,28,30,32,34,36,38,40,44,48,56,64,72,76,84,88,96];
cards.push(card('Tokens', 'Foundations', '색 역할 18종 · 간격 29종 · 타이포 계층', `
  <div><div class="dsLabel">색 역할</div><div class="dsPanel"><table class="dsT">
    <tr><th>토큰</th><th>역할</th></tr>
    ${colorRows.map(([t, r]) => `<tr><td><span class="sw" style="background:var(--${t})"></span><code>--${t}</code></td><td>${r}</td></tr>`).join('')}
  </table></div></div>
  <div><div class="dsLabel">간격 — design.md 18절 값 전부</div><div class="dsPanel"><div class="dsRow" style="align-items:flex-end">
    ${spacing.map((n) => `<div style="text-align:center"><div style="width:var(--sp-${n});height:var(--sp-${n});background:var(--pri);border-radius:2px"></div><div style="font:400 10px var(--mono);color:var(--fg2);margin-top:6px">${n}</div></div>`).join('')}
  </div></div></div>
  <div><div class="dsLabel">타이포 계층</div><div class="dsPanel">
    <p style="font:700 56px/1.24 var(--sans);letter-spacing:-.02em;margin:0 0 12px">Hero 제목 56 · 질문은 빠르게,</p>
    <p style="font:700 30px/1.35 var(--sans);margin:0 0 12px">페이지 제목 30 · 내 질문</p>
    <p style="font:700 28px/1.45 var(--sans);margin:0 0 12px">상세 제목 28 · 결제 내역은 어디에서 확인하나요?</p>
    <p style="font:400 16px/1.9 var(--sans);margin:0 0 12px;max-width:var(--w-prose)">본문 16/1.9 · 질문과 답변 본문에 쓰는 크기이다. 한 줄 길이를 720px 로 제한해 긴 한국어 문장도 읽기 쉽게 한다.</p>
    <p style="font:400 14.5px/1.7 var(--sans);color:var(--fg2);margin:0 0 12px">설명 14.5 · 내가 남긴 질문과 답변 상태를 확인할 수 있습니다.</p>
    <p style="font:400 12.5px/1.5 var(--sans);color:var(--fg2);margin:0">도움말 12.5 · 100자 이내로 입력해 주세요.</p>
  </div></div>`));

/* ===== Actions ===== */
cards.push(card('Button', 'Actions', 'variant 4종 × 기본·hover·focus·disabled·loading', `
  <div><div class="dsLabel">밝은 표면</div><div class="dsPanel dsRow">
    ${btn('primary', '질문 작성하기')}${btn('secondary', '취소')}${btn('destructive', '삭제하기')}
    ${btn('primary', '질문 작성하기', 'style="outline:2px solid var(--focus);outline-offset:2px"')}
    ${btn('primary', '저장 중입니다...', 'disabled')}
  </div></div>
  <div><div class="dsLabel">어두운 표면 · 포커스는 --focus-dark (7.12:1)</div><div class="dsDark surfaceDark dsRow">
    ${btn('primary', '질문 작성하기')}${btn('darkSecondary', '내 질문 확인하기')}
    ${btn('darkSecondary', '내 질문 확인하기', 'style="outline:2px solid var(--focus-dark);outline-offset:2px"')}
  </div></div>
  <div><div class="dsLabel">작은 크기 (sm) · 모바일은 48px 로 커진다</div><div class="dsPanel dsRow">
    ${btn('primary sm', '다시 시도')}${btn('secondary sm', '목록으로 이동')}
  </div></div>`));

/* ===== Forms ===== */
const field = (label: string, help: string, count: string, inner: string, bad = false) => `
  <div class="field">
    <label class="label">${label}</label>
    ${inner}
    <div class="meta"><span class="${bad ? 'metaError' : ''}">${help}</span><span class="count">${count}</span></div>
  </div>`;
cards.push(card('Fields', 'Forms', 'Input · Textarea · 도움말/글자수/오류. 라벨을 생략할 수 없다', `
  <div class="dsPanel" style="max-width:720px">
    ${field('제목', '100자 이내로 입력해 주세요.', '0 / 100', '<input class="control input" placeholder="질문 제목을 입력하세요">')}
    ${field('제목', '제목을 입력해 주세요.', '0 / 100', '<input class="control input bad" value="">', true)}
    ${field('내용', '5000자 이내로 입력해 주세요.', '0 / 5000', '<textarea class="control textarea" placeholder="문의하실 내용을 자세히 적어 주세요"></textarea>')}
    <div class="formActions">${btn('secondary', '취소')}${btn('primary', '등록하기')}</div>
  </div>
  <div><div class="dsLabel">저장 중 — 버튼 비활성 + 라벨 교체 + 배지</div>
  <div class="dsPanel dsRow">${btn('secondary', '취소')}${btn('primary', '저장 중입니다...', 'disabled')}${badge('saving', '저장 중입니다...')}</div></div>`));

/* ===== Status ===== */
cards.push(card('Badge', 'Status', '7종 · 텍스트 없는 배지를 만들 수 없다 (FR-030)', `
  <div><div class="dsLabel">밝은 표면</div><div class="dsPanel dsRow">
    ${badge('wait', '답변 대기')}${badge('done', '답변 완료')}${badge('error', '오류')}${badge('neutral', '권한 없음')}${badge('saving', '저장 중')}
  </div></div>
  <div><div class="dsLabel">어두운 표면</div><div class="dsDark dsRow">${badge('darkWait', '답변 대기')}${badge('darkDone', '답변 완료')}</div></div>
  <div><div class="dsLabel">회색조 변환 — 색을 빼도 글자로 구분된다 (원칙 IX)</div>
  <div class="dsPanel dsRow dsGray">${badge('wait', '답변 대기')}${badge('done', '답변 완료')}${badge('error', '오류')}${badge('neutral', '권한 없음')}${badge('saving', '저장 중')}</div></div>`));

const stateBox = (tone: string, badgeText: string, title: string, desc: string, actions = '', isErr = false) => `
  <div class="box ${isErr ? 'error' : ''}">${badge(tone, badgeText)}
    <h2 class="title">${title}</h2><p class="desc">${desc}</p>
    ${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
cards.push(card('StateBox', 'Status', 'Loading · Empty · Error · Unauthorized · LoginRequired', `
  <div><div class="dsLabel">빈 목록 — 회원 / 관리자</div>
    ${stateBox('neutral', '빈 목록', '아직 남긴 질문이 없습니다.', '첫 질문을 남겨보세요.', btn('primary', '질문 작성하기'))}
    ${stateBox('neutral', '빈 목록', '등록된 질문이 없습니다.', '새 문의가 들어오면 이 목록에 표시됩니다.')}</div>
  <div><div class="dsLabel">오류 · 권한 없음 · 로그인 필요</div>
    ${stateBox('error', '오류', '목록을 불러오지 못했습니다.', '잠시 후 다시 시도해 주세요.', btn('secondary', '다시 시도'), true)}
    ${stateBox('neutral', '권한 없음', '이 질문에 접근할 권한이 없습니다.', '내가 작성한 질문만 열어볼 수 있습니다.', btn('secondary', '목록으로 이동'))}
    ${stateBox('neutral', '로그인 필요', '로그인이 필요한 화면입니다.', '로그인하면 내가 남긴 질문과 답변을 확인할 수 있습니다.')}</div>`));

cards.push(card('Skeleton', 'Status', '행 높이 58px 고정 — 콘텐츠 도착 시 레이아웃이 튀지 않는다', `
  <div><div class="dsLabel">목록 스켈레톤 + 로딩 안내</div>
    <div class="wrap">${[0,1,2,3].map(() => `<div class="row"><div class="bar barGrow pulse"></div><div class="bar barMd pulse"></div><div class="bar barSm pulse"></div></div>`).join('')}</div>
    <p class="loading"><span class="spinner spin"></span>불러오는 중입니다.</p></div>
  <div><div class="dsLabel">상세 스켈레톤</div>
    <div class="block"><div class="bar barTitle pulse"></div><div class="bar barFull pulse"></div><div class="bar barFull pulse"></div><div class="bar barShort pulse"></div></div></div>`));

/* ===== Navigation ===== */
const header = (role: string, label: string, cur: 'home' | 'list') => `
  <header class="hd surfaceDark">
    <div class="left"><button class="logo">QANOW</button>
      <nav class="nav" aria-label="주요 메뉴">
        <button class="link ${cur === 'home' ? 'current' : ''}">서비스 소개</button>
        <button class="link ${cur === 'list' ? 'current' : ''}">${role === 'admin' ? '문의 관리' : '내 질문'}</button>
      </nav></div>
    <div class="right"><span class="role">${label}</span></div></header>`;
cards.push(card('Header', 'Navigation', '역할 3종 · 항목 3개 고정 · 접이식 메뉴 없음', `
  <div><div class="dsLabel">비회원 / 회원 / 관리자</div>
    ${header('anon', '비회원', 'home')}${header('member', '회원', 'list')}${header('admin', '관리자', 'list')}</div>
  <div><div class="dsLabel">모바일 390 — 햄버거 없이 그대로 노출</div>
    <div class="dsFrame m">${header('admin', '관리자', 'list')}</div></div>`));

const tab = (t: string, n: string, on = false, dis = false) =>
  `<button class="tab ${on ? 'on' : ''}" ${dis ? 'disabled' : ''}>${t}${n ? `<span class="count">${n}</span>` : ''}</button>`;
cards.push(card('PageHeader', 'Navigation', 'Page Header · 되돌아가기 · 상태 탭', `
  <div><div class="dsLabel">회원 / 관리자</div>
    <div class="dsPanel"><div class="title"><div><h1>내 질문</h1><p>내가 남긴 질문과 답변 상태를 확인할 수 있습니다.</p></div>${btn('primary', '새 질문 작성')}</div></div>
    <div class="dsPanel" style="margin-top:12px"><div class="title"><div><h1>문의 관리</h1><p>답변이 필요한 질문을 먼저 확인해 주세요.</p></div></div></div></div>
  <div><div class="dsLabel">되돌아가기 — 역할과 무관하게 문구 고정</div><div class="dsPanel"><button class="back">← 목록으로 돌아가기</button></div></div>
  <div><div class="dsLabel">상태 탭 (FR-041) — 기본 / 비활성(로딩·빈 목록·오류) / 0건 비활성</div><div class="dsPanel">
    <div class="tabs">${tab('전체', '4')}${tab('답변 대기', '2', true)}${tab('답변 완료', '2')}</div>
    <div class="tabs">${tab('전체', '', false, true)}${tab('답변 대기', '', false, true)}${tab('답변 완료', '', false, true)}</div>
    <div class="tabs">${tab('전체', '2', true)}${tab('답변 대기', '0', false, true)}${tab('답변 완료', '2')}</div>
  </div></div>`));

/* ===== Question ===== */
const row = (title: string, email: string | null, date: string, done: boolean) => `
  <button class="row ${email ? 'adm' : ''} ${done ? '' : 'wait'}">
    <span class="t">${title}</span>${email ? `<span class="e">${email}</span>` : ''}
    <span class="d">${date}</span>${badge(done ? 'done' : 'wait', done ? '답변 완료' : '답변 대기')}</button>`;
cards.push(card('QuestionRow', 'Question', '데스크톱 목록 행 · 대기 행 좌측 강조선 · 제목 2줄 말줄임', `
  <div><div class="dsLabel">회원 — 제목·작성일·상태</div><div class="listWrap">
    <div class="rowHead"><span>제목</span><span>작성일</span><span>상태</span></div>
    ${row('결제 내역은 어디에서 확인하나요?', null, '2026.08.29', false)}
    ${row('작성한 질문을 다시 고칠 수 있나요?', null, '2026.08.27', true)}</div></div>
  <div><div class="dsLabel">관리자 — 작성자 열 추가</div><div class="listWrap">
    <div class="rowHead adm"><span>제목</span><span>작성자</span><span>작성일</span><span>상태</span></div>
    ${row('결제 내역은 어디에서 확인하나요?', 'member@qanow.kr', '2026.08.29', false)}
    ${row('답변은 보통 얼마나 걸리나요?', 'guest@qanow.kr', '2026.08.26', true)}</div></div>`));

const mcard = (title: string, email: string | null, dt: string, done: boolean) => `
  <button class="card ${done ? '' : 'wait'}">${badge(done ? 'done' : 'wait', done ? '답변 완료' : '답변 대기')}
    <p class="cardTitle">${title}</p>
    ${email ? `<span class="cardMeta">작성자 ${email}</span>` : ''}<span class="cardMeta">${dt}</span></button>`;
cards.push(card('QuestionCard', 'Question', '모바일 카드 · 상태 배지를 제목보다 먼저 둔다 (SC-004)', `
  <div class="dsRow" style="align-items:flex-start">
    <div><div class="dsLabel">회원</div><div class="dsFrame m" style="padding:16px">
      ${mcard('결제 내역은 어디에서 확인하나요?', null, '2026.08.29 14:02', false)}
      ${mcard('작성한 질문을 다시 고칠 수 있나요?', null, '2026.08.27 18:15', true)}</div></div>
    <div><div class="dsLabel">관리자 — 작성자 표시</div><div class="dsFrame m" style="padding:16px">
      ${mcard('결제 내역은 어디에서 확인하나요?', 'member@qanow.kr', '2026.08.29 14:02', false)}
      ${mcard('답변은 보통 얼마나 걸리나요?', 'guest@qanow.kr', '2026.08.26 11:30', true)}</div></div>
  </div>`, 900));

const qBody = `안녕하세요. 지난달 결제한 내역을 다시 확인하고 싶은데 어느 화면에서 볼 수 있는지 찾지 못했습니다.

마이페이지를 둘러보았지만 결제 항목이 보이지 않았고, 모바일과 데스크톱 둘 다 확인해 보았습니다.`;
cards.push(card('QuestionDetail', 'Question', '질문·답변 블록 분리 · 답변 대기 안내 · 잠금 안내 · 삭제 확인', `
  <div class="dsPanel" style="max-width:760px">
    <div class="qhead">${badge('wait', '답변 대기')}<h1>결제 내역은 어디에서 확인하나요?</h1><p class="qmeta">작성 2026.08.29 14:02</p></div>
    <div class="block"><div class="blockLabel">질문</div><p class="body">${qBody}</p></div>
    <div class="block ans"><div class="blockLabel">관리자 답변</div>
      <div class="waitBox">아직 답변이 등록되지 않았습니다. 관리자가 확인 후 등록합니다.</div></div>
    <div class="acts">${btn('secondary', '수정하기')}${btn('destructive', '삭제하기')}</div>
  </div>
  <div><div class="dsLabel">답변 후 — 회원의 수정·삭제 버튼이 존재하지 않는다 (FR-012)</div>
  <div class="dsPanel" style="max-width:760px">
    <div class="block ans"><div class="blockLabel">관리자 답변</div>
      <p class="body">문의 감사합니다. 답변이 등록되기 전까지는 내 질문 화면에서 수정하실 수 있습니다.</p>
      <p class="qmeta answerMeta">답변 2026.08.29 15:20</p></div>
    <div class="lockMsg">답변이 등록된 질문은 수정하거나 삭제할 수 없습니다.</div></div></div>
  <div><div class="dsLabel">삭제 확인 — 인라인 블록. 열리면 포커스가 이동한다 (FR-011)</div>
  <div class="dsPanel" style="max-width:760px"><div class="confirm" tabindex="-1">
    <p><strong>이 질문을 삭제하시겠습니까?</strong>삭제한 질문은 되돌릴 수 없습니다.</p>
    <div class="confirmRow">${btn('secondary', '취소')}${btn('destructive', '삭제하기')}</div></div></div></div>`));

/* ===== Hero ===== */
const heroInner = `
  <section class="hero surfaceDark">
    <div class="aurora drift"></div><div class="grid"></div><div class="scrim"></div>
    <div class="inner">
      <div><span class="eyebrow">비공개 1:1 문의</span>
        <h1 class="h1">질문은 빠르게,<br>답변은 명확하게.</h1>
        <p class="lead">궁금한 점을 남기면 관리자가 확인하고 답변해드립니다.</p>
        <div class="cta">${btn('primary', '질문 작성하기')}${btn('darkSecondary', '내 질문 확인하기')}</div>
        <p class="note">QANOW의 질문은 작성자 본인과 관리자에게만 보입니다. 다른 사용자에게 공개되지 않습니다.</p></div>
      <div>
        <div class="qa floaty1"><div class="qaTop"><span class="qaRole">Q · 회원</span>${badge('darkWait', '답변 대기')}</div>
          <p class="qaTitle">결제 내역은 어디에서 확인하나요?</p>
          <p class="qaBody">지난달 결제 내역을 다시 보고 싶은데 화면을 찾지 못했습니다.</p>
          <p class="qaTime">2026.08.29 14:02</p></div>
        <div class="link"><span class="dot"></span><span class="linkLabel">관리자 확인</span></div>
        <div class="qa qaShift floaty2"><div class="qaTop"><span class="qaRole">A · 관리자</span>${badge('darkDone', '답변 완료')}</div>
          <p class="qaBody qaBodyStrong">내 질문 화면에서 해당 질문을 열면 결제 내역 확인 경로를 함께 안내해 두었습니다.</p>
          <p class="qaTime">2026.08.29 15:20</p></div>
      </div></div></section>
  <div class="fade"></div>`;
const flow = `
  <section class="section"><div class="sectionInner">
    <div class="kicker">이용 흐름</div><h2 class="h2">질문 작성 → 관리자 확인 → 답변 확인</h2>
    <div class="steps">
      <div class="step"><div class="stepNo">01</div><h3 class="stepTitle">질문 작성</h3><p class="stepDesc">제목과 내용을 남기면 접수됩니다.</p></div>
      <div class="step"><div class="stepNo">02</div><h3 class="stepTitle">관리자 확인</h3><p class="stepDesc">담당 관리자가 질문을 확인합니다.</p></div>
      <div class="step"><div class="stepNo">03</div><h3 class="stepTitle">답변 확인</h3><p class="stepDesc">답변이 등록되면 내 질문에서 바로 볼 수 있습니다.</p></div>
    </div></div></section>`;
const closing = `
  <section class="close"><div><h3>궁금한 점이 생겼다면 지금 남겨보세요.</h3><p>답변이 등록되면 내 질문 목록에서 상태가 바뀝니다.</p></div>${btn('primary', '질문 작성하기')}</section>
  <footer class="footer surfaceDark"><span class="wordmark">QANOW</span><span>회원 질문 · 관리자 답변 게시판</span></footer>`;
cards.push(card('Hero', 'Hero', 'Aurora · Grid · Scrim 3겹 + 질문→답변 플로팅 카드', heroInner, 1400));

/* ===== Pages ===== */
cards.push(card('HomePage', 'Pages', '메인 페이지 대표 구현 — 데스크톱', header('anon', '비회원', 'home') + heroInner + flow + closing, 1400));
cards.push(card('QuestionListPage', 'Pages', '질문 리스트 대표 구현 — 관리자 기본 필터 답변 대기', `
  ${header('admin', '관리자', 'list')}
  <main class="page"><div class="title"><div><h1>문의 관리</h1><p>답변이 필요한 질문을 먼저 확인해 주세요.</p></div></div>
    <div class="tabs">${tab('전체', '4')}${tab('답변 대기', '2', true)}${tab('답변 완료', '2')}</div>
    <div class="listWrap"><div class="rowHead adm"><span>제목</span><span>작성자</span><span>작성일</span><span>상태</span></div>
      ${row('결제 내역은 어디에서 확인하나요?', 'member@qanow.kr', '2026.08.29', false)}
      ${row('비밀번호를 바꾸면 로그인이 풀리나요?', 'guest@qanow.kr', '2026.08.28', false)}</div>
  </main>`, 1400));
cards.push(card('QuestionPage', 'Pages', '질문 페이지 대표 구현 — 상세와 작성', `
  ${header('member', '회원', 'list')}
  <main class="page"><div class="prose">
    <button class="back">← 목록으로 돌아가기</button>
    <div class="qhead">${badge('wait', '답변 대기')}<h1>결제 내역은 어디에서 확인하나요?</h1><p class="qmeta">작성 2026.08.29 14:02</p></div>
    <div class="block"><div class="blockLabel">질문</div><p class="body">${qBody}</p></div>
    <div class="block ans"><div class="blockLabel">관리자 답변</div><div class="waitBox">아직 답변이 등록되지 않았습니다. 관리자가 확인 후 등록합니다.</div></div>
    <div class="acts">${btn('secondary', '수정하기')}${btn('destructive', '삭제하기')}</div>
  </div></main>`, 1400));

/* ===== README ===== */
writeFileSync(join(OUT, 'README.md'), `# QANOW Design System v2

이 프로젝트는 \`qaboard\` 저장소의 **실제 구현 코드**에서 생성한 미리보기 카드 묶음이다.
각 카드는 \`src/styles/tokens.css\`·\`base.css\`·\`motion.css\`와 해당 컴포넌트의
\`.module.css\`를 그대로 인라인하므로, 코드와 카드가 어긋날 수 없다.

- 생성: \`npm run build:ds\` (\`scripts/build-ds.ts\`)
- 근거 문서: \`design.md\` (화면 설계 확정서)
- 이전 구현(\`_qaboard\`)의 디자인 시스템은 별도 프로젝트에 그대로 보존되어 있다.

## 카드 목록

| 그룹 | 카드 | 내용 |
|---|---|---|
${cards.map((c) => `| ${c.group} | ${c.name} | ${c.subtitle} |`).join('\n')}

## 포함하지 않은 것

Mock 데이터의 구체적인 내용, 테스트 픽스처, 저장소·인증 로직, 이후 추가할 Supabase 코드.
카드의 예시 문구는 \`design.md\` 2절이 확정한 문구만 쓴다.
`, 'utf8');

console.log(`${cards.length}개 카드 + README 생성 -> ds-bundle/`);
for (const c of cards) console.log(`  [${c.group}] ${c.name}`);
