/* Générateur PDF vectoriel minimal (A4, échelle 1:1). UMD : window.PatternPDF / module.exports */
(function () {
  const PT = 72 / 2.54, PW = 595.276, PH = 841.89, MARGIN = 10 / 25.4 * 72;
  const f = n => (+n).toFixed(2);
  const HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
  function tw(s, size) { let w = 0; for (const ch of String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')) { const k = ch.charCodeAt(0); w += (k >= 32 && k <= 126 ? HW[k - 32] : 556); } return w * size / 1000; }
  function esc(s) { return String(s).replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e\xa0-\xff]/g, '?'); }
  function latin1(str) { const a = new Uint8Array(str.length); for (let i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 255; return a; }

  /* Range les pièces en rayonnage sur des pages A4. pieces: [{name,poly,sa,internal,note}] (cm, y vers le bas) */
  function layout(pieces, sc) {
    sc = sc || 1;
    const usableW = PW / sc - 2 * MARGIN, usableH = PH / sc - 2 * MARGIN;
    const gap = 0.8 * PT, head = pieces.some(p => p.ann) ? 40 : 28;
    const items = pieces.map(p => {
      const outline = p.sa || p.poly;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const q of outline) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      for (const l of (p.internal || [])) for (const q of l) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      for (const q of p.poly) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      return { p, x0, y0, w: (x1 - x0) * PT, h: (y1 - y0) * PT };
    });
    items.sort((a, b) => b.h - a.h);
    const pages = [], warnings = [];
    let page = null, x = 0, y = 0, rowH = 0;
    const newPage = () => { page = { items: [] }; pages.push(page); x = 0; y = 0; rowH = 0; };
    newPage();
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
      const dx = (usableW - (bx1 - bx0)) / 2 - bx0, dy = (usableH - (by1 - by0)) / 2 - by0;
      for (const it of pg.items) { it.px += Math.max(dx, -it.px); it.py += Math.max(dy, -it.py); }
    }
    // carré d'essai : premier coin libre de la page 1, sinon page supplémentaire
    const S = 5 * PT, T = { page: 0, x: 0, y: 0 };
    const cand = [[usableW - S, 0], [usableW - S, usableH - S - 12], [0, usableH - S - 12], [0, 0]];
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
      warnings.push(it.p.name + ' is printed on ' + (cols * rows) + ' A4 pages to be assembled (' + cols + ' × ' + rows + ').');
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        pages.push({ items: [], tile: { it, c, r, cols, rows, tx: c * (winW - OV), ty: r * (winH - OV), winW, winH, TH, OV } });
    }
    return { pages, warnings, test: T, head, tiled };
  }

  function build(pieces, opts) {
    opts = opts || {};
    const sc = opts.scale && opts.scale > 0.5 && opts.scale < 2 ? opts.scale : 1, VH = PH / sc;
    const L = layout(pieces, sc);
    const objs = [];            // chaînes de contenu des pages
    const title = opts.title || 'Pocket pattern';
    L.pages.forEach((pg, pi) => {
      let c = sc !== 1 ? `${f(sc)} 0 0 ${f(sc)} 0 0 cm\n` : '';
      const X = v => f(MARGIN + v), Y = v => f(VH - MARGIN - v);
      const text = (s, x, y, size) => { c += `BT /F1 ${size} Tf ${X(x)} ${Y(y)} Td (${esc(s)}) Tj ET\n`; };
      const path = (pts, close, ox, oy, x0, y0) => {
        pts.forEach((q, i) => { c += `${X(ox + (q.x - x0) * PT)} ${Y(oy + (q.y - y0) * PT)} ${i ? 'l' : 'm'}\n`; });
        if (close) c += 'h\n';
      };
      c += '0 G 0 g\n';
      if (pi === L.test.page) {
        const tx = L.test.x, ty = L.test.y;
        c += '0.5 w\n' + `${X(tx)} ${Y(ty + 5 * PT)} ${f(5 * PT)} ${f(5 * PT)} re S\n`;
        const SQ = 5 * PT, tl = [['Square 5 x 5 cm (2 in)', 8, 0], ['Print at 100 %', 8, 12], ['(no scaling)', 8, 22]];
        const wl = []; (opts.lines || []).forEach(s => { let cur = ''; s.split(', ').forEach(part => { const t = cur ? cur + ', ' + part : part; if (cur && tw(t, 6.5) > SQ - 6) { wl.push(cur + ','); cur = part; } else cur = t; }); if (cur) wl.push(cur); });
        wl.forEach((s, i) => tl.push([s, 6.5, 40 + 9 * i]));
        const top = 12 - 5.8, bot = 12 + tl[tl.length - 1][2] + 1.5, sh = SQ / 2 - (top + bot) / 2;
        tl.forEach(t => { const w = tw(t[0], t[1]); text(t[0], tx + Math.max(2, (SQ - w) / 2), ty + 12 + t[2] + sh, t[1]); });
      }
      if (pi === 0 && !pg.items.length && L.tiled.length) { // page de contrôle seule : explication de l'assemblage
        const msg = ['This pocket is too large for one A4 page: it is printed on several pages to be assembled.'].concat(L.tiled.map(t => '- ' + t.name + ': ' + t.cols + ' column(s) x ' + t.rows + ' row(s), i.e. ' + (t.cols * t.rows) + ' pages.'), ['Cut along the edge of the frames (crop marks at the 4 corners) and overlap the 1.5 cm (0.6 in) overlap zones:', 'the lines of the piece must continue exactly from one page to the next. Glue or tape together.']);
        msg.forEach((m, i) => text(m, 0, 5 * PT + 40 + 12 * i, i ? 8 : 9));
      }
      for (const it of (pg.tile ? [pg.tile.it] : pg.items)) {
        const p = it.p, T_ = pg.tile;
        const ox = T_ ? -T_.tx : it.px, oy = T_ ? T_.TH - T_.ty : it.py + L.head;
        if (T_) {
          const idn = 'L' + (T_.r + 1) + '-C' + (T_.c + 1), wl2 = (opts.date ? 'Created on ' + opts.date : '') + (p.note ? '  -  ' + p.note : '');
          text(p.name + ' - page ' + idn + ' (' + T_.cols + ' column(s) x ' + T_.rows + ' row(s))', 0, 10, 9);
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
          if (T_.c < T_.cols - 1) { c += `${X(x1 - T_.OV)} ${Y(y0)} m ${X(x1 - T_.OV)} ${Y(y1)} l S\n`; { const t2 = 'Overlaps ' + nb(T_.c + 1, T_.r) + ' >'; text(t2, x1 - T_.OV - tw(t2, 6) - 2, y0 + 10, 6); } }
          if (T_.c > 0) { c += `${X(T_.OV)} ${Y(y0)} m ${X(T_.OV)} ${Y(y1)} l S\n`; text('< ' + nb(T_.c - 1, T_.r), 2, y0 + 10, 6); }
          if (T_.r < T_.rows - 1) { c += `${X(0)} ${Y(y1 - T_.OV)} m ${X(x1)} ${Y(y1 - T_.OV)} l S\n`; text('Overlaps ' + nb(T_.c, T_.r + 1) + ' (below)', x1 / 2 - 40, y1 - T_.OV - 3, 6); }
          if (T_.r > 0) { c += `${X(0)} ${Y(y0 + T_.OV)} m ${X(x1)} ${Y(y0 + T_.OV)} l S\n`; text(nb(T_.c, T_.r - 1) + ' (above)', x1 / 2 - 30, y0 + T_.OV + 8, 6); }
          c += '[] 0 d\n';
          c += `q ${X(0)} ${Y(y1)} ${f(x1)} ${f(T_.winH)} re W n\n`;
        } else {
        // étiquette : nom de la pièce + date de création + paramètres
        const bh = p.ann ? 36 : 24;
        c += '0.4 w [] 0 d\n' + `${X(ox)} ${Y(oy - 2)} ${f(Math.min(it.w, 15 * PT))} ${bh} re S\n`;
        const bw = Math.min(it.w, 15 * PT), l2 = (opts.date ? 'Created on ' + opts.date : '') + (p.note ? '  -  ' + p.note : '');
        text(p.name, ox + Math.max(2, (bw - tw(p.name, 10)) / 2), oy - (p.ann ? 28 : 17), 10);
        text(l2, ox + Math.max(2, (bw - tw(l2, 7)) / 2), oy - (p.ann ? 17 : 6), 7);
        if (p.ann) text(p.ann, ox + Math.max(2, (bw - tw(p.ann, 7)) / 2), oy - 6, 7);
        }
        // ligne de coupe
        if (p.sa) { c += '0.75 0.22 0.17 RG 1.2 w [] 0 d\n'; path(p.sa, true, ox, oy, it.x0, it.y0); c += 'S\n0 G\n'; }
        // ligne de couture
        c += '0.4 w [] 0 d\n'; path(p.poly, true, ox, oy, it.x0, it.y0); c += 'S\n';
        // crans : trait vers l'intérieur depuis la ligne de couture (+ trait depuis la ligne de coupe s'il y a une marge)
        if (p.notches && p.notches.length) {
          c += '0.4 w [] 0 d\n';
          p.notches.forEach(nt => {
            const P1 = { x: nt.x, y: nt.y }, P2 = { x: nt.x - nt.nx * nt.len, y: nt.y - nt.ny * nt.len };
            path([P1, P2], false, ox, oy, it.x0, it.y0); c += 'S\n';
            if (p.sa && nt.w > 0) { path([{ x: nt.x + nt.nx * nt.w, y: nt.y + nt.ny * nt.w }, { x: nt.x + nt.nx * (nt.w - nt.len), y: nt.y + nt.ny * (nt.w - nt.len) }], false, ox, oy, it.x0, it.y0); c += 'S\n'; }
          });
        }
        // pièce coupée sur le pli du tissu (bord = 1er côté du contour) : symbole « placer sur le pli »
        if (p.fold && p.poly.length > 1) {
          const A = p.poly[0], B = p.poly[1], el = Math.hypot(B.x - A.x, B.y - A.y) || 1, ux = (B.x - A.x) / el, uy = (B.y - A.y) / el;
          let sgn = 0; for (let i = 0; i < p.poly.length; i++) { const u = p.poly[i], v = p.poly[(i + 1) % p.poly.length]; sgn += u.x * v.y - v.x * u.y; }
          const nx = (sgn > 0 ? 1 : -1) * uy, ny = -(sgn > 0 ? 1 : -1) * ux; // normale extérieure ; le symbole va vers l'intérieur
          const inset = 1.5, depth = 1.0, hd = 0.35;
          const P = (t, d) => ({ x: A.x + ux * t - nx * d, y: A.y + uy * t - ny * d });
          if (el > 2 * inset + 2) {
            c += '0.5 w [] 0 d\n';
            [inset, el - inset].forEach(t => { path([P(t, 0), P(t, depth)], false, ox, oy, it.x0, it.y0); c += 'S\n'; });
            path([P(inset, depth), P(el - inset, depth)], false, ox, oy, it.x0, it.y0); c += 'S\n';
            [inset, el - inset].forEach(t => { path([P(t - hd * 0.5, hd * 1.4), P(t, 0), P(t + hd * 0.5, hd * 1.4)], true, ox, oy, it.x0, it.y0); c += 'f\n'; });
            const mid = P(el / 2, depth - 0.3), tx = ox + (mid.x - it.x0) * PT, ty = oy + (mid.y - it.y0) * PT, lbl = 'Place on fold';
            text(lbl, tx - tw(lbl, 7) / 2, ty, 7);
          }
        }
        // lignes internes
        c += '0.12 0.44 0.82 RG 0.4 w [3 2] 0 d\n';
        for (const ln of (p.internal || [])) { path(ln, false, ox, oy, it.x0, it.y0); c += 'S\n'; }
        c += '0 G [] 0 d\n';
        // fil droit
        let cx = 0, cy = 0; p.poly.forEach(q => { cx += q.x; cy += q.y; }); cx /= p.poly.length; cy /= p.poly.length;
        let gx = ox + (cx - it.x0) * PT, gy = oy + (cy - it.y0) * PT, gl = Math.min(it.h * 0.5, 6 * PT);
        // pièce non convexe (ex. bande en U) : on cherche une position où le fil droit reste dans la matière
        const inPoly = (q, x, y) => { let c = false; for (let i = 0, j = q.length - 1; i < q.length; j = i++) { if ((q[i].y > y) !== (q[j].y > y) && x < ((q[j].x - q[i].x) * (y - q[i].y)) / (q[j].y - q[i].y) + q[i].x) c = !c; } return c; };
        const okAt = (xcm, ycm, lcm) => { for (let k = 0; k <= 8; k++) if (!inPoly(p.poly, xcm, ycm - lcm / 2 + (lcm * k) / 8)) return false; return true; };
        if (p.fold) { cy = Math.min(...p.poly.map(q => q.y)) + 2.6; gl = Math.min(gl, 1.6 * PT); gy = oy + (cy - it.y0) * PT; }
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
        c += `0.6 w ${X(gx)} ${Y(gy - gl / 2)} m ${X(gx)} ${Y(gy + gl / 2)} l S\n`;
        c += `${X(gx)} ${Y(gy - gl / 2)} m ${X(gx - 3)} ${Y(gy - gl / 2 + 7)} l ${X(gx + 3)} ${Y(gy - gl / 2 + 7)} l h f\n`;
        text('Grainline', gx + 5, gy + 3, 7);
        if (p.lbl) { // nom court de la pièce, à l'intérieur de la pièce (sur 1 à 3 lignes selon la place)
          const xa = gx + 5, words = p.lbl.replace(/ (\d)$/, '\u00a0$1').split(' ');
          const split = n => { const ls = []; let k = 0; for (let r = 0; r < n; r++) { const rest = words.length - k, take = Math.ceil(rest / (n - r)); ls.push(words.slice(k, k + take).join(' ')); k += take; } return ls.filter(Boolean); };
          const fits = (ls, s) => ls.every((l, i) => { const w = tw(l, s) / PT, y = gy - 7 - (ls.length - 1 - i) * (s + 1.5); return [0, w / 2, w].every(dx => [0, -s * 0.7].every(dy => inPoly(p.poly, it.x0 + (xa - ox) / PT + dx, it.y0 + (y + dy - oy) / PT))); });
          let best = null;
          outer2: for (const s of [9, 8, 7, 6.5, 6, 5.5]) for (const n of [1, 2, 3]) { const ls = split(n); if (fits(ls, s)) { best = { ls, s }; break outer2; } }
          if (!best) best = { ls: split(Math.min(3, words.length)), s: 5.5 };
          best.ls.forEach((l, i) => text(l, xa, gy - 7 - (best.ls.length - 1 - i) * (best.s + 1.5), best.s));
        }
        }
        if (T_) c += 'Q\n';
      }
      text(title + ' - page ' + (pi + 1) + '/' + L.pages.length + (sc !== 1 ? ' - scale compensation x' + sc.toFixed(3) : ''), 0, VH - 2 * MARGIN + 2, 7);
      objs.push(c);
    });
    // assemblage PDF
    const parts = []; const offs = []; let len = 0;
    const emit = s => { const b = latin1(s); parts.push(b); len += b.length; };
    emit('%PDF-1.4\n');
    const n = L.pages.length;
    const obj = (i, body) => { offs[i] = len; emit(`${i} 0 obj\n${body}\nendobj\n`); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R /ViewerPreferences << /PrintScaling /None >> >>');
    obj(2, `<< /Type /Pages /Count ${n} /Kids [${objs.map((_, i) => (4 + 2 * i) + ' 0 R').join(' ')}] >>`);
    obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objs.forEach((c, i) => {
      obj(4 + 2 * i, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(PW)} ${f(PH)}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + 2 * i} 0 R >>`);
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
