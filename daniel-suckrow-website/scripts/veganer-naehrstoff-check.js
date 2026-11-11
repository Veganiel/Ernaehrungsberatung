(() => {
  const questions = [
    {
      "id": "b12",
      "title": "Wie kümmerst du dich um Vitamin B12?",
      "hint": "Gemeint ist ein B12-haltiges Nahrungsergänzungsmittel.",
      "options": [
        "Ich nehme es regelmäßig",
        "Ich nehme es unregelmäßig",
        "Ich nehme keines / weiß es nicht"
      ],
      "name": "Vitamin B12",
      "advice": [
        "Gut, dass du B12 berücksichtigst. Ob Präparat und Dosierung zu dir passen, lässt sich aus dieser Frage nicht beurteilen. Lass deine Versorgung individuell überprüfen.",
        "Bei veganer Ernährung ist eine zuverlässige B12-Ergänzung notwendig. Besprich ein geeignetes Vorgehen und eine Kontrolle mit einer Fachperson.",
        "Bei veganer Ernährung ist ein Vitamin-B12-Präparat notwendig. Lass dich zeitnah zur geeigneten Ergänzung und Kontrolle beraten."
      ]
    },
    {
      "id": "iodine",
      "title": "Verwendest du jodiertes Speisesalz?",
      "hint": "Auch relevant: ob Lebensmittel mit Jodsalz hergestellt wurden.",
      "options": [
        "Meistens",
        "Selten oder nie",
        "Ich weiß es nicht"
      ],
      "name": "Jod",
      "advice": [
        "Jodsalz kann zur Jodzufuhr beitragen. Ob deine gesamte Zufuhr ausreicht, lässt sich daraus nicht erkennen.",
        "Jodsalz kann eine hilfreiche Jodquelle sein. Prüfe deine Jodversorgung mit einer Fachperson, bevor du Präparate einnimmst.",
        "Schau auf die Verpackung deines Salzes und prüfe deine Jodzufuhr. Eine Ergänzung solltest du individuell abklären."
      ]
    },
    {
      "id": "calcium",
      "title": "Wie oft nutzt du calciumreiche Lebensmittel?",
      "hint": "Zum Beispiel calciumangereicherte Pflanzendrinks, calciumreiches Mineralwasser oder calciumhaltiger Tofu.",
      "options": [
        "Täglich",
        "Mehrmals pro Woche",
        "Selten / weiß nicht"
      ],
      "name": "Calcium",
      "advice": [
        "Du denkst regelmäßig an Calciumquellen. Der Calciumgehalt und die verzehrte Menge sind entscheidend – prüfe die Angaben auf dem Etikett.",
        "Baue calciumreiche Lebensmittel bewusster in deinen Alltag ein und achte auf den tatsächlichen Calciumgehalt.",
        "Schau dir Calciumquellen wie angereicherte Pflanzendrinks, calciumreiches Mineralwasser und calciumhaltigen Tofu an."
      ]
    },
    {
      "id": "protein",
      "title": "Wie oft isst du Hülsenfrüchte oder andere pflanzliche Eiweißquellen?",
      "hint": "Zum Beispiel Bohnen, Linsen, Kichererbsen, Tofu oder Tempeh.",
      "options": [
        "Täglich",
        "Mehrmals pro Woche",
        "Selten"
      ],
      "name": "Eiweiß",
      "advice": [
        "Du hast regelmäßig pflanzliche Eiweißquellen auf dem Speiseplan. Ob die Menge passt, hängt von deinem individuellen Bedarf ab.",
        "Hülsenfrüchte und Sojaprodukte können deinen Speiseplan mit Eiweiß bereichern. Achte auf Vielfalt und ausreichende Mengen.",
        "Probiere häufiger Linsen, Bohnen oder Tofu. Sie können eine praktische Eiweißquelle in pflanzlichen Mahlzeiten sein."
      ]
    },
    {
      "id": "iron",
      "title": "Wie oft isst du eisenreiche pflanzliche Lebensmittel?",
      "hint": "Zum Beispiel Hülsenfrüchte, Vollkornprodukte, Kürbiskerne oder Nüsse.",
      "options": [
        "Täglich",
        "Mehrmals pro Woche",
        "Selten"
      ],
      "name": "Eisen",
      "advice": [
        "Du nutzt regelmäßig mögliche Eisenquellen. Vitamin-C-reiches Obst oder Gemüse zur Mahlzeit kann die Aufnahme pflanzlichen Eisens verbessern.",
        "Ergänze häufiger eisenreiche Lebensmittel; Vitamin C zur Mahlzeit kann die Aufnahme verbessern.",
        "Hülsenfrüchte, Vollkorn und Kerne sind mögliche Eisenquellen. Kombiniere sie mit Vitamin-C-reichem Obst oder Gemüse."
      ]
    },
    {
      "id": "omega",
      "title": "Wie oft isst du Omega-3-reiche Samen oder Nüsse?",
      "hint": "Zum Beispiel geschrotete Leinsamen, Chiasamen oder Walnüsse.",
      "options": [
        "Täglich",
        "Mehrmals pro Woche",
        "Selten"
      ],
      "name": "Omega-3-Fettsäuren",
      "advice": [
        "Diese Lebensmittel liefern die Omega-3-Fettsäure ALA. Die Versorgung mit den langkettigen Fettsäuren EPA und DHA lässt sich daraus nicht sicher beurteilen.",
        "Leinsamen, Chiasamen und Walnüsse liefern ALA. Die Versorgung mit EPA und DHA ist eine zusätzliche Frage.",
        "Leinsamen, Chiasamen und Walnüsse können ALA liefern. Für EPA und DHA kommen auch Mikroalgenprodukte infrage; lass dich individuell beraten."
      ]
    }
  ];

  const form = document.querySelector('#nutrition-form');
  const container = document.querySelector('#questions');
  const results = document.querySelector('#results');
  const cards = document.querySelector('#result-cards');

  for (const question of questions) {
    const field = document.createElement('fieldset');
    field.className = 'question';
    const legend = document.createElement('legend');
    legend.textContent = question.title;

    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.id = 'hint-' + question.id;
    hint.textContent = question.hint;
    field.setAttribute('aria-describedby', hint.id);

    const options = document.createElement('div');
    options.className = 'options';
    question.options.forEach((label, index) => {
      const option = document.createElement('label');
      option.className = 'option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = question.id;
      input.value = String(index);
      input.required = true;
      const text = document.createElement('span');
      text.textContent = label;
      option.append(input, text);
      options.append(option);
    });
    field.append(legend, hint, options);
    container.append(field);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const answers = new FormData(form);
    cards.replaceChildren(...questions.map(question => {
      const card = document.createElement('article');
      card.className = 'card';
      const heading = document.createElement('h3');
      heading.textContent = question.name;
      const advice = document.createElement('p');
      advice.textContent = question.advice[Number(answers.get(question.id))];
      card.append(heading, advice);
      return card;
    }));
    results.hidden = false;
    results.focus({ preventScroll: true });
    results.scrollIntoView({ block: 'start' });
  });

  form.addEventListener('change', () => { results.hidden = true; });
  document.querySelector('#restart').addEventListener('click', () => {
    container.querySelector('input').focus({ preventScroll: true });
    document.querySelector('#check').scrollIntoView({ block: 'start' });
  });
  form.querySelector('button[type="submit"]').disabled = false;
})();
