// Slop / quality gate. Ported logic from MatchByBirth's content-quality scanner,
// adapted to a plain object so the traffic engine can reuse the same bar.

const GENERIC_PHRASES = [
  /\bwhen it comes to\b/i,
  /\bit'?s important to note\b/i,
  /\bin today'?s (fast[- ]paced )?world\b/i,
  /\bwhether you'?re\b/i,
  /\blet'?s dive in\b/i,
  /\bdelve into\b/i,
  /\bunlock the secrets\b/i,
  /\bjourney of self[- ]discovery\b/i,
  /\bat the end of the day\b/i,
  /\bcommunication is key\b/i,
  /\bopen communication\b/i,
  /\bmeaningful connection\b/i,
  /\bdeep dive\b/i,
  /\bcosmic blueprint\b/i,
  /\bultimate guide\b/i,
];

const WEAK_INTRO_PATTERNS = [
  /^\s*(compatibility|astrology|numerology|relationships)\s+(is|can be|has long been)\b/i,
  /^\s*in today'?s\b/i,
  /^\s*when it comes to\b/i,
  /^\s*have you ever wondered\b/i,
  /^\s*whether you'?re\b/i,
];

function stripMarkup(v) {
  return String(v || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[^\]]+\]\(([^)]+)\)/g, ' $1 ')
    .replace(/[#*_>`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wordCount(v) {
  const t = stripMarkup(v);
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
}

function firstParagraph(body) {
  return String(body || '')
    .split(/\n\s*\n/)
    .map((p) => stripMarkup(p))
    .find(Boolean) || '';
}

function getHeadings(body) {
  const md = [...String(body || '').matchAll(/^\s{0,3}#{2,3}\s+(.+)$/gm)].map((m) => stripMarkup(m[1]).toLowerCase());
  const html = [...String(body || '').matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].map((m) => stripMarkup(m[1]).toLowerCase());
  return [...md, ...html];
}

function repeatedParagraphStarts(body) {
  const starts = new Map();
  String(body || '')
    .split(/\n\s*\n/)
    .map(stripMarkup)
    .filter((p) => wordCount(p) >= 20)
    .forEach((p) => {
      const start = p.split(/\s+/).slice(0, 4).join(' ').toLowerCase();
      starts.set(start, (starts.get(start) || 0) + 1);
    });
  return [...starts.entries()].filter(([, c]) => c > 1).map(([s]) => s);
}

function hasExample(body) {
  return /\b(for example|example:|simple example|imagine|if one person|if someone|a pairing like|scenario|say your)\b/i.test(body);
}

function hasInternalLink(body) {
  return /matchbybirth\.com|\(#calculator\)|\/blog\/|\.\/blog\//i.test(body);
}

export function analyzeDraftQuality(input, options = {}) {
  const minWords = options.minWords || 650;
  const body = typeof input.rawBody === 'string' && input.rawBody.trim() ? input.rawBody : (input.body || '');
  const words = wordCount(body);
  const intro = firstParagraph(body);
  const headings = getHeadings(body);
  const dupHeadings = headings.filter((h, i) => headings.indexOf(h) !== i);
  const generic = GENERIC_PHRASES.filter((p) => p.test(body)).map((p) => p.source);
  const paraRepeats = repeatedParagraphStarts(body);
  const errors = [];
  const warnings = [];
  const flags = [];

  if (!input?.title || stripMarkup(input.title).length < 8) errors.push('Title is missing or too short.');
  if (input?.title && stripMarkup(input.title).length > 90) errors.push('Title must stay under 90 characters.');
  if (input?.metaDescription && (stripMarkup(input.metaDescription).length < 80 || stripMarkup(input.metaDescription).length > 160)) {
    errors.push('Meta description must be 80-160 characters.');
  }
  if (input?.excerpt && (stripMarkup(input.excerpt).length < 80 || stripMarkup(input.excerpt).length > 220)) {
    errors.push('Excerpt must be 80-220 characters.');
  }
  if (words < minWords) errors.push(`Body is too short. Minimum is ${minWords} words.`);
  if (!hasInternalLink(body)) errors.push('Body needs at least one Match by Birth internal link.');
  if (!hasExample(body)) errors.push('Body needs at least one concrete example or scenario.');
  if (WEAK_INTRO_PATTERNS.some((p) => p.test(intro))) errors.push('Intro starts too generic. Open with a specific claim, scene, or tension.');
  if (generic.length >= 3) errors.push('Body has too many generic AI-style phrases.');
  else if (generic.length > 0) warnings.push('Body contains generic phrases to rewrite.');
  if (dupHeadings.length > 0) errors.push(`Duplicate headings found: ${[...new Set(dupHeadings)].join(', ')}.`);
  if (paraRepeats.length > 0) warnings.push('Repeated paragraph openings make the post feel templated.');
  if (headings.length > 0 && headings.length < 3) warnings.push('Article has very few sections for a guide-style post.');

  for (const m of [...errors, ...warnings]) flags.push(m);
  return { ok: errors.length === 0, errors, warnings, flags, metrics: { wordCount: words, headingCount: headings.length, genericPhraseCount: generic.length, repeatedParagraphStarts: paraRepeats.length } };
}
