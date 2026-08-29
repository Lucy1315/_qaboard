# QANOW 컴포넌트로 화면을 만들 때

QANOW는 회원이 비공개로 질문을 남기고 관리자가 답변하는 1:1 질의응답 게시판이다.
화면은 **어두운 표면(소개)** 과 **밝은 표면(작업)** 두 가지로만 나뉜다.

## 감싸기와 설정

**프로바이더가 필요 없다.** 모든 컴포넌트는 순수하며 라우터·인증 컨텍스트를 읽지 않는다
(`Header`는 `role`·`current`·`onHome`·`onList`를 props로 받는다). 그대로 놓으면 렌더된다.

**어두운 영역에는 `surfaceDark` 클래스를 붙인다.** 이 클래스가 배경을 `--ink900`으로 바꾸고
포커스 링을 `--focus-dark`로 전환한다. 붙이지 않으면 어두운 배경 위에서 포커스 링이
`--focus`(파랑)로 남아 대비가 3:1에 아슬하게 걸친다.

```jsx
<div className="surfaceDark" style={{ background: 'var(--ink900)', padding: 'var(--sp-40)' }}>
  <Button variant="primary">질문 작성하기</Button>
  <Button variant="darkSecondary">내 질문 확인하기</Button>
</div>
```

## 스타일 방식

컴포넌트 내부는 CSS Modules이라 클래스 이름을 밖에서 쓸 수 없다. **직접 만드는 레이아웃은
CSS 변수로 짠다.** 아래가 이 시스템의 어휘 전부이며, 여기 없는 값을 새로 만들지 않는다.

| 갈래 | 토큰 |
|---|---|
| 어두운 표면 | `--ink900` `--ink700` `--on-dark` `--on-dark-2` `--on-dark-3` |
| 밝은 표면 | `--canvas` `--sur` `--fg` `--fg2` `--divider` `--input-border` |
| 포인트 | `--pri` `--pri2` `--vio` `--focus` `--focus-dark` `--err` `--wait-edge` |
| 상태 배지 | `--bdg-wait-*` `--bdg-done-*` `--bdg-err-*` `--bdg-neutral-*` `--bdg-save-*` |
| 서체 | `--sans`(본문·제목) `--mono`(워드마크·숫자·시각) |
| 간격 | `--sp-4` `--sp-8` `--sp-12` `--sp-16` `--sp-20` `--sp-24` `--sp-32` `--sp-40` `--sp-56` `--sp-72` `--sp-96` 등 값-이름 토큰 |
| 최대 폭 | `--w-hero`(1200) `--w-section`(1120) `--w-page`(960) `--w-prose`(720) |
| 반경 | `--r-btn`(8) `--r-card`(12) `--r-badge`(6) |

**지켜야 할 규칙 넷**

1. **상태는 색만으로 전달하지 않는다.** `Badge`는 `children`이 필수라 텍스트 없는 배지를 만들 수 없다.
   상태 이름은 `답변 대기` / `답변 완료` 두 가지뿐이다.
2. **본문 읽기 폭은 `--w-prose`(720px)로 제한한다.** 질문·답변 본문의 한 줄이 길어지지 않게 한다.
3. **애니메이션을 새로 만들지 않는다.** 이 시스템의 모션은 `drift` `floaty1` `floaty2` `spin` `pulse`
   다섯 개뿐이고 전부 `prefers-reduced-motion: no-preference` 안에 있다. 새 `animation`을 쓰면
   모션 감소 사용자에게 그대로 재생된다.
4. **권한이 없는 요소는 그리지 않는다.** 비활성 상태로 띄우지 않는다. 예를 들어 회원 화면에는
   답변 입력 요소가 아예 없어야 한다.

## 진실이 있는 곳

- 토큰·전역 규칙: `styles.css`와 그 `@import` 대상(`_ds_bundle.css`)
- 컴포넌트별 API와 사용법: 각 `components/<group>/<Name>/<Name>.prompt.md`와 `<Name>.d.ts`
- 요약보다 실제 파일을 읽는 편이 언제나 정확하다.

## 표준 조합 예시

```jsx
<>
  <Header role="member" current="list" onHome={goHome} onList={goList} />
  <Page>
    <PageHeader
      title="내 질문"
      desc="내가 남긴 질문과 답변 상태를 확인할 수 있습니다."
      action={<Button variant="primary">새 질문 작성</Button>}
    />
    <StatusTabs value="all" counts={{ all: 2, wait: 1, done: 1 }} enabled onChange={setFilter} />
    <QuestionList items={items} isAdmin={false} onOpen={openQuestion} />
  </Page>
</>
```

불러오는 중에는 `<ListSkeleton />` + `<LoadingNote />`, 비어 있으면
`<StateBox variant="emptyMember" actions={...} />`를 같은 자리에 놓는다.
