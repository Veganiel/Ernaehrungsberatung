"""Build the bilingual A4 downloads from challenges.html. Requires lxml and ReportLab."""
from pathlib import Path
import json
import os
import sys
from xml.sax.saxutils import escape, quoteattr

from lxml import html
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1] / 'daniel-suckrow-website'
FONT_DIR = Path(os.environ['CHALLENGE_FONT_DIR'])
for weight in ('Regular', 'Bold'):
    pdfmetrics.registerFont(TTFont(weight, str(FONT_DIR / f'NotoSans-{weight}.ttf')))

CHALLENGES = (
    ('fasten', 'intervallfasten', '#35604d', '#edf4ee'),
    ('vegan', 'sieben-tage-vegan', '#86512d', '#faf1e6'),
    ('abendritual', 'abendroutine', '#514773', '#f1eef7'),
    ('laufen', 'erste-5-km', '#9c4227', '#fbf0ea'),
)
# Newer sections carry no data-en attributes; their English comes from the site dictionary.
EN = json.loads((ROOT / 'locales' / 'en.json').read_text(encoding='utf-8'))
SKIP = {'ch-num', 'ch-progress', 'day-check', 'ch-art'}
WIDTH, HEIGHT = A4
MARGIN = 48
CONTENT = WIDTH - 2 * MARGIN
INK = HexColor('#21332b')
MUTED = HexColor('#56665d')
RULE = HexColor('#ccd6ce')


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
        localized(child, lang) + translated(child.tail or '', lang) for child in element
    )


