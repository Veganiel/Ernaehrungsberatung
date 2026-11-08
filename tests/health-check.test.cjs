const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {analyze,validate,fitnessBonus}=require('../daniel-suckrow-website/scripts/health-check.js');
const basics={age:45,context:'general',medical:'no'};
test('missing data stays unknown and never becomes zero or reassuring',()=>{const a=analyze(basics);assert.equal(a.waist,null);assert.equal(a.vo2,null);assert.equal(a.activity,null);assert.equal(a.supplements,null);assert.ok(a.heart);assert.equal(analyze({age:45,context:'general'}).heart,null);});
test('shared weight and age drive Rockport, BMI, and pulse ranges consistently',()=>{const a=analyze({...basics,height:180,waist:90,weight:80,rest:60,max:200,method:'rockport',sex:'1',minutes:15,seconds:0,pulse:130,moderate:100,vigorous:25});assert.equal(a.vo2,38.8);assert.equal(a.waist.ratio,.5);assert.equal(a.waist.category,'increased');assert.equal(a.activity,150);assert.deepEqual(a.heart.zones[0],{lower:130,upper:144});});
test('restricted context and medication gate exercise estimates without inventing results',()=>{for(const patch of [{context:'restricted'},{medical:'yes'},{medical:null}]){const a=analyze({...basics,...patch,method:'cooper',distance:2400});assert.equal(a.heart,null);assert.equal(a.vo2,null);}assert.equal(analyze({...basics,context:'restricted',height:180,weight:80,waist:90}).waist,null);});
test('invalid and conflicting values fail before analysis',()=>{for(const patch of [{age:17},{age:NaN},{context:null},{rest:110,max:100},{sleep:17},{alcohol:-1},{stress:'invalid'},{strength:2.5}])assert.ok(validate({...basics,...patch}).length);});
test('Rockport needs every input; age limits remain; BMI at 35 suppresses ratio category',()=>{assert.equal(analyze({...basics,method:'rockport',sex:'1',minutes:15,weight:80,pulse:130}).vo2,null);assert.equal(analyze({...basics,age:25,method:'rockport',sex:'1',minutes:15,seconds:0,weight:80,pulse:130}).vo2,null);assert.equal(analyze({...basics,height:200,weight:140,waist:90}).waist.category,'highBMI');});
test('budget is reported without prescribing supplements; vitamin D options are validated',()=>{for(const vitaminD of ['tested','supplemented','both','neither','unknown']){const a=analyze({...basics,budget:0,vitaminD});assert.equal(a.supplements.budget,0);assert.deepEqual(a.supplements.chosen,[]);assert.deepEqual(a.heart,analyze(basics).heart);}assert.ok(validate({...basics,vitaminD:'invalid'}).includes('vitaminD'));assert.ok(validate({...basics,budget:-1}).includes('budget'));assert.equal(analyze({...basics,budget:35.5}).supplements.budget,35.5);});

test('habits score requires complete data, has bounded endpoints and excludes spending and blood tests',()=>{const good={...basics,sleep:8,quality:'yes',moderate:100,vigorous:25,strength:2,breaks:'yes',plants:400,whole:'often',cigarettes:0,vape:'no',alcohol:0};assert.equal(analyze(good).score.value,100);assert.equal(analyze({...good,sleep:null}).score.value,null);assert.equal(analyze(basics).score.answered,0);assert.equal(analyze({...good,context:'restricted'}).score.value,null);assert.equal(analyze({...good,budget:1000,bloodTests:'yes',deficiencies:'yes'}).score.value,100);assert.equal(analyze({...good,sleep:5,quality:'no',moderate:0,vigorous:0,strength:0,breaks:'no',plants:0,whole:'rare',cigarettes:10,vape:'yes',alcohol:20}).score.value,0);assert.equal(analyze({...good,plants:399}).score.value,90);assert.ok(validate({...basics,bloodTests:'invalid'}).length);assert.ok(validate({...basics,deficiencies:'invalid'}).length);});

