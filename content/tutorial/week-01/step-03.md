---
week: 1
step: 3
title: State Change
energy: YELLOW
tier: MUST
tag: week1-step3
red_fallback: "/showcase/flip-words를 열어 클릭만 계속해 보고, 마지막 단어 다음에 무엇이 오는지와 오른쪽 아래 숫자가 어떻게 바뀌는지 NOTES.md에 두 줄로 적는다."
---

## Goal

화면을 클릭하면 다음 단어로 바뀌고, 마지막 단어에서 클릭하면 첫 단어로 돌아온다. 오른쪽 아래에 `01 / 04` 형태의 인덱스가 보인다.

## Concept

- `useState`가 들고 있는 것은 단어가 아니라 **인덱스 하나**다. 화면에 보이는 단어는 `words[index]`로 계산해서 얻는다.
- 순환은 나머지 연산 한 줄로 끝난다. `if`로 앞뒤를 나누기 시작하면 방향마다 분기가 생긴다.
- 음수를 피하려면 나머지를 구하기 전에 길이를 한 번 더한다. `(index - 1) % 4`는 `-1`이지만 `(index - 1 + 4) % 4`는 `3`이다.
- `setIndex(current => …)` 형태(업데이터 함수)를 쓰면 직전 값을 확실히 읽는다.
- 강조색은 화면에 한 번만 나온다. 여기서는 현재 인덱스 숫자가 그 한 번이다.

## Mission

`src/features/flip-words/index.tsx`에 상태를 넣는다.

- 현재 인덱스를 담는 state를 하나 만든다.
- `step(direction)` 함수를 만든다. `1`이면 다음, `-1`이면 이전. 양쪽 끝에서 순환한다.
- `.stage`를 클릭하면 `step(1)`이 불리게 한다.
- 오른쪽 아래에 `01 / 04`를 그린다. 두 자리로 맞추고, 현재 번호만 `--accent` 색으로 한다.

`FlipWords.module.css`에는 `.counter`와 `.currentIndex`를 추가하고, 단어 위에서 커서가 손가락이 되게 한다.

## Hint 1

방향을 인자로 받는 함수 하나로 앞뒤를 다 처리할 수 있으면 Step 05에서 휠과 방향키를 붙일 때 그대로 재사용된다. `next()`와 `prev()` 두 개를 만들면 나중에 두 곳을 고쳐야 한다.

`01`처럼 두 자리로 만드는 건 `String(n).padStart(2, '0')`이다.

## Hint 2

```tsx
function step(direction: 1 | -1) {
  setIndex((current) => (current + direction + words.length) % words.length);
}
```

## Solution

`src/features/flip-words/FlipWords.module.css` (추가분)

```css
.word {
  /* …기존 규칙 유지… */
  cursor: pointer;
}

.counter {
  position: absolute;
  right: 24px;
  bottom: 24px;
  margin: 0;
  font-family: var(--font-latin);
  font-size: var(--size-body);
  letter-spacing: 0.06em;
}

.currentIndex {
  color: var(--accent);
}
```

`src/features/flip-words/index.tsx`

```tsx
import { useState } from 'react';
import { words } from './data';
import styles from './FlipWords.module.css';

// 3 -> "03"
function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function FlipWords() {
  const [index, setIndex] = useState(0);

  // 방향 하나로 앞뒤를 다 처리한다. 길이를 더해서 음수를 피한다.
  function step(direction: 1 | -1) {
    setIndex((current) => (current + direction + words.length) % words.length);
  }

  return (
    <div className={styles.stage} onClick={() => step(1)}>
      <span className={styles.word}>{words[index]}</span>
      <p className={styles.counter}>
        <span className={styles.currentIndex}>{pad(index + 1)}</span> / {pad(words.length)}
      </p>
    </div>
  );
}
```

바뀐 줄:

- `useState(0)`가 들어왔다. state는 인덱스 하나뿐이고 단어는 `words[index]`로 파생시킨다.
- `step(direction)` 한 함수가 앞뒤를 모두 담당한다. Step 05에서 휠과 방향키가 이 함수를 그대로 부른다.
- `pad()`는 화면 표시용이라 컴포넌트 밖에 뒀다. 렌더마다 다시 만들 이유가 없다.
- `.counter`는 `.stage`의 `position: relative` 덕분에 오른쪽 아래에 붙는다.
- 인덱스는 0부터지만 사람이 읽는 숫자는 1부터라 `index + 1`을 넘긴다.

## Challenge

클릭 대신 더블클릭이면 두 칸 이동하게 만들어 보고, 그게 실제로 쓸 만한지 판단해 본다.

## Checkpoint

- [ ] 클릭할 때마다 단어가 DEVELOPER → CREATOR → EXPLORER → ARTIST? 순서로 바뀐다
- [ ] ARTIST?에서 한 번 더 클릭하면 DEVELOPER로 돌아온다
- [ ] 오른쪽 아래 숫자가 `01 / 04`부터 `04 / 04`까지 따라 바뀐다
- [ ] 앞 숫자만 주황색이고, 화면에 주황색은 그것 하나뿐이다
- [ ] 단어 위에서 마우스 커서가 손가락 모양이 된다

## Commit

```bash
git add -A && git commit -m "feat(w1): cycle words on click"
npm run checkpoint week1-step3
```
