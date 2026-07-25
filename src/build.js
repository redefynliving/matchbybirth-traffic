import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { programmaticPages } from './programmatic.js';
import { layout, renderBody, faqHtml } from './site.js';
import { draftPost } from './editorial.js';
import { nextTopic, markPublished } from './queue.js';
import { SITE, articleSchema, breadcrumbSchema, jsonLd, buildSitemap, buildRobots } from './seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'out');
const today = new Date().toISOString().slice(0, 10);

function writePage(slug, html) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

function buildHome(pages) {
  const links = pages
    .slice(0, 24)
    .map((p) => `<li><a href="${SITE.url}/${p.slug}/">${p.title}</a></li>`)
    .join('');
  const body = renderBody(`## Free astrology compatibility guides
Match by Birth Astrology publishes plain-language guides on sign pairings, moon signs, Venus and Mars, and numerology — built to help you understand a relationship, not to decide one for you.

## Start here
${links}

## The exact score lives on the calculator
Every guide here is a lens. For the real percentage, run both birth charts on [the Match by Birth calculator](#calculator).
`);
  return layout({
    title: 'Astrology Compatibility Guides',
    metaDescription: 'Plain-language astrology compatibility guides for every sign pair, moon sign, Venus/Mars placement, and life path — plus the exact match score.',
    slug: '',
    category: '',
    date: today,
    bodyHtml: body,
    jsonLd: '',
  });
}

async function main() {
  const cron = process.argv.includes('--cron');
  fs.mkdirSync(OUT, { recursive: true });
  const pages = [];

  // 1) Programmatic pages (always).
  const prog = programmaticPages();
  for (const p of prog) { writePage(p.slug, p.html); pages.push({ slug: p.slug, title: p.title, tags: p.tags, changefreq: p.changefreq, priority: p.priority }); }
  console.log(`[build] wrote ${prog.length} programmatic pages`);

  // 2) Editorial: one post when running as cron (or --draft-next locally).
  // Quality-first: only draft/auto-publish an editorial post when an LLM key
  // is present (real prose). Without it, the 111 programmatic pages already
  // carry the SEO surface — we don't publish a weak fallback as daily content.
  const hasLLM = !!(process.env.LLM_API_URL && process.env.LLM_API_KEY);
  if ((cron && hasLLM) || process.argv.includes('--draft-next')) {
    const { topic } = nextTopic(today);
    if (topic) {
      const post = await draftPost(topic);
      if (!analyzeDraftQuality(post).ok) {
        console.log(`[build] editorial draft for ${topic.slug} failed the slop gate; skipping publish.`);
      } else {
        const html = layout({
          title: post.title,
          metaDescription: post.metaDescription,
          slug: post.slug,
          category: post.category,
          date: post.date,
          bodyHtml: renderBody(post.rawBody),
          faqHtml: faqHtml(post.faq),
          takeaways: post.takeaways,
          faq: post.faq,
          jsonLd: jsonLd(articleSchema(post)) + '\n' + jsonLd(breadcrumbSchema(post)),
        });
        writePage(post.slug, html);
        pages.push({ slug: post.slug, title: post.title, tags: post.tags, changefreq: 'weekly', priority: 0.65 });
        markPublished(post.slug, today);
        console.log(`[build] wrote editorial post: ${post.slug} (AI draft: ${!!post.aiGenerated})`);
      }
    } else {
      console.log('[build] no eligible editorial topic today');
    }
  } else if (cron) {
    console.log('[build] no LLM key set — skipping daily editorial (programmatic pages still published).');
  }

  // 3) Sitemap + robots + home.
  writePage('', buildHome(pages));
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), buildSitemap(pages), 'utf8');
  fs.writeFileSync(path.join(OUT, 'robots.txt'), buildRobots(), 'utf8');
  console.log(`[build] total pages: ${pages.length}; sitemap + robots written to out/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
