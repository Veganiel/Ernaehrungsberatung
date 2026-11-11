#!/usr/bin/env python3
"""Erzeugt für jede öffentliche Seite ein eigenes Vorschaubild (1200 × 630) auf Deutsch und Englisch
und trägt es samt hreflang-Angaben in den Seitenkopf ein.

Benötigt Google Chrome (headless) und Pillow.
Aufruf (im Repo-Hauptordner):  python3 scripts/build_share_images.py [--only blog-achtsamkeit,angebot] [--no-images]
Nach neuen Seiten oder geänderten Titeln erneut ausführen. Monatsseiten zuerst mit build_season_months.py erzeugen.
"""
import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seo_head  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent / 'daniel-suckrow-website'
OUT = ROOT / 'og'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
MONTHS = ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember']

KICKERS = {
    'blog': ('Ernährungsblog', 'Nutrition blog'), 'calc': ('Gesundheitsrechner', 'Health calculator'),
    'tools': ('Wissen & Tools', 'Knowledge & tools'), 'season': ('Saisonkalender', 'Seasonal calendar'),
    'consult': ('Ernährungsberatung', 'Nutrition consulting'), 'about': ('Über mich', 'About me'),
    'legal': ('Rechtliches', 'Legal'), 'quiz': ('Quizwelt', 'Quiz world'), 'challenge': ('Challenges', 'Challenges'),
    'longevity': ('Longevity', 'Longevity'), 'shop': ('Shop', 'Shop'), 'home': ('Online-Ernährungsberatung', 'Online nutrition consulting'),
}

# Seite -> (Rubrik, Bildmotiv). Motiv: photo:<datei>, scene:<monat 0-11>, icon:<name>
PAGES = {
    'index.html': ('home', 'photo:veganiel-hero-daniel-1100.jpg'),
    'ueber-mich.html': ('about', 'photo:daniel-suckrow-portrait.jpg'),
    'angebot.html': ('consult', 'icon:bowl'),
    'kennenlernen.html': ('consult', 'icon:chat'),
    'blog-uebersicht.html': ('blog', 'icon:book'),
    'challenges.html': ('challenge', 'icon:flag'),
    'challenge-intervallfasten.html': ('challenge', 'icon:hourglass'),
    'challenge-7-tage-vegan.html': ('challenge', 'icon:leaf'),
    'challenge-abendroutine.html': ('challenge', 'icon:moon'),
    'challenge-5-km-laufen.html': ('challenge', 'icon:run'),
    'longevity.html': ('longevity', 'icon:hourglass'),
    'quiz.html': ('quiz', 'icon:question'),
    'shop.html': ('shop', 'photo:assets/shop/make-the-connection-spreadshop.webp'),
    'supplement-rechner.html': ('calc', 'icon:capsule'),
    'gesundheits-check.html': ('calc', 'icon:checklist'),
    'herzfrequenz-rechner.html': ('calc', 'icon:heart'),
    'vo2max-rechner.html': ('calc', 'icon:run'),
    'taille-rechner.html': ('calc', 'icon:tape'),
    'veganer-naehrstoff-check.html': ('tools', 'photo:naehrstoff-check-hero.jpg'),
    'saisonkalender.html': ('season', 'scene:4'),
    'agb.html': ('legal', 'icon:document'), 'datenschutz.html': ('legal', 'icon:lock'), 'impressum.html': ('legal', 'icon:document'),
}
BLOG_ICONS = {
    'achtsames-spazieren-im-wald': 'tree', 'achtsamkeit': 'lotus', 'umgang-mit-stress': 'lotus',
    'antiangiogenese': 'molecule', 'bioaktive-verbindungen': 'molecule', 'telomere': 'dna', 'antioxidantien': 'berries',
    'ballaststoffe': 'grain', 'darmreinigung-sanierung': 'grain', 'diskriminierung': 'hands', 'veganismus-chancen-herausforderungen': 'hands',
    'karottensaft': 'carrot', 'kritische-naehrstoffe': 'capsule', 'kritische-naehrstoffe-vegan': 'capsule', 'supplemente': 'capsule',
    'vitamin-b12': 'capsule', 'omega-3-6-verhaeltnis': 'drop', 'omega-fettsaeuren': 'drop', 'weniger-salz': 'salt', 'zusatzstoffe-nahrungsmitteln': 'flask',
}

