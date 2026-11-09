/* Private, browser-only result history for the member overview. */
(() => {
  const key='veganiel.wellbeing-history.v1',limit=18;
  const read=()=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}};
  const save=rows=>{try{localStorage.setItem(key,JSON.stringify(rows.slice(-limit)));}catch{}};
  const add=(kind,data)=>{if(!kind||!data)return;const rows=read();rows.push({kind,at:new Date().toISOString(),...data});save(rows);window.dispatchEvent(new CustomEvent('veganiel:wellbeing-history',{detail:{kind}}));};
  window.VeganielWellbeingHistory={read,add};
  const text=id=>document.getElementById(id)?.textContent?.trim()||'';
  document.addEventListener('submit',event=>{
    const form=event.target;
    setTimeout(()=>{
      if(form.id==='health-form'&&!document.getElementById('analysis')?.hidden){
        const score=document.querySelector('.habit-score .metric')?.textContent?.match(/(\d+)\s*\/\s*100/)?.[1];
        const total=[...document.querySelectorAll('.fitness-bonus strong')].map(x=>x.textContent).join(' ').match(/Gesamt:\s*(\d+)/)?.[1];
        const vo2=[...document.querySelectorAll('#analysis .result-card')].find(x=>x.querySelector('h3')?.textContent.includes('VO₂max'))?.querySelector('.metric')?.textContent?.match(/[\d,.]+/)?.[0];
        if(score)add('health',{score:Number(score),total:total?Number(total):null,vo2:vo2?Number(String(vo2).replace(',','.')):null});
      }
      if(form.id==='heart-form'&&!document.getElementById('heart-results')?.hidden){add('heart',{maximum:Number(text('max-hr')),zones:[1,2,3,4].map(i=>text('zone-'+i)),method:text('method')});}
      if(form.id==='vo2-form'&&!document.getElementById('result')?.hidden){const value=Number(text('value').replace(',','.'));if(Number.isFinite(value))add('vo2',{value,method:text('used'),ranking:text('rating')});}
      if(form.id==='waist-form'&&!document.getElementById('result')?.hidden){const ratio=Number(text('ratio').replace(',','.')),bmi=Number(text('bmi').replace(',','.'));if(Number.isFinite(ratio)&&Number.isFinite(bmi))add('waist',{ratio,bmi,category:text('category')});}
    },0);
  },true);
  const supplement=()=>{const total=Number(text('total').replace(/[^\d,.-]/g,'').replace(',','.'));const products=[...document.querySelectorAll('#results .product strong')].map(x=>x.textContent.trim()).filter(Boolean);if(Number.isFinite(total)&&products.length)add('supplements',{total,products});};
  document.addEventListener('input',event=>{if(event.target.closest?.('#budget,#winter,#eggs,.price-settings'))setTimeout(supplement,0);});
  window.dispatchEvent(new Event('veganiel:wellbeing-history-ready'));
})();
