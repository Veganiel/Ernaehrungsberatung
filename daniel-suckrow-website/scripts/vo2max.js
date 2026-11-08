(function(){
'use strict';
function estimate(method,v){
 const finite=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
 let n;
 if(method==='cooper') {if(!finite(v.distance,600,6000))return null;n=(v.distance-504.9)/44.73;}
 else if(method==='rockport'){
 if(!finite(v.age,30,69)||!Number.isInteger(v.age)||!finite(v.weight,30,250)||![0,1].includes(v.sex)||!finite(v.minutes,6,40)||!Number.isInteger(v.minutes)||!finite(v.seconds,0,59)||!Number.isInteger(v.seconds)||!finite(v.pulse,40,220))return null;
 n=132.853-.0769*v.weight*2.2046226218-.3877*v.age+6.315*v.sex-3.2649*(v.minutes+v.seconds/60)-.1565*v.pulse;
 }else return null;
 return finite(n,5,90)?Math.round(n*10)/10:null;
}
// FRIEND 2015, Table 3, treadmill CPX: P25, P50, P75, P90; ages 20–79.
// Editorial points are separate from published reference data and are not clinically validated.
const fitnessReference={
'1':[[40.1,48,55.2,61.8],[35.9,42.4,49.2,56.5],[31.9,37.8,45,52.1],[27.1,32.6,39.7,45.6],[23.7,28.2,34.5,40.3],[20.4,24.4,30.4,36.6]],
'0':[[30.5,37.6,44.7,51.3],[25.3,30.2,36.1,41.4],[22.1,26.7,32.4,38.4],[19.9,23.4,27.6,32],[17.2,20,23.8,27],[15.6,18.3,20.8,23.1]]};
// FRIEND 2015, Table 3: P95 by age decade, 20–29 through 70–79.
const fitnessTopFive = {
  '1': [66.3, 59.8, 55.6, 50.7, 43, 39.7],
  '0': [56, 45.8, 41.7, 35.9, 29.4, 24.1]
};
function classify(value,age,sex){
  sex=String(sex);
  if(!Number.isFinite(value)||value<=0||!Number.isInteger(age)||age<20||age>79||!['0','1'].includes(sex))return null;
  const index=Math.floor(age/10)-2;
  const thresholds=fitnessReference[sex][index];
  const band=thresholds.filter(x=>value>=x).length;
  return {thresholds,band,topFive:value>=fitnessTopFive[sex][index],ageFrom:(index+2)*10,ageTo:(index+2)*10+9,sex};
}
function rankingText(rating,lang){
  const ranges=['25','50–75','25–50','10–25','5–10'];
  const percent=rating.topFive?'5':ranges[rating.band];
  const ages=rating.ageFrom+'–'+rating.ageTo;
  if(lang==='en')return (rating.band===0?'Bottom ':'Top ')+percent+'% of your age group ('+(rating.sex==='1'?'men':'women')+', ages '+ages+').';
  return (rating.band===0?'Untere ':'Top ')+percent+' % deiner Altersgruppe ('+(rating.sex==='1'?'Männer':'Frauen')+', '+ages+' Jahre).';
}
if(typeof module!=='undefined')module.exports={estimate,classify,rankingText};
if(typeof document==='undefined')return;
window.VeganielCalculators=window.VeganielCalculators||{};window.VeganielCalculators.vo2=estimate;window.VeganielCalculators.vo2Classify=classify;window.VeganielCalculators.vo2RankingText=rankingText;
if(!document.getElementById('vo2-form'))return;
const form=document.getElementById('vo2-form'),method=document.getElementById('method'),result=document.getElementById('result'),error=document.getElementById('error');
method.addEventListener('change',()=>{for(const id of ['cooper','rockport']){const el=document.getElementById(id);el.hidden=el.disabled=id!==method.value;}result.hidden=true;error.hidden=true;});
form.addEventListener('input',()=>{result.hidden=true;error.hidden=true;});
form.addEventListener('invalid',()=>{result.hidden=true;error.hidden=false;},true);
form.addEventListener('submit',e=>{e.preventDefault();const v={};for(const [k,x] of new FormData(form))v[k]=x.trim()===''?NaN:Number(x);const n=estimate(method.value,v),rating=classify(n,v.age,String(v.sex));error.hidden=n!==null;result.hidden=n===null;if(n!==null){document.getElementById('value').textContent=n.toLocaleString(document.documentElement.lang,{minimumFractionDigits:1});document.getElementById('used').textContent=(method.value==='cooper'?'Cooper · 12 min':'Rockport · 1 mi');document.getElementById('rating').textContent=rating?rankingText(rating,document.documentElement.lang):(document.documentElement.lang==='en'?'No age- and sex-specific comparison available.':'Keine alters- und geschlechtsbezogene Einordnung verfügbar.');}});
})();
