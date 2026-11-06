/* Four explicitly defined percentage bands; not measured metabolic thresholds. */
(function () {
  'use strict';
  function calculateZones(age) {
    if (!Number.isInteger(age) || age < 18 || age > 100) return null;
    const maximum = 208 - 0.7 * age;
    return { maximum: Math.round(maximum), zones: [50, 60, 70, 80].map(lower => ({
      lower: Math.round(maximum * lower / 100), upper: Math.round(maximum * (lower + 10) / 100)
    })) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculateZones };
  if (typeof document === 'undefined') return;
  const form = document.getElementById('heart-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const result = calculateZones(Number(document.getElementById('age').value));
    document.getElementById('heart-error').hidden = !!result;
    document.getElementById('heart-results').hidden = !result;
    if (!result) return;
    document.getElementById('max-hr').textContent = result.maximum;
    result.zones.forEach((zone, i) => {
      document.getElementById('zone-' + (i + 1)).textContent = zone.lower + '–' + zone.upper;
    });
  });
  form.addEventListener('invalid', () => {
    document.getElementById('heart-results').hidden = true;
    document.getElementById('heart-error').hidden = false;
  }, true);
})();
