/* Lightweight, device-local game layer for the quiz world. */
(function(root){
  const KEY='veganiel.quiz-world-profile.v1';
  const isDay=n=>Number.isInteger(n)&&n>18000&&n<100000;
  function clean(raw){
    const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const daily=[...new Set(Array.isArray(value.daily)?value.daily.filter(isDay):[])].sort((a,b)=>a-b).slice(-90);
    const sprint=value.sprint&&typeof value.sprint==='object'?value.sprint:{};
    const fact=value.factcheck&&typeof value.factcheck==='object'?value.factcheck:{};
    const int=(v,max)=>Math.max(0,Math.min(max,Number.isInteger(v)?v:0));
    return {daily,sprint:{plays:int(sprint.plays,999),best:int(sprint.best,10)},duels:int(value.duels,999),factcheck:{plays:int(fact.plays,999),best:int(fact.best,10),combo:int(fact.combo,10)}};
  }
  function streak(days,today){
    const set=new Set(days);let total=0;for(let day=today;set.has(day);day--)total++;return total;
  }
  function rank(records,keys,profile){
    const valid=Object.entries(records||{}).filter(([key,row])=>keys.includes(key)&&row&&Number.isInteger(row.best)&&Number.isInteger(row.attempts));
    const attempts=valid.reduce((sum,[,row])=>sum+row.attempts,0);
    const mastered=valid.filter(([,row])=>row.best>=8).length;
    const perfect=valid.filter(([,row])=>row.best===10).length;
    const fact=profile.factcheck||{plays:0,best:0,combo:0};
    const xp=attempts*20+mastered*30+perfect*40+profile.daily.length*15+profile.sprint.plays*10+profile.duels*10+fact.plays*12+(fact.best===10?40:0)+fact.combo*3;
    const levels=[['Keimling',0],['Entdecker:in',160],['Wissenssammler:in',420],['Wegbereiter:in',840],['Veganiel-Insider',1400]];
    let current=levels[0],next=null;for(const level of levels){if(xp>=level[1])current=level;else{next=level;break;}}
    return {xp,attempts,mastered,perfect,name:current[0],current:current[1],next:next?.[1]??null,progress:next?Math.min(100,Math.round((xp-current[1])/(next[1]-current[1])*100)):100};
  }
  function achievements(records,keys,profile,today){
    const value=rank(records,keys,profile);
    return [
      {icon:'☀',name:'Erster Impuls',detail:'Tagesfrage beantworten',earned:profile.daily.length>=1},
      {icon:'⚡',name:'Blitzstart',detail:'Eine Blitzrunde spielen',earned:profile.sprint.plays>=1},
      {icon:'⏱',name:'Schnelldenker:in',detail:'8 von 10 in der Blitzrunde',earned:profile.sprint.best>=8},
      {icon:'↗',name:'Duell eröffnet',detail:'Eine Herausforderung teilen',earned:profile.duels>=1},
      {icon:'☘',name:'Drei-Tage-Flow',detail:'3 Tage in Folge die Tagesfrage',earned:streak(profile.daily,today)>=3},
      {icon:'✦',name:'Wissensfunke',detail:'Level Entdecker:in erreichen',earned:value.xp>=160},
      {icon:'⇄',name:'Faktenblick',detail:'Eine Runde Fakt oder Fake spielen',earned:(profile.factcheck?.plays||0)>=1},
      {icon:'◎',name:'Combo-Kette',detail:'5 Treffer in Folge bei Fakt oder Fake',earned:(profile.factcheck?.combo||0)>=5},
      {icon:'✓',name:'Fake-Detektor:in',detail:'10 von 10 bei Fakt oder Fake',earned:(profile.factcheck?.best||0)===10}
    ];
  }
  function create(storage,key=KEY){
    let persistent=true,data;
    try{storage=storage||root.localStorage;data=clean(JSON.parse(storage.getItem(key)||'{}'));storage.setItem(key,JSON.stringify(data));}catch{persistent=false;data=clean({});}
    const save=()=>{try{if(persistent)storage.setItem(key,JSON.stringify(data));}catch{persistent=false;}};
    return {get persistent(){return persistent;},data:()=>JSON.parse(JSON.stringify(data)),recordDaily(day){if(!isDay(day))return false;if(data.daily.includes(day))return false;data.daily=[...data.daily,day].sort((a,b)=>a-b).slice(-90);save();return true;},recordSprint(score){if(!Number.isInteger(score)||score<0||score>10)return;data.sprint.plays=Math.min(999,data.sprint.plays+1);data.sprint.best=Math.max(data.sprint.best,score);save();},recordDuel(){data.duels=Math.min(999,data.duels+1);save();},recordFactcheck(score,combo){if(!Number.isInteger(score)||score<0||score>10)return;const c=Number.isInteger(combo)?Math.max(0,Math.min(10,combo)):0;data.factcheck.plays=Math.min(999,data.factcheck.plays+1);data.factcheck.best=Math.max(data.factcheck.best,score);data.factcheck.combo=Math.max(data.factcheck.combo,c);save();},streak(today){return streak(data.daily,today);}};
  }
  const api={create,rank,achievements,streak};if(typeof module!=='undefined')module.exports=api;else root.QuizWorldProfile=api;
})(typeof window!=='undefined'?window:globalThis);
