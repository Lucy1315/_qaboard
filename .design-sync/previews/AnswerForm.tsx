import { AnswerForm } from 'qanow';

const noop = () => {};

/** 첫 답변 — 라벨이 '답변', 제출이 '답변 등록'이다. */
export const NewAnswer = () => (
  <div style={{ maxWidth: 720 }}>
    <AnswerForm initial="" answered={false} saving={false} onCancel={noop} onSubmit={noop} />
  </div>
);

/** 답변 수정 — 라벨과 제출 문구가 함께 바뀐다. 상태는 답변 완료로 유지된다. */
export const EditAnswer = () => (
  <div style={{ maxWidth: 720 }}>
    <AnswerForm
      initial="문의 감사합니다. 결제 내역은 계정 화면에서 확인하실 수 있습니다."
      answered
      saving={false}
      onCancel={noop}
      onSubmit={noop}
    />
  </div>
);

/** 저장 중. */
export const Saving = () => (
  <div style={{ maxWidth: 720 }}>
    <AnswerForm initial="확인 후 안내드리겠습니다." answered={false} saving onCancel={noop} onSubmit={noop} />
  </div>
);
