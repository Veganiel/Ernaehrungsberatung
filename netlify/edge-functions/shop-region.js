export default async function shopRegion(request, context) {
  const path = new URL(request.url).pathname;
  if (path === '/shop-region') {
    return Response.json({ available: true }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  }
  return context.next();
}

export const config = { path: ['/shop-region', '/shop', '/shop.html', '/shop/'] };
