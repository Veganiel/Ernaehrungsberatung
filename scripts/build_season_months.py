#!/usr/bin/env python3
"""Erzeugt die zwölf Monatsseiten des Saisonkalenders.

Quelle der Obst- und Gemüselisten: die Monatskarten in saisonkalender.html.
Texte, Rezepte und Aktivitäten: scripts/season_months_content.py (DE|EN).
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

ROOT = Path(__file__).resolve().parent.parent / 'daniel-suckrow-website'
SITE = 'https://veganiel.com'
DE_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

translations = {}


def t(pair):
    """'Deutsch|English' -> Deutsch; merkt sich die Übersetzung."""
    de, en = pair.split('|', 1)
    translations[de.strip()] = en.strip()
    return de.strip()


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
    translations[f'{n} Min.'] = f'{n} min'
    return f'{n} Min.'


def serves(n):
    de = '1 Portion' if n == 1 else f'{n} Portionen'
    translations[de] = 'Serves 1' if n == 1 else f'Serves {n}'
    return de


def page(index, month, card, footer):
    name, en_name, slug = DE_NAMES[index], month['en'], month['slug']
    prev_i, next_i = (index - 1) % 12, (index + 1) % 12
    prev_m, next_m = MONTHS[prev_i], MONTHS[next_i]
    url = f'{SITE}/saisonkalender-{slug}.html'

    title = f'Saisonkalender {name}: Obst, Gemüse & vegane Rezepte | Veganiel'
    translations[title] = f'Seasonal calendar {en_name}: fruit, vegetables & vegan recipes | Veganiel'
    description = f'Was hat im {name} Saison? Obst und Gemüse aus Deutschland, drei einfache vegane Rezepte und Ideen für draußen und drinnen.'
    kicker = t(f'SAISONKALENDER · {name.upper()}|SEASONAL CALENDAR · {en_name.upper()}')
    intro = t(month['intro'])
    h_season = t(f'Was im {name} Saison hat|What is in season in {en_name}')
    h_recipes = t(f'Vegane Rezepte für den {name}|Vegan recipes for {en_name}')
    h_acts = t(f'Ideen für den {name}|Ideas for {en_name}')

    veg = ''.join(f'<li>{e(text)}</li>' for text, fruit in card['items'] if not fruit)
    fruit = ''.join(f'<li class="fruit">{e(text)}</li>' for text, fruit in card['items'] if fruit)

    recipe_html, recipe_ld = [], []
    for number, recipe in enumerate(month['recipes'], 1):
        r_title = t(recipe['title'])
        ingredients = [t(item) for item in recipe['ing']]
        steps = [t(step) for step in recipe['steps']]
        recipe_html.append(
            f'<article class="recipe" id="rezept-{number}">'
            f'<div class="recipe-head"><span class="recipe-tag">{e(t("Vegan|Vegan"))}</span>'
            f'<h3>{e(r_title)}</h3>'
            f'<p class="recipe-meta"><span>{e(minutes(recipe["time"]))}</span><span>{e(serves(recipe["serves"]))}</span></p></div>'
            f'<div class="recipe-body"><div><h4>{e(t("Zutaten|Ingredients"))}</h4><ul>'
            + ''.join(f'<li>{e(item)}</li>' for item in ingredients)
            + f'</ul></div><div><h4>{e(t("Zubereitung|Method"))}</h4><ol>'
            + ''.join(f'<li>{e(step)}</li>' for step in steps)
            + '</ol></div></div></article>')
        recipe_ld.append({
            '@type': 'Recipe', '@id': f'{url}#rezept-{number}', 'name': r_title,
            'author': {'@type': 'Person', 'name': 'Daniel Suckrow'},
            'description': f'Veganes Saisonrezept für den {name}.',
            'image': f'{SITE}/veganiel-hero-daniel.jpg',
            'suitableForDiet': 'https://schema.org/VeganDiet', 'recipeCategory': 'Hauptgericht' if number < 3 else 'Snack oder Dessert',
            'recipeCuisine': 'Saisonal', 'keywords': f'vegan, saisonal, {name}',
            'totalTime': f'PT{recipe["time"]}M', 'recipeYield': serves(recipe['serves']),
            'recipeIngredient': ingredients,
            'recipeInstructions': [{'@type': 'HowToStep', 'text': step} for step in steps],
            'inLanguage': 'de-DE'})

    acts = ''.join(
        f'<article class="activity"><span class="activity-number">{n:02d}</span><h3>{e(t(a_title))}</h3><p>{e(t(a_text))}</p></article>'
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
    ] + recipe_ld
    ld = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/')

    for pair in ['Saisonkalender|Seasonal calendar', 'Startseite|Home', 'Brotkrumen|Breadcrumb',
                 'Alle Rezepte sind rein pflanzlich – ohne Fleisch, Milch und Ei.|All recipes are fully plant-based – no meat, dairy or eggs.',
                 'DRAUSSEN & DRINNEN|OUTDOORS & INDOORS', 'IN DER KÜCHE|IN THE KITCHEN', 'JETZT FRISCH|FRESH NOW',
                 'Zurück zum Saisonkalender|Back to the seasonal calendar', 'Weitere Monate|More months',
                 'Lust auf persönliche Begleitung?|Would you like personal support?',
                 'In meiner Ernährungsberatung schauen wir gemeinsam, wie saisonale, pflanzenbetonte Küche zu deinem Alltag passt.|In my nutrition consultation we look together at how seasonal, plant-focused cooking can fit your everyday life.',
                 'Zur Beratung|To the consultation', 'Alle Monate|All months', 'Vorheriger Monat|Previous month', 'Nächster Monat|Next month']:
        t(pair)

    current = ' aria-current="page"'
    month_links = ''.join(
        f'<a href="saisonkalender-{m["slug"]}.html"{current if i == index else ""}>{e(DE_NAMES[i])}</a>'
        for i, m in enumerate(MONTHS))

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
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="branding.css?v=2"><link rel="stylesheet" href="styles/global-nav.css?v=6"><link rel="stylesheet" href="styles/legal-footer.css"><script src="scripts/global-nav.js?v=5" defer></script>
  <link rel="stylesheet" href="styles/season-scenes.css?v=7"><link rel="stylesheet" href="styles/season-month.css?v=1"><link rel="stylesheet" href="i18n.css"><script src="i18n.js?v=journal-20261106" defer></script>
</head>
<body class="season-month-page"><header></header><main class="season-main"><div class="wrap">
  <nav class="sm-breadcrumb" aria-label="Brotkrumen"><a href="index.html">Startseite</a><span aria-hidden="true">›</span><a href="saisonkalender.html">Saisonkalender</a><span aria-hidden="true">›</span><span aria-current="page">{e(name)}</span></nav>
  <section class="sm-hero">
    <div class="sm-hero-copy"><p class="kicker">{e(kicker)}</p><h1>{e(name)} <em>{e(card["poetry"])}</em></h1><p class="sm-lead">{e(intro)}</p></div>
    <div class="now-art sm-art" data-scene-month="{index}" aria-hidden="true"></div>
  </section>
  <section class="sm-section" aria-labelledby="saison">
    <div class="sm-head"><p class="kicker">JETZT FRISCH</p><h2 id="saison">{e(h_season)}</h2><p>{e(card["line"])}</p></div>
    <div class="sm-produce"><div><h3>Gemüse</h3><ul>{veg}</ul></div><div><h3>Obst</h3><ul>{fruit}</ul></div></div>
  </section>
  <section class="sm-section" aria-labelledby="rezepte">
    <div class="sm-head"><p class="kicker">IN DER KÜCHE</p><h2 id="rezepte">{e(h_recipes)}</h2><p>Alle Rezepte sind rein pflanzlich – ohne Fleisch, Milch und Ei.</p></div>
    <div class="recipes">{"".join(recipe_html)}</div>
  </section>
  <section class="sm-section" aria-labelledby="ideen">
    <div class="sm-head"><p class="kicker">DRAUSSEN &amp; DRINNEN</p><h2 id="ideen">{e(h_acts)}</h2></div>
    <div class="activities">{acts}</div>
  </section>
  <nav class="sm-pager" aria-label="Weitere Monate">
    <a class="sm-prev" href="saisonkalender-{prev_m["slug"]}.html"><span>Vorheriger Monat</span><strong>← {e(DE_NAMES[prev_i])}</strong></a>
    <a class="sm-back" href="saisonkalender.html">Zurück zum Saisonkalender</a>
    <a class="sm-next" href="saisonkalender-{next_m["slug"]}.html"><span>Nächster Monat</span><strong>{e(DE_NAMES[next_i])} →</strong></a>
  </nav>
  <nav class="sm-months" aria-label="Alle Monate">{month_links}</nav>
  <aside class="sm-cta"><div><h2>Lust auf persönliche Begleitung?</h2><p>In meiner Ernährungsberatung schauen wir gemeinsam, wie saisonale, pflanzenbetonte Küche zu deinem Alltag passt.</p></div><a href="angebot.html">Zur Beratung</a></aside>
</div></main>{footer}
<script src="scripts/season-scenes.js" defer></script></body></html>
'''


def main():
    cards, footer = read_cards()
    assert [m['slug'] for m in MONTHS] == list(cards), 'Monatsreihenfolge stimmt nicht mit saisonkalender.html überein'
    for index, month in enumerate(MONTHS):
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
