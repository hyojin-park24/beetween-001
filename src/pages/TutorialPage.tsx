import { useParams } from 'react-router-dom';

// React Router 7 will not match partial segments (`week-:week`), so the
// week-01 / step-01 shape is parsed out of whole segments here.
const WEEK_RE = /^week-(\d{2})$/;
const STEP_RE = /^step-(\d{2})$/;

export default function TutorialPage() {
  const { weekSeg, stepSeg } = useParams();
  const week = WEEK_RE.exec(weekSeg ?? '')?.[1];
  const step = STEP_RE.exec(stepSeg ?? '')?.[1];

  if (week === undefined || step === undefined) {
    return <p>404 — no such tutorial step.</p>;
  }

  return (
    <p>
      Tutorial placeholder — week {week}, step {step} (Stage 3)
    </p>
  );
}
