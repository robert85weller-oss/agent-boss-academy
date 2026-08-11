---
name: Agent Boss Academy
description: Premium-Beratung-Editorial — bewusst anti-„KI-Look", ein einziger Amber-Akzent
colors:
  paper: "#F4F1EA"
  paper-2: "#EDE8DD"
  paper-card: "#FBF9F4"
  ink: "#16140F"
  ink-soft: "#423D33"
  ink-mute: "#6B6557"
  amber: "#B6541F"
  amber-deep: "#913F14"
  amber-light: "#E08A4E"
  line: "rgba(22,20,15,0.14)"
  line-soft: "rgba(22,20,15,0.08)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  display-highlight:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 400
    textColor: "{colors.amber}"
    letterSpacing: "-0.01em"
  index-numeral:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 400
    letterSpacing: "normal"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
components:
  cta-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "16px 32px"
  accent-link:
    textColor: "{colors.amber}"
---

# Design System — Agent Boss Academy (Editorial v2)

Premium-Beratung-**Editorial**, bewusst **anti-„KI-Look"**. Die Tokens im Frontmatter
sind normativ; dieser Text erklärt, wie sie angewendet werden. Beim Bauen neuer
UI immer diesen Stil halten.

## Farben

Warme Papier-Palette auf hellem Grund. `body.theme-light` ist auf allen Seiten IMMER
gesetzt; alte Dark-Theme-Regeln existieren nur noch als harmlose Basis und werden
nicht mehr genutzt (Restwert `--text-muted: #8B90A4` ist toter Dark-Theme-Code und
sollte **nicht** auf hellem Grund verwendet werden — er verursacht Kontrastfehler).

- **Flächen:** Paper `#F4F1EA` (Grund), Paper-2 `#EDE8DD` (abgesetzte Bänder),
  Card `#FBF9F4` (Karten).
- **Text:** Ink `#16140F` (Standard), Ink-soft `#423D33` (Sekundär),
  Ink-mute `#6B6557` (Meta/Labels).
- **Akzent — nur EINER:** Deep Amber `#B6541F` (deep `#913F14` für Hover/Deko,
  light `#E08A4E` sparsam). **Kein Blau, kein Grün, kein zweiter Akzent.**
- **Hairlines:** `line` `rgba(22,20,15,.14)`, `line-soft` `rgba(22,20,15,.08)`.

### Kontrast (WCAG AA — offen)

Amber `#B6541F` auf Paper erreicht nur ~4.4:1 (Ziel 4.5:1 für Fließtext). Amber daher
für **großen** Text / Headlines / kurze Highlights verwenden, nicht für langen
Fließtext; für Body immer Ink/Ink-soft nehmen. `#8B90A4` (alter Dark-Rest) nie auf
Paper. Bei kritischem Fließtext ggf. `amber-deep` `#913F14` statt `amber`.

## Typografie

- **Display / Serife:** **Fraunces** — Headlines, Zitate, die 01/02/03-Index-Ziffern.
  **Highlight = Fraunces *kursiv* + Amber.**
- **Body:** **Hanken Grotesk** — Fließtext, UI, Buttons.
- Beide **lokal gehostet** (DSGVO — kein Google-IP-Transfer). Neue Fonts nicht von
  externen CDNs nachladen.
- Hierarchie sauber halten (keine Heading-Level überspringen); UI-Text nicht zu klein.

## Layout & Prinzipien

- **Hairline-Grids:** `gap:1px` auf `--line` (die 1-px-„Fugen" sind das Struktur-Motiv).
- Viel **Whitespace**, ruhige Editorial-Anmutung.
- **01/02/03-Index-Ziffern** (Fraunces kursiv) statt Icon-Bullets.
- **EIN** dunkler Ink-CTA-Block pro Seite (`cta-primary`: Ink-Grund, Paper-Text).
- SPA-Seiten via `showPage(id)`; zweisprachig via `setLang()` (`i18n` + `data-de`/`data-en`).

## Motion

Sparsam und zweckgebunden: Fade-Ins, Hover-Underlines. Keine Layout-Sprünge, kein
Bounce, kein Dauer-Puls.

## Absolute Bans (das macht den Anti-KI-Look aus)

- **Keine** Emoji-Icons.
- **Keine** Glow-/Blur-Schatten in Akzentfarbe (colored glow) — nur neutrale Elevation.
- **Keine** dekorativen Grid-/Linienraster-Backgrounds (codex-grid).
- **Keine** Glow-Blobs, Grid-Masken, Puls-Badges/„pulsing dots".
- **Keine** dicken farbigen Seitenkanten an Karten (`border-top: 3px` o. ä. „side-tab").
- **Kein** zweiter Akzent, keine Lila-/Blau-Verläufe.
- **Kein** Academy-/Zertifikat-Framing (inhaltlicher Ban, siehe PRODUCT.md).
