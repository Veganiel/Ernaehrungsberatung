#!/usr/bin/env python3
"""Erzeugt die eigenständigen englischen Seiten (en/…) aus den deutschen Quellseiten.

Welche Seiten das betrifft, steht in seo_head.STATIC_EN. Die deutsche Seite bleibt die Quelle:
Texte, Attribute (alt, title, aria-label, placeholder), Kopfdaten und strukturierte Daten werden
über locales/en.json übersetzt, Links auf Seitenpaare zeigen auf die englische Datei, alle übrigen
relativen Links bekommen ../ vorangestellt. Fehlt eine Übersetzung, bricht das Skript mit einer Liste ab.

Aufruf (im Repo-Hauptordner):  python3 scripts/build_english_pages.py
Nach jeder Änderung an einer deutschen Challenge-Seite erneut ausführen.
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seo_head  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent / 'daniel-suckrow-website'
DICTIONARY = json.loads((ROOT / 'locales' / 'en.json').read_text(encoding='utf-8'))
# Texte, die in beiden Sprachen gleich bleiben (Eigennamen, Zahlen, Quellenangaben).
SAME_IN_ENGLISH = {
    'Veganiel', 'Challenges', 'Longevity', 'Blog', 'Shop', 'Daniel Suckrow · Veganiel', 'Chili sin carne', 'NHS: Couch to 5K',
    'PDF', '3', '4', '0 €', 'AGB',
    'Daniels Ernährungsberatung',  # Markenzusatz im Logo (translate="no")
}
JSONLD_TEXT = {'name', 'description', 'text'}
SKIP_BLOCKS = re.compile(r'(<script\b.*?</script>|<style\b.*?</style>|<svg\b.*?</svg>|<!--.*?-->)', re.S | re.I)
TEXT_ATTRS = ('alt', 'title', 'aria-label', 'placeholder')
URL_ATTRS = ('href', 'src')
missing = set()


def normalise(value):
    return ' '.join(value.split())


def translate(value, where):
    key = normalise(html.unescape(value))
    if not key or not re.search(r'[A-Za-zÄÖÜäöüß]', key) or key in SAME_IN_ENGLISH:
        return value
    if key in DICTIONARY:
        lead = value[:len(value) - len(value.lstrip())]
        trail = value[len(value.rstrip()):]
        return lead + html.escape(DICTIONARY[key], quote=False) + trail
    missing.add(f'{where}: {key}')
    return value


def map_url(value, rel_en):
    """Links on an English page: page pairs -> English file, everything else relative to the site root."""
    if re.match(r'^(?:[a-z]+:|//|/|#|\?)', value, re.I):
        return value
    path, sep, fragment = value.partition('#')
    if path in seo_head.STATIC_EN:
        target = seo_head.STATIC_EN[path]
        return target.split('/', 1)[1] + sep + fragment if target.startswith('en/') else '../' + target + sep + fragment
    return '../' * rel_en.count('/') + value


def translate_tag(tag, rel_en):
    def attr(match):
        name, value = match.group(1), match.group(2)
        if name in TEXT_ATTRS:
            return f'{name}="{html.escape(html.unescape(translate(value, name)), quote=True)}"'
        if name in URL_ATTRS:
            return f'{name}="{map_url(html.unescape(value), rel_en)}"'
        return match.group(0)
    return re.sub(r'\b([a-z-]+)="([^"]*)"', attr, tag)


def translate_markup(markup, rel_en):
    out = []
    for part in SKIP_BLOCKS.split(markup):
        if SKIP_BLOCKS.fullmatch(part or ''):
            if part.lower().startswith('<script'):
                part = re.sub(r'\bsrc="([^"]*)"', lambda m: f'src="{map_url(m.group(1), rel_en)}"', part, count=1)
            out.append(part)
            continue
        for token in re.split(r'(<[^>]+>)', part):
            if token.startswith('<'):
                out.append(translate_tag(token, rel_en))
            else:
                out.append(translate(token, 'text') if token.strip() else token)
    return ''.join(out)


def translate_jsonld(node, key=None):
    if isinstance(node, dict):
        return {k: ('en' if k == 'inLanguage' else translate_jsonld(v, k)) for k, v in node.items()}
    if isinstance(node, list):
        return [translate_jsonld(v, key) for v in node]
    if isinstance(node, str):
        if node.startswith(seo_head.SITE + '/'):
            path, sep, fragment = node[len(seo_head.SITE) + 1:].partition('#')
            return f'{seo_head.SITE}/{seo_head.STATIC_EN[path]}{sep}{fragment}' if path in seo_head.STATIC_EN else node
        if key in JSONLD_TEXT:
            return html.unescape(translate(node, 'json-ld'))
    return node


def build(rel_de, rel_en):
    document = (ROOT / rel_de).read_text(encoding='utf-8')
    head, sep, body = document.partition('</head>')
    en_url = f'{seo_head.SITE}/{rel_en}'
    head = head.replace('<html lang="de" data-page-lang="de">', '<html lang="en" data-page-lang="en">', 1)
    if 'data-page-lang="en"' not in head:
        raise SystemExit(f'{rel_de}: <html lang="de" data-page-lang="de"> fehlt')
    head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{en_url}">', head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{en_url}">', head)
    head = head.replace('<meta property="og:locale" content="de_DE">', '<meta property="og:locale" content="en_GB">')
    head = re.sub(r'(<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)" content=")([^"]*)(")',
                  lambda m: m.group(1) + html.escape(html.unescape(translate(m.group(2), 'meta')), quote=True) + m.group(3), head)
    head = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)',
                  lambda m: m.group(1) + json.dumps(translate_jsonld(json.loads(m.group(2))), ensure_ascii=False) + m.group(3), head, flags=re.S)
    head = translate_markup(head, rel_en)
    body = translate_markup(body, rel_en)
    document = head + sep + body
    title = html.unescape(re.search(r'<title>(.*?)</title>', document, re.S).group(1)).split(' | ')[0].strip()
    document = seo_head.patch(document, rel_en, f'Preview image: {title}')
    target = ROOT / rel_en
    target.parent.mkdir(exist_ok=True)
    target.write_text(document, encoding='utf-8')
    return rel_en


def main():
    built = [build(de, en) for de, en in seo_head.STATIC_EN.items()]
    if missing:
        print('Fehlende englische Übersetzungen in locales/en.json:', file=sys.stderr)
        for item in sorted(missing):
            print('  ' + item, file=sys.stderr)
        sys.exit(1)
    print('Englische Seiten erzeugt: ' + ', '.join(built))


if __name__ == '__main__':
    main()
