---
week: 1
step: 5
title: Wheel & Keyboard
energy: YELLOW
tier: SHOULD
tag: week1-step5
red_fallback: "/showcase/flip-words에서 트랙패드로 한 번 세게 스크롤해 보고 몇 칸이 넘어가는지, 마우스 휠 한 칸에서는 몇 칸인지 NOTES.md에 두 줄로 적는다."
---

## Goal

트랙패드로 한 번 튕기면 정확히 한 칸, 마우스 휠 한 칸도 정확히 한 칸 움직인다. 방향키 아래/위로도 같은 동작을 한다. 컴포넌트가 사라질 때 리스너가 남지 않는다.

## Concept

- 휠 이벤트는 "한 번"이 아니다. 마우스는 큰 값 몇 개, 트랙패드는 아주 작은 값 수십 개를 관성이 끝날 때까지 쏟아낸다.
- 그래서 누적 `deltaY`만 보면 한 번 튕길 때 임계값을 여러 번 넘는다. 한 번 움직인 뒤에는 **이벤트가 잠시 끊길 때까지 잠가야** 한 번에 한 칸이 된다.
- 재사용할 로직은 훅으로 뺀다. `useWheelStep`은 Week 02의 갤러리에서 그대로 다시 쓴다.
- `addEventListener`를 쓴 `useEffect`는 반드시 정리 함수에서 `removeEventListener`를 한다. 안 하면 섹션을 오갈 때마다 리스너가 쌓인다.
- 핸들러 안에서 최신 함수를 부르려면 ref에 담아 둔다. 그러면 렌더마다 리스너를 떼었다 붙이지 않아도 된다.
- 여기서 `active` prop이 처음 등장한다. Week 04에서 여러 기능이 한 화면에 올라갈 때, 꺼진 기능은 입력을 받으면 안 된다.

## Mission

먼저 훅을 뺀다. `src/features/shared/useWheelStep.ts`를 만들고, 대상 요소의 ref와 `(direction: 1 | -1) => void` 콜백을 받아 임계값을 넘을 때마다 콜백을 부르게 한다. 옵션으로 `enabled`, `threshold`(기본 60)를 받는다. 트랙패드 관성을 흘려보내는 잠금도 이 안에 넣는다.

그다음 `src/features/flip-words/index.tsx`를 고친다.

- `active` prop을 받는다. 기본값은 `true`다. 타입은 `src/shared/types.ts`의 `StandaloneFeatureProps`를 쓴다.
- `.stage`에 ref를 달고 훅을 연결한다. 잠금 중(`isAnimating`)이거나 꺼져 있으면(`!active`) 동작하지 않아야 한다.
- `window`에 `keydown`을 붙여 ArrowDown은 다음, ArrowUp은 이전으로 보낸다. 브라우저 기본 스크롤은 막는다.
- 정리 함수에서 리스너를 뗀다.

## Hint 1

휠 이벤트에 `event.timeStamp`가 들어 있다. 직전 이벤트와의 간격이 충분히 벌어졌다면 그건 새 제스처라는 뜻이고, 아직 촘촘하게 들어오고 있다면 같은 제스처의 관성이다. 이 두 경우를 구분하면 "한 번 튕김 = 한 칸"이 된다.

리스너를 꺼야 할 때도 `removeEventListener`로 떼는 대신 **붙여 둔 채로 핸들러 안에서 무시**하는 편이 낫다. 그래야 잠금 중에 들어온 관성 이벤트도 누적값을 계속 0으로 밀어낼 수 있다.

## Hint 2

```ts
// 간격이 벌어졌다 = 이전 제스처가 끝났다
if (now - state.lastAt > quietMs) {
  state.blocked = false;
  state.acc = 0;
}
state.lastAt = now;
```

```tsx
useWheelStep(stageRef, step, { enabled: canStep, threshold: WHEEL_THRESHOLD });
```

## Solution

`src/features/shared/useWheelStep.ts`

