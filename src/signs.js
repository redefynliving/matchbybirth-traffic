// Zodiac sign dataset + deterministic compatibility verdicts.
// Verdicts are computed from element dynamics + a stable per-pair hash, so
// every page is original (never scraped or copied) and reproducible.

export const SIGNS = [
  { key: 'aries', name: 'Aries', symbol: '♈', element: 'fire', dates: 'Mar 21 – Apr 19', trait: 'bold, impulsive, and quick to initiate' },
  { key: 'taurus', name: 'Taurus', symbol: '♉', element: 'earth', dates: 'Apr 20 – May 20', trait: 'steady, sensory, and loyal to what they trust' },
  { key: 'gemini', name: 'Gemini', symbol: '♊', element: 'air', dates: 'May 21 – Jun 20', trait: 'curious, verbal, and endlessly adaptable' },
  { key: 'cancer', name: 'Cancer', symbol: '♋', element: 'water', dates: 'Jun 21 – Jul 22', trait: 'nurturing, protective, and deeply emotional' },
  { key: 'leo', name: 'Leo', symbol: '♌', element: 'fire', dates: 'Jul 23 – Aug 22', trait: 'expressive, proud, and generously warm' },
  { key: 'virgo', name: 'Virgo', symbol: '♍', element: 'earth', dates: 'Aug 23 – Sep 22', trait: 'precise, helpful, and quietly observant' },
  { key: 'libra', name: 'Libra', symbol: '♎', element: 'air', dates: 'Sep 23 – Oct 22', trait: 'diplomatic, aesthetic, and partnership-driven' },
  { key: 'scorpio', name: 'Scorpio', symbol: '♏', element: 'water', dates: 'Oct 23 – Nov 21', trait: 'intense, private, and quietly magnetic' },
  { key: 'sagittarius', name: 'Sagittarius', symbol: '♐', element: 'fire', dates: 'Nov 22 – Dec 21', trait: 'adventurous, candid, and freedom-loving' },
  { key: 'capricorn', name: 'Capricorn', symbol: '♑', element: 'earth', dates: 'Dec 22 – Jan 19', trait: 'ambitious, disciplined, and pragmatic' },
  { key: 'aquarius', name: 'Aquarius', symbol: '♒', element: 'air', dates: 'Jan 20 – Feb 18', trait: 'independent, inventive, and humanitarian' },
  { key: 'pisces', name: 'Pisces', symbol: '♓', element: 'water', dates: 'Feb 19 – Mar 20', trait: 'empathetic, imaginative, and fluid' },
];

export const SIGN_BY_KEY = Object.fromEntries(SIGNS.map((s) => [s.key, s]));

// Stable base score by sorted element pair (1-10).
const ELEMENT_SCORE = {
  'fire+fire': 9,
  'earth+earth': 9,
  'air+air': 9,
  'water+water': 9,
  'air+fire': 8,
  'earth+water': 8,
  'air+water': 6,
  'earth+fire': 6,
  'earth+air': 5,
  'water+fire': 5,
};

const ELEMENT_DYNAMIC = {
  'fire+fire': 'two ignited signs move fast and feed each other’s momentum',
  'earth+earth': 'two grounded signs build something durable and low-drama',
  'air+air': 'two air signs live in Ideas and keep each other mentally alive',
  'water+water': 'two water signs share an unspoken emotional current',
  'air+fire': 'air feeds fire’s momentum; fire gives air somewhere to aim',
  'earth+water': 'earth holds water; water softens earth’s edges',
  'air+water': 'air wants to talk it through; water wants to feel it through',
  'earth+fire': 'fire wants speed; earth wants proof before it moves',
  'earth+air': 'earth wants substance; air wants possibility',
  'water+fire': 'fire wants to act; water wants to absorb — pacing is the work',
};

function elementPair(a, b) {
  return [a.element, b.element].sort().join('+');
}

// Deterministic small delta (-1..+1) from pair key so each pairing is unique.
function pairDelta(aKey, bKey) {
  let h = 0;
  const s = `${aKey}|${bKey}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ((h % 3) - 1); // -1, 0, 1
}

function tierFor(score) {
  if (score >= 8) return 'best';
  if (score >= 6) return 'good';
  return 'challenging';
}

export function pairVerdict(aKey, bKey) {
  const a = SIGN_BY_KEY[aKey];
  const b = SIGN_BY_KEY[bKey];
  if (!a || !b) throw new Error(`Unknown sign: ${aKey} ${bKey}`);
  const ep = elementPair(a, b);
  const base = ELEMENT_SCORE[ep] ?? 6;
  const score = Math.max(1, Math.min(10, base + pairDelta(aKey, bKey)));
  const tier = tierFor(score);
  const dynamic = ELEMENT_DYNAMIC[ep] ?? 'these two signs meet at a different tempo';
  const summary =
    `${a.name} and ${b.name} score a ${score}/10. ${dynamic}, ` +
    `which gives the bond a ${tier === 'best' ? 'strong natural pull' : tier === 'good' ? 'workable, steady rhythm' : 'real but uneven edge'}. ` +
    `It works best when ${a.name}’s ${a.trait.split(',')[0]} energy and ${b.name}’s ${b.trait.split(',')[0]} energy are pointed at the same goal.`;
  const bullets = [
    `${a.element[0].toUpperCase() + a.element.slice(1)} and ${b.element} elements: ${dynamic}.`,
    `Strength: ${a.name} brings ${a.trait}, while ${b.name} contributes ${b.trait}.`,
    tier === 'challenging'
      ? `Growth edge: bridge ${a.name}’s need for ${a.trait.split(',')[0]} with ${b.name}’s pull toward ${b.trait.split(',')[0]}.`
      : `Growth edge: don’t coast on natural ease — name the quiet friction before it hardens.`,
  ];
  return { score, tier, summary, bullets, dynamic };
}

// Unique unordered pairs (78).
export function signPairs() {
  const pairs = [];
  for (let i = 0; i < SIGNS.length; i++) {
    for (let j = i + 1; j < SIGNS.length; j++) {
      pairs.push([SIGNS[i].key, SIGNS[j].key]);
    }
  }
  return pairs;
}
