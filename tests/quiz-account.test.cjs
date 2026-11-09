const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const crypto=require('node:crypto').webcrypto;
const source=fs.readFileSync('daniel-suckrow-website/scripts/quiz-account.js','utf8');
const progress=fs.readFileSync('daniel-suckrow-website/scripts/quiz-progress.js','utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,20));
function setup(initial=null){
 const elements=new Map(),events={},map=new Map(),calls=[];let authCallback,currentStore,fail=false;
 const server=new Map(),seen=new Set();
 const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const el=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:true,disabled:false,handlers:{},addEventListener(k,f){this.handlers[k]=f}});return elements.get(id)};
 const auth={getSession:async()=>({data:{session:initial}}),onAuthStateChange:f=>authCallback=f};
 const ctx={console,crypto,TextEncoder,setTimeout,localStorage:storage,document:{getElementById:el},fetch:async(url,opts)=>{calls.push({url,opts});if(fail)throw Error('offline');const id=opts.headers.Authorization;const body=opts.body&&JSON.parse(opts.body);let records=server.get(id)||{};server.set(id,records);if(url.includes('record_quiz_result')){const key=id+body.event;if(!seen.has(key)){seen.add(key);records[body.quiz]={quiz_key:body.quiz,best:Math.max(records[body.quiz]?.best||0,body.score),attempts:(records[body.quiz]?.attempts||0)+1}}}else if(url.includes('clear_quiz_results')){server.set(id,{})}return {ok:true,status:200,json:async()=>url.includes('quiz_results?')?Object.values(server.get(id)):null}},window:null};
 ctx.window=ctx;ctx.addEventListener=(name,f)=>events[name]=f;ctx.SUPABASE_URL='https://example.invalid';ctx.SUPABASE_PUBLISHABLE_KEY='public-test';ctx.VeganielMember={client:{auth}};ctx.VeganielQuizUI={keys:['Quiz · Leicht'],setStore:s=>currentStore=s,refresh(){}};
 vm.createContext(ctx);vm.runInContext(progress,ctx);vm.runInContext(source,ctx);
 return {calls,el,storage,server,seen,get store(){return currentStore},login(id){authCallback('SIGNED_IN',id?{user:{id},access_token:id}:null)},finish(score){currentStore.record('Quiz · Leicht',score);events['veganiel:quiz-finished']({detail:{key:'Quiz · Leicht',score}})},offline(v){fail=v}};
}
test('guest play stays local and initial null session does not crash',async()=>{const s=setup();await tick();s.finish(7);await tick();assert.equal(s.calls.length,0);assert.equal(s.store.records()['Quiz · Leicht'].best,7)});
test('accounts are isolated and logout restores guest progress',async()=>{const s=setup();await tick();s.finish(3);s.login('a');await tick();assert.equal(Object.keys(s.store.records()).length,0);s.finish(8);await tick();s.login('b');await tick();assert.equal(Object.keys(s.store.records()).length,0);s.finish(4);await tick();s.login('a');await tick();assert.equal(s.store.records()['Quiz · Leicht'].best,8);s.login(null);await tick();assert.equal(s.store.records()['Quiz · Leicht'].best,3)});
test('offline rounds retry once and explicit import is idempotent',async()=>{const s=setup();await tick();s.finish(9);s.login('a');await tick();s.offline(true);s.finish(6);await tick();assert.equal(s.el('retry-sync').hidden,false);s.offline(false);await s.el('retry-sync').handlers.click();await tick();assert.equal(s.store.records()['Quiz · Leicht'].attempts,1);await s.el('import-local').handlers.click();await tick();await s.el('import-local').handlers.click();await tick();assert.equal(s.store.records()['Quiz · Leicht'].attempts,2);assert.equal(s.store.records()['Quiz · Leicht'].best,9)});
