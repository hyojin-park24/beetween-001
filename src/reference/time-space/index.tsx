import { useEffect, useRef, useState, type PointerEvent, type MouseEvent } from 'react';
import FlipWords from '../flip-words';
import { useWheelStep } from '../flip-words/useWheelStep';
import type { StandaloneFeatureProps } from '../../shared/types';
import { items, places, years } from './data';
import styles from './TimeSpace.module.css';

/** Matches --dur-move: input stays locked for the length of one transition. */
const LOCK_MS = 500;
const WHEEL_THRESHOLD = 60;
/** How far a horizontal drag has to travel to count as one place step. */
const DRAG_STEP_PX = 80;
/** Past this the gesture was a drag, so the click that follows is not real. */
const DRAG_SLOP_PX = 5;

const yearWords = years.map(String);

type Drag = { x: number; moved: number };

export default function TimeSpace({ active = true, entryFrom, onEdge }: StandaloneFeatureProps) {
  const [yearIndex, setYearIndex] = useState(0);
  const [placeIndex, setPlaceIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wasActive, setWasActive] = useState(active);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const suppressClickRef = useRef(false);

  // Entering from a neighbouring section lands on the far end of the year axis.
  if (active !== wasActive) {
    setWasActive(active);
    if (active && entryFrom !== undefined) {
      setYearIndex(entryFrom === 'below' ? years.length - 1 : 0);
    }
  }

  // Every move locks input until the cards have finished travelling.
  useEffect(() => {
    if (!locked) return;
    const timer = window.setTimeout(() => setLocked(false), LOCK_MS);
    return () => window.clearTimeout(timer);
  }, [locked]);

  const canMove = active && !locked;

  // The wheel walks the year axis; it stops at both ends and reports them.
  function stepYear(direction: 1 | -1) {
    if (!canMove) return;
    const next = yearIndex + direction;
    if (next < 0) {
      if (onEdge) onEdge('start');
      return;
    }
    if (next >= years.length) {
      if (onEdge) onEdge('end');
      return;
    }
    setYearIndex(next);
    setLocked(true);
  }

  // Arrows and horizontal drags walk the place axis; it simply stops at the ends.
  function stepPlace(direction: 1 | -1) {
    if (!canMove) return;
    const next = placeIndex + direction;
    if (next < 0 || next >= places.length) return;
    setPlaceIndex(next);
    setLocked(true);
  }

  const stepPlaceRef = useRef(stepPlace);
  useEffect(() => {
    stepPlaceRef.current = stepPlace;
  });

  useWheelStep(stageRef, stepYear, {
    enabled: canMove,
    threshold: WHEEL_THRESHOLD,
    lockMs: LOCK_MS,
  });

  useEffect(() => {
    if (!active) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepPlaceRef.current(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepPlaceRef.current(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!active) return;
    // Capture so the gesture still ends correctly if the pointer leaves the stage.
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, moved: 0 };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag === null) return;
    drag.moved = Math.max(drag.moved, Math.abs(event.clientX - drag.x));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag === null) return;
    suppressClickRef.current = drag.moved >= DRAG_SLOP_PX;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) >= DRAG_STEP_PX) stepPlace(distance < 0 ? 1 : -1);
  }

  // A drag that moved must not also read as a click on whatever sits underneath.
  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      {items.map((item) => {
        // Distance from the active cell, in grid steps on each axis.
        const dx = places.indexOf(item.place) - placeIndex;
        const dy = years.indexOf(item.year) - yearIndex;
        const distance = Math.abs(dx) + Math.abs(dy);
        const isActive = distance === 0;
        return (
          <figure
            key={item.id}
            className={styles.card}
            style={{
              transform: `translate(${dx * 70}vw, ${dy * 70}vh) scale(${(0.8 ** distance).toFixed(3)})`,
              opacity: isActive ? 1 : 0.35 / distance,
              visibility: distance >= 3 ? 'hidden' : 'visible',
            }}
          >
            <div className={isActive ? `${styles.inner} ${styles.pulse}` : styles.inner}>
              <img className={styles.image} src={item.src} alt={item.title} draggable={false} />
            </div>
          </figure>
        );
      })}

      <div className={styles.year}>
        <FlipWords words={yearWords} index={yearIndex} />
      </div>

      <p className={styles.place}>{places[placeIndex]}</p>

      <div className={styles.axis}>
        <span className={styles.axisLine} />
        <span
          className={styles.axisDot}
          style={{ left: `${(yearIndex / (years.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
