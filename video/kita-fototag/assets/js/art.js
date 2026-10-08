/* Kita-Fototag — hand-built illustration kit.
 * Every character and prop is generated as SVG markup from code so the whole
 * cast shares one line weight, palette and rig. Characters are rigged:
 *   rig (feet origin) > legs, torso, arms (shoulder > elbow > hand), head (neck)
 * and expose ids for eyes, brows and mouth shapes so the timeline can act. */
(function () {
  const INK = "#2B2140";
  const SW = 5; // outline weight shared by every drawing
  const P = {
    ink: INK, cream: "#FFF7EA", paper: "#FFFDF8", yellow: "#FFC93C", mustard: "#F4B63F",
    coral: "#FF7A59", tomato: "#E8553D", pink: "#FF9EB5", rose: "#F28CA6", teal: "#2EC4B6",
    mint: "#BFEFE2", sky: "#8FD3FF", skyPale: "#D6F0FF", grass: "#7BC67E", leaf: "#4FA35A",
    lilac: "#B9A6F5", purple: "#7B6CF6", navy: "#34477A", wood: "#D99A5B", woodDark: "#B5733A",
    blush: "#FF8A8A", white: "#FFFFFF",
  };

  const GEO = {
    adult: { legH: 170, legX: 30, legW: 36, hipY: -160, shY: -374, shHalf: 84, hipHalf: 78,
      headY: -470, rx: 76, ry: 80, upper: 108, fore: 98, limbW: 30, handR: 19, eyeK: 0.105, neckY: -390 },
    kid: { legH: 92, legX: 22, legW: 30, hipY: -90, shY: -226, shHalf: 58, hipHalf: 55,
      headY: -306, rx: 70, ry: 70, upper: 64, fore: 58, limbW: 25, handR: 15, eyeK: 0.13, neckY: -238 },
    tot: { legH: 70, legX: 18, legW: 26, hipY: -68, shY: -172, shHalf: 48, hipHalf: 46,
      headY: -244, rx: 62, ry: 62, upper: 50, fore: 46, limbW: 22, handR: 13, eyeK: 0.14, neckY: -182 },
  };

  const META = {};

  function seg(x1, y1, x2, y2, w, color) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="${w + SW * 2}" stroke-linecap="round"/>` +
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }

  // ---------- hair ----------
  function hairParts(o, g) {
    const { rx, ry } = g; const c = o.hair; const s = `fill="${c}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"`;
    const cap = `<path ${s} d="M ${-rx - 5} ${4} C ${-rx - 10} ${-1.32 * ry}, ${rx + 10} ${-1.32 * ry}, ${rx + 5} ${4} C ${rx * 0.75} ${-0.5 * ry}, ${rx * 0.1} ${-0.62 * ry}, ${-rx * 0.2} ${-0.52 * ry} C ${-rx * 0.55} ${-0.42 * ry}, ${-rx * 0.85} ${-0.3 * ry}, ${-rx - 5} ${4} Z"/>`;
    let back = "", front = "";
    switch (o.hairStyle) {
      case "bun":
        back = `<circle cx="${rx * 0.1}" cy="${-1.12 * ry}" r="${rx * 0.42}" ${s}/>` +
          `<path d="M ${-rx * 0.2} ${-0.98 * ry} q ${rx * 0.3} ${-0.08 * ry} ${rx * 0.6} 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
        front = cap + `<path d="M ${rx * 0.95} ${-0.1 * ry} q ${rx * 0.18} ${0.35 * ry} ${-rx * 0.02} ${0.62 * ry}" ${s}/>`;
        break;
      case "pigtails":
        back = [-1, 1].map((k) => `<g transform="translate(${k * rx * 1.08},${0.05 * ry}) rotate(${k * 18})"><ellipse rx="${rx * 0.3}" ry="${ry * 0.5}" cy="${ry * 0.28}" ${s}/></g>` +
          `<circle cx="${k * rx * 0.98}" cy="${-0.18 * ry}" r="${rx * 0.12}" fill="${o.accent || P.coral}" stroke="${INK}" stroke-width="4"/>`).join("");
        front = cap;
        break;
      case "curly": {
        let bumps = "";
        for (let i = 0; i <= 8; i++) {
          const a = Math.PI * (1.03 + (i / 8) * 0.94);
          bumps += `<circle cx="${Math.cos(a) * rx * 0.98}" cy="${Math.sin(a) * ry * 0.98 - 0.1 * ry}" r="${rx * 0.3}" ${s}/>`;
        }
        front = bumps + `<path d="M ${-rx * 0.85} ${-0.45 * ry} C ${-rx * 0.3} ${-0.9 * ry}, ${rx * 0.3} ${-0.9 * ry}, ${rx * 0.85} ${-0.45 * ry}" fill="${c}" stroke="none"/>`;
        break;
      }
      case "puffs":
        back = [-1, 1].map((k) => `<circle cx="${k * rx * 0.82}" cy="${-0.82 * ry}" r="${rx * 0.42}" ${s}/>`).join("");
        front = cap;
        break;
      case "bob":
        back = `<path ${s} d="M ${-rx - 14} ${-0.2 * ry} C ${-rx - 18} ${0.55 * ry}, ${-rx * 0.7} ${0.75 * ry}, ${-rx * 0.55} ${0.6 * ry} L ${rx * 0.55} ${0.6 * ry} C ${rx * 0.7} ${0.75 * ry}, ${rx + 18} ${0.55 * ry}, ${rx + 14} ${-0.2 * ry} Z"/>`;
        front = `<path ${s} d="M ${-rx - 8} ${0.1 * ry} C ${-rx - 12} ${-1.35 * ry}, ${rx + 12} ${-1.35 * ry}, ${rx + 8} ${0.1 * ry} L ${rx * 0.7} ${-0.38 * ry} L ${-rx * 0.7} ${-0.38 * ry} Z"/>`;
        break;
      case "longbangs":
        back = `<path ${s} d="M ${-rx - 10} ${-0.3 * ry} C ${-rx - 26} ${0.9 * ry}, ${-rx - 6} ${1.5 * ry}, ${-rx * 0.3} ${1.5 * ry} L ${rx * 0.3} ${1.5 * ry} C ${rx + 6} ${1.5 * ry}, ${rx + 26} ${0.9 * ry}, ${rx + 10} ${-0.3 * ry} Z"/>`;
        front = `<path ${s} d="M ${-rx - 8} ${0.25 * ry} C ${-rx - 14} ${-1.35 * ry}, ${rx + 14} ${-1.35 * ry}, ${rx + 8} ${0.25 * ry} C ${rx * 0.9} ${-0.2 * ry}, ${rx * 0.75} ${-0.42 * ry}, ${rx * 0.45} ${-0.46 * ry} C ${rx * 0.1} ${-0.5 * ry}, ${-rx * 0.35} ${-0.3 * ry}, ${-rx * 0.62} ${-0.52 * ry} C ${-rx * 0.8} ${-0.3 * ry}, ${-rx * 0.9} ${-0.1 * ry}, ${-rx - 8} ${0.25 * ry} Z"/>`;
        break;
      case "long":
        back = `<path ${s} d="M ${-rx - 10} ${-0.3 * ry} C ${-rx - 26} ${0.9 * ry}, ${-rx - 6} ${1.5 * ry}, ${-rx * 0.3} ${1.5 * ry} L ${rx * 0.3} ${1.5 * ry} C ${rx + 6} ${1.5 * ry}, ${rx + 26} ${0.9 * ry}, ${rx + 10} ${-0.3 * ry} Z"/>`;
        front = cap;
        break;
      case "short":
        front = `<path ${s} d="M ${-rx - 3} ${-0.1 * ry} C ${-rx - 6} ${-1.3 * ry}, ${rx + 6} ${-1.3 * ry}, ${rx + 3} ${-0.1 * ry} C ${rx * 0.6} ${-0.6 * ry}, ${-rx * 0.6} ${-0.6 * ry}, ${-rx - 3} ${-0.1 * ry} Z"/>` +
          `<path d="M ${-rx * 0.1} ${-1.0 * ry} q ${rx * 0.12} ${-0.3 * ry} ${rx * 0.32} ${-0.22 * ry}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>`;
        break;
      case "beanie":
        back = `<path ${s} d="M ${-rx - 6} ${-0.2 * ry} C ${-rx - 14} ${0.5 * ry}, ${-rx * 0.8} ${0.62 * ry}, ${-rx * 0.62} ${0.5 * ry} L ${rx * 0.62} ${0.5 * ry} C ${rx * 0.8} ${0.62 * ry}, ${rx + 14} ${0.5 * ry}, ${rx + 6} ${-0.2 * ry} Z"/>`;
        front = `<path fill="${o.accent}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" d="M ${-rx - 8} ${-0.38 * ry} C ${-rx - 6} ${-1.45 * ry}, ${rx + 6} ${-1.45 * ry}, ${rx + 8} ${-0.38 * ry} Z"/>` +
          `<rect x="${-rx - 14}" y="${-0.52 * ry}" width="${2 * rx + 28}" height="${0.26 * ry}" rx="${0.12 * ry}" fill="${o.accent2}" stroke="${INK}" stroke-width="${SW}"/>` +
          `<circle cx="0" cy="${-1.24 * ry}" r="${rx * 0.2}" fill="${o.accent2}" stroke="${INK}" stroke-width="${SW}"/>`;
        break;
      default:
        front = cap;
    }
    return { back, front };
  }

  // ---------- torso ----------
  function torso(id, o, g) {
    const { shY, hipY, shHalf: sh, hipHalf: hh } = g;
    const d = `M ${-sh} ${shY + 22} Q ${-sh} ${shY} ${-sh + 26} ${shY} L ${sh - 26} ${shY} Q ${sh} ${shY} ${sh} ${shY + 22} L ${hh} ${hipY + 4} Q ${hh} ${hipY + 18} ${hh - 16} ${hipY + 18} L ${-hh + 16} ${hipY + 18} Q ${-hh} ${hipY + 18} ${-hh} ${hipY + 4} Z`;
    let out = `<path d="${d}" fill="${o.top}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    const midY = (shY + hipY) / 2;
    if (o.cardigan) {
      out += `<path d="M ${-sh} ${shY + 22} Q ${-sh} ${shY} ${-sh + 26} ${shY} L ${-sh * 0.28} ${shY} L ${-sh * 0.2} ${hipY + 18} L ${-hh + 16} ${hipY + 18} Q ${-hh} ${hipY + 18} ${-hh} ${hipY + 4} Z" fill="${o.cardigan}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
      out += `<path d="M ${sh} ${shY + 22} Q ${sh} ${shY} ${sh - 26} ${shY} L ${sh * 0.28} ${shY} L ${sh * 0.2} ${hipY + 18} L ${hh - 16} ${hipY + 18} Q ${hh} ${hipY + 18} ${hh} ${hipY + 4} Z" fill="${o.cardigan}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
      for (let i = 0; i < 3; i++) out += `<circle cx="${sh * 0.36}" cy="${shY + 50 + i * 48}" r="6" fill="${P.paper}" stroke="${INK}" stroke-width="3"/>`;
    }
    if (o.collar) out += `<path d="M ${-26} ${shY} L 0 ${shY + 30} L 26 ${shY}" fill="${o.collar}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    if (o.stripe) out += `<rect x="${-sh + 6}" y="${midY + 6}" width="${2 * sh - 12}" height="${(hipY - shY) * 0.13}" fill="${o.stripe}"/>`;
    if (o.print === "dino") out += dinoPrint(0, midY + 6, (sh * 1.1) / 84);
    if (o.print === "star") out += star(0, midY, sh * 0.32, P.yellow);
    if (o.chestCam) {
      // camera on a strap around the neck — Melina's trademark
      out += `<path d="M ${-sh * 0.42} ${shY + 2} L ${-22} ${shY + 92} M ${sh * 0.42} ${shY + 2} L ${22} ${shY + 92}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M ${-sh * 0.42} ${shY + 2} L ${-22} ${shY + 92} M ${sh * 0.42} ${shY + 2} L ${22} ${shY + 92}" stroke="${o.strapColor || P.paper}" stroke-width="4" stroke-linecap="round"/>` +
        `<g id="${id}-chestcam" transform="translate(0,${shY + 112})">${camera(88, "#3D3550")}</g>`;
    }
    if (o.strap) out += `<path d="M ${-sh + 18} ${shY + 4} L ${sh - 30} ${hipY - 10}" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M ${-sh + 18} ${shY + 4} L ${sh - 30} ${hipY - 10}" stroke="${o.strap}" stroke-width="5" stroke-linecap="round"/>`;
    return out;
  }

  function dinoPrint(cx, cy, k) {
    const g = `fill="#5BC06A" stroke="${INK}" stroke-width="${4 / k}" stroke-linejoin="round"`;
    return `<g transform="translate(${cx},${cy}) scale(${k})">` +
      `<path ${g} d="M -50 18 C -60 -20, -10 -34, 18 -22 C 30 -46, 62 -46, 64 -26 C 66 -12, 50 -8, 36 -8 C 44 10, 30 30, 0 32 L -6 44 L -18 44 L -16 30 L -30 30 L -32 44 L -44 44 L -42 26 C -60 26, -76 30, -86 22 C -72 22, -58 22, -50 18 Z"/>` +
      `<circle cx="50" cy="-28" r="4" fill="${INK}"/>` +
      `<path d="M -40 -12 l 8 -14 l 6 14 M -22 -22 l 8 -14 l 6 14 M -4 -26 l 8 -13 l 6 13" fill="#FFC93C" stroke="${INK}" stroke-width="${3 / k}" stroke-linejoin="round"/>` +
      `<circle cx="-62" cy="-30" r="7" fill="#FF7A59" stroke="${INK}" stroke-width="${3 / k}"/><circle cx="74" cy="12" r="6" fill="#8FD3FF" stroke="${INK}" stroke-width="${3 / k}"/></g>`;
  }

  // ---------- face ----------
  function face(id, o, g) {
    const { rx, ry } = g; const ek = g.eyeK;
    const ex = rx * 0.37, ey = ry * 0.04, er = rx * ek;
    const skin = o.skin;
    let s = "";
    // ears
    s += [-1, 1].map((k) => `<ellipse cx="${k * rx * 0.98}" cy="${ry * 0.1}" rx="${rx * 0.16}" ry="${ry * 0.2}" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`).join("");
    s += `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`;
    return { pre: s, ex, ey, er };
  }

  function features(id, o, g, f) {
    const { rx, ry } = g; const { ex, ey, er } = f;
    let s = "";
    // cheeks
    s += [-1, 1].map((k) => `<ellipse cx="${k * rx * 0.6}" cy="${ry * 0.34}" rx="${rx * 0.15}" ry="${ry * 0.09}" fill="${P.blush}" opacity="0.55"/>`).join("");
    if (o.freckles) s += [-1, 1].map((k) => `<g fill="${INK}" opacity="0.45"><circle cx="${k * rx * 0.52}" cy="${ry * 0.22}" r="2.4"/><circle cx="${k * rx * 0.62}" cy="${ry * 0.18}" r="2.4"/><circle cx="${k * rx * 0.58}" cy="${ry * 0.27}" r="2.4"/></g>`).join("");
    // eyes (open)
    s += `<g id="${id}-eyes">` + [-1, 1].map((k) => `<g id="${id}-eye${k < 0 ? "L" : "R"}"><ellipse cx="${k * ex}" cy="${ey}" rx="${er}" ry="${er * 1.3}" fill="${INK}"/><circle cx="${k * ex + er * 0.35}" cy="${ey - er * 0.5}" r="${er * 0.38}" fill="#fff"/></g>`).join("") + `</g>`;
    // happy eyes ^ ^
    s += `<g id="${id}-eyesHappy" opacity="0">` + [-1, 1].map((k) => `<path d="M ${k * ex - er * 1.3} ${ey + er * 0.5} Q ${k * ex} ${ey - er * 1.6} ${k * ex + er * 1.3} ${ey + er * 0.5}" fill="none" stroke="${INK}" stroke-width="${SW + 1}" stroke-linecap="round"/>`).join("") + `</g>`;
    // wide eyes (surprise)
    s += `<g id="${id}-eyesWide" opacity="0">` + [-1, 1].map((k) => `<ellipse cx="${k * ex}" cy="${ey - 2}" rx="${er * 1.7}" ry="${er * 1.9}" fill="#fff" stroke="${INK}" stroke-width="${SW - 1}"/><circle cx="${k * ex}" cy="${ey}" r="${er * 0.7}" fill="${INK}"/>`).join("") + `</g>`;
    // wink (left open, right closed)
    s += `<g id="${id}-eyesWink" opacity="0"><ellipse cx="${-ex}" cy="${ey}" rx="${er}" ry="${er * 1.3}" fill="${INK}"/><circle cx="${-ex + er * 0.35}" cy="${ey - er * 0.5}" r="${er * 0.38}" fill="#fff"/><path d="M ${ex - er * 1.3} ${ey + er * 0.4} Q ${ex} ${ey - er * 1.4} ${ex + er * 1.3} ${ey + er * 0.4}" fill="none" stroke="${INK}" stroke-width="${SW + 1}" stroke-linecap="round"/></g>`;
    // brows
    s += `<g id="${id}-brows">` + [-1, 1].map((k) => `<path id="${id}-brow${k < 0 ? "L" : "R"}" d="M ${k * ex - er * 1.4} ${ey - er * 2.6} Q ${k * ex} ${ey - er * 3.5} ${k * ex + er * 1.4} ${ey - er * 2.6}" fill="none" stroke="${o.brow || INK}" stroke-width="${SW}" stroke-linecap="round"/>`).join("") + `</g>`;
    // nose
    s += `<path d="M ${-rx * 0.06} ${ry * 0.24} Q 0 ${ry * 0.32} ${rx * 0.06} ${ry * 0.24}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
    if (o.glasses) s += [-1, 1].map((k) => `<circle cx="${k * ex}" cy="${ey}" r="${er * 2.2}" fill="none" stroke="${INK}" stroke-width="5"/>`).join("") + `<path d="M ${-ex + er * 2.2} ${ey} Q 0 ${ey - er} ${ex - er * 2.2} ${ey}" fill="none" stroke="${INK}" stroke-width="5"/>`;
    // mouths — exactly one visible at a time
    const my = ry * 0.5, mw = rx * 0.3;
    const tongue = `#FF7F86`;
    s += `<g id="${id}-mouths">`;
    s += `<path id="${id}-m-smile" d="M ${-mw} ${my - 6} Q 0 ${my + mw * 0.75} ${mw} ${my - 6}" fill="none" stroke="${INK}" stroke-width="${SW + 0.5}" stroke-linecap="round"/>`;
    s += `<g id="${id}-m-open" opacity="0"><path d="M ${-mw * 0.9} ${my - 8} Q 0 ${my + mw * 1.25} ${mw * 0.9} ${my - 8} Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="0" cy="${my + mw * 0.32}" rx="${mw * 0.42}" ry="${mw * 0.2}" fill="${tongue}"/></g>`;
    s += `<g id="${id}-m-o" opacity="0"><ellipse cx="0" cy="${my + 2}" rx="${mw * 0.36}" ry="${mw * 0.5}" fill="${INK}"/></g>`;
    s += `<g id="${id}-m-grin" opacity="0"><path d="M ${-mw * 1.25} ${my - 12} Q 0 ${my + mw * 1.7} ${mw * 1.25} ${my - 12} Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M ${-mw * 0.95} ${my - 8} L ${mw * 0.95} ${my - 8} L ${mw * 0.8} ${my - 1} L ${-mw * 0.8} ${my - 1} Z" fill="#fff"/><ellipse cx="0" cy="${my + mw * 0.6}" rx="${mw * 0.55}" ry="${mw * 0.26}" fill="${tongue}"/></g>`;
    s += `<path id="${id}-m-wobble" opacity="0" d="M ${-mw} ${my + 4} q ${mw * 0.33} -10 ${mw * 0.66} 0 t ${mw * 0.66} 0 t ${mw * 0.66} 0" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>`;
    s += `</g>`;
    if (o.chestCam) s += `<g id="${id}-facecam" opacity="0" transform="translate(0,${ey + 6})">${camera(rx * 2.05, "#3D3550")}</g>`;
    return s;
  }

  // ---------- arms ----------
  function arm(id, side, o, g) {
    const k = side === "L" ? -1 : 1;
    const sx = k * (g.shHalf - 14), sy = g.shY + 18;
    const sleeve = o.cardigan || o.top;
    const foreColor = o.shortSleeve ? o.skin : sleeve;
    const ru = -k * (o.size ? 12 : 9), rf = k * 8;
    return `<g transform="translate(${sx},${sy})"><g id="${id}-arm${side}-u" transform="rotate(${ru})">` +
      seg(0, 0, 0, g.upper, g.limbW, sleeve) +
      `<g transform="translate(0,${g.upper})"><g id="${id}-arm${side}-f" transform="rotate(${rf})">` +
      seg(0, 0, 0, g.fore, g.limbW - 2, foreColor) +
      `<g transform="translate(0,${g.fore})"><g id="${id}-hand${side}">` +
      `<g id="${id}-prop${side}"></g>` +
      `<circle r="${g.handR}" fill="${o.skin}" stroke="${INK}" stroke-width="${SW}"/>` +
      `<g id="${id}-thumb${side}" opacity="0"><rect x="${-g.handR * 0.32}" y="${-g.handR * 2.0}" width="${g.handR * 0.64}" height="${g.handR * 1.4}" rx="${g.handR * 0.32}" fill="${o.skin}" stroke="${INK}" stroke-width="${SW - 1}"/></g>` +
      `</g></g></g></g></g></g>`;
  }

  function legs(id, o, g) {
    let s = "";
    ["L", "R"].forEach((side) => {
      const k = side === "L" ? -1 : 1;
      const x = k * g.legX;
      s += `<g transform="translate(${x},${g.hipY + 6})"><g id="${id}-leg${side}">` +
        seg(0, 0, 0, g.legH - 18, g.legW, o.bottom) +
        `<ellipse cx="${k * 8}" cy="${g.legH - 10}" rx="${g.legW * 0.85}" ry="${g.legW * 0.45}" fill="${o.shoes || INK}" stroke="${INK}" stroke-width="${SW}"/>` +
        `</g></g>`;
    });
    if (o.skirt) {
      const { hipY, hipHalf: hh } = g;
      s += `<path d="M ${-hh - 2} ${hipY - 4} L ${hh + 2} ${hipY - 4} L ${hh + 22} ${hipY + 50} Q 0 ${hipY + 62} ${-hh - 22} ${hipY + 50} Z" fill="${o.skirt}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    }
    return s;
  }

  /** Build a rigged character. Returns markup; geometry is kept in META[id]. */
  function makeChar(id, o) {
    const g = GEO[o.size || "adult"];
    const hp = hairParts(o, g);
    const f = face(id, o, g);
    META[id] = { g, size: o.size || "adult", ey: f.ey, eyeY: g.headY + f.ey };
    const neck = `<rect x="${-g.rx * 0.22}" y="${g.neckY - 14}" width="${g.rx * 0.44}" height="${g.shY - g.neckY + 28}" fill="${o.skin}" stroke="${INK}" stroke-width="${SW}"/>`;
    return `<g id="${id}" class="char"><g id="${id}-rig">` +
      `<ellipse class="shadow" cx="0" cy="4" rx="${g.shHalf * 1.25}" ry="${g.shHalf * 0.22}" fill="${INK}" opacity="0.12"/>` +
      `<g id="${id}-legs">${legs(id, o, g)}</g>` +
      `<g id="${id}-upper">` +
      (o.backArm ? arm(id, "L", o, g) : "") +
      neck + `<g id="${id}-torso">${torso(id, o, g)}</g>` +
      `<g id="${id}-headpivot"><g id="${id}-head" transform="translate(0,${g.headY})">${hp.back}${f.pre}${hp.front}${features(id, o, g, f)}</g></g>` +
      (o.backArm ? "" : arm(id, "L", o, g)) + arm(id, "R", o, g) +
      `</g></g></g>`;
  }

  // ---------- the cast ----------
  const CAST = {
    lea: { skin: "#F2C4A0", hair: "#7A3E2B", hairStyle: "bun", top: P.yellow, cardigan: P.teal, bottom: P.navy, shoes: P.coral, brow: "#5A2B1E" },
    mia: { size: "kid", skin: "#FFDDBF", hair: "#F2A341", hairStyle: "pigtails", accent: P.pink, top: P.mustard, bottom: P.purple, shoes: P.coral, freckles: true, brow: "#B86E1E" },
    miaDino: { size: "kid", skin: "#FFDDBF", hair: "#F2A341", hairStyle: "pigtails", accent: P.pink, top: "#FF5A8C", stripe: "#FFE15A", print: "dino", bottom: P.purple, shoes: P.coral, freckles: true, brow: "#B86E1E" },
    ben: { size: "kid", skin: "#8D5A3B", hair: "#2B1A12", hairStyle: "curly", top: P.tomato, bottom: "#C9A66B", shoes: P.navy, shortSleeve: true },
    emil: { size: "tot", skin: "#FFDDBF", hair: "#F2A341", hairStyle: "short", top: P.sky, bottom: P.navy, shoes: P.tomato, brow: "#B86E1E" },
    noah: { size: "kid", skin: "#6B4029", hair: "#1E120C", hairStyle: "puffs", top: P.grass, bottom: P.navy, shoes: P.yellow },
    lotta: { size: "kid", skin: "#F7D2B5", hair: "#C8502C", hairStyle: "bob", top: P.lilac, bottom: P.teal, shoes: P.purple, freckles: true, brow: "#8C3418" },
    melina: { skin: "#F6D2B6", hair: "#9A6337", hairStyle: "longbangs", top: "#E08A55", collar: P.paper, bottom: "#3E4A6B", shoes: "#8C5A3C", brow: "#6B4226", chestCam: true, strapColor: "#F6E3CF" },
    erz: { skin: "#F2C4A0", hair: "#7A3E2B", hairStyle: "bun", top: P.yellow, cardigan: P.teal, bottom: P.navy, shoes: P.coral, brow: "#5A2B1E" },
    foto: { skin: "#C68A62", hair: "#2B1A12", hairStyle: "beanie", accent: P.coral, accent2: P.yellow, top: P.purple, collar: P.paper, bottom: "#3B3355", shoes: P.ink, strap: P.yellow },
    mama: { skin: "#FFDDBF", hair: "#F2A341", hairStyle: "long", top: P.rose, bottom: P.navy, shoes: P.ink, brow: "#B86E1E" },
    papa: { skin: "#F0C09A", hair: "#5A3A28", hairStyle: "short", top: P.grass, collar: P.paper, bottom: "#3B3355", shoes: P.ink, glasses: true },
  };

  function char(id, who, extra) { return makeChar(id, Object.assign({}, CAST[who], extra || {})); }

  // ---------- props ----------
  const st = (w = SW) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  function star(cx, cy, r, color) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.48 : r;
      d += `${i ? "L" : "M"} ${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
    }
    return `<path d="${d}Z" fill="${color}" ${st(4)}/>`;
  }
  function sparkle(cx, cy, r, color) {
    return `<path d="M ${cx} ${cy - r} Q ${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} Q ${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} Q ${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} Q ${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r} Z" fill="${color || P.yellow}" ${st(4)}/>`;
  }
  function heart(cx, cy, r, color) {
    return `<path d="M ${cx} ${cy + r * 0.9} C ${cx - r * 1.6} ${cy - r * 0.1}, ${cx - r * 0.9} ${cy - r * 1.35}, ${cx} ${cy - r * 0.45} C ${cx + r * 0.9} ${cy - r * 1.35}, ${cx + r * 1.6} ${cy - r * 0.1}, ${cx} ${cy + r * 0.9} Z" fill="${color || P.coral}" ${st(4)}/>`;
  }
  function camera(w, color) {
    const h = w * 0.66;
    return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.12}" fill="${color || "#3D3550"}" ${st()}/>` +
      `<rect x="${-w * 0.18}" y="${-h / 2 - w * 0.12}" width="${w * 0.36}" height="${w * 0.16}" rx="${w * 0.04}" fill="${color || "#3D3550"}" ${st()}/>` +
      `<rect x="${-w / 2}" y="${-h * 0.18}" width="${w}" height="${h * 0.16}" fill="${P.wood}" opacity="0.9"/>` +
      `<circle cx="0" cy="${h * 0.04}" r="${w * 0.27}" fill="#EDE7FF" ${st()}/><circle cx="0" cy="${h * 0.04}" r="${w * 0.17}" fill="#4A4166" ${st(3)}/><circle cx="${w * 0.06}" cy="${h * 0.04 - w * 0.06}" r="${w * 0.05}" fill="#fff"/>` +
      `<circle cx="${w * 0.36}" cy="${-h * 0.32}" r="${w * 0.055}" fill="${P.coral}" ${st(3)}/>`;
  }
  function check(cx, cy, r, color) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color || P.grass}" ${st()}/><path class="tick" d="M ${cx - r * 0.45} ${cy + r * 0.02} L ${cx - r * 0.1} ${cy + r * 0.38} L ${cx + r * 0.5} ${cy - r * 0.35}" fill="none" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  function cross(cx, cy, r) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${P.tomato}" ${st()}/><path d="M ${cx - r * 0.38} ${cy - r * 0.38} L ${cx + r * 0.38} ${cy + r * 0.38} M ${cx + r * 0.38} ${cy - r * 0.38} L ${cx - r * 0.38} ${cy + r * 0.38}" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round"/>`;
  }
  function cloud(cx, cy, k) {
    return `<g transform="translate(${cx},${cy}) scale(${k})"><path d="M -110 30 C -150 30, -150 -20, -105 -22 C -100 -70, -30 -78, -10 -40 C 10 -80, 90 -70, 88 -20 C 140 -24, 150 30, 100 30 Z" fill="#fff" ${st(5 / k)}/></g>`;
  }
  function tree(cx, cy, k) {
    return `<g transform="translate(${cx},${cy}) scale(${k})"><rect x="-14" y="-90" width="28" height="92" rx="8" fill="${P.woodDark}" ${st(5 / k)}/>` +
      `<circle cx="0" cy="-150" r="80" fill="${P.leaf}" ${st(5 / k)}/><circle cx="-50" cy="-110" r="50" fill="${P.grass}" ${st(5 / k)}/><circle cx="48" cy="-118" r="52" fill="${P.grass}" ${st(5 / k)}/>` +
      `<circle cx="-20" cy="-170" r="10" fill="${P.coral}" ${st(3 / k)}/><circle cx="30" cy="-150" r="10" fill="${P.coral}" ${st(3 / k)}/><circle cx="-40" cy="-120" r="10" fill="${P.coral}" ${st(3 / k)}/></g>`;
  }
  function flower(cx, cy, color) {
    return `<g transform="translate(${cx},${cy})"><path d="M 0 0 L 0 -46" stroke="${P.leaf}" stroke-width="6" stroke-linecap="round"/>` +
      [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${Math.cos((a * Math.PI) / 180) * 13}" cy="${-50 + Math.sin((a * Math.PI) / 180) * 13}" rx="11" ry="11" fill="${color}" ${st(3.5)}/>`).join("") +
      `<circle cx="0" cy="-50" r="8" fill="${P.yellow}" ${st(3.5)}/></g>`;
  }
  function polaroid(w, inner, label) {
    const h = w * 1.18, pad = w * 0.07;
    return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${P.paper}" ${st()}/>` +
      `<rect x="${-w / 2 + pad}" y="${-h / 2 + pad}" width="${w - 2 * pad}" height="${w - 2 * pad}" fill="${P.skyPale}" ${st(4)}/>` +
      (inner || "") + (label ? `<text x="0" y="${h / 2 - pad * 1.25}" text-anchor="middle" font-family="Baloo2" font-weight="700" font-size="${w * 0.1}" fill="${INK}">${label}</text>` : "");
  }

  window.ART = { P, INK, SW, GEO, META, CAST, char, makeChar, star, sparkle, heart, camera, check, cross, cloud, tree, flower, polaroid, dinoPrint, st };
})();
