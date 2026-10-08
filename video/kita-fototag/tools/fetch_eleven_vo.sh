#!/usr/bin/env bash
# Download the seven ElevenLabs VO clips (Magnific delivery, WAV 48 kHz) to
# assets/vo/vo1.wav … vo7.wav. Signed URLs live in tools/vo_urls.local.json
# (git-ignored; re-create them with Magnific "creations_deliver" → wav_48k).
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import json, subprocess
for i, url in enumerate(json.load(open("tools/vo_urls.local.json")), 1):
    subprocess.run(["curl", "-fsSL", "--retry", "3", "-o", f"assets/vo/vo{i}.wav", url], check=True)
    print("vo%d.wav ok" % i)
PY
