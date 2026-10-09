# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primäre Zielgruppe: **einzelne Manager und Führungskräfte** (breit, branchen- und
firmengrößenunabhängig), die meist über **LinkedIn** auf die Seite kommen. Ihre
Situation: Sie spüren den KI-Umbruch in ihrer Führungsrolle und wollen selbst vom
klassischen Manager zum **„Agent Boss"** werden — jemand, der Mensch + KI-Agenten
orchestriert, statt die Arbeit selbst zu machen. Ihr Job-to-be-done: verstehen, wo
sie stehen, und einen glaubwürdigen, praktischen Weg (plus optional Umsetzung durch
Robert) finden.

Anwendungsfelder als Use-Cases (keine Kurse): **Sales · Finance · HR**.

## Product Purpose

Persönliche Brand- und Lead-Gen-Website von **Robert Weller** als *Agent Boss Leader*.
Sie führt LinkedIn-Besucher person-first an drei gleichwertige Angebote heran und dann
weiter zum **Strategie-Call** (Calendly). Erfolg = qualifizierte Leads: Readiness-Check
ausgefüllt, Skool-Warteliste-Eintrag oder Call gebucht.

## Positioning

**Robert selbst ist der Differenzierer**, den niemand kopieren kann: Er lebt den Wandel
täglich als **VP & Global Content Officer bei SAP** *und* baut/betreibt als Practitioner
echte KI-Agenten — „SAP-Exec bei Tag, Agent Boss bei Nacht." Glaubwürdigkeit entsteht
über die Person, nicht über Zertifikate oder Kurs-Framing. Sekundär gestützt durch das
„Agent Boss"-Leadership-Modell (Vom Manager zum Agent Boss) und Done-for-you-Automation
(gebaut **und** laufend betrieben).

## Operating Context

- Einstieg fast immer über **LinkedIn** → Landing (Homepage) → Angebote → Strategie-Call.
- **Strategie-Call:** Calendly `https://calendly.com/robert85-weller/30min`.
- **Lead-Magnet:** Agent Boss Readiness Check (6-Fragen-Quiz → Level Assistant/Agent/
  Agent Boss → E-Mail → On-Page Mini-Guide „Vom Assistant zum Agent Boss" + PDF-Export).
  Auto-Popup nach 12 s (1×/Session) + Hero-Link.
- **Formulare:** Netlify Forms (`readiness-check`, `skool-waitlist`) — greifen nur live.

## Capabilities and Constraints

Drei gleichwertige Offerings (keine Kurse, keine Preis-Pakete):
1. **Beratung & Guidance**
2. **Skool Community** (aktuell nur Warteliste; Community noch nicht gebaut)
3. **Done-for-you Automation** — Langdock + Claude Agents, n8n/Make Workflows, betrieben.

Technisch: **eine einzige `index.html`** (~230 KB), reines HTML/CSS/JS, **kein Build,
kein Framework**. SPA-artig via `showPage(id)`. **Zweisprachig DE/EN** (`setLang`,
i18n-Objekt + `data-de`/`data-en`). Auto-Deploy: `git push` auf `main` → Netlify live
auf https://www.agent-boss-academy.com.

Terminologie: „Agent Boss", „Agent Boss Leader", „Frontier Firm/Unit", „Anwendungsfelder"
(nicht „Kurse").

**Verboten (bewusst entfernt, nie wieder einbauen):** Academy-/Kurs-/Zertifikat-Framing
(Hochschulzertifikat, WHU, „8–12 Wochen", „Woche 01–08", „Capstone", „Teilnehmer",
„Learning Journey", Preis-Pakete).

## Brand Commitments

- Name/Marke: **Agent Boss Academy** / Robert Weller als *Agent Boss Leader*.
- **Tonfall:** „du" (Homepage; einige Subpages noch „Sie" — Angleichung offen).
- **Design-System v2 „Editorial"** ist verbindlich: Premium-Beratung-Editorial, bewusst
  **anti-„KI-Look"**. EIN Akzent (Deep Amber `#B6541F`), Fraunces (Display, Highlight =
  kursiv+amber) + Hanken Grotesk (Body), Hairline-Grids, viel Whitespace, 01/02/03-Index-
  Ziffern, EIN dunkler Ink-CTA-Block pro Seite. Keine Emoji-Icons, Glow-Blobs, Grid-Masken,
  Puls-Badges. (Doku: Second Brain, Design System Editorial v2.)
- Impressum: Robert Weller, Theodor-Heuss-Str. 31, 69226 Nußloch.

## Evidence on Hand

**Real und nutzbar:**
- Roberts **SAP-Rolle** (VP & Global Content Officer, SAP) und öffentliches
  **LinkedIn-Profil** (`linkedin.com/in/robertweller-info/`) — primärer Vertrauensbeleg.
- Tool-/Tech-Stack „Womit wir automatisieren": Microsoft AI, Langdock, n8n, Make, Claude,
  Second Brain (Mountanridge = zukünftig).
- Der Readiness-Check + Mini-Guide ist ein echtes, funktionierendes Asset.
- Fotos: `assets/robert-Profil.jpeg`, `assets/robert-transformation.jpeg`.

**Nicht vorhanden — NICHT erfinden:** Kunden-Testimonials, Kundenlogos, Referenz-Cases,
Zahlen/Benchmarks. Team-Sektion „Sarah Krüger" & „Markus Hoffmann" sind **Platzhalter**
(nicht real).

## Product Principles

1. **Person-first, dann Angebot.** Vertrauen kommt über Robert; die drei Offerings sind
   gleichwertig, kein „Kurs-Trichter".
2. **Anti-KI-Look als Haltung.** Editorial-Handwerk statt generischer AI-Aesthetik ist Teil
   der Botschaft (er kann KI, ohne wie KI auszusehen).
3. **Nie wieder Academy/Kurs/Zertifikat-Framing.**
4. **Ehrlich bleiben.** Keine erfundenen Kunden, Zahlen oder Belege; nur reale Assets.
5. **Ein klarer Pfad pro Seite** → Strategie-Call / Readiness-Check / Warteliste.
