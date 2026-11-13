"""Gemeinsame SEO-Kopfdaten: eigenes Vorschaubild je Seite und DE/EN-Sprachversionen.

Wird von build_share_images.py (alle Seiten) und build_season_months.py (Monatsseiten) genutzt.
Deutsch ist die Quelle (URL ohne Parameter). Englisch ist dieselbe URL mit ?lang=en;
netlify/edge-functions/seo-language.js passt dafür Titel, Beschreibung, Canonical,
og:locale und das Vorschaubild serverseitig an.

Ausnahme: Seiten in STATIC_EN haben eine eigene englische Datei unter en/ (erzeugt mit
build_english_pages.py). Dort zeigen die hreflang-Angaben auf die jeweils andere Datei.
"""
import html
import re

SITE = 'https://veganiel.com'
WIDTH, HEIGHT = 1200, 630

# Deutsche Seite -> eigene englische Seite (statt ?lang=en).
STATIC_EN = {
    'challenges.html': 'en/challenges.html',
    'challenge-intervallfasten.html': 'en/challenge-intermittent-fasting.html',
    'challenge-7-tage-vegan.html': 'en/challenge-7-day-vegan.html',
    'challenge-abendroutine.html': 'en/challenge-evening-routine.html',
    'challenge-5-km-laufen.html': 'en/challenge-first-5k.html',
    'challenge-10-km-laufen.html': 'en/challenge-10k.html',
    'challenge-halbmarathon.html': 'en/challenge-half-marathon.html',
    'angebot.html': 'en/nutrition-consulting.html',
    'blog-uebersicht.html': 'en/blog-uebersicht.html',
    'gesundheits-check.html': 'en/gesundheits-check.html',
    'herzfrequenz-rechner.html': 'en/herzfrequenz-rechner.html',
    'index.html': 'en/index.html',
    'kennenlernen.html': 'en/kennenlernen.html',
    'longevity.html': 'en/longevity.html',
    'naehrstoffe.html': 'en/naehrstoffe.html',
    'protein-rechner.html': 'en/protein-rechner.html',
    'quiz.html': 'en/quiz.html',
    'rezepte.html': 'en/rezepte.html',
    'saisonkalender-april.html': 'en/saisonkalender-april.html',
    'saisonkalender-august.html': 'en/saisonkalender-august.html',
    'saisonkalender-dezember.html': 'en/saisonkalender-dezember.html',
    'saisonkalender-februar.html': 'en/saisonkalender-februar.html',
    'saisonkalender-januar.html': 'en/saisonkalender-januar.html',
    'saisonkalender-juli.html': 'en/saisonkalender-juli.html',
    'saisonkalender-juni.html': 'en/saisonkalender-juni.html',
    'saisonkalender-maerz.html': 'en/saisonkalender-maerz.html',
    'saisonkalender-mai.html': 'en/saisonkalender-mai.html',
    'saisonkalender-november.html': 'en/saisonkalender-november.html',
    'saisonkalender-oktober.html': 'en/saisonkalender-oktober.html',
    'saisonkalender-september.html': 'en/saisonkalender-september.html',
    'saisonkalender.html': 'en/saisonkalender.html',
    'shop.html': 'en/shop.html',
    'supplement-rechner.html': 'en/supplement-rechner.html',
    'taille-rechner.html': 'en/taille-rechner.html',
    'ueber-mich.html': 'en/ueber-mich.html',
    'veganer-naehrstoff-check.html': 'en/veganer-naehrstoff-check.html',
    'vo2max-rechner.html': 'en/vo2max-rechner.html',
    'blog/achtsames-spazieren-im-wald/index.html': 'en/blog/achtsames-spazieren-im-wald/index.html',
    'blog/achtsamkeit/index.html': 'en/blog/achtsamkeit/index.html',
    'blog/antiangiogenese/index.html': 'en/blog/antiangiogenese/index.html',
    'blog/antioxidantien/index.html': 'en/blog/antioxidantien/index.html',
    'blog/ballaststoffe/index.html': 'en/blog/ballaststoffe/index.html',
    'blog/bioaktive-verbindungen/index.html': 'en/blog/bioaktive-verbindungen/index.html',
    'blog/darmreinigung-sanierung/index.html': 'en/blog/darmreinigung-sanierung/index.html',
    'blog/diskriminierung/index.html': 'en/blog/diskriminierung/index.html',
    'blog/karottensaft/index.html': 'en/blog/karottensaft/index.html',
    'blog/kritische-naehrstoffe-vegan/index.html': 'en/blog/kritische-naehrstoffe-vegan/index.html',
    'blog/omega-3-6-verhaeltnis/index.html': 'en/blog/omega-3-6-verhaeltnis/index.html',
    'blog/supplemente/index.html': 'en/blog/supplemente/index.html',
    'blog/telomere/index.html': 'en/blog/telomere/index.html',
    'blog/umgang-mit-stress/index.html': 'en/blog/umgang-mit-stress/index.html',
    'blog/veganismus-chancen-herausforderungen/index.html': 'en/blog/veganismus-chancen-herausforderungen/index.html',
    'blog/vitamin-b12/index.html': 'en/blog/vitamin-b12/index.html',
    'blog/vitamin-d-winter/index.html': 'en/blog/vitamin-d-winter/index.html',
    'blog/weniger-salz/index.html': 'en/blog/weniger-salz/index.html',
    'blog/zusatzstoffe-nahrungsmitteln/index.html': 'en/blog/zusatzstoffe-nahrungsmitteln/index.html',
    'rezepte/bohnen-eintopf/index.html': 'en/rezepte/bohnen-eintopf/index.html',
    'rezepte/chili-sin-carne/index.html': 'en/rezepte/chili-sin-carne/index.html',
    'rezepte/dinkel-pancakes/index.html': 'en/rezepte/dinkel-pancakes/index.html',
    'rezepte/dinkel-porridge/index.html': 'en/rezepte/dinkel-porridge/index.html',
    'rezepte/gefuellte-suesskartoffel/index.html': 'en/rezepte/gefuellte-suesskartoffel/index.html',
    'rezepte/hummus-avocado-brot/index.html': 'en/rezepte/hummus-avocado-brot/index.html',
    'rezepte/kichererbsen-curry/index.html': 'en/rezepte/kichererbsen-curry/index.html',
    'rezepte/linsen-bolognese/index.html': 'en/rezepte/linsen-bolognese/index.html',
    'rezepte/linsen-dal/index.html': 'en/rezepte/linsen-dal/index.html',
    'rezepte/linsensalat-rote-bete/index.html': 'en/rezepte/linsensalat-rote-bete/index.html',
    'rezepte/mango-chia-pudding/index.html': 'en/rezepte/mango-chia-pudding/index.html',
    'rezepte/mediterrane-linsen-bowl/index.html': 'en/rezepte/mediterrane-linsen-bowl/index.html',
    'rezepte/ofenaepfel-haferstreusel/index.html': 'en/rezepte/ofenaepfel-haferstreusel/index.html',
    'rezepte/ofentofu-brokkoli/index.html': 'en/rezepte/ofentofu-brokkoli/index.html',
    'rezepte/overnight-oats/index.html': 'en/rezepte/overnight-oats/index.html',
    'rezepte/schoko-bananen-eis/index.html': 'en/rezepte/schoko-bananen-eis/index.html',
    'rezepte/schoko-energiekugeln/index.html': 'en/rezepte/schoko-energiekugeln/index.html',
    'rezepte/schokomousse-seidentofu/index.html': 'en/rezepte/schokomousse-seidentofu/index.html',
    'rezepte/tempeh-bowl/index.html': 'en/rezepte/tempeh-bowl/index.html',
    'rezepte/tofu-ruehrei/index.html': 'en/rezepte/tofu-ruehrei/index.html',
    'rezepte/wintergemuese-bowl/index.html': 'en/rezepte/wintergemuese-bowl/index.html',
    'naehrstoffe/ballaststoffe/index.html': 'en/naehrstoffe/ballaststoffe/index.html',
    'naehrstoffe/calcium/index.html': 'en/naehrstoffe/calcium/index.html',
    'naehrstoffe/eisen/index.html': 'en/naehrstoffe/eisen/index.html',
    'naehrstoffe/folat/index.html': 'en/naehrstoffe/folat/index.html',
    'naehrstoffe/gesaettigte-fettsaeuren/index.html': 'en/naehrstoffe/gesaettigte-fettsaeuren/index.html',
    'naehrstoffe/jod/index.html': 'en/naehrstoffe/jod/index.html',
    'naehrstoffe/magnesium/index.html': 'en/naehrstoffe/magnesium/index.html',
    'naehrstoffe/omega-3/index.html': 'en/naehrstoffe/omega-3/index.html',
    'naehrstoffe/protein/index.html': 'en/naehrstoffe/protein/index.html',
    'naehrstoffe/salz/index.html': 'en/naehrstoffe/salz/index.html',
    'naehrstoffe/sekundaere-pflanzenstoffe/index.html': 'en/naehrstoffe/sekundaere-pflanzenstoffe/index.html',
    'naehrstoffe/selen/index.html': 'en/naehrstoffe/selen/index.html',
    'naehrstoffe/vitamin-b12/index.html': 'en/naehrstoffe/vitamin-b12/index.html',
    'naehrstoffe/vitamin-d/index.html': 'en/naehrstoffe/vitamin-d/index.html',
    'naehrstoffe/zink/index.html': 'en/naehrstoffe/zink/index.html',
}
STATIC_DE = {en: de for de, en in STATIC_EN.items()}

