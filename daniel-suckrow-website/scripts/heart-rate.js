/* Four explicitly defined percentage bands; not measured metabolic thresholds. */
(function () {
  'use strict';
  function calculateZones(age, resting = null, measuredMaximum = null) {
    if (!Number.isInteger(age) || age < 18 || age > 100) return null;
    const validPulse = (value, min, max) => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
    if (resting !== null && !validPulse(resting, 30, 120)) return null;
    if (measuredMaximum !== null && !validPulse(measuredMaximum, 100, 250)) return null;
    const maximum = measuredMaximum === null ? 208 - 0.7 * age : measuredMaximum;
    if (resting !== null && resting >= maximum) return null;
    const target = percent => Math.round(resting === null ? maximum * percent / 100 : resting + (maximum - resting) * percent / 100);
    return { maximum: Math.round(maximum), zones: [50, 60, 70, 80].map(lower => ({
      lower: target(lower), upper: target(lower + 10)
    })) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculateZones };
  if (typeof document === 'undefined') return;
window.VeganielCalculators=window.VeganielCalculators||{};window.VeganielCalculators.heart=calculateZones;
if(!document.getElementById('heart-form'))return;
  const form = document.getElementById('heart-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const optional = id => { const value = document.getElementById(id).value.trim(); return value === '' ? null : Number(value); };
    const resting = optional('resting-hr');
    const measured = optional('measured-max-hr');
    const result = calculateZones(Number(document.getElementById('age').value), resting, measured);
    document.getElementById('heart-error').hidden = !!result;
    document.getElementById('heart-results').hidden = !result;
    if (!result) return;
    document.getElementById('max-hr').textContent = result.maximum;
    document.getElementById('result-title').textContent = measured === null ? 'Geschätzte maximale Herzfrequenz' : 'Eingegebene gemessene maximale Herzfrequenz';
    document.getElementById('method').textContent = resting === null ? 'Methode: Prozent der HFmax' : 'Methode: Karvonen · Ruhepuls + (HFmax − Ruhepuls) × Intensität';
    document.getElementById('max-source').textContent = measured === null ? 'Tanaka-Formel: 208 − 0,7 × Alter' : 'Grundlage: deine eingegebene gemessene HFmax';
    document.querySelectorAll('.zone .badge').forEach((badge, i) => { badge.textContent = (50 + i * 10) + '–' + (60 + i * 10) + (resting === null ? ' % der HFmax' : ' % der Herzfrequenzreserve'); });
    result.zones.forEach((zone, i) => {
      document.getElementById('zone-' + (i + 1)).textContent = zone.lower + '–' + zone.upper;
    });
  });
  form.addEventListener('input', () => { document.getElementById('heart-results').hidden = true; document.getElementById('heart-error').hidden = true; });
  form.addEventListener('invalid', () => {
    document.getElementById('heart-results').hidden = true;
    document.getElementById('heart-error').hidden = false;
  }, true);
})();
