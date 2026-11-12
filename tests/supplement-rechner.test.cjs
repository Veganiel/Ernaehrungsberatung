// Prüft die Regeln, die auf supplement-rechner.html beschrieben sind:
// All-In-One (Sunday) ist die Basis ab 10 €. Essentials Blueprint ergänzt sie ab 50 €, Urolithin A kommt ab 100 € dazu.
// Beide Premium-Produkte werden nur ergänzt, wenn noch Budget frei ist, und verdrängen keine bereits gewählten Produkte.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectSupplements, supplements } = require('../daniel-suckrow-website/scripts/supplement-core.js');

const PRIORITY = ['algae', 'astax', 'nac', 'vitc', 'dk', 'hyaluronic', 'glycine', 'creatine', 'taurine', 'rala', 'alcar', 'caakg', 'choline'];
const priceSets = [{}, { alcar: 12, olive: 18, caakg: 2, choline: 3, rala: 19 }, { alcar: 0, olive: 0, caakg: 0, choline: 0, rala: 0 }];

function scenarios() {
  const list = [];
  for (const winter of [false, true]) for (const eggs of [false, true]) for (const prices of priceSets)
    for (let budget = 5; budget <= 300; budget++) list.push({ budget, winter, eggs, prices });
  return list;
}

// Was die reine Prioritätenliste ohne Premium-Produkte auswählen würde.
function baseline(budget, { winter, eggs, prices }) {
  let cents = Math.round(budget * 100);
  const picked = [];
  if (budget >= 10) cents -= 1000;
  for (const id of PRIORITY) {
    if ((id === 'dk' && !winter) || (id === 'choline' && eggs)) continue;
    const item = supplements.find(x => x.id === id);
    const cost = Math.round(Math.round((prices[id] ?? item.monthly) * 100) / 100 * 100);
    if (cost <= cents) { picked.push(id); cents -= cost; }
  }
  return picked;
}

test('budget, duplicates, winter and egg options are respected in every scenario', () => {
  for (const s of scenarios()) {
    const { chosen } = selectSupplements(s.budget, s);
    const ids = chosen.map(x => x.id);
    const total = chosen.reduce((sum, x) => sum + x.monthly, 0);
    assert.ok(total <= s.budget + 0.001, `over budget at ${s.budget}`);
    assert.equal(ids.length, new Set(ids).size);
    if (!s.winter) assert.ok(!ids.includes('dk'));
    if (s.eggs) assert.ok(!ids.includes('choline'));
    if (ids.includes('glycine') && ids.includes('creatine')) assert.ok(ids.indexOf('glycine') < ids.indexOf('creatine'));
  }
});

test('Sunday is the base from 10 €, Blueprint only complements it from 50 €', () => {
  for (const s of scenarios()) {
    const { chosen, base } = selectSupplements(s.budget, s);
    const ids = chosen.map(x => x.id);
    assert.equal(ids.includes('sunday'), s.budget >= 10);
    assert.equal(base?.id ?? null, s.budget >= 10 ? 'sunday' : null);
    if (ids.includes('blueprint')) { assert.ok(s.budget >= 50); assert.ok(ids.includes('sunday')); }
    if (ids.includes('urolithin')) assert.ok(s.budget >= 100);
  }
});

test('premium products never displace products from the priority list', () => {
  for (const s of scenarios()) {
    const { chosen, removed } = selectSupplements(s.budget, s);
    const ids = chosen.map(x => x.id);
    assert.deepEqual(removed, []);
    for (const id of baseline(s.budget, s)) assert.ok(ids.includes(id), `${id} displaced at ${s.budget} €`);
  }
});

test('large budgets include Blueprint and Urolithin A when they fit', () => {
  const ids = selectSupplements(300, { winter: true }).chosen.map(x => x.id);
  assert.ok(ids.includes('blueprint') && ids.includes('urolithin') && ids.includes('sunday'));
});
