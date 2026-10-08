/* Acting helpers: every function schedules tweens on the one paused timeline.
 * Times are absolute seconds on the root timeline. Nothing here reads clocks
 * or randomness — blink placement comes from a seeded PRNG. */
(function () {
  const MOUTHS = ["smile", "open", "o", "grin", "wobble"];
  const EYES = ["", "Happy", "Wide", "Wink"];

  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function make(tl) {
    const M = ART.META;
    const q = (id, part) => `#${id}-${part}`;
    const restU = (id, side) => (side === "L" ? 1 : -1) * (M[id].size === "adult" ? 9 : 12);
    const restF = (id, side) => (side === "L" ? -8 : 8);
    const SFX = (window.__SFX = window.__SFX || []);

    const R = {
      tl, rng,
      sfx(name, t, gain = 1) { SFX.push({ name, t: +t.toFixed(3), gain }); },

      mouth(id, shape, t) { MOUTHS.forEach((m) => tl.set(q(id, "m-" + m), { opacity: m === shape ? 1 : 0 }, t)); },
      eyes(id, kind, t) { EYES.forEach((k) => tl.set(q(id, "eyes" + k), { opacity: k === kind ? 1 : 0 }, t)); },
      brows(id, dy, t, d = 0.2) { tl.to(q(id, "brows"), { y: dy, duration: d, ease: "power2.out" }, t); },
      sad(id, t) { tl.to(q(id, "browL"), { rotation: -14, svgOrigin: "0 0", duration: 0.2 }, t); },

      blinks(id, t0, t1, seed) {
        const r = rng(seed || id.length * 97 + id.charCodeAt(0));
        const o = `0 ${M[id].ey}`;
        let t = t0 + 0.35 + r() * 1.4;
        while (t < t1 - 0.25) {
          tl.to(q(id, "eyes"), { scaleY: 0.08, svgOrigin: o, duration: 0.06, ease: "power1.in" }, t)
            .to(q(id, "eyes"), { scaleY: 1, svgOrigin: o, duration: 0.09, ease: "power1.out" }, t + 0.075);
          t += 2.0 + r() * 2.6;
        }
      },

      breathe(id, t0, t1, amt = 0.014) {
        const per = 1.5, n = Math.max(0, Math.floor((t1 - t0) / per) - 1);
        const hip = M[id].g.hipY;
        tl.to(q(id, "upper"), { scaleY: 1 + amt, svgOrigin: `0 ${hip}`, duration: per, ease: "sine.inOut", yoyo: true, repeat: n }, t0);
      },

      /** lip-sync to the narrator's word timings */
      talk(id, words, t0 = -1, t1 = 1e9) {
        let k = 0;
        for (const [txt, s, e] of words) {
          if (s < t0 || s > t1) continue;
          const shape = /[ouöü]/i.test(txt) ? "o" : "open";
          R.mouth(id, shape, s);
          const d = e - s;
          if (d > 0.4) { R.mouth(id, "smile", s + d * 0.42); R.mouth(id, shape === "o" ? "open" : "o", s + d * 0.52); }
          R.mouth(id, "smile", Math.max(s + 0.06, e - 0.03));
          if (k++ % 4 === 0) tl.to(q(id, "headpivot"), { rotation: k % 8 === 1 ? 3 : -3, svgOrigin: `0 ${M[id].g.neckY}`, duration: 0.35, ease: "sine.inOut" }, s);
        }
      },

      head(id, deg, t, d = 0.3, ease = "back.out(2)") {
        tl.to(q(id, "headpivot"), { rotation: deg, svgOrigin: `0 ${M[id].g.neckY}`, duration: d, ease }, t);
      },
      nod(id, t) {
        const o = `0 ${M[id].g.neckY}`;
        tl.to(q(id, "headpivot"), { rotation: 6, svgOrigin: o, duration: 0.16, ease: "power2.out" }, t)
          .to(q(id, "headpivot"), { rotation: -3, svgOrigin: o, duration: 0.18, ease: "power2.inOut" }, t + 0.16)
          .to(q(id, "headpivot"), { rotation: 0, svgOrigin: o, duration: 0.2, ease: "power2.out" }, t + 0.34);
      },

      arm(id, side, u, f, t, d = 0.35, ease = "back.out(1.7)") {
        tl.to(q(id, `arm${side}-u`), { rotation: u, svgOrigin: "0 0", duration: d, ease }, t);
        tl.to(q(id, `arm${side}-f`), { rotation: f, svgOrigin: "0 0", duration: d, ease }, t);
      },
      rest(id, side, t, d = 0.35) {
        R.arm(id, side, restU(id, side), restF(id, side), t, d, "power2.inOut");
        tl.to(q(id, `hand${side}`), { rotation: 0, svgOrigin: "0 0", duration: d }, t);
        tl.set(q(id, `thumb${side}`), { opacity: 0 }, t);
      },
      hand(id, side, deg, t, d = 0.3) { tl.to(q(id, `hand${side}`), { rotation: deg, svgOrigin: "0 0", duration: d, ease: "back.out(2)" }, t); },

      wave(id, side, t, n = 3) {
        const k = side === "R" ? -1 : 1;
        R.arm(id, side, k * 150, k * 15, t, 0.3);
        for (let i = 0; i < n; i++) {
          tl.to(q(id, `arm${side}-f`), { rotation: k * 45, svgOrigin: "0 0", duration: 0.17, ease: "sine.inOut" }, t + 0.3 + i * 0.34)
            .to(q(id, `arm${side}-f`), { rotation: k * -5, svgOrigin: "0 0", duration: 0.17, ease: "sine.inOut" }, t + 0.47 + i * 0.34);
        }
        return t + 0.3 + n * 0.34;
      },
      thumbs(id, side, t) {
        const k = side === "R" ? -1 : 1;
        R.arm(id, side, k * 38, k * 118, t, 0.32);
        R.hand(id, side, -k * 156, t);
        tl.set(q(id, `thumb${side}`), { opacity: 1 }, t + 0.08);
      },
      present(id, side, t) { const k = side === "R" ? -1 : 1; R.arm(id, side, k * 62, k * 38, t, 0.4); },
      point(id, side, t) { const k = side === "R" ? -1 : 1; R.arm(id, side, k * 82, k * 10, t, 0.35); },
      cheer(id, t) { R.arm(id, "L", 155, 12, t, 0.3); R.arm(id, "R", -155, -12, t, 0.3); },
      /** camera up to the eye (characters built with chestCam) */
      photo(id, t, d = 0.3) {
        R.arm(id, "L", 150, 131, t, d); R.arm(id, "R", -150, -131, t, d);
        tl.set(q(id, "chestcam"), { opacity: 0 }, t + d * 0.5);
        tl.set(q(id, "facecam"), { opacity: 1 }, t + d * 0.5);
      },
      unphoto(id, t, d = 0.3) {
        R.rest(id, "L", t, d); R.rest(id, "R", t, d);
        tl.set(q(id, "facecam"), { opacity: 0 }, t + d * 0.4);
        tl.set(q(id, "chestcam"), { opacity: 1 }, t + d * 0.4);
      },
      /** global camera flash + shutter sound */
      flash(t, k = 0.6) {
        tl.fromTo("#flash", { opacity: k }, { opacity: 0, duration: 0.45, ease: "power2.out", immediateRender: false }, t);
        R.sfx("shutter", t, 0.9);
      },
      balance(id, t, d = 0.3) { R.arm(id, "L", 84, 6, t, d); R.arm(id, "R", -84, -6, t, d); },
      hold(id, t, d = 0.35) { R.arm(id, "L", -12, -48, t, d); R.arm(id, "R", 12, 48, t, d); },

      hop(id, t, h = 70, d = 0.42) {
        const rig = q(id, "rig");
        tl.to(rig, { scaleY: 0.86, scaleX: 1.08, svgOrigin: "0 0", duration: 0.08, ease: "power2.out" }, t)
          .to(rig, { y: -h, scaleY: 1.06, scaleX: 0.96, svgOrigin: "0 0", duration: d / 2, ease: "power2.out" }, t + 0.08)
          .to(rig, { y: 0, scaleY: 1, scaleX: 1, svgOrigin: "0 0", duration: d / 2, ease: "power2.in" }, t + 0.08 + d / 2)
          .to(rig, { scaleY: 0.9, scaleX: 1.06, svgOrigin: "0 0", duration: 0.07, ease: "power2.out" }, t + 0.08 + d)
          .to(rig, { scaleY: 1, scaleX: 1, svgOrigin: "0 0", duration: 0.22, ease: "back.out(3)" }, t + 0.15 + d);
      },
      popUp(id, t, d = 0.55) {
        tl.fromTo(q(id, "rig"), { scale: 0, svgOrigin: "0 0" }, { scale: 1, svgOrigin: "0 0", duration: d, ease: "back.out(2.2)" }, t);
      },
      riseIn(id, t, from = 700, d = 0.6) {
        tl.fromTo(q(id, "rig"), { y: from }, { y: 0, duration: d, ease: "back.out(1.3)" }, t);
      },

      /** run/walk cycle on legs + arms, plus body bob */
      run(id, t0, t1, cyc = 0.3, amp = 30) {
        const n = Math.max(1, Math.floor((t1 - t0) / cyc));
        const legs = [q(id, "legL"), q(id, "legR")], arms = [q(id, "armL-u"), q(id, "armR-u")];
        legs.forEach((l, i) => {
          const s = i ? -1 : 1;
          tl.to(l, { rotation: s * amp, svgOrigin: "0 0", duration: cyc / 2, ease: "sine.out" }, t0)
            .to(l, { rotation: -s * amp, svgOrigin: "0 0", duration: cyc, ease: "sine.inOut", yoyo: true, repeat: n - 1 }, t0 + cyc / 2)
            .to(l, { rotation: 0, svgOrigin: "0 0", duration: 0.18, ease: "power2.out" }, t0 + cyc / 2 + n * cyc);
        });
        arms.forEach((a, i) => {
          const s = i ? 1 : -1; const base = restU(id, i ? "R" : "L");
          tl.to(a, { rotation: base + s * amp * 1.2, svgOrigin: "0 0", duration: cyc / 2, ease: "sine.out" }, t0)
            .to(a, { rotation: base - s * amp * 1.2, svgOrigin: "0 0", duration: cyc, ease: "sine.inOut", yoyo: true, repeat: n - 1 }, t0 + cyc / 2)
            .to(a, { rotation: base, svgOrigin: "0 0", duration: 0.2, ease: "power2.out" }, t0 + cyc / 2 + n * cyc);
        });
        tl.to(q(id, "upper"), { y: -8, duration: cyc / 2, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1 }, t0);
      },
      /** freeze a run mid-stride (for comic pauses) */
      pose(id, legDeg, t) {
        tl.set(q(id, "legL"), { rotation: legDeg, svgOrigin: "0 0" }, t);
        tl.set(q(id, "legR"), { rotation: -legDeg, svgOrigin: "0 0" }, t);
      },
      legsRest(id, t, d = 0.2) {
        tl.to([q(id, "legL"), q(id, "legR")], { rotation: 0, svgOrigin: "0 0", duration: d, ease: "power2.out" }, t);
      },

      /** standard idle life: blink + breathe */
      alive(id, t0, t1, seed) { R.blinks(id, t0, t1, seed); R.breathe(id, t0, t1); },

      pop(sel, t, d = 0.5, ease = "back.out(2)", origin = "50% 50%") {
        tl.fromTo(sel, { scale: 0, transformOrigin: origin }, { scale: 1, transformOrigin: origin, duration: d, ease }, t);
      },
      out(sel, t, d = 0.3) { tl.to(sel, { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: d, ease: "back.in(2)" }, t); },
      fadeIn(sel, t, d = 0.4, y = 30) { tl.fromTo(sel, { opacity: 0, y }, { opacity: 1, y: 0, duration: d, ease: "power3.out" }, t); },
      /** stroke-draw a path (length measured once at build time) */
      draw(sel, t, d = 0.5, ease = "power2.inOut") {
        document.querySelectorAll(sel).forEach((el) => {
          const len = Math.ceil(el.getTotalLength()) + 2;
          tl.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease }, t);
        });
      },
      wiggle(sel, t, n = 3, deg = 8, per = 0.12, origin = "50% 100%") {
        for (let i = 0; i < n; i++) tl.to(sel, { rotation: i % 2 ? -deg : deg, transformOrigin: origin, duration: per, ease: "sine.inOut" }, t + i * per);
        tl.to(sel, { rotation: 0, transformOrigin: origin, duration: per, ease: "sine.out" }, t + n * per);
      },
      floaty(sel, t0, t1, dy = 10, per = 1.6) {
        const n = Math.max(0, Math.floor((t1 - t0) / per) - 1);
        tl.to(sel, { y: `-=${dy}`, duration: per, ease: "sine.inOut", yoyo: true, repeat: n }, t0);
      },
    };
    return R;
  }
  window.RIG = { make };
})();
