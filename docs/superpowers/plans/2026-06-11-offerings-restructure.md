# Offerings-Restructure Implementation Plan

> **For agentic workers:** Static HTML site, no test runner. "Verification" = grep checks + manual browser check (open `index.html`, toggle DE/EN, inspect the section). All edits in one file: `index.html`. Bilingual: every text node has an `id`; `setLang(lang)` (Z. 1621+) writes text from the `i18n` object (`de:` 1305–1468, `en:` 1469–1616). New text content requires THREE coordinated edits: (1) HTML element with `id`, (2) `s()`/`st()` call in `setLang`, (3) key in BOTH `i18n.de` and `i18n.en`.

**Goal:** Reposition the site from a department/academy course model to a person-first model with three equal offerings (Beratung, Skool-Community-Waitlist, Done-for-you), fill the Impressum, and retire the academy claim.

**Architecture:** Single `index.html` (~1900 lines), no build tools, Netlify auto-deploy from `main`. Bilingual via JS `setLang`. Calendly CTA (`https://calendly.com/robert85-weller/30min`) already wired everywhere.

**Tech Stack:** HTML/CSS/JS, Netlify (+ Netlify Forms for the waitlist).

**Execution mode:** Batch ("in einem Rutsch"), review at the end. Commit per task.

---

## Task 1: Impressum-Daten füllen

**Files:** Modify `index.html` (Impressum block ~1239–1271)

Replace placeholders with real data (appears at BOTH § 5 TMG and § 55 RStV address blocks):
- `<span class="placeholder">[STRASSE &amp; HAUSNUMMER]</span>` → `Theodor-Heuss-Str. 31`
- `<span class="placeholder">[PLZ &amp; ORT]</span>` → `69226 Nußloch`
- `<span class="placeholder">[TELEFONNUMMER]</span>` → `015120565890`
- `Stand: Mai 2026` → `Stand: Juni 2026`

E-Mail bleibt `robert85.weller@googlemail.com`.

- [ ] **Verify:** `grep -c 'class="placeholder"' index.html` → expect `0`. `grep -n "Theodor-Heuss" index.html` → expect 2 hits.
- [ ] **Commit:** `git add index.html && git commit -m "feat: fill Impressum with real contact data"`

---

## Task 2: Academy-Claim → Skool-Community-Approach (Footer + Branding)

**Files:** Modify `index.html`

The phrase "Hochschulzertifiziertes Programm" appears in: homepage footer default (Z. 655), impressum footer (Z. 1276), and the `footerCopy` i18n keys (de + en). The hero badge (Z. 505) carries the same academy framing.

1. **Homepage footer (Z. 655):** `© 2026 Agent Boss Academy · Hochschulzertifiziertes Programm` → `© 2026 Agent Boss Academy · Agent-Boss-Community über Skool`
2. **Impressum footer (Z. 1276):** same replacement.
3. **i18n `footerCopy` (de, ~1305–1468):** find `footerCopy:` in de block → `'© 2026 Agent Boss Academy · Agent-Boss-Community über Skool'`
4. **i18n `footerCopy` (en, ~1469–1616):** → `'© 2026 Agent Boss Academy · Agent Boss community on Skool'`

- [ ] **Verify:** `grep -c "Hochschulzertifiziertes Programm" index.html` → expect `0`.
- [ ] **Commit:** `git commit -am "feat: replace academy claim with Skool community approach in footer/branding"`

---

## Task 3: Hero person-first repositionieren

**Files:** Modify `index.html` HTML defaults (Z. 505–512) + i18n keys (de + en) used at Z. 1644–1648.

Keys touched: `heroBadge`, `heroH1a/heroH1b/heroH1c`, `heroSub`, `heroFn`, `heroCta2`. (`heroCta1` stays = Calendly button; `heroH1b` is the highlighted span.)

**HTML defaults (Z. 505–512) — set to the German strings below.** **i18n de/en — set the same keys.**

