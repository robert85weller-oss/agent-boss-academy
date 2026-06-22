# Spec: Homepage-Redesign „Premium Advisory, redaktionell erzählt"

**Datum:** 2026-06-22 · **Branch:** `feature/homepage-advisory-redesign` · **Datei:** `index.html` (nur `#page-home`)

## Kontext & Ziel

Robert Weller hat Feedback bekommen, die Seite sehe „zu KI-generiert / typisch Claude" aus.
Die Seite ist sein **Consulting-/Advisory-Schaufenster** für Führungskräfte, die ihn über
LinkedIn finden. In Sekunden soll spürbar werden: **„Robert coacht Führungskräfte in die
KI-Transformation."** — Person-first, Premium-Beratung, kein SaaS-Tool.

**Diagnose der „AI-Tells" (was behoben wird):** immer gleiches Sektions-Schema (zentriertes
Label → zentrierte Headline → Grid), Standard-Hero (Badge + 2 Buttons + Grafik), generische
SaaS-Bausteine (★★★★★-Testimonials mit Initialen-Kreis-Avataren, Metrik-Karten, Trust-Logos),
zu viel Symmetrie/Ordnung, wenig eigene Handschrift.

**Gewählte Richtung (vom Nutzer freigegeben):** Warm-Editorial mit echtem Foto/Handschrift als
Seele + Struktur-Moves aus „Editorial Magazine" (Asymmetrie, linksbündige Headlines, laufender
Sektions-Index), um den Baukasten-Rhythmus zu brechen. **Farben, Fonts (Fraunces/Hanken) und
das Editorial-Fundament bleiben.**

## Scope

- **Nur `#page-home`** (Homepage). Subpages (Sales/Finance/HR), Impressum, Insights behalten ihr
  Layout — erben aber globale Verbesserungen (Papier-/Korn-Textur, Testimonial-Stil ohne
  Sterne/Kreis-Avatare, Typo-Details), da diese über gemeinsame Klassen/`body.theme-light` laufen.
- **Unangetastet:** Readiness-Check, Insights-Hub, Orchestrierungs-Animation, Netlify-Formulare,
  DE/EN-i18n, alle Inhalte/CTAs/Calendly-Links. Eine Datei, kein Build, kein Framework.
- **YAGNI:** keine neuen Abhängigkeiten, keine neuen Seiten, kein neues Bildmaterial (vorhandenes
  `assets/robert-avatar.jpg` wird genutzt).

## Design — Komponenten

### 1. Hero → Advisory-Statement (`.hero`, ~Markup + `body.theme-light .hero*`-CSS)
- Eyebrow als **Hairline-Label** (kein Pill/`hero-badge`-Look): „Robert Weller · Agent Boss Leader".
- **Linksbündige** große Fraunces-Aussage in *Ich*-Form (Default-Wording, vom Nutzer final
  bestätigbar): DE „Ich coache Führungskräfte in die KI-Transformation." / EN „I coach leaders
  through their AI transformation." (Akzentwort kursiv+amber, z. B. *KI-Transformation*).
- Ein kurzer Begleitsatz + **ein** klarer Primär-CTA (Strategy Call) + schlanker Readiness-Link
  (`#h-rc`, bestehend). Die zweite Sekundär-Schaltfläche entfällt im Hero (ruhiger, klarer).
- Rechts: **Porträt groß**, editorial gerahmt (1px Hairline, dezenter Schatten, Papier-/Korn-Textur),
  kleine Bildunterschrift „SAP-Exec · Agent Boss Leader". Quelle: `assets/robert-avatar.jpg`
  (austauschbar gehalten).
- Darunter schmale Progression *Assistant → Agent → Agent Boss* (Hairline-Trenner).
- i18n: bestehende Keys `heroBadge/heroH1*/heroSub/heroCta1/heroFn/heroRcLink` wiederverwenden/anpassen;
  ggf. 1–2 neue Keys (z. B. `heroCaption`). `heroCta2` entfällt aus dem Hero.

### 2. „Der Leadership-Wandel" Band (bestehende `.leader-shift` Infografik)
- Die heute im `hero-right` sitzende statische Infografik *Vom Manager zum Agent Boss* wandert in
  ein **eigenes, ruhiges Band direkt unter den Hero** (mehr Raum). Inhalt unverändert; nur Position
  + editorial gerahmt. (Bewusst additiv — Nutzer schätzt diese Grafik.)

