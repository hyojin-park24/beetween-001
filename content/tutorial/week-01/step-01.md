---
week: 1
step: 1
title: Project Setup
energy: RED
tier: MUST
tag: week1-step1
red_fallback: "src/reference/flip-words/index.tsx를 열어 읽기만 하고, 무엇이 state이고 무엇이 CSS인지 NOTES.md 아래에 각 한 줄로 적는다."
---

## Goal

`/lab/flip-words`를 열면 FLIP WORDS라는 글자가 보인다. 파일 하나만 만들면 라우터가 알아서 잡는다.

## Concept

- `src/features/*`가 내 코드가 사는 곳이다. `src/reference/*`는 정답지이고 import 할 수 없다 — ESLint가 막는다.
- `LabPage`는 `import.meta.glob('../features/*/index.tsx')`로 폴더를 훑는다. 파일을 만드는 순간 라우트가 연결된다.
- 컴포넌트는 반드시 `export default`다. 라우터는 이름이 아니라 default export를 찾는다.
- `/lab`과 `/showcase`는 같은 full-bleed 레이아웃(100vh, 페이지 padding 없음)이다. 내 것과 정답지를 같은 조건에서 비교할 수 있다.

## Mission

`src/features/flip-words/index.tsx`를 새로 만든다. 그 안에 default export 함수 컴포넌트 하나를 두고, FLIP WORDS라는 글자를 그대로 반환한다. 스타일은 아직 하지 않는다. 저장한 뒤 `npm run dev`를 띄우고 `/lab/flip-words`로 간다. "Not built yet" 대신 글자가 보이면 끝이다.

## Hint 1

지금 `/lab/flip-words`가 "Not built yet"을 보여 준다는 건 `LabPage`가 `src/features/flip-words/index.tsx`를 못 찾았다는 뜻이다. `src/pages/LabPage.tsx`를 열어서 어떤 경로를 찾고 있는지 확인해 보자. 파일 이름이 `index.tsx`가 맞는지, 확장자가 `.ts`가 아니라 `.tsx`인지부터 본다.

## Hint 2

```tsx
export default function FlipWords() {
  return <div>FLIP WORDS</div>;
}
```

## Solution

`src/features/flip-words/index.tsx`

```tsx
export default function FlipWords() {
  return <div>FLIP WORDS</div>;
}
```

바뀐 줄:

- 파일이 새로 생겼다. 내용은 이게 전부다.
- `export default`이기 때문에 `LabPage`의 `import.meta.glob`이 이 파일을 모듈로 잡고 `lazy()`로 감싼다.
- props는 아직 받지 않는다. `active`는 Step 05에서, `entryFrom`·`onEdge`는 Week 04에서 쓴다.
- 새 파일을 만들면 dev 서버가 glob을 다시 읽어야 한다. 화면이 그대로면 서버를 한 번 재시작한다.

## Challenge

글자 대신 오늘 날짜를 렌더링해 보고, 새로고침할 때마다 값이 바뀌는지 확인해 본다.

## Checkpoint

- [ ] `/lab/flip-words`에 FLIP WORDS가 보인다
- [ ] "Not built yet" 문구가 더 이상 나오지 않는다
- [ ] 왼쪽 위 내비게이션의 `lab`에 밑줄이 있다
- [ ] `npm run lint`와 `npm run build`가 모두 통과한다

## Commit

```bash
git add -A && git commit -m "feat(w1): add flip-words feature shell"
npm run checkpoint week1-step1
```
