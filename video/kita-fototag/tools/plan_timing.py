"""Plan the global timeline from the voice-over word alignment.

Each VO clip is trimmed to [first word - PRE, last word + POST], sped up by
TEMPO and laid end to end with GAP seconds between clips. Writes
assets/js/timing.js (consumed by index.html) and tools/schedule.json
(consumed by build_audio.py)."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPO, PRE, POST, LEAD, GAP, TAIL = 1.0, 0.06, 0.16, 0.7, 0.45, 2.9
vo = json.loads((ROOT / "tools/vo_words.json").read_text())
t, segs = LEAD, []
for i, v in enumerate(vo):
    a = v["words"][0][1] - PRE
    b = v["words"][-1][2] + POST
    dur = (b - a) / TEMPO
    words = [[w, round(t + (s - a) / TEMPO, 3), round(t + (e - a) / TEMPO, 3)] for w, s, e in v["words"]]
    segs.append({"i": i, "src_in": round(a, 3), "src_out": round(b, 3), "start": round(t, 3), "end": round(t + dur, 3), "words": words})
    t += dur + GAP
total = round(segs[-1]["end"] + TAIL, 2)
# scene boundaries sit in the middle of each gap
bounds = [0.0] + [round((segs[k]["end"] + segs[k + 1]["start"]) / 2, 3) for k in range(len(segs) - 1)] + [total]
sched = {"tempo": TEMPO, "total": total, "bounds": bounds, "segs": segs}
(ROOT / "tools/schedule.json").write_text(json.dumps(sched, ensure_ascii=False, indent=1))
(ROOT / "assets/js/timing.js").write_text("window.TIMING = " + json.dumps(sched, ensure_ascii=False) + ";\n")
print("total", total)
for k in range(len(segs)):
    print(f"scene {k+1}: {bounds[k]:6.2f} -> {bounds[k+1]:6.2f}  vo {segs[k]['start']:6.2f}-{segs[k]['end']:6.2f}")