# Tags, die dieses Modul vollständig verwaltet (werden vor dem Einfügen entfernt).
_MANAGED = [
    r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\s*',
    r'<meta property="og:image(?::(?:alt|width|height|type))?" content="[^"]*">\s*',
    r'<meta property="og:locale:alternate" content="[^"]*">\s*',
    r'<meta name="twitter:(?:image|image:alt|card)" content="[^"]*">\s*',
    r'<!-- seo:share -->\s*',
]


def public_url(rel_path):
    """en/rezepte/x/index.html -> https://veganiel.com/en/rezepte/x/, index.html -> https://veganiel.com/"""
    return f'{SITE}/' + re.sub(r'(^|/)index\.html$', r'\1', rel_path)


def slug_for(rel_path):
    """blog/achtsamkeit/index.html -> blog-achtsamkeit, angebot.html -> angebot, index.html -> startseite."""
    path = rel_path.replace('\\', '/')
    path = STATIC_DE.get(path, path)  # englische Seiten nutzen das -en-Bild ihrer deutschen Seite
    path = re.sub(r'/index\.html$', '', path)
    path = re.sub(r'\.html$', '', path)
    return 'startseite' if path in ('index', '') else path.replace('/', '-')


def image_url(rel_path, english=False):
    english = english or rel_path in STATIC_DE
    return f'{SITE}/og/{slug_for(rel_path)}{"-en" if english else ""}.jpg'


