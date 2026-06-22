# Homepage Advisory-Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. This repo has **no unit-test framework**; "verification" steps mean `node --check` on the extracted `<script>` + Playwright screenshots/assertions against `http://localhost:8000`.

**Goal:** Die Homepage (`#page-home`) von „KI-generiert/Baukasten" zu „Premium Advisory, redaktionell erzählt" umbauen — Editorial-Fundament, Farben & Fonts bleiben.

**Architecture:** Reine Markup-/CSS-Umstellung in der einen Datei `index.html` (inline `<style>` + Markup + `i18n`/`setLang`). Kein Build, kein Framework. Neue/verschobene Sektionen behalten `.fade-in` (IntersectionObserver greift). Globale Handschrift (Textur, Index, Testimonial-Stil) über gemeinsame Klassen/`body.theme-light`.

**Tech Stack:** HTML/CSS/JS inline, Fraunces + Hanken Grotesk (Google Fonts), Netlify (Auto-Deploy nur `main`), Playwright (headless, `~/.npm/_npx/e41f203b7505f1fb/node_modules/playwright`).

## Global Constraints

- **Eine Datei:** alle Änderungen in `/Users/robert/Agent Boss Academy/index.html`. Doku-Specs/Plans unter `docs/superpowers/`.
- **Branch:** ausschließlich `feature/homepage-advisory-redesign`. **Kein Merge/Push nach `main` ohne Roberts ausdrückliche Freigabe.**
- **Erhalten/unangetastet:** Readiness-Check (`rcOpen`), Insights-Hub + Hash-Routing, Orchestrierungs-Animation, Netlify-Form-Detection, DE/EN-i18n, Calendly-Links, alle Sektions-IDs für Anker-Nav (`offerings`, `programmes`, `why`, `impact`, `testimonials`, `team`, `insights-home`).
- **Design-System:** nur `:root`-Farben (Paper/Ink/Amber), nur Fraunces (Display, kursiv+amber für Highlights) + Hanken (Body). **Kein** neuer Akzent, keine Emoji-Icons, keine Glow-Blobs.
- **Verifikation je Task:** Script extrahieren → `node --check`; lokal `python3 -m http.server 8000`; Playwright-Screenshot der betroffenen Sektion (DE, ggf. EN/Mobile); keine Konsolen-/Page-Fehler.
- **Hero-Headline (final):** DE „Ich coache Führungskräfte in die *KI-Transformation*." / EN „I coach leaders through their *AI transformation*." (Akzent kursiv+amber).

---

### Task 1: Globale Handschrift — Papier-Textur + linksbündige Sektions-Header + laufender Index

**Files:**
- Modify: `index.html` — neuer CSS-Block vor `</style>` (~Zeile 954-Bereich, ans Ende der `body.theme-light`-Overrides) + `body::before`-Textur.

**Interfaces:**
- Produces: CSS-Klassen `.sec-index` (Span für laufende Ziffer), Konvention `data-idx="01"`; globale Textur via `body::before`. Spätere Tasks hängen `.sec-index`-Spans in Sektions-Header.

- [ ] **Step 1: Papier-/Korn-Textur global** — `body::before` als fixed overlay, `pointer-events:none`, sehr niedrige Deckkraft (SVG-Noise als data-URI oder feines `radial-gradient`-Stipple), `z-index` unter Inhalt, in `@media print` deaktiviert. Reuse-Check: bestehende `body.guide-open::before`-Grain-Regel nicht brechen.
- [ ] **Step 2: Sektions-Header linksbündig als Default** — `body.theme-light #page-home .programs-header, .why-header, .impact-header, .testimonials-header, .insights-hub-head` etc.: `text-align:left; align-items:flex-start; max-width:760px`. (Final-CTA bleibt zentriert.)
- [ ] **Step 3: Laufender Index** — `.sec-index { font-family:'Fraunces',serif; font-style:italic; color:var(--amber); ... }` als kleine Ziffer links über/neben dem `.section-label`. Dezent.
- [ ] **Step 4: Verifikation** — `node --check`; Playwright-Screenshot Home DE (scroll über 2-3 Sektionen) → Header linksbündig, Textur sichtbar aber subtil, keine Fehler.
- [ ] **Step 5: Commit** — `git commit -m "feat(home): globale Handschrift — Papier-Textur, linksbündige Header, laufender Index-Stil"`

