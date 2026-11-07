const topics = new Set([
  'Allgemeine Gesundheit', 'Nahrungsergänzungsmittel', 'Antioxidantien',
  'Langlebigkeit', 'Pflanzliche Ernährung', 'Ernährung & Umwelt',
]);

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export default async function quizPreview(request, context) {
  const url = new URL(request.url);
  const name = url.searchParams.get('quiz') ?? '';
  const [topic, difficulty, extra] = name.split(' · ');
  const response = await context.next();
  if (!topics.has(topic) || !['Leicht', 'Schwer'].includes(difficulty) || extra !== undefined ||
      request.method !== 'GET' || response.status !== 200 ||
      !response.headers.get('content-type')?.includes('text/html')) return response;

  const title = topic + ' · ' + difficulty + ' | Veganiel Quiz';
  const score = url.searchParams.get('punkte') ?? '';
  const description = /^(?:[0-9]|10)$/.test(score)
    ? 'Deine Herausforderung: ' + score + ' von 10 Punkten. Schaffst du mehr?'
    : 'Teste dein Wissen mit 10 Fragen.';
  const previewUrl = new URL('https://veganiel.com/quiz.html');
  previewUrl.searchParams.set('quiz', name);
  if (/^(?:[0-9]|10)$/.test(score)) previewUrl.searchParams.set('punkte', score);
  const html = (await response.text())
    .replace(/<title>[^<]*<\/title>/, () => '<title>' + escapeAttribute(title) + '</title>')
    .replace(/(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*/g, (_, prefix) => prefix + escapeAttribute(title))
    .replace(/(<meta (?:property|name)="(?:og:description|twitter:description)" content=")[^"]*/g, (_, prefix) => prefix + escapeAttribute(description))
    .replace(/(<meta property="og:url" content=")[^"]*/, (_, prefix) => prefix + escapeAttribute(previewUrl.href));

  const headers = new Headers(response.headers);
  for (const key of ['content-length', 'content-encoding', 'etag']) headers.delete(key);
  headers.set('Cache-Control', 'no-store');
  return new Response(html, { headers });
}

export const config = { path: ['/quiz', '/quiz.html', '/quiz/'] };
