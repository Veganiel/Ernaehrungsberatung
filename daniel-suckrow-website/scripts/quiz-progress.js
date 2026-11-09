/* Guest/account-scoped browser cache; storage failure must never interrupt a round. */
(function(root){
  const KEY='veganiel.quiz-progress.v1';
  function create(storage,key=KEY){
    let persistent=true, data=Object.create(null);
    try {
      storage=storage || root.localStorage;
      const raw=JSON.parse(storage.getItem(key)||'{}');
      if(raw && typeof raw==='object' && !Array.isArray(raw)) for(const [key,r] of Object.entries(raw)) {
        if(r && Number.isInteger(r.best) && r.best>=0 && r.best<=10 && Number.isSafeInteger(r.attempts) && r.attempts>0) data[key]={best:r.best,attempts:r.attempts};
      }
      storage.setItem(key,JSON.stringify(data));
    } catch { persistent=false; }
    function save(){try {if(persistent)storage.setItem(key,JSON.stringify(data));}catch{persistent=false;}}
    return {
      get persistent(){return persistent;},
      records(){return JSON.parse(JSON.stringify(data));},
      record(key,score){
        if(typeof key!=='string'||!Number.isInteger(score)||score<0||score>10)return;
        const old=data[key];data[key]={best:Math.max(old?.best||0,score),attempts:Math.min((old?.attempts||0)+1,Number.MAX_SAFE_INTEGER)};save();
      },
      replace(records){data=Object.create(null);for(const [k,r] of Object.entries(records)){if(r&&Number.isInteger(r.best)&&r.best>=0&&r.best<=10&&Number.isSafeInteger(r.attempts)&&r.attempts>0)data[k]={best:r.best,attempts:r.attempts};}save();},
      clear(){data=Object.create(null);try{storage?.removeItem(key);}catch{persistent=false;}}
    };
  }
  const api={create};if(typeof module!=='undefined')module.exports=api;else root.QuizProgress=api;
})(typeof window!=='undefined'?window:globalThis);