def _attr(value):
    return html.escape(html.unescape(value), quote=True)


def _meta(head, key, attr='property'):
    match = re.search(rf'<meta {attr}="{re.escape(key)}" content="([^"]*)">', head)
    return html.unescape(match.group(1)) if match else None


def patch(document, rel_path, alt_text):
    """Setzt Vorschaubild, hreflang und fehlende Open-Graph-/Twitter-Angaben im <head>."""
    head, sep, rest = document.partition('</head>')
    if not sep:
        raise ValueError(f'{rel_path}: kein </head>')
    canonical = re.search(r'<link rel="canonical" href="([^"]+)">', head)
    if not canonical:
        raise ValueError(f'{rel_path}: kein Canonical')
    url = canonical.group(1)
    for pattern in _MANAGED:
        head = re.sub(pattern, '', head)

    title = html.unescape(re.search(r'<title>(.*?)</title>', head, re.S).group(1).strip())
    description = _meta(head, 'description', 'name') or ''
    missing = []
    for key, value, attr in [('og:type', 'website', 'property'), ('og:site_name', 'Daniel Suckrow – Ganzheitliche Ernährungsberatung', 'property'),
                             ('og:locale', 'en_GB' if rel_path in STATIC_DE else 'de_DE', 'property'), ('og:title', title, 'property'), ('og:description', description, 'property'),
                             ('og:url', url, 'property'), ('twitter:title', title, 'name'), ('twitter:description', description, 'name')]:
        if value and _meta(head, key, attr) is None:
            missing.append(f'<meta {attr}="{key}" content="{_attr(value)}">')

    english = rel_path in STATIC_DE
    if english:
        de_url, en_url = public_url(STATIC_DE[rel_path]), url
    elif rel_path in STATIC_EN:
        de_url, en_url = url, public_url(STATIC_EN[rel_path])
    else:
        de_url, en_url = url, url + ('&' if '?' in url else '?') + 'lang=en'
    block = [
        '<!-- seo:share -->',
        f'<link rel="alternate" hreflang="de" href="{de_url}">',
        f'<link rel="alternate" hreflang="en" href="{en_url}">',
        f'<link rel="alternate" hreflang="x-default" href="{de_url}">',
        *missing,
        f'<meta property="og:locale:alternate" content="{"de_DE" if english else "en_GB"}">',
        f'<meta property="og:image" content="{image_url(rel_path)}">',
        '<meta property="og:image:type" content="image/jpeg">',
        f'<meta property="og:image:width" content="{WIDTH}">',
        f'<meta property="og:image:height" content="{HEIGHT}">',
        f'<meta property="og:image:alt" content="{_attr(alt_text)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:image" content="{image_url(rel_path)}">',
        f'<meta name="twitter:image:alt" content="{_attr(alt_text)}">',
    ]
    insert_at = canonical.end()
    # canonical-Position nach dem Entfernen neu bestimmen
    canonical = re.search(r'<link rel="canonical" href="[^"]+">', head)
    insert_at = canonical.end()
    head = head[:insert_at] + '\n  ' + '\n  '.join(block) + '\n  ' + head[insert_at:].lstrip(' ')
    return head + sep + rest
