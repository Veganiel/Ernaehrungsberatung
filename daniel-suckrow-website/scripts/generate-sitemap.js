// Generate the sitemap from the public canonical URLs in the HTML.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const base = new URL(process.argv[2] || process.env.SITE_URL || 'https://veganiel.com');
const output = path.join(root, 'sitemap.xml');
const previous = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
const dates = new Map([...previous.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)]
  .map(([, url, date]) => [url, date]));
const urls = new Set();

for (const entry of fs.readdirSync(root, { recursive: true })) {
  if (!entry.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(root, entry), 'utf8');
  const head = html.split(/<\/head>/i)[0];
  if (/<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i.test(head)) continue;
  const canonical = head.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (!canonical) throw new Error('Missing canonical URL: ' + entry);
  const url = new URL(canonical);
  if (url.origin !== base.origin || url.search || url.hash) {
    throw new Error('Invalid canonical URL: ' + canonical);
  }
  urls.add(url.href);
}

const entries = [...urls].sort().map(url => {
  const loc = url.replaceAll('&', '&amp;');
  const lastmod = dates.has(url) ? '<lastmod>' + dates.get(url) + '</lastmod>' : '';
  return '  <url><loc>' + loc + '</loc>' + lastmod + '</url>';
});
fs.writeFileSync(output, '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.join('\n') + '\n</urlset>\n');
console.log(entries.length + ' canonical URLs written to sitemap.xml');