ICONS = {  # Linien-Symbole, viewBox 0 0 64 64
    'leaf': '<path d="M12 52c0-22 14-36 40-40 0 26-16 40-40 40Z"/><path d="M12 52 38 26M24 40l-1-10M32 32l10 1"/>',
    'tree': '<path d="M32 58V34"/><path d="M32 34c-14 0-20-9-17-18 2-7 9-10 15-8 2-5 11-7 15-2 7-1 11 6 9 12 5 6 0 16-9 16H32Z"/><path d="M32 44l-7-6M32 40l6-5"/>',
    'lotus': '<path d="M32 50c-8-6-10-16-0-28 10 12 8 22 0 28Z"/><path d="M32 50c-10 0-20-6-22-18 10 0 18 6 22 18ZM32 50c10 0 20-6 22-18-10 0-18 6-22 18Z"/><path d="M14 56h36"/>',
    'molecule': '<circle cx="32" cy="32" r="6"/><circle cx="14" cy="16" r="5"/><circle cx="50" cy="16" r="5"/><circle cx="14" cy="50" r="5"/><circle cx="50" cy="50" r="5"/><path d="M27 28 18 20M37 28l9-8M27 36l-9 10M37 36l9 10"/>',
    'dna': '<path d="M20 6c0 18 24 18 24 26S20 46 20 58M44 6c0 18-24 18-24 26s24 14 24 26"/><path d="M24 14h16M22 24h20M22 40h20M24 50h16"/>',
    'berries': '<circle cx="22" cy="40" r="9"/><circle cx="40" cy="44" r="9"/><circle cx="32" cy="26" r="8"/><path d="M32 18c0-6 4-10 10-11M32 18c-2-5-7-8-12-7"/>',
    'grain': '<path d="M32 58V14"/><path d="M32 22c-8-2-12-8-12-14 8 1 12 7 12 14ZM32 22c8-2 12-8 12-14-8 1-12 7-12 14ZM32 36c-8-2-12-8-12-14 8 1 12 7 12 14ZM32 36c8-2 12-8 12-14-8 1-12 7-12 14ZM32 50c-8-2-12-8-12-14 8 1 12 7 12 14ZM32 50c8-2 12-8 12-14-8 1-12 7-12 14Z"/>',
    'hands': '<path d="M32 30c-4-6-14-6-14 2 0 8 14 14 14 14s14-6 14-14c0-8-10-8-14-2Z"/><path d="M6 44l10 6c4 2 8 3 12 3h8M58 44l-10 6c-4 2-8 3-12 3"/>',
    'carrot': '<path d="M18 54 46 22c4-4 2-12-4-12-3 0-5 1-6 3L12 46c-3 3-2 10 6 8Z"/><path d="M44 12c2-5 7-8 12-6-2 5-7 8-12 6ZM46 14c5-1 10 1 11 6-5 1-10-1-11-6M26 36l4 4M20 42l4 4M32 28l4 4"/>',
    'capsule': '<rect x="10" y="22" width="44" height="20" rx="10" transform="rotate(-35 32 32)"/><path d="M26 22l12 18"/><circle cx="48" cy="48" r="7"/><path d="M43 53l10-10"/>',
    'drop': '<path d="M32 6c10 15 18 24 18 34a18 18 0 0 1-36 0c0-10 8-19 18-34Z"/><path d="M24 42a8 8 0 0 0 8 8"/>',
    'salt': '<path d="M22 24h20l4 32H18l4-32Z"/><path d="M24 24c0-10 4-16 8-16s8 6 8 16"/><path d="M28 14h1M35 14h1M31 10h1"/>',
    'flask': '<path d="M26 6h12M28 6v18L14 50c-2 4 0 8 5 8h26c5 0 7-4 5-8L36 24V6"/><path d="M20 42h24"/><circle cx="30" cy="50" r="2"/><circle cx="38" cy="47" r="1.5"/>',
    'bowl': '<path d="M8 30h48a24 24 0 0 1-48 0Z"/><path d="M24 22c-4-6 2-10 0-16M34 22c-4-6 2-10 0-16M44 22c-4-6 2-10 0-16"/><path d="M22 56h20"/>',
    'chat': '<path d="M10 14h44v28H30l-12 10v-10h-8Z"/><path d="M20 26h24M20 33h16"/>',
    'book': '<path d="M32 14c-8-5-16-6-24-5v40c8-1 16 0 24 5 8-5 16-6 24-5V9c-8-1-16 0-24 5Z"/><path d="M32 14v40"/>',
    'flag': '<path d="M14 58V8"/><path d="M14 10h34l-7 10 7 10H14"/>',
    'hourglass': '<path d="M16 6h32M16 58h32M20 6c0 14 24 18 24 26S20 46 20 58M44 6c0 14-24 18-24 26s24 14 24 26"/><path d="M26 52h12"/>',
    'question': '<circle cx="32" cy="32" r="26"/><path d="M24 24c0-5 4-9 8-9 5 0 8 3 8 8 0 7-8 7-8 14"/><circle cx="32" cy="46" r="1.6"/>',
    'heart': '<path d="M32 54S8 40 8 24c0-8 6-14 13-14 5 0 9 3 11 7 2-4 6-7 11-7 7 0 13 6 13 14 0 16-24 30-24 30Z"/><path d="M12 32h12l4-8 6 16 4-8h14"/>',
    'run': '<circle cx="40" cy="10" r="5"/><path d="M22 26l10-6 10 4 4 10 8 2M32 20l-6 16 10 8-4 14M26 36l-10 2-6 10"/>',
    'tape': '<circle cx="24" cy="30" r="16"/><circle cx="24" cy="30" r="5"/><path d="M24 46h32V34H40"/><path d="M44 46v-5M50 46v-5"/>',
    'checklist': '<rect x="12" y="8" width="40" height="50" rx="6"/><path d="M20 22l4 4 7-8M20 36l4 4 7-8M36 23h10M36 37h10M20 50h26"/>',
    'document': '<path d="M16 6h24l12 12v40H16Z"/><path d="M40 6v12h12M22 30h22M22 38h22M22 46h14"/>',
    'moon': '<path d="M40 8a24 24 0 1 0 16 38A20 20 0 0 1 40 8Z"/><path d="M50 10v8M46 14h8M56 26v4M54 28h4"/>',
    'lock': '<rect x="14" y="28" width="36" height="28" rx="6"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/><circle cx="32" cy="41" r="3"/><path d="M32 44v5"/>',
}


