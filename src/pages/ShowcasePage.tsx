import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import FlipWords from '../reference/flip-words';
import TimeSpace from '../reference/time-space';
import type { FeatureProps } from '../shared/types';

const FEATURES: Record<string, ComponentType<FeatureProps>> = {
  'flip-words': FlipWords,
  'time-space': TimeSpace,
};

export default function ShowcasePage() {
  const { feature } = useParams();

  if (feature === undefined) {
    return <p>between — reference not built yet</p>;
  }

  const Feature = FEATURES[feature];
  if (!Feature) {
    return <p>404 — no such feature.</p>;
  }

  return <Feature active />;
}
