# Agent Boss Academy — Website (Projekt-Kontext)

> Persönliche Brand-/Lead-Gen-Website von **Robert Weller** als *Agent Boss Leader*.
> Ziel: Besucher (meist von LinkedIn) auf die Angebote führen → Beratung / Skool-Community / Done-for-you-Automation → Strategie-Call.

## ⚠️ Wichtigste Fakten (NICHT übersehen)
- **Eine einzige Datei: `index.html`** (~230 KB) — **reines HTML/CSS/JS, KEIN Build, KEIN Framework** (kein Next.js/React/Tailwind, trotz altem Eintrag). Alles inline: `<style>` + `<script>` + Markup.
- **Auto-Deploy aktiv:** jeder `git push` auf `main` → Netlify deployt automatisch live auf **https://www.agent-boss-academy.com**. Kein manuelles `netlify deploy` mehr nötig.
- Repo: `github.com/robert85weller-oss/agent-boss-academy`, Branch `main`. Projektordner: `/Users/robert/Agent Boss Academy/` (flach, Repo-Root).
- **Niemals wieder einbauen:** Academy-/Kurs-/Zertifikat-Framing (Hochschulzertifikat, WHU, „8–12 Wochen", „Woche 01–08", „Capstone", „Teilnehmer", „Learning Journey", Preis-Pakete). Wurde bewusst komplett entfernt.

## Architektur (index.html)
- **SPA-artig:** `showPage(id)` schaltet zwischen `#page-home`, `#page-sales`, `#page-finance`, `#page-hr`, `#page-impressum` (jeweils `.page`, eine ist `.active`).
- **Zweisprachig DE/EN** über `setLang(lang)`:
  1. Großes `i18n`-Objekt (`de: {…}, en: {…}`), Texte werden per Element-`id` gesetzt: `s(id,html)` / `st(id,text)`.
  2. **Zusätzlich:** `[data-de]`/`[data-en]`-Attribute werden automatisch übersetzt (eine Schleife in `setLang` setzt `textContent`). → **Neuer kurzer Text = einfach `data-de`/`data-en` ans Element** (kein i18n-Key nötig). Längerer/strukturierter Content = id + `setLang`-Zeile + Keys in BEIDEN Sprachobjekten.
- **Theme:** `body.theme-light` ist IMMER gesetzt (alle Seiten). Editorial-Overrides hängen daran. Alte Dark-Theme-Regeln existieren noch als Basis (für nichts mehr genutzt, aber harmlos).
- **Toter Code (harmlos, nicht gerendert):** alte Chat-Demo (`chat-demo`-CSS, `chatBody`/`run()`-JS), ungenutzte Pricing-/WHU-Reste. Kann bei Gelegenheit aufgeräumt werden.

## Design-System v2 — „Editorial" (verbindlich)
Premium-Beratung-Editorial, bewusst **anti-„KI-Look"**. Doku im Second Brain: `02 Projects/Agent Boss Academy/01 Design/Design System/(C) Design-Wechsel 2026-06-12 — Editorial v2.md`.
- **Farben** (`:root`): Paper `#F4F1EA` / Paper-2 `#EDE8DD` / Card `#FBF9F4` · Ink `#16140F` / soft `#423D33` / mute `#6B6557` · **Akzent Deep Amber `#B6541F`** (deep `#913F14`, light `#E08A4E`) · Hairlines `rgba(22,20,15,.14)`. **Nur EIN Akzent**, kein Blau/Grün.
- **Fonts:** **Fraunces** (Display/Serife, Highlight = *kursiv + amber*) + **Hanken Grotesk** (Body) — via Google Fonts.
- **Prinzipien:** Hairline-Grids (`gap:1px` auf `--line`), viel Whitespace, 01/02/03-Index-Ziffern (Fraunces-kursiv), EIN dunkler Ink-CTA-Block pro Seite, KEINE Emoji-Icons / Glow-Blobs / Grid-Masken / Puls-Badges. Motion sparsam (Fade-Ins, Hover-Underlines).
- **Bei UI-Arbeit:** `frontend-design`-Skill nutzen, Stil halten, bei Design-Entscheidungen `AskUserQuestion`.

## Inhalt / Positionierung
- **Person-first**, dann **3 gleichwertige Offerings:** Beratung & Guidance · Skool Community (Warteliste) · Done-for-you Automation (Langdock + Claude Agents, n8n/Make Workflows, betrieben).
- **Sales/Finance/HR = Anwendungsfelder** (Use-Cases), keine Kurse.
- Hero: Infografik „Vom Manager zum Agent Boss" (alte vs. neue Welt). Tonfall Homepage = **„du"** (Subpages teils noch „Sie" — offen).
- **Agent Boss Readiness Check** (Lead-Magnet): 6-Fragen-Quiz → Level Assistant/Agent/Agent Boss → E-Mail → On-Page **Mini-Guide „Vom Assistant zum Agent Boss"** (ACTION®, Frontier Firm, EU AI Act, Tooling) + „Als PDF speichern". Auto-Popup nach 12s (1×/Session) + Hero-Link `#h-rc`. Wissensquelle: `docs/knowledge/masterai-knowledge-book.md`.
- Trust-Bar „Womit wir automatisieren": Microsoft AI Portfolio · Langdock · n8n · Make · Claude · Second Brain · Mountanridge (zukünftig).

## Integrationen / Daten
- **Strategie-Call:** Calendly `https://calendly.com/robert85-weller/30min` (überall verlinkt).
- **Formulare:** Netlify Forms — `readiness-check` + `skool-waitlist` (versteckte Detection-Forms direkt nach `<body>`; greifen nur live, nicht lokal/`file://`).
- **Brevo-Popup** (`#popup`, `submitBrevoForm`): separater Test, **nicht** auto-getriggert — in Ruhe lassen.
- **Impressum:** Robert Weller, Theodor-Heuss-Str. 31, 69226 Nußloch, Tel. 015120565890, robert85.weller@googlemail.com.

## Arbeiten & Testen
- **JS prüfen:** `node -e "..."` Script extrahieren + `node --check`. (Es gibt ein bewährtes Playwright-E2E-Muster — 29 Checks: Nav, Subpages, Sprachwechsel, Modals, Readiness-Flow, Guide, PDF, Mobile.)
- **Lokal ansehen:** `cd "/Users/robert/Agent Boss Academy" && python3 -m http.server 8000` → http://localhost:8000 (Formular-Speicherung geht nur live).
- **Visuell verifizieren:** Playwright headless (Chromium installiert unter `~/.npm/_npx/.../playwright`); Screenshots statt Raten.
- **Git:** auf `main` arbeiten, committen, `git push` = live. `.gitignore` deckt `.netlify` + `.DS_Store`.

## Offene Folge-Themen
- Tonbruch „du" vs. „Sie" auf den Subpage-Detailtexten angleichen.
- Team-Sektion: Sarah Krüger & Markus Hoffmann sind Platzhalter (nicht real).
- Datenschutzerklärung fehlt (Impressum steht).
- Skool-Community noch nicht gebaut (nur Warteliste live).
- Toten Chat-/Pricing-/WHU-Code aufräumen.
- Readiness-Fragen/Scoring/Guide sind v1 — verfeinerbar.

## Second Brain (Roberts Obsidian-Vault)
`~/Documents/Robert Second Brain` — Projektnotizen unter `02 Projects/Agent Boss Academy/` (Iteration Logs unter `07 Iteration Logs/`). Dort gilt: KI-generierte Dateien mit **`(C)`-Präfix**, bestehende Dateien nicht ohne Rückfrage ändern, jede Session mit konkretem Next Step.
