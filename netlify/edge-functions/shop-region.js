const EU = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']);

export default async function shopRegion(request, context) {
  const country = context.geo?.country?.code;
  const allowed = EU.has(country);
  const path = new URL(request.url).pathname;
  if (path === '/shop-region') {
    return Response.json({ available: allowed }, { headers: { 'Cache-Control': 'private, no-store', 'Vary': 'X-NF-Geo' } });
  }
  if (!allowed) {
    return new Response('This shop is currently available only in the European Union.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store' }
    });
  }
  const response = await context.next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { path: ['/shop-region', '/shop', '/shop.html', '/shop/'] };
