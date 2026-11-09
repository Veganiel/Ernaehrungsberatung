(() => {
 if(!window.VeganielMember?.client)return;
 const sb=window.VeganielMember.client,ui=window.VeganielQuizUI,$=id=>document.getElementById(id);
 const guest=QuizProgress.create();let active=null;
 const status=t=>{$('quiz-account-status').textContent=(active?'Angemeldet als '+active.displayName+'. ':'')+t;$('quiz-account-link').hidden=!!active;$('storage-note').textContent=active?'Mit Anmeldung werden Bestwerte und Abzeichen im Konto gespeichert. Auf gemeinsam genutzten Geräten bitte abmelden.':'Bestwerte bleiben nur in diesem Browser. Beim Löschen der Browserdaten gehen sie verloren.';};
 function persist(ctx){try{localStorage.setItem(ctx.queueKey,JSON.stringify(ctx.queue));}catch{ctx.durable=false;}}
 async function request(ctx,path,body){const r=await fetch(window.SUPABASE_URL+'/rest/v1/'+path,{method:body?'POST':'GET',headers:{apikey:window.SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+ctx.token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'});if(!r.ok)throw Error('Sync failed');return r.status===204?null:r.json();}
 async function flush(ctx){
  if(ctx.busy)return ctx.busy;
  ctx.busy=(async()=>{try{
   while(ctx.queue.length){const event=ctx.queue[0];if(!event.leagueOnly)await request(ctx,'rpc/record_quiz_result',event);await request(ctx,'rpc/record_weekly_quiz_score',{event:event.event,quiz:event.quiz,score:event.score,time_bonus:event.timeBonus||0});ctx.queue.shift();persist(ctx);window.VeganielQuizLeaderboard?.refresh();}
   const rows=await request(ctx,'quiz_results?select=quiz_key,best,attempts');
   if(active!==ctx)return;
   // A completion arriving during the read must be sent before applying server state.
   if(ctx.queue.length){ctx.again=true;return;}
   const records=Object.fromEntries(rows.filter(r=>ui.keys.includes(r.quiz_key)).map(r=>[r.quiz_key,{best:r.best,attempts:r.attempts}]));ctx.store.replace(records);ui.refresh();status('Im Konto gespeichert. Deine Quiz-Bestwerte und Abzeichen sind auf deinen Geräten verfügbar.');$('retry-sync').hidden=true;
  }catch{if(active===ctx){status(ctx.durable?'Gerade keine Verbindung. Deine neue Runde ist auf diesem Gerät vorgemerkt und wird beim nächsten Besuch mit Anmeldung erneut übertragen.':'Gerade nicht gespeichert. Bitte bleibe auf dieser Seite und versuche die Speicherung erneut.');$('retry-sync').hidden=false;}}
  finally{ctx.busy=null;if(ctx.again){ctx.again=false;setTimeout(()=>flush(ctx),0);}}})();return ctx.busy;
 }
 async function change(next){const id=next?.user?.id;if(id&&active?.id===id){active.token=next.access_token;return;}if(!id){active=null;ui.setStore(guest);$('import-local').hidden=true;$('retry-sync').hidden=true;status('Ohne Konto spielst du lokal. Mit Konto bleiben deine Bestwerte auf deinen Geräten verfügbar.');return;}
 const fallbackName=next.user.user_metadata?.display_name||next.user.email?.split('@')[0]||'Mitglied';
 const ctx={id,token:next.access_token,displayName:fallbackName,store:QuizProgress.create(undefined,'veganiel.quiz-account.'+id),queueKey:'veganiel.quiz-pending.'+id,queue:[],durable:true,busy:null};
 try{const raw=JSON.parse(localStorage.getItem(ctx.queueKey)||'[]');ctx.queue=Array.isArray(raw)?raw.filter(e=>e&&/^[a-f0-9-]{36}$/i.test(e.event)&&(ui.keys.includes(e.quiz)||e.quiz==='Blitzrunde')&&Number.isInteger(e.score)&&e.score>=0&&e.score<=10&&(!e.timeBonus||(Number.isInteger(e.timeBonus)&&e.timeBonus>=0&&e.timeBonus<=75))):[];}catch{ctx.durable=false;}
 active=ctx;ui.setStore(ctx.store);$('import-local').hidden=!Object.keys(guest.records()).some(k=>ui.keys.includes(k));status('Deine Quiz-Bestwerte werden geladen …');
 try{const profile=await sb.from('profiles').select('display_name').eq('id',id).maybeSingle();if(active!==ctx)return;if(!profile.error&&profile.data?.display_name)ctx.displayName=profile.data.display_name;}catch{}if(active!==ctx)return;status('Deine Quiz-Bestwerte werden geladen …');await flush(ctx);
 }
 window.addEventListener('veganiel:quiz-finished',event=>{const ctx=active;if(!ctx)return;ctx.queue.push({event:crypto.randomUUID(),quiz:event.detail.key,score:event.detail.score,timeBonus:event.detail.timeBonus||0,leagueOnly:!!event.detail.leagueOnly});persist(ctx);flush(ctx).then(()=>{if(ctx.queue.length&&active===ctx&&!ctx.busy)$('retry-sync').hidden=false;});});
 $('retry-sync').addEventListener('click',()=>{if(active)flush(active);});
 $('import-local').addEventListener('click',async()=>{const ctx=active;if(!ctx)return;$('import-local').disabled=true;for(const [key,r] of Object.entries(guest.records()))if(ui.keys.includes(key)){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('guest-import:'+ctx.id+':'+key+':'+r.best)));const hex=Array.from(bytes.slice(0,16),b=>b.toString(16).padStart(2,'0')).join('');const event=hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);if(!ctx.queue.some(e=>e.event===event))ctx.queue.push({event,quiz:key,score:r.best});}persist(ctx);await flush(ctx);$('import-local').hidden=true;$('import-local').disabled=false;});
 window.addEventListener('online',()=>{if(active)flush(active);});
 window.VeganielQuizSync={async clear(){const ctx=active;if(!ctx)return true;try{if(ctx.busy)await ctx.busy;await request(ctx,'rpc/clear_quiz_results',{});ctx.queue=[];persist(ctx);ctx.store.clear();status('Die Quiz-Bestwerte in deinem Konto wurden gelöscht.');return active===ctx;}catch{status('Die Kontodaten konnten nicht gelöscht werden. Bitte versuche es bei bestehender Verbindung erneut.');return false;}}};
 sb.auth.onAuthStateChange((_,next)=>setTimeout(()=>change(next),0));
 sb.auth.getSession().then(({data})=>change(data.session));
})();
