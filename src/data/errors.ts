/* T026 — contracts/repository.md 오류 계약 */
export class AuthRequiredError extends Error {
  constructor() {
    super('AUTH_REQUIRED');
    this.name = 'AuthRequiredError';
  }
}
export class UnauthorizedError extends Error {
  constructor() {
    super('UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}
export class AnsweredLockError extends Error {
  constructor() {
    super('ANSWERED_LOCK');
    this.name = 'AnsweredLockError';
  }
}
export class ValidationError extends Error {
  constructor(
    public field: 'title' | 'body' | 'answer',
    message: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
export class RepositoryError extends Error {
  constructor() {
    // FR-032 — 내부 예외를 화면에 노출하지 않는다.
    super('REPOSITORY_ERROR');
    this.name = 'RepositoryError';
  }
}