def read_meta(document):
    head = document.split('</head>')[0]
    title = html.unescape(re.search(r'<title>(.*?)</title>', head, re.S).group(1).strip())
    desc = re.search(r'<meta name="description" content="([^"]*)">', head)
    return title, html.unescape(desc.group(1)) if desc else ''


def card_title(title):
    return title.split(' | ')[0].strip()


def page_config(rel):
    if rel.startswith('blog/'):
        return 'blog', 'icon:' + BLOG_ICONS.get(rel.split('/')[1], 'leaf')
    match = re.fullmatch(r'saisonkalender-([a-z]+)\.html', rel)
    if match:
        return 'season', f'scene:{MONTHS.index(match.group(1))}'
    return PAGES.get(rel, ('tools', 'icon:leaf'))


def public_pages():
    for path in sorted(ROOT.rglob('*.html')):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith('og/') or rel.startswith('_'):
            continue
        head = path.read_text(encoding='utf-8').split('</head>')[0]
        if re.search(r'<meta\s+name="robots"\s+content="[^"]*noindex', head) or 'rel="canonical"' not in head:
            continue
        yield rel, path


def visual_html(visual, rel):
    kind, _, value = visual.partition(':')
    if kind == 'photo':
        return f'<div class="photo" style="background-image:url(\'../{value}\')"></div>'
    if kind == 'scene':
        return f'<div class="scene now-art" data-scene-month="{value}"></div>'
    return f'<div class="icon-disc"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{ICONS[value]}</svg></div>'


