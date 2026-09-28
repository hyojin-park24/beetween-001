---
week: 1
step: 4
title: Flip Animation
energy: YELLOW
tier: MUST
tag: week1-step4
red_fallback: "/showcase/flip-words에서 클릭한 뒤 DevTools Elements 패널을 보면서, 단어 요소가 몇 개로 늘었다가 다시 줄어드는지 NOTES.md에 한 줄로 적는다."
---

## Goal

단어가 바뀔 때 위쪽 절반에서 나가는 글자가 아래로 접히고, 이어서 새 글자가 위에서 올라온다. 전체 480ms, 애니메이션 중에는 클릭이 먹지 않는다.

## Concept

- flip은 교체가 아니다. **나가는 요소와 들어오는 요소가 동시에 DOM에 있어야** 성립한다. 하나를 지우고 하나를 그리면 그냥 바뀐 것이다.
- `perspective`는 **부모**에, `transform-origin`과 `backface-visibility`는 **자식**에 건다. 3D의 책임이 나뉘는 지점이다.
- **왜 transition이 아니라 keyframes인가**: transition은 "값이 바뀌어야" 시작하므로 새 요소를 시작 상태로 그린 뒤 한 프레임 기다렸다 끝 상태로 바꿔야 하고, 연타하면 그 타이밍이 어긋난다. keyframes는 요소가 붙는 순간 시작하고 `animation-fill-mode: backwards`가 delay 동안 시작 상태를 잡아 준다.
- `grid-area: 1 / 1`로 두 요소를 같은 칸에 겹치면 `position: absolute` 없이 스택이 된다.
- 잠금 상태(`isAnimating`)는 따로 두지 않고 `outgoing !== null`에서 파생시킨다. boolean을 따로 만들면 언젠가 두 값이 어긋난다.
- `key`에 카운터를 넣으면 React가 요소를 새로 만든다. 같은 요소를 재사용하면 애니메이션이 다시 시작하지 않는다.

## Mission

`src/features/flip-words/index.tsx`를 고쳐서 단어 요소를 두 개까지 그리게 한다.

- 앞에 보이는 인덱스(`shown`), 뒤로 빠지는 인덱스(`outgoing`), flip 횟수(`flipId`) 세 가지를 state로 둔다.
- 인덱스가 바뀌면 flip이 한 번 시작된다. 이건 `useEffect`가 아니라 **렌더 중에 조건부로** 맞춘다.
- 들어오는 요소의 `onAnimationEnd`에서 잠금을 푼다. 그리고 600ms `setTimeout` 안전장치를 하나 둔다. 컴포넌트가 사라질 때 타이머를 반드시 정리한다.
- 잠금 중에는 `step()`이 아무것도 하지 않는다.

`FlipWords.module.css`에 `.deck`(perspective 800px), `.out`, `.in`과 `@keyframes` 두 개를 추가한다. 나가는 쪽은 `rotateX(0)` → `rotateX(-90deg)`, `transform-origin: 50% 100%`, 앞 절반 240ms에 `ease-in`. 들어오는 쪽은 `rotateX(90deg)` → `rotateX(0)`, `transform-origin: 50% 0%`, 뒤 절반 240ms에 `ease-out`이고 240ms만큼 늦게 시작한다. 240ms는 리터럴로 쓰지 말고 `calc(var(--dur-flip) / 2)`로 쓴다.

`prefers-reduced-motion: reduce`에서는 회전 대신 150ms 불투명도 교차 전환으로 바꾼다.

## Hint 1

들어오는 요소는 240ms 동안 아무것도 하지 않고 기다려야 한다. 그런데 delay 중인 요소는 기본적으로 **원래 상태**로 그려진다 — 즉 회전하지 않은 채로 보인다. 그 사이 두 글자가 겹쳐 보일 것이다. `animation-fill-mode`의 값 중에 "시작 전에는 첫 키프레임 상태로 있어라"라는 게 있다.

그리고 두 번째 클릭에서 애니메이션이 다시 시작되지 않는다면, React가 같은 DOM 요소를 재사용하고 있다는 뜻이다.

## Hint 2

```css
.in {
  transform-origin: 50% 0%;
  animation: flip-in calc(var(--dur-flip) / 2) ease-out calc(var(--dur-flip) / 2) backwards;
}
```

```tsx
// 렌더 중에 state를 맞춘다 (React 공식 "adjusting state while rendering")
if (index !== shown) {
  setOutgoing(shown);
  setShown(index);
  setFlipId((id) => id + 1);
}
```

## Solution

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

/* 두 단어가 같은 그리드 칸에 겹친다. absolute가 필요 없다. */
.deck {
  display: grid;
  justify-items: center;
  width: 100%;
  perspective: 800px;
}