---

### Task 2: Hero → Advisory-Statement + großes Porträt

**Files:**
- Modify: `index.html` — `.hero`-Markup (`hero-left`/`hero-right`), `body.theme-light .hero*`-CSS, `i18n` (DE/EN Hero-Keys), `setLang` (Hero-Wiring; `h-cta2`-Referenz entfernen).

**Interfaces:**
- Consumes: vorhandenes `assets/robert-avatar.jpg`.
- Produces: Hero ohne `hero-right`-Infografik (die wandert in Task 3). Entfernt `#h-cta2` aus Markup **und** `setLang`.

- [ ] **Step 1: Hero-Markup umbauen** — `hero-left`: Eyebrow (Hairline-Label statt `.hero-badge`-Pill) `#h-badge`; `<h1 id="h-h1">` linksbündig mit Akzent-Span; ein Begleitsatz `#h-sub` (kürzen); **ein** Primär-CTA `#h-cta1` (Calendly) + Readiness-Link `#h-rc` (bleibt) + Footnote `#h-fn`. `#h-cta2`-Button entfernen. `hero-right`: `<figure class="hero-portrait">` mit `<img src="assets/robert-avatar.jpg" …>` + `<figcaption>` „SAP-Exec · Agent Boss Leader". Darunter Progression-Zeile „Assistant → Agent → Agent Boss".
- [ ] **Step 2: `.leader-shift`-Infografik aus `hero-right` herauslösen** — Markup ausschneiden, in Task 3 als eigenes Band einsetzen (zwischenparken).
- [ ] **Step 3: Hero-CSS** — `body.theme-light .hero`: zweispaltig (Text 1.1fr / Porträt .9fr), linksbündig, großzügiger Whitespace; `.hero-portrait img`: editorial gerahmt (1px `--line`, dezenter Schatten, `object-position`), Papier-Look; Eyebrow als Hairline-Label (`::before` 28px Linie, amber); H1 `clamp(...)`, Akzent-Span kursiv+amber. Sekundärbutton-Styles im Hero entfernen.
- [ ] **Step 4: i18n** — Hero-Keys in `i18n.de`/`.en` an neues Wording anpassen (Headline final lt. Global Constraints; Caption-Key `heroCaption`, Progression-Key `heroProg` neu in BEIDE Sprachen). In `setLang`: `h-cta2`-Zeile entfernen, `heroCaption`/`heroProg` verdrahten.
- [ ] **Step 5: Verifikation** — `node --check`; Playwright DE+EN Desktop+Mobile Hero; Assertion: `document.getElementById('h-cta2')===null` und **keine** Konsolen-Fehler bei `setLang('en')` (sonst verwaiste Referenz). Porträt lädt (kein 404).
- [ ] **Step 6: Commit** — `git commit -m "feat(home): Advisory-Hero mit Porträt, ein CTA, linksbündige Ich-Headline"`

---

### Task 3: „Der Leadership-Wandel"-Band (relozierte Infografik)

**Files:**
- Modify: `index.html` — neue `<section class="leadership-shift-band" id="leadershift">` direkt nach Hero; CSS für das Band; ggf. `i18n` (Band-Eyebrow nutzt bestehende `data-de/data-en` der `.leader-shift`).

**Interfaces:**
- Consumes: das in Task 2 herausgelöste `.leader-shift`-Markup (unverändert, inkl. bestehender `data-de/data-en`).
- Produces: Sektion `#leadershift` mit `.fade-in`.

