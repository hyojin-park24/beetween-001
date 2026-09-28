---
week: 1
step: 2
title: First Word
energy: RED
tier: MUST
tag: week1-step2
red_fallback: "tokens.css를 열고 --size-display와 --font-latin이 각각 무엇인지, 왜 px이 아니라 clamp()인지 NOTES.md에 두 줄로 적는다."
---

## Goal

`words[0]`인 DEVELOPER가 화면 정중앙에 규격대로 보인다. 색·크기·폰트는 전부 토큰에서 온다.

## Concept

- 데이터는 컴포넌트 밖으로 뺀다. `data.ts` 하나면 나중에 단어를 바꿀 때 컴포넌트를 건드리지 않아도 된다.
- CSS Modules는 클래스 이름을 파일 단위로 격리한다. `styles.word`처럼 객체로 읽는다.
- 중앙 정렬은 `display: grid` + `place-items: center` 두 줄이면 끝난다. `position: absolute`와 `translate(-50%, -50%)`는 필요 없다.
- 색·크기·easing·시간은 전부 `var(--…)`로 쓴다. 리터럴 값을 쓰기 시작하면 4주 뒤에 화면마다 다른 회색이 생긴다.
- `.stage`가 `width: 100%; height: 100%`인 이유는 `/lab`이 full-bleed(100vh)라서다. 부모가 준 만큼 다 쓴다.

## Mission

파일 두 개를 더 만든다.

- `src/features/flip-words/data.ts` — 단어 배열 `words`를 export 한다. `['DEVELOPER', 'CREATOR', 'EXPLORER', 'ARTIST?']`
- `src/features/flip-words/FlipWords.module.css` — 화면을 꽉 채우고 가운데 정렬하는 `.stage`, 단어 규격을 담은 `.word`

그리고 `src/features/flip-words/index.tsx`가 이 둘을 써서 `words[0]`을 그리게 고친다. 단어 규격은 `--size-display`, `font-weight: 700`, `letter-spacing: -0.03em`, `--font-latin`, `line-height: 1`이다.

## Hint 1

`--size-display`는 `clamp(48px, 12vw, 160px)`이다. 창 너비를 줄였다 늘렸다 하면서 글자가 같이 커지는지 본다. 만약 단어가 두 줄로 접힌다면 어떤 속성이 빠진 걸까?

## Hint 2

```css
.stage {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}
```

## Solution

`src/features/flip-words/data.ts`

```ts
// 이번 주에 넘길 단어들.
export const words = ['DEVELOPER', 'CREATOR', 'EXPLORER', 'ARTIST?'];
```

`src/features/flip-words/FlipWords.module.css`

```css
.stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.word {
  margin: 0;
  font-family: var(--font-latin);
  font-size: var(--size-display);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
}
```

`src/features/flip-words/index.tsx`

```tsx
import { words } from './data';
import styles from './FlipWords.module.css';

export default function FlipWords() {
  return (
    <div className={styles.stage}>
      <span className={styles.word}>{words[0]}</span>
    </div>
  );
}
```

바뀐 줄:

- `data.ts`와 `FlipWords.module.css`가 새로 생겼다.
- `index.tsx`가 `<div>FLIP WORDS</div>` 대신 `.stage` 안에 `.word`를 그린다.
- `.stage`에 `position: relative`를 미리 넣었다. Step 03에서 인덱스를 오른쪽 아래에 붙일 때 필요하다.
- `white-space: nowrap`이 없으면 좁은 화면에서 ARTIST?가 두 줄로 접힌다.

## Challenge

`words`에 자기 단어 두 개를 추가해 보고, 가장 긴 단어에서 `clamp()`의 최소값이 충분한지 확인해 본다.

## Checkpoint

- [ ] `/lab/flip-words` 정중앙에 DEVELOPER가 보인다
- [ ] 창 너비를 줄이면 글자 크기가 같이 줄어든다
- [ ] 어떤 너비에서도 단어가 두 줄로 접히지 않는다
- [ ] `/showcase/flip-words`와 글자 위치·크기가 같아 보인다

## Commit

```bash
git add -A && git commit -m "feat(w1): render the first word with tokens"
npm run checkpoint week1-step2
```
