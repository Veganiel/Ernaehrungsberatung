/* Quiz results stay on this device; storage failure must never interrupt a round. */
(function(root){
  const KEY='veganiel.quiz-progress.v1';
  function create(storage){
    let persistent=true, data=Object.create(null);
    try {
      storage=storage || root.localStorage;
      const raw=JSON.parse(storage.getItem(KEY)||'{}');
      if(raw && typeof raw==='object' && !Array.isArray(raw)) for(const [key,r] of Object.entries(raw)) {
        if(r && Number.isInteger(r.best) && r.best>=0 && r.best<=10 && Number.isSafeInteger(r.attempts) && r.attempts>0) data[key]={best:r.best,attempts:r.attempts};
      }
      storage.setItem(KEY,JSON.stringify(data));
    } catch { persistent=false; }
    function save(){try {if(persistent)storage.setItem(KEY,JSON.stringify(data));}catch{persistent=false;}}
    return {
      get persistent(){return persistent;},
      records(){return JSON.parse(JSON.stringify(data));},
      record(key,score){
        if(typeof key!=='string'||!Number.isInteger(score)||score<0||score>10)return;
        const old=data[key];data[key]={best:Math.max(old?.best||0,score),attempts:Math.min((old?.attempts||0)+1,Number.MAX_SAFE_INTEGER)};save();
      },
      clear(){data=Object.create(null);try{storage?.removeItem(KEY);}catch{persistent=false;}}
    };
  }
  const api={create};if(typeof module!=='undefined')module.exports=api;else root.QuizProgress=api;
})(typeof window!=='undefined'?window:globalThis);
