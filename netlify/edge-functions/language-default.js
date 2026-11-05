// Netlify supplies the request country; no external geolocation service is used.
export default function languageDefault(_request, context) {
  const language = ['DE', 'AT', 'CH'].includes(context.geo?.country?.code) ? 'de' : 'en';
  return Response.json({ language }, {
    headers: { 'Cache-Control': 'private, no-store' }
  });
}

export const config = { path: '/language-default' };
