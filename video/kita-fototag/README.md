# Kita-Fototag – Vorbereitung & Ablauf (Erklärvideo)

61,6 s · 1920×1080 · 30 fps · gebaut mit [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML + GSAP → MP4).
Alle Figuren, Requisiten und Szenen sind als SVG im Code gezeichnet; Musik und Soundeffekte sind per Python-Synthese erzeugt.

## Sprechtext

| # | Szene | Text |
|---|-------|------|
| 1 | Intro | Fototag in der Kita! Klingt nach Trubel? … Muss es nicht. In einer Minute zeig ich dir, wie er für alle entspannt wird. |
| 2 | Elternbrief | Zwei bis drei Wochen vorher: ein kurzer Elternbrief mit Termin und Ablauf. Und die Einverständniserklärungen gleich mit einsammeln. |
| 3 | Kleidung | Tipp für die Eltern: bequeme, einfarbige Kleidung. Große Aufdrucke lenken nur vom Lächeln ab. |
| 4 | Raum | Fürs Shooting reicht ein ruhiger, heller Raum. Am besten mit Tageslicht. |
| 5 | Kinder einstimmen | Und die Kinder? Erzählt ihnen vorher davon. Wer die Kamera schon kennt, lacht viel lieber hinein. |
| 6 | Ablauf | Am Fototag selbst: kleine Gruppen, am besten vormittags, ausgeschlafen und satt. Erst die Einzelporträts, ganz spielerisch. Dann die Geschwister. Und zum Schluss: das große Gruppenfoto! |
| 7 | Danach | Danach schauen sich die Eltern die Bilder in Ruhe an und suchen ihre Lieblinge aus. |
| 8 | Outro | Gut vorbereitet wird der Fototag zum Lieblingstag. Noch mehr Tipps findest du in unserem Ratgeber. |

Endkarte: `kindergarten.melinaweller.de/ratgeber` + Kennung `d8ebd109…eba4` (vollständig eingeblendet).

## Aufbau

```
index.html              Root-Komposition (8 Szenen-Clips, Übergänge, Papier-Grain, Tonspur)
assets/js/art.js        Illustrations-Kit: geriggte Figuren (Mimik: Augen/Brauen/5 Mundformen; Gesten: Schulter > Ellbogen > Hand) + Requisiten
assets/js/rig.js        Schauspiel-Helfer: blinzeln, atmen, Lippensync, winken, zeigen, Daumen hoch, laufen, hüpfen …
assets/js/scenes.js     Szenen-Artwork + Choreografie, verankert an Wort-Zeitstempeln der Sprachaufnahme
assets/js/timing.js     generiert – globale Wortzeiten & Szenengrenzen
tools/vo_words.json     Wort-Alignment der ElevenLabs-Aufnahmen (Magnific)
tools/plan_timing.py    VO-Layout → timing.js / schedule.json
tools/export_cues.mjs   liest die SFX-Cues aus der GSAP-Timeline → sfx_cues.json
tools/build_audio.py    Musik + SFX + Stimme, Lautheits-Mix
```

## Bauen

```bash
python3 tools/plan_timing.py                       # nur nötig, wenn sich Sprachaufnahmen ändern
PLAYWRIGHT_PATH=…/playwright/index.js node tools/export_cues.mjs
python3 tools/build_audio.py --voice eleven        # oder --voice fallback (lokale Piper-Stimme)
npx hyperframes render . -o renders/kita-fototag.mp4 -q high
```

## Stimme

Die Sprecherin ist **ElevenLabs v3 „Katharina Lindemann“** (über Magnific). Das gesamte Timing basiert auf deren Wort-Alignment.
`tools/fetch_eleven_vo.sh` lädt die acht Clips nach `assets/vo/vo1–8.wav` (signierte URLs in der git-ignorierten `tools/vo_urls.local.json`).
Ist der Download-Host `pikaso.cdnpk.net` nicht erreichbar, nutzt `--voice fallback` eine lokale Piper-Stimme (`de-kerstin-low`),
die pro Satz auf exakt dieselbe Länge gestreckt wird. Animation und Lippensync bleiben dadurch gültig.

## Lautheit (ITU-R BS.1770, gemessen mit pyloudnorm / ffmpeg ebur128)

- Stimme: Stem auf **-14 LUFS** (Hochpass → Kompressor 3:1 → Limiter)
- Musik: Stem auf **-36 LUFS**, also 22 LU unter der Stimme
- SFX: Stem auf -25 LUFS
- Mix: Master-Gain + True-Peak-Limiter auf **-12 LUFS**, ≤ -1 dBTP; Werte in `tools/loudness_report.json`

Der Abstand Stimme/Musik von 22 LU bleibt im Master erhalten. Weil der Master um ca. +3,4 dB auf -12 LUFS angehoben wird,
messen Stimme und Musik im fertigen Mix entsprechend lauter (ca. -10,6 / -32,6 LUFS).
