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
    // Illustrative monthly progression requested for the calendar, not an astronomical measurement.
    const sunY=[139,122,102,80,60,44,36,53,77,103,127,148][index];
    const [label,sky,horizon,ground,colors,count,weather]=months[index], id=`season-${index}-${suffix}`;
    let leaves='',particles='',branches='',terrain='';
    const tips=[];
    // Deterministic branching keeps the same natural silhouette through all twelve months.
    function branch(x,y,len,angle,depth,seed){
      const ex=x+Math.cos(angle)*len,ey=y+Math.sin(angle)*len;
      branches+=`<path d="M${x} ${y}Q${(x+ex)/2+Math.sin(seed)*3} ${(y+ey)/2} ${ex} ${ey}" stroke-width="${Math.max(.45,depth*1.35)}"/>`;
      if(depth===0){tips.push([ex,ey]);return;}
      branch(ex,ey,len*.73,angle-.36-Math.abs(Math.sin(seed))*.25,depth-1,seed+2);
      branch(ex,ey,len*.72,angle+.3+Math.abs(Math.cos(seed))*.26,depth-1,seed+7);
      if(depth===2)branch(ex,ey,len*.64,angle+.08,depth-1,seed+13);
    }
    branch(180,199,46,-1.59,5,4);
    if(count)tips.forEach(([x,y],i)=>{
      const sparse=weather==='buds'||weather==='rain';
      if(weather==='rain'&&i%7!==0)return;
      const n=sparse?1:weather==='rainbow'?5:14;
      for(let j=0;j<n;j++){
        const angle=(i*23+j*137.5)*Math.PI/180,r=sparse?0:Math.sqrt(j)*3.3,px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r*.8;
        const color=colors[(i+j)%colors.length],size=weather==='buds'?1.8:3.3+(i+j)%3;
        leaves+=`<g transform="translate(${px} ${py}) rotate(${i*39+j*53})"><path d="M0 ${-size}Q${size} 0 0 ${size}Q${-size*.8} 0 0 ${-size}" fill="${color}"/><path d="M0 ${-size*.7}V${size*.7}" stroke="#faf7cb" stroke-width=".28" opacity=".3"/></g>`;
      }
    });
    for(let i=0;i<180;i++){const x=i*83%360,y=185+i*17%35;terrain+=`<path d="M${x} ${y}q-2 -3 ${i%4-2} ${-3-i%5}" stroke="${weather==='snow'?'#b4c9d1':'#566f3f'}" stroke-width=".5" opacity=".24"/>`;}
    if(['wind','leaves','rain'].includes(weather))for(let i=0;i<40;i++)terrain+=`<ellipse cx="${100+i*31%170}" cy="${194+i*7%23}" rx="3" ry="1.2" fill="${colors[i%colors.length]}" opacity=".65"/>`;
    if(['snow','rain','rainbow'].includes(weather))for(let i=0;i<42;i++){const x=i*83%360,y=i*47%190;particles+=weather==='snow'?dot(x,y,1+i%2,'#fff','opacity=".8"'):`<path d="M${x} ${y}l-3 9" stroke="#7198af" stroke-opacity=".45"/>`;}
    if(['wind','leaves'].includes(weather))for(let i=0;i<12;i++)particles+=`<ellipse cx="${i*67%360}" cy="${100+i*17%100}" rx="4" ry="2" fill="${colors[i%colors.length]}" transform="rotate(-25)"/>`;
    let flowers=terrain;if(weather==='flowers')for(let i=0;i<18;i++){const x=20+i*19,y=188+i%3*7;flowers+=`<path d="M${x} ${y+8}q-3-8 0-12" stroke="#50764c" fill="none"/>${dot(x,y-5,3,i%2?'#f8f8e7':'#b99ec9')}`;}
    const rainbow=weather==='rainbow'?['#d57c78','#dfb873','#e2d687','#95b59b','#8baac2'].map((c,i)=>`<path d="M224 140a${65-i*4} ${65-i*4} 0 0 1 ${130-i*8} 0" stroke="${c}" stroke-width="4" fill="none" opacity=".65"/>`).join(''):'';
    return `<svg class="season-landscape" viewBox="0 0 360 220" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="${id}-light"><stop stop-color="#fff9dd" stop-opacity=".65"/><stop offset="1" stop-color="#fff9dd" stop-opacity="0"/></radialGradient><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/></linearGradient></defs><rect width="360" height="220" fill="url(#${id})"/>${dot(287,sunY,weather==='heat'?36:24,'#fff2b7','class="sun-halo" opacity=".6"')}${dot(287,sunY,weather==='heat'?22:15,weather==='heat'?'#ffd16b':'#fff6d9')}<ellipse cx="287" cy="${sunY}" rx="110" ry="80" fill="url(#${id}-light)"/>${rainbow}<g class="cloud" fill="#fff" opacity=".38"><ellipse cx="65" cy="43" rx="48" ry="13"/><ellipse cx="91" cy="37" rx="27" ry="15"/></g><path d="M0 168Q50 116 110 153T240 142T360 160V220H0Z" fill="#7d9990" opacity=".22"/><path d="M0 172Q110 140 210 164T360 150V220H0Z" fill="#6a8b77" opacity=".18"/><path d="M0 177Q80 147 165 172T360 161V220H0Z" fill="${ground}"/><path d="M0 207Q130 170 360 203V220H0Z" fill="${ground}" opacity=".6"/><ellipse cx="183" cy="201" rx="63" ry="7" fill="#344f3b" opacity=".12"/><g class="crown"><g fill="none" stroke="#695440" stroke-linecap="round">${branches}<path d="M180 200Q176 151 181 100" stroke-width="7"/></g>${leaves}</g>${flowers}<g class="weather">${particles}</g></svg>`;
  }
  document.querySelectorAll('.month').forEach((card,i)=>{
    card.querySelector('.season-scene').innerHTML=scene(i);
    const caption=document.createElement('p');caption.className='month-poetry';caption.textContent=months[i][0];card.querySelector('h3').after(caption);
  });
  const now=new Date().getMonth();document.querySelector('.now-art').innerHTML=scene(now,'hero');document.querySelector('.now-art').removeAttribute('aria-hidden');
  document.querySelector('.hero h1').innerHTML='Mit den Jahreszeiten <em>genießen.</em>';
  document.querySelector('.section-head h2').innerHTML='Zwölf Monate.<br><em>Immer neu entdecken.</em>';
  const fruitSelection=[
    ['Äpfel (Lagerware)','Birnen (Lagerware)'],
    ['Äpfel (Lagerware)'],
    ['Äpfel (Lagerware)'],
    ['Äpfel (Lagerware)'],
    ['Äpfel (Lagerware)','Erdbeeren (Saisonbeginn)'],
    ['Erdbeeren','Süßkirschen','Himbeeren','Johannisbeeren','Stachelbeeren'],
    ['Erdbeeren','Süßkirschen','Sauerkirschen','Himbeeren','Heidelbeeren','Johannisbeeren','Stachelbeeren','Aprikosen'],
    ['Äpfel','Birnen','Pflaumen','Zwetschgen','Mirabellen','Renekloden','Brombeeren','Heidelbeeren','Himbeeren','Pfirsiche'],
    ['Äpfel','Birnen','Zwetschgen','Pflaumen','Brombeeren','Himbeeren','Tafeltrauben','Holunderbeeren (nur erhitzt)'],
    ['Äpfel','Birnen','Quitten','Tafeltrauben'],
    ['Äpfel (Lagerware)','Birnen (Lagerware)'],
    ['Äpfel (Lagerware)','Birnen (Lagerware)']
  ];
  document.querySelectorAll('.month').forEach((card,i)=>{
    card.querySelectorAll('li.fruit').forEach(item=>item.remove());
    const list=card.querySelector('ul');
    fruitSelection[i].forEach(name=>{const li=document.createElement('li');li.className='fruit';li.textContent=name;list.append(li);});
    // Rhabarber is botanically a vegetable and remains available under the vegetable filter.
    if(i>=3&&i<=5){const li=document.createElement('li');li.textContent='Rhabarber';list.append(li);}
  });
  const reference=document.createElement('p');reference.className='season-caption';
  reference.innerHTML='Obst aus deutschem Anbau: typische Erntezeit oder ausdrücklich markierte Lagerware. Im Winter ist die regionale Obstauswahl kleiner. Saisonbeginn und Verfügbarkeit variieren nach Region, Sorte und Wetter. Orientierung: <a href="https://www.bzfe.de/kueche-und-alltag/einkaufen/der-saisonkalender/">Saisonkalender des Bundeszentrums für Ernährung</a>.';
  document.querySelector('#month-grid').after(reference);
  const note=document.createElement('p');note.className='season-caption';note.textContent='Ein illustrierter Jahreslauf für Deutschland. Wetter und Blattaustrieb unterscheiden sich je nach Region und Jahr.';document.querySelector('.season-switch').before(note);
})();
