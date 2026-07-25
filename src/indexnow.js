import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'out');
const SITE = process.env.SITE_URL || 'https://matchbybirth-traffic.github.io';
const HOST = SITE.replace(/^https?:\/\//, '').replace(/\/$/, '');
const KEY = process.env.INDEXNOW_KEY;
const KEY_FILE = process.env.INDEXNOW_KEY_FILE || `${KEY}.txt`; // expected at site root

async function main() {
  if (!KEY) { console.error('INDEXNOW_KEY not set; skipping.'); return; }
  const urls = [];
  for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'assets') urls.push(`${SITE}/${entry.name}/`);
  }
  const body = { host: HOST, key: KEY, keyLocation: `${SITE}/${KEY_FILE}`, urlList: urls };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`[indexnow] ${res.status} — submitted ${urls.length} URLs`);
  if (res.status !== 200 && res.status !== 202) console.error(await res.text());
}

main().catch((e) => { console.error(e); process.exit(1); });
