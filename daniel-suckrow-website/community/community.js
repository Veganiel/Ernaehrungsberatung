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
    <div class="community-grid">
      <section class="community-panel" aria-label="Konto und Anmeldung">
        <h3 style="margin:0 0 8px">Dein Konto</h3>
        <div id="community-auth">
          <label for="community-email">E-Mail-Adresse</label><input id="community-email" type="email" autocomplete="email" placeholder="name@beispiel.de">
          <label for="community-password">Passwort</label><input id="community-password" type="password" autocomplete="current-password" minlength="8" placeholder="Mindestens 8 Zeichen">
          <div id="community-register-fields" hidden>
            <label for="community-display">Anzeigename</label><input id="community-display" maxlength="60" placeholder="Wie soll dein Name erscheinen?">
            <label for="community-avatar-file">Profilbild (optional)</label><input id="community-avatar-file" type="file" accept="image/png,image/jpeg,image/webp">
            <label class="community-consent"><input id="community-newsletter" type="checkbox"><span>Ich möchte optional den Newsletter erhalten. Ich kann mich jederzeit wieder abmelden.</span></label>
          </div>
          <button id="community-login">Anmelden</button><button id="community-register" class="secondary">Konto erstellen</button>
          <button id="community-forgot" class="secondary">Passwort vergessen</button>
        </div>
        <div id="community-account-edit" hidden>
          <label for="community-profile-name">Anzeigename</label><input id="community-profile-name" maxlength="60">
          <label for="community-profile-avatar">Profilbild ändern</label><input id="community-profile-avatar" type="file" accept="image/png,image/jpeg,image/webp">
          <label class="community-consent"><input id="community-profile-newsletter" type="checkbox"><span>Newsletter abonnieren (optional)</span></label>
          <button id="community-save-profile">Profil speichern</button><button id="community-logout" class="secondary">Abmelden</button>
        </div>
        <p class="community-status" id="community-status" role="status" aria-live="polite"></p>
        <p class="community-small">Für Likes ist ein Konto erforderlich. Kommentare können auch anonym abgegeben werden.</p>
      </section>
      <section class="community-panel" aria-label="Kommentar schreiben">
        <h3 style="margin:0 0 8px">Kommentar schreiben</h3>
        <div id="community-anon-fields"><label for="community-anon-name">Dein Name (optional)</label><input id="community-anon-name" maxlength="60" placeholder="Anonym"></div>
        <label for="community-comment-input">Dein Kommentar</label><textarea id="community-comment-input" maxlength="3000" placeholder="Was denkst du über diesen Beitrag?"></textarea>
        <button id="community-send-comment">Kommentar absenden</button><p class="community-small">Zum Schutz vor Spam werden Kommentare zunächst geprüft und erst nach Freigabe veröffentlicht.</p>
      </section>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin:22px 0 8px"><button id="community-like" class="secondary" aria-pressed="false">♡ Gefällt mir</button><strong id="community-like-count">0 Likes</strong></div>
    <h3 style="margin:20px 0 6px">Kommentare</h3><div id="community-comments"><p class="community-small">Kommentare werden geladen …</p></div>`;

  if (!cfgReady || !window.supabase) { status('Community ist vorbereitet. Für Konten, Likes und Kommentare muss noch ein Supabase-Projekt verbunden werden.'); $('community-login').disabled = true; $('community-register').disabled = true; $('community-send-comment').disabled = true; $('community-like').disabled = true; $('community-comments').innerHTML = '<p class="community-small">Die Community wird nach der technischen Einrichtung verfügbar sein.</p>'; return; }
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  let currentUser = null, profile = null, liked = false;
  const initials = name => (name || 'A').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
  const avatar = (url, name) => url ? `<img class="community-avatar" src="${escapeHtml(url)}" alt="Profilbild von ${escapeHtml(name)}">` : `<span class="community-avatar" aria-hidden="true">${escapeHtml(initials(name))}</span>`;
  async function refreshAuth() {
    const {data:{user}} = await sb.auth.getUser(); currentUser = user;
    $('community-auth').hidden = !!user; $('community-account-edit').hidden = !user; $('community-user').hidden = !user; $('community-anon-fields').hidden = !!user;
    if (user) {
      const {data} = await sb.from('profiles').select('*').eq('id',user.id).maybeSingle(); profile = data || {display_name:user.email?.split('@')[0] || 'Mitglied'};
      const {data:newsPref} = await sb.from('newsletter_subscriptions').select('opted_in,consent_at').eq('user_id',user.id).maybeSingle();
      $('community-profile-name').value = profile.display_name || '';
      $('community-profile-newsletter').checked = !!newsPref?.opted_in;
      $('community-user').innerHTML = `${avatar(profile.avatar_url,profile.display_name)} <span>Angemeldet als <strong>${escapeHtml(profile.display_name)}</strong></span>`;
      $('community-like').disabled = false;
    } else { profile = null; $('community-like').disabled = true; }
    await refreshLikes();
  }
  async function refreshLikes(){
    const {count} = await sb.from('likes').select('*',{count:'exact',head:true}).eq('article_slug',slug);
    $('community-like-count').textContent = `${count || 0} Likes`;
    if(currentUser){ const {data} = await sb.from('likes').select('id').eq('article_slug',slug).eq('user_id',currentUser.id).maybeSingle(); liked=!!data; }
    else liked=false;
    $('community-like').textContent = liked ? '♥ Gefällt mir' : '♡ Gefällt mir'; $('community-like').setAttribute('aria-pressed',String(liked));
  }
  async function uploadAvatar(file){
    if(!file) return profile?.avatar_url || null;
    if(file.size > 2*1024*1024) throw new Error('Das Profilbild darf höchstens 2 MB groß sein.');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Bitte JPG, PNG oder WebP verwenden.');
    const ext = file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const path = `${currentUser.id}/${Date.now()}.${ext}`;
    const {error} = await sb.storage.from('avatars').upload(path,file,{upsert:true,contentType:file.type}); if(error) throw error;
    return sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  }
  async function loadComments(){
    const {data,error} = await sb.from('comments').select('id,content,author_name,avatar_url,created_at').eq('article_slug',slug).eq('is_approved',true).order('created_at',{ascending:false}).limit(50);
    if(error){$('community-comments').innerHTML='<p class="community-small">Kommentare konnten gerade nicht geladen werden.</p>';return;}
    $('community-comments').innerHTML = data?.length ? data.map(c=>`<div class="community-comment"><div class="community-comment-head">${avatar(c.avatar_url,c.author_name)}<span>${escapeHtml(c.author_name)}</span><time>${new Date(c.created_at).toLocaleDateString('de-DE')}</time></div><p>${escapeHtml(c.content)}</p></div>`).join('') : '<p class="community-small">Noch keine freigegebenen Kommentare. Sei der Erste!</p>';
  }
  $('community-login').addEventListener('click',async()=>{status('Anmeldung läuft …');const {error}=await sb.auth.signInWithPassword({email:$('community-email').value.trim(),password:$('community-password').value});status(error?error.message:'Du bist angemeldet.');if(!error)await refreshAuth();});
  $('community-register').addEventListener('click',async()=>{
    if($('community-register-fields').hidden){$('community-register-fields').hidden=false;$('community-register').textContent='Registrierung bestätigen';$('community-login').hidden=true;status('Bitte Anzeigenamen ergänzen und Registrierung bestätigen.');return;}
    const email=$('community-email').value.trim(), password=$('community-password').value, display=$('community-display').value.trim() || 'Mitglied';
    if(password.length<8){status('Bitte ein Passwort mit mindestens 8 Zeichen wählen.');return;}
    status('Konto wird erstellt …');const {data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:display,newsletter_opt_in:$('community-newsletter').checked}}});
    if(error){status(error.message);return;}
    if(data.user && data.session){currentUser=data.user;let url=null;try{url=await uploadAvatar($('community-avatar-file').files[0]);}catch(e){status(e.message);return;}
      await sb.from('profiles').upsert({id:data.user.id,display_name:display,avatar_url:url});
      status('Konto erstellt.');await refreshAuth();
    } else status('Bitte bestätige deine E-Mail-Adresse über den zugesandten Link. Danach kannst du dich anmelden.');
  });
  $('community-forgot').addEventListener('click',async()=>{const email=$('community-email').value.trim();if(!email){status('Bitte zuerst deine E-Mail-Adresse eingeben.');return;}const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.href});status(error?error.message:'Falls ein Konto existiert, wurde ein Link zum Zurücksetzen versendet.');});
  $('community-logout').addEventListener('click',async()=>{await sb.auth.signOut();status('Du wurdest abgemeldet.');await refreshAuth();});
  $('community-save-profile').addEventListener('click',async()=>{try{const name=$('community-profile-name').value.trim()||'Mitglied';const url=await uploadAvatar($('community-profile-avatar').files[0]);const opted=$('community-profile-newsletter').checked;const {error}=await sb.from('profiles').upsert({id:currentUser.id,display_name:name,avatar_url:url,updated_at:new Date().toISOString()});if(error){status(error.message);return;}const {error:newsError}=await sb.from('newsletter_subscriptions').upsert({user_id:currentUser.id,opted_in:opted,consent_at:opted?new Date().toISOString():null,updated_at:new Date().toISOString()});status(newsError?newsError.message:'Profil gespeichert.');await refreshAuth();}catch(e){status(e.message);}});
  $('community-send-comment').addEventListener('click',async()=>{const content=$('community-comment-input').value.trim();if(content.length<2){status('Bitte schreibe einen etwas längeren Kommentar.');return;}const name=currentUser?(profile?.display_name||'Mitglied'):($('community-anon-name').value.trim()||'Anonym');const payload={article_slug:slug,content,author_id:currentUser?.id||null,author_name:name,avatar_url:currentUser?profile?.avatar_url||null:null};const {error}=await sb.from('comments').insert(payload);if(error){status(error.message);return;}$('community-comment-input').value='';status('Danke! Dein Kommentar wurde eingesendet und erscheint nach der Freigabe.');});
  $('community-like').addEventListener('click',async()=>{if(!currentUser){status('Bitte melde dich an, um Beiträge zu liken.');return;}const q=sb.from('likes');const result=liked?await q.delete().eq('article_slug',slug).eq('user_id',currentUser.id):await q.insert({article_slug:slug,user_id:currentUser.id});if(result.error)status(result.error.message);else await refreshLikes();});
  sb.auth.onAuthStateChange(()=>{setTimeout(refreshAuth,0);});
  refreshAuth();loadComments();
})();
