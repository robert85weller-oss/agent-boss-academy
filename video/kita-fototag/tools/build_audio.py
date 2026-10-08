"""Build every sound in the film from code, then mix to spec.

  music  — ukulele (Karplus-Strong), plucked bass, glockenspiel, shaker, soft
           kick/snap; I–V–vi–IV in C at 104 BPM with a final cadence
  sfx    — synthesised pops, whooshes, shutter, bells… placed from
           tools/sfx_cues.json (exported from the GSAP timeline)
  voice  — the eight VO clips laid out on tools/schedule.json

Loudness (ITU-R BS.1770 via pyloudnorm):
  voice stem  -14 LUFS, music stem -36 LUFS, final mix -12 LUFS, true peak <= -1 dBTP.

usage: python3 tools/build_audio.py [--voice eleven|fallback]
"""
import argparse, json, pathlib, subprocess, tempfile
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal
from scipy.ndimage import minimum_filter1d

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
SCHED = json.loads((ROOT / "tools/schedule.json").read_text())
TOTAL = SCHED["total"]
N = int(round(TOTAL * SR))
rng = np.random.default_rng(20261008)
meter = pyln.Meter(SR)


def lufs(x):
    return meter.integrated_loudness(x if x.ndim == 2 else np.stack([x, x], 1))


def to_lufs(x, target):
    return x * 10 ** ((target - lufs(x)) / 20)


def env(n, a, d):
    """attack seconds a, exponential decay time-constant d"""
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def place(buf, x, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    if x.ndim == 1:
        buf[i:i + len(x), 0] += x * gain * l * 1.414
        buf[i:i + len(x), 1] += x * gain * r * 1.414
    else:
        buf[i:i + len(x)] += x * gain


# ---------------------------------------------------------------- music
def pluck(f, dur=1.6, bright=0.5, decay=0.996):
    """Karplus-Strong string via an IIR comb (fast in lfilter)."""
    n = int(dur * SR)
    p = max(2, int(round(SR / f - 0.5)))
    exc = rng.uniform(-1, 1, p)
    exc = signal.lfilter([1 - bright], [1, -bright], exc)  # soften the attack
    x = np.zeros(n)
    x[:p] = exc
    a = np.zeros(p + 2)
    a[0], a[p], a[p + 1] = 1, -0.5 * decay, -0.5 * decay
    y = signal.lfilter([1], a, x)
    return y / (np.max(np.abs(y)) + 1e-9) * env(n, 0.002, dur * 0.5)


def bell(f, dur=1.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) * env(n, 0.002, 0.55)
         + 0.35 * np.sin(2 * np.pi * f * 2.756 * t) * env(n, 0.001, 0.18)
         + 0.12 * np.sin(2 * np.pi * f * 5.404 * t) * env(n, 0.001, 0.07))
    return y / np.max(np.abs(y))


def noise_hit(dur, lo, hi, d, a=0.001):
    n = int(dur * SR)
    b, a_ = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a_, rng.normal(0, 1, n)) * env(n, a, d)


def kick():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.08)


def reverb(x, size=0.9, mix=0.16):
    n = int(size * SR)
    ir = rng.normal(0, 1, (n, 2)) * np.exp(-np.arange(n) / (SR * size / 5))[:, None]
    ir[:, 0] = signal.lfilter(*signal.butter(1, 5000 / (SR / 2)), ir[:, 0])
    ir[:, 1] = signal.lfilter(*signal.butter(1, 5000 / (SR / 2)), ir[:, 1])
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    wet *= np.max(np.abs(x)) / (np.max(np.abs(wet)) + 1e-9)
    return x * (1 - mix) + wet * mix


NOTE = {"C3": 130.81, "D3": 146.83, "F2": 87.31, "G2": 98.0, "A2": 110.0, "C4": 261.63, "D4": 293.66, "E4": 329.63,
        "F4": 349.23, "G4": 392.0, "A4": 440.0, "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46,
        "G5": 783.99, "A5": 880.0, "B5": 987.77, "C6": 1046.5, "E6": 1318.5, "G6": 1568.0}
CHORD = {  # ukulele voicings (gCEA tuning) + bass root + glock arpeggio
    "C": (["G4", "C4", "E4", "C5"], "C3", ["E5", "G5", "C6"]),
    "G": (["G4", "D4", "G4", "B4"], "G2", ["D5", "G5", "B5"]),
    "Am": (["A4", "C4", "E4", "A4"], "A2", ["C5", "E5", "A5"]),
    "F": (["A4", "C4", "F4", "A4"], "F2", ["C5", "F5", "A5"]),
    "Dm": (["A4", "D4", "F4", "A4"], "D3", ["D5", "F5", "A5"]),
    "G7": (["G4", "D4", "F4", "B4"], "G2", ["B4", "D5", "F5"]),
}