### 3. Struktur-Layer gegen den „Baukasten" (global auf `#page-home`)
- **Linksbündige** Sektions-Header (heute teils zentriert) + **laufender Index** 01–0n als kleine
  Fraunces-Kursiv-Ziffer am linken Rand der Sektions-Header (über eine `data-idx`-Konvention/Span).
- **Asymmetrie:** abwechselnd Header-links/Inhalt-rechts statt überall zentriertem Grid; mehr
  Whitespace. Reuse vorhandener Hairline-Grids, aber mit variierter Spaltigkeit (nicht alles 3-up).
- **Papier-/Korn-Textur global** (subtiles `body::before`-Overlay, sehr niedrige Deckkraft) →
  Handschrift statt „cleaner KI-Clean". Muss Druck (`@media print`) und Lesbarkeit unangetastet lassen.

### 4. Advisory zuerst (Reihenfolge `#page-home`)
- „Beratung & Guidance" führt sichtbar (bereits featured-first); Automation als Ausbaustufe.
- **About/Vita** (`#team`) rückt **höher** Richtung Hero (Person-first für Advisory). Reihenfolge-
  Anpassung der Sektionen, Inhalte unverändert.

### 5. SaaS-Tells entfernen
- **Testimonials:** `★★★★★` (`.stars`) und Initialen-Kreis-Avatare (`.t-avatar`) entfernen/ersetzen
  → redaktionelle Zitate mit „Name · Rolle". Featured-Pull-Quote bleibt. Gilt site-weit
  (auch Subpages-Stimmen erben das).
- **Metrik-Block:** ruhiger/redaktioneller (Lead-Metrik existiert bereits; nur Feinschliff).
- **Trust-Bar:** leiser, linksbündig, kleinere Logos.

## Datenfluss / Technik

- Reine Markup-/CSS-Umstellung in `index.html`; JS nur, falls Sektions-Reihenfolge die
  IntersectionObserver-`.fade-in`-Beobachtung berührt (bestehende Logik greift, neue/verschobene
  Knoten müssen `.fade-in` behalten).
- i18n: geänderte Hero-Texte über bestehendes `i18n`+`setLang`-Muster; entfernte Elemente (z. B.
  `h-cta2`) aus `setLang` entfernen, um Fehlreferenzen zu vermeiden.
- Bildverarbeitung: keine — vorhandenes JPG, ggf. zusätzliche CSS-Rahmung/Objektposition.

## Fehlerfälle / Risiken

- **Doppelte IDs / verwaiste `setLang`-Referenzen** beim Umbau (z. B. entfernter Hero-Button) →
  vor Commit `node --check` + Konsolen-Fehler-Scan via Playwright.
- **Texturen-Overlay** darf Klicks nicht abfangen (`pointer-events:none`) und Druck nicht stören.
- **Sektions-Umordnung** darf Anker-Navigation (`goHomeSection('programmes'|'why'|'impact'|'testimonials')`)
  nicht brechen — IDs bleiben erhalten.
- **Mobile:** Hero-Porträt + linksbündige Headlines müssen unter 1024/600px sauber umbrechen.

## Verifikation (Akzeptanz)

1. `node --check` des extrahierten Scripts grün; keine Konsolen-/Page-Fehler (Playwright).
2. Playwright-Screenshots DE+EN × Desktop(1280)+Mobile(390): Hero, Leadership-Band, je Sektion,
   Testimonials (ohne Sterne/Kreis-Avatare), Metrik, Trust-Bar.
3. Regression: Readiness-Check öffnet, Insights-Hub + Deep-Links, Orchestrierungs-Animation,
   Sprachwechsel, Anker-Nav, Formular-Detection unverändert.
4. Subjektiver Abnahme-Check mit Robert auf der Branch (lokal/Preview) **vor** Merge nach `main`.

## Workflow

Arbeit ausschließlich auf `feature/homepage-advisory-redesign`. `main`/Live unberührt. Merge nach
`main` (= Auto-Deploy Netlify) **erst nach Roberts ausdrücklicher Freigabe** nach gemeinsamem Review.

## Offene Punkte (vor/ während Umsetzung mit Robert klären)

- Finales **Wording der Hero-*Ich*-Headline** (Default oben vorgeschlagen).
- Ob **About/Vita** wirklich direkt unter den Hero soll (vs. aktuelle Position).
- Intensität „laufender Index + Asymmetrie" (kann dezenter gefahren werden).
