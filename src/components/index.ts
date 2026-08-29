/* T036 — 디자인 시스템 진입점.
   컴포넌트를 라이브러리로 노출해 Claude Design 동기화가 실제 구현을 번들링하도록 한다.
   애플리케이션 동작에는 영향이 없다(빌드 산출물은 그대로 앱 번들이다).

   전역 스타일(토큰·기본·모션)을 여기서 가져와야 동기화 번들의 _ds_bundle.css 에
   var(--*) 정의와 @keyframes 가 함께 실린다. 이게 없으면 모든 시안이 무스타일로 렌더된다. */
import '../styles/index.css';

/* 레이아웃 */
export { Header } from './layout/Header';
export type { HeaderRole } from './layout/Header';
export { Page, PageHeader, BackToList, Footer } from './layout/Page';

/* 공통 UI */
export { Button } from './ui/Button';
export type { ButtonVariant } from './ui/Button';
export { Badge } from './ui/Badge';
export type { BadgeTone } from './ui/Badge';
export { InputField, TextareaField } from './ui/Field';
export { StateBox } from './ui/StateBox';
export type { StateVariant } from './ui/StateBox';
export { LoadingNote } from './ui/LoadingNote';
export { ListSkeleton, DetailSkeleton } from './ui/Skeleton';
export { StatusTabs } from './ui/StatusTabs';
export type { StatusFilter, FilterCounts } from './ui/StatusTabs';
export { STATE_COPY } from './ui/stateCopy';

/* 질문 도메인 */
export { QuestionList } from './question/QuestionList';
export { QuestionDetailView } from './question/QuestionDetailView';
export { QuestionForm } from './question/QuestionForm';
export { AnswerForm } from './question/AnswerForm';

/* 메인 페이지 */
export { Hero, ClosingCta } from './hero/Hero';
export { AuroraBackdrop } from './hero/AuroraBackdrop';
export { FloatingQaCards } from './hero/FloatingQaCards';
export { FlowSteps } from './hero/FlowSteps';