def music():
    bpm = 104
    beat = 60 / bpm
    bar = 4 * beat
    prog = ["C", "G", "Am", "F"] * 6 + ["Dm", "G7", "C"]
    buf = np.zeros((N + SR * 3, 2))
    cache = {}

    def pl(name, kind):
        key = (name, kind, len(cache) % 3)
        if key not in cache:
            f = NOTE[name]
            cache[key] = pluck(f, 1.4, 0.45, 0.995) if kind == "uke" else pluck(f, 2.2, 0.8, 0.998)
        return cache[key]

    strum = [(0, 1.0, 1), (2, 0.7, 1), (3, 0.5, -1), (5, 0.55, -1), (6, 0.8, 1), (7, 0.45, -1)]
    for b, ch in enumerate(prog):
        t0 = b * bar
        final = b == len(prog) - 1
        notes, root, arp = CHORD[ch]
        pattern = [(0, 1.0, 1)] if final else strum
        for e8, vel, direction in pattern:
            order = notes if direction > 0 else notes[::-1]
            for k, nn in enumerate(order):
                place(buf, pl(nn, "uke"), t0 + e8 * beat / 2 + k * 0.011, 0.22 * vel, -0.25)
        # bass: beat 1 and 3 (+ pickup)
        place(buf, pl(root, "bass"), t0, 0.5, 0.0)
        if not final:
            place(buf, pl(root, "bass"), t0 + 2 * beat, 0.38, 0.0)
            place(buf, pl(root, "bass"), t0 + 3.5 * beat, 0.22, 0.0)
        # glockenspiel: fuller in intro / outro, sparse under the voice
        sparse = 2 <= b < len(prog) - 3
        hits = [(1.5, 0), (2.5, 1), (3.0, 2)] if not sparse else ([(2.5, 1)] if b % 2 == 0 else [(3.0, 2)])
        if final:
            hits = [(0, 0), (0.25, 1), (0.5, 2)]
        for pos, k in hits:
            place(buf, bell(NOTE[arp[k]]), t0 + pos * beat, 0.16 if sparse else 0.22, 0.35)
        # percussion
        if not final:
            for s16 in range(16):
                acc = [0.5, 0.2, 0.35, 0.2][s16 % 4]
                place(buf, noise_hit(0.06, 5500, 11000, 0.012), t0 + s16 * beat / 4, 0.05 * acc, 0.45)
            for k in (0, 2):
                place(buf, kick(), t0 + k * beat, 0.32, 0)
            for k in (1, 3):
                place(buf, noise_hit(0.15, 900, 3500, 0.03), t0 + k * beat, 0.11, -0.1)
    # intro sparkle on the title
    for i, nn in enumerate(["C5", "E5", "G5", "C6", "E6"]):
        place(buf, bell(NOTE[nn]), 0.42 + i * 0.065, 0.12, 0.3)
    buf = reverb(buf, 1.1, 0.18)[:N]
    buf = signal.lfilter(*signal.butter(2, 38 / (SR / 2), "high"), buf, axis=0)  # DC / sub rumble
    # fade the last ring out so the film ends clean
    fade = int(0.9 * SR)
    buf[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    return buf


# ---------------------------------------------------------------- sfx
def sweep_sine(f0, f1, dur, d, curve=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, d)


def whoosh(dur=0.5, lo=300, hi=2600):
    n = int(dur * SR)
    x = rng.normal(0, 1, n)
    out = np.zeros(n)
    hop = 256
    for s in range(0, n, hop):
        ph = s / n
        fc = lo + (hi - lo) * np.sin(np.pi * ph) ** 1.5
        b, a = signal.butter(2, [max(60, fc * 0.6) / (SR / 2), min(SR / 2 - 100, fc * 1.6) / (SR / 2)], "band")
        seg = x[max(0, s - 512): s + hop]
        out[s: s + hop] = signal.lfilter(b, a, seg)[-min(hop, n - s):]
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * shape


def layer(*parts):
    """sum mono clips of different lengths"""
    out = np.zeros(max(len(p) for p in parts))
    for p in parts:
        out[: len(p)] += p
    return out


def sfx_bank():
    bank = {}
    bank["pop"] = layer(sweep_sine(1100, 380, 0.09, 0.03, 0.012), 0.3 * noise_hit(0.01, 2000, 8000, 0.002))
    t = np.arange(int(0.45 * SR)) / SR
    bank["boing"] = np.sin(2 * np.pi * np.cumsum(220 + 160 * np.sin(2 * np.pi * 11 * t) * np.exp(-t / 0.18) + 120 * (1 - np.exp(-t / 0.05))) / SR) * env(len(t), 0.003, 0.14)
    bank["whoosh"] = whoosh(0.55, 250, 2400)
    bank["swoosh"] = whoosh(0.28, 900, 5200)
    bank["ding"] = layer(bell(1567.98, 1.2) * 0.8, bell(2093.0, 1.0) * 0.3)
    bank["tick"] = layer(noise_hit(0.03, 2500, 9000, 0.004), 0.5 * sweep_sine(2400, 2000, 0.03, 0.008, 0.01))
    rustle = noise_hit(0.3, 1500, 7000, 0.12, 0.02)
    am = np.abs(signal.lfilter([1], [1, -0.995], rng.normal(0, 1, len(rustle))))
    bank["paper"] = rustle * am / am.max()
    sp = np.zeros(int(0.6 * SR))
    for i, f in enumerate([2093, 2637, 3136, 3951, 4699]):
        b = bell(f, 0.4)
        s0 = int(i * 0.045 * SR)
        sp[s0: s0 + len(b)] += b[: len(sp) - s0] * (0.6 - i * 0.07)
    bank["sparkle"] = sp
    c1 = noise_hit(0.02, 1500, 9000, 0.003)
    click = np.concatenate([c1, np.zeros(int(0.035 * SR)), c1 * 0.7])
    bank["click"] = click
    sh = np.zeros(int(0.32 * SR))
    sh[: len(c1)] += c1 * 1.2
    body = noise_hit(0.07, 600, 6000, 0.018)
    sh[int(0.012 * SR): int(0.012 * SR) + len(body)] += body
    sh[int(0.085 * SR): int(0.085 * SR) + len(c1)] += c1
    wh = sweep_sine(900, 1600, 0.18, 0.08, 0.2) * 0.12
    sh[int(0.11 * SR): int(0.11 * SR) + len(wh)] += wh
    bank["shutter"] = sh
    bank["bubble"] = sweep_sine(280, 950, 0.09, 0.035, 0.03)
    ch = np.zeros(int(1.4 * SR))
    for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        b = bell(f, 1.2)
        s0 = int(i * 0.075 * SR)
        ch[s0: s0 + len(b)] += b[: len(ch) - s0] * 0.5
    bank["chime"] = ch
    bank["tap"] = signal.lfilter(*signal.butter(2, 2500 / (SR / 2)), noise_hit(0.04, 300, 4000, 0.008))
    for k in bank:
        bank[k] = bank[k] / np.max(np.abs(bank[k]))
    return bank


def sfx():
    cues = json.loads((ROOT / "tools/sfx_cues.json").read_text())
    bank = sfx_bank()
    level = {"pop": 0.45, "boing": 0.4, "whoosh": 0.5, "swoosh": 0.4, "ding": 0.32, "tick": 0.35, "paper": 0.45,
             "sparkle": 0.3, "click": 0.5, "shutter": 0.6, "bubble": 0.4, "chime": 0.32, "tap": 0.45}
    buf = np.zeros((N + SR * 2, 2))
    for i, c in enumerate(cues):
        pan = ((i * 37) % 9 - 4) / 14  # gentle, deterministic spread
        place(buf, bank[c["name"]], c["t"], level[c["name"]] * c["gain"], pan)
    return reverb(buf, 0.5, 0.12)[:N]


# ---------------------------------------------------------------- voice
def ff_tempo(src, a, b, tempo, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
                    "-af", f"atempo={tempo:.5f},aresample={SR}", "-ac", "1", str(out)], check=True)


