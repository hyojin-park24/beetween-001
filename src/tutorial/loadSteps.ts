export type Energy = 'RED' | 'YELLOW' | 'GREEN' | 'ANY';
export type Tier = 'MUST' | 'SHOULD';

export type Step = {
  week: number;
  step: number;
  title: string;
  energy: Energy;
  tier: Tier;
  tag: string;
  redFallback: string;
  /** Body split by `## ` heading, e.g. sections.Goal. */
  sections: Record<string, string>;
};

export type Progress = { current: string | null; at: string | null };

export const WEEKS = [1, 2, 3, 4];
export const STEPS_PER_WEEK = 6;

/** Which feature each week builds. Week 04 assembles the whole page. */
export const WEEK_FEATURE: Record<number, string> = {
  1: 'flip-words',
  2: 'time-space',
  3: 'canvas-experience',
  4: 'between',
};

// gray-matter needs Buffer, which does not exist in the browser. Rather than
// polyfilling Node for twenty lines of YAML, the frontmatter is parsed here.
function parseValue(raw: string): string {
  const quoted = /^"([^"]*)"|^'([^']*)'/.exec(raw);
  if (quoted !== null) return quoted[1] ?? quoted[2];
  const comment = raw.indexOf('#');
  return (comment === -1 ? raw : raw.slice(0, comment)).trim();
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (match === null) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    data[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1).trim());
  }
  return { data, body: raw.slice(match[0].length) };
}

// Splits on `## ` at the start of a line. Step markdown never puts one inside a
// code fence, which is the only case this would get wrong.
function splitSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  for (const part of body.split(/^## /m).slice(1)) {
    const newline = part.indexOf('\n');
    if (newline === -1) continue;
    sections[part.slice(0, newline).trim()] = part.slice(newline + 1).trim();
  }
  return sections;
}

function parseStep(raw: string): Step {
  const { data, body } = parseFrontmatter(raw);
  return {
    week: Number(data.week),
    step: Number(data.step),
    title: data.title ?? '',
    energy: (data.energy ?? 'ANY') as Energy,
    tier: (data.tier ?? 'MUST') as Tier,
    tag: data.tag ?? '',
    redFallback: data.red_fallback ?? '',
    sections: splitSections(body),
  };
}

// `as: 'raw'` is deprecated in current Vite; this is the documented equivalent.
const files = import.meta.glob('../../content/tutorial/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const steps: Step[] = Object.values(files)
  .map(parseStep)
  .sort((a, b) => a.week - b.week || a.step - b.step);

// Written by scripts/checkpoint.mjs, so it is absent until the first checkpoint.
const progressFiles = import.meta.glob('../../content/tutorial/progress.json', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function readProgress(): Progress {
  const raw = Object.values(progressFiles)[0];
  if (raw === undefined) return { current: null, at: null };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return { current: null, at: null };
    const record = parsed as Record<string, unknown>;
    return {
      current: typeof record.current === 'string' ? record.current : null,
      at: typeof record.at === 'string' ? record.at : null,
    };
  } catch {
    return { current: null, at: null };
  }
}

export const progress: Progress = readProgress();

/** week1-step3 -> 103, week1-complete -> 199, so tags sort in the order they are earned. */
function tagOrder(tag: string): number {
  const match = /^week(\d+)-(?:step(\d+)|complete)$/.exec(tag);
  if (match === null) return -1;
  return Number(match[1]) * 100 + (match[2] === undefined ? 99 : Number(match[2]));
}

const currentOrder = progress.current === null ? -1 : tagOrder(progress.current);

export function isDone(step: Step): boolean {
  return currentOrder >= 0 && tagOrder(step.tag) <= currentOrder;
}

/** The step to start next: the first one not yet tagged. */
export function nextStep(): Step | null {
  return steps.find((step) => tagOrder(step.tag) > currentOrder) ?? null;
}

export function stepsForWeek(week: number): Step[] {
  return steps.filter((step) => step.week === week);
}

export function findStep(week: number, step: number): Step | null {
  return steps.find((item) => item.week === week && item.step === step) ?? null;
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function stepPath(step: Step): string {
  return `/tutorial/week-${pad2(step.week)}/step-${pad2(step.step)}`;
}

/** The card only has room for the first sentence of the Goal, as plain text. */
export function firstSentence(text: string): string {
  const clean = text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  const end = clean.search(/[.!?](\s|$)/);
  return end === -1 ? clean : clean.slice(0, end + 1);
}
