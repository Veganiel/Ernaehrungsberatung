#!/usr/bin/env python3
"""Erzeugt die zwölf Monatsseiten des Saisonkalenders.

Quelle der Obst- und Gemüselisten: die Monatskarten in saisonkalender.html.
Texte, Zutaten und Aktivitäten: scripts/season_months_content.py (DE|EN).
Ausführliche Zubereitung und Tipps: scripts/season_months_steps.py (DE|EN).
Ergänzt fehlende englische Übersetzungen in locales/en.json.

Aufruf (im Repo-Hauptordner):  python3 scripts/build_season_months.py
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from season_months_content import MONTHS  # noqa: E402
from season_months_steps import STEPS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent / 'daniel-suckrow-website'
SITE = 'https://veganiel.com'
DE_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

ICON_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
ICON_BOWL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z"/><path d="M9 4.5c0 1.5 1.5 1.5 1.5 3M13.5 4.5c0 1.5 1.5 1.5 1.5 3"/></svg>'
ICON_LEAF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z"/><path d="M5 19 13 11"/></svg>'
ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

translations = {}


def t(pair):
    """'Deutsch|English' -> Deutsch; merkt sich die Übersetzung."""
    de, en = pair.split('|', 1)
    translations[de.strip()] = en.strip()
    return de.strip()


def pair(de, en):
    translations[de] = en
    return de


def e(text):
    return html.escape(text, quote=True)


def read_cards():
    source = (ROOT / 'saisonkalender.html').read_text(encoding='utf-8')
    cards = {}
    for slug, body in re.findall(r'<article class="month" id="([a-z]+)">(.*?)</article>', source):
        cards[slug] = dict(
            poetry=html.unescape(re.search(r'<p class="month-poetry">([^<]+)</p>', body).group(1)),
            line=html.unescape(re.search(r'</p><p>([^<]+)</p>', body).group(1)),
            items=[(html.unescape(text), bool(fruit)) for fruit, text in re.findall(r'<li( class="fruit")?>([^<]+)</li>', body)],
        )
    footer = re.search(r'<footer>.*?</footer>', source, re.S).group(0)
    return cards, footer


def minutes(n):
    return pair(f'{n} Min.', f'{n} min')


def serves(n):
    return pair('1 Portion' if n == 1 else f'{n} Portionen', 'Serves 1' if n == 1 else f'Serves {n}')


def count(n, de_one, de_many, en_one, en_many):
    return pair(f'{n} {de_one if n == 1 else de_many}', f'{n} {en_one if n == 1 else en_many}')


DICTIONARY = json.loads((ROOT / 'locales' / 'en.json').read_text(encoding='utf-8'))


def listing(items, word):
    return items[0] if len(items) == 1 else ', '.join(items[:-1]) + f' {word} ' + items[-1]


def answer(name, en_name, items):
    veg = [text for text, fruit in items if not fruit]
    fruit = [text for text, fruit in items if fruit]
    en = lambda text: DICTIONARY.get(text, text)
    de = (f'Im {name} haben in Deutschland vor allem {listing(veg, "und")} Saison. '
          f'Beim Obst kommen {listing(fruit, "und")} auf den Tisch. '
          'Regionale Saisonware ist meist frischer, aromatischer und hat kürzere Transportwege.')
    en_text = (f'In {en_name}, the main vegetables in season in Germany are {listing([en(v).lower() if en(v)[1:].islower() else en(v) for v in veg], "and")}. '
               f'For fruit, look out for {listing([en(f).lower() if en(f)[1:].islower() else en(f) for f in fruit], "and")}. '
               'Regional seasonal produce is usually fresher, more flavourful and travels shorter distances.')
    return pair(de, en_text), en_text


def page(index, month, card, footer):
    name, en_name, slug = DE_NAMES[index], month['en'], month['slug']
    prev_i, next_i = (index - 1) % 12, (index + 1) % 12
    url = f'{SITE}/saisonkalender-{slug}.html'

    title = pair(f'Saisonkalender {name}: Obst, Gemüse & Rezepte | Veganiel',
                 f'Seasonal calendar {en_name}: fruit, veg & recipes | Veganiel')
    description = f'Was hat im {name} Saison? Obst und Gemüse aus Deutschland, drei einfache pflanzliche Rezepte Schritt für Schritt und Ideen für draußen und drinnen.'
    kicker = pair('OBST · GEMÜSE · PFLANZLICHE REZEPTE', 'FRUIT · VEGETABLES · PLANT-BASED RECIPES')
    intro = t(month['intro'])
    h_season = pair(f'Was im {name} Saison hat', f'What is in season in {en_name}')
    h_recipes = pair(f'Pflanzliche Rezepte für den {name}', f'Plant-based recipes for {en_name}')
    h_acts = pair(f'Ideen für den {name}', f'Ideas for {en_name}')

    veg_items = [text for text, fruit in card['items'] if not fruit]
    fruit_items = [text for text, fruit in card['items'] if fruit]
    answer_de, answer_en = answer(name, en_name, card['items'])
    question = pair(f'Welches Obst und Gemüse hat im {name} Saison?', f'Which fruit and vegetables are in season in {en_name}?')
    veg = ''.join(f'<li>{e(text)}</li>' for text in veg_items)
    fruit = ''.join(f'<li>{e(text)}</li>' for text in fruit_items)

    recipe_html, recipe_ld, recipe_nav = [], [], []
    for number, (recipe, detail) in enumerate(zip(month['recipes'], STEPS[slug]), 1):
        r_title = t(recipe['title'])
        ingredients = [t(item) for item in recipe['ing']]
        steps = [t(step) for step in detail['steps']]
        tip = t(detail['tip'])
        recipe_nav.append(
            f'<a href="#rezept-{number}"><span class="rn-num">{number:02d}</span><span class="rn-title">{e(r_title)}</span>'
            f'<span class="rn-time">{e(minutes(recipe["time"]))}</span></a>')
        recipe_html.append(
            f'<article class="recipe reveal" id="rezept-{number}">'
            f'<header class="recipe-head"><span class="recipe-num" aria-hidden="true">{number:02d}</span>'
            f'<div><h3>{e(r_title)}</h3><ul class="recipe-meta">'
            f'<li>{ICON_CLOCK}<span>{e(minutes(recipe["time"]))}</span></li>'
            f'<li>{ICON_BOWL}<span>{e(serves(recipe["serves"]))}</span></li>'
            f'<li>{ICON_LEAF}<span>{e(count(len(steps), "Schritt", "Schritte", "step", "steps"))}</span></li></ul></div></header>'
            f'<div class="recipe-body">'
            f'<div class="recipe-ingredients"><h4>{e(t("Zutaten|Ingredients"))}</h4><ul>'
            + ''.join(f'<li>{e(item)}</li>' for item in ingredients)
            + f'</ul></div><div class="recipe-steps"><h4>{e(t("Zubereitung|Method"))}</h4><ol>'
            + ''.join(f'<li><span class="step-n" aria-hidden="true">{n}</span><p>{e(step)}</p></li>' for n, step in enumerate(steps, 1))
            + f'</ol><aside class="recipe-tip">{ICON_LEAF}<p><strong>{e(t("Tipp|Tip"))}</strong> {e(tip)}</p></aside></div></div></article>')
        recipe_ld.append({
            '@type': 'Recipe', '@id': f'{url}#rezept-{number}', 'name': r_title,
            'author': {'@type': 'Person', 'name': 'Daniel Suckrow'},
            'description': f'Pflanzliches Saisonrezept für den {name}.',
            'suitableForDiet': 'https://schema.org/VeganDiet', 'recipeCategory': 'Hauptgericht' if number < 3 else 'Snack oder Dessert',
            'recipeCuisine': 'Saisonal', 'keywords': f'pflanzlich, saisonal, {name}',
            'totalTime': f'PT{recipe["time"]}M', 'recipeYield': serves(recipe['serves']),
            'recipeIngredient': ingredients,
            'recipeInstructions': [{'@type': 'HowToStep', 'text': step} for step in steps],
            'inLanguage': 'de-DE'})

    acts = ''.join(
        f'<article class="activity reveal"><span class="activity-number" aria-hidden="true">{n:02d}</span><h3>{e(t(a_title))}</h3><p>{e(t(a_text))}</p></article>'
        for n, (a_title, a_text) in enumerate(month['acts'], 1))

    graph = [
        {'@type': 'WebPage', '@id': f'{url}#webpage', 'url': url, 'name': title.replace(' | Veganiel', ''),
         'description': description, 'inLanguage': 'de-DE',
         'isPartOf': {'@type': 'WebSite', 'name': 'Veganiel', 'url': f'{SITE}/'},
         'breadcrumb': {'@id': f'{url}#breadcrumb'}},
        {'@type': 'BreadcrumbList', '@id': f'{url}#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Startseite', 'item': f'{SITE}/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Saisonkalender', 'item': f'{SITE}/saisonkalender.html'},
            {'@type': 'ListItem', 'position': 3, 'name': name, 'item': url}]},
        {'@type': 'FAQPage', '@id': f'{url}#faq', 'mainEntity': [{'@type': 'Question', 'name': question,
            'acceptedAnswer': {'@type': 'Answer', 'text': answer_de}}]},
    ] + recipe_ld
    ld = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/')

    for item in ['Saisonkalender|Seasonal calendar', 'Startseite|Home', 'Brotkrumen|Breadcrumb', 'Gemüse|Vegetables', 'Obst|Fruit',
                 'Alle Rezepte sind rein pflanzlich und Schritt für Schritt erklärt.|All recipes are fully plant-based and explained step by step.',
                 'DRAUSSEN & DRINNEN|OUTDOORS & INDOORS', 'IN DER KÜCHE|IN THE KITCHEN', 'JETZT FRISCH|FRESH NOW',
                 'Zurück zum Saisonkalender|Back to the seasonal calendar', 'Weitere Monate|More months', 'Rezepte dieses Monats|Recipes this month',
                 'Lust auf persönliche Begleitung?|Would you like personal support?',
                 'In meiner Ernährungsberatung schauen wir gemeinsam, wie saisonale, pflanzenbetonte Küche zu deinem Alltag passt.|In my nutrition consultation we look together at how seasonal, plant-focused cooking can fit your everyday life.',
                 'Zur Beratung|To the consultation', 'Alle Monate|All months', 'Vorheriger Monat|Previous month', 'Nächster Monat|Next month',
                 'Zu den Rezepten|To the recipes', 'Saison|Season', 'Rezepte|Recipes', 'Ideen|Ideas', 'Auf dieser Seite|On this page',
                 'Kleine Momente, die den Monat besonders machen.|Small moments that make the month special.']:
        t(item)

    facts = (f'<li><strong>{len(veg_items)}</strong><span>Gemüse</span></li>'
             f'<li><strong>{len(fruit_items)}</strong><span>Obst</span></li>'
             f'<li><strong>3</strong><span>Rezepte</span></li><li><strong>3</strong><span>Ideen</span></li>')

    current = ' aria-current="page"'
    month_links = ''.join(
        f'<a href="saisonkalender-{m["slug"]}.html"{current if i == index else ""}>{e(DE_NAMES[i])}</a>'
        for i, m in enumerate(MONTHS))
    veg_count = count(len(veg_items), 'Sorte', 'Sorten', 'variety', 'varieties')
    fruit_count = count(len(fruit_items), 'Sorte', 'Sorten', 'variety', 'varieties')

    return f'''<!doctype html>
<html lang="de"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}">
  <link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="article"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Daniel Suckrow – Ganzheitliche Ernährungsberatung">
  <meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}/veganiel-hero-daniel.jpg"><meta property="og:image:alt" content="Daniel Suckrow vor einer grünen Berglandschaft">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(description)}"><meta name="twitter:image" content="{SITE}/veganiel-hero-daniel.jpg">
  <link rel="icon" type="image/svg+xml" href="favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="veganiel-logo-32.png">
  <script type="application/ld+json">{ld}</script>
  <script>document.documentElement.classList.add('sm-js')</script>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="branding.css?v=2"><link rel="stylesheet" href="styles/global-nav.css?v=6"><link rel="stylesheet" href="styles/legal-footer.css"><script src="scripts/global-nav.js?v=5" defer></script>
  <link rel="stylesheet" href="styles/season-scenes.css?v=9"><link rel="stylesheet" href="styles/season-month.css?v=4"><link rel="stylesheet" href="i18n.css"><script src="i18n.js?v=journal-20261106" defer></script>
</head>
<body class="season-month-page season-symbols"><header></header><main class="season-main"><div class="wrap">
  <nav class="sm-breadcrumb" aria-label="Brotkrumen"><a href="index.html">Startseite</a><span aria-hidden="true">/</span><a href="saisonkalender.html">Saisonkalender</a><span aria-hidden="true">/</span><span aria-current="page">{e(name)}</span></nav>
  <section class="sm-hero">
    <div class="sm-hero-copy">
      <p class="kicker">{e(kicker)}</p>
      <h1><span class="sm-h1-pre">Saisonkalender</span> {e(name)}<em>{e(card["poetry"])}</em></h1>
      <p class="sm-lead">{e(intro)}</p>
      <ul class="sm-facts">{facts}</ul>
      <a class="sm-hero-cta" href="#rezepte"><span>Zu den Rezepten</span>{ICON_ARROW}</a>
    </div>
    <div class="sm-art-frame"><div class="now-art sm-art" data-scene-month="{index}" aria-hidden="true"></div></div>
  </section>
  <nav class="sm-toc" aria-label="Auf dieser Seite"><a href="#saison">Saison</a><a href="#rezepte">Rezepte</a><a href="#ideen">Ideen</a></nav>

  <section class="sm-section" id="saison" aria-labelledby="saison-title">
    <div class="sm-head reveal"><p class="kicker">JETZT FRISCH</p><h2 id="saison-title">{e(h_season)}</h2><p>{e(card["line"])}</p></div>
    <div class="sm-answer reveal"><h3>{e(question)}</h3><p>{e(answer_de)}</p></div>
    <div class="sm-produce">
      <div class="produce-panel produce-veg reveal"><div class="produce-top"><h3>Gemüse</h3><span>{e(veg_count)}</span></div><ul>{veg}</ul></div>
      <div class="produce-panel produce-fruit reveal"><div class="produce-top"><h3>Obst</h3><span>{e(fruit_count)}</span></div><ul>{fruit}</ul></div>
    </div>
  </section>

  <section class="sm-section" id="rezepte" aria-labelledby="rezepte-title">
    <div class="sm-head reveal"><p class="kicker">IN DER KÜCHE</p><h2 id="rezepte-title">{e(h_recipes)}</h2><p>Alle Rezepte sind rein pflanzlich und Schritt für Schritt erklärt.</p></div>
    <nav class="recipe-nav reveal" aria-label="Rezepte dieses Monats">{"".join(recipe_nav)}</nav>
    <div class="recipes">{"".join(recipe_html)}</div>
  </section>

  <section class="sm-section" id="ideen" aria-labelledby="ideen-title">
    <div class="sm-head reveal"><p class="kicker">DRAUSSEN &amp; DRINNEN</p><h2 id="ideen-title">{e(h_acts)}</h2><p>Kleine Momente, die den Monat besonders machen.</p></div>
    <div class="activities">{acts}</div>
  </section>

  <nav class="sm-pager reveal" aria-label="Weitere Monate">
    <a class="sm-prev" href="saisonkalender-{MONTHS[prev_i]["slug"]}.html"><span>Vorheriger Monat</span><strong>{e(DE_NAMES[prev_i])}</strong></a>
    <a class="sm-back" href="saisonkalender.html">Zurück zum Saisonkalender</a>
    <a class="sm-next" href="saisonkalender-{MONTHS[next_i]["slug"]}.html"><span>Nächster Monat</span><strong>{e(DE_NAMES[next_i])}</strong></a>
  </nav>
  <nav class="sm-months" aria-label="Alle Monate">{month_links}</nav>
  <aside class="sm-cta reveal"><div><h2>Lust auf persönliche Begleitung?</h2><p>In meiner Ernährungsberatung schauen wir gemeinsam, wie saisonale, pflanzenbetonte Küche zu deinem Alltag passt.</p></div><a href="angebot.html"><span>Zur Beratung</span>{ICON_ARROW}</a></aside>
</div></main>{footer}
<script>
(function(){{
  var items=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){{items.forEach(function(el){{el.classList.add('is-in')}});return;}}
  var io=new IntersectionObserver(function(entries){{entries.forEach(function(entry){{if(entry.isIntersecting){{entry.target.classList.add('is-in');io.unobserve(entry.target);}}}})}},{{rootMargin:'0px 0px -8% 0px'}});
  items.forEach(function(el){{io.observe(el)}});
  setTimeout(function(){{items.forEach(function(el){{el.classList.add('is-in')}})}},2500);
}})();
</script>
<script src="scripts/season-scenes.js" defer></script></body></html>
'''


def main():
    cards, footer = read_cards()
    assert [m['slug'] for m in MONTHS] == list(cards), 'Monatsreihenfolge stimmt nicht mit saisonkalender.html überein'
    for index, month in enumerate(MONTHS):
        assert len(STEPS[month['slug']]) == len(month['recipes']), month['slug']
        target = ROOT / f'saisonkalender-{month["slug"]}.html'
        target.write_text(page(index, month, cards[month['slug']], footer), encoding='utf-8')
    path = ROOT / 'locales' / 'en.json'
    dictionary = json.loads(path.read_text(encoding='utf-8'))
    added = 0
    for de, en in translations.items():
        if de not in dictionary:
            dictionary[de] = en
            added += 1
    path.write_text(json.dumps(dictionary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(MONTHS)} Monatsseiten erzeugt, {added} Übersetzungen ergänzt.')


if __name__ == '__main__':
    main()
