/* Générateur PDF vectoriel minimal (A4, échelle 1:1). UMD : window.PatternPDF / module.exports */
(function () {
  const PT = 72 / 2.54, MARGIN = 10 / 25.4 * 72;
  let PW = 595.276, PH = 841.89, NOVC = false;
  const f = n => (+n).toFixed(2);
  const HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
  function tw(s, size) { let w = 0; for (const ch of String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')) { const k = ch.charCodeAt(0); w += (k >= 32 && k <= 126 ? HW[k - 32] : 556); } return w * size / 1000; }
  function esc(s) { return String(s).replace(/[\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e\xa0-\xff]/g, '?'); }
  function latin1(str) { const a = new Uint8Array(str.length); for (let i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 255; return a; }

  /* Range les pièces en rayonnage sur des pages A4. pieces: [{name,poly,sa,internal,note}] (cm, y vers le bas) */
  const HMIN = 8 * PT;
  /* en-tête d'une pièce : nom, date/paramètres, annotation, sur plusieurs lignes dans la largeur bw (pt) */
  function hdr(p, bw, date) {
    const wrap = (str, sz, maxw) => { const out = []; let cur = ''; String(str || '').split(' ').forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (cur && tw(t, sz) > maxw) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; };
    const mw = bw - 8, lines = [];
    let sz = 10, nl = wrap(p.name, sz, mw);
    while (nl.length > 3 && sz > 6) { sz -= 1; nl = wrap(p.name, sz, mw); }
    nl.forEach(t => lines.push([t, sz]));
    const l2 = (date ? 'Créé le ' + date : '') + (p.note ? '  -  ' + p.note : '');
    wrap(l2, 6, mw).forEach(t => lines.push([t, 6]));
    if (p.ann) wrap(p.ann, 6, mw).forEach(t => lines.push([t, 6]));
    return { lines, h: lines.reduce((a, l) => a + l[1] * 1.2, 0) + 6 };
  }
  function layout(pieces, sc, band) {
    sc = sc || 1; band = band || 0;
    const usableW = PW / sc - 2 * MARGIN, usableH = PH / sc - 2 * MARGIN;
    const gap = 0.8 * PT;
    const items = pieces.map(p => {
      const outline = p.sa || p.poly;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const q of outline) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      for (const l of (p.internal || [])) for (const q of l) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      for (const q of p.poly) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      const pw = (x1 - x0) * PT;
      return { p, x0, y0, pw, w: Math.max(pw, HMIN), h: (y1 - y0) * PT };
    });
    const head = items.reduce((m, it) => Math.max(m, hdr(it.p, Math.min(it.w, 15 * PT), '00/00/0000').h), 30);
    items.sort((a, b) => b.h - a.h);
    const pages = [], warnings = [];
    let page = null, x = 0, y = 0, rowH = 0;
    const newPage = () => { page = { items: [] }; pages.push(page); x = 0; y = 0; rowH = 0; };
    newPage(); y = band;
    // le carré d'essai 5x5 cm occupe l'angle haut-gauche de la page 1 : on le réserve en haut
    const big = items.filter(it => it.w > usableW || it.h + head > usableH);
    for (const it of items) {
      if (big.includes(it)) continue;
      const need = it.h + head;
      if (x > 0 && x + it.w > usableW) { y += rowH + gap; x = 0; rowH = 0; }
      if (y + need > usableH && (x > 0 || y > 0)) newPage();
      it.px = x; it.py = y; page.items.push(it);
      x += it.w + gap; rowH = Math.max(rowH, need);
    }
    // centrage de chaque page (horizontal et vertical)
    for (const pg of pages) {
      if (!pg.items.length) continue;
      let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
      for (const it of pg.items) { bx0 = Math.min(bx0, it.px); by0 = Math.min(by0, it.py); bx1 = Math.max(bx1, it.px + it.w); by1 = Math.max(by1, it.py + it.h + head); }
      const top = pg === pages[0] ? band : 0, dx = (usableW - (bx1 - bx0)) / 2 - bx0, dy = top + (usableH - top - (by1 - by0)) / 2 - by0;
      for (const it of pg.items) { it.px += Math.max(dx, -it.px); if (!NOVC) it.py += Math.max(dy, top - it.py); }
    }
    // carré d'essai : premier coin libre de la page 1, sinon page supplémentaire
    const S = 5 * PT, T = { page: 0, x: 0, y: 0 };
    const cand = [[usableW - S, band], [usableW - S, usableH - S - 12], [0, usableH - S - 12], [0, band]];
    const free = cand.find(([cx, cy]) => pages[0].items.every(it => {
      const ix = it.px, iy = it.py, iw = it.w, ih = it.h + head;
      return cx + S <= ix || cx >= ix + iw || cy + S + 12 <= iy || cy >= iy + ih;
    }));
    const host = pages[0].items[0];
    if (free) { T.x = free[0]; T.y = free[1]; }
    else if (host && host.w >= 10 * PT && host.h >= 13 * PT) { T.x = host.px + host.w / 2 - S / 2; T.y = host.py + head + host.h * 0.38 - S / 2; T.host = host; }
    else { newPage(); T.page = pages.length - 1; }
    // pièces plus grandes qu'une page : découpées en pages avec recouvrement
    const TH = 34, OV = 1.5 * PT, winW = usableW, winH = usableH - TH - 12, tiled = [];
    for (const it of big) {
      const cols = Math.max(1, Math.ceil((it.w - OV) / (winW - OV) - 1e-9)), rows = Math.max(1, Math.ceil((it.h - OV) / (winH - OV) - 1e-9));
      tiled.push({ name: it.p.name, cols, rows });
      warnings.push(it.p.name + ' est imprimée sur ' + (cols * rows) + ' pages A4 à assembler (' + cols + ' × ' + rows + ').');
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        pages.push({ items: [], tile: { it, c, r, cols, rows, tx: c * (winW - OV), ty: r * (winH - OV), winW, winH, TH, OV } });
    }
    return { pages, warnings, test: T, head, tiled };
  }

  /* Une seule page, à la taille du patron (1:1), pour la vidéoprojection : pas de découpage en A4. */
  function build(pieces, opts) {
    opts = opts || {};
    if (!opts.single) return build1(pieces, opts);
    const A = 595.276, B = 841.89;
    try {
      let area = 0, wmax = 0;
      pieces.forEach(p => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; (p.sa || p.poly).concat(p.poly, ...(p.internal || [])).forEach(q => { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }); area += (x1 - x0) * (y1 - y0) * PT * PT; wmax = Math.max(wmax, (x1 - x0) * PT); });
      PW = Math.max(wmax + 2 * MARGIN + 20, Math.sqrt(area * 1.35 * 1.5) + 2 * MARGIN);
      PW = Math.max(PW, Math.max(wmax, HMIN) + 2 * (5 * PT + 6) + 2 * MARGIN); // place pour le carré d'essai à côté d'une petite pièce
      PH = 1e5; NOVC = true;
      const L1 = layout(pieces, 1);
      let ymax = 0; L1.pages.forEach(pg => pg.items.forEach(it => { ymax = Math.max(ymax, it.py + it.h + L1.head); }));
      ymax = Math.max(ymax, 5 * PT + 40);
      NOVC = false; PH = ymax + 2 * MARGIN + 24;
      return build1(pieces, Object.assign({}, opts, { single: false, scale: 1, proj: true }));
    } finally { PW = A; PH = B; NOVC = false; }
  }
  /* Tissu d'une pièce, déduit de sa consigne (« Couper 2 : tissu principal et doublure », « Tissu principal ou fantaisie - … »), sinon de ses lignes. */
  function fabOf(q) {
    if (q.rfab !== undefined) return q.rfab;
    const ann = q.ann || '', dflt = (q.lines && q.lines[0]) || 'Tissu principal';
    let m = /\s?: (.+)$/.exec(ann);
    if (m) return m[1].charAt(0).toUpperCase() + m[1].slice(1);
    if (!ann || /^(Couper|Cut)\b/.test(ann)) return dflt;
    return ann.split(' - ')[0].replace(/\s*\(.*$/, '') || dflt;
  }
  /* Vignette récapitulative (en haut de la page 1) : modèle de mise en page. */
  function vigModel(rc, pieces, wA) {
    const wrap = (str, sz, maxw) => { const out = []; let cur = ''; String(str || '').split(' ').forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (cur && tw(t, sz) > maxw) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out.length ? out : ['']; };
    const rows = pieces.map(q => ({ name: q.rlabel || q.name, qty: q.rqty || q.quantity || 1, fab: fabOf(q) }));
    const pl = wrap((rc.params || []).map(([k, v]) => k ? k + ' :' + ' ' + v : v).join('  |  '), 7.5, wA);
    const nl = rows.length <= 3 ? rows.length : Math.ceil(rows.length / 2), h = 14 + 9 * pl.length + 5 + 10 * nl + 14;
    return { rows, pl, nl, h, wrap, total: rows.reduce((t, r) => t + r.qty, 0) };
  }
  function vigDraw(vg, rc, text, wA, line) {
    let y = 9; text('Récapitulatif : ' + rc.title, 0, y, 8.5); y += 4;
    vg.pl.forEach(l => { y += 9; text(l, 0, y, 7.5); });
    y += 3; line(y); y += 1;
    const one = vg.nl === vg.rows.length, colW = wA / 2, xq = one ? 170 : 92, xf = one ? 195 : 112, nmW = xq - 8, fbW = (one ? wA : colW) - xf - 8;
    vg.rows.forEach((r, i) => {
      const col = i < vg.nl ? 0 : 1, ln = i < vg.nl ? i : i - vg.nl, x = col * colW, yy = y + 10 * (ln + 1) - 2;
      const cut = (s, w) => { let t = s; while (t.length > 4 && tw(t, 7.5) > w) t = t.slice(0, -1); return t !== s ? t + '...' : t; };
      text(cut(r.name, nmW), x, yy, 7.5); text('x' + r.qty, x + xq, yy, 7.5); if (!rc.nofab) text(cut(r.fab, fbW), x + xf, yy, 7.5);
    });
    text('Total : ' + vg.total + ' pièce' + (vg.total > 1 ? 's' : '') + ' à couper.', wA - 95, y + 10 * vg.nl + 8, 7.5);
  }
  /* Page de récapitulatif : paramètres choisis + tableau des pièces (quantité, tissu, consigne, page). rc = {title, params:[[libellé, valeur]]} ; chaque pièce porte rlabel, rqty. */
  function recapPage(rc, pieces, L, title, opts) {
    const VH = 841.89, wA = 595.276 - 2 * MARGIN;
    let c = '0 G 0 g\n', y = 0;
    const X = v => f(MARGIN + v), Y = v => f(VH - MARGIN - v);
    const text = (s, x, yy, size) => { c += `BT /F1 ${size} Tf ${X(x)} ${Y(yy)} Td (${esc(s)}) Tj ET\n`; };
    const wrap = (str, sz, maxw) => { const out = []; let cur = ''; String(str || '').split(' ').forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (cur && tw(t, sz) > maxw) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out.length ? out : ['']; };
    const rule = (yy, w) => { c += `0.4 w [] 0 d ${X(0)} ${Y(yy)} m ${X(wA)} ${Y(yy)} l S\n`; };
    y += 14; text('Récapitulatif du patron', 0, y, 16); y += 14;
    text(rc.title + (opts.date ? '  -  créé le ' + opts.date : ''), 0, y, 9); y += 8; rule(y, wA); y += 14;
    // paramètres
    (rc.params || []).forEach(([k, v]) => { const ls = wrap(v, 8.5, wA - 120); if (k) text(k + ' :', 0, y, 8.5); ls.forEach((l, i) => { text(l, k ? 120 : 0, y + i * 11, 8.5); }); y += ls.length * 11 + 2; });
    y += 4; rule(y, wA); y += 6;
    // pages de chaque pièce
    const pg = new Map();
    L.pages.forEach((pgx, i) => { const ps = pgx.tile ? [pgx.tile.it.p] : pgx.items.map(it => it.p); ps.forEach(q => { if (!pg.has(q)) pg.set(q, []); pg.get(q).push(i + 2); }); });
    const rng = a => { const u = [...new Set(a)].sort((x, z) => x - z), o = []; for (let i = 0; i < u.length;) { let j = i; while (j + 1 < u.length && u[j + 1] === u[j] + 1) j++; o.push(j > i ? u[i] + '-' + u[j] : String(u[i])); i = j + 1; } return o.join(', '); };
    const rows = pieces.map(q => ({ name: q.rlabel || q.name, qty: q.rqty || q.quantity || 1, fab: fabOf(q), ann: (q.ann || '').replace(/^[^-]*? - /, (m) => fabOf(q) + ' - ' === m ? '' : m), pg: rng(pg.get(q) || []) }));
    if (rc.nofab) rows.forEach((r, i) => { r.fab = ''; r.ann = pieces[i].ann || ''; });
    const total = rows.reduce((t, r) => t + r.qty, 0);
    const cx = rc.nofab ? [0, 190, 225, 225, wA - 52] : [0, 190, 225, 305, wA - 52], cw = [186, 30, rc.nofab ? 0 : 76, cx[4] - cx[3] - 6, 52];
    let sz = 8.5;
    const rh = (r, s) => Math.max(wrap(r.name, s, cw[0]).length, wrap(r.fab, s, cw[2]).length, wrap(r.ann, s, cw[3]).length) * (s + 2.5) + 5;
    const avail = (VH - 2 * MARGIN) - y - 60;
    while (sz > 6 && rows.reduce((t, r) => t + rh(r, sz), 18) > avail) sz -= 0.5;
    y += 12; ['Pièce', 'Qté', rc.nofab ? '' : 'Tissu', 'Consigne', 'Page'].forEach((h, i) => text(h, cx[i], y, 8)); y += 4; rule(y, wA);
    rows.forEach(r => {
      y += sz + 3;
      wrap(r.name, sz, cw[0]).forEach((l, i) => text(l, cx[0], y + i * (sz + 2.5), sz));
      text(String(r.qty), cx[1] + 8, y, sz);
      wrap(r.fab, sz, cw[2]).forEach((l, i) => text(l, cx[2], y + i * (sz + 2.5), sz));
      wrap(r.ann, sz, cw[3]).forEach((l, i) => text(l, cx[3], y + i * (sz + 2.5), sz));
      text(r.pg, cx[4], y, sz);
      y += rh(r, sz) - sz - 3; rule(y - 1, wA);
    });
    y += 14; text('Total : ' + total + ' pièce' + (total > 1 ? 's' : '') + ' à couper.', 0, y, 9);
    y += 16; text('Imprimez à 100 % (sans mise à l\'échelle) et vérifiez le carré de contrôle de 5 x 5 cm, en page ' + (L.test.page + 2) + '.', 0, y, 8);
    return c;
  }
  function build1(pieces, opts) {
    /* Vidéoprojection : traits plus épais et pointillés plus longs, pour rester visibles à distance. */
    const thick = str => str.replace(/(\d*\.?\d+) w\b/g, (m, v) => { v = parseFloat(v); return f2(v <= 0.6 ? v * 3.2 : v * 1.9) + ' w'; })
      .replace(/\[([\d. ]+)\] 0 d/g, (m, d) => '[' + d.trim().split(/\s+/).map(x => f2(parseFloat(x) * 2)).join(' ') + '] 0 d');
    const f2 = v => (Math.round(v * 100) / 100).toString();
    const sc = opts.scale && opts.scale > 0.5 && opts.scale < 2 ? opts.scale : 1, VH = PH / sc;
    let L = layout(pieces, sc);
    const RC = opts.recap || null;
    let VIG = null;
    if (RC && !opts.proj && RC.mode === 'auto') {
      const vg = vigModel(RC, pieces, PW / sc - 2 * MARGIN);
      if (vg.rows.length <= 6) { const L1 = layout(pieces, sc, vg.h); if (L1.pages.length === L.pages.length && L1.test.page === L.test.page && !(L1.test.host && !L.test.host)) { L = L1; VIG = vg; } }
    }
    const OFF = RC && !VIG && !opts.proj ? 1 : 0;
    const objs = [];            // chaînes de contenu des pages
    const title = opts.title || 'Patron de poche';
    L.pages.forEach((pg, pi) => {
      let c = sc !== 1 ? `${f(sc)} 0 0 ${f(sc)} 0 0 cm\n` : '';
      const X = v => f(MARGIN + v), Y = v => f(VH - MARGIN - v);
      const text = (s, x, y, size) => { c += `BT /F1 ${size} Tf ${X(x)} ${Y(y)} Td (${esc(s)}) Tj ET\n`; };
      const path = (pts, close, ox, oy, x0, y0) => {
        pts.forEach((q, i) => { c += `${X(ox + (q.x - x0) * PT)} ${Y(oy + (q.y - y0) * PT)} ${i ? 'l' : 'm'}\n`; });
        if (close) c += 'h\n';
      };
      c += '0 G 0 g\n';
      if (VIG && pi === 0) { c += '0.4 w\n'; vigDraw(VIG, RC, text, PW / sc - 2 * MARGIN, yy => { c += `${X(0)} ${Y(yy)} m ${X(PW / sc - 2 * MARGIN)} ${Y(yy)} l S\n`; }); }
      if (pi === L.test.page) {
        const tx = L.test.x, ty = L.test.y;
        c += '0.5 w\n' + `${X(tx)} ${Y(ty + 5 * PT)} ${f(5 * PT)} ${f(5 * PT)} re S\n`;
        const SQ = 5 * PT, tl = [['Carre 5 x 5 cm', 8, 0], ['Imprimer a 100 %', 8, 12], ['(sans mise a l\'echelle)', 8, 22]];
        const wl = []; (opts.lines || []).forEach(s => { let cur = ''; s.split(', ').forEach(part => { const t = cur ? cur + ', ' + part : part; if (cur && tw(t, 6.5) > SQ - 6) { wl.push(cur + ','); cur = part; } else cur = t; }); if (cur) wl.push(cur); });
        wl.forEach((s, i) => tl.push([s, 6.5, 40 + 9 * i]));
        const top = 12 - 5.8, bot = 12 + tl[tl.length - 1][2] + 1.5, sh = SQ / 2 - (top + bot) / 2;
        tl.forEach(t => { const w = tw(t[0], t[1]); text(t[0], tx + Math.max(2, (SQ - w) / 2), ty + 12 + t[2] + sh, t[1]); });
      }
      if (pi === 0 && !pg.items.length && L.tiled.length) { // page de contrôle seule : explication de l'assemblage
        const msg = ['Certaines pièces sont trop grandes pour une page A4 : elles sont imprimées en plusieurs pages à assembler.'].concat(L.tiled.map(t => '- ' + t.name + ' : ' + t.cols + ' colonne(s) x ' + t.rows + ' ligne(s), soit ' + (t.cols * t.rows) + ' pages.'), ['Découpez au bord des cadres (traits de coupe aux 4 coins) et superposez les zones de recouvrement de 1,5 cm :', 'les lignes de la pièce doivent se prolonger exactement d\'une page à l\'autre. Collez ou scotchez.']);
        msg.forEach((m, i) => text(m, 0, (L.test.y || 0) + 5 * PT + 40 + 12 * i, i ? 8 : 9));
      }
      for (const it of (pg.tile ? [pg.tile.it] : pg.items)) {
        const p = it.p, T_ = pg.tile;
        const ox = T_ ? -T_.tx : it.px, oy = T_ ? T_.TH - T_.ty : it.py + L.head;
        if (T_) {
          const idn = 'L' + (T_.r + 1) + '-C' + (T_.c + 1), wl2 = (opts.date ? 'Créé le ' + opts.date : '') + (p.note ? '  -  ' + p.note : '');
          text(p.name + ' - page ' + idn + ' (' + T_.cols + ' colonne(s) x ' + T_.rows + ' ligne(s))', 0, 10, 9);
          text(wl2, 0, 21, 7);
          const cs = Math.max(2, Math.min(7, 24 / T_.rows, 110 / T_.cols)), mx = T_.winW - T_.cols * cs - 2;
          for (let rr = 0; rr < T_.rows; rr++) for (let cc = 0; cc < T_.cols; cc++) { c += '0.3 w ' + (rr === T_.r && cc === T_.c ? '0.6 g ' : '1 g ') + `${X(mx + cc * cs)} ${Y(4 + (rr + 1) * cs)} ${f(cs)} ${f(cs)} re B\n`; }
          c += '0 g\n';
          // repères de découpe aux 4 coins de la fenêtre et recouvrements
          const x1 = T_.winW, y0 = T_.TH, y1 = T_.TH + T_.winH, k = 10;
          c += '0.3 w [] 0 d\n';
          [[0, y0, 1, 1], [x1, y0, -1, 1], [0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([cx_, cy_, sx, sy]) => { c += `${X(cx_)} ${Y(cy_ + sy * k)} m ${X(cx_)} ${Y(cy_)} l ${X(cx_ + sx * k)} ${Y(cy_)} l S\n`; });
          c += '0.3 w [2 2] 0 d\n';
          const nb = (cc, rr) => 'L' + (rr + 1) + '-C' + (cc + 1);
          if (T_.c < T_.cols - 1) { c += `${X(x1 - T_.OV)} ${Y(y0)} m ${X(x1 - T_.OV)} ${Y(y1)} l S\n`; { const t2 = 'Recouvre ' + nb(T_.c + 1, T_.r) + ' >'; text(t2, x1 - T_.OV - tw(t2, 6) - 2, y0 + 10, 6); } }
          if (T_.c > 0) { c += `${X(T_.OV)} ${Y(y0)} m ${X(T_.OV)} ${Y(y1)} l S\n`; text('< ' + nb(T_.c - 1, T_.r), 2, y0 + 10, 6); }
          if (T_.r < T_.rows - 1) { c += `${X(0)} ${Y(y1 - T_.OV)} m ${X(x1)} ${Y(y1 - T_.OV)} l S\n`; text('Recouvre ' + nb(T_.c, T_.r + 1) + ' (en bas)', x1 / 2 - 40, y1 - T_.OV - 3, 6); }
          if (T_.r > 0) { c += `${X(0)} ${Y(y0 + T_.OV)} m ${X(x1)} ${Y(y0 + T_.OV)} l S\n`; text(nb(T_.c, T_.r - 1) + ' (en haut)', x1 / 2 - 30, y0 + T_.OV + 8, 6); }
          c += '[] 0 d\n';
          c += `q ${X(0)} ${Y(y1)} ${f(x1)} ${f(T_.winH)} re W n\n`;
        } else {
        // étiquette : nom de la pièce + date de création + paramètres, sur plusieurs lignes si besoin
        const bw = Math.min(it.w, 15 * PT), H = hdr(p, bw, opts.date);
        c += '0.4 w [] 0 d\n' + `${X(ox)} ${Y(oy - 2)} ${f(bw)} ${f(H.h)} re S\n`;
        { let yy = oy - 2 - H.h + 3; H.lines.forEach(([t, sz]) => { yy += sz * 1.2; text(t, ox + Math.max(2, (bw - tw(t, sz)) / 2), yy - sz * 0.25, sz); }); }
        }
        // ligne de coupe
        if (p.sa) { c += '0.75 0.22 0.17 RG 1.2 w [] 0 d\n'; path(p.sa, true, ox, oy, it.x0, it.y0); c += 'S\n0 G\n'; }
        // ligne de couture
        c += '0.4 w [] 0 d\n'; if (p.seamRuns) p.seamRuns.forEach(rn => { path(rn, false, ox, oy, it.x0, it.y0); c += 'S\n'; }); else { path(p.poly, true, ox, oy, it.x0, it.y0); c += 'S\n'; }
        // croix rouge : fin de la ligne de coupe (prolongée jusqu'au rempli)
        if (p.dot) {
          const hh = 0.35 * PT, cx = ox + (p.dot.x - it.x0) * PT, cy = oy + (p.dot.y - it.y0) * PT, U = (x, y) => `${X(x)} ${Y(y)}`;
          c += '0.84 0.16 0.16 RG 1.1 w [] 0 d 1 J\n';
          c += `${U(cx - hh, cy - hh)} m ${U(cx + hh, cy + hh)} l S\n${U(cx - hh, cy + hh)} m ${U(cx + hh, cy - hh)} l S\n0 G 0 J\n`;
        }
        // crans : trait vers l'intérieur depuis la ligne de couture (+ trait depuis la ligne de coupe s'il y a une marge)
        if (p.notches && p.notches.length) {
          c += '0.4 w [] 0 d\n';
          p.notches.forEach(nt => {
            const P1 = { x: nt.x, y: nt.y }, P2 = { x: nt.x - nt.nx * nt.len, y: nt.y - nt.ny * nt.len };
            path([P1, P2], false, ox, oy, it.x0, it.y0); c += 'S\n';
            if (p.sa && nt.w > 0) { path([{ x: nt.x + nt.nx * nt.w, y: nt.y + nt.ny * nt.w }, { x: nt.x + nt.nx * (nt.w - nt.len), y: nt.y + nt.ny * (nt.w - nt.len) }], false, ox, oy, it.x0, it.y0); c += 'S\n'; }
          });
        }
        // pièce coupée sur le pli du tissu (bord = 1er côté du contour, ou côté p.foldEdge → foldEdge+1) : symbole « placer sur le pli »
        if (p.fold && p.poly.length > 1) {
          const fk = p.foldEdge || 0, A = p.poly[fk % p.poly.length], B = p.poly[(fk + 1) % p.poly.length], el = Math.hypot(B.x - A.x, B.y - A.y) || 1, ux = (B.x - A.x) / el, uy = (B.y - A.y) / el;
          let sgn = 0; for (let i = 0; i < p.poly.length; i++) { const u = p.poly[i], v = p.poly[(i + 1) % p.poly.length]; sgn += u.x * v.y - v.x * u.y; }
          const nx = (sgn > 0 ? 1 : -1) * uy, ny = -(sgn > 0 ? 1 : -1) * ux; // normale extérieure ; le symbole va vers l'intérieur
          const inset = 1.5, depth = 1.0, hd = 0.35;
          const P = (t, d) => ({ x: A.x + ux * t - nx * d, y: A.y + uy * t - ny * d });
          if (el > 2 * inset + 2) {
            c += '0.5 w [] 0 d\n';
            [inset, el - inset].forEach(t => { path([P(t, 0), P(t, depth)], false, ox, oy, it.x0, it.y0); c += 'S\n'; });
            path([P(inset, depth), P(el - inset, depth)], false, ox, oy, it.x0, it.y0); c += 'S\n';
            [inset, el - inset].forEach(t => { path([P(t - hd * 0.5, hd * 1.4), P(t, 0), P(t + hd * 0.5, hd * 1.4)], true, ox, oy, it.x0, it.y0); c += 'f\n'; });
            const mid = P(el / 2, depth - 0.3), tx = ox + (mid.x - it.x0) * PT, ty = oy + (mid.y - it.y0) * PT, lbl = 'Placer sur le pli du tissu';
            text(lbl, tx - tw(lbl, 7) / 2, ty, 7);
          }
        }
        // lignes internes
        (p.internal || []).forEach((ln, ii) => {
          const kd = (p.internalKind || [])[ii];
          if (kd && kd.color === 'darkRed') c += '0.75 0.22 0.17 RG 1.2 w [] 0 d\n'; // trait plein rouge (ex. boutonnières)
          else if (kd && kd.color === 'green') c += '0.10 0.55 0.25 RG 1.2 w [] 0 d\n'; // trait plein vert (repère)
          else if (kd && kd.place) c += '0.85 0.45 0.05 RG 1.1 w [5 2.5] 0 d\n'; // emplacement (ex. poche) : tirets orange
          else c += '0.12 0.44 0.82 RG 0.4 w [3 2] 0 d\n';                           // repli : tirets bleus
          path(ln, false, ox, oy, it.x0, it.y0); c += 'S\n';
        });
        c += '0 G [] 0 d\n';
        // fil droit
        let cx = (Math.min(...p.poly.map(q => q.x)) + Math.max(...p.poly.map(q => q.x))) / 2, cy = (Math.min(...p.poly.map(q => q.y)) + Math.max(...p.poly.map(q => q.y))) / 2; // centre de la boîte englobante : flèche centrée à la verticale et à l'horizontale
        let gx = ox + (cx - it.x0) * PT, gy = oy + (cy - it.y0) * PT, gl = Math.min(it.h * 0.5, 6 * PT);
        // pièce non convexe (ex. bande en U) : on cherche une position où le fil droit reste dans la matière
        const inPoly = (q, x, y) => { let c = false; for (let i = 0, j = q.length - 1; i < q.length; j = i++) { if ((q[i].y > y) !== (q[j].y > y) && x < ((q[j].x - q[i].x) * (y - q[i].y)) / (q[j].y - q[i].y) + q[i].x) c = !c; } return c; };
        const okAt = (xcm, ycm, lcm) => { for (let k = 0; k <= 8; k++) if (!inPoly(p.poly, xcm, ycm - lcm / 2 + (lcm * k) / 8)) return false; return true; };
        if (p.fold) { cy = Math.min(...p.poly.map(q => q.y)) + 2.6; gl = Math.min(gl, 1.6 * PT); gy = oy + (cy - it.y0) * PT; }
        else if (p.grainTop) { // flèche courte en haut de la pièce, comme sur une pièce au pli : sous le bord supérieur de la matière, à l'abscisse du centre
          let yt = Infinity; for (let i = 0, n = p.poly.length; i < n; i++) { const u = p.poly[i], v = p.poly[(i + 1) % n]; if ((u.x - cx) * (v.x - cx) <= 0 && u.x !== v.x) { const yy = u.y + (v.y - u.y) * (cx - u.x) / (v.x - u.x); if (yy < yt) yt = yy; } }
          if (isFinite(yt)) { cy = yt + 2.6; gl = Math.min(gl, 1.6 * PT); gy = oy + (cy - it.y0) * PT; }
        }
        if (T_ && T_.tmode !== 0) { // pièce découpée en pages A4 : la flèche et son nom restent entiers sur une seule page (hors des bandes de recouvrement)
          const adj = (v, lo, hi, step, win, n) => { const m = 4; let best = null;
            for (let k = 0; k < n; k++) { const a0 = (k ? k * step + T_.OV : 0) + m - lo, a1 = (k < n - 1 ? (k + 1) * step : k * step + win) - m - hi; if (a0 > a1) continue; const w = Math.min(Math.max(v, a0), a1); if (best === null || Math.abs(w - v) < Math.abs(best - v)) best = w; }
            return best === null ? v : best; };
          const vx = (cx - it.x0) * PT, vy = (cy - it.y0) * PT;
          const nx2 = adj(vx, -4, 5 + 70, T_.winW - T_.OV, T_.winW, T_.cols), ny2 = (p.fold || p.grainTop) ? vy : adj(vy, -gl / 2 - 8, gl / 2 + 8, T_.winH - T_.OV, T_.winH, T_.rows);
          cx += (nx2 - vx) / PT; cy += (ny2 - vy) / PT; gx = ox + (cx - it.x0) * PT; gy = oy + (cy - it.y0) * PT;
        }
        let placed = false;
        if (L.test.host === it && pi === L.test.page) { // carré au-dessus, flèche centrée sous le carré (si elle reste dans la matière)
          const t = it.h * 0.38 + 2.5 * PT + 0.8 * PT, b = it.h - 0.8 * PT, glh = Math.max(2 * PT, Math.min(6 * PT, b - t));
          if (okAt(it.x0 + it.w / 2 / PT, it.y0 + (t + b) / 2 / PT, glh / PT)) { gl = glh; gx = ox + it.w / 2; gy = oy + (t + b) / 2; placed = true; }
        }
        if (!placed) {
          const glc = gl / PT; let found = null;
          outer: for (const lf of [1, 0.75, 0.5]) for (let st = 0; st <= 60; st++) for (const sg of st ? [1, -1] : [1]) {
            const xx = cx + sg * st * 0.5; if (okAt(xx, cy, glc * lf)) { found = { xx, lf }; break outer; } }
          if (found) { gx = ox + (found.xx - it.x0) * PT; gl = gl * found.lf; }
        }
        const inWin = !T_ || (gx >= 0 && gx <= T_.winW && gy >= T_.TH && gy <= T_.TH + T_.winH);
        if (inWin) {
        if (!p.nograin) {
        c += `0.6 w ${X(gx)} ${Y(gy - gl / 2)} m ${X(gx)} ${Y(gy + gl / 2)} l S\n`;
        c += `${X(gx)} ${Y(gy - gl / 2)} m ${X(gx - 3)} ${Y(gy - gl / 2 + 7)} l ${X(gx + 3)} ${Y(gy - gl / 2 + 7)} l h f\n`;
        text('Droit fil', gx + 5, gy + 3, 7);
        }
        if (p.lbl) { // nom court de la pièce, à l'intérieur de la pièce (sur 1 à 3 lignes selon la place)
          const xa = gx + 5, words = p.lbl.replace(/ (\d)$/, '\u00a0$1').split(' ');
          const split = n => { const ls = []; let k = 0; for (let r = 0; r < n; r++) { const rest = words.length - k, take = Math.ceil(rest / (n - r)); ls.push(words.slice(k, k + take).join(' ')); k += take; } return ls.filter(Boolean); };
          const fits = (ls, s) => ls.every((l, i) => { const w = tw(l, s) / PT, y = gy - 7 - (ls.length - 1 - i) * (s + 1.5); return [0, w / 2, w].every(dx => [0, -s * 0.7].every(dy => inPoly(p.poly, it.x0 + (xa - ox) / PT + dx, it.y0 + (y + dy - oy) / PT))); });
          let best = null;
          outer2: for (const s of [14, 12, 11, 10, 9, 8, 7, 6.5, 6, 5.5]) for (const n of [1, 2, 3]) { const ls = split(n); if (fits(ls, s)) { best = { ls, s }; break outer2; } }
          if (!best) best = { ls: split(Math.min(3, words.length)), s: 5.5 };
          best.ls.forEach((l, i) => text(l, xa, gy - 7 - (best.ls.length - 1 - i) * (best.s + 1.5), best.s));
        }
        }
        (p.marks || []).forEach(m => { const t = '(' + m.t + ')', s = 9; text(t, ox + (m.x - it.x0) * PT - tw(t, s) / 2, oy + (m.y - it.y0) * PT + s * 0.35, s); });
        if (T_) c += 'Q\n';
      }
      { // légende des lignes, en pied de page, alignée à droite
        const ps = (pg.tile ? [pg.tile.it] : pg.items).map(i => i.p), E = [['Ligne de couture', 0]];
        if (ps.some(p => p.sa)) E.push(['Marge de couture', 1]);
        if (ps.some(p => (p.internal || []).some((l, k) => !((p.internalKind || [])[k] && (p.internalKind[k].color === 'darkRed' || p.internalKind[k].color === 'green' || p.internalKind[k].place))))) E.push(['Repli', 2]);
        if (ps.some(p => (p.internal || []).some((l, k) => (p.internalKind || [])[k] && p.internalKind[k].color === 'green'))) E.push(['Repere', 5]);
        if (ps.some(p => p.dot)) E.push(['Fin de la ligne de coupe', 4]);
        if (ps.some(p => (p.internalKind || []).some(kd => kd && kd.place === 'poche'))) E.push(['Emplacement poche', 3]);
        if (ps.some(p => (p.internalKind || []).some(kd => kd && kd.place === 'patte'))) E.push(['Emplacement patte', 3]);
        if (ps.some(p => (p.internal || []).some((l, k) => (p.internalKind || [])[k] && p.internalKind[k].color === 'darkRed'))) E.push([opts.redLabel||'Boutonniere', 1]);
        const ly = VH - 2 * MARGIN + 2, wA = Math.min(PW / sc, PW) - 2 * MARGIN, LW = 22, GAP = 10;
        let lx = wA - E.reduce((t, e) => t + LW + 3 + tw(e[0], 6) + GAP, -GAP);
        E.forEach(e => {
          c += ['0 G 0.4 w [] 0 d', '0.75 0.22 0.17 RG 1.2 w [] 0 d', '0.12 0.44 0.82 RG 0.4 w [3 2] 0 d', '0.85 0.45 0.05 RG 1.1 w [5 2.5] 0 d', '0.84 0.16 0.16 RG 1.1 w [] 0 d', '0.10 0.55 0.25 RG 1.2 w [] 0 d'][e[1]] + (e[1] === 4 ? (() => { const r = 3, cx = lx + LW / 2, cy = ly - 2, U = (x, y) => `${X(x)} ${Y(y)}`; return `\n1 J ${U(cx - r, cy - r)} m ${U(cx + r, cy + r)} l S ${U(cx - r, cy + r)} m ${U(cx + r, cy - r)} l S\n0 G 0 J\n`; })() : `\n${X(lx)} ${Y(ly - 2)} m ${X(lx + LW)} ${Y(ly - 2)} l S\n0 G [] 0 d\n`);
          text(e[0], lx + LW + 3, ly, 6); lx += LW + 3 + tw(e[0], 6) + GAP;
        });
      }
      text(title + ' - page ' + (pi + 1 + OFF) + '/' + (L.pages.length + OFF) + (sc !== 1 ? ' - compensation x' + sc.toFixed(3) : ''), 0, VH - 2 * MARGIN + 2, 7);
      objs.push(opts.proj ? thick(c) : c);
    });
    if (RC && !VIG && !opts.proj) objs.unshift(recapPage(RC, pieces, L, title, opts));
    // assemblage PDF
    const parts = []; const offs = []; let len = 0;
    const emit = s => { const b = latin1(s); parts.push(b); len += b.length; };
    emit('%PDF-1.4\n');
    const n = L.pages.length + OFF;
    const obj = (i, body) => { offs[i] = len; emit(`${i} 0 obj\n${body}\nendobj\n`); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R /ViewerPreferences << /PrintScaling /None >> >>');
    obj(2, `<< /Type /Pages /Count ${n} /Kids [${objs.map((_, i) => (4 + 2 * i) + ' 0 R').join(' ')}] >>`);
    obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objs.forEach((c, i) => {
      obj(4 + 2 * i, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${OFF && i === 0 ? '595.28 841.89' : f(PW) + ' ' + f(PH)}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + 2 * i} 0 R >>`);
      obj(5 + 2 * i, `<< /Length ${c.length} >>\nstream\n${c}endstream`);
    });
    const total = 4 + 2 * n, xr = len;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let i = 1; i < total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    emit(x + `trailer\n<< /Size ${total} /Root 1 0 R /Info << /Title (${esc(title)}) >> >>\nstartxref\n${xr}\n%%EOF\n`);
    const out = new Uint8Array(len); let o = 0; for (const b of parts) { out.set(b, o); o += b.length; }
    return { bytes: out, pages: n, warnings: L.warnings };
  }
  const api = { build, layout };
  if (typeof window !== 'undefined') window.PatternPDF = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