.word {
  grid-area: 1 / 1;
  justify-self: center;
  margin: 0;
  font-family: var(--font-latin);
  font-size: var(--size-display);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* 나가는 단어는 아래 모서리를 축으로 뒤로 눕는다. */
.out {
  transform-origin: 50% 100%;
  animation: flip-out calc(var(--dur-flip) / 2) ease-in forwards;
}

/* 들어오는 단어는 앞 절반을 기다렸다가 위 모서리를 축으로 올라온다. */
.in {
  transform-origin: 50% 0%;
  animation: flip-in calc(var(--dur-flip) / 2) ease-out calc(var(--dur-flip) / 2) backwards;
}

@keyframes flip-out {
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(-90deg);
  }
}

@keyframes flip-in {
  from {
    transform: rotateX(90deg);
  }
  to {
    transform: rotateX(0deg);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* 회전 없이 제자리에서 교차 전환만 한다. */
@media (prefers-reduced-motion: reduce) {
  .out {
    transform-origin: 50% 50%;
    animation: fade-out 150ms var(--ease) forwards;
  }

  .in {
    transform-origin: 50% 50%;
    animation: fade-in 150ms var(--ease) both;
  }
}
```

`src/features/flip-words/index.tsx`

```tsx
import { useEffect, useState } from 'react';
import { words } from './data';
import styles from './FlipWords.module.css';

/** flip은 480ms. animationend가 오지 않아도 여기서 잠금을 푼다. */
const SAFETY_MS = 600;

// 3 -> "03"
function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function FlipWords() {
  const [index, setIndex] = useState(0);
  // shown은 앞에 보이는 단어, outgoing은 뒤로 접히는 단어.
  const [shown, setShown] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [flipId, setFlipId] = useState(0);

  // 렌더 중에 state를 맞춘다: 인덱스가 바뀌면 flip이 정확히 한 번 시작된다.
  if (index !== shown) {
    setOutgoing(shown);
    setShown(index);
    setFlipId((id) => id + 1);
  }

  const isAnimating = outgoing !== null;

  // 보통은 animationend가 잠금을 푼다. 이 타이머는 그게 안 왔을 때를 위한 것이다.
  useEffect(() => {
    if (outgoing === null) return;
    const timer = window.setTimeout(() => setOutgoing(null), SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, [outgoing, flipId]);

  function step(direction: 1 | -1) {
    if (isAnimating) return;
    setIndex((index + direction + words.length) % words.length);
  }

  return (
    <div className={styles.stage} onClick={() => step(1)}>
      <div className={styles.deck}>
        {outgoing !== null && (
          <span key={`out-${flipId}`} className={`${styles.word} ${styles.out}`} aria-hidden>
            {words[outgoing]}
          </span>
        )}
        <span
          key={`in-${flipId}`}
          className={flipId === 0 ? styles.word : `${styles.word} ${styles.in}`}
          onAnimationEnd={() => setOutgoing(null)}
        >
          {words[shown]}
        </span>
      </div>
      <p className={styles.counter}>
        <span className={styles.currentIndex}>{pad(index + 1)}</span> / {pad(words.length)}
      </p>
    </div>
  );
}
```

바뀐 줄:

- state가 하나에서 넷으로 늘었다. `index`는 "가야 할 곳", `shown`은 "지금 보이는 곳", 둘이 어긋난 순간이 flip의 시작이다.
- `isAnimating`을 따로 만들지 않고 `outgoing !== null`로 파생시켰다. 잠금의 근거가 하나뿐이라 어긋날 수 없다.
- `step()`은 이제 `setIndex(current => …)` 대신 `index`를 직접 읽는다. 잠금 때문에 한 번에 한 번만 불리는 게 보장되기 때문이다.
- `key`에 `flipId`를 넣어서 매 flip마다 새 요소가 만들어진다. 이게 없으면 두 번째 클릭에서 애니메이션이 다시 시작되지 않는다.
- 첫 렌더(`flipId === 0`)에는 `.in`을 붙이지 않는다. 페이지를 열자마자 글자가 한 번 돌면 이상하다.

## Challenge

나가는 쪽과 들어오는 쪽을 살짝 겹치게(delay를 240ms보다 조금 작게) 만들어 보고, 어느 쪽이 더 자연스러운지 판단해 본다.

## Checkpoint

- [ ] 클릭하면 글자가 아래로 접히고 새 글자가 위에서 올라온다
- [ ] 접히는 축이 글자의 아래 모서리, 올라오는 축이 위 모서리다
- [ ] 애니메이션 중간(약 240ms)에는 두 글자가 모두 옆에서 본 것처럼 얇아진다
- [ ] 빠르게 10번 연타해도 글자가 겹치거나 사라지지 않고, 끝나면 하나만 남는다
- [ ] OS의 "동작 줄이기"를 켜면 회전 없이 부드럽게 바뀐다

## Commit

```bash
git add -A && git commit -m "feat(w1): flip the word in 3d"
npm run checkpoint week1-step4
```