def trim_bounds(x, sr, thr_db=-42):
    """first/last second above threshold (for clips without alignment)"""
    w = int(0.01 * sr)
    e = np.convolve(np.abs(x), np.ones(w) / w, "same")
    idx = np.where(e > 10 ** (thr_db / 20) * np.max(np.abs(x)))[0]
    return idx[0] / sr, idx[-1] / sr


def voice(mode):
    buf = np.zeros((N, 2))
    with tempfile.TemporaryDirectory() as td:
        for s in SCHED["segs"]:
            i = s["i"] + 1
            target = s["end"] - s["start"]
            src = ROOT / f"assets/vo/{'vo' if mode == 'eleven' else 'fb'}{i}.wav"
            out = pathlib.Path(td) / f"v{i}.wav"
            if mode == "eleven":
                a, b = s["src_in"], s["src_out"]
                tempo = SCHED["tempo"]
            else:
                raw, sr0 = sf.read(src)
                raw = raw if raw.ndim == 1 else raw.mean(1)
                a, b = trim_bounds(raw, sr0)
                a, b = max(0, a - 0.02), b + 0.06
                tempo = (b - a) / target
            ff_tempo(src, a, b, tempo, out)
            x, _ = sf.read(out)
            n = int(0.012 * SR)
            x[:n] *= np.linspace(0, 1, n)
            x[-n:] *= np.linspace(1, 0, n)
            place(buf, x, s["start"], 1.0, 0.0)
    # broadcast-style voice chain: high-pass, level, compress, peak-limit
    b, a = signal.butter(2, 90 / (SR / 2), "high")
    buf = signal.lfilter(b, a, buf, axis=0)
    buf = to_lufs(buf, -20.0)
    buf = compress(buf, thr_db=-22.0, ratio=3.0, attack=0.003, release=0.12)
    buf = to_lufs(buf, -16.0)
    return limiter(buf, ceiling_db=-4.0, release=0.05)


