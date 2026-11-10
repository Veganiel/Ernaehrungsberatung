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
