# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Reines statisches HTML/CSS/JS in **einer Datei** (`index.html`, ~230 KB) — kein Build,
kein Framework (kein React/Next.js/Tailwind). Alles inline: `<style>` + `<script>` +
Markup. Auto-Deploy: jeder `git push` auf `main` → Netlify live auf
`https://www.agent-boss-academy.com`.

## Users

Primär **Führungskräfte und Manager** (oft aus dem LinkedIn-Umfeld von Robert Weller),
die ihre Organisation bzw. sich selbst von der „alten" Manager-Welt in die
**„Agent-Boss"-Welt** überführen wollen: Menschen führen KI-Agenten und Automationen,
statt nur Menschen zu managen. Sekundär: Fach-/Team-Leiter in Sales, Finance und HR,
die konkrete Automations-Use-Cases suchen.

## Product Purpose

Persönliche Brand- und Lead-Gen-Website von **Robert Weller** als *Agent Boss Leader*.
Sie führt Besucher von LinkedIn auf drei gleichwertige Angebote und von dort in einen
**Strategie-Call** (Calendly). Erfolg = qualifizierte Leads: Strategie-Call gebucht,
Skool-Warteliste eingetragen oder Readiness-Check + E-Mail abgeschlossen.

## Positioning

**Person-first**, nicht kurs-first. Kein Academy-/Zertifikat-Framing (bewusst komplett
entfernt: keine Hochschulzertifikate, keine „8–12 Wochen", keine Wochen-Module, keine
Preis-Pakete). Stattdessen ein praktizierender Leader, der real mit einem konkreten
Tool-Stack automatiert und drei Wege anbietet, mit ihm zu arbeiten.

## Offerings

Drei **gleichwertige** Angebote (keine Hierarchie, keine Kurse):

1. **Beratung & Guidance** — persönliche Begleitung auf dem Weg zum Agent Boss.
2. **Skool Community** — derzeit **Warteliste** (`skool-waitlist`), noch nicht gebaut.
3. **Done-for-you Automation** — betriebene Automationen: Langdock + Claude Agents,
   n8n-/Make-Workflows.

**Sales / Finance / HR** sind **Anwendungsfelder (Use-Cases)**, keine Kursmodule.

## Workflows

- **Navigation:** SPA-artig über `showPage(id)` zwischen Home, Sales, Finance, HR,
  Impressum (`.page`, jeweils eine `.active`).
- **Lead-Magnet „Agent Boss Readiness Check":** 6-Fragen-Quiz → Level
  Assistant / Agent / Agent Boss → E-Mail → On-Page Mini-Guide „Vom Assistant zum
  Agent Boss" (ACTION®, Frontier Firm, EU AI Act, Tooling) + „Als PDF speichern".
  Auto-Popup nach 12 s (1×/Session) + Hero-Link `#h-rc`.
- **Conversion:** überall Strategie-Call via Calendly
  `https://calendly.com/robert85-weller/30min`.

## Terminology

„Agent Boss" (Rolle), „Vom Manager zum Agent Boss" (Kern-Narrativ, Hero-Infografik
alte vs. neue Welt), „Readiness Check", „Frontier Firm", „ACTION®".

## Constraints & Facts to preserve

- **Niemals** Academy-/Kurs-/Zertifikat-Framing wieder einbauen (WHU, „Capstone",
  „Teilnehmer", „Learning Journey", Preis-Pakete). Bewusst entfernt.
- **Nur EIN Akzent** (Deep Amber), kein Blau/Grün.
- Design bewusst **anti-„KI-Look"** (Editorial v2).
- Zweisprachig **DE/EN** (`setLang`, `i18n`-Objekt + `data-de`/`data-en`).
- Tonfall Homepage = **„du"**; einige Subpages noch „Sie" (offen, anzugleichen).

## Voice

Direkt, praxisnah, führungsstark. Homepage duzt. Kein Hype-KI-Vokabular, kein
Buzzword-Stapeln — Autorität durch konkrete Tools und reale Use-Cases.

## Assets & Brand

- Akzentfarbe Deep Amber `#B6541F`; Fonts Fraunces + Hanken Grotesk (lokal gehostet,
  DSGVO-konform, kein Google-IP-Transfer).
- Avatar `assets/robert-avatar.jpg`.
- Trust-Bar „Womit wir automatisieren": Microsoft AI Portfolio · Langdock · n8n ·
  Make · Claude · Second Brain · Mountanridge (zukünftig).

## Legal / Accessibility

- **Impressum + Datenschutzerklärung** live (eRecht24, abmahngeschützt, zweisprachig).
  Inhaber: Robert Weller, Theodor-Heuss-Str. 31, 69226 Nußloch.
- Netlify Forms: `readiness-check` + `skool-waitlist` (greifen nur live).
- Accessibility offen: mehrere WCAG-AA-Kontrast-Punkte (v. a. Amber auf Paper und ein
  alter Dark-Theme-Restwert `#8B90A4`) — siehe DESIGN.md / erste Detector-Pässe.

## Open decisions

- Skool-Community-Seite noch nicht gebaut (nur Warteliste live).
- Team-Sektion: „Sarah Krüger" & „Markus Hoffmann" sind **Platzhalter** (nicht real).
- n8n-Flow für Readiness-Leads (Netlify Forms → Second Brain / Tabelle + Notify): TODO.
- Ton „du" vs. „Sie" auf Subpages angleichen.
