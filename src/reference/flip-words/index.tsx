import { useEffect, useRef, useState } from 'react';
import type { StandaloneFeatureProps } from '../../shared/types';
import { words as defaultWords } from './data';
import { useWheelStep } from './useWheelStep';
import styles from './FlipWords.module.css';

export type FlipWordsProps = StandaloneFeatureProps & {
  /** Overrides the built-in word list. */
  words?: string[];
  /** Controlled mode: the parent owns the index and this feature takes no input. */
  index?: number;
};

/** The flip is 480ms; if animationend never arrives we unblock anyway. */
const SAFETY_MS = 600;
const WHEEL_THRESHOLD = 60;

// 3 -> "03"
function pad(value: number) {
  return String(value).padStart(2, '0');
}

export default function FlipWords({
  active = true,
  entryFrom,
  onEdge,
  words: wordsProp,
  index: indexProp,
}: FlipWordsProps) {
  const list = wordsProp ?? defaultWords;
  const controlled = indexProp !== undefined;

  const [internalIndex, setInternalIndex] = useState(0);
  const index = indexProp ?? internalIndex;

  // `shown` is the word in front, `outgoing` the one flipping away behind it.
  const [shown, setShown] = useState(index);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [flipId, setFlipId] = useState(0);
  const [wasActive, setWasActive] = useState(active);

  // Adjusting state while rendering (not in an effect) keeps this to one pass:
  // becoming active lands us on the edge the user came from...
  if (active !== wasActive) {
    setWasActive(active);
    if (active && !controlled && entryFrom !== undefined) {
      setInternalIndex(entryFrom === 'below' ? list.length - 1 : 0);
    }
  }

  // ...and any index change, from input or from a parent, starts exactly one flip.
  if (index !== shown) {
    setOutgoing(shown);
    setShown(index);
    setFlipId((id) => id + 1);
  }

  const isAnimating = outgoing !== null;
  const stageRef = useRef<HTMLDivElement>(null);

  // animationend normally ends the flip; this timer covers a dropped event.
  useEffect(() => {
    if (outgoing === null) return;
    const timer = window.setTimeout(() => setOutgoing(null), SAFETY_MS);
    return () => window.clearTimeout(timer);
  }, [outgoing, flipId]);

  const canStep = active && !controlled && !isAnimating;

  // One step through the list; onEdge replaces wrap-around when a parent supplies it.
  function step(direction: 1 | -1) {
    if (!canStep) return;
    const next = index + direction;
    if (next >= list.length) {
      if (onEdge) onEdge('end');
      else setInternalIndex(0);
      return;
    }
    if (next < 0) {
      if (onEdge) onEdge('start');
      else setInternalIndex(list.length - 1);
      return;
    }
    setInternalIndex(next);
  }

  // The key listener reads the latest step through a ref instead of rebinding.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });

  useWheelStep(stageRef, step, { enabled: canStep, threshold: WHEEL_THRESHOLD });

  useEffect(() => {
    if (!active || controlled) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        stepRef.current(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        stepRef.current(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, controlled]);

  return (
    <div className={styles.stage} ref={stageRef} onClick={() => step(1)}>
      <div className={styles.deck}>
        {outgoing !== null && (
          <span key={`out-${flipId}`} className={`${styles.word} ${styles.out}`} aria-hidden>
            {list[outgoing]}
          </span>
        )}
        <span
          key={`in-${flipId}`}
          className={flipId === 0 ? styles.word : `${styles.word} ${styles.in}`}
          onAnimationEnd={() => setOutgoing(null)}
        >
          {list[shown]}
        </span>
      </div>
      {!controlled && (
        <p className={styles.counter}>
          <span className={styles.currentIndex}>{pad(index + 1)}</span> / {pad(list.length)}
        </p>
      )}
    </div>
  );
}
