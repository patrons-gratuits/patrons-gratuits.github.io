/* Patron A4 « feuille virtuelle » : les pièces sont rangées sur une grande feuille découpée en pages A4 avec bandes de recouvrement.
   Les pièces dérivées (doublures, parementure, entoilages) sont superposées à la pièce dont elles dérivent.
   UMD : window.PatternSheet / module.exports. Dépend de PatternPDF (largeurs de police, échappement). */
(function () {
  'use strict';
  const PT = 72 / 2.54, MARGIN = 10 / 25.4 * 72, CELL = 0.5, GAP = 1, OVc = 1.5, TH = 34, FT = 12;
  const f = n => (+n).toFixed(2);
  const BASE = () => (typeof window !== 'undefined' ? window.PatternPDF : require('./pdf.js'));
  const COL = { cut: [0.620, 0.106, 0.071], blue: [0.165, 0.365, 0.690], green: [0, 0.561, 0.345], orange: [0.851, 0.451, 0.024], vio: [0.710, 0.275, 0.541], gry: [0.5, 0.5, 0.5], gryT: [0.33, 0.33, 0.33], drk: [0.2, 0.2, 0.2], blk: [0, 0, 0] };
  const rg = c => c.map(f).join(' ');
  const TXT = {
    fr: {
      plan: 'Plan d’assemblage (%n pages de patron)',
      intro: ['Imprimez à 100 % (sans mise à l’échelle) et contrôlez le carré de 5 x 5 cm.', 'Assemblez les pages numérotées selon le plan, en superposant les bandes de recouvrement de 1,5 cm.', 'Découpez chaque pièce dans la grande feuille obtenue.', 'Les pièces à décalquer (doublures, entoilages…) sont superposées à la pièce dont elles dérivent.'],
      square: 'carré de contrôle 5 x 5 cm', legend: 'Légende', cutl: 'Ligne de coupe (marge de couture comprise)', seam: 'Ligne de couture', fold: 'Repli', place: 'Emplacement de poche ou de patte', btn: 'Boutonnière', notch: 'Cran (repère de montage)', pli: 'Pli du tissu : symbole « Placer sur le pli du tissu »',
      over: 'Pièces superposées (à décalquer)', dbl: 'Doublure', par: 'Parementure', thm: 'Entoilage',
      same: 'Là où un seul trait apparaît, les deux pièces ont le même contour.', sa1: 'Les contours superposés sont donnés marge de couture comprise,', sa2: 'sauf les entoilages, tracés sans marge.',
      recap: 'Récapitulatif des pièces', direct: 'Pièces à découper directement', trace: 'Pièces à décalquer (superposées)', no: 'N°', cut: 'À découper', fab: 'Tissu', on: 'sur',
      star: '* Plusieurs exemplaires symétriques : l’un des deux est à inverser.', total: 'Total : %n pièces à découper.',
      page: 'Page %p - colonne %c, ligne %r', right: 'droite', below: 'dessous', left: 'gauche', above: 'dessus', pg: 'page', fabPli: ' (sur le pli)', created: 'Créé le ', foot: ' - page ', comp: ' - compensation x', drfil: 'Droit fil', placepli: 'Placer sur le pli du tissu'
    },
    en: {
      plan: 'Assembly plan (%n pattern pages)',
      intro: ['Print at 100% (no scaling) and check the 5 x 5 cm square.', 'Join the numbered pages following the plan, overlapping the 1.5 cm overlap strips.', 'Cut each piece out of the large sheet you obtain.', 'Pieces to trace (linings, interfacings…) are stacked on the piece they derive from.'],
      square: 'check square 5 x 5 cm', legend: 'Key', cutl: 'Cutting line (seam allowance included)', seam: 'Sewing line', fold: 'Fold line', place: 'Pocket or tab position', btn: 'Buttonhole', notch: 'Notch (matching mark)', pli: 'Fabric fold: “Place on fold of fabric” symbol',
      over: 'Stacked pieces (to trace)', dbl: 'Lining', par: 'Facing', thm: 'Interfacing',
      same: 'Where only one line appears, both pieces have the same outline.', sa1: 'Stacked outlines include the seam allowance,', sa2: 'except interfacings, which are drawn without allowance.',
      recap: 'Pieces summary', direct: 'Pieces to cut directly', trace: 'Pieces to trace (stacked)', no: 'No.', cut: 'To cut', fab: 'Fabric', on: 'on',
      star: '* Several symmetrical copies: one of them has to be flipped.', total: 'Total: %n pieces to cut.',
      page: 'Page %p - column %c, row %r', right: 'right', below: 'below', left: 'left', above: 'above', pg: 'page', fabPli: ' (on the fold)', created: 'Created on ', foot: ' - page ', comp: ' - compensation x', drfil: 'Grain line', placepli: 'Place on fold of fabric'
    }
  };
  /* pièces dérivées : nom d’origine du moteur -> pièce hôte */
  const OVR = { DoublureDos: 'Dos', DoublureDevant: 'Devant', Parementure: 'Devant', ParementureThermo: 'Devant', DevantThermo1: 'Devant', DevantThermo2: 'Devant', ColThermo: 'Col', DoublureManche1: 'Manche1', DoublureManche2: 'Manche2' };
  const catOf = e => /^Doublure/.test(e) ? 'dbl' : /^Parementure$/.test(e) ? 'par' : 'thm';
  const STY = { dbl: { col: COL.vio, tcol: COL.vio, da: [9, 2, 1.5, 2, 1.5, 2], w: 0.9 }, par: { col: COL.gry, tcol: COL.gryT, da: [10, 3], w: 0.9 }, thm: { col: COL.drk, tcol: COL.drk, da: [1, 2.5], w: 1.4 } };
  const FREE = { Epaule: 1 };

  /* ---------- géométrie ---------- */
  const arr = pts => pts.map(q => [q.x, q.y]);
  const outline = p => p.sa || p.poly;
  const rota = (pts, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return pts.map(q => [c * q[0] - s * q[1], s * q[0] + c * q[1]]); };
  const minOf = pts => { let x = 1e9, y = 1e9; pts.forEach(q => { x = Math.min(x, q[0]); y = Math.min(y, q[1]); }); return [x, y]; };
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = []; for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    const up = []; for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    lo.pop(); up.pop(); return lo.concat(up);
  }
  function inpoly(q, x, y) { let c = false; for (let i = 0, j = q.length - 1; i < q.length; j = i++) { if ((q[i][1] > y) !== (q[j][1] > y) && x < ((q[j][0] - q[i][0]) * (y - q[i][1])) / (q[j][1] - q[i][1]) + q[i][0]) c = !c; } return c; }

  /* ---------- masque de rangement ---------- */
  function maskOf(pts, dil) { // pts en cm, min = 0 ; retourne {rows:[Uint32Array], h, w}
    const mn = minOf(pts), P = pts.map(q => [(q[0] - mn[0]) / CELL + dil, (q[1] - mn[1]) / CELL + dil]);
    let mx = 0, my = 0; P.forEach(q => { mx = Math.max(mx, q[0]); my = Math.max(my, q[1]); });
    const W = Math.ceil(mx) + 1 + dil, H = Math.ceil(my) + 1 + dil;
    const g = []; for (let r = 0; r < H; r++) g.push(new Uint8Array(W));
    for (let r = 0; r < H; r++) {
      const y = r + 0.5, xs = [];
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      xs.sort((u, v) => u - v);
      for (let k = 0; k + 1 < xs.length; k += 2) { const c0 = Math.max(0, Math.ceil(xs[k] - 0.5)), c1 = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5)); for (let c = c0; c <= c1; c++) g[r][c] = 1; }
    }
    // contour : les cellules traversées par le bord comptent (pièces fines)
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2)); for (let k = 0; k <= n; k++) { const x = Math.floor(a[0] + (b[0] - a[0]) * k / n), y = Math.floor(a[1] + (b[1] - a[1]) * k / n); if (y >= 0 && y < H && x >= 0 && x < W) g[y][x] = 1; } }
    return { g, W, H };
  }
  function dilate(m, d) {
    if (!d) return m;
    const { g, W, H } = m, a = [], o = [];
    for (let r = 0; r < H; r++) { const row = new Uint8Array(W); for (let c = 0; c < W; c++) { if (g[r][c]) for (let k = Math.max(0, c - d); k <= Math.min(W - 1, c + d); k++) row[k] = 1; } a.push(row); }
    for (let r = 0; r < H; r++) { const row = new Uint8Array(W); for (let k = Math.max(0, r - d); k <= Math.min(H - 1, r + d); k++) { const s = a[k]; for (let c = 0; c < W; c++) if (s[c]) row[c] = 1; } o.push(row); }
    return { g: o, W, H };
  }
  function bits(m) { const nw = (m.W + 31) >> 5, rows = []; for (let r = 0; r < m.H; r++) { const w = new Uint32Array(nw); const s = m.g[r]; for (let c = 0; c < m.W; c++) if (s[c]) w[c >> 5] |= (1 << (c & 31)); rows.push(w); } return { rows, nw, W: m.W, H: m.H }; }

  /* ---------- rangement ---------- */
  function nest(hosts, Wc, order, step) {
    const Hc = Math.round(450 / CELL), NW = (Wc >> 5) + 3;
    const occ = []; for (let r = 0; r < Hc; r++) occ.push(new Uint32Array(NW));
    let cur = 0; const placed = [], inkCells = [];
    for (const h of order) {
      const base = h.hull; let best = null;
      const angs = [0, 90, 180, 270];
      if (h.free) { angs.length = 0; for (let d = 0; d < 360; d += step) angs.push(d); }
      for (const ang of angs) {
        const pts = rota(base, ang), md = bits(dilate(maskOf(pts, GAP), 0));
        if (md.W > Wc) continue;
        // première position valide dans l’ordre (y, x) = meilleur score
        const lim = Hc - md.H; let found = null;
        for (let y = 0; y <= lim && !found; y++) {
          for (let x = 0; x + md.W <= Wc; x++) {
            let ok = true; const ws = x >> 5, bs = x & 31;
            for (let r = 0; r < md.H && ok; r++) {
              const mr = md.rows[r], orow = occ[y + r];
              for (let w = 0; w < md.nw; w++) { const v = mr[w]; if (!v) continue; if (orow[w + ws] & (v << bs)) { ok = false; break; } if (bs && (orow[w + ws + 1] & (v >>> (32 - bs)))) { ok = false; break; } }
            }
            if (ok) { found = [y, x]; break; }
          }
        }
        if (!found) continue;
        const score = Math.max(cur, found[0] + md.H) * 100000 + found[0] * 1000 + found[1];
        if (!best || score < best.score) best = { score, ang, y: found[0], x: found[1], md, pts };
      }
      if (!best) return null;
      const { md, y, x } = best, ws = x >> 5, bs = x & 31;
      for (let r = 0; r < md.H; r++) { const orow = occ[y + r], mr = md.rows[r]; for (let w = 0; w < md.nw; w++) { const v = mr[w]; if (!v) continue; orow[w + ws] |= (v << bs); if (bs) orow[w + ws + 1] |= (v >>> (32 - bs)); } }
      cur = Math.max(cur, y + md.H);
      // encre : le masque non dilaté (sous-échantillonné) pour compter les pages
      const mi = maskOf(best.pts, 0);
      for (let r = 0; r < mi.H; r += 2) for (let c = 0; c < mi.W; c += 2) if (mi.g[r][c]) inkCells.push([(x + GAP + c + 0.5) * CELL, (y + GAP + r + 0.5) * CELL]);
      placed.push({ h, ang: best.ang, x: (x + GAP) * CELL, y: (y + GAP) * CELL });
    }
    return { placed, ink: inkCells };
  }
  function pagesOf(ink, ox, oy, SW, SH) {
    const cnt = new Map();
    for (const q of ink) {
      const cx = q[0] + ox, cy = q[1] + oy, c = Math.floor(cx / SW), r = Math.floor(cy / SH), lx = cx - c * SW, ly = cy - r * SH, k = c + ',' + r;
      let e = cnt.get(k); if (!e) { e = { c, r, t: 0, l: 0, tp: 0, lt: 0 }; cnt.set(k, e); }
      e.t++; const L = lx < OVc, T = ly < OVc; if (L) e.l++; if (T) e.tp++; if (L || T) e.lt++;
    }
    const alive = new Set(cnt.keys());
    let changed = true;
    while (changed) {
      changed = false;
      for (const k of [...alive]) {
        const e = cnt.get(k), hl = alive.has((e.c - 1) + ',' + e.r), ht = alive.has(e.c + ',' + (e.r - 1));
        const rest = hl && ht ? e.t - e.lt : hl ? e.t - e.l : ht ? e.t - e.tp : e.t;
        if (rest <= 0) { alive.delete(k); changed = true; break; }
      }
    }
    return [...alive].map(k => cnt.get(k));
  }
  function bestLayout(hosts, SW, SH, WW, fast) {
    const area = h => { let a = 0; const p = h.hull; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return Math.abs(a / 2); };
    const ptp = h => { let a = 1e9, b = -1e9; h.hull.forEach(q => { a = Math.min(a, q[1]); b = Math.max(b, q[1]); }); return b - a; };
    const orders = [hosts.slice().sort((a, b) => ptp(b) - ptp(a)), hosts.slice().sort((a, b) => area(b) - area(a))];
    let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < (fast ? 2 : 6); i++) { const o = hosts.slice(); for (let k = o.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); const t = o[k]; o[k] = o[j]; o[j] = t; } orders.push(o); }
    let res = null;
    for (const nc of [3, 4]) {
      const Wc = Math.floor((nc * SW + OVc) / CELL);
      for (const o of orders) {
        const r = nest(hosts, Wc, o, 30); if (!r) continue;
        for (let ox = 0; ox < SW; ox += 3) for (let oy = 0; oy < SH; oy += 3) {
          const S = pagesOf(r.ink, ox, oy, SW, SH);
          if (!res || S.length < res.S.length) res = { S, placed: r.placed, ox, oy, nc };
        }
      }
    }
    return res;
  }

  /* ---------- préparation des pièces ---------- */
  function prepare(pieces) {
    const items = pieces.map(p => Object.assign({}, p, { _e: p.eng || p.name }));
    const byE = {}; items.forEach(p => { byE[p._e] = p; });
    const hosts = [], over = [];
    items.forEach(p => { const h = OVR[p._e]; if (h && byE[h]) over.push(Object.assign(p, { _host: h })); else hosts.push(p); });
    // entoilage du devant dessiné ailleurs dans le fichier : on le ramène sur le devant
    over.forEach(o => {
      const H = byE[o._host]; if (!H) return;
      const ho = arr(outline(H)), oo = arr(outline(o)), hm = minOf(ho), om = minOf(oo);
      const hMax = Math.max.apply(null, ho.map(q => q[0])), oMax = Math.max.apply(null, oo.map(q => q[0]));
      if (catOf(o._e) === 'thm' && (om[0] < hm[0] - 0.5 || oMax > hMax + 0.5 || Math.abs(om[0] - (hm[0] + 1)) > 5)) {
        const dx = hm[0] + 1 - om[0], mv = a => a && a.map(q => Object.assign({}, q, { x: q.x + dx }));
        o.poly = mv(o.poly); o.sa = mv(o.sa);
      }
    });
    return { hosts, over };
  }
  function prep(p, F, FV) { // geometrie d’une pièce dans la feuille
    const poly = arr(p.poly), o = { p, name: p.name, lbl: p.lbl || p.name };
    const FP = pts => pts.map(q => F([q.x, q.y]));
    o.poly = FP(p.poly); o.sa = p.sa ? FP(p.sa) : null;
    o.internal = (p.internal || []).map(FP); o.kinds = p.internalKind || [];
    o.notches = (p.notches || []).map(nt => {
      const x = nt.x, y = nt.y, nx = nt.nx, ny = nt.ny, L = nt.len, w = nt.w || 0, segs = [[F([x, y]), F([x - nx * L, y - ny * L])]];
      if (p.sa && w > 0) segs.push([F([x + nx * w, y + ny * w]), F([x + nx * (w - L), y + ny * (w - L)])]);
      return { key: Math.round(x * 10) + ',' + Math.round(y * 10), segs };
    });
    o.fold = null;
    if (p.fold && poly.length > 1) {
      const n = poly.length, fk = p.foldEdge || 0, A = poly[fk % n], B = poly[(fk + 1) % n], el = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, ux = (B[0] - A[0]) / el, uy = (B[1] - A[1]) / el;
      let sg = 0; for (let i = 0; i < n; i++) { const u = poly[i], v = poly[(i + 1) % n]; sg += u[0] * v[1] - v[0] * u[1]; }
      const s = sg > 0 ? 1 : -1, nx = s * uy, ny = -s * ux, inset = 1.5, depth = 1.0, hd = 0.35;
      const Pt = (t, d) => F([A[0] + ux * t - nx * d, A[1] + uy * t - ny * d]);
      if (el > 2 * inset + 2) o.fold = { key: Math.round(A[0]) + ',' + Math.round(A[1]) + ',' + Math.round(B[0]) + ',' + Math.round(B[1]), legs: [inset, el - inset].map(t => [Pt(t, 0), Pt(t, depth)]), bar: [Pt(inset, depth), Pt(el - inset, depth)], heads: [inset, el - inset].map(t => [Pt(t - hd * 0.5, hd * 1.4), Pt(t, 0), Pt(t + hd * 0.5, hd * 1.4)]), mid: Pt(el / 2, depth - 0.3) };
    }
    // droit fil
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(q => { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); });
    let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, gl = Math.min((y1 - y0) * 0.5, 6);
    if (p.fold) { cy = y0 + 2.6; gl = Math.min(gl, 1.6); }
    else if (p.grainTop) {
      let yt = 1e9; for (let i = 0; i < poly.length; i++) { const u = poly[i], v = poly[(i + 1) % poly.length]; if ((u[0] - cx) * (v[0] - cx) <= 0 && u[0] !== v[0]) { const yy = u[1] + (v[1] - u[1]) * (cx - u[0]) / (v[0] - u[0]); if (yy < yt) yt = yy; } }
      if (yt < 1e8) { cy = yt + 2.6; gl = Math.min(gl, 1.6); }
    }
    const ok = (x, y, l) => { for (let k = 0; k <= 8; k++) if (!inpoly(poly, x, y - l / 2 + l * k / 8)) return false; return true; };
    let found = null;
    for (const lf of [1, 0.75, 0.5]) { for (let st = 0; st <= 60 && !found; st++) for (const sg of st ? [1, -1] : [1]) { const xx = cx + sg * st * 0.5; if (ok(xx, cy, gl * lf)) { found = [xx, lf]; break; } } if (found) break; }
    if (found) { cx = found[0]; gl *= found[1]; }
    o.grain = { top: F([cx, cy - gl / 2]), bot: F([cx, cy + gl / 2]), ctr: F([cx, cy]) };
    o.marks = (p.marks || []).map(m => ({ t: m.t, p: F([m.x, m.y]) }));
    return o;
  }

  /* ---------- construction ---------- */
  function build(pieces, opts) { return make(pieces, opts || {}, false); }
  function count(pieces, opts) { return make(pieces, Object.assign({}, opts || {}), true); }
  function make(pieces, opts, onlyCount) {
    const LET = opts.paper === 'letter', PWp = LET ? 612 : 595.276, PHp = LET ? 792 : 841.89;
    let T = TXT[opts.lang === 'en' ? 'en' : 'fr'];
    if (LET) { const q = opts.lang === 'en' ? '2 in (5.08 cm)' : '2 in (5,08 cm)', r = x => String(x).replace('5 x 5 cm', q); T = Object.assign({}, T, { intro: T.intro.map(r), square: r(T.square) }); }
    const B = BASE(), tw = (s, z, bold) => B.tw(s, z) * (bold ? 1.06 : 1), esc = B.esc, latin1 = B.latin1;
    const sc = opts.scale && opts.scale > 0.5 && opts.scale < 2 ? opts.scale : 1, VH = PHp / sc;
    const WWpt = PWp / sc - 2 * MARGIN, WW = WWpt / PT, WH = (VH - 2 * MARGIN - TH - FT) / PT, SW = WW - OVc, SH = WH - OVc;
    const { hosts: hp, over } = prepare(pieces);
    const hosts = hp.map(p => {
      const pts = arr(outline(p)).concat.apply(arr(outline(p)), over.filter(o => o._host === p._e).map(o => arr(outline(o))));
      return { p, hull: hull(pts), free: !!FREE[p._e] };
    });
    const R = bestLayout(hosts, SW, SH, WW, !!opts.fast);
    if (!R) return onlyCount ? { pages: 0 } : null;
    const cells = R.S.slice().sort((a, b) => a.r - b.r || a.c - b.c), num = new Map(); cells.forEach((c, i) => num.set(c.c + ',' + c.r, i + 2));
    if (onlyCount && !opts.svg) return { pages: cells.length + 1 };
    // géométrie des pièces dans la feuille
    const items = R.placed.map(pl => {
      const h = pl.h, rm = rota(h.hull, pl.ang), mn = minOf(rm);
      const F = q => { const r = rota([q], pl.ang)[0]; return [r[0] - mn[0] + pl.x + R.ox, r[1] - mn[1] + pl.y + R.oy]; };
      const it = { host: h.p, o: prep(h.p, F), ov: [] };
      const groups = new Map();
      over.filter(o => o._host === h.p._e).forEach(o => {
        const cat = catOf(o._e), key = cat + '|' + (o.lbl || o.name).replace(/\s*\d$/, '');
        let g = groups.get(key); if (g) { g.pieces.push(o); return; }
        g = { cat, pieces: [o], o: prep(o, F), name: (o.rlabel || o.lbl || o.name).replace(/\s*\d$/, '') };
        groups.set(key, g); it.ov.push(g);
      });
      return it;
    });
    // ordre d’affichage : de haut en bas puis de gauche à droite sur la feuille
    const ctrOf = it => { const a = it.o.poly; let sx = 0, sy = 0; a.forEach(q => { sx += q[0]; sy += q[1]; }); return [sx / a.length, sy / a.length]; };
    items.sort((a, b) => { const A = ctrOf(a), Bb = ctrOf(b); return Math.round(A[1] / 25) - Math.round(Bb[1] / 25) || A[0] - Bb[0]; });
    items.forEach((it, i) => { it.n = i + 1; });
    if (opts.svg) { // aperçu : plan d’assemblage en SVG (cm)
      const cmx = Math.max.apply(null, cells.map(q => q.c)), rmx = Math.max.apply(null, cells.map(q => q.r));
      const sw = (cmx + 1) * SW + OVc, sh = (rmx + 1) * SH + OVc, P = a => a.map(q => q[0].toFixed(2) + ',' + q[1].toFixed(2)).join(' ');
      let o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 ' + (sw + 1).toFixed(2) + ' ' + (sh + 1).toFixed(2) + '" role="img">';
      cells.forEach(cl => { o += '<rect x="' + (cl.c * SW).toFixed(2) + '" y="' + (cl.r * SH).toFixed(2) + '" width="' + WW.toFixed(2) + '" height="' + WH.toFixed(2) + '" fill="none" stroke="#bbb" stroke-width="0.08" stroke-dasharray="0.4 0.4"/><text x="' + (cl.c * SW + 0.4).toFixed(2) + '" y="' + (cl.r * SH + 1.1).toFixed(2) + '" font-size="2" fill="#999" font-family="sans-serif">' + num.get(cl.c + ',' + cl.r) + '</text>'; });
      items.forEach(it => { o += '<polygon points="' + P(it.o.sa || it.o.poly) + '" fill="none" stroke="#222" stroke-width="0.1"/>'; });
      items.forEach(it => { const a = it.o.poly; let sx = 0, sy = 0; a.forEach(q => { sx += q[0]; sy += q[1]; }); o += '<circle cx="' + (sx / a.length).toFixed(2) + '" cy="' + (sy / a.length).toFixed(2) + '" r="2.1" fill="#fff" stroke="#222" stroke-width="0.1"/><text x="' + (sx / a.length).toFixed(2) + '" y="' + (sy / a.length + 0.9).toFixed(2) + '" font-size="2.8" text-anchor="middle" fill="#222" font-family="sans-serif">' + it.n + '</text>'; });
      return { pages: cells.length + 1, svg: o + '</svg>' };
    }
    const fabOf = q => { const a = (q.ann || '').split(' - ')[0] || (T === TXT.en ? 'Main fabric' : 'Tissu principal'); return a + (q.fold ? T.fabPli : ''); };
    const title = opts.title || 'Patron';
    const pagesC = [];
    // ---------- page 1
    {
      let c = '0 G 0 g\n';
      const X = v => f(v * PT), Y = v => f(PHp - v * PT);
      const text = (s, x, y, z, bold, col) => { c += `${col ? rg(col) + ' rg ' : '0 g '}BT /${bold ? 'F2' : 'F1'} ${z} Tf ${X(x)} ${Y(y)} Td (${esc(s)}) Tj ET\n0 g\n`; };
      const line = (pts, closed) => { pts.forEach((q, i) => { c += `${X(q[0])} ${Y(q[1])} ${i ? 'l' : 'm'}\n`; }); if (closed) c += 'h\n'; c += 'S\n'; };
      const dash = d => { c += (d && d.length ? '[' + d.join(' ') + ']' : '[]') + ' 0 d\n'; };
      const stroke = (col, w, d) => { c += rg(col) + ' RG ' + f(w) + ' w '; dash(d); };
      const wrap = (str, sz, maxw) => { const out = []; let cur = ''; String(str || '').split(' ').forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (cur && tw(t, sz) > maxw) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; };
      text(T.plan.replace('%n', cells.length), 1, 1.2, 12, true);
      let ty = 1.8; const info = (opts.lines || []).join(' - ') + (opts.date ? ' - ' + T.created + opts.date : '');
      wrap(info, 6.5, 19 * PT).slice(0, 3).forEach(l => { text(l, 1, ty, 6.5); ty += 0.3; });
      let y = 3.5 > ty + 0.2 ? 3.5 : ty + 0.2;
      T.intro.forEach(t => wrap(t, 8, 6.9 * PT).forEach(l => { text(l, 7.8, y, 8); y += 0.38; }));
      // carré de contrôle (avec la compensation d’impression)
      { const S = (LET ? 5.08 : 5) * sc, sx = 15.3, sy = 2.0; stroke(COL.blk, 0.6, []); c += `${X(sx)} ${Y(sy + S)} ${f(S * PT)} ${f(S * PT)} re S\n`; text(T.square, sx + 0.1, sy + S + 0.3, 7); }
      // plan
      const cmax = Math.max.apply(null, cells.map(k => k.c)), rmax = Math.max.apply(null, cells.map(k => k.r));
      const sw = (cmax + 1) * SW + OVc, sh = (rmax + 1) * SH + OVc, topY = Math.max(y + 0.2, 3.6), s = Math.min(6.4 / sw, (PHp / PT - topY - 1.0) / sh), x0 = 1.0;
      const MX = v => x0 + v * s, MY = v => topY + v * s;
      items.forEach(it => { stroke(COL.blk, 0.4, []); line((it.o.sa || it.o.poly).map(q => [MX(q[0]), MY(q[1])]), true); });
      cells.forEach(cl => { const k = num.get(cl.c + ',' + cl.r), gx = cl.c * SW, gy = cl.r * SH; stroke([0.78, 0.78, 0.78], 0.4, [2, 2]); c += `${X(MX(gx))} ${Y(MY(gy + WH))} ${f(WW * s * PT)} ${f(WH * s * PT)} re S\n`; text(String(k), MX(gx) + 0.08, MY(gy) + 0.25, 6.5, true, [0.47, 0.47, 0.47]); });
      items.forEach(it => { const a = it.o.poly; let sx = 0, sy = 0; a.forEach(q => { sx += q[0]; sy += q[1]; }); const px = MX(sx / a.length), py = MY(sy / a.length); c += '1 g '; stroke(COL.blk, 0.6, []); const rr = 5.5, k = 0.5523 * rr, cxp = px * PT, cyp = PHp - py * PT; c += `${f(cxp + rr)} ${f(cyp)} m ${f(cxp + rr)} ${f(cyp + k)} ${f(cxp + k)} ${f(cyp + rr)} ${f(cxp)} ${f(cyp + rr)} c ${f(cxp - k)} ${f(cyp + rr)} ${f(cxp - rr)} ${f(cyp + k)} ${f(cxp - rr)} ${f(cyp)} c ${f(cxp - rr)} ${f(cyp - k)} ${f(cxp - k)} ${f(cyp - rr)} ${f(cxp)} ${f(cyp - rr)} c ${f(cxp + k)} ${f(cyp - rr)} ${f(cxp + rr)} ${f(cyp - k)} ${f(cxp + rr)} ${f(cyp)} c B\n0 g\n`; const t = String(it.n); text(t, px - tw(t, 8, true) / 2 / PT, py + 2.8 / PT, 8, true); });
      // légende
      let ry = Math.max(y + 0.4, 8.1); const rx = 7.8;
      text(T.legend, rx, ry, 9, true); ry += 0.5;
      const anyKind = fn => items.some(it => [it.o].concat(it.ov.map(g => g.o)).some(o => o.kinds.some((k, i) => fn(k || {}, o, i))));
      const hasBtn = anyKind(k => k.color === 'darkRed'), hasPlace = anyKind(k => k.place && k.color !== 'darkRed'), hasFold = anyKind(k => !k.place && k.color !== 'darkRed' && k.color !== 'green');
      const sample = (col, w, d) => { stroke(col, w, d); c += `${X(rx)} ${Y(ry - 0.1)} m ${X(rx + 1.3)} ${Y(ry - 0.1)} l S\n`; dash([]); };
      const leg = [[T.cutl, COL.cut, 0.9, []], [T.seam, COL.blk, 0.5, []]];
      if (hasFold) leg.push([T.fold, COL.blue, 0.4, [3, 2]]); if (hasPlace) leg.push([T.place, COL.orange, 1.1, [5, 2.5]]); if (hasBtn) leg.push([T.btn, COL.orange, 1.2, []]);
      leg.forEach(([t, col, w, d]) => { sample(col, w, d); text(t, rx + 1.6, ry, 7.5); ry += 0.4; });
      if (items.some(it => it.o.notches.length || it.ov.some(g => g.o.notches.length))) { stroke(COL.blk, 0.5, []); c += `${X(rx + 0.65)} ${Y(ry - 0.25)} m ${X(rx + 0.65)} ${Y(ry + 0.02)} l S\n`; text(T.notch, rx + 1.6, ry, 7.5); ry += 0.4; }
      if (items.some(it => it.o.fold)) { stroke(COL.blk, 0.6, []); c += `${X(rx + 0.65)} ${Y(ry + 0.05)} m ${X(rx + 0.65)} ${Y(ry - 0.3)} l S\n`; text(T.pli, rx + 1.6, ry, 7.5); ry += 0.55; }
      const cats = []; items.forEach(it => it.ov.forEach(g => { if (cats.indexOf(g.cat) < 0) cats.push(g.cat); }));
      if (cats.length) {
        text(T.over, rx, ry, 7.5, true); ry += 0.42;
        cats.forEach(cat => { const st = STY[cat]; sample(st.col, st.w, st.da); text(T[cat], rx + 1.6, ry, 7.5, true, st.tcol); ry += 0.4; });
        [T.same, T.sa1, T.sa2].forEach(t => { text(t, rx, ry, 7); ry += 0.35; }); ry += 0.3;
      }
      // récapitulatif
      text(T.recap, rx, ry, 9, true); ry += 0.5;
      const head = () => { text(T.no, rx, ry, 7, true); text(T.cut, rx + 5.4, ry, 7, true); text(T.fab, rx + 7.4, ry, 7, true); ry += 0.4; };
      const row = (lead, nm, cut, fab, col) => { text(lead, rx, ry, 7.5, !!col, col); text(nm, rx + 0.9, ry, 7.5, !!col, col); text(String(cut), rx + 6.0, ry, 7.5); text(fab, rx + 7.4, ry, 6.5); ry += 0.36; };
      text(T.direct, rx, ry, 8, true); ry += 0.4; head();
      let tot = 0, star = false;
      items.forEach(it => { const q = it.host.quantity || it.host.rqty || 1; tot += q; row(String(it.n), it.host.rlabel || it.host.name, q, fabOf(it.host)); });
      ry += 0.2;
      if (cats.length) {
        text(T.trace, rx, ry, 8, true); ry += 0.4; head();
        items.forEach(it => it.ov.forEach(g => { const q = g.pieces.reduce((a, p) => a + (p.quantity || p.rqty || 1), 0); tot += q; const multi = g.pieces.length > 1 || (g.cat === 'thm' && q > 1); if (multi) star = true; const st = STY[g.cat]; row(T.on + ' ' + it.n, g.name + (multi ? ' *' : ''), q, fabOf(g.pieces[0]), st.tcol); }));
      }
      ry += 0.1; if (star) { text(T.star, rx, ry, 6.8); ry += 0.4; }
      text(T.total.replace('%n', tot), rx, ry, 8, true);
      pagesC.push(c);
    }
    // ---------- pages de patron
    cells.slice().sort((a, b) => num.get(a.c + ',' + a.r) - num.get(b.c + ',' + b.r)).forEach(cl => {
      const k = num.get(cl.c + ',' + cl.r), gx = cl.c * SW, gy = cl.r * SH;
      let c = sc !== 1 ? `${f(sc)} 0 0 ${f(sc)} 0 0 cm\n` : '';
      const X = v => f(MARGIN + v * PT), Y = v => f(VH - MARGIN - TH - v * PT), XA = v => f(MARGIN + v), YA = v => f(VH - MARGIN - v);
      const px = v => X(v - gx), py = v => Y(v - gy);
      const text = (s, x, y, z, bold, col) => { c += `${col ? rg(col) + ' rg ' : '0 g '}BT /${bold ? 'F2' : 'F1'} ${z} Tf ${XA(x)} ${YA(y)} Td (${esc(s)}) Tj ET\n0 g\n`; };
      const path = (pts, closed, fill) => { pts.forEach((q, i) => { c += `${px(q[0])} ${py(q[1])} ${i ? 'l' : 'm'}\n`; }); if (closed) c += 'h\n'; c += (fill ? 'f' : 'S') + '\n'; };
      const stroke = (col, w, d) => { c += rg(col) + ' RG ' + f(w) + ' w ' + (d && d.length ? '[' + d.join(' ') + ']' : '[]') + ' 0 d\n'; };
      c += '0 G 0 g\n';
      text(T.page.replace('%p', k).replace('%c', cl.c + 1).replace('%r', cl.r + 1), 0, 10, 9, true);
      const nb = []; [[1, 0, T.right], [0, 1, T.below], [-1, 0, T.left], [0, -1, T.above]].forEach(([dc, dr, t]) => { const n = num.get((cl.c + dc) + ',' + (cl.r + dr)); if (n) nb.push(t + ' : ' + T.pg + ' ' + n); });
      text(nb.join(' | '), 200, 10, 7.5);
      // bandes de recouvrement
      c += '0.93 g\n'; c += `${px(gx + SW)} ${py(gy + WH)} ${f(OVc * PT)} ${f(WH * PT)} re f\n${px(gx)} ${py(gy + WH)} ${f(WW * PT)} ${f(OVc * PT)} re f\n0 g\n`;
      stroke([0.5, 0.5, 0.5], 0.4, []); c += `${px(gx)} ${py(gy + WH)} ${f(WW * PT)} ${f(WH * PT)} re S\n`;
      c += `q ${px(gx)} ${py(gy + WH)} ${f(WW * PT)} ${f(WH * PT)} re W n\n`;
      items.forEach(it => {
        const o = it.o;
        if (o.sa) { stroke(COL.cut, 0.6, []); path(o.sa, true); }
        stroke(COL.blk, 0.5, []); path(o.poly, true);
        o.internal.forEach((ln, i) => {
          const kd = o.kinds[i] || {};
          if (kd.color === 'darkRed') stroke(COL.orange, 1.2, []); else if (kd.color === 'green') stroke(COL.green, 1.2, []); else if (kd.place) stroke(COL.orange, 1.1, [5, 2.5]); else stroke(COL.blue, 0.4, [3, 2]);
          path(ln, false);
        });
        const nk = {}; const dn = (os, col, w) => { stroke(col, w, []); os.notches.forEach(n => { if (nk[n.key]) return; n.segs.forEach(s => path(s, false)); }); os.notches.forEach(n => { nk[n.key] = 1; }); };
        dn(o, COL.blk, 0.4);
        const dfold = (fo, col) => { if (!fo) return; stroke(col, 0.5, []); fo.legs.forEach(l => path(l, false)); path(fo.bar, false); c += rg(col) + ' rg\n'; fo.heads.forEach(h => path(h, true, true)); c += '0 g\n'; };
        dfold(o.fold, COL.blk);
        it.ov.forEach(g => {
          const st = STY[g.cat], go = g.o;
          stroke(st.col, st.w, st.da); path(go.sa || go.poly, true);
          go.internal.forEach(ln => { stroke(st.col, 0.35, [2, 2]); path(ln, false); });
          dn(go, st.col, 0.7); if (go.fold && (!o.fold || go.fold.key !== o.fold.key)) dfold(go.fold, st.col);
        });
        // droit fil
        const gr = o.grain, ctr = gr.ctr;
        if (ctr[0] >= gx && ctr[0] <= gx + SW && ctr[1] >= gy && ctr[1] <= gy + SH) {
          const a = [parseFloat(px(gr.top[0])), parseFloat(py(gr.top[1]))], b = [parseFloat(px(gr.bot[0])), parseFloat(py(gr.bot[1]))];
          stroke(COL.blk, 0.6, []); c += `${f(a[0])} ${f(a[1])} m ${f(b[0])} ${f(b[1])} l S\n`;
          const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L], nn = [-u[1], u[0]];
          c += `${f(a[0])} ${f(a[1])} m ${f(a[0] + u[0] * 7 + nn[0] * 3)} ${f(a[1] + u[1] * 7 + nn[1] * 3)} l ${f(a[0] + u[0] * 7 - nn[0] * 3)} ${f(a[1] + u[1] * 7 - nn[1] * 3)} l h f\n`;
          const mx = (a[0] + b[0]) / 2 + 5, my = (a[1] + b[1]) / 2 - 2;
          c += `0 g BT /F1 7 Tf ${f(mx)} ${f(my)} Td (${esc(T.drfil)}) Tj ET\n`;
          const lines = [[o.lbl, COL.blk, 10]].concat(it.ov.map(g => [g.name, STY[g.cat].tcol, 8]));
          lines.forEach(([t, col, z], j) => { c += `${rg(col)} rg BT /F2 ${z} Tf ${f((a[0] + b[0]) / 2 + 5)} ${f((a[1] + b[1]) / 2 + 9 + (lines.length - 1 - j) * 11)} Td (${esc(t)}) Tj ET\n`; }); c += '0 g\n';
        }
        o.marks.forEach(m => { const t = '(' + m.t + ')'; if (m.p[0] >= gx && m.p[0] <= gx + SW && m.p[1] >= gy && m.p[1] <= gy + SH) c += `0 g BT /F1 9 Tf ${f(parseFloat(px(m.p[0])) - tw(t, 9) / 2)} ${f(parseFloat(py(m.p[1])) - 3)} Td (${esc(t)}) Tj ET\n`; });
        if (o.fold && o.fold.mid[0] >= gx && o.fold.mid[0] <= gx + SW && o.fold.mid[1] >= gy && o.fold.mid[1] <= gy + SH) c += `0 g BT /F1 7 Tf ${f(parseFloat(px(o.fold.mid[0])) - tw(T.placepli, 7) / 2)} ${f(parseFloat(py(o.fold.mid[1])))} Td (${esc(T.placepli)}) Tj ET\n`;
      });
      c += 'Q\n';
      text(title + T.foot + k + '/' + (cells.length + 1) + (sc !== 1 ? T.comp + sc.toFixed(3) : ''), 0, VH - 2 * MARGIN + 2, 7);
      pagesC.push(c);
    });
    // assemblage PDF
    const parts = [], offs = []; let len = 0;
    const emit = s => { const b = latin1(s); parts.push(b); len += b.length; };
    emit('%PDF-1.4\n');
    const n = pagesC.length, obj = (i, body) => { offs[i] = len; emit(`${i} 0 obj\n${body}\nendobj\n`); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R /ViewerPreferences << /PrintScaling /None >> >>');
    obj(2, `<< /Type /Pages /Count ${n} /Kids [${pagesC.map((_, i) => (5 + 2 * i) + ' 0 R').join(' ')}] >>`);
    obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    pagesC.forEach((c, i) => { obj(5 + 2 * i, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(PWp)} ${f(PHp)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + 2 * i} 0 R >>`); obj(6 + 2 * i, `<< /Length ${c.length} >>\nstream\n${c}endstream`); });
    const total = 5 + 2 * n, xr = len; let xs = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) xs += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    emit(xs + `trailer\n<< /Size ${total} /Root 1 0 R /Info << /Title (${esc(title)}) >> >>\nstartxref\n${xr}\n%%EOF\n`);
    const out = new Uint8Array(len); let o2 = 0; for (const b of parts) { out.set(b, o2); o2 += b.length; }
    return { bytes: out, pages: n, warnings: [] };
  }
  const api = { build, count, plan: (p, o) => make(p, Object.assign({}, o || {}, { svg: true }), false) };
  if (typeof window !== 'undefined') window.PatternSheet = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
