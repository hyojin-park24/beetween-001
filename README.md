# Between #001

4주 동안 타이포그래피 중심 인터랙션 4개를 직접 다시 만들어 보는 학습 저장소.

| Path | Renders |
| --- | --- |
| `/` | tutorial home |
| `/tutorial/week-:week/step-:step` | 튜토리얼 한 스텝 |
| `/showcase`, `/showcase/:feature` | `src/reference/*` (정답지) |
| `/lab`, `/lab/:feature` | `src/features/*` (내 구현) |

`:feature` = `flip-words` | `time-space` | `canvas-experience`

```bash
npm install
npm run dev                    # 개발 서버
npm run lint && npm run build  # 검사
npm run checkpoint week1-step1 # 태그 + progress.json + NEXT.md 갱신 후 커밋
```

`src/reference` 는 읽기 전용, `src/features` 는 직접 쓰는 곳, `content/tutorial` 은 튜토리얼 markdown, `docs/` 는 작업 노트.
