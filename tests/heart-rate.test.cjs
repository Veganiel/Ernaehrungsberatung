const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateZones } = require('../daniel-suckrow-website/scripts/heart-rate.js');
test('Tanaka estimates and four contiguous, rounded percentage ranges', () => {
  assert.deepEqual(calculateZones(30), { maximum:187, zones:[{lower:94,upper:112},{lower:112,upper:131},{lower:131,upper:150},{lower:150,upper:168}] });
  for (let age = 18; age <= 100; age++) {
    const value = calculateZones(age);
    assert.equal(value.zones.length, 4);
    assert.ok(value.maximum >= 138 && value.maximum <= 195);
    value.zones.forEach((zone, i) => {
      assert.ok(zone.lower < zone.upper);
      if (i) assert.equal(zone.lower, value.zones[i-1].upper);
    });
  }
});
test('unsupported ages do not produce training advice', () => {
  for (const value of [NaN, Infinity, 0, 17, 101, 30.5, '30', null]) assert.equal(calculateZones(value), null);
});
test('Karvonen and measured maximum override cover all four input combinations', () => {
  assert.deepEqual(calculateZones(30,60).zones, [{lower:124,upper:136},{lower:136,upper:149},{lower:149,upper:162},{lower:162,upper:174}]);
  assert.equal(calculateZones(30,null,200).maximum,200);
  assert.deepEqual(calculateZones(30,null,200).zones[0],{lower:100,upper:120});
  assert.deepEqual(calculateZones(30,60,200).zones[0],{lower:130,upper:144});
  for (const pulse of [0,29,121,60.5,NaN,Infinity,'60']) assert.equal(calculateZones(30,pulse),null);
  for (const pulse of [0,99,251,200.5,NaN,Infinity,'200']) assert.equal(calculateZones(30,null,pulse),null);
  assert.equal(calculateZones(30,100,100),null);
  assert.equal(calculateZones(30,120,110),null);
  assert.ok(calculateZones(18,30,250));
  assert.ok(calculateZones(100,120,138));
});
