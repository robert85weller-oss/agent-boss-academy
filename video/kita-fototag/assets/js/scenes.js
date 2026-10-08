/* Kita-Fototag — scene art + choreography.
 * buildScenes(tl) injects every scene's artwork and schedules all motion on
 * the single root timeline. Word anchors come from window.TIMING (voice-over
 * alignment), so the acting stays locked to the narration. */
(function () {
  const A = ART, P = A.P, INK = A.INK;
  const T = window.TIMING, SEGS = T.segs, B = T.bounds;

  /** start time of the nth word in segment si beginning with `word` */
  function w(si, word, nth = 1) {
    let c = 0;
    for (const [txt, s] of SEGS[si].words) if (txt.startsWith(word) && ++c === nth) return s;
    throw new Error(`word not found: ${si} ${word}`);
  }
  const words = (si) => SEGS[si].words;

  const place = (id, who, x, y, s = 1, extra, pre = "", post = "") =>
    `<g id="${id}-pos" transform="translate(${x},${y}) scale(${s})">${pre}${A.char(id, who, extra)}${post}</g>`;

  // ---------- icons for UI chips (64x64) ----------
  const ic = (body) => `<svg viewBox="0 0 64 64" width="56" height="56">${body}</svg>`;
  const S = `stroke="${INK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"`;
  const ICON = {
    cal: ic(`<rect x="8" y="12" width="48" height="44" rx="8" fill="#fff" ${S}/><path d="M8 26h48" ${S}/><rect x="8" y="12" width="48" height="14" rx="7" fill="${P.coral}" ${S}/><path d="M20 6v12M44 6v12" ${S}/><circle cx="40" cy="42" r="7" fill="${P.yellow}" ${S}/>`),
    bulb: ic(`<path d="M32 6c-12 0-20 9-20 19 0 8 5 12 8 16v7h24v-7c3-4 8-8 8-16 0-10-8-19-20-19z" fill="${P.yellow}" ${S}/><path d="M22 54h20M25 60h14" ${S}/>`),
    check: ic(`<circle cx="32" cy="32" r="25" fill="${P.grass}" ${S}/><path d="M20 33l8 8 16-17" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`),
    sun: ic(`<g ${S}>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${32 + Math.cos((a * Math.PI) / 180) * 20} ${32 + Math.sin((a * Math.PI) / 180) * 20}L${32 + Math.cos((a * Math.PI) / 180) * 29} ${32 + Math.sin((a * Math.PI) / 180) * 29}"/>`).join("")}</g><circle cx="32" cy="32" r="14" fill="${P.yellow}" ${S}/>`),
    quiet: ic(`<path d="M10 24h10l14-12v40L20 40H10z" fill="${P.lilac}" ${S}/><path d="M42 26c4 4 4 8 0 12" fill="none" ${S}/><text x="47" y="22" font-family="Baloo2" font-weight="800" font-size="16" fill="${INK}">z</text>`),
    light: ic(`<path d="M32 8v8M14 16l6 6M50 16l-6 6M8 34h8M48 34h8" ${S}/><path d="M18 46a14 14 0 0 1 28 0z" fill="${P.yellow}" ${S}/><path d="M10 52h44" ${S}/>`),
    shirt: ic(`<path d="M22 8l-14 8 6 12 6-3v31h24V25l6 3 6-12-14-8c-2 5-6 7-10 7s-8-2-10-7z" fill="${P.mustard}" ${S}/>`),
    palette: ic(`<circle cx="22" cy="24" r="10" fill="${P.coral}" ${S}/><circle cx="42" cy="24" r="10" fill="${P.teal}" ${S}/><circle cx="32" cy="42" r="10" fill="${P.yellow}" ${S}/>`),
    camera: ic(`<rect x="6" y="18" width="52" height="36" rx="8" fill="${P.purple}" ${S}/><rect x="22" y="10" width="20" height="10" rx="3" fill="${P.purple}" ${S}/><circle cx="32" cy="36" r="11" fill="#fff" ${S}/><circle cx="32" cy="36" r="5" fill="${INK}"/>`),
    heart: ic(`<path d="M32 54C8 40 6 22 18 16c7-3 12 1 14 6 2-5 7-9 14-6 12 6 10 24-14 38z" fill="${P.coral}" ${S}/>`),
    link: ic(`<path d="M28 36a10 10 0 0 0 14 0l9-9a10 10 0 0 0-14-14l-4 4" fill="none" ${S} stroke-width="6"/><path d="M36 28a10 10 0 0 0-14 0l-9 9a10 10 0 0 0 14 14l4-4" fill="none" ${S} stroke-width="6"/>`),
    folder: ic(`<path d="M6 16h20l6 6h26v32H6z" fill="${P.yellow}" ${S}/><path d="M22 38l7 7 13-14" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
    group: ic(`<circle cx="18" cy="26" r="8" fill="${P.coral}" ${S}/><circle cx="46" cy="26" r="8" fill="${P.teal}" ${S}/><circle cx="32" cy="22" r="9" fill="${P.yellow}" ${S}/><path d="M6 54c0-10 6-16 12-16s12 6 12 16M34 54c0-10 6-16 12-16s12 6 12 16M20 52c0-10 5-17 12-17s12 7 12 17" fill="#fff" ${S}/>`),
    clock: ic(`<circle cx="32" cy="34" r="24" fill="#fff" ${S}/><path d="M32 34V20M32 34l10 6" ${S}/>`),
  };
  const chip = (id, icon, text, x, y, extraClass = "") =>
    `<div id="${id}" class="chip ${extraClass}" style="left:${x}px;top:${y}px">${ICON[icon]}<span>${text}</span></div>`;

  // ---------- shared scenery ----------
  function sky(id, c1 = "#CDEFFF") {
    return `<rect width="1920" height="1080" fill="${c1}"/>` +
      `<circle cx="1660" cy="190" r="300" fill="#E2F6FF"/><circle cx="1660" cy="190" r="190" fill="#F0FAFF"/>` +
      `<g id="${id}-sun" transform="translate(1660,180)"><g id="${id}-rays">` +
      Array.from({ length: 12 }, (_, i) => `<rect x="-11" y="-150" width="22" height="46" rx="11" fill="${P.yellow}" ${A.st(5)} transform="rotate(${i * 30})"/>`).join("") +
      `</g><circle r="86" fill="${P.yellow}" ${A.st(5)}/>` +
      `<path d="M -36 -8 q 12 -14 24 0 M 12 -8 q 12 -14 24 0" fill="none" ${A.st(6)}/><path d="M -26 22 q 26 26 52 0" fill="none" ${A.st(6)}/>` +
      `<ellipse cx="-50" cy="18" rx="12" ry="7" fill="${P.coral}" opacity=".6"/><ellipse cx="50" cy="18" rx="12" ry="7" fill="${P.coral}" opacity=".6"/></g>`;
  }
  function hills(id) {
    return `<path d="M0 820 C 300 740, 620 760, 900 810 S 1500 760, 1920 800 L1920 1080 L0 1080Z" fill="#B7E3A1" ${A.st(5)}/>` +
      `<path d="M0 900 C 420 850, 820 880, 1140 900 S 1700 870, 1920 890 L1920 1080 L0 1080Z" fill="#94D47F" ${A.st(5)}/>` +
      Array.from({ length: 22 }, (_, i) => `<path d="M ${40 + i * 88} ${960 + (i % 3) * 30} q 6 -18 12 0 q 6 -22 12 0" fill="none" stroke="${P.leaf}" stroke-width="5" stroke-linecap="round"/>`).join("");
  }
  function bunting(id, y = 26, n = 15) {
    let s = `<path d="M -20 ${y} Q 960 ${y + 110} 1940 ${y}" fill="none" stroke="${INK}" stroke-width="4"/>`;
    const cols = [P.coral, P.yellow, P.teal, P.lilac, P.pink];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n; const x = -20 + 1960 * t; const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 110) + t * t * y;
      s += `<path class="${id}-flag" d="M ${x - 30} ${yy} L ${x + 30} ${yy} L ${x} ${yy + 58} Z" fill="${cols[i % 5]}" ${A.st(4)}/>`;
    }
    return s;
  }
  function house(id) {
    return `<g id="${id}">` +
      `<line x1="1410" y1="300" x2="1410" y2="190" ${A.st(6)}/><path id="${id}-flag" d="M 1410 192 L 1500 214 L 1410 238 Z" fill="${P.yellow}" ${A.st(5)}/>` +
      `<rect x="1150" y="470" width="520" height="360" rx="16" fill="#FFE3B3" ${A.st()}/>` +
      `<path d="M 1092 500 L 1410 284 L 1728 500 Z" fill="${P.coral}" ${A.st()}/>` +
      `<circle cx="1410" cy="414" r="42" fill="${P.skyPale}" ${A.st()}/>` + A.star(1410, 414, 24, P.yellow) +
      `<rect x="1300" y="498" width="220" height="70" rx="16" fill="${P.yellow}" ${A.st()}/>` +
      `<text x="1410" y="551" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="56" fill="${INK}">KITA</text>` +
      [1196, 1504].map((x) => `<rect x="${x}" y="606" width="120" height="110" rx="14" fill="${P.skyPale}" ${A.st()}/><path d="M ${x + 60} 606 v 110 M ${x} 661 h 120" ${A.st(4)}/><rect x="${x - 8}" y="716" width="136" height="30" rx="8" fill="${P.woodDark}" ${A.st(4)}/>` +
        [0, 1, 2, 3].map((k) => `<circle cx="${x + 12 + k * 32}" cy="708" r="11" fill="${[P.pink, P.yellow, P.coral, P.lilac][k]}" ${A.st(3.5)}/>`).join("")).join("") +
      `<path d="M 1356 830 L 1356 690 Q 1356 636 1410 636 Q 1464 636 1464 690 L 1464 830 Z" fill="${P.teal}" ${A.st()}/><circle cx="1446" cy="740" r="7" fill="${P.yellow}" ${A.st(3)}/>` +
      `</g>`;
  }
  function fence(x0, x1, y) {
    let s = `<rect x="${x0}" y="${y - 50}" width="${x1 - x0}" height="16" rx="6" fill="#fff" ${A.st(4)}/><rect x="${x0}" y="${y - 18}" width="${x1 - x0}" height="16" rx="6" fill="#fff" ${A.st(4)}/>`;
    for (let x = x0 + 10; x < x1; x += 46) s += `<path d="M ${x} ${y + 10} L ${x} ${y - 70} L ${x + 14} ${y - 88} L ${x + 28} ${y - 70} L ${x + 28} ${y + 10} Z" fill="#fff" ${A.st(4)}/>`;
    return s;
  }
  function wall(c, dots) {
    let s = `<rect width="1920" height="1080" fill="${c}"/>`;
    if (dots) for (let y = 60; y < 900; y += 90) for (let x = (y / 90) % 2 ? 45 : 90; x < 1920; x += 90) s += `<circle cx="${x}" cy="${y}" r="7" fill="${dots}"/>`;
    return s;
  }
  function floor(y, c = "#F3C88A", line = "#E3AE6A") {
    let s = `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${c}"/><rect x="0" y="${y - 14}" width="1920" height="22" fill="#fff" ${A.st(4)}/>`;
    for (let x = 0; x < 1920; x += 240) s += `<path d="M ${x} ${y + 20} L ${x - 60} 1080" stroke="${line}" stroke-width="4"/>`;
    return s;
  }
  const confettiBits = (id, cx, cy, n, seed) => {
    const r = RIG.make({}).rng(seed); const cols = [P.coral, P.yellow, P.teal, P.lilac, P.pink, P.grass];
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = 140 + r() * 420;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7;
      const c = cols[i % cols.length];
      s += i % 3 === 0 ? `<circle class="${id}" data-x="${x.toFixed(0)}" data-y="${y.toFixed(0)}" cx="${cx}" cy="${cy}" r="${9 + r() * 6}" fill="${c}" ${A.st(3)}/>`
        : `<rect class="${id}" data-x="${x.toFixed(0)}" data-y="${y.toFixed(0)}" x="${cx - 8}" y="${cy - 14}" width="16" height="28" rx="4" fill="${c}" ${A.st(3)} transform="rotate(${(r() * 180).toFixed(0)} ${cx} ${cy})"/>`;
    }
    return s;
  };
  function burst(R, cls, t, d = 0.9) {
    document.querySelectorAll("." + cls).forEach((el, i) => {
      const cx = +el.getAttribute("cx") || +el.getAttribute("x") + 8, cy = +el.getAttribute("cy") || +el.getAttribute("y") + 14;
      const dx = +el.dataset.x - cx, dy = +el.dataset.y - cy;
      R.tl.fromTo(el, { x: 0, y: 0, opacity: 0, scale: 0.2, transformOrigin: "50% 50%" }, { x: dx, y: dy, opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: d * 0.55, ease: "power3.out" }, t + (i % 5) * 0.012);
      R.tl.to(el, { y: dy + 260, rotation: (i % 2 ? 1 : -1) * 160, opacity: 0, transformOrigin: "50% 50%", duration: d, ease: "power1.in" }, t + d * 0.55);
    });
  }

  // =====================================================================
  // SCENE 1 — Intro
  // =====================================================================
  function scene1(R) {
    const tl = R.tl, b0 = B[0], b1 = B[1];
    const speed = (side) => `<g class="s1-speed"><path d="M ${side * 70} -300 h ${side * 120} M ${side * 60} -220 h ${side * 170} M ${side * 80} -140 h ${side * 110}" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity=".55"/></g>`;
    const svg =
      sky("s1") + `<g id="s1-cloudA">${A.cloud(330, 210, 0.95)}</g><g id="s1-cloudB">${A.cloud(1120, 150, 0.7)}</g>` +
      `<g id="s1-bunting">${bunting("s1")}</g>` + hills("s1") + house("s1-house") +
      `<g id="s1-tree">${A.tree(170, 905, 1.1)}</g>` + fence(1560, 1930, 905) +
      [[300, P.pink], [380, P.yellow], [1720, P.coral], [1800, P.lilac], [1860, P.yellow]].map(([x, c], i) => `<g class="s1-flower">${A.flower(x, 1010 - (i % 2) * 22, c)}</g>`).join("") +
      // stopwatch
      `<g id="s1-watch" transform="translate(1005,212)"><circle r="84" fill="#fff" ${A.st(6)}/><rect x="-16" y="-112" width="32" height="26" rx="8" fill="${P.coral}" ${A.st(5)}/>` +
      `<circle r="64" fill="${P.skyPale}" ${A.st(4)}/><path id="s1-watch-fill" d="M 0 0 L 0 -64 A 64 64 0 0 1 0 -64 Z" fill="${P.yellow}"/>` +
      [0, 90, 180, 270].map((a) => `<path d="M 0 -64 v 12" ${A.st(5)} transform="rotate(${a})"/>`).join("") +
      `<g id="s1-watch-hand"><path d="M 0 6 L 0 -52" ${A.st(7)}/></g><circle r="8" fill="${INK}"/></g>` +
      // characters
      place("s1lea", "lea", 520, 995, 1,
        undefined, "", `<g id="s1-sweat"><path d="M 96 -560 q 18 26 0 40 q -18 -14 0 -40 z" fill="${P.sky}" ${A.st(4)}/></g>` +
        `<path id="s1-scribble" d="M 60 -650 c 30 -40 70 -10 50 14 c -20 26 -66 0 -30 -30 c 34 -28 84 6 56 34 c -24 22 -70 -8 -40 -36" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`) +
      place("s1noah", "noah", 1090, 995, 0.95, undefined, `<g id="s1-ball"><circle cx="120" cy="-60" r="44" fill="${P.coral}" ${A.st(5)}/><path d="M 76 -60 q 44 -26 88 0 M 120 -104 q -22 44 0 88" fill="none" ${A.st(4)}/></g>`) +
      place("s1ben", "ben", 950, 995, 0.95, undefined, speed(-1)) +
      place("s1mia", "mia", 800, 995, 0.95, undefined, speed(1));

    const ui = `<div id="s1-title" class="title">${"Fototag".split("").map((c, i) => `<span class="s1-letter" style="color:${[P.coral, P.teal, P.yellow, P.purple, P.pink, P.grass, P.coral][i]}">${c}</span>`).join("")}</div>` +
      `<div id="s1-sub" class="pill">${ICON.camera}<span>in der Kita</span></div>` +
      `<div id="s1-watch-label" class="tag">1 Minute</div>`;
    mount("s1", svg, ui);

    // --- choreography
    R.pop("#s1-sun", 0.05, 0.7, "back.out(1.6)");
    tl.to("#s1-rays", { rotation: 40, svgOrigin: "0 0", duration: b1, ease: "none" }, 0);
    tl.fromTo("#s1-cloudA", { x: -520 }, { x: 0, duration: 1.1, ease: "power3.out" }, 0);
    tl.to("#s1-cloudA", { x: 90, duration: b1 - 1.1, ease: "none" }, 1.1);
    tl.fromTo("#s1-cloudB", { x: 700 }, { x: 0, duration: 1.3, ease: "power3.out" }, 0.1);
    tl.to("#s1-cloudB", { x: -70, duration: b1 - 1.4, ease: "none" }, 1.4);
    tl.fromTo("#s1-house", { y: 520 }, { y: 0, duration: 0.75, ease: "back.out(1.3)" }, 0.12);
    R.wiggle("#s1-house-flag", 0.8, 14, 6, 0.28, "0% 50%");
    tl.fromTo(".s1-flag", { scale: 0, transformOrigin: "50% 0%" }, { scale: 1, transformOrigin: "50% 0%", duration: 0.45, ease: "back.out(3)", stagger: 0.035 }, 0.2);
    tl.fromTo(".s1-flower", { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, transformOrigin: "50% 100%", duration: 0.5, ease: "back.out(3)", stagger: 0.07 }, 0.35);
    tl.fromTo("#s1-tree", { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(2)" }, 0.2);
    // title
    tl.fromTo(".s1-letter", { y: -220, rotation: -25, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(2.4)", stagger: 0.065 }, 0.42);
    for (let i = 0; i < 7; i++) R.sfx("pop", 0.62 + i * 0.065, 0.45);
    R.pop("#s1-sub", w(0, "in") - 0.05, 0.5);
    R.sfx("pop", w(0, "in"), 0.7);
    tl.to(".s1-letter", { y: -14, duration: 0.18, ease: "power2.out", stagger: { each: 0.05, yoyo: true, repeat: 1 } }, w(0, "Kita") + 0.1);

    // Lea pops up and waves
    const lea = "s1lea";
    R.riseIn(lea, 0.25, 780, 0.7);
    R.sfx("boing", 0.32, 0.6);
    const endWave = R.wave(lea, "R", w(0, "Fototag") - 0.05, 3);
    R.rest(lea, "R", endWave);
    R.talk(lea, words(0));
    R.alive(lea, 0, b1, 11);
    tl.set(["#s1-sweat", "#s1-scribble"], { opacity: 0 }, 0);

    // "Klingt nach Trubel?" — chaos
    const tc = w(0, "Klingt");
    const freeze = w(0, "Trubel") + 0.35;
    const calm = w(0, "Muss") + 0.04;
    R.eyes(lea, "Wide", tc + 0.05);
    R.brows(lea, -16, tc + 0.05);
    tl.set("#s1-sweat", { opacity: 1 }, tc + 0.15);
    tl.fromTo("#s1-sweat", { y: -10 }, { y: 18, duration: 0.6, ease: "power1.in" }, tc + 0.15);
    tl.set("#s1-scribble", { opacity: 1 }, tc + 0.2);
    R.draw("#s1-scribble", tc + 0.2, 0.45);
    R.arm(lea, "L", 40, 70, tc + 0.05, 0.25);
    R.arm(lea, "R", -40, -70, tc + 0.05, 0.25);
    R.sfx("boing", tc + 0.02, 0.8);

    tl.set(".s1-speed", { opacity: 0 }, 0);
    // Ben dashes left -> right
    tl.fromTo("#s1ben-pos", { x: -260 }, { x: 1180, duration: freeze - tc, ease: "power1.in" }, tc);
    tl.set("#s1ben-pos .s1-speed", { opacity: 1 }, tc);
    R.run("s1ben", tc, freeze, 0.22, 34);
    R.eyes("s1ben", "Happy", tc); R.mouth("s1ben", "grin", tc);
    R.sfx("whoosh", tc + 0.05, 0.7);
    // Mia dashes right -> left (mirrored)
    tl.set("#s1mia-rig", { scaleX: -1, svgOrigin: "0 0" }, 0);
    tl.fromTo("#s1mia-pos", { x: 2150 }, { x: 640, duration: freeze - tc - 0.12, ease: "power1.in" }, tc + 0.12);
    tl.set("#s1mia-pos .s1-speed", { opacity: 1 }, tc + 0.12);
    R.run("s1mia", tc + 0.12, freeze, 0.22, 34);
    R.mouth("s1mia", "grin", tc + 0.12);
    R.sfx("whoosh", tc + 0.2, 0.6);
    // Noah bounces with a ball
    R.popUp("s1noah", tc + 0.05, 0.4);
    R.cheer("s1noah", tc + 0.1);
    R.mouth("s1noah", "grin", tc + 0.1); R.eyes("s1noah", "Happy", tc + 0.1);
    tl.to("#s1noah-rig", { y: -125, duration: freeze - tc - 0.45, ease: "power2.out" }, tc + 0.45);
    tl.set("#s1-ball", { opacity: 0 }, 0); tl.set("#s1-ball", { opacity: 1 }, tc + 0.08);
    tl.fromTo("#s1-ball", { y: 0 }, { y: -170, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }, tc + 0.1);
    tl.to("#s1-ball", { y: -230, x: 30, duration: freeze - tc - 0.7, ease: "power2.out" }, tc + 0.7);
    R.sfx("boing", tc + 0.42, 0.5);
    // ... freeze frame: everything holds, Lea looks at us
    R.pose("s1ben", 30, freeze); R.pose("s1mia", 30, freeze);
    R.head(lea, 0, freeze + 0.1);

    // "Muss es nicht." — calm
    tl.set(["#s1-sweat", "#s1-scribble"], { opacity: 0 }, calm);
    R.eyes(lea, "Wink", calm + 0.12);
    R.brows(lea, 0, calm);
    R.rest(lea, "L", calm, 0.3);
    R.thumbs(lea, "R", calm + 0.05);
    R.sfx("ding", calm + 0.12, 0.7);
    tl.set(".s1-speed", { opacity: 0 }, calm);
    tl.to("#s1ben-pos", { x: 950, duration: 0.5, ease: "power3.out" }, calm + 0.05);
    tl.to("#s1mia-pos", { x: 800, duration: 0.5, ease: "power3.out" }, calm + 0.05);
    tl.set("#s1mia-rig", { scaleX: 1, svgOrigin: "0 0" }, calm + 0.3);
    R.legsRest("s1ben", calm + 0.05, 0.4); R.legsRest("s1mia", calm + 0.05, 0.4);
    tl.to("#s1noah-rig", { y: 0, duration: 0.5, ease: "bounce.out" }, calm + 0.02);
    tl.to("#s1-ball", { y: 0, x: 0, duration: 0.55, ease: "bounce.out" }, calm + 0.02);
    R.rest("s1noah", "L", calm + 0.1); R.rest("s1noah", "R", calm + 0.1);
    ["s1ben", "s1mia", "s1noah"].forEach((k) => { R.eyes(k, "", calm + 0.4); R.mouth(k, "smile", calm + 0.4); });
    R.sfx("swoosh", calm + 0.03, 0.6);

    // "In einer Minute..." — stopwatch
    const tm = w(0, "In") - 0.05;
    R.pop("#s1-watch", tm, 0.55, "back.out(2.2)");
    R.pop("#s1-watch-label", tm + 0.15, 0.45);
    R.sfx("pop", tm, 0.8);
    const sweep = { a: 0 };
    const fill = document.getElementById("s1-watch-fill");
    const arc = (a) => { const r = 64, rad = ((a - 90) * Math.PI) / 180; return `M 0 0 L 0 -64 A 64 64 0 ${a > 180 ? 1 : 0} 1 ${(Math.cos(rad) * r).toFixed(2)} ${(Math.sin(rad) * r).toFixed(2)} Z`; };
    tl.to(sweep, { a: 359.9, duration: b1 - tm - 0.5, ease: "none", onUpdate: () => fill.setAttribute("d", arc(sweep.a)) }, tm + 0.3);
    tl.to("#s1-watch-hand", { rotation: 359.9, svgOrigin: "0 0", duration: b1 - tm - 0.5, ease: "none" }, tm + 0.3);
    for (let t = tm + 0.6; t < b1 - 0.3; t += 0.5) R.sfx("tick", t, 0.35);
    R.rest(lea, "R", tm + 0.2);
    R.eyes(lea, "", tm + 0.2);
    R.present(lea, "R", w(0, "zeig") - 0.05);
    R.rest(lea, "R", w(0, "alle"));
    // "entspannt" — everyone relaxes
    const te = w(0, "entspannt");
    ["s1lea", "s1ben", "s1mia", "s1noah"].forEach((k, i) => { R.eyes(k, "Happy", te + i * 0.05); R.eyes(k, "", te + 0.9); R.head(k, i % 2 ? 5 : -5, te + i * 0.05, 0.5, "sine.inOut"); R.head(k, 0, te + 0.7, 0.5, "sine.inOut"); });
    ["s1ben", "s1mia", "s1noah"].forEach((k, i) => R.alive(k, calm, b1, 20 + i));
  }

  // =====================================================================
  // SCENE 2 — Elternbrief & Einverständnis
  // =====================================================================
  function scene2(R) {
    const tl = R.tl, b0 = B[1], b1 = B[2];
    // calendar
    let cells = "";
    const cx0 = 214, cy0 = 352, cw = 62, ch = 66;
    ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach((d, i) => cells += `<text x="${cx0 + i * cw + cw / 2}" y="${cy0 - 16}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="22" fill="${INK}" opacity=".6">${d}</text>`);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      const n = r * 7 + c + 1; if (n > 31) continue;
      cells += `<text x="${cx0 + c * cw + cw / 2}" y="${cy0 + r * ch + 42}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="28" fill="${c > 4 ? P.coral : INK}">${n}</text>`;
    }
    const cellC = (r, c) => [cx0 + c * cw + cw / 2, cy0 + r * ch + 32];
    const [tx, ty] = cellC(0, 2), [fx, fy] = cellC(3, 2);
    const cal = `<g id="s2-cal"><rect x="180" y="190" width="500" height="560" rx="28" fill="#fff" ${A.st(6)}/>` +
      `<path d="M 180 300 L 180 218 Q 180 190 208 190 L 652 190 Q 680 190 680 218 L 680 300 Z" fill="${P.coral}" ${A.st(6)}/>` +
      `<text x="430" y="266" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="50" fill="#fff">Kalender</text>` +
      [260, 600].map((x) => `<rect x="${x - 12}" y="160" width="24" height="60" rx="12" fill="${P.navy}" ${A.st(5)}/>`).join("") +
      cells +
      `<circle id="s2-today" cx="${tx}" cy="${ty}" r="28" fill="none" stroke="${P.teal}" stroke-width="6"/>` +
      `<g id="s2-fday"><rect x="${fx - 30}" y="${fy - 30}" width="60" height="60" rx="14" fill="${P.yellow}" ${A.st(4)}/><g transform="translate(${fx},${fy}) scale(.32)">${A.camera(130)}</g></g>` +
      `<circle id="s2-ring" cx="${fx}" cy="${fy}" r="44" fill="none" stroke="${P.coral}" stroke-width="8" stroke-linecap="round" transform="rotate(-90 ${fx} ${fy})"/>` +
      `<g id="s2-hopper"><g transform="translate(${tx},${ty - 46})">${A.star(0, 0, 22, P.yellow)}</g></g></g>`;
    // letter
    const letter = `<g id="s2-letter"><path d="M 740 250 L 1130 250 L 1180 300 L 1180 810 L 740 810 Z" fill="#fff" ${A.st(6)}/><path d="M 1130 250 L 1130 300 L 1180 300" fill="#EDE6D8" ${A.st(5)}/>` +
      `<g transform="translate(1100,350) scale(.45)">${A.camera(130)}</g>` +
      `<text x="790" y="340" font-family="Baloo2" font-weight="800" font-size="46" fill="${INK}">Liebe Eltern,</text>` +
      `<rect x="790" y="372" width="330" height="14" rx="7" fill="#E6E1F2"/><rect x="790" y="400" width="270" height="14" rx="7" fill="#E6E1F2"/>` +
      `<rect id="s2-hl1" x="780" y="440" width="320" height="70" rx="14" fill="${P.yellow}" opacity=".85"/>` +
      `<g transform="translate(790,447) scale(.9)">${ICON.cal.replace('width="56" height="56"', 'width="62" height="62"')}</g><text x="870" y="492" font-family="Baloo2" font-weight="800" font-size="44" fill="${INK}">Termin</text>` +
      `<rect id="s2-hl2" x="780" y="530" width="320" height="70" rx="14" fill="${P.mint}" opacity=".95"/>` +
      `<g transform="translate(796,543)"><rect width="44" height="44" rx="8" fill="#fff" ${A.st(4)}/><path d="M 10 14 h 24 M 10 23 h 24 M 10 32 h 16" ${A.st(4)}/></g><text x="870" y="582" font-family="Baloo2" font-weight="800" font-size="44" fill="${INK}">Ablauf</text>` +
      `<rect x="790" y="630" width="330" height="14" rx="7" fill="#E6E1F2"/><rect x="790" y="658" width="300" height="14" rx="7" fill="#E6E1F2"/><rect x="790" y="686" width="200" height="14" rx="7" fill="#E6E1F2"/>` +
      `<path d="M 800 760 c 20 -30 30 10 50 -10 s 30 -20 40 0 s 20 10 40 -8" fill="none" stroke="${P.purple}" stroke-width="5" stroke-linecap="round"/>${A.heart(1110, 755, 20, P.coral)}</g>`;
    const env = `<g id="s2-env" transform="translate(960,540)"><rect x="-130" y="-86" width="260" height="172" rx="16" fill="#fff" ${A.st(6)}/><path d="M -130 -80 L 0 18 L 130 -80" fill="none" ${A.st(6)}/>${A.heart(0, 30, 22, P.coral)}</g>`;
    const form = (i, x, y, rot) => `<g id="s2-form${i}" transform="translate(${x},${y}) rotate(${rot})"><rect x="-110" y="-140" width="220" height="280" rx="16" fill="#fff" ${A.st(5)}/>` +
      `<rect x="-110" y="-140" width="220" height="56" rx="16" fill="${[P.teal, P.lilac, P.pink][i - 1]}" ${A.st(5)}/>` +
      `<text x="0" y="-100" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="27" fill="${INK}">Einverständnis</text>` +
      `<rect x="-86" y="-60" width="172" height="11" rx="5.5" fill="#E6E1F2"/><rect x="-86" y="-38" width="140" height="11" rx="5.5" fill="#E6E1F2"/>` +
      `<rect x="-86" y="-6" width="46" height="46" rx="10" fill="#fff" ${A.st(5)}/><path class="s2-tick${i}" d="M -76 18 L -64 30 L -46 4" fill="none" stroke="${P.grass}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<text x="-28" y="26" font-family="Nunito" font-weight="800" font-size="26" fill="${INK}">Ja!</text>` +
      `<path class="s2-sig${i}" d="M -80 98 c 14 -26 26 8 40 -10 s 22 -18 32 0 s 18 10 34 -8 s 20 -4 36 6" fill="none" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M -86 116 h 172" stroke="${INK}" stroke-width="3" opacity=".35"/></g>`;
    const FORMS = [[830, 480, -6], [1010, 460, 2], [1190, 490, 8]];
    const folder = `<g id="s2-folder" transform="translate(0,-215)"><path d="M -120 -78 L -40 -78 L -20 -58 L 120 -58 L 120 86 L -120 86 Z" fill="${P.yellow}" ${A.st(6)}/><rect id="s2-folder-front" x="-120" y="-36" width="240" height="122" rx="10" fill="#FFD866" ${A.st(6)}/>` +
      `<path d="M -26 22 l 18 18 l 34 -36" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`;

    const svg = wall("#FFEBC4", "#FFE0A3") + floor(905) +
      `<g id="s2-frame" transform="translate(1530,230)"><rect x="-90" y="-70" width="180" height="140" rx="10" fill="${P.skyPale}" ${A.st(5)}/>${A.heart(0, 0, 30, P.pink)}</g>` +
      cal + place("s2lea", "lea", 400, 1010, 1, undefined, "", folder) +
      place("s2mama", "mama", 1470, 1010, 0.95) + place("s2papa", "papa", 1700, 1010, 0.95) +
      letter + env + FORMS.map(([x, y, r], i) => form(i + 1, x, y, r)).join("");
    const ui = chip("s2-chip1", "cal", "2–3 Wochen vorher", 190, 790) + chip("s2-chip2", "folder", "Einverständnis einsammeln", 640, 80);
    mount("s2", svg, ui);

    const t0 = b0 + 0.05;
    tl.fromTo("#s2-cal", { y: 760, rotation: -6, transformOrigin: "50% 100%" }, { y: 0, rotation: 0, transformOrigin: "50% 100%", duration: 0.65, ease: "back.out(1.5)" }, t0);
    R.sfx("swoosh", t0, 0.6);
    R.pop("#s2-frame", t0 + 0.2, 0.5);
    // hop 3 weeks
    tl.set("#s2-ring", { opacity: 0 }, 0);
    const hops = [w(1, "Zwei"), w(1, "drei"), w(1, "Wochen") + 0.06];
    hops.forEach((t, i) => {
      tl.to("#s2-hopper", { y: (i + 1) * ch, duration: 0.3, ease: "power2.inOut" }, t);
      tl.to("#s2-hopper", { scaleY: 0.7, transformOrigin: "50% 100%", duration: 0.07, yoyo: true, repeat: 1 }, t + 0.28);
      R.sfx("tick", t + 0.3, 0.6);
    });
    tl.set("#s2-ring", { opacity: 1 }, w(1, "vorher") - 0.05);
    R.draw("#s2-ring", w(1, "vorher") - 0.05, 0.45);
    R.pop("#s2-fday", w(1, "vorher"), 0.45, "back.out(3)");
    R.sfx("ding", w(1, "vorher") + 0.1, 0.6);
    R.pop("#s2-chip1", w(1, "vorher") + 0.1, 0.5);

    // parents arrive, letter appears
    R.riseIn("s2mama", w(1, "ein") - 0.2, 700, 0.6);
    R.riseIn("s2papa", w(1, "ein") - 0.05, 700, 0.6);
    R.sfx("boing", w(1, "ein") - 0.15, 0.4);
    R.wave("s2mama", "L", w(1, "kurzer"), 2);
    R.rest("s2mama", "L", w(1, "kurzer") + 1.05);
    R.alive("s2mama", b0, b1, 31); R.alive("s2papa", b0, b1, 32);
    const tL = w(1, "Elternbrief") - 0.15;
    tl.fromTo("#s2-letter", { y: 950, rotation: 8, transformOrigin: "50% 50%" }, { y: 0, rotation: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(1.4)" }, tL);
    R.sfx("paper", tL + 0.05, 0.8);
    tl.fromTo("#s2-hl1", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.35, ease: "power2.out" }, w(1, "Termin") - 0.05);
    tl.fromTo("#s2-hl2", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.35, ease: "power2.out" }, w(1, "Ablauf") - 0.05);
    R.sfx("swoosh", w(1, "Termin"), 0.35); R.sfx("swoosh", w(1, "Ablauf"), 0.35);
    // fold to envelope and send it to the parents
    const tf = w(1, "Ablauf") + 0.62;
    tl.to("#s2-letter", { scaleY: 0, scaleX: 0.6, transformOrigin: "50% 50%", duration: 0.25, ease: "power2.in" }, tf);
    tl.fromTo("#s2-env", { scale: 0 }, { scale: 1, transformOrigin: "50% 50%", duration: 0.3, ease: "back.out(2.5)" }, tf + 0.2);
    tl.to("#s2-env", { x: 1700, duration: 0.55, ease: "power1.inOut" }, tf + 0.55);
    tl.to("#s2-env", { y: 800, duration: 0.55, ease: "back.in(2.4)" }, tf + 0.55);
    tl.to("#s2-env", { scale: 0.5, rotation: 12, transformOrigin: "50% 50%", duration: 0.55 }, tf + 0.55);
    R.sfx("whoosh", tf + 0.55, 0.6);
    R.hold("s2papa", tf + 0.75);
    R.eyes("s2papa", "Happy", tf + 1.1); R.mouth("s2papa", "grin", tf + 1.1);
    R.hop("s2papa", tf + 1.05, 30, 0.34);
    R.sfx("pop", tf + 1.1, 0.7);
    tl.to("#s2-env", { opacity: 0, duration: 0.2 }, tf + 1.9);
    R.rest("s2papa", "L", tf + 1.95); R.rest("s2papa", "R", tf + 1.95);

    // Lea with the folder; calendar leaves
    const tb = w(1, "Und") - 0.2;
    tl.to("#s2-cal", { x: -760, rotation: -10, duration: 0.5, ease: "back.in(1.4)" }, tb);
    tl.to("#s2-chip1", { opacity: 0, y: 40, duration: 0.3 }, tb);
    R.riseIn("s2lea", tb + 0.25, 820, 0.6);
    tl.fromTo("#s2-folder", { y: 820 - 215 }, { y: -215, duration: 0.6, ease: "back.out(1.3)" }, tb + 0.25);
    R.hold("s2lea", 0, 0.01);
    R.talk("s2lea", words(1), tb + 0.2);
    R.alive("s2lea", tb, b1, 33);
    R.pop("#s2-chip2", w(1, "Einverst") - 0.1, 0.5);
    R.sfx("pop", w(1, "Einverst") - 0.05, 0.6);
    // forms fly in from the parents
    [1, 2, 3].forEach((i) => {
      const t = w(1, "Einverst") + (i - 1) * 0.16;
      const [fx0, fy0, fr0] = FORMS[i - 1];
      tl.fromTo(`#s2-form${i}`, { x: 1560, y: 700, scale: 0.2, rotation: 30, opacity: 0 }, { x: fx0, y: fy0, scale: 1, rotation: fr0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }, t);
      R.sfx("paper", t + 0.05, 0.4);
    });
    R.present("s2mama", "L", w(1, "Einverst") - 0.1); R.rest("s2mama", "L", w(1, "gleich"));
    R.present("s2papa", "L", w(1, "Einverst") - 0.05); R.rest("s2papa", "L", w(1, "gleich") + 0.1);
    [1, 2, 3].forEach((i) => {
      const t = w(1, "Einverst") + 0.75 + (i - 1) * 0.28;
      R.draw(`.s2-tick${i}`, t, 0.2, "power2.out");
      R.draw(`.s2-sig${i}`, t + 0.08, 0.35);
      R.sfx("tick", t + 0.12, 0.9);
    });
    // collect into Lea's folder
    const tcl = w(1, "einsammeln") - 0.05;
    [1, 2, 3].forEach((i) => {
      const t = tcl + (i - 1) * 0.12;
      tl.to(`#s2-form${i}`, { x: 400, y: 790, scale: 0.18, rotation: -40, duration: 0.42, ease: "power3.in" }, t);
      tl.set(`#s2-form${i}`, { opacity: 0 }, t + 0.42);
      tl.to("#s2-folder", { scale: 1.12, transformOrigin: "50% 50%", duration: 0.08, yoyo: true, repeat: 1 }, t + 0.42);
      R.sfx("paper", t + 0.4, 0.5);
    });
    R.eyes("s2lea", "Happy", tcl + 0.7); R.nod("s2lea", tcl + 0.7);
    R.sfx("ding", tcl + 0.75, 0.5);
  }

  // =====================================================================
  // SCENE 3 — Kleidung
  // =====================================================================
  function scene3(R) {
    const tl = R.tl, b0 = B[2], b1 = B[3];
    const sparkles = (cls, cx, cy, rr) => [0, 60, 120, 180, 240, 300].map((a, i) => `<g class="${cls}">${A.sparkle(cx + Math.cos((a * Math.PI) / 180) * rr, cy + Math.sin((a * Math.PI) / 180) * rr * 0.9, 20 + (i % 2) * 10, [P.yellow, P.pink, P.teal][i % 3])}</g>`).join("");
    const svg = wall("#D5F5EA", "#C2EEDD") + floor(880, "#F7D9A8", "#E9BF7F") +
      `<circle cx="960" cy="470" r="380" fill="#E9FBF4"/>` +
      `<ellipse cx="960" cy="905" rx="290" ry="54" fill="${P.pink}" ${A.st(5)}/><ellipse cx="960" cy="896" rx="230" ry="36" fill="#FFC1D0"/>` +
      // left card: "big prints distract"
      `<g id="s3-card"><rect x="150" y="210" width="470" height="620" rx="34" fill="#fff" ${A.st(6)}/>` +
      `<rect x="180" y="240" width="410" height="460" rx="22" fill="#FFF3D6"/>` +
      place("s3mini", "miaDino", 385, 680, 1.02) +
      `<g id="s3-arrows"><path d="M 230 300 Q 270 420 330 470" fill="none" stroke="${P.tomato}" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 18"/><path d="M 540 300 Q 500 420 440 470" fill="none" stroke="${P.tomato}" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 18"/></g>` +
      `<g id="s3-x">${A.cross(560, 260, 50)}</g>` +
      `<text x="385" y="785" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="46" fill="${INK}">Große Aufdrucke</text></g>` +
      `<g id="s3-swap">${sparkles("s3-spark", 960, 560, 260)}</g>` +
      place("s3dino", "miaDino", 960, 900, 1.42) + place("s3mia", "mia", 960, 900, 1.42) +
      `<circle id="s3-spot" cx="960" cy="466" r="138" fill="none" stroke="${P.yellow}" stroke-width="12" stroke-linecap="round" stroke-dasharray="26 22"/>` +
      `<g id="s3-ok">${A.check(1120, 360, 46)}</g>` + `<g id="s3-smile">${sparkles("s3-spark2", 960, 466, 200)}</g>`;
    const ui = chip("s3-chip0", "bulb", "Tipp für Eltern", 760, 70, "chip-dark") +
      chip("s3-chip1", "shirt", "bequem", 1330, 330) + chip("s3-chip2", "palette", "einfarbig", 1330, 460) +
      `<div id="s3-swatches" class="swatches">${[P.mustard, P.teal, P.coral, P.lilac, P.grass].map((c) => `<i style="background:${c}"></i>`).join("")}</div>`;
    mount("s3", svg, ui);

    R.pop("#s3-chip0", b0 + 0.25, 0.5); R.sfx("pop", b0 + 0.3, 0.6);
    R.riseIn("s3dino", b0 + 0.05, 900, 0.6);
    tl.set("#s3mia-pos", { opacity: 0 }, 0);
    R.alive("s3dino", b0, b1, 41); R.alive("s3mia", b0, b1, 42);
    R.wave("s3dino", "R", b0 + 0.6, 2);
    R.mouth("s3dino", "grin", b0 + 0.6);
    // spin swap
    const ts = w(2, "bequeme") - 0.15;
    tl.to("#s3dino-pos", { scaleX: 0.02, duration: 0.14, ease: "power2.in" }, ts);
    tl.set("#s3dino-pos", { opacity: 0 }, ts + 0.14);
    tl.set("#s3mia-pos", { opacity: 1, scaleX: 0.02 }, ts + 0.14);
    tl.to("#s3mia-pos", { scaleX: 1.42, duration: 0.3, ease: "back.out(2.4)" }, ts + 0.14);
    R.sfx("swoosh", ts, 0.8); R.sfx("sparkle", ts + 0.16, 0.7);
    tl.fromTo(".s3-spark", { scale: 0, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.2, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(3)", stagger: 0.03 }, ts + 0.14);
    tl.to(".s3-spark", { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.35, stagger: 0.03 }, ts + 0.75);
    R.pop("#s3-chip1", w(2, "bequeme"), 0.5); R.sfx("pop", w(2, "bequeme"), 0.6);
    R.pop("#s3-chip2", w(2, "einfarbige"), 0.5); R.sfx("pop", w(2, "einfarbige"), 0.6);
    tl.fromTo("#s3-swatches i", { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(3)", stagger: 0.06 }, w(2, "einfarbige") + 0.3);
    R.eyes("s3mia", "Happy", w(2, "Kleidung")); R.mouth("s3mia", "grin", w(2, "Kleidung"));
    R.hop("s3mia", w(2, "Kleidung"), 60, 0.4);
    R.cheer("s3mia", w(2, "Kleidung"));
    R.rest("s3mia", "L", w(2, "Kleidung") + 0.8); R.rest("s3mia", "R", w(2, "Kleidung") + 0.8);
    R.eyes("s3mia", "", w(2, "Kleidung") + 0.8); R.mouth("s3mia", "smile", w(2, "Kleidung") + 0.8);
    // big prints distract
    const tg = w(2, "Große") - 0.1;
    tl.fromTo("#s3-card", { x: -620, rotation: -8, transformOrigin: "50% 100%" }, { x: 0, rotation: -3, transformOrigin: "50% 100%", duration: 0.55, ease: "back.out(1.4)" }, tg);
    R.sfx("swoosh", tg, 0.6);
    tl.set("#s3-arrows", { opacity: 0 }, 0);
    tl.set("#s3-arrows", { opacity: 1 }, w(2, "Aufdrucke"));
    tl.fromTo("#s3-arrows", { scale: 0.6, transformOrigin: "50% 100%" }, { scale: 1, transformOrigin: "50% 100%", duration: 0.35, ease: "back.out(2)" }, w(2, "Aufdrucke"));
    R.head("s3mini", 10, w(2, "Aufdrucke"), 0.4, "power2.out");
    R.eyes("s3mini", "Wide", w(2, "Aufdrucke"));
    R.mouth("s3mini", "wobble", w(2, "lenken"));
    R.pop("#s3-x", w(2, "lenken"), 0.45, "back.out(3)"); R.sfx("boing", w(2, "lenken"), 0.6);
    R.alive("s3mini", b0, b1, 43);
    // focus on the smile
    const tsm = w(2, "Lächeln") - 0.12;
    R.eyes("s3mia", "Happy", tsm); R.mouth("s3mia", "grin", tsm);
    tl.set("#s3-spot", { opacity: 0 }, 0);
    tl.set("#s3-spot", { opacity: 1 }, tsm);
    tl.fromTo("#s3-spot", { scale: 1.6, rotation: 0, transformOrigin: "50% 50%" }, { scale: 1, rotation: 40, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2)" }, tsm);
    tl.to("#s3-spot", { rotation: 120, transformOrigin: "50% 50%", duration: b1 - tsm - 0.5, ease: "none" }, tsm + 0.5);
    R.pop("#s3-ok", tsm + 0.25, 0.45, "back.out(3)");
    R.sfx("sparkle", tsm, 0.8); R.sfx("ding", tsm + 0.25, 0.6);
    tl.fromTo(".s3-spark2", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(3)", stagger: 0.04 }, tsm + 0.1);
    R.floaty(".s3-spark2", tsm + 0.5, b1, 8, 0.6);
    R.head("s3mia", -6, tsm, 0.4, "sine.inOut");
  }

  // =====================================================================
  // SCENE 4 — Der Raum
  // =====================================================================
  function scene4(R) {
    const tl = R.tl, b0 = B[3], b1 = B[4];
    const win = `<g id="s4-window"><rect x="170" y="170" width="470" height="500" rx="20" fill="#fff" ${A.st(6)}/>` +
      `<clipPath id="s4-clip"><rect x="200" y="200" width="410" height="440" rx="10"/></clipPath>` +
      `<g clip-path="url(#s4-clip)"><rect x="200" y="200" width="410" height="440" fill="#BFE8FF"/>` +
      `<g id="s4-sunout"><g transform="translate(470,330)"><circle r="70" fill="${P.yellow}" ${A.st(5)}/><path d="M -26 -6 q 8 -10 16 0 M 10 -6 q 8 -10 16 0" fill="none" ${A.st(5)}/><path d="M -20 16 q 20 18 40 0" fill="none" ${A.st(5)}/></g></g>` +
      `${A.cloud(300, 300, 0.45)}<path d="M 200 560 C 300 520, 420 540, 610 520 L 610 640 L 200 640 Z" fill="#9FD98B" ${A.st(5)}/>${A.tree(300, 600, 0.55)}</g>` +
      `<path d="M 405 200 V 640 M 200 420 H 610" ${A.st(10)}/><path d="M 405 200 V 640 M 200 420 H 610" stroke="#fff" stroke-width="12"/>` +
      `<rect x="150" y="660" width="510" height="34" rx="12" fill="#fff" ${A.st(5)}/>` +
      `<path d="M 140 150 L 230 150 Q 210 420 250 700 L 140 700 Z" fill="${P.coral}" ${A.st(5)}/><path d="M 670 150 L 580 150 Q 600 420 560 700 L 670 700 Z" fill="${P.coral}" ${A.st(5)}/>` +
      `<rect x="120" y="130" width="570" height="30" rx="15" fill="${P.woodDark}" ${A.st(5)}/></g>`;
    const beams = `<g id="s4-beams" opacity="0"><path d="M 610 220 L 1300 960 L 980 960 L 610 640 Z" fill="#FFE98F" opacity=".55"/><path d="M 600 300 L 1580 960 L 1360 960 L 600 560 Z" fill="#FFF3B8" opacity=".5"/>` +
      [[860, 520], [1040, 700], [1210, 800], [760, 640], [1400, 880]].map(([x, y], i) => `<circle class="s4-dust" cx="${x}" cy="${y}" r="${5 + (i % 3) * 2}" fill="#fff"/>`).join("") + `</g>`;
    const backdrop = `<g id="s4-backdrop"><path d="M 1110 210 V 900 M 1770 210 V 900" ${A.st(12)}/><path d="M 1110 210 V 900 M 1770 210 V 900" stroke="#8C8299" stroke-width="10"/>` +
      `<path d="M 1150 236 L 1730 236 L 1730 880 Q 1730 950 1800 960 L 1080 960 Q 1150 950 1150 880 Z" fill="#FFD4C2" ${A.st(6)}/>` +
      `<rect x="1120" y="200" width="640" height="52" rx="26" fill="#F3B49D" ${A.st(6)}/>` +
      `<g id="s4-stool"><ellipse cx="1440" cy="800" rx="90" ry="26" fill="${P.wood}" ${A.st(5)}/><path d="M 1380 810 L 1366 930 M 1500 810 L 1514 930 M 1440 826 L 1440 940" ${A.st(9)}/><path d="M 1380 810 L 1366 930 M 1500 810 L 1514 930 M 1440 826 L 1440 940" stroke="${P.woodDark}" stroke-width="7"/></g></g>`;
    const tripod = `<g id="s4-tripod"><path d="M 1000 650 L 930 975 M 1000 650 L 1004 990 M 1000 650 L 1070 975" ${A.st(10)}/><path d="M 1000 650 L 930 975 M 1000 650 L 1004 990 M 1000 650 L 1070 975" stroke="#6A6280" stroke-width="7"/>` +
      `<g transform="translate(1000,600)">${A.camera(150)}</g></g>`;
    const svg = wall("#EEE7FF", "#E4DBFA") + floor(870, "#E8B77E", "#D49A5C") + win + backdrop + beams + tripod +
      place("s4foto", "foto", 820, 1000, 1) +
      `<rect id="s4-dim" width="1920" height="1080" fill="#2B2140" opacity=".42"/>`;
    const ui = chip("s4-chip1", "quiet", "ruhig", 690, 60) + chip("s4-chip2", "light", "hell", 960, 60) + chip("s4-chip3", "sun", "Tageslicht", 1200, 60);
    mount("s4", svg, ui);

    R.alive("s4foto", b0, b1, 51);
    R.riseIn("s4foto", b0 + 0.05, 800, 0.6);
    R.sfx("boing", b0 + 0.1, 0.4);
    // peek through the camera
    const tp = w(3, "Shooting");
    R.arm("s4foto", "R", -60, -70, tp, 0.35);
    R.head("s4foto", 8, tp, 0.35);
    R.eyes("s4foto", "Wink", tp + 0.1);
    R.sfx("click", tp + 0.35, 0.6);
    R.head("s4foto", 0, w(3, "ruhiger"), 0.35);
    R.eyes("s4foto", "", w(3, "ruhiger"));
    R.rest("s4foto", "R", w(3, "ruhiger"));
    R.pop("#s4-chip1", w(3, "ruhiger") - 0.05, 0.5); R.sfx("pop", w(3, "ruhiger"), 0.6);
    // lights up
    const th = w(3, "heller") - 0.1;
    tl.to("#s4-dim", { opacity: 0, duration: 0.6, ease: "power2.out" }, th);
    R.pop("#s4-chip2", th, 0.5); R.sfx("sparkle", th, 0.6);
    R.eyes("s4foto", "Wide", th); R.eyes("s4foto", "", th + 0.6);
    // daylight
    const td = w(3, "Tageslicht") - 0.15;
    tl.fromTo("#s4-sunout", { y: 260 }, { y: 0, duration: 0.7, ease: "back.out(1.6)" }, td - 0.4);
    tl.to("#s4-beams", { opacity: 1, duration: 0.7, ease: "power2.out" }, td);
    tl.fromTo("#s4-beams", { scaleX: 0.3, transformOrigin: "0% 0%" }, { scaleX: 1, transformOrigin: "0% 0%", duration: 0.8, ease: "power3.out" }, td);
    R.floaty(".s4-dust", td, b1, 18, 0.9);
    R.pop("#s4-chip3", td + 0.1, 0.5); R.sfx("ding", td + 0.15, 0.6);
    R.thumbs("s4foto", "L", td + 0.35);
    R.eyes("s4foto", "Happy", td + 0.4); R.mouth("s4foto", "grin", td + 0.4);
  }

  // =====================================================================
  // SCENE 5 — Kinder einstimmen
  // =====================================================================
  function scene5(R) {
    const tl = R.tl, b0 = B[4], b1 = B[5];
    const q = (id, x) => `<g id="${id}" transform="translate(${x},500)"><circle r="44" fill="#fff" ${A.st(5)}/><text y="22" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="64" fill="${P.purple}">?</text></g>`;
    const svg = wall("#FFE6D8", "#FFD9C4") + floor(890, "#F6C79E", "#E7AD7B") +
      `<g id="s5-shelf"><rect x="1250" y="300" width="520" height="26" rx="10" fill="${P.woodDark}" ${A.st(5)}/>` +
      `<rect x="1290" y="226" width="74" height="74" rx="10" fill="${P.coral}" ${A.st(5)}/><text x="1327" y="282" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="50" fill="#fff">A</text>` +
      `<rect x="1374" y="246" width="54" height="54" rx="10" fill="${P.teal}" ${A.st(5)}/><text x="1401" y="290" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="40" fill="#fff">B</text>` +
      `<g transform="translate(1560,300)"><circle cx="-40" cy="-96" r="22" fill="#C98B5A" ${A.st(5)}/><circle cx="40" cy="-96" r="22" fill="#C98B5A" ${A.st(5)}/><ellipse cy="-30" rx="62" ry="40" fill="#C98B5A" ${A.st(5)}/><circle cy="-80" r="48" fill="#C98B5A" ${A.st(5)}/><circle cx="-16" cy="-86" r="5" fill="${INK}"/><circle cx="16" cy="-86" r="5" fill="${INK}"/><ellipse cy="-66" rx="14" ry="10" fill="#F3D1B0" ${A.st(3)}/></g>` +
      `<rect x="1660" y="236" width="64" height="64" rx="32" fill="${P.yellow}" ${A.st(5)}/></g>` +
      `<ellipse cx="1140" cy="960" rx="560" ry="66" fill="#BFEFE2" ${A.st(5)}/>` +
      `<g id="s5-bubble"><path d="M 600 150 L 1080 150 Q 1130 150 1130 200 L 1130 410 Q 1130 460 1080 460 L 700 460 L 600 540 L 640 460 L 600 460 Q 550 460 550 410 L 550 200 Q 550 150 600 150 Z" fill="#fff" ${A.st(6)}/>` +
      `<g transform="translate(760,305)">${A.camera(170)}</g><g id="s5-bflash">${A.sparkle(870, 225, 30, P.yellow)}</g>` +
      `<g transform="translate(990,300)"><circle r="62" fill="${P.yellow}" ${A.st(5)}/><path d="M -24 -12 q 8 -12 16 0 M 8 -12 q 8 -12 16 0" fill="none" ${A.st(5)}/><path d="M -30 12 q 30 34 60 0 Z" fill="${INK}" ${A.st(4)}/></g></g>` +
      place("s5lea", "lea", 400, 1010, 1) +
      place("s5ben", "ben", 1060, 990, 1.05) + place("s5mia", "mia", 1290, 990, 1.05) + place("s5lotta", "lotta", 1510, 990, 1.05) +
      q("s5-q1", 1060) + q("s5-q2", 1290) + q("s5-q3", 1510) +
      `<g id="s5-toycam" transform="translate(196,776)">${A.camera(120, P.coral)}</g>` +
      `<circle id="s5-flash" cx="1060" cy="660" r="120" fill="#fff"/>` +
      `<g id="s5-hearts">${[[980, 470, P.coral], [1150, 420, P.pink], [1380, 500, P.coral], [1620, 450, P.pink]].map(([x, y, c]) => `<g class="s5-heart">${A.heart(x, y, 30, c)}</g>`).join("")}</g>`;
    mount("s5", svg, "");

    const lea = "s5lea";
    R.riseIn(lea, b0 + 0.05, 820, 0.55);
    R.alive(lea, b0, b1, 61);
    R.talk(lea, words(4));
    R.arm(lea, "L", 30, 40, b0 + 0.1, 0.3); // shows the toy camera
    tl.fromTo("#s5-toycam", { y: 776 + 820 }, { y: 776, duration: 0.55, ease: "back.out(1.3)" }, b0 + 0.05);
    const kids = ["s5ben", "s5mia", "s5lotta"];
    kids.forEach((k, i) => { R.popUp(k, w(4, "Kinder") - 0.2 + i * 0.12, 0.5); R.alive(k, b0, b1, 62 + i); R.sfx("pop", w(4, "Kinder") - 0.15 + i * 0.12, 0.5); });
    [1, 2, 3].forEach((i) => { R.pop(`#s5-q${i}`, w(4, "Kinder") + 0.1 + i * 0.1, 0.4, "back.out(3)"); R.wiggle(`#s5-q${i}`, w(4, "Kinder") + 0.5 + i * 0.1, 4, 12, 0.11); });
    // the talk
    const tz = w(4, "Erzählt") - 0.1;
    tl.fromTo("#s5-bubble", { scale: 0, svgOrigin: "600 540" }, { scale: 1, svgOrigin: "600 540", duration: 0.5, ease: "back.out(1.8)" }, tz);
    R.sfx("pop", tz, 0.7);
    R.present(lea, "R", tz + 0.1); R.rest(lea, "R", w(4, "davon") + 0.2);
    R.wiggle("#s5-bflash", tz + 0.5, 6, 14, 0.12, "50% 50%");
    kids.forEach((k, i) => { R.head(k, -7, tz + 0.3 + i * 0.08, 0.5, "sine.inOut"); R.mouth(k, "o", tz + 0.3 + i * 0.08); });
    [1, 2, 3].forEach((i) => R.out(`#s5-q${i}`, w(4, "davon") + i * 0.05));
    kids.forEach((k, i) => { R.mouth(k, "smile", w(4, "davon") + 0.1); R.head(k, 0, w(4, "davon") + 0.3 + i * 0.05, 0.4, "sine.inOut"); });
    // hand the camera to Ben
    const th = w(4, "Wer") - 0.1;
    tl.to("#s5-bubble", { scale: 0, svgOrigin: "600 540", duration: 0.3, ease: "back.in(2)" }, th);
    tl.to("#s5-toycam", { x: 1060, duration: 0.6, ease: "power2.inOut" }, th);
    tl.to("#s5-toycam", { y: 540, duration: 0.3, ease: "power2.out" }, th);
    tl.to("#s5-toycam", { y: 664, duration: 0.3, ease: "power2.in" }, th + 0.3);
    tl.to("#s5-toycam", { rotation: 360, transformOrigin: "50% 50%", duration: 0.6, ease: "power2.inOut" }, th);
    R.sfx("whoosh", th, 0.5);
    R.rest(lea, "L", th); R.present(lea, "R", th + 0.1); R.rest(lea, "R", th + 0.8);
    R.arm("s5ben", "L", 160, 39, th + 0.4, 0.3); R.arm("s5ben", "R", -160, -39, th + 0.4, 0.3);
    // click!
    const tk = w(4, "kennt") + 0.05;
    tl.fromTo("#s5-flash", { scale: 0, opacity: 0.95, transformOrigin: "50% 50%" }, { scale: 3.5, opacity: 0, transformOrigin: "50% 50%", duration: 0.45, ease: "power2.out" }, tk);
    R.sfx("shutter", tk, 0.9);
    ["s5mia", "s5lotta"].forEach((k) => { R.eyes(k, "Wide", tk); R.mouth(k, "o", tk); });
    // ...and laughs
    const tlg = w(4, "lacht") - 0.05;
    tl.to("#s5-toycam", { y: 790, x: 1150, rotation: 380, transformOrigin: "50% 50%", scale: 0.8, duration: 0.35, ease: "power2.out" }, tlg);
    R.rest("s5ben", "L", tlg); R.cheer("s5ben", tlg + 0.05);
    kids.forEach((k, i) => { R.eyes(k, "Happy", tlg + i * 0.06); R.mouth(k, "grin", tlg + i * 0.06); R.hop(k, tlg + 0.05 + i * 0.08, 60, 0.4); });
    R.eyes(lea, "Happy", tlg + 0.2);
    tl.fromTo(".s5-heart", { scale: 0, y: 40, transformOrigin: "50% 50%" }, { scale: 1, y: 0, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(3)", stagger: 0.08 }, tlg + 0.1);
    R.floaty(".s5-heart", tlg + 0.6, b1, 14, 0.5);
    R.sfx("sparkle", tlg + 0.1, 0.7); R.sfx("boing", tlg + 0.1, 0.4);
    tl.set("#s5-flash", { opacity: 0 }, 0);
  }

  // =====================================================================
  // SCENE 6 — Ablauf am Fototag (two panels joined by a camera pan)
  // =====================================================================
  function scene6(R) {
    const tl = R.tl, b0 = B[5], b1 = B[6];
    const X = 1920; // panel B offset
    // ---- panel A: four cards
    const cardX = [150, 580, 1010, 1440], cy = 300;
    const card = (i, color, art, label) => `<g id="s6-card${i}"><g transform="translate(${cardX[i]},${cy})"><rect width="330" height="470" rx="34" fill="#fff" ${A.st(6)}/>` +
      `<rect x="16" y="16" width="298" height="300" rx="24" fill="${color}"/>` +
      `<circle cx="40" cy="40" r="34" fill="${INK}"/><text x="40" y="56" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="44" fill="#fff">${i + 1}</text>` +
      art + `<text x="165" y="400" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="${label.length > 11 ? 40 : 48}" fill="${INK}">${label}</text></g></g>`;
    const art1 = `<g transform="translate(165,300)">${place("s6g1", "mia", -82, 0, 0.56)}${place("s6g2", "ben", 0, 0, 0.6)}${place("s6g3", "noah", 82, 0, 0.56)}</g>`;
    const art2 = `<g id="s6-csun"><g transform="translate(240,110)"><circle r="40" fill="${P.yellow}" ${A.st(5)}/></g></g><g transform="translate(165,175)"><circle r="104" fill="#fff" ${A.st(7)}/>` +
      Array.from({ length: 12 }, (_, i) => `<path d="M 0 -88 v 14" ${A.st(5)} transform="rotate(${i * 30})"/>`).join("") +
      `<g id="s6-hh"><path d="M 0 0 V -50" ${A.st(10)}/></g><g id="s6-mh"><path d="M 0 0 V -76" ${A.st(7)}/></g><circle r="10" fill="${P.coral}" ${A.st(4)}/></g>`;
    const art3 = `<g transform="translate(165,170)"><g id="s6-wsun">${Array.from({ length: 10 }, (_, i) => `<rect x="-9" y="-120" width="18" height="36" rx="9" fill="${P.yellow}" ${A.st(4)} transform="rotate(${i * 36})"/>`).join("")}</g>` +
      `<circle r="82" fill="${P.yellow}" ${A.st(6)}/><g id="s6-sleep"><path d="M -44 -6 q 14 12 28 0 M 16 -6 q 14 12 28 0" fill="none" ${A.st(6)}/><ellipse cx="0" cy="34" rx="10" ry="7" fill="${INK}"/></g>` +
      `<g id="s6-awake" opacity="0"><ellipse cx="-30" cy="-6" rx="10" ry="13" fill="${INK}"/><ellipse cx="30" cy="-6" rx="10" ry="13" fill="${INK}"/><circle cx="-27" cy="-10" r="4" fill="#fff"/><circle cx="33" cy="-10" r="4" fill="#fff"/><path d="M -32 24 q 32 36 64 0 Z" fill="${INK}" ${A.st(4)}/></g>` +
      `<g id="s6-zz"><text x="70" y="-70" font-family="Baloo2" font-weight="800" font-size="46" fill="${P.purple}">z</text><text x="100" y="-100" font-family="Baloo2" font-weight="800" font-size="34" fill="${P.purple}">z</text></g></g>`;
    const art4 = `<g transform="translate(165,190)"><g id="s6-apple"><path d="M 0 -40 C -60 -80, -110 -10, -80 40 C -60 80, -20 80, 0 66 C 20 80, 60 80, 80 40 C 110 -10, 60 -80, 0 -40 Z" fill="${P.tomato}" ${A.st(6)}/><path d="M 0 -40 Q 4 -70 20 -84" fill="none" ${A.st(6)}/><path d="M 10 -70 q 30 -30 56 -10 q -26 26 -56 10 z" fill="${P.grass}" ${A.st(5)}/><ellipse cx="-40" cy="-10" rx="14" ry="22" fill="#fff" opacity=".5"/></g>` +
      `<g id="s6-banana"><g transform="translate(80,60) rotate(-20)"><path d="M -70 -10 Q 0 60 70 -20 Q 60 10 0 30 Q -50 30 -70 -10 Z" fill="${P.yellow}" ${A.st(5)}/></g></g></g>`;
    const panelA = wall("#E2F3FF", "#D3ECFF") +
      `<path d="M 315 820 C 500 860, 650 860, 745 820 S 1000 780, 1175 820 S 1450 860, 1605 820" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="4 22" stroke-linecap="round" opacity=".5"/>` +
      card(0, "#FFE7A8", art1, "kleine Gruppen") + card(1, "#D6F0FF", art2, "vormittags") + card(2, "#FFE0EA", art3, "ausgeschlafen") + card(3, "#DDF6D2", art4, "satt");
    // ---- panel B: the studio
    const pB = (s) => `<g transform="translate(${X},0)">${s}</g>`;
    const mini = (ids, list) => list.map(([who, x, y, s], i) => place(`${ids}${i}`, who, x, y, s)).join("");
    const pol = (i, content) => `<g id="s6-pol${i}"><g transform="scale(1)">${A.polaroid(170, content, "")}</g></g>`;
    const polContent = [
      `<clipPath id="s6-pc1"><rect x="-73" y="-88" width="146" height="146"/></clipPath><g clip-path="url(#s6-pc1)"><rect x="-73" y="-88" width="146" height="146" fill="#FFD4C2"/>${mini("p1", [["mia", 0, 70, 0.34]])}</g>`,
      `<clipPath id="s6-pc2"><rect x="-73" y="-88" width="146" height="146"/></clipPath><g clip-path="url(#s6-pc2)"><rect x="-73" y="-88" width="146" height="146" fill="#FFD4C2"/>${mini("p2", [["emil", -26, 64, 0.3], ["mia", 24, 64, 0.3]])}</g>`,
      `<clipPath id="s6-pc3"><rect x="-73" y="-88" width="146" height="146"/></clipPath><g clip-path="url(#s6-pc3)"><rect x="-73" y="-88" width="146" height="146" fill="#FFD4C2"/>${mini("p3", [["lea", 0, 60, 0.2], ["noah", -50, 66, 0.2], ["ben", -24, 66, 0.2], ["mia", 24, 66, 0.2], ["lotta", 50, 66, 0.2]])}</g>`,
    ];
    const bubbles = [[180, 1, 22], [300, 0, 30], [430, 2, 18], [560, 1, 26], [680, 0, 20], [800, 2, 24]].map(([x, k, r], i) => `<g class="s6-bub"><g transform="translate(${X + 200 + i * 40},${900 - i * 10})"><circle r="${r}" fill="#E8F7FF" fill-opacity=".55" ${A.st(4)}/><circle cx="${-r * 0.35}" cy="${-r * 0.35}" r="${r * 0.22}" fill="#fff"/></g></g>`).join("");
    const panelB = pB(wall("#FFF0E2", "#FFE5CF") + floor(900, "#E8B77E", "#D49A5C") +
      `<path d="M 230 160 V 910 M 1160 160 V 910" ${A.st(12)}/><path d="M 230 160 V 910 M 1160 160 V 910" stroke="#8C8299" stroke-width="10"/>` +
      `<path d="M 260 180 L 1130 180 L 1130 880 Q 1130 950 1200 960 L 190 960 Q 260 950 260 880 Z" fill="#FFD4C2" ${A.st(6)}/><rect x="220" y="150" width="950" height="52" rx="26" fill="#F3B49D" ${A.st(6)}/>` +
      `<path d="M 1300 182 Q 1560 250 1920 182" fill="none" stroke="${INK}" stroke-width="5"/>` +
      `<g id="s6-tripod"><path d="M 1420 650 L 1350 975 M 1420 650 L 1424 990 M 1420 650 L 1490 975" ${A.st(10)}/><path d="M 1420 650 L 1350 975 M 1420 650 L 1424 990 M 1420 650 L 1490 975" stroke="#6A6280" stroke-width="7"/><g transform="translate(1420,600)">${A.camera(150)}</g></g>`) +
      `<g id="s6-subjects">` +
      place("s6lea", "lea", X + 700, 880, 0.92) +
      place("s6noah", "noah", X + 380, 890, 1) + place("s6ben", "ben", X + 530, 890, 1) +
      place("s6emil", "emil", X + 690, 890, 1.05) + place("s6mia", "mia", X + 700, 890, 1.12) + place("s6lotta", "lotta", X + 1010, 890, 1) +
      `</g>` + bubbles +
      place("s6foto", "foto", X + 1665, 1005, 1) +
      [0, 1, 2].map((i) => pol(i + 1, polContent[i])).join("") +
      `<g transform="translate(${X},0)">${confettiBits("s6-conf", 700, 520, 34, 7)}</g>` +
      `<rect id="s6-flash" x="${X}" y="0" width="1920" height="1080" fill="#fff" opacity="0"/>`;
    const ui = `<div id="s6-head" class="title-sm" style="left:150px;top:96px">${ICON.camera}<span>Am Fototag</span></div>` +
      `<div class="steps" style="left:${X + 250}px;top:56px">` +
      ["Einzelporträt", "Geschwister", "Gruppenfoto"].map((s, i) => `<div id="s6-step${i + 1}" class="step"><b>${i + 1}</b><span>${s}</span></div>`).join("") + `</div>`;
    mount("s6", panelA + panelB, ui, 3840);

    // ---------- panel A
    const tA = b0 + 0.05;
    tl.fromTo("#s6-head", { scale: 0, x: 520, y: 360 }, { scale: 1.9, x: 520, y: 360, duration: 0.5, ease: "back.out(2)" }, tA + 0.1);
    tl.to("#s6-head", { scale: 1, x: 0, y: 0, duration: 0.6, ease: "power3.inOut" }, w(5, "kleine") - 0.55);
    R.sfx("pop", tA + 0.15, 0.6);
    const cardsAt = [w(5, "kleine") - 0.12, w(5, "vormittags") - 0.15, w(5, "ausgeschlafen") - 0.15, w(5, "satt") - 0.15];
    cardsAt.forEach((t, i) => {
      tl.fromTo(`#s6-card${i}`, { y: 500, rotation: i % 2 ? 8 : -8, opacity: 0, transformOrigin: "50% 100%" }, { y: 0, rotation: 0, opacity: 1, transformOrigin: "50% 100%", duration: 0.55, ease: "back.out(1.6)" }, t);
      R.sfx("pop", t + 0.1, 0.6);
    });
    ["s6g1", "s6g2", "s6g3"].forEach((k, i) => { R.alive(k, b0, b0 + 7, 70 + i); R.hop(k, cardsAt[0] + 0.55 + i * 0.12, 26, 0.32); R.eyes(k, "Happy", cardsAt[0] + 0.55); R.mouth(k, "grin", cardsAt[0] + 0.55); R.eyes(k, "", cardsAt[0] + 1.5); R.mouth(k, "smile", cardsAt[0] + 1.5); });
    tl.fromTo("#s6-hh", { rotation: -60 }, { rotation: 270, svgOrigin: "0 0", duration: 0.9, ease: "power3.inOut" }, cardsAt[1] + 0.3);
    tl.fromTo("#s6-mh", { rotation: 0 }, { rotation: 900, svgOrigin: "0 0", duration: 0.9, ease: "power3.inOut" }, cardsAt[1] + 0.3);
    tl.fromTo("#s6-csun", { y: 80 }, { y: 0, duration: 0.7, ease: "back.out(2)" }, cardsAt[1] + 0.4);
    R.sfx("tick", cardsAt[1] + 0.5, 0.4); R.sfx("tick", cardsAt[1] + 0.75, 0.4); R.sfx("ding", cardsAt[1] + 1.15, 0.45);
    R.floaty("#s6-zz", cardsAt[2], cardsAt[2] + 1.2, 10, 0.3);
    const wake = w(5, "ausgeschlafen") + 0.75;
    tl.set("#s6-sleep", { opacity: 0 }, wake); tl.set("#s6-awake", { opacity: 1 }, wake);
    tl.to("#s6-zz", { opacity: 0, y: -40, duration: 0.3 }, wake);
    tl.to("#s6-wsun", { rotation: 90, svgOrigin: "0 0", duration: 1.2, ease: "back.out(1.4)" }, wake);
    tl.fromTo("#s6-wsun", { scale: 0.85 }, { scale: 1.08, svgOrigin: "0 0", duration: 0.3, ease: "back.out(3)" }, wake);
    R.sfx("sparkle", wake, 0.6);
    tl.fromTo("#s6-banana", { y: -200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out" }, cardsAt[3] + 0.35);
    R.wiggle("#s6-apple", cardsAt[3] + 0.5, 4, 8, 0.1, "50% 100%");
    R.sfx("boing", cardsAt[3] + 0.5, 0.4);

    // ---------- pan to the studio
    const tpan = w(5, "Erst") - 0.25;
    tl.to("#s6-world", { x: -X, duration: 0.7, ease: "power3.inOut" }, tpan);
    R.sfx("whoosh", tpan, 0.8);

    // steps indicator
    const steps = [w(5, "Einzelport") - 0.1, w(5, "Dann") - 0.05, w(5, "Schluss") - 0.2];
    tl.fromTo(".step", { y: -120 }, { y: 0, duration: 0.5, ease: "back.out(1.8)", stagger: 0.08 }, tpan + 0.4);
    steps.forEach((t, i) => { tl.set(`#s6-step${i + 1}`, { attr: { class: "step on" } }, t); tl.fromTo(`#s6-step${i + 1}`, { scale: 1.25 }, { scale: 1, duration: 0.35, ease: "back.out(3)", immediateRender: false }, t); });

    // photographer
    R.alive("s6foto", tpan, b1, 80);
    tl.set("#s6foto-rig", { scaleX: -1, svgOrigin: "0 0" }, 0);
    R.arm("s6foto", "L", 40, 100, tpan + 0.6);

    // step 1 — Mia solo, playful
    tl.set(["#s6lea-pos", "#s6noah-pos", "#s6ben-pos", "#s6emil-pos", "#s6lotta-pos"], { opacity: 0 }, 0);
    R.riseIn("s6mia", tpan + 0.55, 800, 0.55);
    R.alive("s6mia", tpan, b1, 81);
    R.wave("s6mia", "L", tpan + 0.9, 2);
    R.rest("s6mia", "L", tpan + 1.65);
    const tpl = w(5, "ganz") - 0.15;
    tl.fromTo(".s6-bub", { y: 120, scale: 0, transformOrigin: "50% 50%" }, { y: -560, scale: 1, transformOrigin: "50% 50%", duration: 1.6, ease: "sine.out", stagger: 0.09 }, tpl);
    tl.to(".s6-bub", { x: "+=60", duration: 0.8, ease: "sine.inOut", yoyo: true, repeat: 1, stagger: 0.09 }, tpl);
    tl.to(".s6-bub", { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.12, stagger: 0.09 }, tpl + 1.5);
    R.sfx("bubble", tpl, 0.6); R.sfx("bubble", tpl + 0.35, 0.5); R.sfx("bubble", tpl + 0.7, 0.5);
    R.eyes("s6mia", "Happy", tpl + 0.25); R.mouth("s6mia", "grin", tpl + 0.25); R.hop("s6mia", tpl + 0.3, 40, 0.36);
    R.cheer("s6mia", tpl + 0.3);
    // flash & polaroid helper
    const camTop = [X + 1420, 560];
    const slots = [[X + 1420, 300, -6], [X + 1600, 312, 4], [X + 1790, 300, -3]];
    const shoot = (i, t) => {
      tl.fromTo("#s6-flash", { opacity: 0.85 }, { opacity: 0, duration: 0.45, ease: "power2.out", immediateRender: false }, t);
      R.sfx("shutter", t, 1);
      const [sx, sy, rot] = slots[i - 1];
      tl.fromTo(`#s6-pol${i}`, { x: camTop[0], y: camTop[1], scale: 0.3, rotation: 0 }, { y: camTop[1] - 120, scale: 0.7, duration: 0.35, ease: "power2.out", immediateRender: false }, t + 0.15);
      tl.to(`#s6-pol${i}`, { x: sx, y: sy, scale: 1, rotation: rot, duration: 0.55, ease: "back.out(1.4)" }, t + 0.5);
      tl.to(`#s6-pol${i}`, { rotation: rot - 6, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 3 }, t + 1.05);
      R.sfx("swoosh", t + 0.5, 0.5);
    };
    [1, 2, 3].forEach((i) => tl.set(`#s6-pol${i}`, { x: camTop[0], y: camTop[1], scale: 0 }, 0));
    shoot(1, w(5, "spielerisch") + 0.25);
    R.rest("s6mia", "L", w(5, "spielerisch") + 0.45); R.rest("s6mia", "R", w(5, "spielerisch") + 0.45);
    R.eyes("s6mia", "", w(5, "spielerisch") + 0.6); R.mouth("s6mia", "smile", w(5, "spielerisch") + 0.6);

    // step 2 — siblings
    const t2 = w(5, "Dann") - 0.15;
    tl.set("#s6emil-pos", { opacity: 1 }, t2);
    tl.fromTo("#s6emil-pos", { x: X - 200 }, { x: X + 600, duration: 0.6, ease: "power2.out" }, t2);
    R.run("s6emil", t2, t2 + 0.6, 0.18, 30);
    R.alive("s6emil", t2, b1, 82);
    tl.to("#s6mia-pos", { x: X + 760, duration: 0.45, ease: "power2.inOut" }, t2 + 0.1);
    R.arm("s6mia", "L", 74, 16, t2 + 0.55, 0.35);
    R.eyes("s6emil", "Happy", t2 + 0.6); R.mouth("s6emil", "grin", t2 + 0.6);
    R.head("s6mia", -8, t2 + 0.6, 0.4); R.head("s6emil", 8, t2 + 0.6, 0.4);
    R.sfx("boing", t2 + 0.6, 0.4);
    shoot(2, w(5, "Geschwister") + 0.4);

    // step 3 — everybody
    const t3 = w(5, "Und", 1) - 0.1;
    R.rest("s6mia", "L", t3); R.head("s6mia", 0, t3); R.head("s6emil", 0, t3);
    tl.to("#s6mia-pos", { x: X + 860, duration: 0.4, ease: "power2.inOut" }, t3);
    tl.to("#s6emil-pos", { x: X + 700, duration: 0.4, ease: "power2.inOut" }, t3);
    tl.set(["#s6lea-pos", "#s6noah-pos", "#s6ben-pos", "#s6lotta-pos"], { opacity: 1 }, t3);
    R.riseIn("s6lea", t3 + 0.05, 900, 0.55); R.riseIn("s6noah", t3 + 0.12, 800, 0.5); R.riseIn("s6ben", t3 + 0.2, 800, 0.5); R.riseIn("s6lotta", t3 + 0.28, 800, 0.5);
    R.sfx("boing", t3 + 0.1, 0.5); R.sfx("pop", t3 + 0.25, 0.5); R.sfx("pop", t3 + 0.35, 0.5);
    ["s6lea", "s6noah", "s6ben", "s6lotta"].forEach((k, i) => R.alive(k, t3, b1, 83 + i));
    const tg = w(5, "große") - 0.05;
    ["s6noah", "s6ben", "s6emil", "s6mia", "s6lotta", "s6lea"].forEach((k, i) => {
      R.cheer(k, tg + i * 0.04); R.eyes(k, "Happy", tg + i * 0.04); R.mouth(k, "grin", tg + i * 0.04);
      if (k !== "s6lea") R.hop(k, tg + 0.1 + i * 0.05, 50, 0.4);
    });
    burst(R, "s6-conf", tg + 0.15, 1.1);
    R.sfx("chime", tg + 0.1, 0.7);
    shoot(3, w(5, "Gruppenfoto") - 0.05);
    R.thumbs("s6foto", "R", w(5, "Gruppenfoto") + 0.6);
  }

  // =====================================================================
  // SCENE 7 — Danach: Eltern suchen aus
  // =====================================================================
  function scene7(R) {
    const tl = R.tl, b0 = B[6], b1 = B[7];
    const thumbs = [[P.skyPale, "mia"], [P.mint, "ben"], ["#FFE0EA", "lotta"], ["#FFE7A8", "noah"], ["#FFD4C2", "emil"], ["#E7E0FF", "mia"]];
    let grid = "";
    thumbs.forEach(([c, who], i) => {
      const col = i % 3, row = Math.floor(i / 3); const x = 1290 + col * 168, y = 330 + row * 200;
      grid += `<g id="s7-th${i}"><clipPath id="s7-c${i}"><rect x="${x}" y="${y}" width="150" height="180" rx="16"/></clipPath><g clip-path="url(#s7-c${i})"><rect x="${x}" y="${y}" width="150" height="180" fill="${c}"/>` +
        place(`s7t${i}`, who, x + 75, y + 200, who === "emil" ? 0.42 : 0.4) + `</g><rect x="${x}" y="${y}" width="150" height="180" rx="16" fill="none" ${A.st(4)}/></g>`;
    });
    const tablet = `<g id="s7-tablet"><rect x="1230" y="200" width="620" height="760" rx="48" fill="#3D3550" ${A.st(6)}/><rect x="1262" y="232" width="556" height="696" rx="26" fill="${P.paper}"/>` +
      `<text x="1290" y="296" font-family="Baloo2" font-weight="800" font-size="46" fill="${INK}">Fotos</text>` + `<g transform="translate(1745,262) scale(.9)">${A.heart(0, 0, 22, P.coral)}</g>` +
      grid + `<g id="s7-h1">${A.heart(1290 + 168 + 128, 330 + 30, 26, P.coral)}</g><g id="s7-h2">${A.heart(1290 + 2 * 168 + 128, 530 + 30, 26, P.coral)}</g>` +
      `<g id="s7-finger" transform="translate(1760,1160)"><path d="M -14 0 L -14 -70 Q -14 -86 0 -86 Q 14 -86 14 -70 L 14 -30 L 44 -26 Q 60 -24 60 -6 L 56 50 L -20 50 L -44 14 Q -52 0 -38 -6 Q -28 -10 -14 4 Z" fill="#FFDDBF" ${A.st(5)}/></g></g>`;
    const sofaBack = `<rect x="330" y="540" width="760" height="260" rx="60" fill="${P.coral}" ${A.st(6)}/><path d="M 520 560 v 220 M 710 560 v 220 M 900 560 v 220" stroke="#E86A4B" stroke-width="6"/>`;
    const sofaFront = `<rect x="300" y="760" width="820" height="160" rx="40" fill="#FF8F70" ${A.st(6)}/><rect x="250" y="620" width="130" height="300" rx="50" fill="${P.coral}" ${A.st(6)}/><rect x="1040" y="620" width="130" height="300" rx="50" fill="${P.coral}" ${A.st(6)}/>` +
      `<path d="M 330 920 v 50 M 1090 920 v 50" ${A.st(12)}/><path d="M 330 920 v 50 M 1090 920 v 50" stroke="${P.woodDark}" stroke-width="8"/>`;
    const small = `<g id="s7-smalltab" transform="translate(-6,-232)"><rect x="-56" y="-40" width="112" height="80" rx="12" fill="#3D3550" ${A.st(5)}/><rect x="-46" y="-30" width="92" height="60" rx="6" fill="${P.paper}"/><rect x="-38" y="-22" width="22" height="22" rx="4" fill="${P.pink}"/><rect x="-11" y="-22" width="22" height="22" rx="4" fill="${P.teal}"/><rect x="16" y="-22" width="22" height="22" rx="4" fill="${P.yellow}"/></g>`;
    const svg = wall("#DDEBFF", "#CFE2FF") + floor(930, "#D9B48A", "#C59A6C") +
      `<g transform="translate(560,250)"><rect x="-90" y="-80" width="180" height="150" rx="10" fill="#fff" ${A.st(5)}/><rect x="-70" y="-60" width="140" height="110" fill="${P.mint}"/>${A.star(0, -6, 34, P.yellow)}</g>` +
      `<g transform="translate(850,230)"><rect x="-70" y="-90" width="140" height="180" rx="10" fill="#fff" ${A.st(5)}/><rect x="-52" y="-72" width="104" height="144" fill="#FFE0EA"/>${A.heart(0, 0, 30, P.coral)}</g>` +
      `<g id="s7-plant" transform="translate(150,930)"><path d="M -50 0 L -40 -110 L 40 -110 L 50 0 Z" fill="${P.coral}" ${A.st(5)}/><path d="M 0 -110 C -60 -200, -80 -260, -40 -300 M 0 -110 C 40 -220, 90 -250, 70 -320 M 0 -110 C 0 -200, 10 -260, 0 -330" fill="none" stroke="${P.leaf}" stroke-width="12" stroke-linecap="round"/>` +
      `<ellipse cx="-40" cy="-300" rx="26" ry="14" fill="${P.grass}" ${A.st(4)}/><ellipse cx="70" cy="-320" rx="26" ry="14" fill="${P.grass}" ${A.st(4)}/><ellipse cx="0" cy="-330" rx="14" ry="26" fill="${P.grass}" ${A.st(4)}/></g>` +
      sofaBack + place("s7mama", "mama", 600, 910, 0.95) + place("s7papa", "papa", 840, 910, 0.95, undefined, "", small) + sofaFront +
      `<path id="s7-zoom1" d="M 880 640 L 1230 210" stroke="${INK}" stroke-width="4" stroke-dasharray="10 12"/><path id="s7-zoom2" d="M 880 720 L 1230 950" stroke="${INK}" stroke-width="4" stroke-dasharray="10 12"/>` +
      tablet +
      `<g id="s7-cup" transform="translate(1180,1010)"><path d="M -40 -50 L 40 -50 L 32 0 L -32 0 Z" fill="#fff" ${A.st(5)}/><path d="M 40 -40 q 26 4 14 26 l -18 0" fill="none" ${A.st(5)}/>` +
      `<path class="s7-steam" d="M -14 -64 q -12 -20 0 -40 q 12 -20 0 -40" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".5"/><path class="s7-steam" d="M 12 -64 q -12 -20 0 -40 q 12 -20 0 -40" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".5"/></g>` +
      `<g id="s7-love">${[[620, 360], [720, 300], [820, 380]].map(([x, y]) => `<g class="s7-heart">${A.heart(x, y, 24, P.pink)}</g>`).join("")}</g>`;
    const ui = chip("s7-chip", "heart", "in Ruhe auswählen", 1250, 980 - 2);
    mount("s7", svg, ui);

    R.riseIn("s7mama", b0 + 0.05, 600, 0.55); R.riseIn("s7papa", b0 + 0.12, 600, 0.55);
    R.alive("s7mama", b0, b1, 91); R.alive("s7papa", b0, b1, 92);
    R.hold("s7papa", b0, 0.01);
    tl.fromTo("#s7-smalltab", { y: 600 - 232 }, { y: -232, duration: 0.55, ease: "back.out(1.3)" }, b0 + 0.12);
    tl.fromTo("#s7-tablet", { scale: 0.15, x: -420, y: 120, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, x: 0, y: 0, opacity: 1, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(1.4)" }, w(6, "schauen") - 0.15);
    R.sfx("whoosh", w(6, "schauen") - 0.1, 0.6);
    tl.set(["#s7-zoom1", "#s7-zoom2"], { opacity: 0 }, 0);
    tl.set(["#s7-zoom1", "#s7-zoom2"], { opacity: 0.5 }, w(6, "schauen") + 0.3);
    R.draw("#s7-zoom1, #s7-zoom2", w(6, "schauen") + 0.3, 0.4);
    for (let i = 0; i < 6; i++) { R.pop(`#s7-th${i}`, w(6, "Eltern") - 0.1 + i * 0.07, 0.4, "back.out(2.4)"); R.sfx("pop", w(6, "Eltern") - 0.05 + i * 0.07, 0.25); }
    for (let i = 0; i < 6; i++) R.blinks(`s7t${i}`, b0, b1, 100 + i);
    R.head("s7mama", 8, w(6, "Eltern"), 0.5, "sine.inOut"); R.head("s7papa", -6, w(6, "Eltern"), 0.5, "sine.inOut");
    R.floaty(".s7-steam", b0, b1, 14, 0.7);
    R.pop("#s7-chip", w(6, "Ruhe") - 0.1, 0.5); R.sfx("pop", w(6, "Ruhe"), 0.5);
    // finger taps favourites
    const tf = w(6, "suchen") - 0.2;
    tl.to("#s7-finger", { x: 1533, y: 536, duration: 0.45, ease: "power2.inOut" }, tf);
    tl.to("#s7-finger", { scale: 0.85, transformOrigin: "50% 0%", duration: 0.08, yoyo: true, repeat: 1 }, tf + 0.45);
    R.pop("#s7-h1", tf + 0.5, 0.4, "back.out(3.5)"); R.sfx("tap", tf + 0.47, 0.6); R.sfx("sparkle", tf + 0.52, 0.4);
    tl.to("#s7-finger", { x: 1701, y: 736, duration: 0.35, ease: "power2.inOut" }, tf + 0.7);
    tl.to("#s7-finger", { scale: 0.85, transformOrigin: "50% 0%", duration: 0.08, yoyo: true, repeat: 1 }, tf + 1.05);
    R.pop("#s7-h2", tf + 1.1, 0.4, "back.out(3.5)"); R.sfx("tap", tf + 1.07, 0.6); R.sfx("sparkle", tf + 1.12, 0.4);
    // parents love it
    const tlv = w(6, "Lieblinge") - 0.05;
    R.eyes("s7mama", "Happy", tlv); R.mouth("s7mama", "grin", tlv); R.eyes("s7papa", "Happy", tlv + 0.1); R.mouth("s7papa", "grin", tlv + 0.1);
    R.cheer("s7mama", tlv + 0.05);
    tl.fromTo(".s7-heart", { y: 60, scale: 0, transformOrigin: "50% 50%" }, { y: 0, scale: 1, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(3)", stagger: 0.1 }, tlv);
    R.floaty(".s7-heart", tlv + 0.5, b1, 16, 0.5);
  }

  // =====================================================================
  // SCENE 8 — Outro: Lieblingstag + Ratgeber
  // =====================================================================
  function scene8(R) {
    const tl = R.tl, b0 = B[7], b1 = B[8];
    // photo area (inner) 420..1500 x 110..860  -> frame 380..1540 x 70..1030
    const inner = `<clipPath id="s8-clip"><rect x="420" y="110" width="1080" height="750"/></clipPath>` +
      `<g clip-path="url(#s8-clip)"><g transform="translate(293,110) scale(0.6944)">${sky("s8")}${hills("s8")}</g>` +
      `<g transform="translate(755,387) scale(.45)">${house("s8-house")}</g>` +
      place("s8lea", "lea", 960, 850, 0.88) +
      place("s8noah", "noah", 610, 860, 0.9) + place("s8ben", "ben", 760, 860, 0.9) + place("s8mia", "mia", 1160, 860, 0.9) +
      place("s8emil", "emil", 1290, 860, 0.95) + place("s8lotta", "lotta", 1420, 860, 0.9) +
      confettiBits("s8-conf", 960, 400, 40, 13) + `</g>`;
    const frame = `<g id="s8-frame"><path fill-rule="evenodd" d="M 380 70 H 1540 V 1030 H 380 Z M 420 110 V 860 H 1500 V 110 Z" fill="${P.paper}" ${A.st(7)}/>` +
      `<text x="960" y="975" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="92" fill="${INK}">Lieblingstag</text>` +
      `<g transform="translate(1330,945)">${A.heart(0, 0, 34, P.coral)}</g><g transform="translate(590,945)">${A.star(0, 0, 34, P.yellow)}</g></g>`;
    const svg = wall("#FFF4E3", "#FFE7C7") +
      `<g id="s8-bg-conf">${[[120, 140, P.coral], [1820, 180, P.teal], [160, 900, P.yellow], [1780, 940, P.lilac], [300, 520, P.pink], [1650, 560, P.grass]].map(([x, y, c], i) => `<g class="s8-dot">${i % 2 ? A.star(x, y, 30, c) : A.sparkle(x, y, 30, c)}</g>`).join("")}</g>` +
      `<g id="s8-photo">${inner}${frame}</g>`;
    const hash = "d8ebd109d039401599c504cdf3dcd3f84d167193b74c4eae8f64f272f294eba4";
    const ui = `<div id="s8-card" class="endcard"><div class="end-kicker">Noch mehr Tipps?</div><div class="end-title">Schau in unseren <em>Ratgeber</em></div>` +
      `<div class="url">${ICON.link}<span>kindergarten.melinaweller.de/ratgeber</span></div></div>` +
      `<div id="s8-hash" class="hash">${hash}</div>`;
    mount("s8", svg, ui);

    const cast = ["s8lea", "s8noah", "s8ben", "s8mia", "s8emil", "s8lotta"];
    // start full-bleed: inner photo rect fills the screen
    const k0 = 1920 / 1080;
    tl.set("#s8-photo", { scale: k0, svgOrigin: "960 556", y: -16 }, b0);
    cast.forEach((k, i) => { R.popUp(k, b0 + 0.05 + i * 0.07, 0.5); R.alive(k, b0, b1, 120 + i); });
    R.sfx("pop", b0 + 0.1, 0.5); R.sfx("pop", b0 + 0.3, 0.4);
    R.talk("s8lea", words(7));
    R.wave("s8lea", "R", b0 + 0.2, 2); R.rest("s8lea", "R", b0 + 1.05);
    tl.to("#s8-rays", { rotation: 30, svgOrigin: "0 0", duration: b1 - b0, ease: "none" }, b0);
    // zoom out into a polaroid
    const tz = w(7, "Lieblingstag") - 0.45;
    tl.to("#s8-photo", { scale: 1, y: 0, svgOrigin: "960 556", duration: 0.8, ease: "power3.inOut" }, tz);
    R.sfx("whoosh", tz, 0.7);
    tl.fromTo(".s8-dot", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)", stagger: 0.05 }, tz + 0.5);
    R.floaty(".s8-dot", tz + 1, b1, 12, 0.9);
    const tc = w(7, "Lieblingstag") + 0.25;
    cast.forEach((k, i) => { R.cheer(k, tc + i * 0.03); R.eyes(k, "Happy", tc); if (k !== "s8lea") { R.mouth(k, "grin", tc); R.hop(k, tc + i * 0.05, 40, 0.38); } });
    burst(R, "s8-conf", tc, 1.2);
    R.sfx("shutter", tc - 0.05, 0.8); R.sfx("chime", tc + 0.05, 0.8);
    cast.forEach((k) => { R.rest(k, "L", tc + 1.1); R.rest(k, "R", tc + 1.1); R.eyes(k, "", tc + 1.2); if (k !== "s8lea") R.mouth(k, "smile", tc + 1.2); });
    // polaroid slides left, end card appears
    const te = w(7, "Noch") - 0.25;
    tl.to("#s8-photo", { scale: 0.7, x: -395, y: 0, rotation: -4, svgOrigin: "960 540", duration: 0.75, ease: "power3.inOut" }, te);
    R.sfx("swoosh", te, 0.6);
    tl.fromTo("#s8-card", { x: 260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, te + 0.3);
    tl.fromTo("#s8-card .url", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, w(7, "Ratgeber") - 0.1);
    R.sfx("ding", w(7, "Ratgeber"), 0.7);
    R.point("s8lea", "R", w(7, "Ratgeber") - 0.2);
    tl.fromTo("#s8-hash", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, te + 0.9);
  }

  // ---------- mounting ----------
  function mount(id, svg, ui, width = 1920) {
    const el = document.getElementById(`${id}-cam`);
    el.innerHTML = `<div id="${id}-world" class="world" style="width:${width}px"><svg class="art" width="${width}" height="1080" viewBox="0 0 ${width} 1080">${svg}</svg><div class="ui">${ui}</div></div>`;
  }

  // ---------- transitions (colour iris between scenes) ----------
  function transitions(R) {
    const tl = R.tl;
    const pts = [[1700, 900], [200, 200], [1720, 160], [240, 900], [960, 1100], [1800, 540], [120, 540]];
    const cols = [[P.yellow, P.coral, P.teal], [P.teal, P.lilac, P.yellow], [P.coral, P.yellow, P.purple], [P.lilac, P.teal, P.coral], [P.yellow, P.pink, P.teal], [P.teal, P.yellow, P.coral], [P.pink, P.lilac, P.yellow]];
    let html = "";
    pts.forEach(([x, y], i) => cols[i].forEach((c, j) => { html += `<div class="iris" id="iris${i}-${j}" style="left:${x - 2300}px;top:${y - 2300}px;background:${c}"></div>`; }));
    document.getElementById("wipe").innerHTML = html;
    pts.forEach((p, i) => {
      const t = B[i + 1];
      for (let j = 0; j < 3; j++) {
        const el = `#iris${i}-${j}`;
        tl.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.34, ease: "power2.in", immediateRender: false }, t - 0.36 + j * 0.05 - 0.1);
        tl.to(el, { scale: 0, duration: 0.36, ease: "power2.out" }, t + 0.02 + (2 - j) * 0.05);
      }
      tl.set(`#iris${i}-0, #iris${i}-1, #iris${i}-2`, { scale: 0 }, 0);
      R.sfx("whoosh", t - 0.4, 0.55);
    });
  }

  // ---------- camera drift: every scene breathes slowly ----------
  function drift(R) {
    for (let i = 1; i <= 8; i++) {
      R.tl.fromTo(`#s${i}-cam`, { scale: 1 }, { scale: 1.035, duration: B[i] - B[i - 1], ease: "none", immediateRender: false }, B[i - 1]);
    }
  }

  window.buildScenes = function (tl) {
    window.__SFX = [];
    const R = RIG.make(tl);
    scene1(R); scene2(R); scene3(R); scene4(R); scene5(R); scene6(R); scene7(R); scene8(R);
    transitions(R); drift(R);
    window.__SFX.sort((a, b) => a.t - b.t);
    return R;
  };
})();
