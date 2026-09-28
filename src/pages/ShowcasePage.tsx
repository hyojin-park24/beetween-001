import { useParams } from 'react-router-dom';
import { isFeatureSlug } from '../shared/types';

export default function ShowcasePage() {
  const { feature } = useParams();

  if (feature !== undefined && !isFeatureSlug(feature)) {
    return <p>404 — no such feature.</p>;
  }

  return <p>{feature ?? 'between'} — reference not built yet (Stage 2)</p>;
}
