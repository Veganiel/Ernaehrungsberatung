// Sternebewertung für Rezeptseiten. Bewerten mit Konto, Durchschnitt für alle sichtbar.
(() => {
  const mount = document.getElementById('recipe-rating');
  if (!mount) return;
  const slug = mount.dataset.recipe;
  const ready = window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY && window.supabase;
  const t = s => (window.VeganielI18n && window.VeganielI18n.translate(s)) || s;
  const fmt = n => Number(n).toLocaleString(document.documentElement.lang === 'en' ? 'en' : 'de', {minimumFractionDigits: 1, maximumFractionDigits: 1});
  mount.innerHTML = '<div class="rr-stars" role="radiogroup" aria-label="Rezept bewerten">' +
    [1, 2, 3, 4, 5].map(n => `<button type="button" class="rr-star" data-stars="${n}" role="radio" aria-checked="false" aria-label="${n} von 5 Sternen">★</button>`).join('') +
    '</div><p class="rr-summary" aria-live="polite"><span class="rr-text">Noch keine Bewertungen</span></p><p class="rr-hint"><a href="/konto.html">Melde dich an</a><span>, um dieses Rezept zu bewerten.</span></p>';
  const stars = [...mount.querySelectorAll('.rr-star')];
  const hint = mount.querySelector('.rr-hint');
  const text = mount.querySelector('.rr-text');
  let user = null, mine = 0, summary = {average: 0, total: 0};
  const paint = value => stars.forEach(s => { const on = Number(s.dataset.stars) <= value; s.classList.toggle('is-on', on); s.setAttribute('aria-checked', String(Number(s.dataset.stars) === mine)); });
  const render = () => {
    text.textContent = summary.total
      ? `${fmt(summary.average)} / 5 · ${summary.total} ${t(summary.total === 1 ? 'Bewertung' : 'Bewertungen')}`
      : t('Noch keine Bewertungen');
    paint(mine || Math.round(summary.average));
    hint.hidden = !!user;
    stars.forEach(s => { s.disabled = !user; });
    if (mine) text.textContent += ` · ${t('Deine Bewertung')}: ${mine}`;
    updateSchema();
  };
  function updateSchema() {
    const node = document.querySelector('script[type="application/ld+json"]');
    if (!node) return;
    try {
      const data = JSON.parse(node.textContent);
      const recipe = (data['@graph'] || [data]).find(x => x['@type'] === 'Recipe');
      if (!recipe) return;
      if (summary.total) recipe.aggregateRating = {'@type': 'AggregateRating', ratingValue: Number(summary.average), ratingCount: summary.total, bestRating: 5, worstRating: 1};
      else delete recipe.aggregateRating;
      node.textContent = JSON.stringify(data);
    } catch (_) {}
  }
  if (!ready) { mount.classList.add('rr-off'); render(); return; }
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  async function load() {
    const {data: {user: u}} = await sb.auth.getUser(); user = u;
    const {data, error} = await sb.rpc('recipe_rating_summary', {slug});
    if (!error && data && data[0]) summary = {average: data[0].average || 0, total: data[0].total || 0};
    mine = 0;
    if (user) { const {data: own} = await sb.from('recipe_ratings').select('stars').eq('recipe_slug', slug).eq('user_id', user.id).maybeSingle(); mine = own ? own.stars : 0; }
    render();
  }
  stars.forEach(s => {
    s.addEventListener('mouseenter', () => user && paint(Number(s.dataset.stars)));
    s.addEventListener('mouseleave', () => paint(mine || Math.round(summary.average)));
    s.addEventListener('click', async () => {
      if (!user) return;
      const value = Number(s.dataset.stars);
      const {error} = await sb.from('recipe_ratings').upsert({recipe_slug: slug, user_id: user.id, stars: value, updated_at: new Date().toISOString()});
      if (error) { text.textContent = t('Bewertung konnte gerade nicht gespeichert werden.'); return; }
      await load();
    });
  });
  sb.auth.onAuthStateChange(() => setTimeout(load, 0));
  load();
})();
