(() => {
  'use strict';
  const months = [
    ['Stille unter Schnee','#b2cadb','#eef6fa','#d5e3ea',[],0,'snow'],
    ['Das erste Erwachen','#c9dbe0','#f0ece0','#9aab83',[],0,'flowers'],
    ['Knospen voller Vorfreude','#c4d9db','#f2ecce','#91aa73',['#a4b56c','#c4ca89'],18,'buds'],
    ['Sonne trifft auf Regen','#9fcddd','#f6edcf','#88b666',['#a5c879','#bfd994'],60,'rainbow'],
    ['Alles wird lebendig','#b4dce5','#f6f2d7','#78aa61',['#91bb58','#aad16d','#77a64b'],180,'sun'],
    ['Licht bis in den Abend','#8fc9df','#eef0c4','#68984e',['#629b46','#79aa4d','#528b40'],230,'sun'],
    ['Sommer in voller Kraft','#68b8d5','#ffe8a4','#aaac60',['#34763b','#428541','#286137'],260,'heat'],
    ['Sattes Grün, reife Tage','#8bc4d5','#f6e6bd','#8c9d50',['#2c6339','#3c7640','#345e37'],245,'sun'],
    ['Ein Hauch von Gold','#b3d0d4','#f3e4bd','#a6a15f',['#568445','#79984b','#d3b945'],200,'wind'],
    ['Ein Fest der Farben','#c3ced1','#f0d5b0','#b08b53',['#c55c33','#df9e38','#ba4731','#d4b04a'],170,'leaves'],
    ['Die letzten goldenen Blätter','#b2bdc6','#ddd8cd','#8a8464',['#bd9a3b','#d3b14b'],15,'rain'],
    ['Ruhe kehrt zurück','#a8becd','#e5edf1','#d5e1e4',[],0,'snow']
  ];
  const dot = (x,y,r,color,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
  function scene(index, suffix='card') {
    const [label,sky,horizon,ground,colors,count,weather]=months[index], id=`season-${index}-${suffix}`;
    let leaves='',particles='',branches='';
    for(let i=0;i<25;i++){const angle=i*2.39996, radius=23+(i%6)*7,x=180+Math.cos(angle)*radius,y=102+Math.sin(angle)*radius*.8;branches+=`<path d="M180 184 Q${172+(i%3)*8} 130 ${x.toFixed(1)} ${y.toFixed(1)}" stroke-width="${i%3+1}"/>`;}
    for(let i=0;i<count;i++){const angle=i*2.39996,r=Math.sqrt((i+.5)/count)*67,x=180+Math.cos(angle)*r,y=96+Math.sin(angle)*r*.74;leaves+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${weather==='buds'?2.6:5+i%4}" ry="${weather==='buds'?3.5:3+i%3}" transform="rotate(${i*37%180} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${colors[i%colors.length]}"/>`;}
    if(['snow','rain','rainbow'].includes(weather))for(let i=0;i<42;i++){const x=i*83%360,y=i*47%190;particles+=weather==='snow'?dot(x,y,1+i%2,'#fff','opacity=".8"'):`<path d="M${x} ${y}l-3 9" stroke="#7198af" stroke-opacity=".45"/>`;}
    if(['wind','leaves'].includes(weather))for(let i=0;i<12;i++)particles+=`<ellipse cx="${i*67%360}" cy="${100+i*17%100}" rx="4" ry="2" fill="${colors[i%colors.length]}" transform="rotate(-25)"/>`;
    let flowers='';if(weather==='flowers')for(let i=0;i<18;i++){const x=20+i*19,y=188+i%3*7;flowers+=`<path d="M${x} ${y+8}q-3-8 0-12" stroke="#50764c" fill="none"/>${dot(x,y-5,3,i%2?'#f8f8e7':'#b99ec9')}`;}
    const rainbow=weather==='rainbow'?['#d57c78','#dfb873','#e2d687','#95b59b','#8baac2'].map((c,i)=>`<path d="M224 140a${65-i*4} ${65-i*4} 0 0 1 ${130-i*8} 0" stroke="${c}" stroke-width="4" fill="none" opacity=".65"/>`).join(''):'';
    return `<svg class="season-landscape" viewBox="0 0 360 220" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/></linearGradient></defs><rect width="360" height="220" fill="url(#${id})"/>${dot(287,48,weather==='heat'?36:24,'#fff2b7','class="sun-halo" opacity=".6"')}${dot(287,48,weather==='heat'?22:15,weather==='heat'?'#ffd16b':'#fff6d9')}${rainbow}<g class="cloud" fill="#fff" opacity=".38"><ellipse cx="65" cy="43" rx="48" ry="13"/><ellipse cx="91" cy="37" rx="27" ry="15"/></g><path d="M0 177Q80 147 165 172T360 161V220H0Z" fill="${ground}"/><path d="M0 207Q130 170 360 203V220H0Z" fill="${ground}" opacity=".6"/><ellipse cx="183" cy="201" rx="63" ry="7" fill="#344f3b" opacity=".12"/><g class="crown"><g fill="none" stroke="#695440" stroke-linecap="round">${branches}<path d="M180 200Q176 151 181 100" stroke-width="7"/></g>${leaves}</g>${flowers}<g class="weather">${particles}</g></svg>`;
  }
  document.querySelectorAll('.month').forEach((card,i)=>{
    card.querySelector('.season-scene').innerHTML=scene(i);
    const caption=document.createElement('p');caption.className='month-poetry';caption.textContent=months[i][0];card.querySelector('h3').after(caption);
  });
  const now=new Date().getMonth();document.querySelector('.now-art').innerHTML=scene(now,'hero');document.querySelector('.now-art').removeAttribute('aria-hidden');
  document.querySelector('.hero h1').innerHTML='Mit den Jahreszeiten <em>genießen.</em>';
  document.querySelector('.section-head h2').innerHTML='Zwölf Monate.<br><em>Immer neu entdecken.</em>';
  const note=document.createElement('p');note.className='season-caption';note.textContent='Ein illustrierter Jahreslauf für Deutschland. Wetter und Blattaustrieb unterscheiden sich je nach Region und Jahr.';document.querySelector('.season-switch').before(note);
})();
