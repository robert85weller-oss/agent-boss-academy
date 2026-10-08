# Kita-Fototag mit Melina – So läuft ein entspannter Fototag ab (Erklärvideo)

61,3 s · 1920×1080 · 30 fps · gebaut mit [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML + GSAP → MP4).
Erklärvideo **für Melina Weller Photography**: Melina erzählt in der Ich-Form und spricht Kitas an.
Alle Figuren, Requisiten und Szenen sind als SVG im Code gezeichnet; Musik und Soundeffekte per Python-Synthese erzeugt.

Inhaltliche Quellen (ausschließlich Melinas eigene Ratgeber-Artikel):
- „Ablauf Kita-Fototag: So läuft ein entspannter Fototag ab“ – kindergarten.melinaweller.de/ablauf-kita-fototag
- „Bedürfnisorientierte Kita-Fotografie – was bedeutet das eigentlich?“ – kindergarten.melinaweller.de/beduerfnisorientierte-kitafotografie

## Sprechtext

| # | Szene | Text | Grundlage im Ratgeber |
|---|-------|------|------------------------|
| 1 | Intro | Fototag in der Kita? Klingt nach Trubel … muss es aber nicht. Ich bin Melina – so läuft ein Fototag bei mir ab. | „Ein Kita-Fototag muss kein zusätzlicher Programmpunkt sein …“ |
| 2 | Anmeldung | Anmeldung und Elterninfos laufen online über mich. Keine Listen, keine Zettel für euch. | „So müssen in der Kita keine Listen geführt, Zettel verteilt …“ |
| 3 | Ablaufplan | Vorab frage ich Gruppen, Essens- und Schlafenszeiten ab. Daraus wird ein Ablaufplan – als Orientierung, nicht als starrer Zeitplan. | „… der Ablaufplan für mich eine Orientierung – kein starrer Zeitplan.“ |
| 4 | Garten | Am Fototag spielen die Kinder ganz normal im Garten. Ich hole mir ein Kind nach dem anderen dazu – eure Erzieherinnen bleiben im Alltag. | „Die Kinder spielen ganz normal im Garten. Ich bin mittendrin und hole mir die Kinder nach und nach …“ |
| 5 | Bedürfnisorientiert | „Bitte lächeln!“ hört bei mir kein Kind. Ich frage: Was möchtest du machen? Dann spielen wir Fußball oder balancieren über Lava-Steine. | „‚Bitte einmal lächeln!‘ – das wirst du bei meiner Kita-Fotografie nicht hören.“ / „Was möchtest du machen?“ |
| 6 | Danach | Danach sehen die Eltern ihre Bilder in einer passwortgeschützten Online-Galerie und bestellen direkt dort. Kein Geld einsammeln, kein Papierkram. | „Keine Mappen, kein Geld einsammeln, kein Papierkram“ |
| 7 | Outro | Die Kinder dürfen Kind sein. Ich kümmere mich um die Fotos. Mehr in meinem Ratgeber. | „Kinder dürfen spielen … Und ich kümmere mich um die Fotos.“ |

Endkarte: Wortmarke „Melina Weller Photography“, `kindergarten.melinaweller.de/ratgeber` und die Kennung `d8ebd109…eba4` (vollständig eingeblendet).

## Aufbau

```
index.html              Root-Komposition (7 Szenen-Clips, Übergänge, Papier-Grain, Tonspur)
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

Die Stimme ist **ElevenLabs v3 „Katharina Lindemann“** (über Magnific) als Melina. Das gesamte Timing basiert auf deren Wort-Alignment.
`tools/fetch_eleven_vo.sh` lädt die sieben Clips nach `assets/vo/vo1–7.wav` (signierte URLs in der git-ignorierten `tools/vo_urls.local.json`).
Ist der Download-Host `pikaso.cdnpk.net` nicht erreichbar, nutzt `--voice fallback` eine lokale Piper-Stimme (`de-kerstin-low`),
die pro Satz auf exakt dieselbe Länge gestreckt wird. Animation und Lippensync bleiben dadurch gültig.

## Lautheit (ITU-R BS.1770, gemessen mit pyloudnorm / ffmpeg ebur128)

- Stimme: Stem auf **-14 LUFS** (Hochpass → Kompressor 3:1 → Limiter)
- Musik: Stem auf **-36 LUFS**, also 22 LU unter der Stimme
- SFX: Stem auf -25 LUFS
- Mix: Master-Gain + True-Peak-Limiter auf **-12 LUFS**, ≤ -1 dBTP; Werte in `tools/loudness_report.json`

Der Abstand Stimme/Musik von 22 LU bleibt im Master erhalten. Weil der Master um ca. +3,4 dB auf -12 LUFS angehoben wird,
messen Stimme und Musik im fertigen Mix entsprechend lauter (ca. -10,7 / -32,7 LUFS).
