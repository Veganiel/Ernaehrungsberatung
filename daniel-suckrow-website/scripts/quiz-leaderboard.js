(() => {
  const sb=window.VeganielMember?.client, $=id=>document.getElementById(id);
  if(!sb || !$('weekly-leaders')) return;
  const medal={gold:'🥇',silver:'🥈',bronze:'🥉'};
  const safeText=value=>String(value??'').slice(0,80);
  function weekLabel(value){
    const day=new Date(value+'T12:00:00Z');
    return 'Woche vom '+new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(day);
  }
  function writeLeaders(rows){
    const box=$('weekly-leaders'); box.replaceChildren();
    if(!rows.length){box.innerHTML='<li class="leaderboard-empty">Noch ist die Liga offen. Starte ein Quiz und sichere dir den ersten Platz.</li>';return;}
    rows.forEach(row=>{const item=document.createElement('li');item.innerHTML='<span class="place"></span><strong></strong><span class="leader-score"></span>';item.querySelector('.place').textContent=row.placement<=3?['🥇','🥈','🥉'][row.placement-1]:String(row.placement).padStart(2,'0');item.querySelector('strong').textContent=safeText(row.name);item.querySelector('.leader-score').textContent=row.points+' P.'+(row.perfect_scores?' · '+row.perfect_scores+'× 10/10':'');box.append(item);});
  }
  function writeHistory(rows){
    const box=$('leaderboard-history');box.replaceChildren();
    if(!rows.length){box.textContent='Die Hall of Fame füllt sich mit dem ersten abgeschlossenen Wochenranking.';return;}
    const weeks=new Map();rows.forEach(row=>{if(!weeks.has(row.week_start))weeks.set(row.week_start,[]);weeks.get(row.week_start).push(row)});
    [...weeks].forEach(([week,people])=>{const group=document.createElement('div');group.className='history-week';const title=document.createElement('p');title.textContent=weekLabel(week);group.append(title);people.slice(0,3).forEach(row=>{const entry=document.createElement('span');entry.textContent=(['🥇','🥈','🥉'][row.placement-1]||row.placement+'.')+' '+safeText(row.name)+' · '+row.points+' P.';group.append(entry)});box.append(group);});
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
    $('leaderboard-signin').hidden=!!current;$('leaderboard-settings').hidden=!current;
    if(current){$('quiz-account-link').hidden=true;if($('quiz-account-status').textContent.startsWith('Ohne Konto'))$('quiz-account-status').textContent='Angemeldet. Deine Quizdaten werden mit deinem Konto verbunden.';$('leaderboard-settings-copy').textContent='Aktiviere die Teilnahme, damit deine kommenden Quizrunden für die Wochenliga zählen.';}
    try {const {data,error}=await sb.rpc('get_quiz_leaderboard',{history_weeks:12});if(error)throw error;writeLeaders(data?.leaders||[]);writeHistory(data?.history||[]);writeMedals(data?.viewer_medals);if(current){$('leaderboard-opt-in').checked=!!data?.viewer_participates;$('leaderboard-settings-copy').textContent=data?.viewer_participates?'Du spielst diese Woche mit. Dein öffentlicher Anzeigename ist in der Top 10 sichtbar.':'Aktiviere die Teilnahme, damit deine kommenden Quizrunden für die Wochenliga zählen.';}note.textContent='Diese Woche endet Sonntag um Mitternacht. Die nächste Woche beginnt direkt danach.';}catch{note.textContent='Die Rangliste ist gerade nicht erreichbar. Deine Quizrunde bleibt davon unberührt.';}
  }
  $('leaderboard-settings')?.addEventListener('submit',async event=>{event.preventDefault();const button=$('leaderboard-save');button.disabled=true;try{const {error}=await sb.rpc('set_quiz_leaderboard_participation',{enabled:$('leaderboard-opt-in').checked});if(error)throw error;await load();}catch{$('leaderboard-settings-copy').textContent='Die Einstellung konnte gerade nicht gespeichert werden. Bitte versuche es erneut.';}finally{button.disabled=false;}});
  window.VeganielQuizLeaderboard={refresh:load};
  sb.auth.onAuthStateChange(()=>setTimeout(load,0));load();
})();
