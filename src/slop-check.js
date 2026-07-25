import { draftPost } from './editorial.js';
import { nextTopic, markPublished } from './queue.js';
import { analyzeDraftQuality } from './slop.js';

// Local gate: simulate the cron, draft the next post, and verify it passes
// the slop scanner before anything could be published.
async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const { topic } = nextTopic(today);
  if (!topic) { console.log('No eligible topic.'); return; }
  console.log(`Topic: ${topic.slug} (${topic.keyword})`);
  const post = await draftPost(topic);
  const q = analyzeDraftQuality(post);
  console.log(`Words: ${q.metrics.wordCount} | Headings: ${q.metrics.headingCount} | Generic: ${q.metrics.genericPhraseCount}`);
  if (q.ok) { console.log('PASS ✅'); markPublished(topic.slug, today); }
  else { console.log('FAIL ❌'); for (const e of q.errors) console.log(' - ' + e); }
}

main().catch((e) => { console.error(e); process.exit(1); });
