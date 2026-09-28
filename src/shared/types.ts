export type FeatureProps = {
  active: boolean;                             // accept input only when true
  entryFrom?: 'above' | 'below';               // Week 04: set index to first/last on entry
  onEdge?: (edge: 'start' | 'end') => void;    // called instead of moving past the last/first item
};

export const FEATURE_SLUGS = ['flip-words', 'time-space', 'canvas-experience'] as const;

export type FeatureSlug = (typeof FEATURE_SLUGS)[number];

export function isFeatureSlug(value: string | undefined): value is FeatureSlug {
  return FEATURE_SLUGS.some((slug) => slug === value);
}
