import { useState } from 'react';
import Markdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import {
  STEPS_PER_WEEK,
  WEEK_FEATURE,
  findStep,
  pad2,
  stepPath,
  steps,
} from '../tutorial/loadSteps';
import styles from '../tutorial/Tutorial.module.css';

// React Router 7 will not match partial segments (`week-:week`), so the
// week-01 / step-01 shape is parsed out of whole segments here.
const WEEK_RE = /^week-(\d{2})$/;
const STEP_RE = /^step-(\d{2})$/;

const SOLUTION_WARNING =
  'Hint 2까지 보고도 30분 이상 막혔을 때만. 보고 옮겼다면 커밋 메시지 끝에 (solution).';

function parseSegment(pattern: RegExp, segment: string | undefined): number | null {
  const match = pattern.exec(segment ?? '');
  return match === null ? null : Number(match[1]);
}

/** Pulls the `- [ ]` lines out of the Checkpoint section. */
function checklistItems(section: string): string[] {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^- \[[ xX]\]/.test(line))
    .map((line) => line.slice(5).trim());
}

function Prose({ children }: { children: string }) {
  return (
    <div className={styles.prose}>
      <Markdown>{children}</Markdown>
    </div>
  );
}

export default function TutorialPage() {
  const { weekSeg, stepSeg } = useParams();
  const week = parseSegment(WEEK_RE, weekSeg);
  const step = parseSegment(STEP_RE, stepSeg);
  const current = week === null || step === null ? null : findStep(week, step);
  const tag = current?.tag ?? null;

  // 0 = hints closed, 1 = Hint 2 unlocked, 2 = Solution unlocked.
  const [revealed, setRevealed] = useState(0);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [shownTag, setShownTag] = useState<string | null>(tag);

  // Moving to another step starts the ladder and the checklist over.
  if (tag !== shownTag) {
    setShownTag(tag);
    setRevealed(0);
    setChecked({});
  }

  if (current === null) {
    return <p>404 — no such tutorial step.</p>;
  }

  const sections = current.sections;
  const feature = WEEK_FEATURE[current.week];
  const isBetween = feature === 'between';
  const index = steps.indexOf(current);
  const previous = index > 0 ? steps[index - 1] : null;
  const following = index < steps.length - 1 ? steps[index + 1] : null;
  const items = checklistItems(sections.Checkpoint ?? '');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          Week {pad2(current.week)} · Step {pad2(current.step)} / {pad2(STEPS_PER_WEEK)}
        </p>
        <h2 className={styles.title}>{current.title}</h2>
        <p className={styles.meta}>
          <span className={`${styles.badge} ${styles[`energy${current.energy}`]}`}>
            {current.energy}
          </span>
          <span className={styles.tier}>{current.tier}</span>
        </p>
        <p className={styles.fallback}>
          <span className={styles.fallbackLabel}>RED day:</span> {current.redFallback}
        </p>
      </header>

      {['Goal', 'Concept', 'Mission'].map((name) =>
        sections[name] === undefined ? null : (
          <section key={name}>
            <h3 className={styles.sectionTitle}>{name.toUpperCase()}</h3>
            <Prose>{sections[name]}</Prose>
          </section>
        ),
      )}

      {sections['Hint 1'] !== undefined && (
        <details
          key={`${current.tag}-hint1`}
          className={styles.disclosure}
          onToggle={(event) => {
            if (event.currentTarget.open) setRevealed((level) => Math.max(level, 1));
          }}
        >
          <summary className={styles.summary}>HINT 1</summary>
          <div className={styles.disclosureBody}>
            <Prose>{sections['Hint 1']}</Prose>
          </div>
        </details>
      )}

      {/* Hint 2 does not exist until Hint 1 has been opened. */}
      {revealed < 1 ? (
        <p className={styles.locked}>HINT 2 — Hint 1을 먼저 연다.</p>
      ) : (
        sections['Hint 2'] !== undefined && (
          <details
            key={`${current.tag}-hint2`}
            className={styles.disclosure}
            onToggle={(event) => {
              if (event.currentTarget.open) setRevealed((level) => Math.max(level, 2));
            }}
          >
            <summary className={styles.summary}>HINT 2</summary>
            <div className={styles.disclosureBody}>
              <Prose>{sections['Hint 2']}</Prose>
            </div>
          </details>
        )
      )}

      {/* Step 06 has no Solution at all. */}
      {sections.Solution !== undefined &&
        (revealed < 2 ? (
          <p className={styles.locked}>SOLUTION — Hint 2를 먼저 연다.</p>
        ) : (
          <details key={`${current.tag}-solution`} className={styles.disclosure}>
            <summary className={styles.summary}>SOLUTION</summary>
            <div className={styles.disclosureBody}>
              <p className={styles.warning}>{SOLUTION_WARNING}</p>
              <Prose>{sections.Solution}</Prose>
            </div>
          </details>
        ))}

      {sections.Challenge !== undefined && (
        <section>
          <h3 className={styles.sectionTitle}>CHALLENGE</h3>
          <Prose>{sections.Challenge}</Prose>
        </section>
      )}

      {items.length > 0 && (
        <section>
          <h3 className={styles.sectionTitle}>CHECKPOINT</h3>
          <ul className={styles.checklist}>
            {items.map((item, itemIndex) => (
              <li key={item}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={checked[itemIndex] ?? false}
                    onChange={() =>
                      setChecked((state) => ({ ...state, [itemIndex]: !state[itemIndex] }))
                    }
                  />
                  <span className={checked[itemIndex] ? styles.checkedItem : undefined}>
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sections.Commit !== undefined && (
        <section>
          <h3 className={styles.sectionTitle}>COMMIT</h3>
          <Prose>{sections.Commit}</Prose>
        </section>
      )}

      <footer className={styles.footer}>
        {previous === null ? <span /> : <Link to={stepPath(previous)}>← {previous.title}</Link>}
        <span className={styles.footerSpacer} />
        <Link to={isBetween ? '/lab' : `/lab/${feature}`}>/lab</Link>
        <Link to={isBetween ? '/showcase' : `/showcase/${feature}`}>/showcase</Link>
        <span className={styles.footerSpacer} />
        {following === null ? <span /> : <Link to={stepPath(following)}>{following.title} →</Link>}
      </footer>
    </div>
  );
}