- [ ] **Step 1: Band einsetzen** — `.leader-shift` in neue Sektion direkt nach `</section>` des Hero platzieren; Eyebrow „Der Leadership-Wandel" als linksbündiger Sektions-Header mit `.sec-index data-idx`.
- [ ] **Step 2: CSS** — Band mit ruhigem Hintergrund (alternierend `--paper`/`--paper-2`), zentriertes/breiteres Infografik-Layout, editorial gerahmt; `.fade-in` Observer greift (Home-`.fade-in` wird beim Load beobachtet).
- [ ] **Step 3: Verifikation** — `node --check`; Playwright Home DE: Hero → direkt darunter Leadership-Band sichtbar; Infografik-Inhalt unverändert; Sprachwechsel EN übersetzt die `data-de/data-en`-Zellen.
- [ ] **Step 4: Commit** — `git commit -m "feat(home): Leadership-Wandel als eigenes Band unter dem Hero"`

---

### Task 4: Sektions-Reihenfolge — About/Vita direkt unter Hero (Person-first), Index vergeben

**Files:**
- Modify: `index.html` — Reihenfolge der Home-Sektionen; `.about`-Markup (Avatar entfernen); `.sec-index data-idx`-Spans in alle Home-Sektions-Header; ggf. `setLang`-Reihenfolge unkritisch (IDs bleiben).

**Interfaces:**
- Consumes: `.sec-index` aus Task 1.
- Produces: finale Home-Reihenfolge: Hero → Leadership-Band → **About/Vita** → Offerings(Advisory zuerst) → Orchestrierung → Programs → Why → Impact → Testimonials → Insights-Teaser → Final-CTA. (Reihenfolge final beim Umsetzen visuell justierbar.)

- [ ] **Step 1: About hochziehen** — `<section class="about" id="team">` direkt hinter das Leadership-Band verschieben. **Avatar entfernen** (Hero trägt das Porträt) → About wird vita-/textfokussiert; Layout einspaltig/redaktioneller.
- [ ] **Step 2: Laufende Index-Ziffern vergeben** — jeder Home-Sektions-Header bekommt `<span class="sec-index" data-idx="0N"></span>` (01..0n in finaler Reihenfolge). Dezent.
- [ ] **Step 3: Anker-Nav prüfen** — IDs `team/offerings/programmes/why/impact/testimonials/insights-home` unverändert; `goHomeSection(...)` muss weiter scrollen.
- [ ] **Step 4: Verifikation** — `node --check`; Playwright: Reihenfolge stimmt (Screenshot Full-Page Home DE); Klick auf Nav „Anwendungsfelder/Warum wir/Ergebnisse/Stimmen" scrollt zur richtigen Sektion (Assertion: Ziel-Element im Viewport); kein Doppel-Porträt (About ohne `img.about-avatar`).
- [ ] **Step 5: Commit** — `git commit -m "feat(home): About/Vita direkt unter Hero, laufende Sektions-Indizes, Advisory-Reihenfolge"`

---

### Task 5: SaaS-Tells raus — Testimonials redaktionell (site-weit)

**Files:**
- Modify: `index.html` — Testimonial-Markup (`.stars`, `.t-avatar`, `.testimonial-footer`) + `body.theme-light`-CSS. Gilt für Home **und** Subpages (gemeinsame Klassen).

**Interfaces:**
- Consumes: bestehende `.testimonial-card--feature`/Support-Karten aus vorheriger Iteration.
- Produces: Testimonials ohne `★★★★★` und ohne Initialen-Kreis-Avatare.

- [ ] **Step 1: Sterne entfernen** — `.stars`-Elemente aus Testimonial-Markup raus (Home + Subpages); zugehörige Reste neutralisieren.
- [ ] **Step 2: Avatare ersetzen** — `.t-avatar`-Kreis (Initialen) raus → Footer als redaktionelle Zeile „Name · Rolle" (Hanken, `--ink`/`--ink-mute`), ggf. mit kurzem amber Hairline davor.
- [ ] **Step 3: CSS aufräumen** — ungenutzte `.stars`/`.t-avatar`-Regeln können bleiben (harmlos) oder entfernt werden; Footer-Layout anpassen.
- [ ] **Step 4: Verifikation** — `node --check`; Playwright Home + 1 Subpage (z. B. Sales) DE+EN: Testimonials ohne Sterne/Kreis-Avatare, Name·Rolle lesbar.
- [ ] **Step 5: Commit** — `git commit -m "feat: Testimonials redaktionell (Sterne + Initialen-Avatare entfernt)"`

