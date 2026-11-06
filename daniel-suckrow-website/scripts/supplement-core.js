/* Shared budget algorithm extracted from the existing calculator; parity checked in tests. */
(function(){
const supplements = [
 {id:"algae",name:"Algenöl (EPA/DHA)",monthly:7.80,detail:"Hohe Priorität direkt nach der Basis · bestehender Beispielpreis"},
 {id:"nac",name:"NAC",monthly:1.80,detail:"600 mg täglich · hohe Priorität nach Algenöl"},
 {id:"vitc",name:"Vitamin C",monthly:1.20,detail:"Bestehender Beispielpreis · hohe Priorität nach Algenöl und NAC"},
 {id:"dk",name:"Vitamin D3 + K2 (im Winter)",monthly:3,detail:"Nur bei aktivierter Winter-Auswahl · Beispielpreis; Gesamtzufuhr aus Basispräparat prüfen"},
 {id:"glycine",name:"Glycin",monthly:3,detail:"5 g täglich · vor Kreatin priorisiert"},
 {id:"creatine",name:"Kreatin",monthly:3,detail:"3 g täglich · bestehender Beispielpreis"},
 {id:"olive",name:"Polyphenolreiches Olivenöl",monthly:9,detail:"Mittlere Priorität · anpassbarer Beispielpreis"},
 {id:"taurine",name:"Taurin",monthly:.90,detail:"1 g täglich · mittlere Priorität"},
 {id:"astax",name:"Astaxanthin",monthly:6,detail:"12 mg täglich · mittlere Priorität"},
 {id:"hyaluronic",name:"Hyaluronsäure",monthly:3.60,detail:"250 mg täglich · nach Astaxanthin"},
 {id:"alcar",name:"L-Acetyl-L-Carnitin (ALCAR)",monthly:.99,detail:"250 mg täglich · anpassbarer Beispielpreis für diese Form"},
 {id:"coq10",name:"Reduziertes CoQ10",monthly:15,detail:"50 mg täglich · Gesamtmenge aus Basispräparat mit berücksichtigen"},
 {id:"pea",name:"Erbsenprotein",monthly:21.60,detail:"30 g täglich · bestehender Beispielpreis"},
 {id:"sango",name:"Sango-Korallenpulver",monthly:4.50,detail:"1 TL täglich · bestehender Beispielpreis"},
 {id:"flax",name:"Leinöl",monthly:6,detail:"1 EL täglich · bestehender Beispielpreis"},
 {id:"psyllium",name:"Flohsamenschalen",monthly:1.50,detail:"Bestehender Beispielpreis"},
 {id:"caakg",name:"Calcium-AKG (CAAKG)",monthly:9,detail:"1 g täglich · späte Priorität · anpassbarer Beispielpreis"},
 {id:"choline",name:"CDP-Cholin (nur wenn man keine Eier isst)",monthly:9,detail:"Späte Priorität · anpassbarer Beispielpreis; Eier allein garantieren keine ausreichende Cholinversorgung"},
 {id:"rala",name:"R-ALA (R-Alpha-Liponsäure)",monthly:6,detail:"100–300 mg gemäß Protokoll · späte Priorität · anpassbarer Beispielpreis"},
 {id:"green",name:"Green Powder (Sunday Natural)",monthly:9,detail:"1 TL täglich · späte Priorität · bestehender Beispielpreis"}
];
const sunday={id:"sunday",name:"Sunday All-In-One",monthly:10,detail:"Basispräparat · bestehender Beispielpreis"};
const blueprint={id:"blueprint",name:"Blueprint Essentials",monthly:50,detail:"Ersetzt Sunday, sobald auch Algenöl, NAC, Vitamin C und die gewählte Winter-Ergänzung ins Budget passen"};
const urolithin={id:"urolithin",name:"Urolithin A",monthly:50,detail:"500 mg gemäß Protokoll · nur bei ausreichend hohem Budget ohne Verdrängung vieler Produkte"};
function selectSupplements(limit,{winter=false,eggs=false,prices={}}={}){
 const items=supplements.filter(x=>(x.id!=="dk"||winter)&&(x.id!=="choline"||!eggs)).map(x=>({...x,monthly:Math.round((prices[x.id]??x.monthly)*100)/100}));
 const core=items.filter(x=>["algae","nac","vitc","dk"].includes(x.id));
 const upgradeCost=blueprint.monthly+core.reduce((s,x)=>s+x.monthly,0);
 const base=limit>=upgradeCost?blueprint:limit>=sunday.monthly?sunday:null;
 let chosen=base?[base]:[];
 let cents=Math.round(limit*100)-(base?Math.round(base.monthly*100):0);
 for(const item of items){const cost=Math.round(item.monthly*100);if(cost<=cents){chosen.push(item);cents-=cost;}}
 let removed=[];
 if(base?.id==="blueprint"&&limit>=150){
  const replaceable=chosen.filter(x=>["caakg","choline"].includes(x.id));
  const options=[[],...replaceable.map(x=>[x]),...(replaceable.length===2?[replaceable]:[])];
  const swap=options.find(xs=>cents+xs.reduce((s,x)=>s+Math.round(x.monthly*100),0)>=5000);
  if(swap){removed=swap.map(x=>x.id);chosen=chosen.filter(x=>!removed.includes(x.id));const pos=chosen.findIndex(x=>x.id==="vitc");chosen.splice(pos+1,0,urolithin);}
 }
 return {chosen,base,removed,upgradeCost};
}

if(typeof module!=='undefined')module.exports={selectSupplements};if(typeof window!=='undefined'){window.VeganielCalculators=window.VeganielCalculators||{};window.VeganielCalculators.supplements=selectSupplements;}
})();
