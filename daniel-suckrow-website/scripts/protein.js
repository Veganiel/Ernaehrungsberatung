(function () {
  'use strict';
  // g Protein je kg Körpergewicht und Tag (Erwachsene).
  // Alltag: DGE-Referenzwert 0,8 (ab 65: Schätzwert 1,0). Sport: ISSN-Positionspapier / Morton et al. 2018.
  const GOALS = {
    everyday: [0.8, 1.0],
    endurance: [1.2, 1.4],
    strength: [1.6, 2.0],
    weightloss: [1.2, 1.6]
  };
  const VEGAN_FACTOR = 1.1; // Protein in ganzen Pflanzen durch Zellstrukturen/Ballaststoffe schwerer zugänglich, ca. +10 %
  const round5 = value => Math.round(value / 5) * 5;

  function calculate(input) {
    const { weight, height, age, diet, goal } = input || {};
    const valid = [[weight, 30, 300], [height, 120, 230], [age, 18, 100]]
      .every(([v, min, max]) => Number.isFinite(v) && v >= min && v <= max);
    if (!valid || !GOALS[goal] || !['vegan', 'vegetarian', 'mixed'].includes(diet)) return null;

    const bmi = weight / (height / 100) ** 2;
    // DGE: Bei Übergewicht (BMI > 25) wird das Normalgewicht zugrunde gelegt.
    const referenceWeight = bmi > 25 ? 25 * (height / 100) ** 2 : weight;
    let [low, high] = GOALS[goal];
    if (age >= 65) { low = Math.max(low, 1.0); high = Math.max(high, 1.2); }
    if (diet === 'vegan') { low *= VEGAN_FACTOR; high *= VEGAN_FACTOR; }

    const gramsLow = round5(low * referenceWeight);
    const gramsHigh = Math.max(gramsLow, round5(high * referenceWeight));
    return {
      perKg: [Math.round(low * 100) / 100, Math.round(high * 100) / 100],
      grams: [gramsLow, gramsHigh],
      perMeal: [Math.round(gramsLow / 3), Math.round(gramsHigh / 3)],
      referenceWeight: Math.round(referenceWeight * 10) / 10,
      usesReferenceWeight: bmi > 25,
      senior: age >= 65
    };
  }

  if (typeof module !== 'undefined') module.exports = { calculate, GOALS, VEGAN_FACTOR };
  if (typeof document === 'undefined') return;
  window.VeganielCalculators = window.VeganielCalculators || {};
  window.VeganielCalculators.protein = calculate;

  const form = document.getElementById('protein-form');
  if (!form) return;
  const result = document.getElementById('result');
  const error = document.getElementById('error');
  let current = null;
  const fmt = (value, digits) => value.toLocaleString(document.documentElement.lang || 'de', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function render() {
    if (!current) return;
    document.getElementById('grams-low').textContent = fmt(current.grams[0], 0);
    document.getElementById('grams-high').textContent = fmt(current.grams[1], 0);
    document.getElementById('perkg-low').textContent = fmt(current.perKg[0], 1);
    document.getElementById('perkg-high').textContent = fmt(current.perKg[1], 1);
    document.getElementById('meal-low').textContent = fmt(current.perMeal[0], 0);
    document.getElementById('meal-high').textContent = fmt(current.perMeal[1], 0);
    document.getElementById('ref-weight').textContent = fmt(current.referenceWeight, 1);
    document.getElementById('note-reference').hidden = !current.usesReferenceWeight;
    document.getElementById('note-senior').hidden = !current.senior;
    document.getElementById('note-vegan').hidden = form.elements.diet.value !== 'vegan';
  }

  form.addEventListener('input', () => { result.hidden = true; error.hidden = true; current = null; });
  form.addEventListener('invalid', () => { result.hidden = true; error.hidden = false; }, true);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    current = data.has('eligible') ? calculate({
      weight: Number(data.get('weight')),
      height: Number(data.get('height')),
      age: Number(data.get('age')),
      diet: data.get('diet'),
      goal: data.get('goal')
    }) : null;
    error.hidden = !!current;
    result.hidden = !current;
    if (current) { render(); result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  });
  document.addEventListener('veganiel:languagechange', render);
})();
