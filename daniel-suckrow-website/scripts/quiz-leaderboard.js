(() => {
  const style=document.createElement('link');style.rel='stylesheet';style.href='styles/leaderboard-avatars.css';document.head.append(style);
  const sb=window.VeganielMember?.client, $=id=>document.getElementById(id);
  if(!$('weekly-leaders')) return;
  const intro=document.querySelector('.leaderboard-intro');
  if(intro) intro.textContent='Bei Themen-Quizzen zählt dein erster Versuch. In der Blitzrunde zählt dein bestes Wochen-Ergebnis inklusive Zeitbonus – und jede Woche beginnt neu.';
  if(!sb){$('weekly-leaders').innerHTML='<li class="leaderboard-empty">Die Kontoverbindung wird gerade nicht geladen.</li>';$('leaderboard-status').textContent='Bitte lade die Seite einmal neu. Deine Quizdaten bleiben erhalten.';return;}
  const medal={gold:'🥇',silver:'🥈',bronze:'🥉'};
  const safeText=value=>String(value??'').slice(0,80);
  const initials=name=>safeText(name).trim().split(/\s+/).map(word=>word[0]||'').join('').slice(0,2).toUpperCase()||'V';
  const avatar=(url,name)=>{const node=document.createElement('span');node.className='leader-avatar';if(url){const image=document.createElement('img');image.src=url;image.alt='';node.append(image);}else node.textContent=initials(name);return node;};
  async function withAvatars(rows){const names=[...new Set(rows.map(row=>safeText(row.name)).filter(Boolean))];if(!names.length)return rows;const {data}=await sb.from('profiles').select('display_name,avatar_url').in('display_name',names);const urls=new Map((data||[]).map(profile=>[profile.display_name,profile.avatar_url]));return rows.map(row=>({...row,avatar_url:row.avatar_url||urls.get(row.name)||''}));}
  function weekLabel(value){
    const day=new Date(value+'T12:00:00Z');
    return 'Woche vom '+new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(day);
  }
  function writeLeaders(rows){
    const box=$('weekly-leaders'); box.replaceChildren();
    if(!rows.length){box.innerHTML='<li class="leaderboard-empty">Noch ist die Liga offen. Starte ein Quiz und sichere dir den ersten Platz.</li>';return;}
    rows.forEach(row=>{const item=document.createElement('li');item.innerHTML='<span class="place"></span><span class="leader-person"><strong></strong></span><span class="leader-score"></span>';item.querySelector('.place').textContent=row.placement<=3?['🥇','🥈','🥉'][row.placement-1]:String(row.placement).padStart(2,'0');item.querySelector('.leader-person').prepend(avatar(row.avatar_url,row.name));item.querySelector('strong').textContent=safeText(row.name);item.querySelector('.leader-score').textContent=row.points+' P.'+(row.perfect_scores?' · '+row.perfect_scores+'× 10/10':'');box.append(item);});
  }
  function writeHistory(rows){
    const box=$('leaderboard-history');box.replaceChildren();
    if(!rows.length){box.textContent='Die Hall of Fame füllt sich mit dem ersten abgeschlossenen Wochenranking.';return;}
    const weeks=new Map();rows.forEach(row=>{if(!weeks.has(row.week_start))weeks.set(row.week_start,[]);weeks.get(row.week_start).push(row)});
    [...weeks].forEach(([week,people])=>{const group=document.createElement('div');group.className='history-week';const title=document.createElement('p');title.textContent=weekLabel(week);group.append(title);people.slice(0,3).forEach(row=>{const entry=document.createElement('span');entry.className='history-person';entry.append(document.createTextNode((['🥇','🥈','🥉'][row.placement-1]||row.placement+'.')+' '),avatar(row.avatar_url,row.name),document.createTextNode(safeText(row.name)+' · '+row.points+' P.'));group.append(entry)});box.append(group);});
  }
  function writeMedals(value){
    const count=value||{},box=$('leaderboard-medals');if(!box)return;
    const total=(count.gold||0)+(count.silver||0)+(count.bronze||0);
    box.textContent=total?'Deine Liga-Abzeichen: '+['gold','silver','bronze'].filter(k=>count[k]).map(k=>medal[k]+' '+count[k]).join(' · '):'Deine Liga-Abzeichen erscheinen hier, sobald du unter die ersten drei kommst.';
  }
  async function session(){const {data}=await sb.auth.getSession();return data.session;}
  async function load(){
    const note=$('leaderboard-status');
    const current=await session();
    $('leaderboard-settings')?.remove();$('leaderboard-signin').hidden=!!current;
    if(current){$('quiz-account-link').hidden=true;if($('quiz-account-status').textContent.startsWith('Ohne Konto'))$('quiz-account-status').textContent='Angemeldet. Deine Quizdaten werden mit deinem Konto verbunden.';if(current.user.user_metadata?.leaderboard_opt_in)await sb.rpc('set_quiz_leaderboard_participation',{enabled:true});}
    try {const {data,error}=await sb.rpc('get_quiz_leaderboard',{history_weeks:12});if(error)throw error;const leaders=await withAvatars(data?.leaders||[]),history=await withAvatars(data?.history||[]);writeLeaders(leaders);writeHistory(history);writeMedals(data?.viewer_medals);note.textContent='Diese Woche endet Sonntag um Mitternacht. Die nächste Woche beginnt direkt danach.';}catch{writeLeaders([]);writeHistory([]);note.textContent='Die Rangliste ist gerade nicht erreichbar. Deine Quizrunde bleibt davon unberührt.';}
  }
  window.VeganielQuizLeaderboard={refresh:load};
  sb.auth.onAuthStateChange(()=>setTimeout(load,0));load();
})();
