(() => {
  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
  const loadCore=()=>window.VeganielCalculators?.supplements?Promise.resolve(window.VeganielCalculators.supplements):new Promise(resolve=>{const script=document.createElement('script');script.src='scripts/supplement-core.js';script.onload=()=>resolve(window.VeganielCalculators?.supplements);script.onerror=()=>resolve(null);document.head.append(script);});
  const saved=()=>{
    const direct=read('veganiel.supplement-calculator.v1');
    if(direct?.touched&&Array.isArray(direct.products)&&direct.products.length)return direct;
    const history=read('veganiel.wellbeing-history.v1');
    return [...(Array.isArray(history)?history:[])].reverse().find(row=>row?.kind==='supplements')||null;
  };
  const products=async entry=>{
    if(!entry)return [];
    const select=await loadCore(),total=Math.round(Number(entry.total)*100);
    if(select&&Number.isFinite(total)){
      for(const winter of [true,false])for(const eggs of [false,true])for(let budget=5;budget<=300;budget++){
        const chosen=select(budget,{winter,eggs}).chosen;
        if(Math.round(chosen.reduce((sum,item)=>sum+item.monthly,0)*100)===total)return chosen.map(item=>item.name);
      }
    }
    return Array.isArray(entry.products)?entry.products:[];
  };
  const update=async()=>{
    const card=[...document.querySelectorAll('.overview-card')].find(node=>node.querySelector('.overview-label')?.textContent==='SUPPLEMENT-AUSWAHL');
    const text=card?.querySelector('p:not(.overview-label)'),items=await products(saved());
    if(!text||!items.length)return false;
    text.textContent=items.join(' · ');
    return true;
  };
  let attempts=0;
  const timer=setInterval(async()=>{attempts++;if(await update()||attempts>=30)clearInterval(timer);},250);
})();
