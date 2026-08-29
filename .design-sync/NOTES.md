# design-sync 메모 — qaboard

## 저장소 성격

- **이 저장소는 디자인 시스템 패키지가 아니라 애플리케이션이다.** `private: true` 이고 원래
  `main`/`module`/`exports` 가 없었다. 동기화를 위해 다음을 추가했다.
  - `src/components/index.ts` — 컴포넌트 배럴(라이브러리 진입점)
  - `package.json` 의 `module` / `exports` — 위 배럴을 가리킨다
  - 앱 빌드(`npm run build`)는 여전히 Vite 앱 번들을 만든다. 라이브러리 빌드는 없다.
- `dist/` 는 **앱 번들**이다. 변환기의 `--entry` 는 `dist/` 가 아니라 배럴 소스를 가리켜야 한다.

## 스타일 구조

- 전역 스타일 3개(`tokens.css`·`base.css`·`motion.css`)를 `src/styles/index.css` 가 `@import` 로 묶는다.
  `cfg.cssEntry` 가 이 파일을 가리킨다. 앱의 `main.tsx` 도 같은 진입점을 쓴다.
- 컴포넌트 스타일은 CSS Modules(`*.module.css`)이다. esbuild 가 번들링해 `_ds_bundle.css` 로 나온다.
- **애니메이션은 `src/styles/motion.css` 한 파일에만 있다.** `prefers-reduced-motion: no-preference`
  안에만 정의되며, 다른 파일에 `animation` 을 쓰면 stylelint 가 막는다.

## 컴포넌트 의존성

- `Header` 는 라우터·인증 컨텍스트에 의존하지 않는 순수 컴포넌트다(props 주입). 앱 쪽 `AppHeader`
  래퍼가 `App.tsx` 에 있다.
- `QuestionForm`·`AnswerForm` 은 `src/data/validation.ts` 의 길이 규칙을 참조한다. 순수 함수라
  프로바이더가 필요 없다.
- `QuestionList`·`QuestionDetailView` 는 `src/data/types.ts` 의 타입과 `src/lib/format.ts` 만 쓴다.

## Re-sync 위험

- 배럴(`src/components/index.ts`)은 손으로 유지한다. 컴포넌트를 추가하고 배럴에 넣지 않으면
  동기화에서 조용히 빠진다.
- `package.json` 의 `exports`/`module` 은 동기화 전용이다. 앱 배포에 영향이 없는지 확인할 것.
- 한글 웹폰트(`Gothic A1`)는 Google Fonts 에서 런타임 로드된다. 번들에 폰트 파일을 싣지 않으므로
  `[FONT_MISSING]` 이 뜨면 `cfg.runtimeFontPrefixes` 로 처리한다.

## 이번 동기화에서 겪은 것 (2026-08-29 첫 동기화)

- **`[ZERO_MATCH]`** — 변환기는 패키지가 내보내는 `.d.ts` 트리에서 컴포넌트를 찾는다. 앱 저장소라
  선언 빌드가 없어 0개를 읽었다. `tsconfig.lib.json` + `npm run build:lib`(tsc `emitDeclarationOnly`)로
  `dist-lib/` 를 만들고 `package.json` 의 `types` 를 그쪽으로 돌려 해결했다.
  **컴포넌트를 추가하면 `build:lib` 를 먼저 돌려야 동기화에 잡힌다.**
- **전역 CSS 누락** — 배럴이 `src/styles/index.css` 를 import 하지 않으면 `_ds_bundle.css` 에
  토큰 정의와 `@keyframes` 가 실리지 않아 모든 시안이 무스타일로 렌더된다. 배럴 첫 줄의
  `import '../styles/index.css'` 를 지우지 말 것.
- **`[CSS_IMPORT_MISSING]`** — `cfg.cssEntry` 를 `index.css`(@import 만 있는 파일)로 두면 변환기가
  그 내용을 그대로 덧붙여 미해결 `@import` 가 남는다. **`cssEntry` 를 설정하지 않는다** — 번들이
  이미 전역 CSS 를 담고 있다.
- **`[FONT_MISSING]` → `[FONT_REMOTE]`** — 한글 웹폰트를 `index.html` 의 `<link>` 로만 부르면
  시안은 `styles.css` 클로저만 받으므로 시스템 폰트로 떨어진다. `tokens.css` 최상단에
  Google Fonts `@import` 를 넣어 클로저 안으로 들여 해결했다. **이 줄을 지우면 모든 시안의
  한글이 시스템 폰트가 된다.**
- playwright 는 캐시된 chromium 빌드(1217)에 맞춰 `playwright@1.59.1` 을 `.ds-sync/` 에 설치했다.

## 알려진 렌더 경고 (Known render warns)

- 없음. 최종 validate 기준 `bad` 0 · `thin` 0 · `variantsIdentical` 0.
- `[FONT_REMOTE]` 는 정보성이며 위 폰트 `@import` 가 의도한 결과다.

## Re-sync 위험

- **배럴이 단일 실패점이다.** `src/components/index.ts` 에 넣지 않은 컴포넌트는 조용히 빠진다.
- `package.json` 의 `types`/`module`/`exports` 는 동기화 전용이다. 앱 배포에 영향이 없는지
  배포 전에 확인할 것(현재 Vite 앱 빌드에는 영향 없음을 확인했다).
- 프리뷰(`.design-sync/previews/*.tsx`)는 컴포넌트 props 를 직접 쓴다. props 를 바꾸면
  프리뷰가 먼저 깨진다 — 이건 의도된 조기 경보다.
- 채점 결과는 `.design-sync/.cache/` (gitignore)에 있고, 지속되는 것은 업로드된
  `_ds_sync.json` 앵커다. 프로젝트를 지우면 다음 동기화가 23개 전부 재검증한다.
