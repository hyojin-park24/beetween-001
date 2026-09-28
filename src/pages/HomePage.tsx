import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import nextMd from '../../docs/NEXT.md?raw';
import {
  WEEKS,
  firstSentence,
  isDone,
  nextStep,
  pad2,
  progress,
  stepPath,
  stepsForWeek,
} from '../tutorial/loadSteps';
import styles from '../tutorial/Tutorial.module.css';

export default function HomePage() {
  const next = nextStep();

  return (
    <div className={styles.page}>
      {next === null ? (
        <p className={styles.card}>
          Week 01 부터 Week 04 까지 모두 끝났다. Weekly Review 를 쓸 차례다.
        </p>
      ) : (
        <article className={styles.card}>
          <p className={styles.eyebrow}>
            Week {pad2(next.week)} · Step {pad2(next.step)}
          </p>
          <h2 className={styles.title}>{next.title}</h2>
          <p className={styles.meta}>
            <span className={`${styles.badge} ${styles[`energy${next.energy}`]}`}>
              {next.energy}
            </span>
            <span className={styles.tier}>{next.tier}</span>
          </p>
          <p className={styles.cardGoal}>{firstSentence(next.sections.Goal ?? '')}</p>
          <p className={styles.fallback}>
            <span className={styles.fallbackLabel}>RED day:</span> {next.redFallback}
          </p>
          <Link className={styles.start} to={stepPath(next)}>
            Start →
          </Link>
        </article>
      )}

      <h3 className={styles.sectionHeading}>NEXT.md</h3>
      <div className={styles.prose}>
        <Markdown>{nextMd}</Markdown>
      </div>

      <h3 className={styles.sectionHeading}>STEPS</h3>
      {WEEKS.map((week) => {
        const list = stepsForWeek(week);
        return (
          <section key={week}>
            <p className={styles.weekLabel}>Week {pad2(week)}</p>
            {list.length === 0 ? (
              <p className={styles.pending}>generated at kickoff</p>
            ) : (
              <ol className={styles.grid}>
                {list.map((step) => (
                  <li key={step.tag}>
                    <Link
                      className={isDone(step) ? `${styles.cell} ${styles.cellDone}` : styles.cell}
                      to={stepPath(step)}
                    >
                      <span className={styles.cellStep}>Step {pad2(step.step)}</span>
                      <span className={styles.cellTitle}>{step.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}

      {progress.current !== null && (
        <p className={styles.weekLabel}>
          last checkpoint: {progress.current}
          {progress.at === null ? '' : ` · ${progress.at}`}
        </p>
      )}
    </div>
  );
}
