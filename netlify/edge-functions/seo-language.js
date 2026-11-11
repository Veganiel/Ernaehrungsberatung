// Englische SEO-Version jeder Seite unter ?lang=en.
// Deutsch bleibt die Quelle (URL ohne Parameter). Für ?lang=en werden im <head> serverseitig
// Sprache, Titel, Beschreibungen, Canonical, og:url, og:locale und das Vorschaubild angepasst,
// damit Suchmaschinen und Link-Vorschauen (die kein JavaScript ausführen) die englische Fassung sehen.
let dictionaryPromise;

const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const encode = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const normalise = value => value.replace(/\s+/g, ' ').trim();

export function toEnglish(html, dictionary) {
  const end = html.search(/<\/head>/i);
  if (end < 0) return html;
  let head = html.slice(0, end);
  const translate = value => {
    const key = normalise(decode(value));
    return dictionary[key] ? encode(dictionary[key]) : value;
  };
  head = head.replace(/<html([^>]*)\blang="de"/i, '<html$1lang="en"');
  head = head.replace(/<title>([\s\S]*?)<\/title>/i, (_, text) => '<title>' + translate(text) + '</title>');
  head = head.replace(/(<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt|twitter:image:alt)" content=")([^"]*)(")/g,
    (_, start, text, close) => start + translate(text) + close);
  head = head.replace(/(<link rel="canonical" href=")([^"?#]+)(")/, '$1$2?lang=en$3');
  head = head.replace(/(<meta property="og:url" content=")([^"?#]+)(")/, '$1$2?lang=en$3');
  head = head.replace(/<meta property="og:locale" content="de_DE">/, '<meta property="og:locale" content="en_GB">');
  head = head.replace(/<meta property="og:locale:alternate" content="en_GB">/, '<meta property="og:locale:alternate" content="de_DE">');
  head = head.replace(/(<meta (?:property="og:image"|name="twitter:image") content="[^"]*\/og\/[^"]+?)(?<!-en)\.jpg"/g, '$1-en.jpg"');
  return head + html.slice(end);
}

export default async function seoLanguage(request, context) {
  const url = new URL(request.url);
  if (url.searchParams.get('lang') !== 'en') return;
  const response = await context.next();
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response;
  dictionaryPromise ??= fetch(new URL('/locales/en.json', url)).then(r => (r.ok ? r.json() : {})).catch(() => ({}));
  const dictionary = await dictionaryPromise;
  if (!Object.keys(dictionary).length) dictionaryPromise = undefined;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('content-language', 'en');
  return new Response(toEnglish(await response.text(), dictionary), { status: response.status, headers });
}

export const config = {
  path: '/*',
  excludedPath: ['/locales/*', '/styles/*', '/scripts/*', '/assets/*', '/og/*', '/blog-assets/*', '/language-default',
    '/*.css', '/*.js', '/*.json', '/*.xml', '/*.txt', '/*.png', '/*.jpg', '/*.jpeg', '/*.webp', '/*.svg', '/*.ico', '/*.pdf', '/*.webmanifest']
};
