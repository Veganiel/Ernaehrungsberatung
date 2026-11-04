# Daniel Suckrow – Website

## Dateien
- `index.html` – Startseite
- `blog.html` – interne Blogartikel mit Like- und Kommentar-Prototyp
- `angebot.html` – einzige Ernährungsberatung: Gesamtpaket für 50 €
- `supplement-rechner.html` – interaktiver Budgetrechner mit Beispielpreisen
- `longevity.html` – Seite für den kostenlosen Longevity-Protokoll-Download

## Lokal ansehen
Alle Dateien müssen im selben Ordner liegen. `index.html` im Browser öffnen.

## Funktionen und aktueller Stand
- Responsive Design, Naturgrün/Creme, mobile Navigation
- 12 interne Blogbeiträge; zunächst sechs sichtbar, weitere sechs per Button
- Likes und Kommentare auf Artikelseiten: derzeit nur lokal im jeweiligen Browser gespeichert. Noch keine gemeinsame Datenbank, keine Nutzerkonten und keine Moderation.
- Beratungsseite mit genau einem Angebot zum Gesamtpreis von 50 €. Die ärztliche Blutuntersuchung wird vom Kunden selbst organisiert und bezahlt und ist nicht im Preis enthalten.
- Der Kaufbutton ist vorbereitet, aber noch nicht mit einem Zahlungsanbieter verbunden. Es wird derzeit keine Zahlung ausgelöst.
- Supplement-Rechner mit Budgetregler, Ernährungsweise und Schwerpunkt. Preise sind Beispielwerte und keine Live-Produktpreise.
- Longevity-Seite ist vorbereitet. Das finale PDF ist noch nicht eingebunden, da die Originalfassung zur unveränderten Übernahme benötigt wird.

## Vor Veröffentlichung / echte Nutzung
1. Originaldatei des Longevity-Protokolls als PDF bereitstellen, damit sie als kostenloser Download eingebunden werden kann.
2. Stripe-Konto/Checkout verbinden, um den 50-€-Kauf tatsächlich abzuwickeln.
3. Supabase oder ein vergleichbares Backend verbinden, damit Likes und Kommentare für alle Besucher gemeinsam gespeichert, Nutzer authentifiziert und Kommentare moderiert werden können.
4. `DEINE-EMAIL@BEISPIEL.DE` durch deine echte E-Mail-Adresse ersetzen.
5. Impressum und Datenschutzerklärung mit vollständigen Angaben ergänzen.
6. Angebot, Qualifikationen, Datenschutz, Widerruf/Verbraucherinformationen und Leistungsumfang rechtlich prüfen.

## Hinweise
Die Blogtexte sind aktuell redaktionell erstellte Zusammenfassungen, nicht die vollständigen Wix-Originaltexte. Die Community-Funktionen sind noch kein produktives öffentliches Community-System. Externe Google Fonts und Unsplash-Bilder benötigen eine Internetverbindung.
\nNeue Seite: kennenlernen.html – Calendly-Buchung für ein kostenloses 15-minütiges Kennenlerngespräch (Google Meet).\n
blog-uebersicht.html – eigenständige Blog-Übersichtsseite mit allen 12 Beiträgen. Einzelne Artikel öffnen sich weiterhin über blog.html?post=... .


SUPABASE COMMUNITY
Die Community ist mit dem Supabase-Projekt vorkonfiguriert. Vor dem Livegang community/schema.sql im Supabase SQL Editor ausführen und die Site-/Redirect-URLs unter Authentication > URL Configuration setzen. Details: COMMUNITY-EINRICHTUNG.txt.
