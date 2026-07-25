# Match by Birth — Astrology Traffic Engine

A **free, autonomous SEO engine** that ranks for high-intent astrology/compatibility
searches and funnels traffic to the paid Match by Birth calculator
(https://matchbybirth.com, $9.99/mo). Hosted free on GitHub Pages, built by
GitHub Actions. No VPS, no budget.

## What it publishes
- **Programmatic pages** (no LLM, instant): 78 sign-pair pages, 12 moon signs,
  12 Venus signs, 12 Mars signs, 9 numerology life paths (~123 pages) — all
  internally linked to the premium calculator.
- **One editorial post/day** scheduled on the **verified 2026 astrology calendar**
  (Neptune→Aries Jan 26, Venus retrograde Oct 3, eclipses, Mercury retrogrades,
  etc.) plus an evergreen pool. Drafted by a free LLM when a key is present, or
  by an original built-in template otherwise — so it **always runs**, even with
  zero keys.

## Quality & legality
- Every post passes a **slop/plagiarism gate** (ported from MatchByBirth's
  content scanner): min word count, no generic AI phrases, required example,
  required internal link, no weak intros.
- Original phrasing only — the generator never scrapes or copies.
- Per-page entertainment/reflection disclaimer; no medical/financial/legal advice.
- `aiGenerated` flag on AI drafts for transparency.

## SEO (2026 standards)
- Article + Breadcrumb + **FAQPage** JSON-LD on every post.
- Auto sitemap + robots + canonical URLs.
- IndexNow ping on every publish.
- Deterministic schedule = no repeated topic within 60 days.

## Setup
1. Create the repo, enable **GitHub Pages** → Source: `gh-pages` (deploys from the Action).
2. (Optional but recommended) Add repo secrets for LLM prose:
   - `LLM_API_URL` (e.g. `https://api.groq.com/openai/v1`)
   - `LLM_API_KEY` (free Groq key)
   - `LLM_MODEL` (e.g. `llama-3.3-70b-versatile`)
   - `INDEXNOW_KEY` (create one at indexnow.org; put `<key>.txt` at site root)
   - `SITE_URL` (e.g. `https://your-org.github.io/matchbybirth-traffic`)
3. The Action runs daily at 08:00 PT and on manual dispatch.

## Local commands
- `npm run build` — full static build to `out/`
- `npm run cron` — build + one editorial post (same as the Action)
- `npm run check` — draft next post and verify it passes the slop gate
- `npm run indexnow` — ping IndexNow with all page URLs

> Without `LLM_API_URL`/`LLM_API_KEY`, editorial posts use the original template
> fallback — still unique, still passes the gate, just not LLM-polished.
