import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const calendar = require('./topics-2026.json');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, '.published.json');

const LEAD_DAYS = 10; // publish seasonal posts this many days before the event

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { published: [] }; }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// Build a deterministic schedule: seasonal events sorted by (eventDate - LEAD),
// with evergreen topics interleaved in the gaps.
function buildSchedule() {
  const seasonal = calendar.events.map((e) => {
    const target = new Date(e.date);
    target.setDate(target.getDate() - LEAD_DAYS);
    return { ...e, target: target.toISOString().slice(0, 10), kind: 'seasonal' };
  }).sort((a, b) => a.target.localeCompare(b.target));

  const evergreen = calendar.evergreen.map((e) => ({ ...e, target: '', kind: 'evergreen' }));
  const master = [...seasonal];
  const step = Math.max(1, Math.floor(seasonal.length / (evergreen.length + 1)));
  evergreen.forEach((e, i) => master.splice(Math.min(master.length, i * step + i + 1), 0, e));
  return master;
}

// Pick the next topic for `today`. Prefers a seasonal topic whose target == today,
// else the earliest unpublished topic, else null. Dedup: no repeat within 60 days.
export function nextTopic(today = new Date().toISOString().slice(0, 10)) {
  const state = loadState();
  const recent = new Set(
    state.published
      .filter((p) => daysBetween(p.date, today) < 60)
      .map((p) => p.slug),
  );
  const schedule = buildSchedule();
  const eligible = schedule.filter((t) => !recent.has(t.slug));
  const todays = eligible.find((t) => t.kind === 'seasonal' && t.target === today);
  if (todays) return { topic: todays, state };
  const next = eligible[0];
  if (next) return { topic: next, state };
  return { topic: null, state };
}

export function markPublished(slug, today) {
  const state = loadState();
  if (!state.published.find((p) => p.slug === slug)) {
    state.published.push({ slug, date: today });
    saveState(state);
  }
}

export function publishedCount() {
  return loadState().published.length;
}
