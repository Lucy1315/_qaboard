# Contract — QuestionRepository

**Date**: 2026-08-29 | 데이터 접근의 **유일한 통로**이다. 페이지가 `supabase-js`를 직접 부르지 않는다.

```ts
export type Viewer =
  | { role: 'anon' }
  | { role: 'member' | 'admin'; userId: string; email: string };

export interface QuestionRepository {
  listQuestions(viewer: Viewer): Promise<QuestionSummary[]>;
  getQuestion(id: string, viewer: Viewer): Promise<QuestionDetail>;
  createQuestion(input: { title: string; body: string }, viewer: Viewer): Promise<string>;
  updateQuestion(id: string, input: { title: string; body: string }, viewer: Viewer): Promise<void>;
  deleteQuestion(id: string, viewer: Viewer): Promise<void>;
  upsertAnswer(questionId: string, body: string, viewer: Viewer): Promise<void>;
}
```

## 오류 계약

| 오류 | 발생 조건 | 화면 상태 | 근거 |
|---|---|---|---|
| `AuthRequiredError` | `viewer.role === 'anon'` | `loginRequired` | FR-020 |
| `UnauthorizedError` | 조회 결과 0행 / 정책 거부 | `unauthorized` | FR-018·FR-021 |
| `AnsweredLockError` | 답변 후 수정·삭제 시도 | 인라인 안내 | FR-012 |
| `ValidationError(field, message)` | 길이·빈 값 위반 | 필드별 오류 | FR-023~FR-026 |
| `SessionExpiredError` | 세션 무효 | 재로그인 안내 | FR-022 |
| `RepositoryError` | 그 밖의 실패 | `error` + 다시 시도 | FR-032 |

**`RepositoryError`에 원본 예외 메시지를 담아 화면에 노출하지 않는다**(FR-032). 원본은 `console.error`로만 남긴다.

## 두 구현이 지켜야 할 동치 조건

`mockRepository`와 `supabaseRepository`는 **같은 계약 테스트를 통과해야 한다.**

1. 회원은 자기 질문만 목록에 나온다(FR-007).
2. 관리자는 전체 질문이 나오고 `authorEmail`이 채워진다(FR-008).
3. 타인 질문 `getQuestion` → `UnauthorizedError`(FR-018).
4. 답변 있는 질문 `updateQuestion`/`deleteQuestion` → `AnsweredLockError`(FR-012).
5. 회원 `upsertAnswer` → `UnauthorizedError`(FR-017).
6. 저장 직전 `validation.ts`를 다시 호출해 `ValidationError`를 던진다(FR-027).
7. `upsertAnswer`는 질문당 답변을 하나로 유지한다(FR-016).

Mock이 이 조건을 재현해야 데이터 연결 전에 UI 분기를 검증할 수 있다(plan.md 15절).
