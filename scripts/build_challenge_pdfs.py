"""Build the printable A4 downloads (German and English) from the German challenge pages.

Requires lxml and ReportLab, plus Noto Sans and Noto Serif (Regular and Bold .ttf) in CHALLENGE_FONT_DIR.
Usage (repo root):  CHALLENGE_FONT_DIR=/path/to/fonts python3 scripts/build_challenge_pdfs.py [section-id ...]
Without section ids all challenges are rebuilt. English text comes from data-en attributes or locales/en.json.
"""
from pathlib import Path
import json
import os
import sys
from xml.sax.saxutils import escape, quoteattr

from lxml import html
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, KeepTogether, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seo_head  # noqa: E402

ROOT = Path(__file__).resolve().parents[1] / 'daniel-suckrow-website'
FONT_DIR = Path(os.environ['CHALLENGE_FONT_DIR'])
for name, file in (('Regular', 'NotoSans-Regular'), ('Bold', 'NotoSans-Bold'), ('Serif', 'NotoSerif-Regular'), ('SerifBold', 'NotoSerif-Bold')):
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / f'{file}.ttf')))

# section id, PDF name, German source page, (title band, accent, tint)
CHALLENGES = (
    ('fasten', 'intervallfasten', 'challenge-intervallfasten.html', ('#173f2f', '#8a5c1f', '#f3e5cc')),
    ('vegan', 'sieben-tage-vegan', 'challenge-7-tage-vegan.html', ('#24502f', '#44702f', '#e3eecd')),
    ('abendritual', 'abendroutine', 'challenge-abendroutine.html', ('#2c2850', '#5f5194', '#e4ddf2')),
    ('laufen', 'erste-5-km', 'challenge-5-km-laufen.html', ('#7a2f1d', '#9c4227', '#f5d9cb')),
    ('zehn-km', 'zehn-km-laufen', 'challenge-10-km-laufen.html', ('#123f4a', '#1d6374', '#cde5ea')),
    ('halbmarathon', 'halbmarathon', 'challenge-halbmarathon.html', ('#1d2552', '#36438c', '#d7dcf1')),
)
EN = json.loads((ROOT / 'locales' / 'en.json').read_text(encoding='utf-8'))
# Web-only parts: counters, tick boxes, switches, decoration.
SKIP = {'ch-num', 'ch-progress', 'day-check', 'ch-art', 'ch-breadcrumb', 'level-switch', 'ch-inline-link', 'challenge-no'}

WIDTH, HEIGHT = A4
MARGIN = 46
CONTENT = WIDTH - 2 * MARGIN
INK = HexColor('#21332b')
MUTED = HexColor('#5a675f')
RULE = HexColor('#d5ddd6')
WARN_BG, WARN_LINE, WARN_INK = HexColor('#fff5df'), HexColor('#e2b75c'), HexColor('#4f3a10')
INFO_BG, INFO_LINE, INFO_INK = HexColor('#eef5e6'), HexColor('#8fb070'), HexColor('#24412b')


def classes(element):
    return set((element.get('class') or '').split())


def translated(text, lang):
    key = ' '.join(text.split())
    if lang != 'en' or key not in EN:
        return text
    return text[:len(text) - len(text.lstrip())] + EN[key] + text[len(text.rstrip()):]


def localized(element, lang):
    if element.get('data-' + lang) is not None:
        return element.get('data-' + lang)
    if lang == 'en' and ' '.join(element.text_content().split()) in EN:
        return EN[' '.join(element.text_content().split())]
    return translated(element.text or '', lang) + ''.join(
        localized(child, lang) + translated(child.tail or '', lang) for child in element if isinstance(child.tag, str)
    )


def lighten(color, amount):
    return HexColor('#%02x%02x%02x' % tuple(int(c * 255 + (255 - c * 255) * amount) for c in (color.red, color.green, color.blue)))


