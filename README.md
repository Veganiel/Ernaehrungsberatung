# Ernaehrungsberatung

## Deutsch und Englisch

Alle HTML-Seiten im Publish-Verzeichnis `daniel-suckrow-website` laden `i18n.js`, `i18n.css` und das lokale Wörterbuch `locales/en.json`. Der EN/DE-Schalter übersetzt Inhalte, Beschriftungen, Metadaten und dynamisch erzeugte Ergebnisse. Die Auswahl wird im Browser gespeichert; direkte Links können `?lang=en` oder `?lang=de` verwenden.

Deutsche HTML-Inhalte bleiben die Quelle. Bei neuen Texten die normalisierte deutsche Zeichenfolge und ihre englische Übersetzung im Wörterbuch ergänzen. Für neue Seiten beide relativen CSS-/Script-Verweise im Kopf einfügen. Eigennamen, Produktcodes und nutzergenerierte Community-Inhalte werden nicht automatisch übersetzt. Der kostenpflichtige Guide ist als deutsche und englische PDF verfügbar. Die PDF-Sprache wird vor dem Kauf separat gewählt.

Die Übersetzung benötigt JavaScript. Ohne JavaScript bleiben die deutschen Inhalte zugänglich. Es wird kein externer Übersetzungsdienst beim Seitenbesuch aufgerufen. Google Analytics ist nicht eingebunden; Netlify-Einstellungen wurden nicht verändert.

Beim ersten Besuch bestimmt `netlify/edge-functions/language-default.js` anhand von Netlifys Ländererkennung die Voreinstellung: DE/AT/CH → Deutsch, sonst Englisch. URL-Sprachwahl und gespeicherte manuelle Wahl haben Vorrang. Die automatische Auswahl wird nicht als manuelle Präferenz gespeichert. Ist die Ländererkennung nicht erreichbar oder unbekannt, wird Englisch verwendet. Der Endpunkt ist nicht cachebar und gibt nur die Sprache zurück; es werden keine Standortdaten gespeichert. Die Edge Function wird über ihre Inline-Pfadkonfiguration bereitgestellt; das Publish-Verzeichnis bleibt unverändert.

## PayPal-Verkauf und Versand

`/.netlify/functions/checkout` erstellt und prüft PayPal-Bestellungen serverseitig: Guide 2 EUR (DE/EN), Beratung 50 EUR. PDF-Versand nach bestätigter Zahlung über Resend; Beratung mit Bestätigung an den Käufer und Kopie an info@veganiel.com, Terminvereinbarung anschließend per E-Mail. Der bestehende kostenlose Kennenlernkalender bleibt verfügbar.

Erforderliche geschützte Netlify-Variablen: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_MODE=live, RESEND_API_KEY, PDF_ENCRYPTION_KEY. Der Webhook abonniert PAYMENT.CAPTURE.COMPLETED. Die verschlüsselten PDFs liegen außerhalb des Publish-Verzeichnisses; der Schlüssel gehört niemals ins Repository. Downloads erfordern eine signierte, zeitlich begrenzte Berechtigung und eine erneut geprüfte Bestellung. Preise werden ausschließlich serverseitig festgelegt. PayPal wird im Browser erst nach aktivem Start geladen.

Prüfung: `node --test tests/*.test.cjs`. Ein echter Zahlungstest erfordert die Freigabe durch einen Käufer im PayPal-Checkout.
