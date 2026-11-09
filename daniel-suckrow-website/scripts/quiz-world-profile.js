/* Lightweight, device-local game layer for the quiz world. */
(function(root){
  const KEY='veganiel.quiz-world-profile.v1';
  const isDay=n=>Number.isInteger(n)&&n>18000&&n<100000;
  function clean(raw){
    const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const daily=[...new Set(Array.isArray(value.daily)?value.daily.filter(isDay):[])].sort((a,b)=>a-b).slice(-90);
    const sprint=value.sprint&&typeof value.sprint==='object'?value.sprint:{};
    return {daily,sprint:{plays:Math.max(0,Math.min(999,Number.isInteger(sprint.plays)?sprint.plays:0)),best:Math.max(0,Math.min(8,Number.isInteger(sprint.best)?sprint.best:0))},duels:Math.max(0,Math.min(999,Number.isInteger(value.duels)?value.duels:0))};
  }
  function streak(days,today){
    const set=new Set(days);let total=0;for(let day=today;set.has(day);day--)total++;return total;
  }
  function rank(records,keys,profile){
    const valid=Object.entries(records||{}).filter(([key,row])=>keys.includes(key)&&row&&Number.isInteger(row.best)&&Number.isInteger(row.attempts));
    const attempts=valid.reduce((sum,[,row])=>sum+row.attempts,0);
    const mastered=valid.filter(([,row])=>row.best>=8).length;
    const perfect=valid.filter(([,row])=>row.best===10).length;
    const xp=attempts*20+mastered*30+perfect*40+profile.daily.length*15+profile.sprint.plays*10+profile.duels*10;
    const levels=[['Keimling',0],['Entdecker:in',160],['Wissenssammler:in',420],['Wegbereiter:in',840],['Veganiel-Insider',1400]];
    let current=levels[0],next=null;for(const level of levels){if(xp>=level[1])current=level;else{next=level;break;}}
    return {xp,attempts,mastered,perfect,name:current[0],current:current[1],next:next?.[1]??null,progress:next?Math.min(100,Math.round((xp-current[1])/(next[1]-current[1])*100)):100};
  }
  function achievements(records,keys,profile,today){
    const value=rank(records,keys,profile);
    return [
      {icon:'☀',name:'Erster Impuls',detail:'Tagesfrage beantworten',earned:profile.daily.length>=1},
      {icon:'⚡',name:'Blitzstart',detail:'Eine Blitzrunde spielen',earned:profile.sprint.plays>=1},
      {icon:'⏱',name:'Schnelldenker:in',detail:'6 von 8 in der Blitzrunde',earned:profile.sprint.best>=6},
      {icon:'↗',name:'Duell eröffnet',detail:'Eine Herausforderung teilen',earned:profile.duels>=1},
      {icon:'☘',name:'Drei-Tage-Flow',detail:'3 Tage in Folge die Tagesfrage',earned:streak(profile.daily,today)>=3},
      {icon:'✦',name:'Wissensfunke',detail:'Level Entdecker:in erreichen',earned:value.xp>=160}
    ];
  }
  function create(storage,key=KEY){
    let persistent=true,data;
    try{storage=storage||root.localStorage;data=clean(JSON.parse(storage.getItem(key)||'{}'));storage.setItem(key,JSON.stringify(data));}catch{persistent=false;data=clean({});}
    const save=()=>{try{if(persistent)storage.setItem(key,JSON.stringify(data));}catch{persistent=false;}};
    return {get persistent(){return persistent;},data:()=>JSON.parse(JSON.stringify(data)),recordDaily(day){if(!isDay(day))return false;if(data.daily.includes(day))return false;data.daily=[...data.daily,day].sort((a,b)=>a-b).slice(-90);save();return true;},recordSprint(score){if(!Number.isInteger(score)||score<0||score>8)return;data.sprint.plays=Math.min(999,data.sprint.plays+1);data.sprint.best=Math.max(data.sprint.best,score);save();},recordDuel(){data.duels=Math.min(999,data.duels+1);save();},streak(today){return streak(data.daily,today);}};
  }
  const api={create,rank,achievements,streak};if(typeof module!=='undefined')module.exports=api;else root.QuizWorldProfile=api;
})(typeof window!=='undefined'?window:globalThis);
