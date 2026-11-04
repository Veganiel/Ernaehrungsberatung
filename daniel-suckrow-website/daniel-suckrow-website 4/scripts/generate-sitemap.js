// Finalize canonical URLs, Open Graph URLs, robots.txt and sitemap after the real domain is known.
// Usage: node scripts/generate-sitemap.js https://www.example.de
const fs = require('fs'); const path = require('path');
const base = (process.argv[2] || process.env.SITE_URL || '').replace(/\/$/, '');
if (!/^https?:\/\//i.test(base)) { console.error('Bitte die endgültige Website-Domain angeben, z. B. https://www.example.de'); process.exit(1); }
const root = path.resolve(__dirname, '..');
const pages = [];
for (const file of fs.readdirSync(root)) if (file.endsWith('.html') && !['404.html','blog.html'].includes(file)) pages.push({file, route:file === 'index.html' ? '/' : '/' + file});
const blogRoot = path.join(root,'blog');
for (const slug of fs.readdirSync(blogRoot)) if (fs.existsSync(path.join(blogRoot,slug,'index.html'))) pages.push({file:path.join('blog',slug,'index.html'), route:'/blog/' + slug + '/'});
for (const page of pages) {
  const full = base + page.route; const file = path.join(root,page.file); let html = fs.readFileSync(file,'utf8');
  html = html.replace(/<link rel="canonical" href="[^"]*">\s*/i,'');
  html = html.replace(/<meta property="og:url" content="[^"]*">\s*/i,'');
  html = html.replace(/<meta property="og:image" content="[^"]*">\s*/i,'');
  const tags = '<link rel="canonical" href="' + full + '">\n<meta property="og:url" content="' + full + '">\n<meta property="og:image" content="' + base + '/daniel-suckrow-portrait.jpg">';
  html = html.replace('</head>', tags + '\n</head>'); fs.writeFileSync(file,html);
}
const urls = pages.map(p => base + p.route).sort();
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => '  <url><loc>' + u + '</loc></url>').join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(root,'sitemap.xml'),xml);
fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /scripts/\n\nSitemap: ' + base + '/sitemap.xml\n');
console.log('Canonical-URLs, Social-Metadaten und Sitemap erstellt:', urls.length, 'URLs');