# ---------------------------------------------------------------- dynamics
def compress(x, thr_db=-24.0, ratio=3.0, attack=0.004, release=0.12, block=48):
    """feed-forward compressor on 1 ms blocks; gain interpolated to audio rate"""
    mono = np.max(np.abs(x), 1) if x.ndim == 2 else np.abs(x)
    nb = len(mono) // block + 1
    pad = np.zeros(nb * block)
    pad[: len(mono)] = mono
    lvl = 20 * np.log10(pad.reshape(nb, block).max(1) + 1e-9)
    ca, cr = np.exp(-block / (attack * SR)), np.exp(-block / (release * SR))
    sm = np.empty(nb)
    cur = -120.0
    for i, v in enumerate(lvl):
        c = ca if v > cur else cr
        cur = v + (cur - v) * c
        sm[i] = cur
    gdb = -np.maximum(0, sm - thr_db) * (1 - 1 / ratio)
    g = np.interp(np.arange(len(mono)), np.arange(nb) * block + block / 2, 10 ** (gdb / 20))
    return x * (g[:, None] if x.ndim == 2 else g)


# ---------------------------------------------------------------- master
def limiter(x, ceiling_db=-1.5, look=0.004, release=0.06):
    """look-ahead peak limiter (4x oversampled detection ~ true-peak)."""
    ceil = 10 ** (ceiling_db / 20)
    over = signal.resample_poly(np.max(np.abs(x), 1), 4, 1)
    peak = over.reshape(-1, 4).max(1)[: len(x)]
    need = np.minimum(1, ceil / np.maximum(peak, 1e-9))
    la = int(look * SR)
    g = minimum_filter1d(need, size=2 * la + 1)  # min over the look-ahead window
    # smooth release
    rel = np.exp(-1 / (release * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else v + (cur - v) * rel
        out[i] = cur
    return x * out[:, None]


def true_peak_db(x):
    over = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(over)) + 1e-12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", choices=["eleven", "fallback"], default="eleven")
    args = ap.parse_args()
    outdir = ROOT / "assets/audio"
    v = to_lufs(voice(args.voice), -14.0)
    m = to_lufs(music(), -36.0)
    s = to_lufs(sfx(), -25.0)
    (outdir / "stems").mkdir(exist_ok=True)
    for name, x in (("voice", v), ("music", m), ("sfx", s)):
        sf.write(outdir / "stems" / f"{name}.flac", x, SR, subtype="PCM_24")
    mix = v + m + s
    # reach -12 LUFS with true peak <= -1 dBTP: iterate gain through the limiter
    g = 10 ** ((-12.0 - lufs(mix)) / 20)
    for _ in range(6):
        out = limiter(mix * g)
        err = -12.0 - lufs(out)
        if abs(err) < 0.05:
            break
        g *= 10 ** (err / 20)
    sf.write(outdir / "mix.flac", out, SR, subtype="PCM_24")
    report = {
        "voice_stem_lufs": round(lufs(v), 2), "music_stem_lufs": round(lufs(m), 2), "sfx_stem_lufs": round(lufs(s), 2),
        "mix_lufs": round(lufs(out), 2), "mix_true_peak_dbtp": round(true_peak_db(out), 2),
        "master_gain_db": round(20 * np.log10(g), 2), "voice_in_mix_lufs": round(lufs(v * g), 2), "music_in_mix_lufs": round(lufs(m * g), 2),
        "voice_mode": args.voice,
    }
    (ROOT / "tools/loudness_report.json").write_text(json.dumps(report, indent=1))
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
