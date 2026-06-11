# Design Spec: Neustrukturierung Offerings + Impressum

**Datum:** 2026-06-11
**Projekt:** Agent Boss Academy Website (`index.html`, statisches HTML/CSS/JS auf Netlify)
**Status:** Genehmigt durch Robert Weller (Brainstorming)

---

## 1. Ziel & Kontext

Die Website ist aktuell vollständig um eine **hochschulzertifizierte Ausbildung**
gebaut (vom Abteilungsleiter zum zertifizierten „Agent Boss Leader") mit drei
Schulungs-Paketen je Department (Sales / Finance / HR).

Das entspricht **nicht mehr** dem realen Geschäft. Die Ausbildung wandert auf eine
**Skool-Community** (noch nicht fertig). Das aktuelle Geschäft mit LinkedIn-Leads
besteht aus **drei gleichwertigen Wegen**, mit Robert zusammenzuarbeiten.

**Repositionierung:** Vom **Department-Modell** (Sales/Finance/HR als Kurse) zum
**Personen- + Offering-Modell**: Erst lernt der Lead Robert als *Agent Boss Leader*
kennen, dann wählt er eines von drei gleichwertigen Offerings.

---

## 2. Die drei Offerings (gleichwertig)

| # | Offering | Inhalt | Status | CTA |
|---|----------|--------|--------|-----|
| 1 | **Beratung & Guidance** | Frameworks, Hilfe, Unterstützung beim Aufbau der eigenen Agent-Boss-Journey | live | Strategie-Call buchen |
| 2 | **Skool Community** | Learnings, sich selbst equippen, Exchange mit anderen | **noch nicht live** | Auf die Warteliste (Early Access) + „Bald verfügbar"-Badge |
| 3 | **Done-for-you Automation** | Agents bauen (Langdock + Claude) & Workflows bauen (n8n) — und **für den Kunden betreiben** | live | Strategie-Call buchen |

**Keine Preise** auf der Seite. Beratung & Done-for-you laufen über den Strategie-Call.
Community läuft über die Warteliste.

---

## 3. Startseiten-Aufbau (neue Reihenfolge)

1. **Hero — „Robert Weller, Agent Boss Leader"**
   - Person zuerst. Aufhänger sinngemäß: „Du hast mich auf LinkedIn gefunden — so können wir zusammenarbeiten."
   - Trust-Logos (Microsoft, Langdock, WHU) bleiben.
   - Primärer CTA: **Strategie-Call buchen**.
   - Bestehende animierte Chat-Demo im Hero bleibt erhalten.
2. **Wer ich bin / Warum ich** — verdichtet aus bestehender „Warum wir"-Sektion + Team-Block (Robert). Hochschulzertifizierung/WHU wird hier zum **persönlichen Credibility-Merkmal**, nicht zum Produkt.
3. **Die 3 Offerings** — Herzstück, drei gleichwertige Karten (siehe §2).
4. **Anwendungsfelder: Sales · Finance · HR** — als Use-Case-Bereiche („Wo ich helfe"), je ein kurzer Block, der in die bestehenden Unterseiten führt. NICHT mehr als Kurse.
5. **Social Proof** — Testimonials + Ergebnisse (bestehend, bleibt).
6. **Final CTA** — Strategie-Call buchen.
7. **Footer + Impressum-Link** — Academy-Claim **„Hochschulzertifiziertes Programm" wird zum Community-Approach über Skool** (z. B. „Community-getriebener Agent-Boss-Approach via Skool"). Überall ersetzen, wo der alte Claim auftaucht (Footer Home + Impressum-Footer, Copyright-Zeile).

---

## 4. Sales / Finance / HR Unterseiten

Bleiben technisch erhalten, werden aber **umgedeutet**:

- Held nicht mehr „Kurs in X Wochen", sondern „So sieht Agent-Boss-Arbeit in Sales/Finance/HR aus" (Use-Cases).
- **Preis-/Paket-Sektionen entfernen** (`.sales-pricing`, `.fin-pricing` + HR-Pendant mit den Paketen 6.900 € / 38.000 € / 5.900 €/Mo). Ersetzen durch Verweis auf die 3 Offerings + Strategie-Call-CTA.
- Curriculum-/„Wochen"-Logik → umdeuten zu „typische Use-Cases / was wir automatisieren". (Reine Umtextung der bestehenden Blöcke, keine neue Mechanik.)
- „Stufen"-Sektionen mit „Managed Second Brain + Agent Service" passen bereits gut zum Done-for-you-Gedanken → beibehalten, ggf. leicht umtexten.

---

## 5. Impressum

Bestehender Block (`#page-impressum`) — Platzhalter mit echten Daten füllen:

- `[STRASSE & HAUSNUMMER]` → **Theodor-Heuss-Str. 31** (an beiden Stellen: § 5 TMG und § 55 RStV)
- `[PLZ & ORT]` → **69226 Nußloch** (an beiden Stellen)
- `[TELEFONNUMMER]` → **015120565890**
- E-Mail bleibt: `robert85.weller@googlemail.com`
- „Stand: Mai 2026" → auf aktuelles Datum aktualisieren.

---

## 6. Technik

Statisches HTML, keine Build-Tools, alles in `index.html`. Zweisprachig (DE/EN) bleibt erhalten.

### Strategie-Call
- CTA-Buttons (Hero, Offerings 1 & 3, Final-CTA, Floating-CTA) verlinken auf:
  **`https://calendly.com/robert85-weller/30min`**
- In neuem Tab öffnen (`target="_blank" rel="noopener"`).

### Person / LinkedIn
- LinkedIn-Profil-URL für Hero/Person-Bezug: **`https://www.linkedin.com/in/robertweller-info/`**

### Skool-Waitlist (Offering 2)
- Gewählt: **Netlify Forms** (E-Mails im Netlify-Dashboard, kein externes Tool).
- **Wichtig:** Das bestehende **Brevo-E-Mail-Popup** (`submitBrevoForm`) gehört zu einem anderen Test und wird **NICHT** wiederverwendet — unangetastet lassen. Die Warteliste bekommt ein eigenes Netlify-Forms-Formular.
- „Bald verfügbar"-Badge auf der Community-Karte.

---

## 7. Scope-Abgrenzung (YAGNI)

**In Scope:**
- Startseite neu strukturieren (Reihenfolge + 3 Offerings + Anwendungsfelder-Umdeutung).
- Schulungs-Pakete von allen Department-Seiten entfernen.
- Department-Seiten-Texte von „Kurs" auf „Use-Case" umdeuten (Umtextung, keine neue Mechanik).
- Impressum-Daten füllen.
- Academy-Sprache im Footer/Branding anpassen.
- Strategie-Call-Verlinkung (Calendly) überall.
- Skool-Waitlist-Mechanik.

**Out of Scope (später):**
- Skool-Community selbst aufbauen (Classrooms etc.).
- Datenschutzerklärung (separater Schritt aus status.md).
- Team-Platzhalter (Sarah Krüger / Markus Hoffmann) durch echte Personen ersetzen.
- Neue Hero-Chat-Szenarien für Finance/HR.

---

## 8. Offene Datenpunkte (von Robert)

- Keine offen. Alle benötigten Daten liegen vor (Calendly, LinkedIn, Impressum-Adresse, Telefon `015120565890`, Waitlist-Tool).
