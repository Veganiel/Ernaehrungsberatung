const topics = new Set([
  'Allgemeine Gesundheit', 'Nahrungsergänzungsmittel', 'Antioxidantien',
  'Schlaf & Regeneration', 'Langlebigkeit', 'Pflanzliche Ernährung', 'Ernährung & Umwelt',
]);

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export default async function quizPreview(request, context) {
  const url = new URL(request.url);
  const version = url.searchParams.get('version');
  let name = url.searchParams.get('quiz') ?? '';
  if (name === 'Ernährung & Umwelt · Schwer' && version !== '2') {
    name = 'Ernährung & Umwelt · Mittel';
  }
  const [topic, difficulty, extra] = name.split(' · ');
  const response = await context.next();
  const mixed=name==='Wissensmix' && /^(?:0|[1-9][0-9]{0,9})$/.test(url.searchParams.get('mix')??'') && Number(url.searchParams.get('mix'))<=4294967295;
  if ((!mixed && (!topics.has(topic) || !['Leicht', 'Mittel', 'Schwer'].includes(difficulty) || extra !== undefined)) ||
      request.method !== 'GET' || response.status !== 200 ||
      !response.headers.get('content-type')?.includes('text/html')) return response;

  const title = mixed ? 'Wissensmix · gemischte Schwierigkeit | Veganiel Quiz' : topic + ' · ' + difficulty + ' | Veganiel Quiz';
  const score = url.searchParams.get('punkte') ?? '';
  const description = /^(?:[0-9]|10)$/.test(score)
    ? 'Deine Herausforderung: ' + score + ' von 10 Punkten. Schaffst du mehr?'
    : 'Teste dein Wissen mit 10 Fragen.';
  const previewUrl = new URL('https://veganiel.com/quiz.html');
  previewUrl.searchParams.set('quiz', name);
  if(mixed)previewUrl.searchParams.set('mix',url.searchParams.get('mix'));
  if (name === 'Ernährung & Umwelt · Schwer') previewUrl.searchParams.set('version', '2');
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
