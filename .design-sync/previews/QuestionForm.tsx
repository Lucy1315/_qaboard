import { QuestionForm } from 'qanow';

const noop = () => {};

/** 새 질문 — 빈 폼. 라벨·도움말·글자 수가 모두 보인다. */
export const NewQuestion = () => (
  <div style={{ maxWidth: 720 }}>
    <QuestionForm mode="new" saving={false} onCancel={noop} onSubmit={noop} />
  </div>
);

/** 수정 — 기존 값이 채워지고 버튼 라벨이 '저장하기'로 바뀐다. */
export const EditQuestion = () => (
  <div style={{ maxWidth: 720 }}>
    <QuestionForm
      mode="edit"
      initial={{
        title: '결제 내역은 어디에서 확인하나요?',
        body: '지난달 결제한 내역을 다시 확인하고 싶은데 어느 화면에서 볼 수 있는지 찾지 못했습니다.',
      }}
      saving={false}
      onCancel={noop}
      onSubmit={noop}
    />
  </div>
);

/** 저장 중 — 버튼이 비활성되고 저장 중 배지가 함께 뜬다. 중복 제출을 막는다. */
export const Saving = () => (
  <div style={{ maxWidth: 720 }}>
    <QuestionForm
      mode="new"
      initial={{ title: '결제 내역은 어디에서 확인하나요?', body: '내용입니다.' }}
      saving
      onCancel={noop}
      onSubmit={noop}
    />
  </div>
);

/** 서버가 돌려준 필드 오류 — 입력값을 잃지 않고 해당 필드에만 표시한다. */
export const WithFieldError = () => (
  <div style={{ maxWidth: 720 }}>
    <QuestionForm
      mode="new"
      saving={false}
      serverError={{ field: 'title', message: '제목을 입력해 주세요.' }}
      onCancel={noop}
      onSubmit={noop}
    />
  </div>
);
