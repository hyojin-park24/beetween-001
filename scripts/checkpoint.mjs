#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NEXT_MD = join(ROOT, 'docs', 'NEXT.md');
const PROGRESS = join(ROOT, 'content', 'tutorial', 'progress.json');
const NAME_RE = /^week(\d{1,2})-(?:step(\d{1,2})|complete)$/;
const LAST_STEP = 6;

function die(message) {
  console.error(message);
  process.exit(1);
}

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Reads `title:` out of a YAML frontmatter block. Node builtins only, so no gray-matter here.
function readTitle(file) {
  if (!existsSync(file)) return null;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') break;
    const match = /^title:\s*(.+?)\s*$/.exec(lines[i]);
    if (match) return match[1].replace(/^['"]|['"]$/g, '');
  }
  return null;
}

const name = process.argv[2];
const parsed = name ? NAME_RE.exec(name) : null;
if (!parsed) {
  die('usage: npm run checkpoint <week{N}-step{M}|week{N}-complete>\n   e.g. npm run checkpoint week1-step3');
}

const week = Number(parsed[1]);
const step = parsed[2] === undefined ? null : Number(parsed[2]);

if (git('status', '--porcelain').trim() !== '') {
  die('working tree is dirty — commit first, then run checkpoint.');
}

if (git('tag', '--list', name).trim() !== '') {
  die(`tag "${name}" already exists.`);
}

git('tag', name);
console.log(`tagged ${name}`);

mkdirSync(dirname(PROGRESS), { recursive: true });
writeFileSync(PROGRESS, `${JSON.stringify({ current: name, at: today() }, null, 2)}\n`, 'utf8');

// Point NEXT START at the next step, or at the weekly review when the week is done.
let nextLine = null;
if (step === null || step >= LAST_STEP) {
  nextLine = '**Weekly Review 를 쓴다.**';
} else {
  const nextStep = step + 1;
  const file = join(ROOT, 'content', 'tutorial', `week-${pad(week)}`, `step-${pad(nextStep)}.md`);
  const title = readTitle(file);
  if (title === null) {
    console.warn(`warning: no title found in ${file} — leaving NEXT START unchanged.`);
  } else {
    nextLine = `**/tutorial/week-${pad(week)}/step-${pad(nextStep)} — ${title} 부터 시작한다.**`;
  }
}

if (nextLine !== null) {
  const lines = readFileSync(NEXT_MD, 'utf8').split(/\r?\n/);
  const head = lines.findIndex((line) => line.trim() === '## ▶ NEXT START');
  const target = head === -1 ? -1 : lines.findIndex((line, i) => i > head && line.trim().startsWith('**'));
  if (target === -1) {
    console.warn('warning: no bold line under "## ▶ NEXT START" — leaving NEXT.md unchanged.');
  } else {
    lines[target] = nextLine;
    writeFileSync(NEXT_MD, lines.join('\n'), 'utf8');
    console.log(`NEXT START -> ${nextLine}`);
  }
}

git('add', '--', PROGRESS, NEXT_MD);
git('commit', '-m', `chore: checkpoint ${name}`);
console.log(`committed: chore: checkpoint ${name}`);
