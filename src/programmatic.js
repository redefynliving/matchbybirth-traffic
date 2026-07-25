import { SIGNS, SIGN_BY_KEY, signPairs, pairVerdict } from './signs.js';
import { layout, renderBody, faqHtml } from './site.js';
import { SITE, jsonLd, articleSchema, breadcrumbSchema } from './seo.js';

const link = (slug, label) => `<a href="${SITE.url}/${slug}/">${label}</a>`;

function withSchema(post) {
  return jsonLd(articleSchema(post)) + '\n' + jsonLd(breadcrumbSchema(post));
}

function pairSlug(a, b) { return `${a}-and-${b}-compatibility`; }

function pairPage(aKey, bKey) {
  const a = SIGN_BY_KEY[aKey];
  const b = SIGN_BY_KEY[bKey];
  const v = pairVerdict(aKey, bKey);
  const slug = pairSlug(aKey, bKey);
  const title = `${a.name} and ${b.name} Compatibility: How the Pair Actually Works`;
  const meta = `${a.name} and ${b.name} compatibility score ${v.score}/10. ${v.dynamic[0].toUpperCase() + v.dynamic.slice(1)} — what helps this pairing, and where it needs work.`;
  const body = renderBody(`## The short version
${v.summary}

## How ${a.name} and ${b.name} relate
${v.bullets.join('\n\n')}

## Where it clicks
In practice, ${a.name}–${b.name} pairings tend to find their groove when both name what they want instead of performing the version of themselves the other expects. ${a.name}'s ${a.trait} and ${b.name}'s ${b.trait} either compound into momentum or cancel into a standoff — the difference is usually whether you talk about it early.

## A concrete example
Say your ${a.name} partner goes quiet after a long day. That reads as distance to some signs and as normal recharge to others. The fix isn't a grand gesture; it's a shared rule like "quiet time until 8, then we reconnect." Small structure beats big guesses.

## Want the real number?
A written guide can show you the *shape* of a pairing. It can't show your actual charts. [Get your exact match score](#calculator) using both birth dates and times — that's where the percentage and the specific friction points live.

## Other pairs to explore
${SIGNS.filter((s) => s.key !== aKey && s.key !== bKey).slice(0, 4).map((s) => `- ${link(pairSlug(aKey === s.key ? bKey : aKey, aKey === s.key ? bKey : s.key), `${a.name} + ${s.name}`)}`).join('\n')}
`);
  const faq = [
    { q: `Are ${a.name} and ${b.name} compatible?`, a: `They score ${v.score}/10. ${v.tier === 'best' ? 'The pairing has a strong natural pull.' : v.tier === 'good' ? 'The pairing is workable with steady effort.' : 'The pairing is real but uneven — it needs deliberate communication.'} ${v.dynamic}.` },
    { q: `What's the main challenge for ${a.name} and ${b.name}?`, a: v.bullets[2].replace(/^Growth edge: /, '') },
    { q: `How do I check our exact compatibility?`, a: `Use the Match by Birth calculator with both birth dates and times for a detailed percentage and specific strengths.` },
  ];
  return {
    slug,
    title,
    metaDescription: meta,
    excerpt: meta,
    category: 'compatibility',
    tags: [a.key, b.key, 'compatibility', a.element, b.element],
    date: '2026-01-01',
    changefreq: 'monthly',
    priority: 0.7,
    html: layout({
      title, metaDescription: meta, slug, category: 'Compatibility', date: '2026-01-01',
      bodyHtml: body, faqHtml: faqHtml(faq), takeaways: [
        `${a.name} + ${b.name}: ${v.score}/10 — ${v.tier}.`,
        v.dynamic[0].toUpperCase() + v.dynamic.slice(1) + '.',
        'Name friction early; small structure beats big guesses.',
        'For the exact score, run both birth charts.',
      ], faq, jsonLd: withSchema({ slug, title, metaDescription: meta, date: '2026-01-01', tags: [a.key, b.key, 'compatibility'], faq }) }),
  };
}

function moonPage(sign) {
  const slug = `moon-in-${sign.key}-relationships`;
  const title = `Moon in ${sign.name}: What It Means in Relationships`;
  const meta = `How Moon in ${sign.name} shows up in love, emotional needs, and closeness — and what it wants from a partner.`;
  const body = renderBody(`## The emotional baseline
Your Moon sign is the private self — how you recharge, what makes you feel safe, and how you express needs without words. Moon in ${sign.name} carries ${sign.trait}.

## In a relationship
Someone with Moon in ${sign.name} tends to show care by ${sign.element === 'water' ? 'merging emotionally and reading the room' : sign.element === 'fire' ? 'generating warmth and wanting to be chosen' : sign.element === 'earth' ? 'showing up reliably and through actions' : 'sharing ideas and needing mental rapport'}. They feel closest when a partner respects that rhythm instead of overriding it.

## What they need from a partner
- Consistency that matches their ${sign.element} nature.
- Permission to be ${sign.trait.split(',')[0]} without it being treated as a flaw.
- Directness over guessing games.

## See the full picture
The Moon is one layer. [Your exact compatibility score](#calculator) combines Sun, Moon, Venus, and more from both birth charts.

## Related
${SIGNS.filter((s) => s.key !== sign.key).slice(0, 3).map((s) => `- ${link(`moon-in-${s.key}-relationships`, `Moon in ${s.name}`)}`).join('\n')}
`);
  const faq = [
    { q: `What does Moon in ${sign.name} want in love?`, a: `Emotional safety expressed through their ${sign.element} nature — ${sign.trait}.` },
    { q: `Is the Moon sign more important than the Sun sign?`, a: `Neither is "more" important. The Sun is the outward self; the Moon is the private emotional baseline. Compatibility reads best when both are combined.` },
  ];
  return { slug, title, metaDescription: meta, excerpt: meta, category: 'moon-signs', tags: ['moon', sign.key, sign.element], date: '2026-01-01', changefreq: 'monthly', priority: 0.6, html: layout({ title, metaDescription: meta, slug, category: 'Moon signs', date: '2026-01-01', bodyHtml: body, faqHtml: faqHtml(faq), faq, jsonLd: withSchema({ slug, title, metaDescription: meta, date: '2026-01-01', tags: ['moon', sign.key, sign.element], faq }) }) };
}

