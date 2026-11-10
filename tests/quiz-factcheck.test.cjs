const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const fc=require('../daniel-suckrow-website/scripts/quiz-factcheck.js');
const profileApi=require('../daniel-suckrow-website/scripts/quiz-world-profile.js');

function banks(){const html=fs.readFileSync('daniel-suckrow-website/quiz.html','utf8');const code=html.slice(html.indexOf('const DATA='),html.indexOf('let current='));return vm.runInNewContext(code+';banks');}

test('fact-check rounds use ten unique, balanced and correctly labelled statements',()=>{
  const all=banks();
  for(const level of fc.LEVELS){
    const pool=Object.entries(all[level]).flatMap(([topic,qs])=>qs.map(q=>({...q,topic})));
    for(const seed of [1,42,987654321]){
      const round=fc.buildStatements(pool,seed);
      assert.equal(round.length,10);
      assert.equal(new Set(round.map(s=>s.question)).size,10);
      assert.equal(round.filter(s=>s.truth).length,5);
      for(const s of round){
        const source=pool.find(q=>q.q===s.question);
        assert.ok(source,'statement comes from the bank');
        assert.equal(s.answer,source.a[source.correct]);
        if(s.truth) assert.equal(s.claim,source.a[source.correct]);
        else { assert.notEqual(s.claim,source.a[source.correct]); assert.ok(source.a.includes(s.claim)); }
        assert.ok(s.info);
      }
      assert.deepEqual(round,fc.buildStatements(pool,seed),'same seed, same round');
    }
  }
});

test('fact-check league keys and time bonus fit the existing league rules',()=>{
  for(const key of fc.keys){assert.match(key,/ · (Leicht|Mittel|Schwer)$/);assert.ok(key.length<=120);}
  assert.equal(fc.timeBonus(60,10),60);
  assert.equal(fc.timeBonus(30,5),15);
  assert.equal(fc.timeBonus(0,10),0);
  assert.equal(fc.timeBonus(999,999),60);
  assert.equal(fc.timeBonus(-5,3),0);
});

test('fact-check plays add XP and unlock their achievements locally',()=>{
  const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
  const p=profileApi.create(storage);
  const before=profileApi.rank({},[],p.data()).xp;
  p.recordFactcheck(10,6);p.recordFactcheck(4,2);p.recordFactcheck(99,1);
  const data=profileApi.create(storage).data();
  assert.deepEqual(data.factcheck,{plays:2,best:10,combo:6});
  assert.ok(profileApi.rank({},[],data).xp>before);
  const earned=profileApi.achievements({},[],data,20000).filter(a=>a.earned).map(a=>a.name);
  for(const name of ['Faktenblick','Combo-Kette','Fake-Detektor:in'])assert.ok(earned.includes(name),name);
});

test('older stored profiles without fact-check data still load',()=>{
  const map=new Map([['veganiel.quiz-world-profile.v1',JSON.stringify({daily:[20000],sprint:{plays:2,best:7},duels:1})]]);
  const p=profileApi.create({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)});
  assert.deepEqual(p.data().factcheck,{plays:0,best:0,combo:0});
  assert.equal(p.data().sprint.best,7);
});

const pool=require('../daniel-suckrow-website/scripts/quiz-factcheck-pool.js');

test('extra statement pool is large, bilingual, sourced and uniquely identified',()=>{
  const ids=new Set();let total=0;
  for(const level of fc.LEVELS){
    const list=pool[level];assert.ok(Array.isArray(list)&&list.length>=25,level+' has at least 25 statements');
    assert.ok(list.filter(s=>s.truth).length>=8&&list.filter(s=>!s.truth).length>=8,level+' has enough facts and fakes');
    for(const s of list){total++;assert.ok(!ids.has(s.id),'unique id '+s.id);ids.add(s.id);
      for(const field of ['s','info','topic']){assert.ok(s[field].de&&s[field].en,s.id+' '+field+' in DE and EN');}
      assert.equal(typeof s.truth,'boolean');assert.match(s.source,/^https:\/\//);}
  }
  assert.ok(total>=80);
});

test('mixed rounds take half from the pool and half from the quiz, always 5 facts and 5 fakes',()=>{
  const all=banks();
  for(const level of fc.LEVELS){
    const bank=Object.entries(all[level]).flatMap(([topic,qs])=>qs.map(q=>({...q,topic})));
    for(const seed of [3,77,123456789]){
      const round=fc.buildMixedRound(bank,pool[level],seed);
      assert.equal(round.length,10);
      assert.equal(round.filter(r=>r.kind==='extra').length,5);
      assert.equal(round.filter(r=>r.kind==='bank').length,5);
      assert.equal(round.filter(r=>r.truth).length,5);
      assert.equal(new Set(round.map(r=>r.id)).size,10);
    }
  }
});

test('recently seen statements are avoided while fresh ones remain',()=>{
  const all=banks(),bank=Object.entries(all.Mittel).flatMap(([topic,qs])=>qs.map(q=>({...q,topic})));
  const seen=[];
  for(let round=0;round<4;round++){
    const items=fc.buildMixedRound(bank,pool.Mittel,1000+round,seen);
    for(const item of items)assert.ok(!seen.includes(item.id),'no repeat within the first rounds: '+item.id);
    seen.push(...items.map(i=>i.id));
  }
});
