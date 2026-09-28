import { Suspense, lazy, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isFeatureSlug, type FeatureProps } from '../shared/types';

type FeatureModule = { default: ComponentType<FeatureProps> };

// Empty until the user writes src/features/<slug>/index.tsx — the build must not care.
const modules = import.meta.glob('../features/*/index.tsx') as Record<
  string,
  () => Promise<FeatureModule>
>;

const FEATURES: Record<string, ComponentType<FeatureProps>> = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => [path.split('/')[2], lazy(loader)]),
);

export default function LabPage() {
  const { feature } = useParams();

  if (feature !== undefined && !isFeatureSlug(feature)) {
    return <p>404 — no such feature.</p>;
  }

  const Feature = FEATURES[feature ?? 'between'];

  if (!Feature) {
    return (
      <p>
        Not built yet. Go to{' '}
        <Link to="/tutorial/week-01/step-01">/tutorial/week-01/step-01</Link>
      </p>
    );
  }

  return (
    <Suspense fallback={<p>loading…</p>}>
      <Feature active />
    </Suspense>
  );
}