| Key | DE | EN |
|-----|----|----|
| heroBadge | `Robert Weller · Agent Boss Leader` | `Robert Weller · Agent Boss Leader` |
| heroH1a | `Werde zum ` | `Become the ` |
| heroH1b | `Agent Boss` | `Agent Boss` |
| heroH1c | ` in deinem Bereich.` | ` in your domain.` |
| heroSub | `Du hast mich auf LinkedIn als Agent Boss Leader gefunden. Hier sind die drei Wege, wie wir gemeinsam deine Agent-Boss-Journey aufbauen — von Beratung über die Community bis zur fertig betriebenen Automatisierung.` | `You found me on LinkedIn as an Agent Boss Leader. Here are the three ways we build your Agent Boss journey together — from advisory, to community, to fully managed automation.` |
| heroCta2 | `Die 3 Wege ansehen` | `See the 3 paths` |
| heroFn | `Praktiker statt Theorie — echte AI-Agents live in Produktion.` | `Practitioner, not theory — real AI agents live in production.` |

Update `heroCta2`'s onclick target (Z. 510): `goHomeSection('programmes')` → `goHomeSection('offerings')` (the new section from Task 4).

- [ ] **Verify:** Browser → home hero reads person-first in DE and EN.
- [ ] **Commit:** `git commit -am "feat: person-first hero repositioning"`

---

## Task 4: Neue Sektion "Drei Wege" (3 Offerings)

**Files:** Modify `index.html` — insert new `<section>` after the trust-bar (after Z. 543, before `programs` at 545); add CSS in the `<style>` block; add `setLang` wiring (after Z. 1648); add i18n keys (de + en).

### 4a. HTML (insert after line 543)
```html
  <section class="offerings" id="offerings">
    <div class="programs-header fade-in">
      <div class="section-label" id="off-label">Zusammenarbeit</div>
      <h2 class="section-headline" id="off-h2">Drei Wege, mit mir zu arbeiten</h2>
      <p id="off-sub" style="font-size:18px;color:var(--text-muted);font-weight:300;line-height:1.6;">Gleichwertig – je nachdem, wie viel du selbst bauen willst und wie viel wir für dich übernehmen.</p>
    </div>
    <div class="offerings-grid">
      <div class="offering-card fade-in">
        <div class="offering-icon">🧭</div>
        <h3 class="offering-title" id="off1-title">Beratung &amp; Guidance</h3>
        <p class="offering-desc" id="off1-desc">Frameworks, Sparring und konkrete Hilfe beim Aufbau deiner eigenen Agent-Boss-Journey – strategisch und umsetzungsnah.</p>
        <a href="https://calendly.com/robert85-weller/30min" target="_blank" rel="noopener" class="btn-primary" id="off1-cta" style="width:100%;text-align:center;display:block;">Strategie-Call buchen</a>
      </div>
      <div class="offering-card fade-in">
        <span class="offering-badge" id="off2-badge">Bald verfügbar</span>
        <div class="offering-icon">👥</div>
        <h3 class="offering-title" id="off2-title">Skool Community</h3>
        <p class="offering-desc" id="off2-desc">Lerne in der Community, equippe dich mit Playbooks und tausche dich im Exchange mit anderen Agent Bosses aus.</p>
        <button class="btn-secondary" id="off2-cta" onclick="openWaitlist()" style="width:100%;text-align:center;display:block;">Auf die Warteliste</button>
      </div>
      <div class="offering-card fade-in">
        <div class="offering-icon">⚙️</div>
        <h3 class="offering-title" id="off3-title">Done-for-you Automation</h3>
        <p class="offering-desc" id="off3-desc">Wir bauen deine AI-Agents (Langdock + Claude) und Workflows (n8n) – und betreiben sie laufend für dich.</p>
        <a href="https://calendly.com/robert85-weller/30min" target="_blank" rel="noopener" class="btn-primary" id="off3-cta" style="width:100%;text-align:center;display:block;">Strategie-Call buchen</a>
      </div>
    </div>
  </section>
```

### 4b. CSS (add near the `.program-card` rules, reuse design tokens)
```css
  .offerings { padding:90px 60px; max-width:1200px; margin:0 auto; }
  .offerings-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .offering-card { position:relative; background:var(--dark-2); border:1px solid var(--border); border-radius:12px; padding:40px 32px; display:flex; flex-direction:column; transition:all .3s; }
  .offering-card:hover { border-color:rgba(245,98,30,.3); transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,.3); }
  .offering-icon { font-size:32px; margin-bottom:20px; }
  .offering-title { font-family:'DM Serif Display',serif; font-size:24px; color:var(--white); margin-bottom:14px; line-height:1.2; }
  .offering-desc { font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:28px; flex:1; }
  .offering-badge { position:absolute; top:-12px; right:24px; background:var(--orange); color:var(--white); font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:5px 14px; border-radius:100px; }
```
Add to the existing mobile media query (Z. ~446 where `.pricing-grid` collapses): append `,.offerings-grid` so it becomes `grid-template-columns:1fr` on mobile.

