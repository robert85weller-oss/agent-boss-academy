# Umzug Netlify → Hostinger (Checkliste)

Code-Seite ist erledigt (Branch `claude/quirky-shannon-on537x`):
`form-handler.php` ersetzt Netlify Forms, `.htaccess` ersetzt `netlify.toml`,
Datenschutzerklärung nennt Hostinger als Hoster.

> **Wichtig:** Den Branch erst dann auf `main` mergen, wenn Hostinger bereit ist
> (Schritt 3). Solange die Domain noch auf Netlify zeigt, würden Formulare sonst ins Leere gehen
> (Netlify führt kein PHP aus).

## 1. Hostinger vorbereiten
1. Webhosting-Paket mit PHP (z. B. Premium/Business) → Website für `agent-boss-academy.com` anlegen.
2. **E-Mail-Postfach `kontakt@agent-boss-academy.com` muss existieren**: der Handler sendet von
   dieser Adresse. Liegt das Postfach woanders (z. B. Google Workspace), ist das okay, solange
   SPF den Hostinger-Versand erlaubt (Hostinger zeigt den nötigen SPF-Eintrag im hPanel → E-Mails).
3. `public_html` leeren (Hostinger legt eine `default.php` an, Git-Deploy braucht ein leeres Verzeichnis).

## 2. Git-Auto-Deploy einrichten
1. hPanel → **Erweitert → Git** → Repository `https://github.com/robert85weller-oss/agent-boss-academy.git`,
   Branch `main` (zum Testen vorher: `claude/quirky-shannon-on537x`), Verzeichnis leer lassen (= `public_html`).
2. Privates Repo: den im hPanel angezeigten SSH-Key als **Deploy Key** in GitHub hinterlegen
   (Repo → Settings → Deploy keys) und die SSH-URL `git@github.com:robert85weller-oss/agent-boss-academy.git` verwenden.
3. **Auto-Deployment** aktivieren → angezeigte Webhook-URL in GitHub eintragen
   (Repo → Settings → Webhooks → Add webhook, Content type `application/json`, Event „push“).

## 3. Testen (vor der DNS-Umstellung)
Über die temporäre Hostinger-URL (hPanel → Website-Vorschau):
- Seite, Unterseiten, DE/EN, Bilder, Fonts laden.
- Readiness-Check einmal durchspielen und Warteliste ausfüllen → Mail kommt an?
  CSV liegt unter `ab-leads/` (eine Ebene über `public_html`, im Dateimanager sichtbar).
- `/CLAUDE.MD`, `/docs/…`, `/.git/config` müssen **403** liefern.

Dann Branch auf `main` mergen (Git-Deploy auf `main` umstellen, falls zum Testen der Branch genutzt wurde).

## 4. Domain umziehen
**Vorher notieren**, welche DNS-Einträge aktuell existieren (vor allem **MX/SPF/DKIM für E-Mail**
und evtl. Verifizierungs-TXT für Google/Microsoft). Wer die Nameserver wechselt und diese Einträge
nicht übernimmt, verliert den E-Mail-Empfang.

- **Variante A – Nameserver auf Hostinger** (beim Registrar `ns1.dns-parking.com` / `ns2.dns-parking.com`
  eintragen): danach in Hostinger alle notierten Mail-/TXT-Einträge nachtragen.
- **Variante B – DNS bleibt beim aktuellen Anbieter**: nur `A`-Record (`@`) auf die Hostinger-IP
  und `CNAME` `www` → `agent-boss-academy.com` (Werte stehen im hPanel unter „DNS/Nameserver“).
  Falls die DNS-Zone aktuell bei **Netlify DNS** liegt: erst Variante A, sonst verschwindet sie mit der Netlify-Site.
- `agent-boss-academy.de`: in Hostinger als **Parked/Alias-Domain** hinzufügen oder per DNS auf dieselbe IP zeigen –
  die `.htaccess` leitet sie per 301 auf `https://www.agent-boss-academy.com` um.
- hPanel → **Sicherheit → SSL**: Let’s-Encrypt-Zertifikat für `.com`, `www.` und `.de` aktivieren
  (geht erst, wenn DNS auf Hostinger zeigt).

## 5. Rechtliches
- **AVV mit Hostinger** abschließen (hPanel → Konto → DPA/Auftragsverarbeitung). Die DSE behauptet ein AVV.
- **eRecht24**: Generator neu laufen lassen mit Hoster „Hostinger“, damit die Quelle synchron bleibt
  (der Hoster-Absatz in `index.html` wurde bereits von Hand angepasst).

## 6. Netlify abschalten
Erst nach ein paar Tagen ohne Probleme:
- Netlify-Forms-Einträge exportieren (Site → Forms → CSV), damit keine alten Leads verloren gehen.
- Auto-Deploy trennen bzw. Site löschen, Domain dort entfernen.
