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
const reference={male:[[40.1,48,55.2,61.8],[35.9,42.4,49,56.5],[31.9,37.8,45,52.1],[27.1,32.6,39.7,45.6],[23.7,28.2,34.5,40.3],[20.4,24.4,30.4,36.6]],female:[[30.5,37.6,44.7,51.3],[25.3,30.2,36.1,41.4],[22.1,26.7,32.4,38.4],[19.9,23.4,27.6,32],[17.2,20,23.8,27],[15.6,18.3,20.8,23.1]]};
function classify(value,age,sex){if(!Number.isFinite(value)||!Number.isInteger(age)||age<20||age>79||!['0','1'].includes(String(sex)))return null;const row=reference[sex==='1'?'male':'female'][Math.min(5,Math.max(0,Math.floor(age/10)-2))];const band=row.filter(x=>value>=x).length;const labels=typeof document!=='undefined'&&document.documentElement.lang==='en'?['Below average','Average','Good','Very good','Excellent']:['Unterdurchschnittlich','Durchschnittlich','Gut','Sehr gut','Ausgezeichnet'];return {label:labels[Math.min(4,band)],age,sex};}
if(typeof module!=='undefined')module.exports={estimate,classify};
if(typeof document==='undefined')return;
window.VeganielCalculators=window.VeganielCalculators||{};window.VeganielCalculators.vo2=estimate;
if(!document.getElementById('vo2-form'))return;
const form=document.getElementById('vo2-form'),method=document.getElementById('method'),result=document.getElementById('result'),error=document.getElementById('error');
method.addEventListener('change',()=>{for(const id of ['cooper','rockport']){const el=document.getElementById(id);el.hidden=el.disabled=id!==method.value;}result.hidden=true;error.hidden=true;});
form.addEventListener('input',()=>{result.hidden=true;error.hidden=true;});
form.addEventListener('invalid',()=>{result.hidden=true;error.hidden=false;},true);
form.addEventListener('submit',e=>{e.preventDefault();const v={};for(const [k,x] of new FormData(form))v[k]=x.trim()===''?NaN:Number(x);const n=estimate(method.value,v),rating=classify(n,v.age,String(v.sex));error.hidden=n!==null;result.hidden=n===null;if(n!==null){document.getElementById('value').textContent=n.toLocaleString(document.documentElement.lang,{minimumFractionDigits:1});document.getElementById('used').textContent=(method.value==='cooper'?'Cooper · 12 min':'Rockport · 1 mi')+(rating?' · '+rating.label:'');document.getElementById('rating').textContent=rating?rating.label:(document.documentElement.lang==='en'?'No age- and sex-specific comparison available.':'Keine alters- und geschlechtsbezogene Einordnung verfügbar.');}});
})();
