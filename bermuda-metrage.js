/* Métrage estimé du bermuda : mêmes règles que la robe Béa (tissu plié en deux, 140 cm de large utile 136,
   fil droit, pièces têtes-bêches permises, marges de couture comprises). Fournit window.BermMetrage.estimate(pieces, extras). */
(function (root) {
  'use strict';
  var FOLDW = 68, FLATW = 136, GAPC = 1;
  function profile(polys) {   /* par ligne de 1 cm : [xmin, xmax] occupés (plusieurs polygones fusionnés) */
    var all = [].concat.apply([], polys), y0 = Math.min.apply(null, all.map(function (q) { return q.y; })), y1 = Math.max.apply(null, all.map(function (q) { return q.y; })), n = Math.ceil(y1 - y0), rows = [], i, k;
    for (i = 0; i < n; i++) {
      var yc = y0 + i + 0.5, lo = Infinity, hi = -Infinity;
      polys.forEach(function (poly) {
        for (k = 0; k < poly.length; k++) {
          var a = poly[k], b = poly[(k + 1) % poly.length];
          if ((a.y > yc) !== (b.y > yc)) { var x = a.x + (yc - a.y) * (b.x - a.x) / (b.y - a.y); if (x < lo) lo = x; if (x > hi) hi = x; }
        }
      });
      rows.push(lo === Infinity ? null : [lo, hi]);
    }
    return rows;
  }
  function foldX(p) { var n = p.poly.length, best = -1, bl = 0; for (var i = 0; i < n; i++) { var a = p.poly[i], b = p.poly[(i + 1) % n]; if (a.wa === 0 && b.wb === 0) { var l = Math.hypot(b.x - a.x, b.y - a.y); if (l > bl) { bl = l; best = i; } } } return best >= 0 ? (p.poly[best].x + p.poly[(best + 1) % n].x) / 2 : null; }
  function variants(it) {
    var base = it.polys, out = [], tf = function (fx, fy) { return base.map(function (pl) { return pl.map(function (q) { return { x: fx * q.x, y: fy * q.y }; }); }); };
    var pts = [].concat.apply([], base), cx = pts.reduce(function (s, q) { return s + q.x; }, 0) / pts.length;
    var fxs = it.fold ? [(it.fx !== null && it.fx > cx) ? -1 : 1] : [1, -1];
    fxs.forEach(function (fx) { [1, -1].forEach(function (fy) { out.push(tf(fx, fy)); }); });
    return out;
  }
  function packLen(items, W, nosort) {   /* items : [{polys,fold,fx,n}] -> longueur (cm) sur la largeur W, ou null */
    var occ = [], H = 0, list = [];
    items.forEach(function (it) { for (var k = 0; k < it.n; k++) list.push(it); });
    var area = function (it) { var pts = [].concat.apply([], it.polys), xs = pts.map(function (q) { return q.x; }), ys = pts.map(function (q) { return q.y; }); return (Math.max.apply(null, xs) - Math.min.apply(null, xs)) * (Math.max.apply(null, ys) - Math.min.apply(null, ys)); };
    if (!nosort) list.sort(function (a, b) { return (b.fold - a.fold) || (area(b) - area(a)); });
    for (var li = 0; li < list.length; li++) {
      var it = list[li], best = null, vs = variants(it);
      for (var vi = 0; vi < vs.length; vi++) {
        var polys = vs[vi], pts = [].concat.apply([], polys), x0m = Math.min.apply(null, pts.map(function (q) { return q.x; })), x1m = Math.max.apply(null, pts.map(function (q) { return q.x; })), y0m = Math.min.apply(null, pts.map(function (q) { return q.y; }));
        var w = x1m - x0m; if (w + GAPC > W + 1e-6) continue;
        var rows = profile(polys.map(function (pl) { return pl.map(function (q) { return { x: q.x - x0m, y: q.y - y0m }; }); })), maxx = Math.floor(W - w);
        for (var y = 0; y < 900; y++) {
          if (best && y >= best.y) break;
          for (var x0 = 0; x0 <= (it.fold ? 0 : maxx); x0++) {
            var ok = true;
            for (var r = 0; r < rows.length && ok; r++) {
              var rw = rows[r]; if (!rw) continue; var o = occ[y + r]; if (!o) continue;
              for (var q = 0; q < o.length; q++) { if (rw[0] + x0 < o[q][1] + GAPC && rw[1] + x0 > o[q][0] - GAPC) { ok = false; break; } }
            }
            if (ok) { if (!best || y < best.y || (y === best.y && x0 < best.x)) best = { y: y, x: x0, rows: rows }; break; }
          }
        }
      }
      if (!best) return null;
      best.rows.forEach(function (rw, r) { if (!rw) return; (occ[best.y + r] = occ[best.y + r] || []).push([rw[0] + best.x, rw[1] + best.x]); });
      H = Math.max(H, best.y + best.rows.length);
    }
    return H;
  }
  function estimate(pieces, extras) {
    var g = [];
    pieces.forEach(function (p) {
      if (/^Entoilage/.test(p.eng || p.name)) return;
      var q = p.quantity || 1;
      g.push({ polys: [p.sa || p.poly], fold: p.onFold ? 1 : 0, fx: p.onFold ? foldX(p) : null, n: p.onFold ? 1 : Math.ceil(q / 2) });
    });
    (extras || []).forEach(function (e) {   /* rectangles : {w, h, n} en cm, marges comprises */
      var r = [{ x: 0, y: 0 }, { x: e.w, y: 0 }, { x: e.w, y: e.h }, { x: 0, y: e.h }];
      g.push({ polys: [r], fold: 0, fx: null, n: Math.ceil(e.n / 2) });
    });
    /* plusieurs ordres de placement ; on garde la plus courte longueur (l'ordre par surface seul varie de ± 30 cm) */
    var best = packLen(g, FOLDW), seed = 12345, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var flat = []; g.forEach(function (it) { for (var k = 0; k < it.n; k++) flat.push({ polys: it.polys, fold: it.fold, fx: it.fx, n: 1 }); });
    for (var t = 0; t < 40; t++) {
      var L = flat.slice(), i, j, tmp;
      for (i = L.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); tmp = L[i]; L[i] = L[j]; L[j] = tmp; }
      L.sort(function (a, b) { return b.fold - a.fold; });   /* les pièces sur le pli d'abord */
      var h = packLen(L, FOLDW, true);
      if (h !== null && (best === null || h < best)) best = h;
    }
    return best === null ? null : Math.ceil((best + 5) / 10) * 10;
  }
  /* poches plaquées (module Poches) : pièces estimées en rectangles, marges comprises (ourlet de 3 cm, soufflets de 4 cm de profondeur) */
  function pocketRects(L, H, t, flap, n) {
    var out = [], w = L + 3, h = H + 5;
    if (t === '0' || !(L > 0)) return out;
    if (t === 'c' || t === 'd') w += 8;
    out.push({ w: w, h: h, n: n });
    if (t === 'l' || t === 'd') out.push({ w: 7, h: h, n: 2 * n });
    if (flap) out.push({ w: L + 3, h: 0.35 * H + 5, n: n });
    return out;
  }
  /* sel : { c: {t, r}, a: {t, r} } ; vars : #P_PocheCargoL, #P_PocheCargoH */
  function pockets(vars, sel) {
    var l = [];
    if (sel.c) l = l.concat(pocketRects(vars['#P_PocheCargoL'], vars['#P_PocheCargoH'], sel.c.t, sel.c.r, 2));
    if (sel.a) l = l.concat(pocketRects(13, 14, sel.a.t, sel.a.r, 2));
    return l;
  }
  root.BermMetrage = { estimate: estimate, pockets: pockets };
})(typeof window !== 'undefined' ? window : globalThis);