---

### Task 6: Ruhigere Trust-Bar + Metrik-Feinschliff + Asymmetrie-Politur

**Files:**
- Modify: `index.html` — `body.theme-light .trust-bar*`, `.impact*`-CSS; ggf. Spaltigkeit einzelner Home-Grids variieren.

- [ ] **Step 1: Trust-Bar leiser** — linksbündig, kleinere Logos/Abstände, Label „Womit ich automatisiere" beibehalten; ruhiger als jetzt.
- [ ] **Step 2: Metrik-Feinschliff** — Block redaktioneller/ruhiger (Lead-Metrik existiert); Abstände/Typo justieren, keine SaaS-KPI-Anmutung.
- [ ] **Step 3: Asymmetrie-Politur** — 1-2 Sektionen bewusst asymmetrisch (Header-links/Inhalt-rechts) statt zentriertem Grid, wo es den Baukasten-Rhythmus am stärksten bricht (z. B. Why oder Offerings-Header).
- [ ] **Step 4: Verifikation** — `node --check`; Playwright Home DE+EN Desktop+Mobile (Full-Page) → kohärenter, weniger „templated" Gesamteindruck; keine Layout-Brüche mobil.
- [ ] **Step 5: Commit** — `git commit -m "feat(home): ruhigere Trust-Bar, Metrik-Feinschliff, Asymmetrie-Politur"`

---

### Task 7: End-to-End-Verifikation + Regression

**Files:** keine Code-Änderung außer Fixes, die hier auffallen.

- [ ] **Step 1: JS-Syntax** — Script extrahieren, `node --check` grün.
- [ ] **Step 2: Playwright-Matrix** — DE+EN × Desktop(1280)+Mobile(390): Hero, Leadership-Band, About, Offerings, Orchestrierung, Programs, Why, Impact, Testimonials, Insights-Teaser, Final-CTA. Screenshots ablegen.
- [ ] **Step 3: Regression-Assertions** — Readiness-Check öffnet (`rcOpen`), Insights `#insights/<slug>` Deep-Link + Reader + Filter, Orchestrierungs-Animation `.visible`, Sprachwechsel re-rendert Insights, Anker-Nav scrollt, **keine** Konsolen-/Page-Fehler, `prefers-reduced-motion` ok.
- [ ] **Step 4: Mobile-Check** — Hero-Porträt + linksbündige Headlines brechen sauber um (≤1024/≤600).
- [ ] **Step 5: Review-Paket** — Screenshots dem Nutzer zeigen; lokal `python3 -m http.server 8000`. **Stopp vor Merge** — auf Roberts Freigabe warten.

---

## Self-Review

**Spec-Coverage:** Hero-Advisory (Task 2) ✓ · Leadership-Band (Task 3) ✓ · Struktur-Layer Textur/Index/links (Task 1+4) ✓ · About unter Hero ohne Doppel-Porträt (Task 4) ✓ · Advisory zuerst (Task 4 Reihenfolge) ✓ · Testimonials ohne Sterne/Avatare (Task 5) ✓ · Trust/Metrik leiser (Task 6) ✓ · Verifikation/Regression (Task 7) ✓ · Branch-Workflow (Global Constraints) ✓.

**Placeholder-Scan:** Keine TBD/TODO; CSS-Werte bewusst als „justierbar beim Umsetzen" markiert, weil visuell iterativ (kein Unit-Test-Kontext) — die Verifikation je Task ist konkret (node --check + Playwright + Assertions).

**Konsistenz:** IDs durchgängig genannt (`h-h1/h-sub/h-cta1/h-rc/h-fn`, entfernt `h-cta2`); neue i18n-Keys `heroCaption/heroProg`; Klasse `.sec-index`/`data-idx` einheitlich; Sektions-IDs für Anker-Nav explizit erhalten.

**Risiko-Hotspot:** verwaiste `setLang`-Referenz nach `h-cta2`-Entfernung → in Task 2 Step 5 explizit getestet.
