// SEO helpers: canonical, JSON-LD builders, sitemap, robots.

export const SITE = {
  url: process.env.SITE_URL || 'https://matchbybirth-traffic.github.io',
  name: 'Match by Birth Astrology',
  premiumUrl: 'https://matchbybirth.com',
  author: { name: 'AJ Fox', url: 'https://matchbybirth.com/about' },
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function articleSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: SITE.author.name, url: SITE.author.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/${post.slug}/` },
    keywords: post.tags || [],
    ...(post.faq ? { hasPart: faqSchema(post.faq) } : {}),
  };
}

export function breadcrumbSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.url}/blog/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE.url}/${post.slug}/` },
    ],
  };
}

export function faqSchema(faq) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

export function buildSitemap(pages) {
  const urls = pages
    .map((p) => `  <url><loc>${esc(`${SITE.url}/${p.slug}/`)}</loc><changefreq>${esc(p.changefreq || 'weekly')}</changefreq><priority>${p.priority || 0.6}</priority></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`;
}