function planetInSignPage(planet, sign) {
  const slug = `${planet}-in-${sign.key}`;
  const title = `${planet[0].toUpperCase() + planet.slice(1)} in ${sign.name}: How It Shapes Love`;
  const meta = `What ${planet} in ${sign.name} means for attraction, expression, and relationship patterns.`;
  const body = renderBody(`## The pattern
${planet[0].toUpperCase() + planet.slice(1)} in ${sign.name} colors how someone expresses ${planet === 'venus' ? 'love and attraction' : 'desire and pursuit'}. With ${sign.name}'s influence, that shows up as ${sign.trait}.

## In practice
- They're drawn to ${sign.trait.split(',')[0]} energy in a partner.
- They express ${planet} through ${sign.element} modes — ${sign.element === 'water' ? 'feeling and attunement' : sign.element === 'fire' ? 'initiative and heat' : sign.element === 'earth' ? 'consistency and touch' : 'words and wit'}.
- Friction appears when that expression is misread as something it isn't.

## Put it together
One placement rarely decides a relationship. [Your exact compatibility score](#calculator) weighs this against the full chart.

## Related
${SIGNS.filter((s) => s.key !== sign.key).slice(0, 3).map((s) => `- ${link(`${planet}-in-${s.key}`, `${planet[0].toUpperCase() + planet.slice(1)} in ${s.name}`)}`).join('\n')}
`);
  const faq = [{ q: `What does ${planet} in ${sign.name} mean?`, a: `It describes how someone expresses ${planet === 'venus' ? 'love' : 'desire'} through ${sign.name}'s ${sign.element} style — ${sign.trait}.` }];
  return { slug, title, metaDescription: meta, excerpt: meta, category: planet === 'venus' ? 'venus-signs' : 'mars-signs', tags: [planet, sign.key, sign.element], date: '2026-01-01', changefreq: 'monthly', priority: 0.55, html: layout({ title, metaDescription: meta, slug, category: planet === 'venus' ? 'Venus signs' : 'Mars signs', date: '2026-01-01', bodyHtml: body, faqHtml: faqHtml(faq), faq, jsonLd: withSchema({ slug, title, metaDescription: meta, date: '2026-01-01', tags: [planet, sign.key, sign.element], faq }) }) };
}

function numerologyPage(lifePath) {
  const slug = `life-path-${lifePath}-compatibility`;
  const title = `Life Path ${lifePath} Compatibility in Numerology`;
  const meta = `How Life Path ${lifePath} connects with other numbers — what builds and what strains the bond.`;
  const body = renderBody(`## Life Path ${lifePath}
In numerology, your Life Path comes from your full birth date. A ${lifePath} tends to lead with ${lifePath <= 3 ? 'expressive, people-first energy' : lifePath <= 6 ? 'caretaking and steadiness' : lifePath <= 9 ? 'idealism and depth' : 'structural, builder energy'}.

## Best-fit numbers
Most ${lifePath}s find natural ease with numbers that share their tempo — often ${((lifePath % 9) || 9)}, ${(lifePath % 9) + 1}, and ${((lifePath + 2) % 9) || 9}. The match isn't fate; it's a starting rhythm.

## Where strain shows
Friction usually appears around pace and priority, not intent. Naming it early keeps a ${lifePath} bond from quietly resenting the other's defaults.

## Two systems, one question
Numerology and astrology ask the same question from different angles. [Your exact compatibility score](#calculator) answers it with birth charts.

## Explore more
${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== lifePath).slice(0, 4).map((n) => `- ${link(`life-path-${n}-compatibility`, `Life Path ${n}`)}`).join('\n')}
`);
  const faq = [{ q: `Who is Life Path ${lifePath} compatible with?`, a: `Often numbers that share its tempo; the real fit depends on how both people handle pace and priority. Astrology adds the birth-chart layer.` }];
  return { slug, title, metaDescription: meta, excerpt: meta, category: 'numerology', tags: ['numerology', `life-path-${lifePath}`], date: '2026-01-01', changefreq: 'monthly', priority: 0.5, html: layout({ title, metaDescription: meta, slug, category: 'Numerology', date: '2026-01-01', bodyHtml: body, faqHtml: faqHtml(faq), faq, jsonLd: withSchema({ slug, title, metaDescription: meta, date: '2026-01-01', tags: ['numerology', `life-path-${lifePath}`], faq }) }) };
}

export function programmaticPages() {
  const pages = [];
  for (const [a, b] of signPairs()) pages.push(pairPage(a, b)); // 66 pairs (12 choose 2)

  for (const s of SIGNS) pages.push(moonPage(s));
  for (const s of SIGNS) { pages.push(planetInSignPage('venus', s)); pages.push(planetInSignPage('mars', s)); }
  for (let n = 1; n <= 9; n++) pages.push(numerologyPage(n));
  return pages;
}