def build(section, number, slug, lang, accent, tint):
    german = lang == 'de'
    title = localized(section.xpath('.//h2')[0], lang).strip()
    series = 'CHALLENGE / DRUCKVERSION' if german else 'CHALLENGE / PRINT EDITION'
    styles = {
        'title': ParagraphStyle('title', fontName='Bold', fontSize=30, leading=37,
                                textColor=INK, spaceAfter=11, keepWithNext=True),
        'kicker': ParagraphStyle('kicker', fontName='Bold', fontSize=9, leading=14,
                                 textColor=accent, spaceAfter=7, keepWithNext=True),
        'major': ParagraphStyle('major', fontName='Bold', fontSize=16, leading=22,
                                 textColor=accent, spaceBefore=14, spaceAfter=6, keepWithNext=True),
        'minor': ParagraphStyle('minor', fontName='Bold', fontSize=11, leading=16,
                                 textColor=accent, spaceBefore=8, spaceAfter=3, keepWithNext=True),
        'body': ParagraphStyle('body', fontName='Regular', fontSize=10, leading=15,
                                textColor=INK, spaceAfter=6),
        'small': ParagraphStyle('small', fontName='Regular', fontSize=8.5, leading=13,
                                 textColor=MUTED, spaceAfter=3),
    }

    def para(value, style='body'):
        value = ' '.join(value.replace('→', '').replace('↓', '').split())
        return Paragraph(escape(value), styles[style])

    def panel(items, compact=False):
        box = Table([[items]], colWidths=[CONTENT - 12])
        box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), tint),
            ('LINEBEFORE', (0, 0), (0, -1), 2, accent),
            ('LEFTPADDING', (0, 0), (-1, -1), 13),
            ('RIGHTPADDING', (0, 0), (-1, -1), 13),
            ('TOPPADDING', (0, 0), (-1, -1), 4 if compact else 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2 if compact else 6),
        ]))
        return KeepTogether([box, Spacer(1, 5 if compact else 9)])

    def blocks(element):
        kind = element.get('class', '')
        tag = element.tag
        if not isinstance(tag, str) or tag in ('img', 'h2', 'script') or SKIP & set(kind.split()):
            return []
        if 'week' in kind.split():
            label = localized(element.xpath('.//*[@class="week-label"]')[0], lang)
            total = localized(element.xpath('.//*[@class="week-total"]')[0], lang)
            items = [para(f'{label}  /  {total}', 'kicker'),
                     para(localized(element.xpath('./strong')[0], lang), 'minor')]
            items.extend(para(localized(p, lang)) for p in element.xpath('./p'))
            return [panel(items, compact=True)]
        if kind == 'tip':
            return [KeepTogether([item for child in element for item in blocks(child)])]
        if 'run-strength' in kind.split():
            return [PageBreak()] + [item for child in element for item in blocks(child)]
        if kind.split()[:1] and kind.split()[0] in ('notice', 'callout', 'evidence-note', 'day', 'timeline-item'):
            items = []
            if kind == 'day':
                day = element.xpath('.//*[@class="day-num"]')[0].text_content()
                label = localized(element.xpath('.//strong')[0], lang)
                items.append(para(f'{"Tag" if german else "Day"} {day}  /  {label}', 'kicker'))
                items.extend(para(localized(p, lang)) for p in element.xpath('.//p'))
            else:
                for child in element:
                    if child.get('class') == 'evidence-links':
                        refs = [f'<link href={quoteattr(a.get("href"))}>{escape(" ".join(localized(a, lang).split()))}</link>'
                                for a in child.xpath('./a[@href]')]
                        items.append(Paragraph('  ·  '.join(refs), styles['small']))
                        continue
                    value = localized(child, lang)
                    if value.strip():
                        items.append(para(value, 'kicker' if child.tag == 'strong' else 'body'))
                if not items:
                    items.append(para(localized(element, lang)))
            return [panel(items, compact=kind.split()[0] in ('day', 'timeline-item'))]
        if kind == 'facts':
            return [panel([para(localized(child, lang), 'small') for child in element], compact=True)]
        if kind == 'recipe-card':
            items = [item for child in element for item in blocks(child)]
            return [KeepTogether(items + [Spacer(1, 8)])]
        if kind == 'supplement-note' and slug == 'abendroutine':
            return [PageBreak()] + [item for child in element for item in blocks(child)]
        if kind == 'tips' and slug == 'sieben-tage-vegan':
            heading = 'Was du mitnehmen kannst' if german else 'What to take forward'
            return [PageBreak(), para(heading, 'major')] + [
                item for child in element for item in blocks(child)
            ]
        if kind == 'recipe-heading':
            return [PageBreak(), para(localized(element, lang), 'major')]
        if tag in ('h3', 'h4', 'h5', 'p', 'strong', 'span', 'li'):
            value = localized(element, lang)
            if not value.strip():
                return []
            style = {'h3': 'major', 'h4': 'minor', 'h5': 'minor',
                     'strong': 'minor', 'span': 'small', 'li': 'small'}.get(tag, 'body')
            if tag == 'li':
                links = element.xpath('./a[@href]')
                if len(links) == 1:
                    href = quoteattr(links[0].get('href'))
                    return [Paragraph('• <link href=' + href + '>' + escape(value) + '</link>', styles['small'])]
                value = '• ' + value
            return [para(value, style)]
        return [item for child in element for item in blocks(child)]

    def page(canvas, doc):
        canvas.setFillColor(accent)
        canvas.rect(MARGIN, HEIGHT - 44, 24, 4, fill=1, stroke=0)
        canvas.setFont('Bold', 10)
        canvas.drawString(MARGIN + 33, HEIGHT - 44, 'VEGANIEL')
        canvas.setFont('Regular', 8)
        canvas.drawRightString(WIDTH - MARGIN, HEIGHT - 44, f'{number:02d}  /  {series}')
        canvas.setStrokeColor(RULE)
        canvas.line(MARGIN, 43, WIDTH - MARGIN, 43)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN, 29, 'veganiel.com/challenges.html')
        canvas.linkURL('https://veganiel.com/challenges.html', (MARGIN, 25, MARGIN + 140, 39))
        canvas.drawRightString(WIDTH - MARGIN, 29, f'{"Seite" if german else "Page"} {doc.page:02d}')

    story = [para(f'CHALLENGE {number:02d}', 'kicker'), para(title, 'title')]
    story.extend(blocks(section))
    if slug == 'sieben-tage-vegan':
        story.append(para('Meine Notizen' if german else 'My notes', 'major'))
        lines = Table([['']] * 5, colWidths=[CONTENT - 12], rowHeights=[24] * 5)
        lines.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.5, RULE)]))
        story.append(lines)
    if slug == 'erste-5-km':
        tracker_intro = [para('Mein Lauf-Tracker' if german else 'My running tracker', 'major'),
                         para('Hake jede Einheit ab und notiere, wie es sich angefühlt hat.' if german
                              else 'Tick off every session and note how it felt.', 'small')]
        head = (['Woche', 'Einheit 1', 'Einheit 2', 'Einheit 3', 'Notizen'] if german
                else ['Week', 'Session 1', 'Session 2', 'Session 3', 'Notes'])
        rows = [head] + [[str(week), '', '', '', ''] for week in range(1, 9)]
        tracker = Table(rows, colWidths=[44, 64, 64, 64, CONTENT - 12 - 236], rowHeights=[22] + [38] * 8)
        tracker.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, 0), 'Bold', 9), ('FONT', (0, 1), (-1, -1), 'Bold', 11),
            ('TEXTCOLOR', (0, 0), (-1, 0), accent), ('TEXTCOLOR', (0, 1), (-1, -1), INK),
            ('BACKGROUND', (0, 0), (-1, 0), tint), ('ALIGN', (0, 0), (-2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('GRID', (0, 0), (-1, -1), 0.5, RULE),
        ]))
        story.append(KeepTogether(tracker_intro + [Spacer(1, 6), tracker]))
    doc = SimpleDocTemplate(
        str(ROOT / 'assets' / 'challenges' / f'{slug}-{lang}.pdf'),
        pagesize=A4, leftMargin=MARGIN - 6, rightMargin=MARGIN - 6,
        topMargin=67, bottomMargin=57, title=title, author='Veganiel · Daniel Suckrow',
        invariant=True,
    )
    doc.build(story, onFirstPage=page, onLaterPages=page)


tree = html.parse(str(ROOT / 'challenges.html'))
only = set(sys.argv[1:])  # optional section ids, e.g. "laufen"; default: rebuild all
for number, (key, slug, accent, tint) in enumerate(CHALLENGES, 1):
    if only and key not in only:
        continue
    section = tree.xpath(f'//section[@id="{key}"]')[0]
    for language in ('de', 'en'):
        build(section, number, slug, language, HexColor(accent), HexColor(tint))