test('health check matches standalone selection for 50 and 80 euros and all monthly defaults',()=>{const {selectSupplements}=require('../daniel-suckrow-website/scripts/supplement-core.js');for(let month=0;month<12;month++)for(const budget of [0,5,50,80,150,300,1000]){const a=analyze({...basics,budget},month).supplements;const expected=selectSupplements(budget,{winter:[10,11,0,1,2].includes(month),eggs:false,prices:{}});assert.deepEqual(a.chosen,expected.chosen);assert.ok(a.chosen.reduce((sum,x)=>sum+x.monthly,0)<=budget+.001);}const html=fs.readFileSync('daniel-suckrow-website/supplement-rechner.html','utf8');assert.ok(html.includes('src="scripts/supplement-core.js"'));assert.ok(html.includes('const selectSupplements=window.VeganielCalculators.supplements'));});
test('fitness bonus respects reference categories, boundaries, missing data and non-stacking milestones',()=>{const {fitnessBonus:b}=require('../daniel-suckrow-website/scripts/health-check.js');assert.equal(b(48,25,'1').referencePoints,10);assert.equal(b(48,25,'0').referencePoints,15);assert.equal(b(48,65,'1').referencePoints,20);assert.equal(b(49.99,35,'1').extra,0);assert.equal(b(50,35,'1').extra,5);assert.equal(b(59.99,35,'1').extra,5);assert.equal(b(60,35,'1').extra,10);assert.equal(b(60,35,'1').points,30);for(const [v,a,s] of [[null,35,'1'],[NaN,35,'1'],[60,19,'1'],[60,80,'1'],[60,35,null]])assert.equal(b(v,a,s),null);for(const sex of ['0','1'])for(let age=20;age<=79;age++)for(let v=10;v<=100;v++){const bonus=b(v,age,sex);assert.ok(bonus.points>=0&&bonus.points<=30);assert.ok(b(v+1,age,sex).points>=bonus.points);}});
test('Cooper fitness bonus reaches total without bypassing eligibility or incomplete habits',()=>{const good={...basics,age:35,method:'cooper',distance:3200,sex:'1',sleep:8,quality:'yes',moderate:150,vigorous:0,strength:2,breaks:'yes',plants:400,whole:'often',cigarettes:0,vape:'no',alcohol:0};assert.equal(analyze(good).totalPoints,130);assert.equal(analyze({...good,sex:null}).fitness,null);assert.equal(analyze({...good,quality:null}).totalPoints,null);assert.equal(analyze({...good,medical:'yes'}).fitness,null);assert.equal(analyze({...good,context:'restricted'}).totalPoints,null);assert.equal(analyze({...good,distance:null}).fitness,null);});

test('alcohol and cigarette deductions use the highest reached tier and preserve missing inputs',()=>{
  const good={...basics,sleep:8,quality:'yes',moderate:150,vigorous:0,strength:2,breaks:'yes',plants:400,whole:'often',cigarettes:0,vape:'no',alcohol:0};
  for(const [alcohol,points] of [[9.9,100],[10,95],[14.9,95],[15,90],[19.9,90],[20,85]]) {
    assert.equal(analyze({...good,alcohol}).score.value,points);
  }
  for(const [cigarettes,points] of [[4.9,100],[5,95],[9.9,95],[10,90],[15,90],[15.1,85]]) {
    assert.equal(analyze({...good,cigarettes}).score.value,points);
  }
  assert.equal(analyze({...good,alcohol:20,cigarettes:10}).score.value,75);
  assert.equal(analyze({...good,cigarettes:null}).score.value,null);
  assert.equal(analyze({...good,alcohol:null}).score.value,null);
});

test('top five percent follows the published age and sex thresholds without changing the bonus',()=>{
  assert.equal(fitnessBonus(66.2,25,'1').topFive,false);
  assert.equal(fitnessBonus(66.3,25,'1').topFive,true);
  assert.equal(fitnessBonus(59.8,35,'1').topFive,true);
  assert.equal(fitnessBonus(45.8,35,'0').topFive,true);
  assert.equal(fitnessBonus(45.8,35,'0').points,20);
});
