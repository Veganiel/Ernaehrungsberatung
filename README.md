# Ernaehrungsberatung

## Deutsch und Englisch

Alle HTML-Seiten im Publish-Verzeichnis `daniel-suckrow-website` laden `i18n.js`, `i18n.css` und das lokale Wörterbuch `locales/en.json`. Der EN/DE-Schalter übersetzt Inhalte, Beschriftungen, Metadaten und dynamisch erzeugte Ergebnisse. Die Auswahl wird im Browser gespeichert; direkte Links können `?lang=en` oder `?lang=de` verwenden.

Deutsche HTML-Inhalte bleiben die Quelle. Bei neuen Texten die normalisierte deutsche Zeichenfolge und ihre englische Übersetzung im Wörterbuch ergänzen. Für neue Seiten beide relativen CSS-/Script-Verweise im Kopf einfügen. Eigennamen, Produktcodes und nutzergenerierte Community-Inhalte werden nicht automatisch übersetzt. Der kostenpflichtige Guide ist als deutsche und englische PDF verfügbar. Die PDF-Sprache wird vor dem Kauf separat gewählt.

Die Übersetzung benötigt JavaScript. Ohne JavaScript bleiben die deutschen Inhalte zugänglich. Es wird kein externer Übersetzungsdienst beim Seitenbesuch aufgerufen. Google Analytics ist nicht eingebunden; Netlify-Einstellungen wurden nicht verändert.

Beim ersten Besuch bestimmt `netlify/edge-functions/language-default.js` anhand von Netlifys Ländererkennung die Voreinstellung: DE/AT/CH → Deutsch, sonst Englisch. URL-Sprachwahl und gespeicherte manuelle Wahl haben Vorrang. Die automatische Auswahl wird nicht als manuelle Präferenz gespeichert. Ist die Ländererkennung nicht erreichbar oder unbekannt, wird Englisch verwendet. Der Endpunkt ist nicht cachebar und gibt nur die Sprache zurück; es werden keine Standortdaten gespeichert. Die Edge Function wird über ihre Inline-Pfadkonfiguration bereitgestellt; das Publish-Verzeichnis bleibt unverändert.

## Vorschaubilder und zweisprachige SEO

Jede öffentliche Seite hat ein eigenes Vorschaubild für geteilte Links (1200 × 630) auf Deutsch (`og/<seite>.jpg`) und Englisch (`og/<seite>-en.jpg`). Erzeugt werden sie mit `python3 scripts/build_share_images.py` (benötigt Google Chrome und Pillow). Das Skript trägt Vorschaubild, Twitter-Karte und `hreflang`-Verweise (de, en = `?lang=en`, x-default) in den Seitenkopf ein. Nach neuen Seiten oder geänderten Titeln erneut ausführen; Titel und Beschreibung brauchen einen Eintrag in `locales/en.json`.

Deutsch ist die Quelle unter der Adresse ohne Parameter; Suchmaschinen bekommen dort immer Deutsch. Für `?lang=en` setzt `netlify/edge-functions/seo-language.js` serverseitig Sprache, Titel, Beschreibungen, Canonical, `og:locale` und das englische Vorschaubild, damit Google und Link-Vorschauen ohne JavaScript die englische Fassung sehen. Die Monatsseiten des Saisonkalenders entstehen mit `python3 scripts/build_season_months.py` und erhalten die Kopfdaten dabei automatisch. Prüfung: `tests/seo-share.test.cjs`.

## PayPal-Verkauf und Versand

`/.netlify/functions/checkout` erstellt und prüft PayPal-Bestellungen serverseitig: Guide 2 EUR (DE/EN), Beratung 50 EUR. PDF-Versand nach bestätigter Zahlung über Resend; Beratung mit Bestätigung an den Käufer und Kopie an info@veganiel.com, Terminvereinbarung anschließend per E-Mail. Der bestehende kostenlose Kennenlernkalender bleibt verfügbar.

Erforderliche geschützte Netlify-Variablen: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, RESEND_API_KEY, PDF_ENCRYPTION_KEY. Der Webhook abonniert PAYMENT.CAPTURE.COMPLETED. Die verschlüsselten PDFs liegen außerhalb des Publish-Verzeichnisses; der Schlüssel gehört niemals ins Repository. Downloads erfordern eine signierte, zeitlich begrenzte Berechtigung und eine erneut geprüfte Bestellung. Preise werden ausschließlich serverseitig festgelegt. PayPal wird im Browser erst nach aktivem Start geladen.

Prüfung: `node --test tests/*.test.cjs`. Ein echter Zahlungstest erfordert die Freigabe durch einen Käufer im PayPal-Checkout.

### PayPal-Modus und Netlify Secret-Scanning

`PAYPAL_MODE` ist eine normale, nicht geheime Umgebungsvariable: `live` für Produktion, `sandbox` für Tests. Beim Anlegen darf „Contains secret values“ hierfür nicht aktiviert werden. Netlify scannt sonst das häufige Wort `live` als vermeintliches Geheimnis und blockiert normale Inhalte. Bei einer bereits als geheim markierten Variable muss diese neu angelegt werden, da Netlify die Kennzeichnung nicht nachträglich ändern lässt.

Der Sicherheitscheck bleibt vollständig aktiv; keine SECRETS_SCAN-Ausnahmen setzen. PAYPAL_CLIENT_SECRET, RESEND_API_KEY und PDF_ENCRYPTION_KEY bleiben geheime serverseitige Variablen. Nur die öffentliche PayPal-Client-ID wird für das Browser-SDK ausgeliefert.
