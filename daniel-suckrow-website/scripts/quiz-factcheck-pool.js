/* Additional "Fakt oder Fake" statements (DE/EN), each with a short explanation and a source.
   Every statement was checked against the wording of its source page when it was written.
   Mixed 50/50 with statements derived from the regular quiz banks (see quiz-factcheck.js). */
(function (root) {
  'use strict';
  const POOL = {
 "Leicht": [
  {
   "id": "ff-l01",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Vitamin-C-reiche Lebensmittel zur Mahlzeit können helfen, Eisen aus Pflanzen besser aufzunehmen.",
    "en": "Vitamin C-rich foods with a meal can help you absorb iron from plants better."
   },
   "info": {
    "de": "Vitamin C unterstützt die Aufnahme von Nicht-Häm-Eisen aus pflanzlichen Lebensmitteln.",
    "en": "Vitamin C supports the absorption of non-heme iron from plant foods."
   },
   "source": "https://medlineplus.gov/ency/article/002422.htm"
  },
  {
   "id": "ff-l02",
   "truth": false,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Obst und Gemüse liefern zuverlässig genug Vitamin B12.",
    "en": "Fruit and vegetables reliably provide enough vitamin B12."
   },
   "info": {
    "de": "Vitamin B12 steckt natürlicherweise vor allem in tierischen Lebensmitteln. Bei veganer Ernährung braucht es angereicherte Lebensmittel oder ein Supplement.",
    "en": "Vitamin B12 occurs naturally mainly in animal foods. A vegan diet needs fortified foods or a supplement."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/vitamin-b12/"
  },
  {
   "id": "ff-l03",
   "truth": true,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Linsen, Bohnen und Kichererbsen sind gute Proteinquellen.",
    "en": "Lentils, beans and chickpeas are good sources of protein."
   },
   "info": {
    "de": "Hülsenfrüchte liefern reichlich pflanzliches Protein und dazu Ballaststoffe.",
    "en": "Legumes provide plenty of plant protein plus fibre."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/legumes-pulses/"
  },
  {
   "id": "ff-l04",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Die WHO empfiehlt Erwachsenen weniger als 5 Gramm Salz pro Tag.",
    "en": "The WHO recommends adults eat less than 5 grams of salt per day."
   },
   "info": {
    "de": "Weniger als 5 g Salz am Tag – etwa ein Teelöffel – senkt das Risiko für Bluthochdruck.",
    "en": "Less than 5 g of salt a day – about a teaspoon – lowers the risk of high blood pressure."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
  },
  {
   "id": "ff-l05",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Freier Zucker sollte laut WHO weniger als 10 % der täglichen Energie ausmachen.",
    "en": "According to the WHO, free sugars should make up less than 10% of daily energy intake."
   },
   "info": {
    "de": "Die WHO empfiehlt unter 10 %, für zusätzliche Vorteile sogar unter 5 % der Energiezufuhr.",
    "en": "The WHO recommends less than 10%, and below 5% for additional benefits."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
  },
  {
   "id": "ff-l06",
   "truth": false,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Ballaststoffe stecken vor allem in tierischen Lebensmitteln.",
    "en": "Fibre is found mainly in animal foods."
   },
   "info": {
    "de": "Ballaststoffe kommen aus Pflanzen: Vollkorn, Hülsenfrüchte, Gemüse, Obst, Nüsse und Samen.",
    "en": "Fibre comes from plants: whole grains, legumes, vegetables, fruit, nuts and seeds."
   },
   "source": "https://medlineplus.gov/ency/article/002470.htm"
  },
  {
   "id": "ff-l07",
   "truth": true,
   "topic": {
    "de": "Bewegung",
    "en": "Exercise"
   },
   "s": {
    "de": "Die WHO empfiehlt Erwachsenen pro Woche mindestens 150 Minuten moderate Bewegung.",
    "en": "The WHO recommends at least 150 minutes of moderate activity per week for adults."
   },
   "info": {
    "de": "Die globale Empfehlung lautet: mindestens 150 Minuten moderate Bewegung pro Woche – ein Drittel der Erwachsenen erreicht das nicht.",
    "en": "The global recommendation is at least 150 minutes of moderate activity per week – a third of adults don’t reach it."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
  },
  {
   "id": "ff-l08",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Der Körper kann Vitamin D mithilfe von Sonnenlicht auf der Haut selbst bilden.",
    "en": "The body can make vitamin D itself when sunlight hits the skin."
   },
   "info": {
    "de": "UV-B-Strahlung startet die Vitamin-D-Bildung in der Haut.",
    "en": "UVB light starts vitamin D production in the skin."
   },
   "source": "https://medlineplus.gov/ency/article/002405.htm"
  },
  {
   "id": "ff-l09",
   "truth": false,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Nüsse sollte man wegen ihres Fettgehalts grundsätzlich meiden.",
    "en": "Nuts should generally be avoided because of their fat content."
   },
   "info": {
    "de": "Nüsse liefern überwiegend ungesättigte Fette; regelmäßiger Verzehr wird mit besserer Herzgesundheit in Verbindung gebracht.",
    "en": "Nuts provide mostly unsaturated fats; eating them regularly is linked to better heart health."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/nuts-for-the-heart/"
  },
  {
   "id": "ff-l10",
   "truth": true,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Vollkornprodukte enthalten mehr Ballaststoffe als Weißmehlprodukte.",
    "en": "Whole-grain products contain more fibre than white-flour products."
   },
   "info": {
    "de": "Beim Vollkorn bleiben Kleie und Keim erhalten – und damit Ballaststoffe, Vitamine und Mineralstoffe.",
    "en": "Whole grains keep the bran and germ – and with them fibre, vitamins and minerals."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/whole-grains/"
  },
  {
   "id": "ff-l11",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Die WHO nennt mindestens 400 g Obst und Gemüse pro Tag als Teil einer gesunden Ernährung.",
    "en": "The WHO lists at least 400 g of fruit and vegetables a day as part of a healthy diet."
   },
   "info": {
    "de": "400 g entsprechen etwa fünf Portionen; Kartoffeln zählen dabei nicht mit.",
    "en": "400 g is roughly five portions; potatoes don’t count towards it."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
  },
  {
   "id": "ff-l12",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Tiefkühlobst und -gemüse zählen nicht zu den „5 am Tag“.",
    "en": "Frozen fruit and vegetables don’t count towards your “5 a day”."
   },
   "info": {
    "de": "Frisch, tiefgekühlt, getrocknet oder aus der Dose – alles kann zu den fünf Portionen zählen.",
    "en": "Fresh, frozen, dried or tinned – all can count towards your five portions."
   },
   "source": "https://www.nhs.uk/live-well/eat-well/5-a-day/5-a-day-what-counts/"
  },
  {
   "id": "ff-l13",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Beliebig viel Fruchtsaft zählt als beliebig viele Portionen Obst.",
    "en": "Any amount of fruit juice counts as any number of fruit portions."
   },
   "info": {
    "de": "Saft und Smoothies zählen zusammen höchstens als eine Portion pro Tag (150 ml).",
    "en": "Juice and smoothies count as a maximum of one portion a day (150 ml) combined."
   },
   "source": "https://www.nhs.uk/live-well/eat-well/5-a-day/5-a-day-what-counts/"
  },
  {
   "id": "ff-l14",
   "truth": true,
   "topic": {
    "de": "Schlaf & Regeneration",
    "en": "Sleep & recovery"
   },
   "s": {
    "de": "Erwachsene brauchen meist 7 bis 9 Stunden Schlaf pro Nacht.",
    "en": "Adults usually need 7 to 9 hours of sleep per night."
   },
   "info": {
    "de": "Das ist die übliche Empfehlung für Erwachsene; der individuelle Bedarf kann etwas schwanken.",
    "en": "That is the usual recommendation for adults; individual needs vary a little."
   },
   "source": "https://www.nhlbi.nih.gov/health/sleep/how-much-sleep"
  },
  {
   "id": "ff-l15",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Omega-3-Fettsäuren stecken ausschließlich in Fisch.",
    "en": "Omega-3 fatty acids are found only in fish."
   },
   "info": {
    "de": "Leinsamen, Chiasamen und Walnüsse liefern ALA; Algenöl liefert vor allem DHA.",
    "en": "Flaxseed, chia seeds and walnuts provide ALA; algae oil provides mainly DHA."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/omega-3-fats/"
  },
  {
   "id": "ff-l16",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Jod ist wichtig für die Schilddrüse.",
    "en": "Iodine is important for the thyroid gland."
   },
   "info": {
    "de": "Die Schilddrüse braucht Jod, um ihre Hormone zu bilden.",
    "en": "The thyroid needs iodine to make its hormones."
   },
   "source": "https://medlineplus.gov/ency/article/002421.htm"
  },
  {
   "id": "ff-l17",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Kalzium steckt nur in Milchprodukten.",
    "en": "Calcium is only found in dairy products."
   },
   "info": {
    "de": "Auch grünes Blattgemüse wie Grünkohl, Brokkoli, Tofu und angereicherte Pflanzendrinks liefern Kalzium.",
    "en": "Leafy greens such as kale, broccoli, tofu and fortified plant drinks also provide calcium."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/calcium/"
  },
  {
   "id": "ff-l18",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Kartoffeln liefern auch Vitamin C.",
    "en": "Potatoes also provide vitamin C."
   },
   "info": {
    "de": "Kartoffeln enthalten Vitamin C und Kalium – vor allem mit Schale und schonend zubereitet.",
    "en": "Potatoes contain vitamin C and potassium – especially with the skin and gently cooked."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/potatoes/"
  },
  {
   "id": "ff-l19",
   "truth": false,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Wer sich pflanzlich ernährt, bekommt automatisch zu wenig Protein.",
    "en": "Anyone who eats plant-based automatically gets too little protein."
   },
   "info": {
    "de": "Mit Hülsenfrüchten, Soja, Nüssen, Samen und Vollkorn lässt sich der Proteinbedarf gut decken.",
    "en": "With legumes, soy, nuts, seeds and whole grains, protein needs can be met well."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/protein/"
  },
  {
   "id": "ff-l20",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Bananen enthalten Kalium.",
    "en": "Bananas contain potassium."
   },
   "info": {
    "de": "Bananen, Kartoffeln, Hülsenfrüchte und viele andere pflanzliche Lebensmittel liefern Kalium.",
    "en": "Bananas, potatoes, legumes and many other plant foods provide potassium."
   },
   "source": "https://medlineplus.gov/ency/article/002413.htm"
  },
  {
   "id": "ff-l21",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Wasser ist eine gute Wahl, um den Flüssigkeitsbedarf zu decken.",
    "en": "Water is a good choice for meeting your fluid needs."
   },
   "info": {
    "de": "Wasser hydriert ohne Zucker und Kalorien.",
    "en": "Water hydrates without sugar or calories."
   },
   "source": "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/"
  },
  {
   "id": "ff-l22",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Rauchen schadet ausschließlich der Lunge.",
    "en": "Smoking only harms the lungs."
   },
   "info": {
    "de": "Tabak schädigt viele Organe und erhöht unter anderem das Risiko für Herz-Kreislauf-Erkrankungen und viele Krebsarten.",
    "en": "Tobacco damages many organs and raises the risk of cardiovascular disease and many cancers, among others."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/tobacco"
  },
  {
   "id": "ff-l23",
   "truth": true,
   "topic": {
    "de": "Bewegung",
    "en": "Exercise"
   },
   "s": {
    "de": "Regelmäßige Bewegung kann Symptome von Depression und Angst verringern.",
    "en": "Regular physical activity can reduce symptoms of depression and anxiety."
   },
   "info": {
    "de": "Die WHO nennt neben körperlichen Vorteilen ausdrücklich die psychische Gesundheit.",
    "en": "Besides physical benefits, the WHO explicitly mentions mental health."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
  },
  {
   "id": "ff-l24",
   "truth": true,
   "topic": {
    "de": "Schlaf & Regeneration",
    "en": "Sleep & recovery"
   },
   "s": {
    "de": "Koffein kann noch Stunden nach dem Trinken den Schlaf stören.",
    "en": "Caffeine can still disturb your sleep hours after drinking it."
   },
   "info": {
    "de": "Kaffee am späten Nachmittag oder Abend kann das Einschlafen erschweren.",
    "en": "Coffee in the late afternoon or evening can make it harder to fall asleep."
   },
   "source": "https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits"
  },
  {
   "id": "ff-l25",
   "truth": false,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Vitamin C wird im Körper wie ein Fettspeicher für Monate eingelagert.",
    "en": "Vitamin C is stored in the body like fat for months."
   },
   "info": {
    "de": "Vitamin C ist wasserlöslich; Überschüsse werden ausgeschieden, deshalb braucht es eine regelmäßige Zufuhr.",
    "en": "Vitamin C is water-soluble; excess is excreted, so you need a regular supply."
   },
   "source": "https://medlineplus.gov/ency/article/002404.htm"
  },
  {
   "id": "ff-l26",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Grünes Blattgemüse, Nüsse, Samen und Vollkorn liefern Magnesium.",
    "en": "Leafy greens, nuts, seeds and whole grains provide magnesium."
   },
   "info": {
    "de": "Magnesium ist in vielen pflanzlichen Lebensmitteln reichlich enthalten.",
    "en": "Magnesium is plentiful in many plant foods."
   },
   "source": "https://medlineplus.gov/ency/article/002423.htm"
  },
  {
   "id": "ff-l27",
   "truth": false,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Hülsenfrüchte enthalten kaum Ballaststoffe.",
    "en": "Legumes contain hardly any fibre."
   },
   "info": {
    "de": "Im Gegenteil: Bohnen, Linsen und Erbsen gehören zu den ballaststoffreichsten Lebensmitteln.",
    "en": "On the contrary: beans, lentils and peas are among the most fibre-rich foods."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/legumes-pulses/"
  }
 ],
 "Mittel": [
  {
   "id": "ff-m01",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Eisen aus Pflanzen (Nicht-Häm-Eisen) wird meist schlechter aufgenommen als Häm-Eisen.",
    "en": "Iron from plants (non-heme iron) is usually absorbed less well than heme iron."
   },
   "info": {
    "de": "Deshalb lohnt es sich, pflanzliche Eisenquellen mit Vitamin C zu kombinieren.",
    "en": "That is why it pays to combine plant iron sources with vitamin C."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/iron/"
  },
  {
   "id": "ff-m02",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Schwarzer Tee direkt zur Mahlzeit kann die Aufnahme von Pflanzen-Eisen hemmen.",
    "en": "Black tea with a meal can inhibit the absorption of plant iron."
   },
   "info": {
    "de": "Wer pflanzliches Eisen besser aufnehmen will, trinkt Tee besser mit etwas Abstand und kombiniert die Mahlzeit mit Vitamin C.",
    "en": "To absorb plant iron better, drink tea a while apart from meals and combine the meal with vitamin C."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/iron/"
  },
  {
   "id": "ff-m03",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Aus der Omega-3-Fettsäure ALA bildet der Körper nur wenig EPA und DHA.",
    "en": "The body converts only a little of the omega-3 fatty acid ALA into EPA and DHA."
   },
   "info": {
    "de": "Die Umwandlungsrate ist begrenzt. Algenöl ist eine vegane Quelle, die vor allem DHA liefert.",
    "en": "The conversion rate is limited. Algae oil is a vegan source that provides mainly DHA."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/omega-3-fats/"
  },
  {
   "id": "ff-m04",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Die Vitamine A, D, E und K sind fettlöslich.",
    "en": "Vitamins A, D, E and K are fat-soluble."
   },
   "info": {
    "de": "Fettlösliche Vitamine werden mit Fett aufgenommen und im Körper gespeichert.",
    "en": "Fat-soluble vitamins are absorbed with fat and stored in the body."
   },
   "source": "https://medlineplus.gov/ency/article/002399.htm"
  },
  {
   "id": "ff-m05",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Ballaststoffe können eine regelmäßige Verdauung unterstützen.",
    "en": "Fibre can support regular digestion."
   },
   "info": {
    "de": "Sie erhöhen das Stuhlvolumen und helfen gegen Verstopfung.",
    "en": "It adds bulk to stool and helps prevent constipation."
   },
   "source": "https://medlineplus.gov/ency/article/002470.htm"
  },
  {
   "id": "ff-m06",
   "truth": true,
   "topic": {
    "de": "Langlebigkeit",
    "en": "Longevity"
   },
   "s": {
    "de": "Verarbeitetes Fleisch wird mit einem höheren Darmkrebsrisiko in Verbindung gebracht.",
    "en": "Processed meat is linked to a higher risk of colorectal cancer."
   },
   "info": {
    "de": "Die Krebsforschungsagentur der WHO (IARC) hat dazu eine klare Einstufung veröffentlicht.",
    "en": "The WHO’s cancer research agency (IARC) has published a clear classification on this."
   },
   "source": "https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat"
  },
  {
   "id": "ff-m07",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Kokosöl gilt wegen seines hohen Anteils gesättigter Fette als besonders herzgesund.",
    "en": "Coconut oil is considered especially heart-healthy because of its high saturated fat content."
   },
   "info": {
    "de": "Kokosöl besteht überwiegend aus gesättigten Fetten und kann LDL-Cholesterin erhöhen; Pflanzenöle wie Rapsöl sind die bessere Alltagswahl.",
    "en": "Coconut oil is mostly saturated fat and can raise LDL cholesterol; plant oils such as rapeseed oil are a better everyday choice."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/food-features/coconut-oil/"
  },
  {
   "id": "ff-m08",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Industrielle Transfette erhöhen das Risiko für Herz-Kreislauf-Erkrankungen.",
    "en": "Industrial trans fats increase the risk of cardiovascular disease."
   },
   "info": {
    "de": "Die WHO setzt sich deshalb weltweit für ihre Abschaffung in Lebensmitteln ein.",
    "en": "That is why the WHO is working worldwide to eliminate them from food."
   },
   "source": "https://www.who.int/news-room/fact-sheets/detail/trans-fat"
  },
  {
   "id": "ff-m09",
   "truth": true,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Soja liefert alle unentbehrlichen Aminosäuren.",
    "en": "Soy provides all the essential amino acids."
   },
   "info": {
    "de": "Soja gilt deshalb als vollständige pflanzliche Proteinquelle.",
    "en": "Soy is therefore considered a complete plant protein source."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/soy/"
  },
  {
   "id": "ff-m10",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Jodiertes Speisesalz kann helfen, die Jodversorgung zu sichern.",
    "en": "Iodised table salt can help secure your iodine supply."
   },
   "info": {
    "de": "Jodsalz ist eine einfache Jodquelle – sparsam verwendet, wegen der Salzempfehlung.",
    "en": "Iodised salt is a simple source of iodine – used sparingly, in line with salt advice."
   },
   "source": "https://medlineplus.gov/ency/article/002421.htm"
  },
  {
   "id": "ff-m11",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Feines Meersalz enthält von Natur aus kaum Natrium.",
    "en": "Fine sea salt naturally contains hardly any sodium."
   },
   "info": {
    "de": "Ein Teelöffel feines Meersalz liefert rund 2.120 mg Natrium – fast so viel wie Kochsalz mit rund 2.300 mg.",
    "en": "A teaspoon of fine sea salt provides around 2,120 mg of sodium – almost as much as table salt at around 2,300 mg."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/salt-and-sodium/"
  },
  {
   "id": "ff-m12",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Folat ist vor und in der Schwangerschaft wichtig, um Neuralrohrdefekten vorzubeugen.",
    "en": "Folate is important before and during pregnancy to help prevent neural tube defects."
   },
   "info": {
    "de": "Deshalb wird Frauen mit Kinderwunsch meist Folsäure empfohlen.",
    "en": "That is why women planning a pregnancy are usually advised to take folic acid."
   },
   "source": "https://medlineplus.gov/ency/article/002408.htm"
  },
  {
   "id": "ff-m13",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Dunkelgrünes Blattgemüse ist eine gute Folatquelle.",
    "en": "Dark leafy greens are a good source of folate."
   },
   "info": {
    "de": "Auch Hülsenfrüchte liefern viel Folat.",
    "en": "Legumes provide plenty of folate too."
   },
   "source": "https://medlineplus.gov/ency/article/002408.htm"
  },
  {
   "id": "ff-m14",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Vitamin B12 wird für die Bildung roter Blutkörperchen und für das Nervensystem gebraucht.",
    "en": "Vitamin B12 is needed to form red blood cells and for the nervous system."
   },
   "info": {
    "de": "Ein Mangel kann deshalb zu Blutarmut und Nervenproblemen führen.",
    "en": "A deficiency can therefore lead to anaemia and nerve problems."
   },
   "source": "https://medlineplus.gov/ency/article/002403.htm"
  },
  {
   "id": "ff-m15",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Paranüsse sind so selenreich, dass schon wenige Stück viel liefern.",
    "en": "Brazil nuts are so rich in selenium that just a few provide a lot."
   },
   "info": {
    "de": "Wegen des hohen Gehalts besser nur gelegentlich und in kleinen Mengen essen.",
    "en": "Because of the high content, it’s best to eat them only occasionally and in small amounts."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/selenium/"
  },
  {
   "id": "ff-m16",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Vollkorn lässt den Blutzucker meist langsamer ansteigen als stark verarbeitetes Weißmehl.",
    "en": "Whole grains usually raise blood sugar more slowly than highly processed white flour."
   },
   "info": {
    "de": "Ballaststoffe und die intakte Kornstruktur verlangsamen die Verdauung der Kohlenhydrate.",
    "en": "Fibre and the intact grain structure slow the digestion of carbohydrates."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/carbohydrates/carbohydrates-and-blood-sugar/"
  },
  {
   "id": "ff-m17",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Zuckerhaltige Getränke werden mit einem höheren Risiko für Typ-2-Diabetes in Verbindung gebracht.",
    "en": "Sugary drinks are linked to a higher risk of type 2 diabetes."
   },
   "info": {
    "de": "Wasser, ungesüßter Tee oder Kaffee sind die besseren Alltagsgetränke.",
    "en": "Water, unsweetened tea or coffee are better everyday drinks."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/healthy-drinks/sugary-drinks/"
  },
  {
   "id": "ff-m18",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Phytat in Getreide und Hülsenfrüchten kann die Aufnahme von Zink verringern.",
    "en": "Phytate in grains and legumes can reduce zinc absorption."
   },
   "info": {
    "de": "Pflanzlich Essende brauchen deshalb tendenziell etwas mehr Zink.",
    "en": "People eating plant-based therefore tend to need a little more zinc."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/zinc/"
  },
  {
   "id": "ff-m19",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Die WHO empfiehlt Erwachsenen mindestens 25 g natürliche Ballaststoffe pro Tag.",
    "en": "The WHO recommends at least 25 g of naturally occurring dietary fibre per day for adults."
   },
   "info": {
    "de": "Die Empfehlung stammt aus den 2023 aktualisierten WHO-Leitlinien zu Kohlenhydraten.",
    "en": "The recommendation comes from the WHO carbohydrate guidelines updated in 2023."
   },
   "source": "https://www.who.int/news/item/17-07-2023-who-updates-guidelines-on-fats-and-carbohydrates"
  },
  {
   "id": "ff-m20",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Die WHO empfiehlt Süßstoffe als Mittel zur langfristigen Gewichtskontrolle.",
    "en": "The WHO recommends sweeteners as a tool for long-term weight control."
   },
   "info": {
    "de": "Die WHO rät ausdrücklich davon ab, Süßstoffe zur Gewichtskontrolle einzusetzen.",
    "en": "The WHO explicitly advises against using sweeteners for weight control."
   },
   "source": "https://www.who.int/news/item/15-05-2023-who-advises-not-to-use-non-sugar-sweeteners-for-weight-control-in-newly-released-guideline"
  },
  {
   "id": "ff-m21",
   "truth": false,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Vitamin C ist fettlöslich und wird lange im Körperfett gespeichert.",
    "en": "Vitamin C is fat-soluble and stored in body fat for a long time."
   },
   "info": {
    "de": "Vitamin C ist wasserlöslich und wird nicht in größeren Mengen gespeichert.",
    "en": "Vitamin C is water-soluble and is not stored in large amounts."
   },
   "source": "https://medlineplus.gov/ency/article/002404.htm"
  },
  {
   "id": "ff-m22",
   "truth": false,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Die Alge Nori gilt als zuverlässige Vitamin-B12-Quelle.",
    "en": "The seaweed nori is considered a reliable source of vitamin B12."
   },
   "info": {
    "de": "Nori enthält je nach Sorte schwankende, teils gar keine Mengen an aktivem B12. Verlässlich sind angereicherte Lebensmittel oder Supplemente.",
    "en": "Depending on the type, nori contains varying amounts of active B12, sometimes none. Fortified foods or supplements are reliable."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/vitamin-b12/"
  },
  {
   "id": "ff-m23",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Ein großer Teil des Natriums in der Ernährung stammt aus verarbeiteten Lebensmitteln.",
    "en": "A large share of dietary sodium comes from processed foods."
   },
   "info": {
    "de": "Brot, Fertiggerichte, Käse und Wurst tragen oft mehr bei als der Salzstreuer.",
    "en": "Bread, ready meals, cheese and cured meats often contribute more than the salt shaker."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/salt-and-sodium/"
  },
  {
   "id": "ff-m24",
   "truth": true,
   "topic": {
    "de": "Langlebigkeit",
    "en": "Longevity"
   },
   "s": {
    "de": "Schinken und Würstchen zählen zu verarbeitetem Fleisch.",
    "en": "Ham and sausages count as processed meat."
   },
   "info": {
    "de": "Verarbeitet heißt: gesalzen, gepökelt, fermentiert, geräuchert oder anders haltbar gemacht.",
    "en": "Processed means salted, cured, fermented, smoked or otherwise preserved."
   },
   "source": "https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat"
  },
  {
   "id": "ff-m25",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Kalium hat keinen Einfluss auf den Blutdruck.",
    "en": "Potassium has no effect on blood pressure."
   },
   "info": {
    "de": "Kalium unterstützt einen normalen Blutdruck und gleicht Effekte von Natrium teilweise aus.",
    "en": "Potassium supports normal blood pressure and partly offsets the effects of sodium."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/potassium/"
  },
  {
   "id": "ff-m26",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Vollkorn und Weißmehl lassen den Blutzucker gleich schnell ansteigen.",
    "en": "Whole grains and white flour raise blood sugar equally fast."
   },
   "info": {
    "de": "Ballaststoffe und die intakte Kornstruktur bremsen den Anstieg – Weißmehl wird viel schneller verdaut.",
    "en": "Fibre and the intact grain structure slow the rise – white flour is digested much faster."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/carbohydrates/carbohydrates-and-blood-sugar/"
  },
  {
   "id": "ff-m27",
   "truth": false,
   "topic": {
    "de": "Pflanzliche Ernährung",
    "en": "Plant-based eating"
   },
   "s": {
    "de": "Soja liefert nur einen Teil der unentbehrlichen Aminosäuren.",
    "en": "Soy provides only some of the essential amino acids."
   },
   "info": {
    "de": "Soja enthält alle neun unentbehrlichen Aminosäuren und gilt als vollständiges Protein.",
    "en": "Soy contains all nine essential amino acids and is considered a complete protein."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/soy/"
  },
  {
   "id": "ff-m28",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Zuckerhaltige Getränke haben keinen Zusammenhang mit Typ-2-Diabetes.",
    "en": "Sugary drinks have no link to type 2 diabetes."
   },
   "info": {
    "de": "Ein regelmäßiger Konsum wird mit einem höheren Risiko für Typ-2-Diabetes in Verbindung gebracht.",
    "en": "Regular consumption is linked to a higher risk of type 2 diabetes."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/healthy-drinks/sugary-drinks/"
  },
  {
   "id": "ff-m29",
   "truth": false,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Folat spielt rund um die Schwangerschaft keine besondere Rolle.",
    "en": "Folate plays no special role around pregnancy."
   },
   "info": {
    "de": "Ausreichend Folat hilft, Neuralrohrdefekten beim Kind vorzubeugen.",
    "en": "Enough folate helps prevent neural tube defects in the baby."
   },
   "source": "https://medlineplus.gov/ency/article/002408.htm"
  },
  {
   "id": "ff-m30",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Ballaststoffe fördern Verstopfung.",
    "en": "Fibre promotes constipation."
   },
   "info": {
    "de": "Im Gegenteil: Ballaststoffe erhöhen das Stuhlvolumen und beugen Verstopfung vor.",
    "en": "On the contrary: fibre adds bulk to stool and helps prevent constipation."
   },
   "source": "https://medlineplus.gov/ency/article/002470.htm"
  },
  {
   "id": "ff-m31",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Die WHO empfiehlt Erwachsenen nur etwa 10 g Ballaststoffe pro Tag.",
    "en": "The WHO recommends only about 10 g of fibre per day for adults."
   },
   "info": {
    "de": "Die WHO nennt mindestens 25 g natürlich vorkommende Ballaststoffe pro Tag.",
    "en": "The WHO names at least 25 g of naturally occurring fibre per day."
   },
   "source": "https://www.who.int/news/item/17-07-2023-who-updates-guidelines-on-fats-and-carbohydrates"
  }
 ],
 "Schwer": [
  {
   "id": "ff-s01",
   "truth": true,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Ein erhöhter Methylmalonsäure-Wert (MMA) kann auf einen Vitamin-B12-Mangel hinweisen.",
    "en": "An elevated methylmalonic acid (MMA) level can indicate a vitamin B12 deficiency."
   },
   "info": {
    "de": "MMA steigt, wenn B12 fehlt, und reagiert oft früher als der B12-Spiegel im Blut.",
    "en": "MMA rises when B12 is lacking and often responds earlier than blood B12 levels."
   },
   "source": "https://medlineplus.gov/lab-tests/methylmalonic-acid-mma-test/"
  },
  {
   "id": "ff-s02",
   "truth": true,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Ferritin im Blut spiegelt die Eisenspeicher des Körpers wider.",
    "en": "Ferritin in the blood reflects the body’s iron stores."
   },
   "info": {
    "de": "Niedriges Ferritin spricht für leere Speicher.",
    "en": "Low ferritin suggests depleted stores."
   },
   "source": "https://medlineplus.gov/lab-tests/ferritin-blood-test/"
  },
  {
   "id": "ff-s03",
   "truth": true,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Entzündungen können den Ferritinwert im Blut erhöhen.",
    "en": "Inflammation can raise ferritin levels in the blood."
   },
   "info": {
    "de": "Ferritin steigt nicht nur bei vollen Eisenspeichern, sondern z. B. auch bei Infektionen. Werte deshalb ärztlich einordnen lassen.",
    "en": "Ferritin rises not only with full iron stores but also, for example, with infections. Have results interpreted by a doctor."
   },
   "source": "https://medlineplus.gov/lab-tests/ferritin-blood-test/"
  },
  {
   "id": "ff-s04",
   "truth": true,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Der Vitamin-D-Status wird üblicherweise über 25-Hydroxy-Vitamin-D im Blut bestimmt.",
    "en": "Vitamin D status is usually measured via 25-hydroxyvitamin D in the blood."
   },
   "info": {
    "de": "Diese Speicherform zeigt die Versorgung besser als das aktive Hormon.",
    "en": "This storage form shows supply better than the active hormone."
   },
   "source": "https://medlineplus.gov/lab-tests/vitamin-d-test/"
  },
  {
   "id": "ff-s05",
   "truth": true,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Der HbA1c-Wert spiegelt den durchschnittlichen Blutzucker der letzten zwei bis drei Monate wider.",
    "en": "The HbA1c value reflects average blood sugar over the past two to three months."
   },
   "info": {
    "de": "Er zeigt, wie viel Zucker an das Hämoglobin der roten Blutkörperchen gebunden ist.",
    "en": "It shows how much sugar is bound to the haemoglobin in red blood cells."
   },
   "source": "https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/"
  },
  {
   "id": "ff-s06",
   "truth": false,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Der HbA1c-Wert zeigt, wie hoch der Blutzucker in den letzten 24 Stunden war.",
    "en": "The HbA1c value shows how high blood sugar was over the last 24 hours."
   },
   "info": {
    "de": "HbA1c ist ein Langzeitwert über rund drei Monate, kein Tageswert.",
    "en": "HbA1c is a long-term value covering about three months, not a daily value."
   },
   "source": "https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/"
  },
  {
   "id": "ff-s07",
   "truth": true,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Erhöhtes Homocystein kann mit einem Mangel an Folat, Vitamin B12 oder B6 zusammenhängen.",
    "en": "Raised homocysteine can be linked to a deficiency of folate, vitamin B12 or B6."
   },
   "info": {
    "de": "Diese Vitamine werden für den Abbau von Homocystein gebraucht.",
    "en": "These vitamins are needed to break down homocysteine."
   },
   "source": "https://medlineplus.gov/lab-tests/homocysteine-test/"
  },
  {
   "id": "ff-s08",
   "truth": true,
   "topic": {
    "de": "Langlebigkeit",
    "en": "Longevity"
   },
   "s": {
    "de": "Die IARC stuft verarbeitetes Fleisch als krebserregend für den Menschen ein (Gruppe 1).",
    "en": "The IARC classifies processed meat as carcinogenic to humans (Group 1)."
   },
   "info": {
    "de": "Grundlage ist ausreichende Evidenz für Darmkrebs.",
    "en": "The basis is sufficient evidence for colorectal cancer."
   },
   "source": "https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat"
  },
  {
   "id": "ff-s09",
   "truth": true,
   "topic": {
    "de": "Langlebigkeit",
    "en": "Longevity"
   },
   "s": {
    "de": "Rotes Fleisch ist von der IARC als „wahrscheinlich krebserregend“ eingestuft (Gruppe 2A).",
    "en": "Red meat is classified by the IARC as “probably carcinogenic” (Group 2A)."
   },
   "info": {
    "de": "Die Evidenz ist begrenzter als bei verarbeitetem Fleisch.",
    "en": "The evidence is more limited than for processed meat."
   },
   "source": "https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat"
  },
  {
   "id": "ff-s10",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Häm-Eisen kommt vor allem in tierischen Lebensmitteln vor, Nicht-Häm-Eisen in Pflanzen.",
    "en": "Heme iron is found mainly in animal foods, non-heme iron in plants."
   },
   "info": {
    "de": "Pflanzliche Lebensmittel liefern nur Nicht-Häm-Eisen.",
    "en": "Plant foods provide only non-heme iron."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/iron/"
  },
  {
   "id": "ff-s11",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Häm-Eisen steckt vor allem in Hülsenfrüchten und Getreide.",
    "en": "Heme iron is found mainly in legumes and grains."
   },
   "info": {
    "de": "Pflanzen liefern Nicht-Häm-Eisen; Häm-Eisen stammt aus tierischen Lebensmitteln.",
    "en": "Plants provide non-heme iron; heme iron comes from animal foods."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/iron/"
  },
  {
   "id": "ff-s12",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Bei Selen ist eine Überdosierung praktisch unmöglich.",
    "en": "Overdosing on selenium is practically impossible."
   },
   "info": {
    "de": "Zu viel Selen, etwa durch hochdosierte Präparate oder sehr viele Paranüsse, kann giftig wirken.",
    "en": "Too much selenium, e.g. from high-dose supplements or very many Brazil nuts, can be toxic."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/selenium/"
  },
  {
   "id": "ff-s13",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Sehr hohe Dosen von vorgeformtem Vitamin A können in der Schwangerschaft Fehlbildungen verursachen.",
    "en": "Very high doses of preformed vitamin A can cause birth defects during pregnancy."
   },
   "info": {
    "de": "Vorsicht gilt vor allem bei hochdosierten Präparaten mit Retinol.",
    "en": "Caution applies especially to high-dose supplements containing retinol."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/vitamin-a/"
  },
  {
   "id": "ff-s14",
   "truth": false,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Beta-Carotin aus Karotten führt leicht zu einer gefährlichen Vitamin-A-Überdosierung.",
    "en": "Beta-carotene from carrots easily leads to a dangerous vitamin A overdose."
   },
   "info": {
    "de": "Vitamin-A-Vergiftungen entstehen vor allem durch hochdosiertes vorgeformtes Vitamin A (Retinol) aus Präparaten – nicht durch Karotten.",
    "en": "Vitamin A toxicity comes mainly from high doses of preformed vitamin A (retinol) in supplements – not from carrots."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/vitamin-a/"
  },
  {
   "id": "ff-s15",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Hohe Folsäuredosen können einen Vitamin-B12-Mangel verschleiern.",
    "en": "High doses of folic acid can mask a vitamin B12 deficiency."
   },
   "info": {
    "de": "Deshalb gilt für Folsäure aus Präparaten eine Obergrenze von 1.000 µg pro Tag.",
    "en": "That is why there is an upper limit of 1,000 µg per day for folic acid from supplements."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/folic-acid/"
  },
  {
   "id": "ff-s16",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Natto, fermentierte Sojabohnen, ist eine Quelle für Vitamin K2 (Menachinone).",
    "en": "Natto, fermented soybeans, is a source of vitamin K2 (menaquinones)."
   },
   "info": {
    "de": "Vitamin K2 entsteht bei der bakteriellen Fermentation; Vitamin K1 steckt vor allem in grünem Blattgemüse.",
    "en": "Vitamin K2 is formed by bacterial fermentation; vitamin K1 is found mainly in leafy greens."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/vitamin-k/"
  },
  {
   "id": "ff-s17",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Kalzium aus Grünkohl wird deutlich schlechter aufgenommen als aus Milch.",
    "en": "Calcium from kale is absorbed much less well than from milk."
   },
   "info": {
    "de": "Grünes Blattgemüse enthält zwar insgesamt weniger Kalzium, das Kalzium wird aber oft besser aufgenommen als aus Milchprodukten.",
    "en": "Leafy greens contain less calcium overall, but it is often absorbed better than calcium from dairy."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/calcium/"
  },
  {
   "id": "ff-s18",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Hochdosiertes Biotin kann Laborwerte wie Schilddrüsenhormone verfälschen.",
    "en": "High-dose biotin can distort lab results such as thyroid hormones."
   },
   "info": {
    "de": "Vor Blutabnahmen sollte man Biotin-Präparate deshalb ärztlich ansprechen.",
    "en": "So biotin supplements should be mentioned to your doctor before blood tests."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/biotin/"
  },
  {
   "id": "ff-s19",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Ausreichend Jod in der Schwangerschaft ist wichtig für die Gehirnentwicklung des Kindes.",
    "en": "Enough iodine during pregnancy is important for the child’s brain development."
   },
   "info": {
    "de": "In der Schwangerschaft steigt der Jodbedarf, weil mehr Schilddrüsenhormone gebildet werden.",
    "en": "Iodine needs rise in pregnancy because more thyroid hormones are produced."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/iodine/"
  },
  {
   "id": "ff-s20",
   "truth": true,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Lösliche Ballaststoffe wie Beta-Glucan aus Hafer können das LDL-Cholesterin senken.",
    "en": "Soluble fibre such as beta-glucan from oats can lower LDL cholesterol."
   },
   "info": {
    "de": "Lösliche Ballaststoffe binden Gallensäuren im Darm.",
    "en": "Soluble fibre binds bile acids in the gut."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/carbohydrates/fiber/"
  },
  {
   "id": "ff-s21",
   "truth": false,
   "topic": {
    "de": "Allgemeine Gesundheit",
    "en": "General health"
   },
   "s": {
    "de": "Gesättigte Fette durch Zucker oder Weißmehl zu ersetzen, senkt nachweislich das Herzrisiko.",
    "en": "Replacing saturated fats with sugar or white flour demonstrably lowers heart risk."
   },
   "info": {
    "de": "Vorteile zeigen sich vor allem, wenn gesättigte Fette durch ungesättigte Fette ersetzt werden – nicht durch raffinierte Kohlenhydrate.",
    "en": "Benefits appear mainly when saturated fats are replaced by unsaturated fats – not by refined carbohydrates."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/what-should-you-eat/fats-and-cholesterol/"
  },
  {
   "id": "ff-s22",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Zink wird aus pflanzlichen Lebensmitteln genauso gut aufgenommen wie aus tierischen.",
    "en": "Zinc is absorbed from plant foods just as well as from animal foods."
   },
   "info": {
    "de": "Phytat in Getreide und Hülsenfrüchten verringert die Zinkaufnahme; Einweichen und Keimen kann helfen.",
    "en": "Phytate in grains and legumes reduces zinc absorption; soaking and sprouting can help."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/zinc/"
  },
  {
   "id": "ff-s23",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Folat und Vitamin B12 helfen, Homocystein in Methionin umzuwandeln.",
    "en": "Folate and vitamin B12 help convert homocysteine into methionine."
   },
   "info": {
    "de": "Methionin ist eine Aminosäure; fehlen die Vitamine, kann Homocystein ansteigen.",
    "en": "Methionine is an amino acid; if the vitamins are lacking, homocysteine can rise."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/folic-acid/"
  },
  {
   "id": "ff-s24",
   "truth": false,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Biotin-Präparate haben keinerlei Einfluss auf Laborwerte.",
    "en": "Biotin supplements have no effect at all on lab results."
   },
   "info": {
    "de": "Hohe Biotindosen können Blutwerte falsch hoch oder falsch niedrig erscheinen lassen; die US-Arzneimittelbehörde FDA hat davor gewarnt.",
    "en": "High doses of biotin can make blood values appear falsely high or low; the US FDA has warned about this."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/biotin/"
  },
  {
   "id": "ff-s25",
   "truth": true,
   "topic": {
    "de": "Vitamine",
    "en": "Vitamins"
   },
   "s": {
    "de": "Vitamin A ist fettlöslich, Überschüsse werden im Körper gespeichert.",
    "en": "Vitamin A is fat-soluble, and excess amounts are stored in the body."
   },
   "info": {
    "de": "Deshalb kann zu viel vorgeformtes Vitamin A aus Präparaten problematisch werden.",
    "en": "That is why too much preformed vitamin A from supplements can become a problem."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/vitamin-a/"
  },
  {
   "id": "ff-s26",
   "truth": true,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Aus Milchprodukten werden nur etwa 30 % des Kalziums aufgenommen.",
    "en": "Only about 30% of the calcium in dairy products is absorbed."
   },
   "info": {
    "de": "Bioverfügbarkeit heißt: Nicht alles, was auf dem Etikett steht, kommt im Körper an.",
    "en": "Bioavailability means not everything on the label reaches your body."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/calcium/"
  },
  {
   "id": "ff-s27",
   "truth": false,
   "topic": {
    "de": "Mineralstoffe",
    "en": "Minerals"
   },
   "s": {
    "de": "Algenöl liefert vor allem die pflanzliche Omega-3-Fettsäure ALA.",
    "en": "Algae oil mainly provides the plant omega-3 fatty acid ALA."
   },
   "info": {
    "de": "Algenöl enthält vor allem DHA – dieselbe langkettige Omega-3-Fettsäure wie Fischöl, nur vegan.",
    "en": "Algae oil contains mainly DHA – the same long-chain omega-3 as fish oil, but vegan."
   },
   "source": "https://nutritionsource.hsph.harvard.edu/omega-3-fats/"
  },
  {
   "id": "ff-s28",
   "truth": false,
   "topic": {
    "de": "Laborwerte",
    "en": "Lab values"
   },
   "s": {
    "de": "Homocystein wird im Körper ganz ohne Vitamine abgebaut.",
    "en": "Homocysteine is broken down in the body without any vitamins."
   },
   "info": {
    "de": "Für den Abbau braucht der Körper Vitamin B12, B6 und Folsäure.",
    "en": "The body needs vitamin B12, B6 and folic acid to break it down."
   },
   "source": "https://medlineplus.gov/lab-tests/homocysteine-test/"
  }
 ]
};
  if (typeof module !== 'undefined') module.exports = POOL; else root.FactcheckPool = POOL;
})(typeof window !== 'undefined' ? window : globalThis);
