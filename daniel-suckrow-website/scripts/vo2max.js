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
if(typeof module!=='undefined')module.exports={estimate};
if(typeof document==='undefined')return;
const form=document.getElementById('vo2-form'),method=document.getElementById('method'),result=document.getElementById('result'),error=document.getElementById('error');
method.addEventListener('change',()=>{for(const id of ['cooper','rockport']){const el=document.getElementById(id);el.hidden=el.disabled=id!==method.value;}result.hidden=true;error.hidden=true;});
form.addEventListener('input',()=>{result.hidden=true;error.hidden=true;});
form.addEventListener('invalid',()=>{result.hidden=true;error.hidden=false;},true);
form.addEventListener('submit',e=>{e.preventDefault();const v={};for(const [k,x] of new FormData(form))v[k]=x.trim()===''?NaN:Number(x);const n=estimate(method.value,v);error.hidden=n!==null;result.hidden=n===null;if(n!==null){document.getElementById('value').textContent=n.toLocaleString(document.documentElement.lang,{minimumFractionDigits:1});document.getElementById('used').textContent=method.value==='cooper'?'Cooper · 12 min':'Rockport · 1 mi';}});
})();