TEMPLATE = '''<!doctype html><html lang="{lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=block" rel="stylesheet">
<link rel="stylesheet" href="../styles/season-scenes.css">
<style>
*{{box-sizing:border-box;margin:0}}html,body{{width:1200px;height:630px;overflow:hidden}}
body{{position:relative;font-family:'DM Sans',sans-serif;background:linear-gradient(140deg,#0f2f22 0%,#1b4635 52%,#2d5d44 100%);color:#f4f3e8}}
body::before{{content:'';position:absolute;inset:0;background:radial-gradient(520px 340px at 92% 6%,rgba(217,232,160,.20),transparent 70%),radial-gradient(460px 300px at 0% 105%,rgba(176,141,71,.20),transparent 70%)}}
.pattern{{position:absolute;inset:-60px;background:url('../styles/season-symbols.svg') 0 0/360px repeat;opacity:.13;filter:brightness(2.6) saturate(.6);transform:rotate(-7deg);-webkit-mask-image:linear-gradient(90deg,#000 0 6%,transparent 30% 66%,#000 100%)}}
.frame{{position:absolute;inset:22px;border:1px solid rgba(233,240,221,.16);border-radius:30px}}
.copy{{position:absolute;left:76px;top:70px;width:620px;bottom:70px;display:flex;flex-direction:column}}
.brand{{display:flex;align-items:center;gap:14px;font:600 26px/1 'Playfair Display',serif;color:#fbfaf2}}
.brand img{{width:46px;height:46px;border-radius:12px}}
.kicker{{display:flex;align-items:center;gap:14px;margin-top:46px;font-size:17px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#d9e8a0}}
.kicker::before{{content:'';width:34px;height:1.5px;background:currentColor;opacity:.7}}
h1{{margin-top:20px;font:500 {size}px/1.04 'Playfair Display',serif;letter-spacing:-.03em;color:#fff;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}}
p{{margin-top:22px;font-size:21px;line-height:1.5;color:#cfdccb;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
.url{{margin-top:auto;display:flex;align-items:center;gap:12px;font-size:17px;font-weight:600;letter-spacing:.06em;color:#b9cdb2}}
.url::before{{content:'';width:9px;height:9px;border-radius:50%;background:#d9e8a0}}
.visual{{position:absolute;right:70px;top:70px;bottom:70px;width:400px;display:grid;place-items:center}}
.photo,.scene{{width:400px;height:490px;border-radius:200px 200px 28px 28px;background-size:cover;background-position:center 30%;border:10px solid rgba(251,250,242,.10);box-shadow:0 40px 70px -30px rgba(0,0,0,.7);overflow:hidden}}
.scene{{background:#1c4a35}}.scene svg{{width:100%;height:100%;display:block}}
.icon-disc{{width:330px;height:330px;border-radius:50%;display:grid;place-items:center;color:#183d2e;background:radial-gradient(circle at 35% 30%,#eef5c9,#cfe08e 70%);box-shadow:0 0 0 18px rgba(217,232,160,.12),0 0 0 40px rgba(217,232,160,.06),0 40px 70px -30px rgba(0,0,0,.7)}}
.icon-disc svg{{width:168px;height:168px}}
</style></head><body><div class="pattern"></div><div class="frame"></div>
<div class="copy"><div class="brand"><img src="../veganiel-logo-192.png" alt="">Veganiel</div>
<div class="kicker">{kicker}</div><h1>{title}</h1><p>{subtitle}</p><div class="url">veganiel.com</div></div>
<div class="visual">{visual}</div>
<script src="../scripts/season-scenes.js"></script></body></html>'''


