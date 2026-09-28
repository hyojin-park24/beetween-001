import { useEffect, useRef, type RefObject } from 'react';

export type WheelStepOptions = {
  /** While false the accumulator is cleared and no step is emitted. */
  enabled?: boolean;
  /** How much deltaY has to pile up before one step fires. */
  threshold?: number;
  /** Hard cooldown after a step, on top of the burst rule. */
  lockMs?: number;
  /** A gap this long means the previous trackpad flick has ended. */
  quietMs?: number;
};

type WheelState = { acc: number; blocked: boolean; unlockAt: number; lastAt: number };

/**
 * Turns raw wheel events into single steps.
 *
 * A mouse wheel sends a few large deltas, a trackpad sends a long burst of tiny
 * ones, so counting deltaY alone would fire several times per flick. After a
 * step we stay blocked until the burst stops for `quietMs`, which is what makes
 * one trackpad flick move exactly one item.
 */
export function useWheelStep(
  targetRef: RefObject<HTMLElement | null>,
  onStep: (direction: 1 | -1) => void,
  options: WheelStepOptions = {},
): void {
  const { enabled = true, threshold = 60, lockMs = 0, quietMs = 140 } = options;

  const stateRef = useRef<WheelState>({ acc: 0, blocked: false, unlockAt: 0, lastAt: 0 });
  const onStepRef = useRef(onStep);
  const enabledRef = useRef(enabled);

  // Keep the latest callback and flag without rebinding the listener every render.
  useEffect(() => {
    onStepRef.current = onStep;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    const element = targetRef.current;
    if (element === null) return;

    function handleWheel(event: WheelEvent) {
      const state = stateRef.current;
      const now = event.timeStamp;

      // A long enough gap means a new gesture, so the old burst no longer counts.
      if (now - state.lastAt > quietMs) {
        state.blocked = false;
        state.acc = 0;
      }
      state.lastAt = now;

      // Still listening while disabled: that keeps a running burst from leaking
      // a step the moment the feature is enabled again.
      if (!enabledRef.current) {
        state.acc = 0;
        return;
      }

      event.preventDefault();
      if (state.blocked || now < state.unlockAt) return;

      state.acc += event.deltaY;
      if (Math.abs(state.acc) < threshold) return;

      const direction = state.acc > 0 ? 1 : -1;
      state.acc = 0;
      state.blocked = true;
      state.unlockAt = now + lockMs;
      onStepRef.current(direction);
    }

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [targetRef, threshold, lockMs, quietMs]);
}