### 4c. setLang wiring (add after Z. 1648)
```javascript
    s('off-label', t.offLabel); s('off-h2', t.offH2); st('off-sub', t.offSub);
    st('off1-title', t.off1Title); st('off1-desc', t.off1Desc); st('off1-cta', t.off1Cta);
    st('off2-badge', t.off2Badge); st('off2-title', t.off2Title); st('off2-desc', t.off2Desc); st('off2-cta', t.off2Cta);
    st('off3-title', t.off3Title); st('off3-desc', t.off3Desc); st('off3-cta', t.off3Cta);
```

### 4d. i18n keys
**Add to `i18n.de` (inside 1305–1468):**
```javascript
    offLabel: 'Zusammenarbeit', offH2: 'Drei Wege, mit mir zu arbeiten',
    offSub: 'Gleichwertig – je nachdem, wie viel du selbst bauen willst und wie viel wir für dich übernehmen.',
    off1Title: 'Beratung & Guidance', off1Desc: 'Frameworks, Sparring und konkrete Hilfe beim Aufbau deiner eigenen Agent-Boss-Journey – strategisch und umsetzungsnah.', off1Cta: 'Strategie-Call buchen',
    off2Badge: 'Bald verfügbar', off2Title: 'Skool Community', off2Desc: 'Lerne in der Community, equippe dich mit Playbooks und tausche dich im Exchange mit anderen Agent Bosses aus.', off2Cta: 'Auf die Warteliste',
    off3Title: 'Done-for-you Automation', off3Desc: 'Wir bauen deine AI-Agents (Langdock + Claude) und Workflows (n8n) – und betreiben sie laufend für dich.', off3Cta: 'Strategie-Call buchen',
```
**Add to `i18n.en` (inside 1469–1616):**
```javascript
    offLabel: 'Work with me', offH2: 'Three ways to work with me',
    offSub: 'All equal – depending on how much you want to build yourself and how much we take off your plate.',
    off1Title: 'Advisory & Guidance', off1Desc: 'Frameworks, sparring and hands-on help building your own Agent Boss journey – strategic and execution-focused.', off1Cta: 'Book a strategy call',
    off2Badge: 'Coming soon', off2Title: 'Skool Community', off2Desc: 'Learn in the community, equip yourself with playbooks and exchange with other Agent Bosses.', off2Cta: 'Join the waitlist',
    off3Title: 'Done-for-you Automation', off3Desc: 'We build your AI agents (Langdock + Claude) and workflows (n8n) – and run them for you on an ongoing basis.', off3Cta: 'Book a strategy call',
```

- [ ] **Verify:** Browser → new "Drei Wege" section with 3 cards renders between trust-bar and Anwendungsfelder; DE/EN toggle works; card 2 shows "Bald verfügbar" badge.
- [ ] **Commit:** `git commit -am "feat: add 3-offerings section (Beratung, Skool, Done-for-you)"`

---

## Task 5: "Programme" → "Anwendungsfelder" umtexten

**Files:** Modify `index.html` HTML defaults (Z. 547–571) + i18n keys at Z. 1650–1653.

The Sales/Finance/HR cards stay (still link to subpages) but are reframed from "courses" to "application areas". Keys: `progLabel`, `progH2`, `progSub`, `prog*Tag/Title/Desc/Link`.

| Key | DE | EN |
|-----|----|----|
| progLabel | `Anwendungsfelder` | `Use cases` |
| progH2 | `Wo Agent-Boss-Arbeit wirkt` | `Where Agent Boss work pays off` |
| progSub | `Dieselben drei Wege – angewendet auf die Bereiche, in denen ich am meisten helfe.` | `The same three paths – applied to the areas where I help most.` |
| progSalesLink | `Use-Cases in Sales →` | `Use cases in Sales →` |
| progFinLink | `Use-Cases in Finance →` | `Use cases in Finance →` |
| progHRLink | `Use-Cases in HR →` | `Use cases in HR →` |

