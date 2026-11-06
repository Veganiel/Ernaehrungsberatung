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
