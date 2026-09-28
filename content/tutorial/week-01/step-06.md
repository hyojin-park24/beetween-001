---
week: 1
step: 6
title: My Variation
energy: ANY
tier: SHOULD
tag: week1-step6
red_fallback: "고칠 곳을 정하지 말고, 지금 만든 것을 30초만 만져 본 뒤 거슬리는 점 하나를 NOTES.md에 적는다. 그걸로 이번 Step은 끝이다."
---

## Goal

정답이 없는 Step이다. 지금까지 만든 flip-words를 내 것으로 바꾼다. 단어, easing, 강조색 중 최소 하나를 바꾸고 왜 그렇게 했는지 한 줄 남긴다.

## Concept

- 규격을 지킨다는 건 토큰을 바꾸지 않는다는 뜻이 아니다. `tokens.css` 한 곳만 고치면 네 화면이 같이 바뀐다 — 그게 토큰을 쓴 이유다.
- easing은 속도의 성격이다. `ease-in`은 머뭇거리다 떨어지고, `ease-out`은 튀어나와 멈춘다. 숫자가 아니라 느낌으로 고른다.
- 강조색은 화면에 하나뿐이어야 효과가 있다. 두 개가 되는 순간 둘 다 평범해진다.
- 변형을 하나 하면 Checkpoint가 하나 깨진다. 무엇이 깨졌는지 알고 깨는 것과 모르고 깨는 것은 다르다.

## Mission

`src/features/flip-words/` 안에서 아래 중 최소 하나를 바꾼다. 여러 개를 해도 된다.

- `data.ts`의 단어를 내 것으로 바꾼다. 개수가 4개가 아니어도 된다 — 인덱스 표시가 따라오는지 확인한다.
- `FlipWords.module.css`의 `.out` / `.in` easing을 바꾼다. `--ease` 토큰을 써도 되고 다른 easing을 써도 된다.
- `tokens.css`의 `--accent`를 바꾼다. 이건 `/showcase`까지 같이 바뀌므로 바꾼 뒤 네 화면을 다 본다.

그리고 `src/features/flip-words/NOTES.md`를 만들어 "무엇을 왜 바꿨는지" 한 줄, "다시 만든다면 다르게 할 것" 한 줄을 적는다. 이 파일은 Week 02 튜토리얼을 만들 때 읽는다.

## Hint 1

바꿀 곳이 떠오르지 않으면 먼저 `/showcase/flip-words`와 `/lab/flip-words`를 나란히 열고 번갈아 눌러 본다. 정답지가 더 낫다고 느껴지는 지점이 있다면 그게 첫 번째 후보다. 반대로 내 것이 더 낫다고 느껴지는 지점이 있다면 그건 이미 변형에 성공한 것이다.

## Hint 2

```css
/* 나가는 쪽을 더 빠르게, 들어오는 쪽을 더 느긋하게 */
.out {
  animation: flip-out calc(var(--dur-flip) / 3) ease-in forwards;
}

.in {
  animation: flip-in calc(var(--dur-flip) / 2) var(--ease) calc(var(--dur-flip) / 3) backwards;
}
```

## Challenge

셋 중 마음에 드는 것을 고른다. 전부 정답이 없다.

1. **글자 단위 stagger** — 단어를 글자별 `<span>`으로 쪼개고 각 글자의 `animation-delay`를 `index * 30ms`씩 밀어 물결처럼 넘어가게 한다. `calc()`로 토큰에서 유도한다.
2. **방향을 기억하는 flip** — 위로 넘길 때는 반대 방향으로 돌게 한다. `step()`이 받은 방향을 state에 담고, 클래스를 둘로 나눈다.
3. **소리 없는 피드백** — flip이 끝나는 순간 인덱스 숫자만 120ms 깜빡이게 한다. 애니메이션이 끝났다는 걸 글자 말고 다른 곳에서도 알 수 있게.

## Checkpoint

- [ ] `/lab/flip-words`가 `/showcase/flip-words`와 눈에 띄게 다르다
- [ ] 바꾼 뒤에도 연타했을 때 글자가 겹치거나 사라지지 않는다
- [ ] 화면에 강조색이 여전히 한 곳뿐이다
- [ ] `src/features/flip-words/NOTES.md`에 두 줄이 적혀 있다
- [ ] `npm run lint`와 `npm run build`가 모두 통과한다

## Commit

```bash
git add -A && git commit -m "feat(w1): make flip-words my own"
npm run checkpoint week1-complete
```
