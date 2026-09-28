import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FlipWords from '../flip-words';
import TimeSpace from '../time-space';
import CanvasExperience from '../canvas-experience';
import { useWheelStep } from '../flip-words/useWheelStep';
import styles from './Between.module.css';

/** Replace with the real repository URL once the project is published. */
const REPO_URL = '{REPO_URL}';

/** Matches --dur-section: no input is taken while the track is travelling. */
const LOCK_MS = 600;
const WHEEL_THRESHOLD = 60;

const SECTIONS = ['INTRO', 'WORDS', 'TIME × SPACE', 'CANVAS', 'END'];
const INTRO = 0;
const WORDS = 1;
const TIME_SPACE = 2;
const CANVAS = 3;
const END = 4;

/**
 * WORDS and TIME × SPACE own the wheel themselves and only hand the section
 * over through onEdge; the other three let the wheel move the page directly.
 */
const WHEEL_SECTIONS = [INTRO, CANVAS, END];

export default function Between() {
  const [index, setIndex] = useState(INTRO);
  const [entryFrom, setEntryFrom] = useState<'above' | 'below' | undefined>(undefined);
  const [locked, setLocked] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // The page itself must never scroll; the track transform is the only movement.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Each move locks input until the track has arrived.
  useEffect(() => {
    if (!locked) return;
    const timer = window.setTimeout(() => setLocked(false), LOCK_MS);
    return () => window.clearTimeout(timer);
  }, [locked]);

  // Moving down means the next section is entered from above, and vice versa.
  function goTo(next: number) {
    if (locked || next === index || next < 0 || next >= SECTIONS.length) return;
    setEntryFrom(next > index ? 'above' : 'below');
    setIndex(next);
    setLocked(true);
  }

  function step(direction: 1 | -1) {
    goTo(index + direction);
  }

  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });

  useWheelStep(viewportRef, step, {
    enabled: !locked && WHEEL_SECTIONS.includes(index),
    threshold: WHEEL_THRESHOLD,
    lockMs: LOCK_MS,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        stepRef.current(1);
      } else if (event.key === 'PageUp') {
        event.preventDefault();
        stepRef.current(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // A feature at the end of its own axis passes the section change up to us.
  function handleEdge(edge: 'start' | 'end') {
    step(edge === 'end' ? 1 : -1);
  }

  return (
    <div className={styles.viewport} ref={viewportRef}>
      <div className={styles.track} style={{ transform: `translateY(${-index * 100}vh)` }}>
        <section className={styles.section}>
          <div className={styles.intro}>
            <h1 className={styles.title}>BETWEEN</h1>
            <p className={styles.subtitle}>Interactive Portfolio Experiment #001</p>
            <p className={styles.arrow}>&darr;</p>
          </div>
        </section>

        <section className={styles.section}>
          <FlipWords active={index === WORDS} entryFrom={entryFrom} onEdge={handleEdge} />
        </section>

        <section className={styles.section}>
          <TimeSpace active={index === TIME_SPACE} entryFrom={entryFrom} onEdge={handleEdge} />
        </section>

        <section className={styles.section}>
          <CanvasExperience active={index === CANVAS} entryFrom={entryFrom} />
        </section>

        <section className={styles.section}>
          <div className={styles.end}>
            <p className={styles.endLine}>
              4주 동안 타이포그래피 중심 인터랙션 4개를 직접 다시 만들어 보는 학습 저장소.
            </p>
            <p className={styles.endLine}>Built in four weeks, one feature a week.</p>
            <p className={styles.endLine}>
              Interaction patterns inspired by Jongmin Kim (cmiscm.com).
            </p>
            <p className={styles.endLine}>{REPO_URL}</p>
            <p className={`${styles.endLine} ${styles.endLink}`}>
              <Link to="/lab">/lab 에서 내 구현 보기</Link>
            </p>
          </div>
        </section>
      </div>

      <nav className={styles.dots}>
        {SECTIONS.map((name, i) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-current={i === index}
            className={i === index ? `${styles.dot} ${styles.dotCurrent}` : styles.dot}
            onClick={(event) => {
              event.currentTarget.blur();
              goTo(i);
            }}
          />
        ))}
      </nav>
    </div>
  );
}
