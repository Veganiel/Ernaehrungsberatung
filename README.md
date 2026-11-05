# Ernaehrungsberatung

## Deutsch und Englisch

Alle HTML-Seiten im Publish-Verzeichnis `daniel-suckrow-website` laden `i18n.js`, `i18n.css` und das lokale Wörterbuch `locales/en.json`. Der EN/DE-Schalter übersetzt Inhalte, Beschriftungen, Metadaten und dynamisch erzeugte Ergebnisse. Die Auswahl wird im Browser gespeichert; direkte Links können `?lang=en` oder `?lang=de` verwenden.

Deutsche HTML-Inhalte bleiben die Quelle. Bei neuen Texten die normalisierte deutsche Zeichenfolge und ihre englische Übersetzung im Wörterbuch ergänzen. Für neue Seiten beide relativen CSS-/Script-Verweise im Kopf einfügen. Eigennamen, Produktcodes und nutzergenerierte Community-Inhalte werden nicht automatisch übersetzt. Die deutsche PDF bleibt unverändert und wird in der englischen Ansicht entsprechend gekennzeichnet.

Die Übersetzung benötigt JavaScript. Ohne JavaScript bleiben die deutschen Inhalte zugänglich. Es wird kein externer Übersetzungsdienst beim Seitenbesuch aufgerufen. Google Analytics ist nicht eingebunden; Netlify-Einstellungen wurden nicht verändert.
