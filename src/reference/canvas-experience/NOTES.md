# canvas-experience — NOTES

## 이 구현에서 배울 것 5개
1. 파티클은 **React state가 아니라 `useRef` 배열**에 둔다 — 60fps로 setState하면 초당 60번 리렌더가 난다. 화면은 canvas가 그리고 React는 관여하지 않는다.
2. **object pool + 링 버퍼** — 고정 길이 600짜리 배열을 재사용하고 `head`를 굴리면 할당이 0이고, 넘칠 때 가장 오래된 것부터 자동으로 덮어쓴다.
3. canvas의 **CSS 크기(`clientWidth`)와 백킹 스토어 크기(`width`)는 다른 값**이다. `width = clientWidth × dpr` + `ctx.scale(dpr, dpr)`이 레티나 선명도의 전부다.
4. 프레임마다 쓰는 상수(`0.96`, `0.012`)는 60fps 기준이므로 `frames = dt / 16.67`로 **보정**해야 120Hz에서도 같은 속도로 보인다. 감쇠는 곱이라 `0.96 ** frames`.
5. `--ink`·`--accent` 같은 토큰은 `getComputedStyle`로 **한 번만 읽어 캐시**한다 — 프레임마다 읽으면 스타일 재계산이 걸린다.

## 자주 나는 버그와 해결 3개
1. **resize 할 때마다 그림이 점점 커짐** — `ctx.scale(dpr, dpr)`이 누적된 것이다. `canvas.width`에 값을 대입하면 컨텍스트가 초기화되므로, 반드시 **크기 대입 직후에** scale을 부른다 (또는 `setTransform`을 쓴다).
2. **탭을 갔다 오면 파티클이 한순간에 사라짐** — rAF가 멈춘 동안의 시간이 dt에 한꺼번에 들어온다. `dt`를 32ms로 clamp한다.
3. **섹션을 떠나도 루프가 계속 돌아 배터리를 먹음** — `useEffect`의 deps에 `active`를 넣고 cleanup에서 `cancelAnimationFrame` + 리스너 해제 + `clearRect`까지 한다. 파티클 배열은 ref라 살아남으므로 상태는 잃지 않는다.
