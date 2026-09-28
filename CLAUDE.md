# Between #001 — Project Rules

This file is read by Claude Code on every session. Rules here override conversational instructions unless the user explicitly says "override CLAUDE.md".

## What this repository is

An interactive learning project. The user (a web frontend developer) rebuilds four interactive features step by step over four weeks, following a tutorial in this repo, to learn creative coding in the style of concept-driven, typography-centered interactive work.

- `src/reference/*` — the finished reference implementation (the "answer key"). Written by Claude. **Read-only after Session 1.** Never modify unless the user asks explicitly.
- `src/features/*` — the user's own implementation. **Claude never writes application code here.** Claude may only create the initial `README.md` placeholders. The one exception: when the user asks Claude to generate tutorial content for a later week, Claude *reads* `src/features/*` to base the Solution on the user's code.
- `src/tutorial/*` — the tutorial viewer. Written by Claude.
- `content/tutorial/*` — tutorial markdown. Written by Claude. Week 01 in Session 1; later weeks generated at each weekly kickoff.
- `docs/PROJECT.md`, `docs/NEXT.md` — the user's working notes. Claude updates `NEXT.md` only through `scripts/checkpoint.mjs`.

## Hard constraints

1. **No animation libraries.** No GSAP, Framer Motion, react-spring, anime.js, lenis, etc. CSS transitions/keyframes, `requestAnimationFrame`, Canvas 2D only. This is the point of the project.
2. **No external images or fonts at runtime except Google Fonts.** Placeholder images are SVGs generated at build time into `public/placeholders/`. Fonts: Inter (Latin) and Pretendard (Korean) via `<link>` in `index.html`.
3. **No test framework.** Checkpoints in tutorial markdown are the manual tests.
4. **No state management library, no CSS framework, no component library.** React + React Router + CSS Modules only.
5. **`features` must not import from `reference`.** Enforced by ESLint `no-restricted-imports`. Do not remove that rule.
6. **TypeScript `strict: true`.** No `any`. No `@ts-ignore`.
7. **Keep the file list small.** Prefer one component file per feature plus a `data.ts`/`types.ts`. Do not create `utils/`, `helpers/`, `constants/` folders unless a file would otherwise exceed ~200 lines.

## Design tokens (fixed for all four weeks)

Defined once in `src/styles/tokens.css` and used everywhere via `var(--…)`.

```css
:root {
  --bg: #F4F3EF;
  --ink: #111111;
  --accent: #FF3D00;
  --font-latin: 'Inter', system-ui, sans-serif;
  --font-korean: 'Pretendard', 'Inter', system-ui, sans-serif;
  --size-display: clamp(48px, 12vw, 160px);
  --size-body: 14px;
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur-flip: 480ms;
  --dur-move: 500ms;
  --dur-section: 600ms;
}
```

- Accent color appears at most once per screen.
- No shadows, gradients (except generated placeholder images), icons, or borders thicker than 1px.
- Every `transition`/`animation` uses `var(--ease)` and one of the three durations.
- `@media (prefers-reduced-motion: reduce)`: flips and translates become 150ms opacity crossfades; canvas emission is reduced.

## Feature component contract

Every feature (reference and, later, the user's own) exports a default React component with this props type, declared in `src/shared/types.ts`:

```ts
export type FeatureProps = {
  active: boolean;                             // accept input only when true
  entryFrom?: 'above' | 'below';               // Week 04: set index to first/last on entry
  onEdge?: (edge: 'start' | 'end') => void;    // called instead of moving past the last/first item
};
```

Reference features must work standalone (`active` defaults to `true` when rendered outside `Between`).

## Routes

| Path | Renders |
| --- | --- |
| `/` | `HomePage` — next tutorial step card, NEXT.md contents, week/step grid |
| `/tutorial/week-:week/step-:step` | `TutorialPage` — one markdown step with progressive disclosure |
| `/showcase` | `reference/between` |
| `/showcase/:feature` | one reference feature standalone (`flip-words`, `time-space`, `canvas-experience`) |
| `/lab` | `features/between` (placeholder until built) |
| `/lab/:feature` | one user feature standalone (placeholder until built) |

## Commit and tag conventions

- Commit messages: `feat(w1): …`, `fix(w2): …`, `chore: …`. English, imperative, one line.
- Claude's own commits in Session 1 use `chore(session1): …`.
- Checkpoint tags: `week{N}-step{M}` and `week{N}-complete`. Created only by `npm run checkpoint <tag>`, never by hand.

## How to work in this repo

- Before writing a file, check whether an existing file already covers it. Do not duplicate.
- After each stage, run `npm run lint` and `npm run build`. Both must pass before reporting done.
- Report completion as a short checklist against the stage's completion criteria. Do not summarize the code.
- If a stage's instruction conflicts with this file, stop and ask.
