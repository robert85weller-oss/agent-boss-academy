/* Kita-Fototag mit Melina Weller — scene art + choreography.
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

  Object.assign(ICON, {
    laptop: ic(`<rect x="10" y="12" width="44" height="30" rx="5" fill="#fff" ${S}/><path d="M4 48h56l-4 8H8z" fill="${P.lilac}" ${S}/>`),
    phone: ic(`<rect x="18" y="6" width="28" height="52" rx="7" fill="#fff" ${S}/><path d="M28 50h8" ${S}/>`),
    plan: ic(`<rect x="12" y="8" width="40" height="50" rx="6" fill="#fff" ${S}/><path d="M22 22h20M22 32h20M22 42h12" ${S}/>`),
    compass: ic(`<circle cx="32" cy="32" r="24" fill="#fff" ${S}/><path d="M38 24 L28 30 L26 40 L36 34 Z" fill="${P.coral}" ${S}/>`),
    tree: ic(`<path d="M32 58V40" ${S}/><circle cx="32" cy="26" r="18" fill="${P.grass}" ${S}/>`),
    lock: ic(`<rect x="14" y="28" width="36" height="28" rx="6" fill="${P.yellow}" ${S}/><path d="M22 28v-8a10 10 0 0 1 20 0v8" fill="none" ${S}/>`),
    coin: ic(`<ellipse cx="32" cy="44" rx="20" ry="8" fill="${P.yellow}" ${S}/><ellipse cx="32" cy="34" rx="20" ry="8" fill="${P.yellow}" ${S}/><ellipse cx="32" cy="24" rx="20" ry="8" fill="${P.yellow}" ${S}/>`),
    paper: ic(`<path d="M16 6h22l10 10v42H16z" fill="#fff" ${S}/><path d="M24 26h16M24 36h16M24 46h10" ${S}/>`),
    no: ic(`<circle cx="32" cy="32" r="25" fill="${P.tomato}" ${S}/><path d="M22 22l20 20M42 22L22 42" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`),
  });
  const MELINA_COPPER = "#D9804A";

  // ---------- extra props ----------
  const flame = (x, y, k) => `<path transform="translate(${x},${y}) scale(${k})" d="M0 -40 C 18 -18, 26 -4, 14 14 C 8 22, -8 22, -14 14 C -24 0, -14 -14, -4 -22 C -2 -12, 4 -10, 6 -16 Z" fill="${P.yellow}" ${A.st(4 / k)}/>`;
  const ball = (id, x, y, r = 34) => `<g id="${id}"><g transform="translate(${x},${y})"><circle r="${r}" fill="#fff" ${A.st(5)}/>` +
    `<path d="M 0 ${-r * 0.42} L ${r * 0.4} ${-r * 0.12} L ${r * 0.25} ${r * 0.34} L ${-r * 0.25} ${r * 0.34} L ${-r * 0.4} ${-r * 0.12} Z" fill="${INK}"/>` +
    [[0, -1], [0.95, -0.3], [0.6, 0.8], [-0.6, 0.8], [-0.95, -0.3]].map(([dx, dy]) => `<path d="M ${dx * r * 0.45} ${dy * r * 0.45} L ${dx * r} ${dy * r}" ${A.st(4)}/>`).join("") + `</g></g>`;
  const playground = () =>
    `<g id="pg-frame"><path d="M 230 960 L 230 520 M 520 960 L 520 520" ${A.st(16)}/><path d="M 230 960 L 230 520 M 520 960 L 520 520" stroke="${P.coral}" stroke-width="10"/>` +
    `<path d="M 210 520 L 375 400 L 540 520 Z" fill="${P.yellow}" ${A.st(6)}/>` +
    `<rect x="215" y="640" width="320" height="26" rx="8" fill="${P.wood}" ${A.st(5)}/>` +
    `<path d="M 260 700 h 230 M 260 760 h 230 M 260 820 h 230 M 260 880 h 230" stroke="${INK}" stroke-width="6" stroke-linecap="round" opacity=".6"/>` +
    `<path d="M 520 650 C 600 660, 640 800, 720 950 L 760 950 C 690 790, 640 630, 540 620 Z" fill="${P.teal}" ${A.st(6)}/></g>`;
  const sandbox = (x0, x1) => `<g><path d="M ${x0} 900 L ${x1} 900 L ${x1 - 30} 990 L ${x0 + 30} 990 Z" fill="#F4D58D" ${A.st(6)}/>` +
    `<rect x="${x0 - 14}" y="880" width="${x1 - x0 + 28}" height="30" rx="10" fill="${P.wood}" ${A.st(5)}/>` +
    `<path d="M ${x1 - 120} 960 l 16 -40 h 44 l 14 40 z" fill="${P.tomato}" ${A.st(5)}/><path d="M ${x0 + 70} 950 q 40 -40 80 0 z" fill="#E7C47A" ${A.st(4)}/></g>`;

  // =====================================================================
  // SCENE 1 — Intro: "Fototag in der Kita? … Ich bin Melina"
  // =====================================================================
  function scene1(R) {
    const tl = R.tl, b1 = B[1];
    const speed = (side) => `<g class="s1-speed"><path d="M ${side * 70} -300 h ${side * 120} M ${side * 60} -220 h ${side * 170} M ${side * 80} -140 h ${side * 110}" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity=".55"/></g>`;
    const svg =
      sky("s1") + `<g id="s1-cloudA">${A.cloud(330, 210, 0.95)}</g><g id="s1-cloudB">${A.cloud(1120, 150, 0.7)}</g>` +
      `<g id="s1-bunting">${bunting("s1")}</g>` + hills("s1") + house("s1-house") +
      `<g id="s1-tree">${A.tree(170, 905, 1.1)}</g>` + fence(1560, 1930, 905) +
      [[300, P.pink], [380, P.yellow], [1720, P.coral], [1800, P.lilac], [1860, P.yellow]].map(([x, c], i) => `<g class="s1-flower">${A.flower(x, 1010 - (i % 2) * 22, c)}</g>`).join("") +
      place("s1mel", "melina", 520, 995, 1, undefined, "", `<g id="s1-sweat"><path d="M 96 -560 q 18 26 0 40 q -18 -14 0 -40 z" fill="${P.sky}" ${A.st(4)}/></g>` +
        `<g id="s1-scribble"><text x="120" y="-560" font-family="Baloo2" font-weight="800" font-size="110" fill="${P.coral}" stroke="${INK}" stroke-width="8" paint-order="stroke" transform="rotate(12 150 -600)">?!</text></g>`) +
      place("s1noah", "noah", 1090, 995, 0.95, undefined, `<g id="s1-ball"><circle cx="120" cy="-60" r="44" fill="${P.coral}" ${A.st(5)}/><path d="M 76 -60 q 44 -26 88 0 M 120 -104 q -22 44 0 88" fill="none" ${A.st(4)}/></g>`) +
      place("s1ben", "ben", 950, 995, 0.95, undefined, speed(-1)) +
      place("s1mia", "mia", 800, 995, 0.95, undefined, speed(1));
    const ui = `<div id="s1-title" class="title">${"Fototag".split("").map((c, i) => `<span class="s1-letter" style="color:${[P.coral, P.teal, P.yellow, P.purple, P.pink, P.grass, P.coral][i]}">${c}</span>`).join("")}</div>` +
      `<div id="s1-sub" class="pill">${ICON.camera}<span>in der Kita</span></div>` +
      `<div id="s1-name" class="nametag"><b>Melina</b><span>Kita-Fotografin</span></div>`;
    mount("s1", svg, ui);

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
    tl.fromTo(".s1-letter", { y: -220, rotation: -25, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(2.4)", stagger: 0.065 }, 0.42);
    for (let i = 0; i < 7; i++) R.sfx("pop", 0.62 + i * 0.065, 0.45);
    R.pop("#s1-sub", w(0, "in") - 0.05, 0.5);
    R.sfx("pop", w(0, "in"), 0.7);
    tl.to(".s1-letter", { y: -14, duration: 0.18, ease: "power2.out", stagger: { each: 0.05, yoyo: true, repeat: 1 } }, w(0, "Kita") + 0.1);

    const mel = "s1mel";
    R.riseIn(mel, 0.25, 780, 0.7);
    R.sfx("boing", 0.32, 0.6);
    R.rest(mel, "R", R.wave(mel, "R", w(0, "Fototag") - 0.05, 3));
    R.talk(mel, words(0));
    R.alive(mel, 0, b1, 11);
    tl.set(["#s1-sweat", "#s1-scribble"], { opacity: 0 }, 0);

    // "Klingt nach Trubel" — chaos
    const tc = w(0, "Klingt"), freeze = w(0, "Trubel") + 0.42, calm = w(0, "muss") + 0.02;
    R.eyes(mel, "Wide", tc + 0.05); R.brows(mel, -16, tc + 0.05);
    tl.set("#s1-sweat", { opacity: 1 }, tc + 0.15);
    tl.fromTo("#s1-sweat", { y: -10 }, { y: 18, duration: 0.6, ease: "power1.in" }, tc + 0.15);
    tl.set("#s1-scribble", { opacity: 1 }, tc + 0.2);
    tl.fromTo("#s1-scribble", { scale: 0, transformOrigin: "30% 100%" }, { scale: 1, transformOrigin: "30% 100%", duration: 0.35, ease: "back.out(3)" }, tc + 0.2);
    R.wiggle("#s1-scribble", tc + 0.55, 5, 8, 0.1, "30% 100%");
    R.arm(mel, "L", 40, 70, tc + 0.05, 0.25); R.arm(mel, "R", -40, -70, tc + 0.05, 0.25);
    R.sfx("boing", tc + 0.02, 0.8);
    tl.set(".s1-speed", { opacity: 0 }, 0);
    tl.fromTo("#s1ben-pos", { x: -260 }, { x: 1180, duration: freeze - tc, ease: "power1.in" }, tc);
    tl.set("#s1ben-pos .s1-speed", { opacity: 1 }, tc);
    R.run("s1ben", tc, freeze, 0.22, 34);
    R.eyes("s1ben", "Happy", tc); R.mouth("s1ben", "grin", tc);
    R.sfx("whoosh", tc + 0.05, 0.7);
    tl.set("#s1mia-rig", { scaleX: -1, svgOrigin: "0 0" }, 0);
    tl.fromTo("#s1mia-pos", { x: 2150 }, { x: 640, duration: freeze - tc - 0.12, ease: "power1.in" }, tc + 0.12);
    tl.set("#s1mia-pos .s1-speed", { opacity: 1 }, tc + 0.12);
    R.run("s1mia", tc + 0.12, freeze, 0.22, 34);
    R.mouth("s1mia", "grin", tc + 0.12);
    R.sfx("whoosh", tc + 0.2, 0.6);
    R.popUp("s1noah", tc + 0.05, 0.4);
    R.cheer("s1noah", tc + 0.1); R.mouth("s1noah", "grin", tc + 0.1); R.eyes("s1noah", "Happy", tc + 0.1);
    tl.to("#s1noah-rig", { y: -125, duration: freeze - tc - 0.45, ease: "power2.out" }, tc + 0.45);
    tl.set("#s1-ball", { opacity: 0 }, 0); tl.set("#s1-ball", { opacity: 1 }, tc + 0.08);
    tl.fromTo("#s1-ball", { y: 0 }, { y: -170, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }, tc + 0.1);
    tl.to("#s1-ball", { y: -230, x: 30, duration: freeze - tc - 0.7, ease: "power2.out" }, tc + 0.7);
    R.sfx("boing", tc + 0.42, 0.5);
    R.pose("s1ben", 30, freeze); R.pose("s1mia", 30, freeze);
    R.head(mel, 0, freeze + 0.1);
    // "… muss es aber nicht."
    tl.set(["#s1-sweat", "#s1-scribble"], { opacity: 0 }, calm);
    R.eyes(mel, "Wink", calm + 0.12); R.brows(mel, 0, calm);
    R.rest(mel, "L", calm, 0.3); R.thumbs(mel, "R", calm + 0.05);
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
    // "Ich bin Melina"
    const tn = w(0, "Melina") - 0.2;
    R.rest(mel, "R", w(0, "Ich") - 0.05); R.eyes(mel, "", w(0, "Ich"));
    tl.fromTo("#s1-name", { scale: 0, rotation: -14 }, { scale: 1, rotation: -4, duration: 0.55, ease: "back.out(2.2)" }, tn);
    R.sfx("pop", tn + 0.05, 0.8); R.sfx("sparkle", tn + 0.15, 0.4);
    R.hand(mel, "L", 0, tn);
    R.arm(mel, "L", -28, -70, w(0, "Ich") + 0.05, 0.3); // hand to heart
    R.rest(mel, "L", tn + 0.7);
    // "so läuft ein Fototag bei mir ab" — first photo
    const tp = w(0, "so") - 0.05;
    R.photo(mel, tp);
    R.flash(w(0, "Fototag", 2) + 0.15);
    ["s1ben", "s1mia", "s1noah"].forEach((k, i) => { R.eyes(k, "Happy", w(0, "Fototag", 2) + 0.2 + i * 0.05); R.mouth(k, "grin", w(0, "Fototag", 2) + 0.2); R.hop(k, w(0, "Fototag", 2) + 0.25 + i * 0.07, 40, 0.36); });
    R.unphoto(mel, w(0, "mir") + 0.05);
    ["s1ben", "s1mia", "s1noah"].forEach((k, i) => R.alive(k, calm, b1, 20 + i));
  }

  // =====================================================================
  // SCENE 2 — Anmeldung & Elterninfos laufen online
  // =====================================================================
  function scene2(R) {
    const tl = R.tl, b0 = B[1], b1 = B[2];
    const field = (y, label, cls) => `<text x="690" y="${y}" font-family="Nunito" font-weight="800" font-size="24" fill="${INK}" opacity=".6">${label}</text>` +
      `<rect x="690" y="${y + 10}" width="500" height="46" rx="12" fill="#F4F1FB" ${A.st(3)}/><path class="${cls}" d="M 706 ${y + 33} h ${cls === "s2-f1" ? 230 : 180}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    const laptop = `<g id="s2-laptop"><rect x="640" y="200" width="600" height="420" rx="26" fill="#3D3550" ${A.st(6)}/><rect x="664" y="224" width="552" height="372" rx="12" fill="#fff"/>` +
      `<rect x="664" y="224" width="552" height="70" rx="12" fill="${MELINA_COPPER}"/><text x="690" y="272" font-family="Baloo2" font-weight="800" font-size="38" fill="#fff">Anmeldung Fototag</text>` +
      field(330, "Name des Kindes", "s2-f1") + field(420, "Gruppe", "s2-f2") +
      `<g id="s2-btn"><rect x="690" y="512" width="300" height="60" rx="30" fill="${P.grass}" ${A.st(4)}/><text x="840" y="552" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="32" fill="#fff">Anmelden</text></g>` +
      `<g id="s2-ok">${A.check(1130, 540, 38)}</g>` +
      `<path d="M 560 620 L 1320 620 L 1280 680 L 600 680 Z" fill="${P.lilac}" ${A.st(6)}/></g>`;
    const info = (i, label, color, iconBody) => `<g id="s2-info${i}"><g transform="translate(960,420)"><rect x="-150" y="-40" width="300" height="80" rx="20" fill="#fff" ${A.st(5)}/>` +
      `<circle cx="-108" cy="0" r="24" fill="${color}" ${A.st(4)}/>${iconBody}<text x="-72" y="12" font-family="Baloo2" font-weight="800" font-size="32" fill="${INK}">${label}</text></g></g>`;
    const phone = (id) => `<g id="${id}" transform="translate(0,-222)"><rect x="-34" y="-58" width="68" height="116" rx="14" fill="#3D3550" ${A.st(5)}/><rect x="-26" y="-48" width="52" height="88" rx="6" fill="#fff"/>` +
      `<g class="${id}-ping" opacity="0"><circle cx="0" cy="-6" r="16" fill="${P.grass}"/><path d="M -8 -6 l 6 6 l 10 -12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g></g>`;
    const items = `<g id="s2-list"><g transform="translate(700,330)"><rect x="-90" y="-110" width="180" height="230" rx="14" fill="${P.wood}" ${A.st(6)}/><rect x="-70" y="-80" width="140" height="185" rx="6" fill="#fff" ${A.st(4)}/><rect x="-36" y="-124" width="72" height="30" rx="8" fill="#8C8299" ${A.st(4)}/>` +
      [-40, 0, 40, 80].map((y) => `<path d="M -50 ${y - 10} h 18 M -20 ${y - 10} h 70" ${A.st(5)}/>`).join("") + `</g><g id="s2-x1">${A.cross(790, 230, 40)}</g></g>` +
      `<g id="s2-paper"><g transform="translate(1220,340)">${[16, 8, 0].map((d, i) => `<g transform="rotate(${[-10, 6, -2][i]})"><rect x="${-80 + d}" y="${-100 + d}" width="160" height="200" rx="10" fill="#fff" ${A.st(5)}/><path d="M ${-50 + d} ${-50 + d} h 100 M ${-50 + d} ${-15 + d} h 100 M ${-50 + d} ${20 + d} h 70" ${A.st(4)}/></g>`).join("")}</g><g id="s2-x2">${A.cross(1310, 230, 40)}</g></g>`;
    const svg = wall("#FFEFD9", "#FFE2C2") + floor(905) + laptop +
      info(1, "Termin", P.coral, `<path d="M -118 -6 h 20 v 16 h -20 z M -118 -6 h 20" fill="none" stroke="#fff" stroke-width="4"/>`) +
      info(2, "Kleidung & Frisur", P.teal, `<path d="M -118 -8 l 6 -6 h 8 l 6 6 l -4 4 v 14 h -12 v -14 z" fill="#fff"/>`) +
      info(3, "Bilder ansehen", P.purple, `<circle cx="-108" cy="0" r="9" fill="#fff"/>`) +
      place("s2mel", "melina", 330, 1010, 1) + place("s2mama", "mama", 1500, 1010, 0.95, undefined, "", phone("s2ph1")) + place("s2papa", "papa", 1720, 1010, 0.95, undefined, "", phone("s2ph2")) +
      place("s2erz", "erz", 960, 1010, 1) + items;
    const ui = chip("s2-chip1", "laptop", "Online-Anmeldung", 690, 80) + chip("s2-chip2", "no", "Keine Listen, keine Zettel", 600, 80, "chip-dark");
    mount("s2", svg, ui);

    const mel = "s2mel";
    R.riseIn(mel, b0 + 0.05, 800, 0.55); R.alive(mel, b0, b1, 31); R.talk(mel, words(1));
    R.riseIn("s2mama", b0 + 0.25, 700, 0.55); R.riseIn("s2papa", b0 + 0.35, 700, 0.55);
    tl.fromTo("#s2ph1", { y: 700 - 222 }, { y: -222, duration: 0.55, ease: "back.out(1.3)" }, b0 + 0.25);
    tl.fromTo("#s2ph2", { y: 700 - 222 }, { y: -222, duration: 0.55, ease: "back.out(1.3)" }, b0 + 0.35);
    R.hold("s2mama", b0, 0.01); R.hold("s2papa", b0, 0.01);
    R.alive("s2mama", b0, b1, 32); R.alive("s2papa", b0, b1, 33);
    // laptop + form
    const ta = w(1, "Anmeldung") - 0.15;
    tl.fromTo("#s2-laptop", { y: 760, rotation: 4, transformOrigin: "50% 100%" }, { y: 0, rotation: 0, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(1.4)" }, b0 + 0.05);
    R.sfx("swoosh", b0 + 0.08, 0.6);
    R.pop("#s2-chip1", ta, 0.45); R.sfx("pop", ta + 0.05, 0.6);
    R.present(mel, "R", ta);
    R.draw(".s2-f1", ta + 0.15, 0.35, "none"); R.draw(".s2-f2", ta + 0.5, 0.3, "none");
    R.sfx("tick", ta + 0.3, 0.4); R.sfx("tick", ta + 0.65, 0.4);
    tl.to("#s2-btn", { scale: 0.9, transformOrigin: "50% 50%", duration: 0.08, yoyo: true, repeat: 1 }, ta + 0.85);
    R.pop("#s2-ok", ta + 0.95, 0.4, "back.out(3)"); R.sfx("ding", ta + 0.95, 0.5);
    // infos fly to the parents' phones
    const ti = w(1, "Elterninfos") + 0.1;
    [1, 2, 3].forEach((i) => {
      const t = ti + (i - 1) * 0.28, tx = i === 2 ? 1720 : 1500;
      tl.fromTo(`#s2-info${i}`, { x: 0, y: 0, scale: 0, opacity: 1 }, { scale: 1, y: -230 + i * 30, x: 120 + i * 40, duration: 0.35, ease: "back.out(2)" }, t);
      tl.to(`#s2-info${i}`, { x: tx - 960, y: 1010 - 222 * 0.95 - 420, scale: 0.15, duration: 0.5, ease: "power2.in" }, t + 0.5);
      tl.set(`#s2-info${i}`, { opacity: 0 }, t + 1.0);
      tl.set(`.s2ph${i === 2 ? 2 : 1}-ping`, { opacity: 1 }, t + 1.0);
      R.sfx("swoosh", t + 0.5, 0.4); R.sfx("pop", t + 1.0, 0.5);
    });
    R.rest(mel, "R", w(1, "über") - 0.1);
    R.arm(mel, "L", -30, -75, w(1, "über") - 0.05, 0.3); R.rest(mel, "L", w(1, "mich") + 0.5); // "über mich" — hand to chest
    R.eyes("s2mama", "Happy", ti + 1.1); R.mouth("s2mama", "grin", ti + 1.1); R.eyes("s2papa", "Happy", ti + 1.4); R.mouth("s2papa", "grin", ti + 1.4);
    // "Keine Listen, keine Zettel für euch"
    const tk = w(1, "Keine") - 0.3;
    tl.to("#s2-laptop", { y: -900, duration: 0.5, ease: "back.in(1.4)" }, tk);
    tl.to("#s2-chip1", { opacity: 0, duration: 0.2 }, tk);
    R.sfx("whoosh", tk, 0.6);
    R.riseIn("s2erz", tk + 0.15, 800, 0.55); R.alive("s2erz", tk, b1, 34);
    R.pop("#s2-chip2", tk + 0.3, 0.45); R.sfx("pop", tk + 0.35, 0.6);
    tl.fromTo("#s2-list", { y: -600 }, { y: 0, duration: 0.45, ease: "bounce.out" }, tk + 0.25);
    tl.fromTo("#s2-paper", { y: -600 }, { y: 0, duration: 0.45, ease: "bounce.out" }, tk + 0.35);
    R.eyes("s2erz", "Wide", tk + 0.6); R.mouth("s2erz", "o", tk + 0.6);
    R.pop("#s2-x1", w(1, "Listen") + 0.1, 0.35, "back.out(3)"); R.sfx("boing", w(1, "Listen") + 0.1, 0.4);
    tl.to("#s2-list", { y: 900, rotation: -30, transformOrigin: "50% 50%", duration: 0.5, ease: "power2.in" }, w(1, "Listen") + 0.5);
    R.pop("#s2-x2", w(1, "Zettel") - 0.05, 0.35, "back.out(3)"); R.sfx("boing", w(1, "Zettel"), 0.4);
    tl.to("#s2-paper", { x: 900, y: -200, rotation: 60, transformOrigin: "50% 50%", duration: 0.6, ease: "power2.in" }, w(1, "Zettel") + 0.3);
    R.sfx("paper", w(1, "Zettel") + 0.3, 0.6);
    R.eyes("s2erz", "Happy", w(1, "euch") - 0.1); R.mouth("s2erz", "grin", w(1, "euch") - 0.1);
    R.cheer("s2erz", w(1, "euch") - 0.1); R.hop("s2erz", w(1, "euch"), 40, 0.38);
    tl.set(["#s2-x1", "#s2-x2"], { opacity: 1 }, 0);
  }

  // =====================================================================
  // SCENE 3 — Vorab-Infos → Ablaufplan (Orientierung, kein starrer Plan)
  // =====================================================================
  function scene3(R) {
    const tl = R.tl, b0 = B[2], b1 = B[3];
    const qcard = (i, y, color, art, label) => `<g id="s3-q${i}"><g transform="translate(560,${y})"><rect width="340" height="150" rx="26" fill="#fff" ${A.st(6)}/>` +
      `<circle cx="75" cy="75" r="50" fill="${color}" ${A.st(5)}/>${art}<text x="140" y="90" font-family="Baloo2" font-weight="800" font-size="${label.length > 10 ? 30 : 40}" fill="${INK}">${label}</text></g></g>`;
    const groupArt = `<circle cx="58" cy="66" r="13" fill="#fff" ${A.st(4)}/><circle cx="92" cy="66" r="13" fill="#fff" ${A.st(4)}/><circle cx="75" cy="58" r="15" fill="#fff" ${A.st(4)}/><path d="M 44 106 q 31 -40 62 0" fill="#fff" ${A.st(4)}/>`;
    const bowlArt = `<path d="M 45 70 h 60 a 30 30 0 0 1 -60 0 z" fill="#fff" ${A.st(4)}/><path d="M 70 62 l 26 -26" ${A.st(5)}/>`;
    const moonArt = `<path d="M 90 45 a 32 32 0 1 0 12 50 a 26 26 0 1 1 -12 -50 z" fill="#fff" ${A.st(4)}/><text x="90" y="70" font-family="Baloo2" font-weight="800" font-size="22" fill="#fff">z</text>`;
    const rows = [["08:30", "Ankommen", P.yellow], ["09:00", "Gruppe Sonne", "#FFB59E"], ["10:00", "Gruppe Mond", P.lilac], ["11:30", "Mittagessen", P.mint], ["12:30", "Schlafenszeit", P.skyPale], ["13:30", "Gruppe Sterne", P.pink]];
    let rowsSvg = "";
    rows.forEach(([tm, label, c], i) => {
      const y = 290 + i * 102;
      rowsSvg += `<g id="s3-row${i}"><g transform="translate(1110,${y})"><rect width="500" height="82" rx="20" fill="${c}" ${A.st(5)}/>` +
        `<text x="24" y="54" font-family="Nunito" font-weight="800" font-size="30" fill="${INK}">${tm}</text><text x="140" y="54" font-family="Baloo2" font-weight="800" font-size="34" fill="${INK}">${label}</text>` +
        (label.startsWith("Gruppe") ? `<g transform="translate(455,41) scale(.32)">${A.camera(120)}</g>` : "") + `</g></g>`;
    });
    const board = `<g id="s3-board"><rect x="1070" y="140" width="580" height="900" rx="34" fill="#fff" ${A.st(7)}/>` +
      `<rect x="1070" y="140" width="580" height="120" rx="34" fill="${MELINA_COPPER}" ${A.st(7)}/><rect x="1073" y="220" width="574" height="40" fill="${MELINA_COPPER}"/>` +
      `<text x="1360" y="222" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="56" fill="#fff">Ablaufplan</text>` + rowsSvg + `</g>`;
    const svg = wall("#E6F4FF", "#D8ECFB") + floor(940, "#E8C79A", "#D6AE79") +
      qcard(1, 200, P.coral, groupArt, "Gruppen") + qcard(2, 390, P.teal, bowlArt, "Essenszeiten") + qcard(3, 580, P.purple, moonArt, "Schlafenszeiten") +
      board + place("s3mel", "melina", 300, 1030, 1) +
      `<g id="s3-flex"><path d="M 1680 520 C 1760 560, 1760 680, 1690 720" fill="none" stroke="${P.tomato}" stroke-width="8" stroke-linecap="round"/><path d="M 1700 700 l -14 26 l 28 -2 z" fill="${P.tomato}"/></g>`;
    const ui = chip("s3-chip0", "plan", "Vorab-Infos", 580, 70) +
      chip("s3-chip1", "compass", "Orientierung", 560, 790) + chip("s3-chip2", "no", "kein starrer Zeitplan", 520, 900, "chip-dark");
    mount("s3", svg, ui);

    const mel = "s3mel";
    R.riseIn(mel, b0 + 0.05, 820, 0.55); R.alive(mel, b0, b1, 41); R.talk(mel, words(2));
    R.pop("#s3-chip0", b0 + 0.3, 0.45); R.sfx("pop", b0 + 0.35, 0.5);
    R.present(mel, "R", w(2, "frage") - 0.1);
    [["Gruppen", 1], ["Essens", 2], ["Schlafens", 3]].forEach(([word, i]) => {
      const t = w(2, word) - 0.12;
      tl.fromTo(`#s3-q${i}`, { x: -500, rotation: -8, opacity: 0, transformOrigin: "0% 50%" }, { x: 0, rotation: 0, opacity: 1, transformOrigin: "0% 50%", duration: 0.5, ease: "back.out(1.6)" }, t);
      R.sfx("pop", t + 0.1, 0.6);
    });
    R.rest(mel, "R", w(2, "ab") + 0.1);
    // into the plan
    const tp = w(2, "Daraus") - 0.2;
    tl.fromTo("#s3-board", { y: 1000 }, { y: 0, duration: 0.6, ease: "back.out(1.3)" }, tp);
    R.sfx("whoosh", tp, 0.6);
    [1, 2, 3].forEach((i) => {
      tl.to(`#s3-q${i}`, { x: 620, y: 140 + i * 90, scale: 0.25, opacity: 0, transformOrigin: "50% 50%", duration: 0.45, ease: "power2.in" }, tp + 0.35 + i * 0.08);
    });
    rows.forEach((_, i) => {
      tl.fromTo(`#s3-row${i}`, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.35, ease: "back.out(1.8)" }, w(2, "Ablaufplan") + i * 0.11);
      R.sfx("tick", w(2, "Ablaufplan") + i * 0.11 + 0.1, 0.35);
    });
    tl.to("#s3-chip0", { opacity: 0, duration: 0.2 }, tp + 0.3);
    R.thumbs(mel, "R", w(2, "Ablaufplan") + 0.3);
    // Orientierung — not a rigid plan
    R.pop("#s3-chip1", w(2, "Orientierung") - 0.1, 0.45); R.sfx("ding", w(2, "Orientierung"), 0.5);
    R.rest(mel, "R", w(2, "Orientierung"));
    const tf = w(2, "nicht") - 0.1;
    R.pop("#s3-chip2", tf, 0.45); R.sfx("pop", tf, 0.5);
    tl.set("#s3-flex", { opacity: 0 }, 0);
    tl.set("#s3-flex", { opacity: 1 }, tf + 0.2);
    R.draw("#s3-flex path:first-child", tf + 0.2, 0.35);
    // a group runs late: the plan simply flexes
    tl.to("#s3-row2", { y: 204, duration: 0.5, ease: "back.inOut(1.5)" }, tf + 0.35);
    tl.to(["#s3-row3", "#s3-row4"], { y: -102, duration: 0.5, ease: "back.inOut(1.5)" }, tf + 0.35);
    tl.to("#s3-row2", { rotation: -2, transformOrigin: "50% 50%", duration: 0.12, yoyo: true, repeat: 3 }, tf + 0.85);
    R.sfx("swoosh", tf + 0.35, 0.5);
    R.arm(mel, "L", 50, 60, tf + 0.25, 0.35); R.arm(mel, "R", -50, -60, tf + 0.25, 0.35); // relaxed shrug
    R.eyes(mel, "Happy", tf + 0.3); R.head(mel, 6, tf + 0.3, 0.4, "sine.inOut");
  }

  // =====================================================================
  // SCENE 4 — Im Garten: Kinder spielen, ich hole sie nacheinander dazu
  // =====================================================================
  function scene4(R) {
    const tl = R.tl, b0 = B[3], b1 = B[4];
    const pol = (id, x, y) => `<g id="${id}"><g transform="translate(${x},${y}) rotate(-6)">${A.polaroid(110, "", "")}</g></g>`;
    const svg = sky("s4") + hills("s4") + fence(-10, 420, 905) + playground() + sandbox(1420, 1860) +
      `<g id="s4-tree">${A.tree(1250, 905, 0.9)}</g>` +
      place("s4ben", "ben", 375, 640, 0.9) +
      place("s4noah", "noah", 700, 1000, 1, undefined, "", "") + ball("s4-ball", 820, 966, 30) +
      place("s4mel", "melina", 990, 1010, 1) +
      place("s4mia", "mia", 1300, 1000, 1) +
      place("s4lotta", "lotta", 1560, 1010, 0.95) + place("s4erz", "erz", 1760, 1030, 1) +
      `<g id="s4-glow"><ellipse cx="1660" cy="1010" rx="260" ry="46" fill="${P.yellow}" opacity=".55"/></g>` +
      pol("s4-pol1", 1180, 360) + pol("s4-pol2", 840, 360);
    const ui = chip("s4-chip1", "tree", "Freies Spiel im Garten", 120, 70) + chip("s4-chip2", "heart", "Erzieherinnen bleiben im Alltag", 960, 70);
    mount("s4", svg, ui);

    const mel = "s4mel";
    const kids = ["s4ben", "s4noah", "s4mia", "s4lotta"];
    kids.forEach((k, i) => { R.popUp(k, b0 + 0.1 + i * 0.09, 0.45); R.alive(k, b0, b1, 50 + i); });
    R.riseIn(mel, b0 + 0.05, 800, 0.55); R.alive(mel, b0, b1, 55); R.talk(mel, words(3));
    R.riseIn("s4erz", b0 + 0.2, 800, 0.55); R.alive("s4erz", b0, b1, 56);
    R.sfx("pop", b0 + 0.15, 0.4); R.sfx("pop", b0 + 0.35, 0.4);
    R.pop("#s4-chip1", w(3, "spielen") - 0.1, 0.45); R.sfx("pop", w(3, "spielen"), 0.5);
    tl.set("#s4-glow", { opacity: 0 }, 0);
    // free play
    const tpl = w(3, "spielen");
    R.wave("s4ben", "R", tpl, 3); R.mouth("s4ben", "grin", tpl);
    R.arm("s4noah", "R", -20, -10, tpl, 0.2);
    tl.to("#s4noah-legR", { rotation: -40, svgOrigin: "0 0", duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 }, tpl + 0.1);
    tl.to("#s4-ball", { x: -320, duration: 0.7, ease: "power2.out" }, tpl + 0.2);
    tl.to("#s4-ball", { y: -160, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 }, tpl + 0.2);
    tl.to("#s4-ball", { x: 0, duration: 0.8, ease: "power2.inOut" }, tpl + 1.0);
    R.sfx("boing", tpl + 0.2, 0.4);
    R.eyes("s4noah", "Happy", tpl + 0.2); R.mouth("s4noah", "grin", tpl + 0.2);
    R.hop("s4mia", tpl + 0.3, 50, 0.4); R.hop("s4mia", tpl + 0.9, 40, 0.38);
    for (let i = 0; i < 4; i++) { tl.to("#s4lotta-armR-u", { rotation: -60, svgOrigin: "0 0", duration: 0.2, yoyo: true, repeat: 1 }, tpl + i * 0.5); }
    R.sfx("paper", tpl + 0.3, 0.2);
    // fetch one child after another
    const t1 = w(3, "hole") - 0.25;
    R.arm(mel, "R", -120, -40, t1, 0.3); // "komm mal her"
    tl.to(`#${mel}-armR-f`, { rotation: -80, svgOrigin: "0 0", duration: 0.15, yoyo: true, repeat: 3 }, t1 + 0.3);
    tl.to("#s4mia-pos", { x: 1170, duration: 0.45, ease: "power2.inOut" }, t1 + 0.35);
    R.run("s4mia", t1 + 0.35, t1 + 0.8, 0.16, 26);
    const tK = w(3, "Kind", 2);
    R.photo(mel, tK - 0.1);
    R.flash(tK + 0.3);
    R.eyes("s4mia", "Happy", tK + 0.2); R.mouth("s4mia", "grin", tK + 0.2); R.cheer("s4mia", tK + 0.2);
    tl.fromTo("#s4-pol1", { scale: 0, y: 120, transformOrigin: "50% 50%" }, { scale: 1, y: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2)" }, tK + 0.4);
    tl.to("#s4-pol1", { y: -500, rotation: 20, transformOrigin: "50% 50%", duration: 1.2, ease: "power1.in" }, tK + 1.0);
    tl.to("#s4mia-pos", { x: 1300, duration: 0.45, ease: "power2.inOut" }, w(3, "anderen") - 0.1);
    R.rest("s4mia", "L", w(3, "anderen") - 0.1); R.rest("s4mia", "R", w(3, "anderen") - 0.1);
    // … and the next one
    const t2 = w(3, "anderen");
    tl.to("#s4noah-pos", { x: 810, duration: 0.4, ease: "power2.inOut" }, t2 - 0.15);
    tl.to("#s4-ball", { x: 110, duration: 0.4, ease: "power2.inOut" }, t2 - 0.15);
    R.flash(w(3, "dazu") + 0.05);
    R.cheer("s4noah", w(3, "dazu"));
    tl.fromTo("#s4-pol2", { scale: 0, y: 120, transformOrigin: "50% 50%" }, { scale: 1, y: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2)" }, w(3, "dazu") + 0.15);
    tl.to("#s4-pol2", { y: -500, rotation: -20, transformOrigin: "50% 50%", duration: 1.2, ease: "power1.in" }, w(3, "dazu") + 0.7);
    R.unphoto(mel, w(3, "eure") - 0.1);
    R.rest("s4noah", "L", w(3, "eure")); R.rest("s4noah", "R", w(3, "eure"));
    // the Erzieherin stays in her day
    const te = w(3, "Erzieherinnen") - 0.1;
    R.present(mel, "R", te);
    tl.set("#s4-glow", { opacity: 1 }, te);
    tl.fromTo("#s4-glow", { scale: 0.4, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2)" }, te);
    R.pop("#s4-chip2", te + 0.05, 0.45); R.sfx("ding", te + 0.1, 0.5);
    R.wave("s4erz", "L", te + 0.15, 3); R.eyes("s4erz", "Happy", te + 0.2); R.mouth("s4erz", "grin", te + 0.2);
    R.eyes("s4lotta", "Happy", te + 0.2); R.mouth("s4lotta", "grin", te + 0.2); R.hop("s4lotta", te + 0.3, 40, 0.38);
    tl.to("#s4-tree", { rotation: 2, transformOrigin: "50% 100%", duration: 1.2, yoyo: true, repeat: 5, ease: "sine.inOut" }, b0);
  }

  // =====================================================================
  // SCENE 5 — "Bitte lächeln!" gibt es nicht · Was möchtest du machen?
  // =====================================================================
  function scene5(R) {
    const tl = R.tl, b0 = B[4], b1 = B[5];
    const X = 1920;
    const lava = `<g transform="translate(${X},0)"><path d="M 900 905 C 1100 870, 1300 940, 1500 900 S 1800 880, 1940 905 L 1940 1080 L 900 1080 Z" fill="#FF7A3D" ${A.st(6)}/>` +
      `<path d="M 960 990 q 60 -24 120 0 M 1260 1030 q 70 -26 140 0 M 1600 980 q 60 -24 120 0" fill="none" stroke="${P.yellow}" stroke-width="8" stroke-linecap="round"/>` +
      `<g class="s5-flames">${flame(1000, 950, 0.9)}${flame(1380, 990, 1.1)}${flame(1760, 950, 0.9)}</g>` +
      [1000, 1210, 1430, 1660].map((x, i) => `<ellipse cx="${x}" cy="${930 + (i % 2) * 18}" rx="80" ry="30" fill="#8C8299" ${A.st(6)}/>`).join("") + `</g>`;
    const thought = `<g id="s5-think"><circle cx="1290" cy="560" r="16" fill="#fff" ${A.st(5)}/><circle cx="1330" cy="500" r="24" fill="#fff" ${A.st(5)}/>` +
      `<path d="M 1360 120 Q 1360 80 1420 80 L 1800 80 Q 1860 80 1860 140 L 1860 400 Q 1860 460 1800 460 L 1420 460 Q 1360 460 1360 400 Z" fill="#fff" ${A.st(6)}/>` +
      `<g class="s5-idea">${ball("s5-tb", 1470, 190, 44)}</g>` +
      `<g class="s5-idea"><g transform="translate(1640,180)"><ellipse rx="70" ry="26" fill="#8C8299" ${A.st(5)}/>${flame(-10, -10, 0.8)}</g></g>` +
      `<g class="s5-idea"><g transform="translate(1480,360)"><path d="M -60 20 C -60 -30, -10 -50, 20 -30 C 30 -60, 70 -60, 70 -30 C 70 -10, 50 -6, 40 -6 C 50 20, 30 40, -20 40 Z" fill="#5BC06A" ${A.st(5)}/><circle cx="56" cy="-34" r="5" fill="${INK}"/></g></g>` +
      `<g class="s5-idea"><g transform="translate(1720,350) rotate(30)"><path d="M 0 -70 C 30 -40, 30 20, 20 40 L -20 40 C -30 20, -30 -40, 0 -70 Z" fill="#fff" ${A.st(5)}/><circle cx="0" cy="-14" r="12" fill="${P.sky}" ${A.st(4)}/><path d="M -20 40 l 20 26 l 20 -26" fill="${P.coral}" ${A.st(4)}/></g></g></g>`;
    const svgA = sky("s5") + hills("s5") + fence(-10, 600, 905) +
      `<g id="s5-bitte"><path d="M 180 130 L 760 130 Q 810 130 810 180 L 810 330 Q 810 380 760 380 L 560 380 L 640 460 L 470 380 L 180 380 Q 130 380 130 330 L 130 180 Q 130 130 180 130 Z" fill="#fff" ${A.st(6)}/>` +
      `<text x="470" y="282" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="84" fill="${INK}">„Bitte lächeln!“</text>` +
      `<path id="s5-strike" d="M 170 340 L 780 170" stroke="${P.tomato}" stroke-width="22" stroke-linecap="round"/></g>` +
      `<g id="s5-ask"><path d="M 560 90 L 1120 90 Q 1170 90 1170 140 L 1170 240 Q 1170 290 1120 290 L 760 290 L 700 360 L 700 290 L 560 290 Q 510 290 510 240 L 510 140 Q 510 90 560 90 Z" fill="${MELINA_COPPER}" ${A.st(6)}/>` +
      `<text x="840" y="210" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="46" fill="#fff">Was möchtest du machen?</text></g>` +
      place("s5mia", "mia", 1120, 1000, 1.25) + place("s5mel", "melina", 560, 1010, 1) + thought;
    const svgB = `<g transform="translate(${X},0)">${sky("s5b")}${hills("s5b")}</g>` + lava +
      place("s5ben", "ben", X + 290, 1000, 1.05) + ball("s5-ball", X + 430, 966, 34) +
      `<g id="s5-goal"><g transform="translate(${X + 700},560)"><rect x="0" y="0" width="200" height="360" fill="none" stroke="#fff" stroke-width="16"/><rect x="0" y="0" width="200" height="360" fill="none" ${A.st(4)}/>` +
      Array.from({ length: 5 }, (_, i) => `<path d="M ${40 * i + 20} 0 v 360" stroke="#fff" stroke-width="3" opacity=".7"/>`).join("") + `</g></g>` +
      place("s5mel2", "melina", X + 540, 1010, 0.92) + place("s5lotta", "lotta", X + 1000, 930, 0.95);
    const ui = `<div style="position:absolute;left:${X + 260}px;top:70px">${chip("s5-chip1", "heart", "Fußball", 0, 0)}</div>` +
      `<div style="position:absolute;left:${X + 1180}px;top:70px">${chip("s5-chip2", "heart", "Lava-Steine", 0, 0)}</div>`;
    mount("s5", svgA + svgB, ui, 3840);

    const mel = "s5mel";
    // "Bitte lächeln!" — not with me
    R.popUp("s5mia", b0 + 0.05, 0.5); R.alive("s5mia", b0, b1, 61);
    tl.fromTo("#s5-bitte", { scale: 0, transformOrigin: "60% 100%" }, { scale: 1, transformOrigin: "60% 100%", duration: 0.45, ease: "back.out(2)" }, w(4, "Bitte") - 0.15);
    R.sfx("pop", w(4, "Bitte") - 0.1, 0.7);
    R.eyes("s5mia", "Wide", w(4, "Bitte") + 0.2); R.mouth("s5mia", "wobble", w(4, "Bitte") + 0.2); R.brows("s5mia", 8, w(4, "Bitte") + 0.2);
    tl.set("#s5-strike", { opacity: 0 }, 0);
    tl.set("#s5-strike", { opacity: 1 }, w(4, "kein") - 0.05);
    R.draw("#s5-strike", w(4, "kein") - 0.05, 0.25, "power2.out");
    R.sfx("swoosh", w(4, "kein"), 0.6);
    tl.to("#s5-bitte", { scale: 0, rotation: -20, transformOrigin: "60% 100%", duration: 0.35, ease: "back.in(2)" }, w(4, "Kind") + 0.35);
    R.eyes("s5mia", "", w(4, "Kind") + 0.3); R.mouth("s5mia", "smile", w(4, "Kind") + 0.3); R.brows("s5mia", 0, w(4, "Kind") + 0.3);
    // "Ich frage: Was möchtest du machen?"
    R.riseIn(mel, w(4, "Ich") - 0.25, 820, 0.5); R.alive(mel, b0, b1, 62);
    R.talk(mel, words(4), w(4, "Ich") - 0.1, w(4, "Dann") - 0.05);
    R.head(mel, 8, w(4, "frage"), 0.4, "sine.inOut");
    tl.fromTo("#s5-ask", { scale: 0, transformOrigin: "35% 100%" }, { scale: 1, transformOrigin: "35% 100%", duration: 0.45, ease: "back.out(2)" }, w(4, "Was") - 0.15);
    R.sfx("pop", w(4, "Was") - 0.1, 0.7);
    R.present(mel, "R", w(4, "Was"));
    tl.fromTo("#s5-think", { scale: 0, transformOrigin: "0% 100%" }, { scale: 1, transformOrigin: "0% 100%", duration: 0.45, ease: "back.out(1.8)" }, w(4, "machen") + 0.1);
    tl.fromTo(".s5-idea", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(3)", stagger: 0.12 }, w(4, "machen") + 0.35);
    R.sfx("sparkle", w(4, "machen") + 0.35, 0.5);
    R.head("s5mia", -8, w(4, "machen") + 0.1, 0.4, "sine.inOut");
    R.eyes("s5mia", "Happy", w(4, "machen") + 0.5); R.mouth("s5mia", "grin", w(4, "machen") + 0.5); R.hop("s5mia", w(4, "machen") + 0.55, 50, 0.4);
    // pan to the playground: football + lava
    const tp = w(4, "Dann") - 0.3;
    tl.to("#s5-world", { x: -X, duration: 0.7, ease: "power3.inOut" }, tp);
    R.sfx("whoosh", tp, 0.8);
    const m2 = "s5mel2";
    R.alive(m2, tp, b1, 63); R.alive("s5ben", tp, b1, 64); R.alive("s5lotta", tp, b1, 65);
    R.talk(m2, words(4), w(4, "Dann") - 0.05);
    const tk = w(4, "Fußball") - 0.15;
    R.pop("#s5-chip1", tk, 0.45);
    tl.to("#s5ben-legR", { rotation: -55, svgOrigin: "0 0", duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, tk);
    tl.to("#s5-ball", { x: 460, duration: 0.6, ease: "power1.out" }, tk + 0.1);
    tl.to("#s5-ball", { y: -330, duration: 0.3, ease: "power2.out" }, tk + 0.1);
    tl.to("#s5-ball", { y: -80, duration: 0.3, ease: "power2.in" }, tk + 0.4);
    tl.to("#s5-ball", { rotation: 540, transformOrigin: "50% 50%", duration: 0.6 }, tk + 0.1);
    R.sfx("boing", tk + 0.1, 0.5); R.sfx("chime", tk + 0.65, 0.4);
    R.cheer("s5ben", tk + 0.6); R.eyes("s5ben", "Happy", tk + 0.6); R.mouth("s5ben", "grin", tk + 0.6); R.hop("s5ben", tk + 0.65, 50, 0.4);
    R.photo(m2, tk - 0.2); R.flash(tk + 0.7);
    R.unphoto(m2, w(4, "oder") + 0.05);
    // balancing over lava stones — Melina joins in
    const tb = w(4, "balancieren") - 0.15;
    R.pop("#s5-chip2", tb, 0.45); R.sfx("pop", tb, 0.5);
    tl.to(`#${m2}-pos`, { x: X + 860, duration: 0.5, ease: "power2.inOut" }, tb - 0.2);
    R.run(m2, tb - 0.2, tb + 0.3, 0.2, 22);
    R.balance(m2, tb + 0.3); R.balance("s5lotta", tb);
    const stones = [1210, 1430, 1660];
    stones.forEach((x, i) => {
      const t = tb + 0.25 + i * 0.42;
      tl.to("#s5lotta-pos", { x: X + x, duration: 0.36, ease: "power1.inOut" }, t);
      tl.to("#s5lotta-pos", { y: 930 + ((i + 1) % 2) * 18 - 60, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, t);
      R.sfx("tick", t + 0.36, 0.5);
    });
    tl.to(`#${m2}-pos`, { x: X + 1000, y: 950, duration: 0.4, ease: "power1.inOut" }, tb + 0.9);
    tl.to(`#${m2}-rig`, { rotation: 6, svgOrigin: "0 0", duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, tb + 0.5);
    R.eyes("s5lotta", "Happy", tb + 0.4); R.mouth("s5lotta", "grin", tb + 0.4);
    R.eyes(m2, "Happy", tb + 0.6);
    tl.to(".s5-flames path", { scaleY: 1.25, transformOrigin: "50% 100%", duration: 0.25, yoyo: true, repeat: 15, ease: "sine.inOut", stagger: 0.08 }, tp);
    R.cheer("s5lotta", tb + 1.6);
  }

  // =====================================================================
  // SCENE 6 — Online-Galerie: ansehen, bestellen, kein Papierkram
  // =====================================================================
  function scene6(R) {
    const tl = R.tl, b0 = B[5], b1 = B[6];
    const thumbs = [[P.skyPale, "mia"], [P.mint, "ben"], ["#FFE0EA", "lotta"], ["#FFE7A8", "noah"], ["#FFD4C2", "emil"], ["#E7E0FF", "mia"]];
    let grid = "";
    thumbs.forEach(([c, who], i) => {
      const col = i % 3, row = Math.floor(i / 3); const x = 1290 + col * 168, y = 330 + row * 200;
      grid += `<g id="s6-th${i}"><clipPath id="s6-c${i}"><rect x="${x}" y="${y}" width="150" height="180" rx="16"/></clipPath><g clip-path="url(#s6-c${i})"><rect x="${x}" y="${y}" width="150" height="180" fill="${c}"/>` +
        place(`s6t${i}`, who, x + 75, y + 200, who === "emil" ? 0.42 : 0.4) + `</g><rect x="${x}" y="${y}" width="150" height="180" rx="16" fill="none" ${A.st(4)}/></g>`;
    });
    const lockScreen = `<g id="s6-lock"><rect x="1262" y="232" width="556" height="696" rx="26" fill="#FFF4EA"/>` +
      `<g id="s6-shackle"><path d="M 1500 470 v -50 a 40 40 0 0 1 80 0 v 50" fill="none" ${A.st(12)}/><path d="M 1500 470 v -50 a 40 40 0 0 1 80 0 v 50" fill="none" stroke="#C9C2D6" stroke-width="6"/></g>` +
      `<rect x="1470" y="460" width="140" height="110" rx="18" fill="${MELINA_COPPER}" ${A.st(6)}/><circle cx="1540" cy="505" r="12" fill="${INK}"/><path d="M 1540 510 v 26" ${A.st(8)}/>` +
      `<rect x="1340" y="620" width="400" height="74" rx="20" fill="#fff" ${A.st(5)}/>` +
      [0, 1, 2, 3, 4, 5].map((i) => `<circle class="s6-dot" cx="${1400 + i * 56}" cy="657" r="13" fill="${INK}"/>`).join("") +
      `<text x="1540" y="770" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="40" fill="${INK}">Passwort</text></g>`;
    const tablet = `<g id="s6-tablet"><rect x="1230" y="200" width="620" height="760" rx="48" fill="#3D3550" ${A.st(6)}/><rect x="1262" y="232" width="556" height="696" rx="26" fill="${P.paper}"/>` +
      `<text x="1290" y="296" font-family="Baloo2" font-weight="800" font-size="44" fill="${INK}">Online-Galerie</text>` +
      grid + `<g id="s6-h1">${A.heart(1290 + 168 + 128, 330 + 30, 26, P.coral)}</g><g id="s6-h2">${A.heart(1290 + 2 * 168 + 128, 530 + 30, 26, P.coral)}</g>` +
      `<g id="s6-buy"><rect x="1300" y="770" width="480" height="96" rx="48" fill="${P.grass}" ${A.st(5)}/><text x="1540" y="832" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="46" fill="#fff">Bestellen</text></g>` +
      `<g id="s6-done">${A.check(1540, 818, 56)}</g>` + lockScreen +
      `<g id="s6-finger"><g transform="translate(1760,1160)"><path d="M -14 0 L -14 -70 Q -14 -86 0 -86 Q 14 -86 14 -70 L 14 -30 L 44 -26 Q 60 -24 60 -6 L 56 50 L -20 50 L -44 14 Q -52 0 -38 -6 Q -28 -10 -14 4 Z" fill="#FFDDBF" ${A.st(5)}/></g></g></g>`;
    const sofaBack = `<rect x="330" y="540" width="760" height="260" rx="60" fill="${P.coral}" ${A.st(6)}/><path d="M 520 560 v 220 M 710 560 v 220 M 900 560 v 220" stroke="#E86A4B" stroke-width="6"/>`;
    const sofaFront = `<rect x="300" y="760" width="820" height="160" rx="40" fill="#FF8F70" ${A.st(6)}/><rect x="250" y="620" width="130" height="300" rx="50" fill="${P.coral}" ${A.st(6)}/><rect x="1040" y="620" width="130" height="300" rx="50" fill="${P.coral}" ${A.st(6)}/>` +
      `<path d="M 330 920 v 50 M 1090 920 v 50" ${A.st(12)}/><path d="M 330 920 v 50 M 1090 920 v 50" stroke="${P.woodDark}" stroke-width="8"/>`;
    const small = `<g id="s6-smalltab" transform="translate(-6,-232)"><rect x="-56" y="-40" width="112" height="80" rx="12" fill="#3D3550" ${A.st(5)}/><rect x="-46" y="-30" width="92" height="60" rx="6" fill="${P.paper}"/><rect x="-38" y="-22" width="22" height="22" rx="4" fill="${P.pink}"/><rect x="-11" y="-22" width="22" height="22" rx="4" fill="${P.teal}"/><rect x="16" y="-22" width="22" height="22" rx="4" fill="${P.yellow}"/></g>`;
    const svg = wall("#DDEBFF", "#CFE2FF") + floor(930, "#D9B48A", "#C59A6C") +
      `<g transform="translate(150,930)"><path d="M -50 0 L -40 -110 L 40 -110 L 50 0 Z" fill="${P.coral}" ${A.st(5)}/><path d="M 0 -110 C -60 -200, -80 -260, -40 -300 M 0 -110 C 40 -220, 90 -250, 70 -320 M 0 -110 C 0 -200, 10 -260, 0 -330" fill="none" stroke="${P.leaf}" stroke-width="12" stroke-linecap="round"/>` +
      `<ellipse cx="-40" cy="-300" rx="26" ry="14" fill="${P.grass}" ${A.st(4)}/><ellipse cx="70" cy="-320" rx="26" ry="14" fill="${P.grass}" ${A.st(4)}/><ellipse cx="0" cy="-330" rx="14" ry="26" fill="${P.grass}" ${A.st(4)}/></g>` +
      sofaBack + place("s6mama", "mama", 600, 910, 0.95) + place("s6papa", "papa", 840, 910, 0.95, undefined, "", small) + sofaFront +
      `<path id="s6-zoom1" d="M 880 640 L 1230 210" stroke="${INK}" stroke-width="4" stroke-dasharray="10 12"/><path id="s6-zoom2" d="M 880 720 L 1230 950" stroke="${INK}" stroke-width="4" stroke-dasharray="10 12"/>` +
      tablet +
      `<g id="s6-love">${[[620, 360], [720, 300], [820, 380]].map(([x, y]) => `<g class="s6-heart">${A.heart(x, y, 24, P.pink)}</g>`).join("")}</g>`;
    const ui = chip("s6-chip0", "lock", "passwortgeschützt", 1250, 990) +
      chip("s6-chip1", "coin", "Kein Geld einsammeln", 90, 70, "chip-x") + chip("s6-chip2", "paper", "Kein Papierkram", 90, 180, "chip-x");
    mount("s6", svg, ui);

    R.riseIn("s6mama", b0 + 0.05, 600, 0.55); R.riseIn("s6papa", b0 + 0.12, 600, 0.55);
    R.alive("s6mama", b0, b1, 91); R.alive("s6papa", b0, b1, 92);
    R.hold("s6papa", b0, 0.01);
    tl.fromTo("#s6-smalltab", { y: 600 - 232 }, { y: -232, duration: 0.55, ease: "back.out(1.3)" }, b0 + 0.12);
    const tz = w(5, "sehen") - 0.1;
    tl.fromTo("#s6-tablet", { scale: 0.15, x: -420, y: 120, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, x: 0, y: 0, opacity: 1, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(1.4)" }, tz);
    R.sfx("whoosh", tz, 0.6);
    tl.set(["#s6-zoom1", "#s6-zoom2"], { opacity: 0 }, 0);
    tl.set(["#s6-zoom1", "#s6-zoom2"], { opacity: 0.5 }, tz + 0.4);
    R.draw("#s6-zoom1, #s6-zoom2", tz + 0.4, 0.4);
    R.head("s6mama", 8, w(5, "Eltern"), 0.5, "sine.inOut"); R.head("s6papa", -6, w(5, "Eltern"), 0.5, "sine.inOut");
    // password → unlock
    const tpw = w(5, "passwort") - 0.05;
    tl.fromTo(".s6-dot", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.12, ease: "back.out(3)", stagger: 0.11 }, tpw);
    for (let i = 0; i < 6; i++) R.sfx("tick", tpw + i * 0.11, 0.35);
    R.pop("#s6-chip0", tpw, 0.45);
    tl.to("#s6-shackle", { y: -36, duration: 0.25, ease: "back.out(3)" }, w(5, "Online") - 0.05);
    R.sfx("click", w(5, "Online"), 0.7);
    tl.to("#s6-lock", { opacity: 0, scale: 1.1, transformOrigin: "50% 50%", duration: 0.3 }, w(5, "Galerie") - 0.1);
    for (let i = 0; i < 6; i++) { R.pop(`#s6-th${i}`, w(5, "Galerie") - 0.05 + i * 0.06, 0.4, "back.out(2.4)"); R.sfx("pop", w(5, "Galerie") + i * 0.06, 0.25); }
    for (let i = 0; i < 6; i++) R.blinks(`s6t${i}`, b0, b1, 100 + i);
    tl.set("#s6-chip0", { opacity: 0 }, w(5, "Galerie") + 0.2);
    // order right there
    const tf = w(5, "und", 1) - 0.25;
    tl.to("#s6-finger", { x: 1533 - 1760, y: 536 - 1160, duration: 0.4, ease: "power2.inOut" }, tf);
    R.pop("#s6-h1", tf + 0.42, 0.4, "back.out(3.5)"); R.sfx("tap", tf + 0.4, 0.6);
    tl.to("#s6-finger", { x: 1700 - 1760, y: 736 - 1160, duration: 0.3, ease: "power2.inOut" }, tf + 0.55);
    R.pop("#s6-h2", tf + 0.87, 0.4, "back.out(3.5)"); R.sfx("tap", tf + 0.85, 0.6);
    tl.to("#s6-finger", { x: 1540 - 1760, y: 900 - 1160, duration: 0.3, ease: "power2.inOut" }, tf + 1.05);
    tl.to("#s6-buy", { scale: 0.92, transformOrigin: "50% 50%", duration: 0.08, yoyo: true, repeat: 1 }, tf + 1.35);
    R.sfx("tap", tf + 1.35, 0.6);
    tl.set("#s6-done", { opacity: 0 }, 0);
    tl.set("#s6-buy", { opacity: 0 }, tf + 1.55); tl.set("#s6-done", { opacity: 1 }, tf + 1.55);
    tl.fromTo("#s6-done", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(3)", immediateRender: false }, tf + 1.55);
    R.sfx("ding", tf + 1.6, 0.6); R.sfx("sparkle", tf + 1.6, 0.4);
    tl.to("#s6-finger", { y: 0, x: 0, duration: 0.4, ease: "power2.in" }, tf + 1.7);
    R.eyes("s6mama", "Happy", tf + 1.6); R.mouth("s6mama", "grin", tf + 1.6); R.eyes("s6papa", "Happy", tf + 1.7); R.mouth("s6papa", "grin", tf + 1.7);
    R.cheer("s6mama", tf + 1.65);
    tl.fromTo(".s6-heart", { y: 60, scale: 0, transformOrigin: "50% 50%" }, { y: 0, scale: 1, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(3)", stagger: 0.1 }, tf + 1.7);
    R.floaty(".s6-heart", tf + 2.2, b1, 16, 0.5);
    // no cash, no paperwork
    R.pop("#s6-chip1", w(5, "Kein") - 0.05, 0.45); R.sfx("pop", w(5, "Kein"), 0.6);
    R.pop("#s6-chip2", w(5, "kein", 1) - 0.05, 0.45); R.sfx("pop", w(5, "kein", 1), 0.6);
  }

  // =====================================================================
  // SCENE 7 — Outro: Kinder dürfen Kind sein · Ratgeber
  // =====================================================================
  function scene7(R) {
    const tl = R.tl, b0 = B[6], b1 = B[7];
    const inner = `<clipPath id="s7-clip"><rect x="420" y="110" width="1080" height="750"/></clipPath>` +
      `<g clip-path="url(#s7-clip)"><g transform="translate(293,110) scale(0.6944)">${sky("s7")}${hills("s7")}</g>` +
      `<g transform="translate(330,600) scale(.62)">${playground()}</g>` + ball("s7-ball", 1180, 820, 26) +
      place("s7erz", "erz", 1360, 850, 0.82) +
      place("s7noah", "noah", 610, 860, 0.9) + place("s7ben", "ben", 760, 860, 0.9) + place("s7mia", "mia", 960, 860, 0.9) +
      place("s7emil", "emil", 1090, 860, 0.95) + place("s7lotta", "lotta", 1230, 860, 0.9) +
      confettiBits("s7-conf", 960, 400, 40, 13) + `</g>`;
    const frame = `<g id="s7-frame"><path fill-rule="evenodd" d="M 380 70 H 1540 V 1030 H 380 Z M 420 110 V 860 H 1500 V 110 Z" fill="${P.paper}" ${A.st(7)}/>` +
      `<text x="960" y="975" text-anchor="middle" font-family="Baloo2" font-weight="800" font-size="88" fill="${INK}">Einfach Kind sein</text>` +
      `<g transform="translate(1400,945)">${A.heart(0, 0, 32, P.coral)}</g><g transform="translate(520,945)">${A.star(0, 0, 32, P.yellow)}</g></g>`;
    const svg = wall("#FFF4E3", "#FFE7C7") +
      `<g id="s7-bg-conf">${[[120, 140, P.coral], [1820, 180, P.teal], [160, 900, P.yellow], [1780, 940, P.lilac], [300, 520, P.pink], [1650, 560, P.grass]].map(([x, y, c], i) => `<g class="s7-dot">${i % 2 ? A.star(x, y, 30, c) : A.sparkle(x, y, 30, c)}</g>`).join("")}</g>` +
      `<g id="s7-photo">${inner}${frame}</g>` + place("s7mel", "melina", 1560, 1090, 0.95);
    const hash = "d8ebd109d039401599c504cdf3dcd3f84d167193b74c4eae8f64f272f294eba4";
    const ui = `<div id="s7-card" class="endcard"><div class="brand"><div class="mono">MW</div><div><div class="wm">Melina Weller</div><div class="wm-sub">Photography</div></div></div>` +
      `<div class="end-kicker">Noch mehr Tipps?</div><div class="end-title">Mehr in meinem <em>Ratgeber</em></div>` +
      `<div class="url">${ICON.link}<span>kindergarten.melinaweller.de/ratgeber</span></div></div>` +
      `<div id="s7-hash" class="hash">${hash}</div>`;
    mount("s7", svg, ui);

    const kids = ["s7noah", "s7ben", "s7mia", "s7emil", "s7lotta"];
    const k0 = 1920 / 1080;
    tl.set("#s7-photo", { scale: k0, svgOrigin: "960 556", y: -16 }, b0);
    kids.forEach((k, i) => { R.popUp(k, b0 + 0.05 + i * 0.07, 0.5); R.alive(k, b0, b1, 120 + i); });
    R.popUp("s7erz", b0 + 0.3, 0.5); R.alive("s7erz", b0, b1, 126);
    R.sfx("pop", b0 + 0.1, 0.5); R.sfx("pop", b0 + 0.3, 0.4);
    tl.to("#s7-rays", { rotation: 30, svgOrigin: "0 0", duration: b1 - b0, ease: "none" }, b0);
    // "Die Kinder dürfen Kind sein" — everyone plays
    const tk = w(6, "Kinder");
    kids.forEach((k, i) => { R.hop(k, tk + i * 0.12, 50, 0.4); R.eyes(k, "Happy", tk + i * 0.1); R.mouth(k, "grin", tk + i * 0.1); });
    R.cheer("s7mia", tk + 0.2); R.wave("s7ben", "R", tk + 0.1, 2); R.cheer("s7emil", tk + 0.4);
    tl.to("#s7-ball", { x: -180, y: -120, rotation: -300, transformOrigin: "50% 50%", duration: 0.5, ease: "power2.out", yoyo: true, repeat: 1 }, tk + 0.2);
    R.sfx("boing", tk + 0.2, 0.4);
    // "Ich kümmere mich um die Fotos" — Melina steps in and shoots
    const mel = "s7mel";
    R.riseIn(mel, w(6, "Ich") - 0.35, 700, 0.5); R.alive(mel, b0, b1, 127);
    R.talk(mel, words(6), w(6, "Ich") - 0.1);
    R.photo(mel, w(6, "kümmere") - 0.05);
    const tf = w(6, "Fotos") + 0.05;
    R.flash(tf, 0.8); R.sfx("chime", tf + 0.1, 0.6);
    burst(R, "s7-conf", tf, 1.2);
    kids.forEach((k) => R.cheer(k, tf + 0.05));
    tl.to("#s7-photo", { scale: 1, y: 0, svgOrigin: "960 556", duration: 0.8, ease: "power3.inOut" }, tf + 0.1);
    R.sfx("whoosh", tf + 0.1, 0.6);
    tl.fromTo(".s7-dot", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)", stagger: 0.05 }, tf + 0.6);
    R.floaty(".s7-dot", tf + 1.1, b1, 12, 0.9);
    R.unphoto(mel, tf + 0.5);
    kids.forEach((k) => { R.rest(k, "L", tf + 1.0); R.rest(k, "R", tf + 1.0); R.eyes(k, "", tf + 1.1); R.mouth(k, "smile", tf + 1.1); });
    // end card
    const te = w(6, "Mehr") - 0.3;
    tl.to("#s7-photo", { scale: 0.7, x: -395, y: 0, rotation: -4, svgOrigin: "960 540", duration: 0.75, ease: "power3.inOut" }, te);
    tl.to(`#s7mel-pos`, { x: 165, duration: 0.8, ease: "power2.inOut" }, te);
    R.run(mel, te, te + 0.8, 0.22, 20);
    R.sfx("swoosh", te, 0.6);
    tl.fromTo("#s7-card", { x: 260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, te + 0.3);
    tl.fromTo("#s7-card .url", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, w(6, "Ratgeber") - 0.1);
    R.sfx("ding", w(6, "Ratgeber"), 0.7);
    R.point(mel, "R", w(6, "Ratgeber") - 0.1);
    R.eyes(mel, "Wink", w(6, "Ratgeber") + 0.6);
    tl.fromTo("#s7-hash", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, te + 0.9);
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
    pts.slice(0, B.length - 2).forEach(([x, y], i) => cols[i].forEach((c, j) => { html += `<div class="iris" id="iris${i}-${j}" style="left:${x - 2300}px;top:${y - 2300}px;background:${c}"></div>`; }));
    document.getElementById("wipe").innerHTML = html;
    pts.slice(0, B.length - 2).forEach((p, i) => {
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
    for (let i = 1; i < B.length; i++) {
      R.tl.fromTo(`#s${i}-cam`, { scale: 1 }, { scale: 1.035, duration: B[i] - B[i - 1], ease: "none", immediateRender: false }, B[i - 1]);
    }
  }

  window.buildScenes = function (tl) {
    window.__SFX = [];
    const R = RIG.make(tl);
    scene1(R); scene2(R); scene3(R); scene4(R); scene5(R); scene6(R); scene7(R);
    transitions(R); drift(R);
    window.__SFX.sort((a, b) => a.t - b.t);
    return R;
  };
})();
