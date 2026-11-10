/* Shared budget algorithm extracted from the existing calculator; parity checked in tests. */
(function(){
const supplements = [
 {id:"algae",name:"Algenöl (EPA/DHA)",monthly:7.80,detail:"Hohe Priorität direkt nach der Basis · bestehender Beispielpreis"},
 {id:"astax",name:"Astaxanthin",monthly:6,detail:"12 mg täglich · nach Algenöl eingeplant"},
 {id:"nac",name:"NAC",monthly:1.80,detail:"600 mg täglich · hohe Priorität nach Algenöl"},
 {id:"vitc",name:"Vitamin C",monthly:1.20,detail:"Bestehender Beispielpreis · hohe Priorität nach Algenöl und NAC"},
 {id:"dk",name:"Vitamin D3 + K2 (im Winter)",monthly:3,detail:"Nur bei aktivierter Winter-Auswahl · Beispielpreis; Gesamtzufuhr aus Basispräparat prüfen"},
 {id:"hyaluronic",name:"Hyaluronsäure",monthly:3.60,detail:"250 mg täglich · nach Vitamin D3 + K2 eingeplant"},
 {id:"glycine",name:"Glycin",monthly:3,detail:"5 g täglich · vor Kreatin priorisiert"},
 {id:"creatine",name:"Kreatin",monthly:3,detail:"3 g täglich · bestehender Beispielpreis"},
 {id:"taurine",name:"Taurin",monthly:.90,detail:"1 g täglich · mittlere Priorität"},
 {id:"rala",name:"R-ALA (R-Alpha-Liponsäure)",monthly:6,detail:"100–300 mg gemäß Protokoll · späte Priorität · anpassbarer Beispielpreis"},
 {id:"alcar",name:"L-Acetyl-L-Carnitin (ALCAR)",monthly:.99,detail:"250 mg täglich · anpassbarer Beispielpreis für diese Form"},
 {id:"caakg",name:"Calcium-AKG (CAAKG)",monthly:9,detail:"1 g täglich · späte Priorität · anpassbarer Beispielpreis"},
 {id:"choline",name:"CDP-Cholin (nur wenn man keine Eier isst)",monthly:9,detail:"Späte Priorität · anpassbarer Beispielpreis; Eier allein garantieren keine ausreichende Cholinversorgung"}
];
const sunday={id:"sunday",name:"All-In-One (Sunday)",monthly:10,detail:"Basispräparat · bestehender Beispielpreis; Sunday steht in Klammern, weil nicht alle Menschen dort bestellen können"};
const blueprint={id:"blueprint",name:"Essentials Blueprint",monthly:50,detail:"Ergänzt die All-In-One-Basis (statt sie zu ersetzen) · wird erst ab 50 € Gesamtbudget berücksichtigt"};
const urolithin={id:"urolithin",name:"Urolithin A",monthly:50,detail:"500 mg gemäß Protokoll · wird erst ab 100 € Gesamtbudget berücksichtigt und ersetzt keine bereits gewählten Produkte"};
function selectSupplements(limit,{winter=false,eggs=false,prices={}}={}){
 const items=supplements.filter(x=>(x.id!=="dk"||winter)&&(x.id!=="choline"||!eggs)).map(x=>({...x,monthly:Math.round((prices[x.id]??x.monthly)*100)/100}));
 const byId=Object.fromEntries(items.map(item=>[item.id,item]));
 const priority=["algae","astax","nac","vitc","dk","hyaluronic","glycine","creatine","taurine","rala","alcar","caakg","choline"].map(id=>byId[id]).filter(Boolean);
 const chosen=[];
 let cents=Math.round(limit*100);
 const add=item=>{const cost=Math.round(item.monthly*100);if(cost<=cents){chosen.push(item);cents-=cost;return true;}return false;};
 const base=limit>=sunday.monthly?sunday:null;
 if(base)add(base);
 // First secure the standard priority list. Optional premium products never remove products already selected.
 for(const item of priority) add(item);
 const blueprintEligible=limit>=50;
 const urolithinEligible=limit>=100;
 if(blueprintEligible)add(blueprint);
 if(urolithinEligible)add(urolithin);
 return {chosen,base,removed:[],blueprintEligible,urolithinEligible,remaining:cents/100};
}

if(typeof module!=='undefined')module.exports={selectSupplements,supplements};if(typeof window!=='undefined'){window.VeganielCalculators=window.VeganielCalculators||{};window.VeganielCalculators.supplements=selectSupplements;window.VeganielCalculators.supplementItems=supplements;}
})();
