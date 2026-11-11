"""Gemeinsame SEO-Kopfdaten: eigenes Vorschaubild je Seite und DE/EN-Sprachversionen.

Wird von build_share_images.py (alle Seiten) und build_season_months.py (Monatsseiten) genutzt.
Deutsch ist die Quelle (URL ohne Parameter). Englisch ist dieselbe URL mit ?lang=en;
netlify/edge-functions/seo-language.js passt dafür Titel, Beschreibung, Canonical,
og:locale und das Vorschaubild serverseitig an.
"""
import html
import re

SITE = 'https://veganiel.com'
WIDTH, HEIGHT = 1200, 630

# Tags, die dieses Modul vollständig verwaltet (werden vor dem Einfügen entfernt).
_MANAGED = [
    r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\s*',
    r'<meta property="og:image(?::(?:alt|width|height|type))?" content="[^"]*">\s*',
    r'<meta property="og:locale:alternate" content="[^"]*">\s*',
    r'<meta name="twitter:(?:image|image:alt|card)" content="[^"]*">\s*',
    r'<!-- seo:share -->\s*',
]


def slug_for(rel_path):
    """blog/achtsamkeit/index.html -> blog-achtsamkeit, angebot.html -> angebot, index.html -> startseite."""
    path = rel_path.replace('\\', '/')
    path = re.sub(r'/index\.html$', '', path)
    path = re.sub(r'\.html$', '', path)
    return 'startseite' if path in ('index', '') else path.replace('/', '-')


def image_url(rel_path, english=False):
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
                             ('og:locale', 'de_DE', 'property'), ('og:title', title, 'property'), ('og:description', description, 'property'),
                             ('og:url', url, 'property'), ('twitter:title', title, 'name'), ('twitter:description', description, 'name')]:
        if value and _meta(head, key, attr) is None:
            missing.append(f'<meta {attr}="{key}" content="{_attr(value)}">')

    sep_url = '&' if '?' in url else '?'
    block = [
        '<!-- seo:share -->',
        f'<link rel="alternate" hreflang="de" href="{url}">',
        f'<link rel="alternate" hreflang="en" href="{url}{sep_url}lang=en">',
        f'<link rel="alternate" hreflang="x-default" href="{url}">',
        *missing,
        '<meta property="og:locale:alternate" content="en_GB">',
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
