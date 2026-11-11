(() => {
  const questions = [
    {
      "id": "b12",
      "title": "Wie kümmerst du dich um Vitamin B12?",
      "hint": "Gemeint ist ein B12-haltiges Nahrungsergänzungsmittel.",
      "options": [
        "Ich nehme es regelmäßig",
        "Ich nehme es unregelmäßig",
        "Ich nehme keines / weiß es nicht",
        "Vitamin B12 ist in meinem All-in-One-Präparat enthalten"
      ],
      "name": "Vitamin B12",
      "advice": [
        "Gut, dass du B12 berücksichtigst. Ob Präparat und Dosierung zu dir passen, lässt sich aus dieser Frage nicht beurteilen. Lass deine Versorgung individuell überprüfen.",
        "Bei veganer Ernährung ist eine zuverlässige B12-Ergänzung notwendig. Besprich ein geeignetes Vorgehen und eine Kontrolle mit einer Fachperson.",
        "Bei veganer Ernährung ist ein Vitamin-B12-Präparat notwendig. Lass dich zeitnah zur geeigneten Ergänzung und Kontrolle beraten.",
        "Prüfe den Vitamin-B12-Gehalt pro Tagesportion und ob du das Präparat regelmäßig einnimmst. Lass individuell prüfen, ob Menge und Einnahmerhythmus zu dir passen."
      ]
    },
    {
      "id": "iodine",
      "title": "Verwendest du jodiertes Speisesalz?",
      "hint": "Auch relevant: ob Lebensmittel mit Jodsalz hergestellt wurden.",
      "options": [
        "Meistens",
        "Selten oder nie",
        "Ich weiß es nicht",
        "Jod ist in meinem All-in-One-Präparat enthalten"
      ],
      "name": "Jod",
      "advice": [
        "Jodsalz kann zur Jodzufuhr beitragen. Ob deine gesamte Zufuhr ausreicht, lässt sich daraus nicht erkennen.",
        "Jodsalz kann eine hilfreiche Jodquelle sein. Prüfe deine Jodversorgung mit einer Fachperson, bevor du Präparate einnimmst.",
        "Schau auf die Verpackung deines Salzes und prüfe deine Jodzufuhr. Eine Ergänzung solltest du individuell abklären.",
        "Prüfe den Jodgehalt pro Tagesportion und berücksichtige weitere Jodquellen. Besprich die passende Menge besonders bei Schilddrüsenerkrankungen mit einer Fachperson."
      ]
    },
    {
      "id": "calcium",
      "title": "Trinkst du calciumangereicherte Pflanzendrinks?",
      "hint": "Schau auf dem Etikett nach, ob Calcium zugesetzt ist und wie viel der Drink pro 100 ml enthält.",
      "options": [
        "Täglich",
        "Mehrmals pro Woche",
        "Selten / weiß nicht"
      ],
      "name": "Calcium",
      "advice": [
        "Du trinkst täglich calciumangereicherte Pflanzendrinks. Wie viel Calcium sie beitragen, hängt vom Gehalt und deiner Trinkmenge ab.",
        "Calciumangereicherte Pflanzendrinks können zu deiner Zufuhr beitragen. Auch calciumreiches Mineralwasser oder calciumhaltiger Tofu kommen als Quellen infrage.",
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
        "Selten",
        "Eisen ist in meinem All-in-One-Präparat enthalten"
      ],
      "name": "Eisen",
      "advice": [
        "Du nutzt regelmäßig mögliche Eisenquellen. Vitamin-C-reiches Obst oder Gemüse zur Mahlzeit kann die Aufnahme pflanzlichen Eisens verbessern.",
        "Ergänze häufiger eisenreiche Lebensmittel; Vitamin C zur Mahlzeit kann die Aufnahme verbessern.",
        "Hülsenfrüchte, Vollkorn und Kerne sind mögliche Eisenquellen. Kombiniere sie mit Vitamin-C-reichem Obst oder Gemüse.",
        "Prüfe den Eisengehalt pro Tagesportion. Lass einen möglichen Mehrbedarf fachlich abklären, bevor du zusätzliches Eisen einnimmst."
      ]
    },
    {
      "id": "zinc-selenium",
      "title": "Wie oft isst du pflanzliche Quellen für Zink und Selen?",
      "hint": "Zum Beispiel Nüsse, Samen, Hülsenfrüchte und Vollkornprodukte. Paranüsse (Selen) können viel Selen enthalten. Der Gehalt schwankt je nach Herkunft stark.",
      "options": [
        "Täglich",
        "Mehrmals pro Woche",
        "Selten",
        "Zink und/oder Selen sind in meinem All-in-One-Präparat enthalten"
      ],
      "name": "Zink und Selen",
      "advice": [
        "Vollkorn, Hülsenfrüchte, Nüsse und Samen können Zink liefern. Wie viel Selen pflanzliche Lebensmittel liefern, hängt unter anderem vom Boden ab. Eine einzelne Paranuss kann viel zum Tagesbedarf beitragen, ihr Selengehalt schwankt jedoch stark.",
        "Baue diese Lebensmittel regelmäßig und abwechslungsreich ein. Lass deine Selenzufuhr bei Unsicherheit individuell prüfen.",
        "Probiere häufiger Hülsenfrüchte, Vollkornprodukte, Nüsse oder Samen. Lass dich bei Fragen zu deiner Zink- und Selenzufuhr individuell beraten.",
        "Prüfe Zink und Selen getrennt auf dem Etikett. Berücksichtige die Menge pro Tagesportion und weitere Präparate, um doppelte Einnahmen zu vermeiden."
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
      "name": "Omega-3 aus Nüssen und Samen (ALA)",
      "advice": [
        "Leinsamen, Chiasamen und Walnüsse liefern ALA. Die verzehrte Menge bestimmt, wie viel sie zu deiner ALA-Zufuhr beitragen.",
        "Baue ALA-Quellen regelmäßig in deine Mahlzeiten ein, etwa mit geschroteten Leinsamen im Müsli.",
        "Probiere geschrotete Leinsamen, Chiasamen oder Walnüsse als ALA-Quellen im Alltag."
      ]
    },
    {
      "id": "algae-oil",
      "title": "Nimmst du Algenöl mit EPA und DHA ein?",
      "hint": "Schau auf das Etikett: Dort stehen die Mengen an EPA und DHA pro Portion.",
      "options": [
        "Ja, regelmäßig",
        "Ja, gelegentlich",
        "Nein / weiß ich nicht"
      ],
      "name": "EPA und DHA aus Algenöl",
      "advice": [
        "Algenöl kann EPA und DHA direkt liefern. Für deine Zufuhr zählen die Mengen an EPA und DHA und wie regelmäßig du es einnimmst.",
        "Prüfe den Gehalt an EPA und DHA und wie häufig du das Algenöl einnimmst. Lass dich bei Fragen zu deiner Zufuhr individuell beraten.",
        "EPA und DHA sind langkettige Omega-3-Fettsäuren. Mikroalgenöl ist eine pflanzliche Quelle. Wenn du ein Produkt erwägst, prüfe die ausgewiesenen Mengen von EPA und DHA."
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