def build(section, number, slug, page, lang, colours):
    german = lang == 'de'
    band, accent, tint = (HexColor(c) for c in colours)
    soft = lighten(tint, .55)
    url = f'veganiel.com/{page if german else seo_head.STATIC_EN[page]}'

    def style(name, font, size, leading, color=INK, **kw):
        return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading, textColor=color, **kw)

    S = {
        'body': style('body', 'Regular', 9.6, 14.6, spaceAfter=5),
        'small': style('small', 'Regular', 8.6, 12.8, MUTED, spaceAfter=3),
        'kicker': style('kicker', 'Bold', 8.2, 12, accent, spaceAfter=3),
        'major': style('major', 'Serif', 17, 22, accent, spaceBefore=12, spaceAfter=7, keepWithNext=True),
        'minor': style('minor', 'Bold', 10.4, 14.5, INK, spaceBefore=5, spaceAfter=2, keepWithNext=True),
        'card': style('card', 'SerifBold', 11, 15, INK, spaceAfter=3),
        'plan': style('plan', 'Bold', 9.6, 13.5, INK, spaceAfter=2),
        'summary': style('summary', 'Serif', 15, 20, accent, spaceAfter=4),
        'band_brand': style('band_brand', 'Bold', 10, 12, white),
        'band_meta': style('band_meta', 'Regular', 8, 10, tint),
        'band_eyebrow': style('band_eyebrow', 'Bold', 8.6, 12, tint),
        'band_title': style('band_title', 'Serif', 27, 32, white),
        'band_intro': style('band_intro', 'Regular', 10, 15, lighten(band, .82)),
    }

    def para(value, name='body'):
        value = ' '.join(value.replace('→', '').replace('↓', '').split())
        return Paragraph(escape(value), S[name])

    def text_of(element):
        return localized(element, lang).strip()

    def box(items, background, line=None, padding=10):
        table = Table([[items]], colWidths=[CONTENT])
        commands = [('BACKGROUND', (0, 0), (-1, -1), background), ('LEFTPADDING', (0, 0), (-1, -1), 13),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 13), ('TOPPADDING', (0, 0), (-1, -1), padding),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), padding - 3)]
        if line is not None:
            commands.append(('LINEBEFORE', (0, 0), (0, -1), 3, line))
        table.setStyle(TableStyle(commands))
        return KeepTogether([table, Spacer(1, 10)])

    def checkbox():
        cell = Table([['']], colWidths=[12], rowHeights=[12])
        cell.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), 1, accent)]))
        return cell

    def absolute(href):
        return href if href.startswith(('http://', 'https://', 'mailto:')) else 'https://veganiel.com/' + href.lstrip('/')

    def plan_table(container):
        days = 'vegan-days' in classes(container)
        head = [('Tag' if german else 'Day') if days else ('Woche' if german else 'Week'),
                'Aufgabe' if days and german else 'Task' if days else 'Training', 'Erledigt' if german else 'Done']
        rows = [[para(h, 'kicker') for h in head]]
        goals = []
        for item in container:
            if not isinstance(item.tag, str):
                continue
            kind = classes(item)
            if 'week' in kind:
                left = [para(text_of(item.xpath('.//*[@class="week-label"]')[0]), 'kicker'),
                        para(text_of(item.xpath('.//*[@class="week-total"]')[0]), 'small')]
                main = [para(text_of(item.xpath('./strong')[0]), 'plan')] + [para(text_of(p), 'small') for p in item.xpath('./p')]
            else:
                number_ = item.xpath('.//*[@class="day-num"]')[0].text_content().strip()
                left = [para(f'{"Tag" if german else "Day"} {number_}', 'kicker')]
                main = [para(text_of(item.xpath('.//strong')[0]), 'plan')] + [para(text_of(p), 'small') for p in item.xpath('.//p')]
            rows.append([left, main, checkbox()])
            if 'week--goal' in kind:
                goals.append(len(rows) - 1)
        table = Table(rows, colWidths=[112, CONTENT - 112 - 48, 48], repeatRows=1)
        commands = [('VALIGN', (0, 0), (-1, -1), 'TOP'), ('ALIGN', (2, 0), (2, -1), 'CENTER'),
                    ('LINEBELOW', (0, 0), (-1, -1), .6, RULE), ('LINEBELOW', (0, 0), (-1, 0), 1.2, accent),
                    ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6)]
        for index in goals:
            commands.append(('BACKGROUND', (0, index), (-1, index), soft))
        table.setStyle(TableStyle(commands))
        return [table, Spacer(1, 12)]

    def timeline_table(container):
        rows = []
        for item in container:
            if isinstance(item.tag, str) and 'timeline-item' in classes(item):
                rows.append([para(text_of(item.xpath('./strong')[0]), 'kicker'), para(text_of(item.xpath('./span')[0]), 'body')])
        table = Table(rows, colWidths=[150, CONTENT - 150])
        table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, -1), .6, RULE),
                                   ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                                   ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 6)]))
        return [table, Spacer(1, 12)]

    def card_content(card):
        items = []
        for child in card:
            if not isinstance(child.tag, str) or classes(child) & SKIP:
                continue
            kind, value = classes(child), text_of(child)
            if not value:
                continue
            if kind & {'symbol', 'benefit-index'}:
                items.append(para(value, 'kicker'))
            elif child.tag == 'h4':
                items.append(para(value, 'card'))
            elif 'ex-dose' in kind:
                items.append(para(value, 'kicker'))
            else:
                items.append(para(value, 'small' if child.tag == 'span' else 'body'))
        return items

    def card_grid(container):
        cards = [card_content(c) for c in container if isinstance(c.tag, str)]
        width = (CONTENT - 12) / 2
        out = []
        for i in range(0, len(cards), 2):
            pair = cards[i:i + 2]
            row = [pair[0], '', pair[1] if len(pair) > 1 else '']
            table = Table([row], colWidths=[width, 12, width])
            commands = [('VALIGN', (0, 0), (-1, -1), 'TOP'), ('BACKGROUND', (0, 0), (0, 0), soft),
                        ('TOPPADDING', (0, 0), (-1, -1), 10), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                        ('LEFTPADDING', (0, 0), (-1, -1), 11), ('RIGHTPADDING', (0, 0), (-1, -1), 11)]
            if len(pair) > 1:
                commands.append(('BACKGROUND', (2, 0), (2, 0), soft))
            table.setStyle(TableStyle(commands))
            out += [table, Spacer(1, 10)]
        return out

    def notice(element):
        info = 'notice--info' in classes(element)
        items = [para(text_of(child), 'plan' if child.tag == 'strong' else 'body')
                 for child in element if isinstance(child.tag, str) and text_of(child)]
        for item in items:
            item.style = ParagraphStyle('n', parent=item.style, textColor=INFO_INK if info else WARN_INK)
        return [box(items, INFO_BG if info else WARN_BG, INFO_LINE if info else WARN_LINE)]

    def panel(element):
        items = []
        for child in element:
            if not isinstance(child.tag, str) or classes(child) & SKIP:
                continue
            if child.get('class') == 'evidence-links':
                refs = [f'<link href={quoteattr(absolute(a.get("href")))}>{escape(" ".join(text_of(a).split()))}</link>' for a in child.xpath('./a[@href]')]
                items.append(Paragraph('  ·  '.join(refs), S['small']))
            elif text_of(child):
                items.append(para(text_of(child), 'plan' if child.tag == 'strong' else 'body'))
        return [box(items, soft, accent)]

    has_levels = bool(section.xpath('.//*[contains(@class, "level-panel")]'))
    panels_seen = []

    def blocks(element):
        tag = element.tag
        if not isinstance(tag, str) or tag in ('img', 'script', 'svg', 'button', 'label', 'input'):
            return []
        kind = classes(element)
        if kind & SKIP or 'section-head' in kind:
            return []
        if 'challenge-side' in kind:
            h3 = element.xpath('.//h3')[0]
            texts = [para(text_of(h3), 'summary')] + [para(text_of(p), 'body') for p in element.xpath('.//p')]
            texts += [para(text_of(pill), 'kicker') for pill in element.xpath('.//*[contains(@class, "pill")]')]
            return [box(texts, soft, accent, 12)]
        if 'facts' in kind:
            facts = '   ·   '.join(text_of(f) for f in element if isinstance(f.tag, str))
            return [para(facts, 'kicker'), Spacer(1, 4)]
        if 'timeline' in kind:
            return timeline_table(element)
        if kind & {'run-weeks', 'vegan-days'}:
            return plan_table(element)
        if kind & {'benefits-grid', 'tips', 'supplement-grid'}:
            return card_grid(element)
        if 'notice' in kind:
            return notice(element)
        if kind & {'callout', 'evidence-note'}:
            return panel(element)
        if 'level-panel' in kind:
            # The first plan follows its introduction; every further level starts on a new page.
            start = PageBreak() if panels_seen else CondPageBreak(430)
            panels_seen.append(element)
            return [start] + [item for child in element for item in blocks(child)]
        if 'recipe-card' in kind:
            return [KeepTogether([item for child in element for item in blocks(child)] + [Spacer(1, 8)])]
        if 'recipe-section' in kind:
            return [PageBreak()] + [item for child in element for item in blocks(child)]
        if 'recipe-heading' in kind:
            value = ('Dein Trainingsplan' if german else 'Your training plan') if has_levels else text_of(element)
            return [CondPageBreak(120), para(value, 'major')]
        if tag == 'h3':
            return [CondPageBreak(180), para(text_of(element), 'major')]
        if tag == 'h4':
            in_panel = element.getparent() is not None and 'level-panel' in classes(element.getparent())
            return [para(text_of(element), 'major' if in_panel else 'minor')]
        if tag in ('h5', 'summary'):
            return [para(text_of(element), 'kicker')]
        if tag in ('p', 'strong', 'span'):
            value = text_of(element)
            if not value:
                return []
            return [para(value, {'p': 'body', 'strong': 'minor', 'span': 'small'}[tag])]
        if tag == 'li':
            value = text_of(element)
            links = element.xpath('./a[@href]')
            if len(links) == 1:
                return [Paragraph('•  <link href=' + quoteattr(absolute(links[0].get('href'))) + '>' + escape(value) + '</link>', S['small'])]
            return [para('•  ' + value, 'small')]
        return [item for child in element for item in blocks(child)]

    # Title band on the first page.
    head = section.xpath('.//*[contains(concat(" ", @class, " "), " section-head ")]')[0]
    band_parts = [
        Paragraph(escape(text_of(head.xpath('./*[contains(@class, "eyebrow")]')[0]).upper()), S['band_eyebrow']),
        Paragraph(escape(text_of(head.xpath('./h1 | ./h2')[0])), S['band_title']),
        Paragraph(escape(text_of(head.xpath('./p')[0])), S['band_intro']),
    ]
    gaps = [10, 12, 0]
    heights = [p.wrap(CONTENT, HEIGHT)[1] for p in band_parts]
    band_height = 78 + sum(heights) + sum(gaps) + 34
    title = text_of(head.xpath('./h1 | ./h2')[0])
    series = 'DRUCKVERSION' if german else 'PRINT EDITION'

    def footer(canvas, doc):
        canvas.setStrokeColor(RULE)
        canvas.line(MARGIN, 42, WIDTH - MARGIN, 42)
        canvas.setFont('Regular', 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN, 28, url)
        canvas.linkURL('https://' + url, (MARGIN, 24, MARGIN + 220, 38))
        canvas.drawRightString(WIDTH - MARGIN, 28, f'{"Seite" if german else "Page"} {doc.page}')

    def first_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(band)
        canvas.rect(0, HEIGHT - band_height, WIDTH, band_height, fill=1, stroke=0)
        canvas.setFillColor(accent)
        canvas.rect(0, HEIGHT - band_height, WIDTH, 5, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont('Bold', 10.5)
        canvas.drawString(MARGIN, HEIGHT - 44, 'VEGANIEL')
        canvas.setFillColor(tint)
        canvas.setFont('Regular', 8)
        canvas.drawRightString(WIDTH - MARGIN, HEIGHT - 44, f'CHALLENGE {number:02d}  ·  {series}')
        y = HEIGHT - 78
        for part, height_, gap in zip(band_parts, heights, gaps):
            part.drawOn(canvas, MARGIN, y - height_)
            y -= height_ + gap
        footer(canvas, doc)
        canvas.restoreState()

    def later_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(accent)
        canvas.rect(MARGIN, HEIGHT - 40, 22, 4, fill=1, stroke=0)
        canvas.setFillColor(INK)
        canvas.setFont('Bold', 9.5)
        canvas.drawString(MARGIN + 30, HEIGHT - 41, 'VEGANIEL')
        canvas.setFillColor(MUTED)
        canvas.setFont('Regular', 8)
        short = title if len(title) <= 70 else title[:67].rstrip() + '…'
        canvas.drawRightString(WIDTH - MARGIN, HEIGHT - 41, f'{number:02d}  ·  {short}')
        footer(canvas, doc)
        canvas.restoreState()

    target = ROOT / 'assets' / 'challenges' / f'{slug}-{lang}.pdf'
    doc = BaseDocTemplate(str(target), pagesize=A4, title=title, author='Veganiel · Daniel Suckrow', invariant=True,
                          leftMargin=MARGIN, rightMargin=MARGIN, topMargin=60, bottomMargin=56)
    first_frame = Frame(MARGIN - 6, 56, CONTENT + 12, HEIGHT - band_height - 22 - 56, id='first')
    later_frame = Frame(MARGIN - 6, 56, CONTENT + 12, HEIGHT - 60 - 56, id='later')
    doc.addPageTemplates([PageTemplate('first', [first_frame], onPage=first_page, autoNextPageTemplate='later'),
                          PageTemplate('later', [later_frame], onPage=later_page)])

    story = [item for child in section.xpath('./div[contains(@class, "wrap")]')[0] for item in blocks(child)]
    notes = Table([['']] * 7, colWidths=[CONTENT], rowHeights=[26] * 7)
    notes.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), .6, RULE)]))
    story += [CondPageBreak(260), para('Meine Notizen' if german else 'My notes', 'major'), notes]
    doc.build(story)


only = set(sys.argv[1:])  # optional section ids, e.g. "laufen"; default: rebuild all
for number, (key, slug, page, colours) in enumerate(CHALLENGES, 1):
    if only and key not in only:
        continue
    section = html.parse(str(ROOT / page)).xpath(f'//section[@id="{key}"]')[0]
    for language in ('de', 'en'):
        build(section, number, slug, page, language, colours)
    print(f'✓ {slug} (de, en)')
