"""Build the bilingual A4 downloads from challenges.html. Requires lxml and ReportLab."""
from pathlib import Path
import os
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
)
WIDTH, HEIGHT = A4
MARGIN = 48
CONTENT = WIDTH - 2 * MARGIN
INK = HexColor('#21332b')
MUTED = HexColor('#56665d')
RULE = HexColor('#ccd6ce')


def localized(element, lang):
    if element.get('data-' + lang) is not None:
        return element.get('data-' + lang)
    return (element.text or '') + ''.join(
        localized(child, lang) + (child.tail or '') for child in element
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
        value = ' '.join(value.split())
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
        if not isinstance(tag, str) or tag in ('img', 'h2', 'script'):
            return []
        if kind in ('notice', 'callout', 'evidence-note', 'day', 'timeline-item'):
            items = []
            if kind == 'day':
                day = element.xpath('.//*[@class="day-num"]')[0].text_content()
                label = localized(element.xpath('.//strong')[0], lang)
                items.append(para(f'{"Tag" if german else "Day"} {day}  /  {label}', 'kicker'))
                items.extend(para(localized(p, lang)) for p in element.xpath('.//p'))
            else:
                for child in element:
                    value = localized(child, lang)
                    if value.strip():
                        items.append(para(value, 'kicker' if child.tag == 'strong' else 'body'))
                if not items:
                    items.append(para(localized(element, lang)))
            return [panel(items, compact=kind in ('day', 'timeline-item'))]
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
    doc = SimpleDocTemplate(
        str(ROOT / 'assets' / 'challenges' / f'{slug}-{lang}.pdf'),
        pagesize=A4, leftMargin=MARGIN - 6, rightMargin=MARGIN - 6,
        topMargin=67, bottomMargin=57, title=title, author='Veganiel · Daniel Suckrow',
        invariant=True,
    )
    doc.build(story, onFirstPage=page, onLaterPages=page)


tree = html.parse(str(ROOT / 'challenges.html'))
for number, (key, slug, accent, tint) in enumerate(CHALLENGES, 1):
    section = tree.xpath(f'//section[@id="{key}"]')[0]
    for language in ('de', 'en'):
        build(section, number, slug, language, HexColor(accent), HexColor(tint))
