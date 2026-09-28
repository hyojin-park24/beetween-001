# Between #001

4주 동안 타이포그래피 중심 인터랙션 4개를 직접 다시 만들어 보는 학습 저장소.

| Path | Renders |
| --- | --- |
| `/` | tutorial home |
| `/tutorial/week-NN/step-NN` | 튜토리얼 한 스텝 |
| `/showcase`, `/showcase/:feature` | `src/reference/*` (정답지) |
| `/lab`, `/lab/:feature` | `src/features/*` (내 구현) |

`:feature` = `flip-words` | `time-space` | `canvas-experience`

```bash
npm install
npm run dev                    # 개발 서버
npm run placeholders           # public/placeholders/*.svg 다시 생성
npm run lint && npm run build  # 검사
npm run checkpoint week1-step1 # 태그 + progress.json + NEXT.md 갱신 후 커밋
```

## How to follow the tutorial

1. `npm run dev` 후 `/`를 연다. 맨 위 카드가 오늘 할 Step 하나를 가리킨다.
2. Start를 눌러 Step으로 간다. Goal·Concept·Mission만 읽고 먼저 직접 해 본다.
3. 막히면 Hint 1 → Hint 2 순서로 연다. Solution은 Hint 2를 열어야 나타난다.
4. Checkpoint 항목을 브라우저에서 하나씩 눈으로 확인하고 체크한다.
5. 통과하면 Commit 섹션의 커밋 메시지로 커밋하고 `npm run checkpoint <tag>`를 돌린다. 태그가 붙고 `content/tutorial/progress.json`과 `docs/NEXT.md`가 다음 Step을 가리키게 갱신된 뒤 `chore: checkpoint <tag>`로 커밋된다.

`npm run checkpoint`은 **작업 트리가 깨끗할 때만** 돈다. 커밋하지 않은 변경이 남아 있거나 같은 이름의 태그가 이미 있으면 아무것도 하지 않고 종료 코드 1로 멈춘다. 태그는 이 명령으로만 만든다 — 손으로 `git tag` 하지 않는다.

에너지가 RED인 날은 Step을 건너뛰지 말고 카드의 `RED day:` 한 줄만 한다. 그것도 진도다.

`src/reference` 는 읽기 전용, `src/features` 는 직접 쓰는 곳, `content/tutorial` 은 튜토리얼 markdown, `docs/` 는 작업 노트.
