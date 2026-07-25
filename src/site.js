import { SITE } from './seo.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DISCLAIMER = `<p class="disclaimer">Match by Birth content is for entertainment and personal reflection. It is not relationship, medical, financial, or legal advice. Use it to start conversations, not to make life decisions.</p>`;

const PREMIUM_CTA = `
<section class="cta">
  <h2>Get your exact compatibility score</h2>
  <p>These guides are a starting point. Match by Birth runs your full birth charts and shows a detailed percentage match, the specific friction points, and where the bond is strongest.</p>
  <a class="cta-btn" href="${SITE.premiumUrl}">Try the Match by Birth calculator →</a>
</section>`;

// Render markdown-ish body (## headings, paragraphs, lists, **bold**) to HTML.
export function renderBody(md) {
  const lines = String(md || '').split('\n');
  let html = '';
  let listOpen = false;
  const closeList = () => { if (listOpen) { html += '</ul>'; listOpen = false; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^##\s+/.test(line)) { closeList(); html += `<h2>${inline(line.slice(3))}</h2>`; continue; }
    if (/^###\s+/.test(line)) { closeList(); html += `<h3>${inline(line.slice(4))}</h3>`; continue; }
    if (/^[-*]\s+/.test(line)) { if (!listOpen) { html += '<ul>'; listOpen = true; } html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`; continue; }
    if (line.trim() === '') { closeList(); continue; }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\[(.+?)\]\(#calculator\)/g, '<a href="' + SITE.premiumUrl + '">$1</a>');
}

export function layout({ title, metaDescription, slug, bodyHtml, faqHtml = '', takeaways = [], category = '', date, jsonLd = '', changefreq, priority }) {
  const tak = takeaways.length
    ? `<section class="takeaways"><h2>Quick takeaways</h2><ul>${takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} | ${esc(SITE.name)}</title>
<meta name="description" content="${esc(metaDescription)}" />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="${SITE.url}/${slug}/" />
${jsonLd}
<style>
:root{--bg:#0f0b1e;--card:#1b1530;--ink:#ece9f6;--muted:#a79fc7;--accent:#8b5cf6;--accent2:#6c4de6}
*{box-sizing:border-box}
body{margin:0;background:linear-gradient(160deg,#0f0b1e,#1a1033);color:var(--ink);font:16px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:32px 20px 80px}
header{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #2a2348}
header a{color:var(--ink);text-decoration:none;font-weight:700}
.brand{display:flex;align-items:center;gap:8px}
.brand .dot{width:12px;height:12px;border-radius:50%;background:var(--accent)}
h1{font-size:2.1rem;line-height:1.2;margin:8px 0 4px}
h2{color:var(--accent2);margin-top:36px;font-size:1.5rem}
h3{color:var(--accent2);margin-top:24px}
.meta{color:var(--muted);font-size:.9rem;margin-bottom:24px}
.card{background:var(--card);border:1px solid #2a2348;border-radius:18px;padding:24px;margin:24px 0}
.cta{background:linear-gradient(135deg,#2a1a55,#3a1f6e);border:1px solid var(--accent);border-radius:18px;padding:28px;margin:32px 0;text-align:center}
.cta h2{color:var(--ink);margin-top:0}
.cta-btn{display:inline-block;margin-top:12px;background:var(--accent);color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px}
.takeaways,.faq{background:var(--card);border:1px solid #2a2348;border-radius:18px;padding:22px 24px;margin:24px 0}
.faq details{border-top:1px solid #2a2348;padding:14px 0}
.faq summary{font-weight:600;cursor:pointer}
.disclaimer{font-size:.8rem;color:var(--muted);border-top:1px solid #2a2348;margin-top:48px;padding-top:16px}
a{color:var(--accent)}
footer{color:var(--muted);font-size:.85rem;text-align:center;padding:30px 20px}
.tag{display:inline-block;background:#241b40;color:var(--muted);border:1px solid #2a2348;border-radius:999px;padding:3px 10px;font-size:.75rem;margin-bottom:10px}
</style>
</head>
<body>
<header><div class="brand"><span class="dot"></span><a href="/">Match by Birth Astrology</a></div><a href="${SITE.premiumUrl}">Premium →</a></header>
<main class="wrap">
${category ? `<span class="tag">${esc(category)}</span>` : ''}
<h1>${esc(title)}</h1>
<div class="meta">By ${esc(SITE.author.name)} · ${date ? esc(date) : 'Updated regularly'}</div>
${bodyHtml}
${tak}
${faqHtml}
${PREMIUM_CTA}
${DISCLAIMER}
</main>
<footer>© ${new Date().getFullYear()} Match by Birth · <a href="${SITE.premiumUrl}">Go to the calculator</a></footer>
</body>
</html>`;
}

export function faqHtml(faq) {
  if (!faq || !faq.length) return '';
  return `<section class="faq"><h2>Common questions</h2>${faq
    .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
    .join('')}</section>`;
}
