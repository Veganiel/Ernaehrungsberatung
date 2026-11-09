(() => {
  const cfgReady = window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY && !window.SUPABASE_URL.includes('DEIN-PROJEKT') && !window.SUPABASE_PUBLISHABLE_KEY.includes('DEIN_');
  const mount = document.querySelector('#community');
  if (!mount) return;
  const slug = mount.dataset.article || location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'artikel';
  const $ = (id) => mount.querySelector('#' + id);
  const status = (msg) => { const el = $('community-status'); if (el) el.textContent = msg; };
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  mount.innerHTML = `
    <h2>Diskussion & Community</h2><p class="community-intro">Teile deine Gedanken, like den Beitrag oder tausche dich mit anderen aus. Kommentare sind auch ohne Konto möglich.</p>
    <div class="community-user" id="community-user" hidden></div>
    <p><a href="/konto.html">Mein Konto · Anmelden oder Profil verwalten ↗</a></p><p class="community-status" id="community-status" role="status" aria-live="polite"></p><div class="community-grid">
      <section class="community-panel" aria-label="Kommentar schreiben">
        <h3 style="margin:0 0 8px">Kommentar schreiben</h3>
        <div id="community-anon-fields"><label for="community-anon-name">Dein Name (optional)</label><input id="community-anon-name" maxlength="60" placeholder="Anonym"></div>
        <label for="community-comment-input">Dein Kommentar</label><textarea id="community-comment-input" maxlength="3000" placeholder="Was denkst du über diesen Beitrag?"></textarea>
        <button id="community-send-comment">Kommentar absenden</button><p class="community-small">Zum Schutz vor Spam werden Kommentare zunächst geprüft und erst nach Freigabe veröffentlicht.</p>
      </section>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin:22px 0 8px"><button id="community-like" class="secondary" aria-pressed="false">♡ Gefällt mir</button><strong id="community-like-count">0 Likes</strong></div>
    <h3 style="margin:20px 0 6px">Kommentare</h3><div id="community-comments"><p class="community-small">Kommentare werden geladen …</p></div>`;

  if (!cfgReady || !window.supabase) { status('Community ist vorbereitet. Für Konten, Likes und Kommentare muss noch ein Supabase-Projekt verbunden werden.'); $('community-send-comment').disabled = true; $('community-like').disabled = true; $('community-comments').innerHTML = '<p class="community-small">Die Community wird nach der technischen Einrichtung verfügbar sein.</p>'; return; }
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  let currentUser = null, profile = null, liked = false, anonymousLiked = false;
  const anonymousLikeKey = `veganiel-anonymous-like-${slug}`;
  try { anonymousLiked = localStorage.getItem(anonymousLikeKey) === '1'; } catch (_) {}
  const initials = name => (name || 'A').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
  const avatar = (url, name) => url ? `<img class="community-avatar" src="${escapeHtml(url)}" alt="Profilbild von ${escapeHtml(name)}">` : `<span class="community-avatar" aria-hidden="true">${escapeHtml(initials(name))}</span>`;
  async function refreshAuth() {
    const {data:{user}} = await sb.auth.getUser(); currentUser = user;
    $('community-user').hidden = !user; $('community-anon-fields').hidden = !!user;
    if (user) {
      const {data} = await sb.from('profiles').select('*').eq('id',user.id).maybeSingle(); profile = data || {display_name:'Mitglied'};
      $('community-user').innerHTML = `${avatar(profile.avatar_url,profile.display_name)} <span>Angemeldet als <strong>${escapeHtml(profile.display_name)}</strong></span>`;
      $('community-like').disabled = false;
    } else { profile = null; $('community-like').disabled = false; }
    await refreshLikes();
  }
  async function refreshLikes(){
    const {count} = await sb.from('likes').select('*',{count:'exact',head:true}).eq('article_slug',slug);
    $('community-like-count').textContent = `${(count || 0) + (!currentUser && anonymousLiked ? 1 : 0)} Likes`;
    if(currentUser){ const {data} = await sb.from('likes').select('id').eq('article_slug',slug).eq('user_id',currentUser.id).maybeSingle(); liked=!!data; }
    else liked=false;
    $('community-like').textContent = (liked || (!currentUser && anonymousLiked)) ? '♥ Gefällt mir' : '♡ Gefällt mir'; $('community-like').setAttribute('aria-pressed',String(liked || (!currentUser && anonymousLiked)));
  }
  async function loadComments(){
    const {data,error} = await sb.from('comments').select('id,content,author_name,avatar_url,created_at').eq('article_slug',slug).eq('is_approved',true).order('created_at',{ascending:false}).limit(50);
    if(error){$('community-comments').innerHTML='<p class="community-small">Kommentare konnten gerade nicht geladen werden.</p>';return;}
    $('community-comments').innerHTML = data?.length ? data.map(c=>`<div class="community-comment"><div class="community-comment-head">${avatar(c.avatar_url,c.author_name)}<span>${escapeHtml(c.author_name)}</span><time>${new Date(c.created_at).toLocaleDateString('de-DE')}</time></div><p>${escapeHtml(c.content)}</p></div>`).join('') : '<p class="community-small">Noch keine freigegebenen Kommentare. Sei der Erste!</p>';
  }
  $('community-send-comment').addEventListener('click',async()=>{const content=$('community-comment-input').value.trim();if(content.length<2){status('Bitte schreibe einen etwas längeren Kommentar.');return;}const name=currentUser?(profile?.display_name||'Mitglied'):($('community-anon-name').value.trim()||'Anonym');const payload={article_slug:slug,content,author_id:currentUser?.id||null,author_name:name,avatar_url:currentUser?profile?.avatar_url||null:null};const {error}=await sb.from('comments').insert(payload);if(error){status(error.message);return;}$('community-comment-input').value='';status('Danke! Dein Kommentar wurde eingesendet und erscheint nach der Freigabe.');});
  $('community-like').addEventListener('click',async()=>{if(!currentUser){anonymousLiked=!anonymousLiked;try{if(anonymousLiked)localStorage.setItem(anonymousLikeKey,'1');else localStorage.removeItem(anonymousLikeKey);}catch (_){}$('community-like').textContent=anonymousLiked?'♥ Gefällt dir':'♡ Gefällt mir';$('community-like').setAttribute('aria-pressed',String(anonymousLiked));await refreshLikes();return;}const q=sb.from('likes');const result=liked?await q.delete().eq('article_slug',slug).eq('user_id',currentUser.id):await q.insert({article_slug:slug,user_id:currentUser.id});if(result.error)status(result.error.message);else await refreshLikes();});
  sb.auth.onAuthStateChange(()=>{setTimeout(refreshAuth,0);});
  refreshAuth();loadComments();
})();
