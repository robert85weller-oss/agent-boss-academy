# Nach dem Livegang: Sichtbarkeit prüfen und nachmessen

Checkliste nach Phase 8 des Skills `website-bauen`, angepasst an diese Seite.
Gilt ab dem Merge der SEO-/Routing-Änderungen auf `main` (Netlify deployt dann automatisch).

## Direkt nach dem Deploy (ca. 15 Minuten)

- [ ] **Neue Adressen live prüfen:** Diese Adressen öffnen. Jede muss die richtige Seite zeigen und beim Neuladen dort bleiben:
  `/sales`, `/finance`, `/hr`, `/insights`, `/insights/adventures-ep-6-deciding-at-speed`, `/impressum`, `/datenschutz`.
- [ ] **Alte LinkedIn-Links** testen, z. B. `https://www.agent-boss-academy.com/#insights/adventures-ep-1-day-one`.
  Die Adresse muss auf `/insights/adventures-ep-1-day-one` springen.
- [ ] Diese Dateien müssen laden: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/assets/og-image.jpg`.
- [ ] **Vorschaubild auf LinkedIn:** https://www.linkedin.com/post-inspector/ → Startseite eingeben → Bild, Titel und
  Beschreibung prüfen. Mit „Inspect“ leert LinkedIn auch den eigenen Cache, falls dort noch die alte Vorschau hängt.
- [ ] **Strukturierte Daten:** https://search.google.com/test/rich-results → Startseite → „Person“ und
  „ProfessionalService“ ohne Fehler.
- [ ] Readiness-Check und Skool-Warteliste einmal live absenden → Eintrag erscheint in Netlify → Forms.

## Google und Bing (einmalig, ca. 30 Minuten)

- [ ] **Google Search Console:** https://search.google.com/search-console → Property `agent-boss-academy.com`
  (Domain-Property). Google gibt einen TXT-Eintrag vor, den du beim DNS-Anbieter der Domain einträgst.
  Ist das Netlify DNS, geht das unter Netlify → Domains → DNS settings.
- [ ] Unter **Sitemaps** `https://www.agent-boss-academy.com/sitemap.xml` einreichen.
- [ ] Unter **URL-Prüfung** die Startseite, `/sales`, `/finance`, `/hr` und `/insights` einzeln „Indexierung beantragen“.
- [ ] **Bing Webmaster Tools:** https://www.bing.com/webmasters → „Import from Google Search Console“.
  Das ist wichtig, weil ChatGPT für die Websuche unter anderem Bing nutzt.

## Profile abgleichen

KI-Suchmaschinen übernehmen, was auf deinen Profilen steht. Überall sollte dieselbe Geschichte stehen wie in `llms.txt`:
- [ ] **LinkedIn:** Headline und Info-Text mit „Agent Boss Leader“, KI-Transformation für Führungskräfte, Link auf
  `https://www.agent-boss-academy.com`.
- [ ] LinkedIn-Featured-Bereich: Startseite und `/insights` verlinken. Der Post Inspector zeigt jetzt das neue Vorschaubild.
- [ ] Neue Insights-Posts auf LinkedIn künftig mit dem direkten Artikel-Link `/insights/<id>` teilen.

## Nach drei bis vier Wochen: nachmessen

- [ ] **Search Console → Leistung:** Bei welchen Suchbegriffen erscheint die Seite? Welche Unterseiten bekommen Klicks?
- [ ] **Abdeckung:** Sind alle 12 Adressen aus der Sitemap indexiert? Falls nicht, Grund in der URL-Prüfung ansehen.
- [ ] **KI-Sichtbarkeit:** In ChatGPT, Perplexity und Claude fragen, zum Beispiel:
  „Wer ist Robert Weller (Agent Boss)?“, „Wer begleitet Führungskräfte in die KI-Transformation mit AI-Agents?“,
  „Was ist ein Agent Boss Leader?“. Wird die Seite zitiert? Stimmt die Beschreibung?
  (Mit DataForSEO lässt sich das auch automatisiert messen, ca. 1 $.)
- [ ] Ergebnis kurz festhalten (Second Brain), dann entscheiden: Welche Themen verdienen eine eigene Unterseite oder einen Insight?

## Pflege

- Neuer Insight → in `index.html` im `insights`-Array ergänzen **und** in `sitemap.xml` eintragen.
- Angebot oder Positionierung ändert sich → `llms.txt` und das JSON-LD im `<head>` mitziehen.
- Neues Vorschaubild: 1200 × 630 Pixel als `assets/og-image.jpg` ersetzen und danach den LinkedIn Post Inspector laufen lassen.
