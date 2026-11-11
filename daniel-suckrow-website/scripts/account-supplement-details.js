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
    const card=document.querySelector('.overview-card[data-kind="supplements"]'),items=await products(saved());
    if(!card||!items.length)return false;
    let list=card.querySelector('.oc-chips');
    if(!list){list=document.createElement('div');list.className='oc-chips';const foot=card.querySelector('.oc-foot');foot?foot.before(list):card.append(list);}
    list.replaceChildren(...items.map(name=>{const chip=document.createElement('span');chip.className='oc-chip';chip.textContent=name;return chip;}));
    return true;
  };
  let attempts=0;
  const timer=setInterval(async()=>{attempts++;if(await update()||attempts>=30)clearInterval(timer);},250);
})();
