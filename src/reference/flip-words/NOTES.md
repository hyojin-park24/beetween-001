# flip-words — NOTES

## 이 구현에서 배울 것 5개
1. 나가는 요소와 들어오는 요소를 **동시에 렌더**해야 flip이 성립한다 — 하나를 지우고 하나를 그리면 그냥 교체다.
2. `perspective`는 **부모**에, `transform-orig·`backface-visibility`는 **자식**에 — 3D 변환의 책임이 나뉘는 지점이다.
3. CSS Grid의 `grid-area: 1 / 1`로 두 요소를 같은 칸에 겹치면 `position: absolute` 없이 스택이 된다.
4. 애니메이션 중 입력을 막는 **잠금 상태(isAnimating)** 는 `outgoing !== null` 하나에서 파생시킨다 — boolean을 따로 두면 두 값이 어긋난다.
5. prop이 바뀔 때 state를 맞추는 일은 `useEffect`가 아니라 **렌더 중 조건부 setState**로 한다 (React 공식 "adjusting state while rendering").

## 자주 나는 버그와 해결 3개
1. **트랙패드 한 번에 여러 칸 넘어감** — 누적 deltaY만 보면 관성 이벤트마다 임계값을 다시 넘는다. 한 번 이동한 뒤 휠 이벤트가 `quietMs` 동안 끊길 때까지 잠그면 flick 하나에 한 칸이 된다 (`useWheelStep`).
2. **연타하면 글자가 겹치거나 사라짐** — 애니메이션이 끝나기 전에 다음 flip이 시작되면 요소가 3개 이상 쌓인다. `isAnimating` 동안 모든 입력을 무시하고, `key`에 `flipId`를 넣어 매번 새 요소로 교체한다.
3. **애니메이션이 안 끝나고 멈춤** — 탭이 백그라운드로 가면 `animationend`가 오지 않는다. 600ms `s


## RED day:
* state = useWheelStep
* CSS = FilpWords.module.css
