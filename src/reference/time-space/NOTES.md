# time-space — NOTES

## 이 구현에서 배울 것 5개
1. 카드 12장을 **전부 DOM에 두고 transform만 바꾼다** — 마운트/언마운트가 없으니 이미지 재로딩도, 레이아웃 재계산도 없다.
2. 위치를 `dx`, `dy` 두 정수로 환산하고 `d = |dx| + |dy|` 하나로 **scale·opacity·visibility를 전부 파생**시키면 상태가 두 개(연도·장소)뿐이다.
3. `visibility: hidden`(d ≥ 3)은 `display: none`과 달리 **transition을 끊지 않으면서** 페인트를 건너뛴다.
4. CSS 커스텀 프로퍼티(`--flip-size`, `--flip-align`)는 CSS Modules 경계를 넘는 **컴포넌트의 스타일 API**가 된다.
5. 같은 컴포넌트를 uncontrolled(스스로 index 관리)와 controlled(부모가 index 관리) **두 모드로 쓰는 법** — `index` prop의 유무로 갈린다.

## 자주 나는 버그와 해결 3개
1. **drag 끝에 원치 않는 click이 따라옴** — pointerup 뒤 브라우저가 click을 또 쏜다. 이동 거리가 5px 이상이면 플래그를 세우고 `onClickCapture`에서 `stopPropagation()`으로 잡는다.
2. **드래그 도중 포인터가 영역을 벗어나면 gesture가 끊김** — `setPointerCapture(pointerId)`로 포인터를 붙잡아 두면 바깥에서 뗀 pointerup도 받는다. 이미지에는 `draggable={false}`를 줘야 네이티브 드래그가 가로채지 않는다.
3. **휠 한 번에 연도가 두 칸씩 넘어감** — 전환이 500ms인데 잠금이 없으면 관성 이벤트가 그 사이에 또 임계값을 넘긴다. `useWheelStep`의 `lockMs`와 `locked` 상태를 둘 다 `--dur-move`에 맞춘다.
