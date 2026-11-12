const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../daniel-suckrow-website/scripts/protein.js');

const base = { weight: 70, height: 180, age: 30, diet: 'mixed', goal: 'everyday' };

test('everyday adult follows DGE 0.8 g/kg', () => {
  const r = calculate(base);
  assert.deepEqual(r.perKg, [0.8, 1]);
  assert.deepEqual(r.grams, [55, 70]);
  assert.equal(r.usesReferenceWeight, false);
});

test('vegan adds about ten percent', () => {
  const r = calculate({ ...base, diet: 'vegan' });
  assert.deepEqual(r.perKg, [0.88, 1.1]);
  assert.deepEqual(r.grams, [60, 75]);
});

test('65 and older never drops below 1.0 g/kg', () => {
  const r = calculate({ ...base, age: 70 });
  assert.deepEqual(r.perKg, [1, 1.2]);
  assert.equal(r.senior, true);
});

test('BMI above 25 uses normal weight as reference (DGE)', () => {
  const r = calculate({ ...base, weight: 110, height: 170 });
  assert.equal(r.usesReferenceWeight, true);
  assert.ok(Math.abs(r.referenceWeight - 72.25) < 0.1);
  assert.deepEqual(r.grams, [60, 70]);
});

test('strength goal gives 1.6 to 2.0 g/kg and per-meal split', () => {
  const r = calculate({ ...base, goal: 'strength' });
  assert.deepEqual(r.grams, [110, 140]);
  assert.deepEqual(r.perMeal, [37, 47]);
});

test('invalid input and minors are rejected', () => {
  assert.equal(calculate({ ...base, age: 16 }), null);
  assert.equal(calculate({ ...base, weight: NaN }), null);
  assert.equal(calculate({ ...base, goal: 'bulk' }), null);
  assert.equal(calculate({ ...base, diet: 'keto' }), null);
});
