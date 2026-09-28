#!/usr/bin/env node
// Generates the 12 gallery placeholders into public/placeholders/.
// Run with: npm run placeholders
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'placeholders');

// Keep in sync with src/reference/time-space/data.ts.
const years = [1996, 2008, 2020, 2026];
const places = ['Busan', 'Seoul', 'Somewhere'];

const INK = [17, 17, 17]; // --ink  #111111
const BG = [244, 243, 239]; // --bg   #F4F3EF

// Six grey steps from --ink to --bg; the whole set stays inside the palette.
function tone(step) {
  const t = step / 5;
  const channels = INK.map((from, i) => Math.round(from + (BG[i] - from) * t));
  return '#' + channels.map((c) => c.toString(16).padStart(2, '0')).join('');
}

const TONES = [0, 1, 2, 3, 4, 5].map(tone);

// Dark backgrounds get light text and vice versa.
function textColor(step) {
  return step <= 2 ? TONES[5] : TONES[0];
}

function svg(year, place, index) {
  // Two different tones per card, spread so no two cards look alike.
  const from = index % 6;
  const to = (from + 2 + (index % 3)) % 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TONES[from]}"/>
      <stop offset="1" stop-color="${TONES[to]}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)"/>
  <text x="56" y="900" font-family="Inter, system-ui, sans-serif" font-size="96" font-weight="700" letter-spacing="-4" fill="${textColor(from)}">${year}</text>
  <text x="56" y="944" font-family="Inter, system-ui, sans-serif" font-size="28" letter-spacing="2" fill="${textColor(from)}">${place.toUpperCase()}</text>
</svg>
`;
}

mkdirSync(OUT, { recursive: true });

let index = 0;
for (const year of years) {
  for (const place of places) {
    const name = `${year}-${place.toLowerCase()}.svg`;
    writeFileSync(join(OUT, name), svg(year, place, index), 'utf8');
    index += 1;
  }
}

console.log(`wrote ${index} placeholders to ${OUT}`);