Card titles/descriptions keep their substance (they describe the domain) — only the nav label `nav` keys (`navProg`→ keep "Programme"/"Programs"? change to "Anwendungsfelder"/"Use cases"). Update `mnavProg`, `navProg`/`progLabel` nav usage and the nav link text (Z. 467 `data-de="Programme" data-en="Programs"` → `data-de="Anwendungsfelder" data-en="Use cases"`; mobile nav Z. 488 default text). Keep onclick `goHomeSection('programmes')`.

- [ ] **Verify:** Browser → section reads "Anwendungsfelder / Wo Agent-Boss-Arbeit wirkt"; nav label updated; links say "Use-Cases in …".
- [ ] **Commit:** `git commit -am "feat: reframe programs section as application areas"`

---

## Task 6: Pricing-/Paket-Sektionen aus Sales/Finance/HR entfernen

**Files:** Modify `index.html` — remove 3 pricing sections + their `setLang` lines.

Pricing sections (locate exact bounds by the `<!-- PRICING -->` comment / `*-pricing` class just before each FAQ):
- **Sales:** `<!-- PRICING -->` Z. 757 → `</section>` Z. 810.
- **Finance:** `.fin-pricing` section (~949 → ~1001, ends right before the reused `sales-faq` at 1003).
- **HR:** the HR pricing section (between HR results and HR FAQ at 1186 — `grep -n "hrprice\|hr-pricing\|hpk" index.html` to confirm bounds).

For EACH removed section, replace with a compact CTA block pointing to the offerings + Calendly:
```html
  <!-- OFFERINGS POINTER (replaces former pricing) -->
  <section class="sales-pricing" style="text-align:center;">
    <div class="sales-pricing-header fade-in" style="margin:0 auto;max-width:640px;">
      <div class="section-label">Zusammenarbeit</div>
      <h2 class="section-headline">So arbeiten wir hier zusammen</h2>
      <p style="font-size:17px;color:var(--text-muted);font-weight:300;line-height:1.6;margin:18px 0 32px;">Beratung, Community oder fertig betriebene Automatisierung – wir finden im Strategie-Call den passenden Weg für deinen Bereich.</p>
      <a href="https://calendly.com/robert85-weller/30min" target="_blank" rel="noopener" class="btn-primary">Strategie-Call buchen</a>
    </div>
  </section>
```
(Reuse the page-appropriate wrapper class: `sales-pricing` / `fin-pricing` / matching HR class so spacing stays consistent.)

Then remove the now-dangling `setLang` lines for the deleted ids: Sales pricing block Z. 1700–1707; Finance pricing Z. 1734–1738; HR pricing Z. 1764 (+ any `fpk*`/`hpk*` lines). Leave the orphaned `i18n` keys (harmless — `s()`/`st()` are guarded by `if (el)`), or delete them if trivially adjacent. Do NOT remove keys still referenced elsewhere.

- [ ] **Verify:** `grep -c "pricing-card" index.html` → expect `0`. Browser → no concrete prices (6.900/38.000/5.900) appear on any subpage; each subpage shows the CTA pointer instead. No JS console errors on load or DE/EN toggle.
- [ ] **Commit:** `git commit -am "feat: remove course pricing packages from Sales/Finance/HR, point to offerings"`

---

## Task 7: Department-Seiten von "Kurs/Wochen" entschärfen (leichter Touch)

**Files:** Modify `index.html` — hero tags + course-y phrasing on the 3 subpages. HTML defaults + i18n.

Targeted de-course-ification (NOT a full rewrite — deeper use-case storytelling is a follow-up that needs real use-cases from Robert):
1. Hero tags (`salesTag` ~Z.1681 / `finTag` / `hrTag`): `Sales · Hochschulzertifiziert · 8–12 Wochen` → `Sales · Anwendungsfeld` (and EN `Sales · Use case`); same pattern for Finance/HR.
2. Hero subs: remove `hochschulzertifizierten` → just `Agent Boss Leader` (keys `salesSub`/`finSub`/`hrSub`, HTML Z. 507-equiv on each subpage hero).
3. Secondary hero CTA label `Programm-PDF herunterladen` (`salesCta2`/`finCta2`/`hrCta2`, Z. 678/875/…): → `Die 3 Wege ansehen`, and point its href to Calendly (or onclick `showPage('home')` then `goHomeSection('offerings')`). Pick the Calendly link to stay consistent and avoid cross-page scroll complexity.
4. Breadcrumb "Programme" segment (Z. 1052 etc.) → "Anwendungsfelder" (`*BreadProg` keys if present; otherwise static text).