def render(rel, lang, kicker, title, subtitle, visual, workdir, target):
    size = 64 if len(title) <= 34 else 56 if len(title) <= 52 else 48 if len(title) <= 72 else 42
    page = TEMPLATE.format(lang=lang, kicker=html.escape(kicker), title=html.escape(title), subtitle=html.escape(subtitle),
                           visual=visual_html(visual, rel), size=size)
    source = workdir / 'card.html'
    source.write_text(page, encoding='utf-8')
    png = workdir / 'card.png'
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=1200,630', '--virtual-time-budget=6000', f'--screenshot={png}', source.as_uri()],
                   check=True, capture_output=True)
    from PIL import Image
    Image.open(png).convert('RGB').save(target, 'JPEG', quality=84, optimize=True, progressive=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--only', default='')
    parser.add_argument('--no-images', action='store_true', help='nur Kopfdaten aktualisieren')
    args = parser.parse_args()
    only = {item for item in args.only.split(',') if item}
    dictionary = json.loads((ROOT / 'locales' / 'en.json').read_text(encoding='utf-8'))
    added = {}
    OUT.mkdir(exist_ok=True)
    workdir = ROOT / '_og_render'
    workdir.mkdir(exist_ok=True)
    count = 0
    try:
        for rel, path in public_pages():
            slug = seo_head.slug_for(rel)
            document = path.read_text(encoding='utf-8')
            title, description = read_meta(document)
            if rel in seo_head.STATIC_DE:
                # Eigene englische Seite: nutzt das -en-Bild der deutschen Seite, nur Kopfdaten setzen.
                path.write_text(seo_head.patch(document, rel, f'Preview image: {card_title(title)}'), encoding='utf-8')
                continue
            group, visual = page_config(rel)
            de_title = card_title(title)
            en_full = dictionary.get(title)
            if not en_full:
                print(f'WARNUNG: keine englische Übersetzung für den Titel von {rel}')
            en_title = card_title(en_full or title)
            en_desc = dictionary.get(description, description)
            alt_de = f'Vorschaubild: {de_title}'
            added[alt_de] = f'Preview image: {en_title}'
            path.write_text(seo_head.patch(document, rel, alt_de), encoding='utf-8')
            if args.no_images or (only and slug not in only):
                continue
            kicker_de, kicker_en = KICKERS[group]
            if group == 'season' and rel != 'saisonkalender.html':
                month = rel[len('saisonkalender-'):-5]
                kicker_de = f'{kicker_de} · {de_title.split()[1].rstrip(":")}'
                kicker_en = f'{kicker_en} · {en_title.split()[2].rstrip(":") if en_title.lower().startswith("seasonal calendar") else month}'
            render(rel, 'de', kicker_de, de_title, description, visual, workdir, OUT / f'{slug}.jpg')
            render(rel, 'en', kicker_en, en_title, en_desc, visual, workdir, OUT / f'{slug}-en.jpg')
            count += 1
            print(f'✓ {slug}')
    finally:
        shutil.rmtree(workdir, ignore_errors=True)
    dict_path = ROOT / 'locales' / 'en.json'
    dictionary = json.loads(dict_path.read_text(encoding='utf-8'))
    for key, value in added.items():
        dictionary.setdefault(key, value)
    dict_path.write_text(json.dumps(dictionary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{count} Seiten mit Vorschaubildern (DE + EN) erzeugt.')


if __name__ == '__main__':
    main()
