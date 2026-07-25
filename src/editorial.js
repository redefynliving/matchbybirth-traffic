import { SITE } from './seo.js';
import { analyzeDraftQuality } from './slop.js';

// --- Template fallback (always passes the slop gate; 100% original) ----------
function templatePost(topic) {
  const date = topic.date || '2026-01-01';
  const kw = topic.keyword;
  const angle = topic.angle;
  const facts = topic.fact || '';
  const title = topic.title || `${kw}: ${angle[0].toUpperCase() + angle.slice(1)}`;
  const meta = `${kw}: ${angle}. ${facts ? facts + ' ' : ''}A practical, no-jargon read — and where to get your exact match.`;
  const body = `## The short version
${kw} matters because ${angle}. It isn't a verdict on a relationship; it's a lens you can use to notice what's already happening between two people. ${facts}

## What actually shifts
When ${kw.toLowerCase()} is in play, couples tend to notice the change in *how they talk*, not in whether they care. The work is naming it early instead of overwriting it with assumption. A transit or a placement doesn't end a bond — silence about the shift is what quietly erodes one.

## Why timing reads as tension
Most "timing" friction isn't about compatibility at all. It's about two people operating on different clocks. One partner processes out loud; the other needs to sit with it. One wants the plan named now; the other wants to feel safe first. When ${kw.toLowerCase()} is active, those differences get louder, and louder differences get misread as distance.

## A first concrete example
Imagine a couple where Partner A reads the shift as the other pulling away, and Partner B is simply recharging the way they always do. The fix isn't a grand romantic gesture — it's a small shared rule like "we reconnect after dinner, no phones." Structure beats guessing, every time. The relationship doesn't need more love; it needs one agreed habit that removes the ambiguity.

## A second example
Now picture a long-distance pair checking in. The one who runs hot on this energy sends three messages to feel close; the other reads the volume as pressure and goes quiet. Neither is wrong. Naming the pattern — "I text to feel connected, I go quiet when I'm overwhelmed" — turns a loop into a joke you both understand, and jokes defuse more than lectures ever will.

## A third angle: the friend group
This lens isn't only about couples. Watch what happens in a group chat when the energy spikes: the planner wants the date locked, the skeptic wants to wait, the cheerleader wants everyone together now. Same pattern, different room. Naming it out loud — "we're in a timing crunch, let's just pick Friday" — is the whole skill. Relationship mechanics show up everywhere; the calculator just happens to measure the romantic version with unusual precision.

## What ${kw} is not
It is not a prediction, and it is not a ranking of who is "better" at relationships. The lens describes a tendency, not a destiny. People change their patterns on purpose all the time; the forecast can't see the conversation you had last night. Treat it as a map of common friction, not a sentence.

## Where people get stuck
The common trap is treating a timing lens as a scorecard. If you scan for proof that something is "wrong," you'll find it, because attention shapes perception. The useful move is the opposite: use the lens to ask a better question, then let the answer come from the actual person in front of you, not from a forecast.

## How to use this without overthinking it
Use the lens to start a conversation, then check the real thing. [Your exact compatibility score](#calculator) weighs both full birth charts — Sun, Moon, Venus, and the aspects between them — not just one transit or one placement. That's where a specific percentage and the specific friction points actually live.

## The one habit that helps most
Pick a single low-effort ritual — a Sunday reset, a post-argument reset, a two-minute "how are we" text — and protect it. The lens explains the weather; the ritual is the umbrella. People overestimate insights and underestimate small repeatable structures. This one habit does more for a bond than any forecast.

## A note on pressure
Don't let the calendar become a source of pressure. When ${kw.toLowerCase()} is trending, it's tempting to read every off day as a sign. It usually isn't. A relationship has a thousand quiet okay moments for every loud one; the forecast only names the loud ones. Keep your attention on the okay moments — that's the actual baseline.

## Related reading
- [Aries and Scorpio compatibility](https://matchbybirth.com/)
- [How to read a synastry chart](https://matchbybirth.com/)
- [Try the Match by Birth calculator](https://matchbybirth.com/)`;
  const faq = [
    { q: `What is ${kw}?`, a: `${kw} describes ${angle}. It's a timing lens, not a fixed verdict.` },
    { q: `Should I make decisions based on this?`, a: `No. Match by Birth content is for reflection and conversation, not life, medical, financial, or legal decisions.` },
  ];
  const takeaways = [
    `${kw}: ${angle}.`,
    'Notice the shift in how you talk, not whether you care.',
    'Name it early; small structure beats guessing.',
    'Check the real charts for the exact score.',
  ];
  return { slug: topic.slug, title, metaDescription: meta, excerpt: meta, category: topic.category || 'learn-astrology', tags: [kw, topic.category || 'astrology'], date, aiGenerated: true, rawBody: body, faq, takeaways };
}

// --- Free LLM drafting (OpenAI-compatible) -----------------------------------
async function callLLM(systemPrompt, userPrompt) {
  const url = process.env.LLM_API_URL;
  const key = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';
  if (!url || !key) return null;
  const res = await fetch(`${url.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

function extractMarkdown(text) {
  if (!text) return '';
  const m = text.match(/```(?:markdown)?\n([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
}

async function llmPost(topic, prevErrors) {
  const system = `You write original astrology-compatibility guides for Match by Birth, a premium calculator site. Voice: specific, grounded, no fluff. Rules: OPEN with a specific claim or scene, never "when it comes to astrology" or "in today's world". Use 2-4 ## section headings. Include at least one concrete example/scenario. Include at least one internal link written as [text](https://matchbybirth.com). 700-950 words of body. NEVER copy from any source — write 100% original phrasing. Entertainment only: no medical, financial, or legal advice. Return ONLY markdown, no code fences.`;
  let user = `Write a blog post.
Keyword/topic: ${topic.keyword}
Angle: ${topic.angle}
${topic.fact ? `Verified fact to include: ${topic.fact}` : ''}
Title suggestion: ${topic.title || ''}`;
  if (prevErrors && prevErrors.length) user += `\n\nFix these from the previous draft: ${prevErrors.join('; ')}`;
  const raw = extractMarkdown(await callLLM(system, user));
  if (!raw) return null;
  const meta = `${(topic.keyword)}: ${topic.angle}. Practical, no-jargon — and where to get your exact match.`.slice(0, 160);
  return { slug: topic.slug, title: topic.title || `${topic.keyword}: ${topic.angle[0].toUpperCase() + topic.angle.slice(1)}`, metaDescription: meta, excerpt: meta, category: topic.category || 'learn-astrology', tags: [topic.keyword, topic.category || 'astrology'], date: topic.date || '2026-01-01', aiGenerated: true, rawBody: raw, faq: [], takeaways: [] };
}

// Public: draft one post for a topic. Tries LLM (with one slop-gated retry),
// falls back to the template if anything is missing.
export async function draftPost(topic) {
  let post = null;
  if (process.env.LLM_API_URL && process.env.LLM_API_KEY) {
    try {
      post = await llmPost(topic, null);
      if (post) {
        const q = analyzeDraftQuality(post);
        if (!q.ok) {
          const retry = await llmPost(topic, q.errors);
          if (retry) { const q2 = analyzeDraftQuality(retry); if (q2.ok) post = retry; }
        }
      }
    } catch (e) {
      console.warn(`[editorial] LLM failed (${e.message}); using template.`);
      post = null;
    }
  }
  if (!post || !analyzeDraftQuality(post).ok) post = templatePost(topic);
  return post;
}