Leave the "Wochen"/curriculum blocks structurally intact for now (flagged as follow-up).

- [ ] **Verify:** `grep -c "hochschulzertifizierten\|8–12 Wochen" index.html` → expect `0`. Browser → subpage heroes read as use-case framing.
- [ ] **Commit:** `git commit -am "feat: de-emphasize course framing on department subpages"`

---

## Task 8: Skool-Waitlist (Netlify Forms)

**Files:** Modify `index.html` — add a hidden Netlify detection form + a waitlist modal + `openWaitlist()` JS. Do NOT touch the existing Brevo popup (belongs to another test).

### 8a. Netlify form detection (add just inside `<body>`, hidden)
```html
<form name="skool-waitlist" data-netlify="true" netlify-honeypot="bot-field" hidden>
  <input type="email" name="email" />
  <input type="text" name="name" />
</form>
```

### 8b. Waitlist modal (reuse `.popup-overlay`/`.popup` styles; add near the existing popup markup)
```html
<div class="popup-overlay" id="waitlist-popup">
  <div class="popup">
    <button class="popup-close" onclick="document.getElementById('waitlist-popup').classList.remove('active')">✕</button>
    <div class="popup-badge" id="wl-badge">Early Access</div>
    <h3 id="wl-h3">Skool Community – Warteliste</h3>
    <p id="wl-p">Trag dich ein und sei dabei, sobald die Community öffnet.</p>
    <form name="skool-waitlist" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/?waitlist=success" class="popup-form">
      <input type="hidden" name="form-name" value="skool-waitlist">
      <p hidden><input name="bot-field"></p>
      <input type="text" name="name" id="wl-name" placeholder="Dein Name" required>
      <input type="email" name="email" id="wl-email" placeholder="Deine E-Mail" required>
      <button type="submit" class="btn-primary" id="wl-btn" style="width:100%;">Auf die Warteliste</button>
    </form>
  </div>
</div>
```

### 8c. JS
```javascript
  function openWaitlist() { document.getElementById('waitlist-popup').classList.add('active'); }
  // On load: if URL has ?waitlist=success, show a thank-you state
  if (location.search.indexOf('waitlist=success') !== -1) {
    const p = document.getElementById('wl-p'); if (p) p.textContent = 'Danke! Du stehst auf der Warteliste. ✅';
  }
```

### 8d. i18n (add keys `wlBadge/wlH3/wlP/wlName/wlEmail/wlBtn` to de + en, wire in setLang like the existing popup block)
DE: `wlBadge:'Early Access'`, `wlH3:'Skool Community – Warteliste'`, `wlP:'Trag dich ein und sei dabei, sobald die Community öffnet.'`, `wlBtn:'Auf die Warteliste'`.
EN: `wlBadge:'Early access'`, `wlH3:'Skool Community – Waitlist'`, `wlP:'Sign up and be first in when the community opens.'`, `wlBtn:'Join the waitlist'`.

- [ ] **Verify:** Browser → clicking "Auf die Warteliste" (offering card 2) opens the modal; form has name+email. (Actual submission only works after Netlify deploy — note for live test.)
- [ ] **Commit:** `git commit -am "feat: add Skool waitlist modal via Netlify Forms"`

---

## Final Review (Task 9)

- [ ] `grep -nE "Hochschulzertifiziertes Programm|pricing-card|class=\"placeholder\"|8–12 Wochen|hochschulzertifizierten" index.html` → expect no hits.
- [ ] Open `index.html` in browser: home (hero → offerings → Anwendungsfelder → social proof → CTA), toggle DE/EN on every section, click each subpage, open waitlist modal, open Impressum. No console errors.
- [ ] Present full diff to Robert for review.

---

## Offene Folge-Themen (nicht in diesem Plan)
- Tiefere Use-Case-Texte je Department (braucht echte Use-Cases von Robert).
- "Wochen"/Curriculum-Blöcke auf Subpages vollständig auf Use-Cases umschreiben.
- Team-Platzhalter (Sarah Krüger / Markus Hoffmann) ersetzen.
- Datenschutzerklärung.
- Live-Test der Netlify-Form-Zustellung nach Deploy.