```ts
import { useEffect, useRef, type RefObject } from 'react';

export type WheelStepOptions = {
  /** false인 동안에는 누적값을 비우고 한 칸도 내보내지 않는다. */
  enabled?: boolean;
  /** 한 칸이 나가기까지 쌓여야 하는 deltaY. */
  threshold?: number;
  /** 한 칸 뒤의 고정 대기 시간. 제스처 규칙 위에 얹힌다. */
  lockMs?: number;
  /** 이만큼 이벤트가 끊기면 직전 제스처가 끝난 것으로 본다. */
  quietMs?: number;
};

type WheelState = { acc: number; blocked: boolean; unlockAt: number; lastAt: number };

/**
 * 날것의 휠 이벤트를 한 칸 단위로 바꾼다.
 *
 * 마우스는 큰 delta 몇 개, 트랙패드는 아주 작은 delta를 길게 쏟아낸다. 그래서
 * deltaY만 세면 한 번 튕길 때 여러 칸이 넘어간다. 한 칸 움직인 뒤에는 이벤트가
 * quietMs 동안 끊길 때까지 잠가 둔다. 이게 "한 번 튕김 = 한 칸"의 전부다.
 */
export function useWheelStep(
  targetRef: RefObject<HTMLElement | null>,
  onStep: (direction: 1 | -1) => void,
  options: WheelStepOptions = {},
): void {
  const { enabled = true, threshold = 60, lockMs = 0, quietMs = 140 } = options;

  const stateRef = useRef<WheelState>({ acc: 0, blocked: false, unlockAt: 0, lastAt: 0 });
  const onStepRef = useRef(onStep);
  const enabledRef = useRef(enabled);

  // 최신 콜백과 플래그를 ref로 들고 있으면 렌더마다 리스너를 다시 붙이지 않아도 된다.
  useEffect(() => {
    onStepRef.current = onStep;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    const element = targetRef.current;
    if (element === null) return;

    function handleWheel(event: WheelEvent) {
      const state = stateRef.current;
      const now = event.timeStamp;

      // 간격이 충분히 벌어졌다 = 새 제스처. 예전 누적은 더 이상 유효하지 않다.
      if (now - state.lastAt > quietMs) {
        state.blocked = false;
        state.acc = 0;
      }
      state.lastAt = now;

      // 꺼져 있어도 계속 듣는다. 그래야 진행 중인 관성이 다시 켜지는 순간
      // 한 칸을 흘리지 않는다.
      if (!enabledRef.current) {
        state.acc = 0;
        return;
      }

      event.preventDefault();
      if (state.blocked || now < state.unlockAt) return;

      state.acc += event.deltaY;
      if (Math.abs(state.acc) < threshold) return;

      const direction = state.acc > 0 ? 1 : -1;
      state.acc = 0;
      state.blocked = true;
      state.unlockAt = now + lockMs;
      onStepRef.current(direction);
    }

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [targetRef, threshold, lockMs, quietMs]);
}
```

`src/features/flip-words/index.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import type { StandaloneFeatureProps } from '../../shared/types';
import { words } from './data';
import { useWheelStep } from '../shared/useWheelStep';
import styles from './FlipWords.module.css';

/** flip은 480ms. animationend가 오지 않아도 여기서 잠금을 푼다. */
const SAFETY_MS = 600;
const WHEEL_THRESHOLD = 60;

// 3 -> "03"
function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function FlipWords({ active = true }: StandaloneFeatureProps) {
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
  const stageRef = useRef<HTMLDivElement>(null);

  // 보통은 animationend가 잠금을 푼다. 이 타이머는 그게 안 왔을 때를 위한 것이다.
  useEffect(() => {
    if (outgoing === null) return;
    const timer = window.setTimeout(() => setOutgoing(null), SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, [outgoing, flipId]);

  const canStep = active && !isAnimating;

  function step(direction: 1 | -1) {
    if (!canStep) return;
    setIndex((index + direction + words.length) % words.length);
  }

  // 키 리스너가 렌더마다 다시 붙지 않도록 최신 step을 ref로 읽는다.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });

  useWheelStep(stageRef, step, { enabled: canStep, threshold: WHEEL_THRESHOLD });

  useEffect(() => {
    if (!active) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        stepRef.current(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        stepRef.current(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return (
    <div className={styles.stage} ref={stageRef} onClick={() => step(1)}>
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

- `useWheelStep.ts`가 `src/features/shared/`에 새로 생겼다. flip-words는 이 훅이 무엇을 하는지 몰라도 된다.
- `canStep`이 잠금 조건을 한 곳에 모았다. 클릭·휠·키보드가 전부 같은 조건을 본다.
- `stageRef`가 `.stage`에 붙었다. 휠은 `window`가 아니라 이 요소에서만 듣는다.
- `stepRef`는 렌더마다 갱신되지만 `keydown` 리스너는 `active`가 바뀔 때만 다시 붙는다.
- 두 `useEffect` 모두 정리 함수를 반환한다. 타이머는 `clearTimeout`, 리스너는 `removeEventListener`.

## Challenge

`threshold`를 20과 200으로 바꿔 보고, 트랙패드와 마우스 휠에서 각각 어떤 값이 맞는지 찾아본다.

## Checkpoint

- [ ] 트랙패드로 한 번 세게 튕겨도 정확히 한 칸만 넘어간다
- [ ] 마우스 휠 한 칸에 정확히 한 칸 넘어간다
- [ ] 휠을 위로 올리면 이전 단어로 간다
- [ ] 방향키 아래/위로도 같은 동작을 하고, 페이지가 스크롤되지 않는다
- [ ] 애니메이션이 도는 480ms 동안에는 휠·키·클릭이 모두 무시된다

## Commit

```bash
git add -A && git commit -m "feat(w1): add wheel and keyboard input"
npm run checkpoint week1-step5
```
