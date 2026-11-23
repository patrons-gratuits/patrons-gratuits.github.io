/* Robe Béa (aperçu privé) : calcul, aperçu et PDF.
   Lit window.ROBE_DATA (robe_bea_data.js, converti du fichier Seamly2D) et window.ROBE_CFG (textes et champs, définis par la page).
   Le formulaire par étapes est celui d'etapes.js (window.WZ_CFG) ; l'étape « Style » vient de robe-style.js (window.SAH_STYLE_UI, window.ROBE_STYLE). */
(function () {
  'use strict';
  var CFG = window.ROBE_CFG, D = window.ROBE_DATA, E = PatternEngine, L = CFG.lang;
  var $ = function (id) { return document.getElementById(id); };
  E.setBevel(0.34);
  var ENG = {}; /* les parementures se superposent au devant et au dos (voir sheet.js) */
  ENG['Parementure devant'] = 'PareDevant'; ENG['Parementure dos'] = 'PareDos'; ENG['Deco Devant'] = 'DecoDevant'; ENG['Deco dos'] = 'DecoDos'; ENG['Garniture poche'] = 'GarniturePoche'; ENG['Poche int'] = 'PocheInt';
  var N = CFG.names, STY = function () { return window.ROBE_STYLE || { longueur: 'mini', ed: 0, eb: 0, poche: 'cote', nb: 1, ang: 41.3 }; };

  /* le tracé « Poche » (ouverture) du devant n'est affiché qu'avec les poches passepoilées */
  function hideOpening(p, on) {
    var b = D.blocks[0];
    var base = p.__ip || (p.__ip = (p.iPaths || []).slice());
    p.iPaths = base.filter(function (id) { var m = b.modeling[id]; return on || !(m && m.name === 'Poche'); });
  }
  function selected() {
    var s = STY(), out = [N.devant, N.dos, N.parDev, N.parDos, N.decDev, N.decDos];
    if (s.poche === 'cote') out.push(N.pCote);
    else out.push(N.devPoche, N.pInt, N.passepoil, N.garniture, N.entoilage);
    return out;
  }

  var F = CFG.fields; // [nom, étiquette, unité, min, max, défaut, pas, pourcentage?]
  function val(n) { var e = $('v_' + n), v = e ? parseFloat(e.value) : NaN; return v; }
  function dec(s) { return String(s).replace('.', CFG.dec); }
  function check() {
    var m = {};
    F.forEach(function (f) { var v = val(f[0]); if (($('v_' + f[0]) || {}).value === '') m[f[0]] = ''; else if (!(v >= f[3] - 1e-9 && v <= f[4] + 1e-9)) m[f[0]] = CFG.t.err_range.replace('%a', dec(f[3])).replace('%b', dec(f[4])).replace('%u', f[2] ? ' ' + f[2] : ''); });
    var s = val('seam'); if (!(s >= 0 && s <= 3)) m.seam = CFG.t.err_range.replace('%a', '0').replace('%b', '3').replace('%u', ' cm');
    return m;
  }
  function showErrors(m) {
    [].forEach.call(document.querySelectorAll('.err'), function (e) { e.textContent = ''; });
    [].forEach.call(document.querySelectorAll('.row input'), function (i) { i.classList.remove('bad'); });
    Object.keys(m).forEach(function (k) { var e = $('e_' + k), i = $('v_' + k); if (e) e.textContent = m[k]; if (i && m[k]) i.classList.add('bad'); });
    return Object.keys(m).length > 0;
  }
  function segX(a, b, c, d) { var o = function (p, q, r) { return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x); }; return o(a, b, c) * o(a, b, d) < -1e-9 && o(c, d, a) * o(c, d, b) < -1e-9; }
  function selfX(P) { var n = P.length, s = Math.max(1, Math.floor(n / 300)), q = []; for (var i = 0; i < n; i += s) q.push(P[i]); var m = q.length; for (var a = 0; a < m; a++) for (var j = a + 5; j < m; j++) { if (a + m - j < 5) continue; if (segX(q[a], q[(a + 1) % m], q[j], q[(j + 1) % m])) return true; } return false; }

  var CACHE = { k: null, v: null };
  function compute() {
    var bad = check();
    if (showErrors(bad)) { var e = new Error(''); e.fieldErrors = true; throw e; }
    var mHD = val('M_PoitrineHautDevant'), mD = val('M_PoitrineDevant');
    if (mD < mHD) throw new Error(L === 'en' ? 'The bust front cannot be smaller than the high bust front: check these two measurements.' : 'La partie devant de la poitrine ne peut pas être plus petite que celle de la poitrine haute : vérifiez ces deux mesures.');
    var s = STY(), ov = {};
    D.blocks[0].pieces.forEach(function (p) { if (p.name === N.devant) hideOpening(p, s.poche === 'passepoil'); });
    F.forEach(function (f) { var v = val(f[0]); ov['#' + f[0]] = f[7] ? v / 100 : v; });
    ov['#P_LongueurSousTaille'] = window.ROBE_K[s.longueur] || 1; ov['#P_EncolureDevant'] = s.ed; ov['#P_EncolureDos'] = s.eb; ov['#P_AnglePoche'] = s.ang;
    var seam = val('seam'), key = JSON.stringify([ov, seam, s.poche]), all;
    if (CACHE.k === key) all = CACHE.v; else {
      all = [];
      var res = E.computeBlock(D, 0, ov, { chain: true });
      E.computePieces(res, { seamWidth: seam, bevel: {}, miter: {} }).forEach(function (p) { all.push(p); });
      CACHE = { k: key, v: all };
    }
    var sel = selected(), out = all.filter(function (p) { return sel.indexOf(p.name) >= 0; });
    for (var i = 0; i < out.length; i++) { var p = out[i]; if (p.poly.some(function (q) { return !isFinite(q.x + q.y); }) || selfX(p.poly)) throw new Error(CFG.t.err_bad); }
    window.SAH_MEAS = val('meas');
    return { pieces: out, seam: seam, ov: ov };
  }
  function foldEdge(p) { var best = -1, bl = 0, n = p.poly.length; for (var i = 0; i < n; i++) { var a = p.poly[i], b = p.poly[(i + 1) % n]; if (a.wa === 0 && b.wb === 0) { var l = Math.hypot(b.x - a.x, b.y - a.y); if (l > bl) { bl = l; best = i; } } } return best < 0 ? 0 : best; }
  function kindOf(k) {
    var c = k.color;
    if (c === 'darkRed') return k;
    if (c === 'darkGreen') return Object.assign({}, k, { color: 'green' });
    if (c === 'darkBlue') return Object.assign({}, k, { place: 'poche' });
    return k;
  }
  function prepare(r) {
    var s = STY(), per = s.poche === 'passepoil' ? (s.nb === 2 ? 2 : 1) : null;
    return r.pieces.map(function (p) {
      var q = p.quantity || 1;
      if (per && /^(Devant poche|Poche int|Passepoil|Garniture poche|Entoilage passepoil)$/.test(p.name)) q = per;
      var fab = CFG.fab[p.name] || CFG.fab._;
      var note = (p.name === N.devant && s.poche === 'passepoil' && s.nb === 1) ? CFG.t.oneSide : '';
      return Object.assign({}, p, {
        eng: ENG[p.name] || p.name, grainTop: p.name === N.devant, internalKind: (p.internalKind || []).map(kindOf),
        name: CFG.pn[p.name] || p.name, lbl: CFG.pn[p.name] || p.name, fold: p.onFold, foldEdge: p.onFold ? foldEdge(p) : 0, quantity: q,
        ann: fab + ' - ' + (p.onFold ? CFG.t.qtyf : CFG.t.qty).replace('%n', q), note: note
      });
    });
  }

  function draw() {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? CFG.t.err_fix : e.message; $('dl').disabled = $('dl1').disabled = true; $('prev').innerHTML = ''; return; }
    var ps = prepare(r); $('dl').disabled = $('dl1').disabled = !ps.length; $('msg').textContent = '';
    var G = 3, bs = ps.map(function (p) { return E.bbox(p.sa || p.poly); });
    function lay(W) { var x = 0, y = 0, rowH = 0, pos = bs.map(function (b) { if (x > 0 && x + b.w > W) { x = 0; y += rowH + G; rowH = 0; } var o = { x: x, y: y }; x += b.w + G; rowH = Math.max(rowH, b.h + 3); return o; }); return { pos: pos, H: y + rowH }; }
    var wide = window.innerWidth > 760, cw = ($('prev').parentNode.clientWidth || 600) - 28, ch = wide ? Math.max(300, window.innerHeight - 90) : 1e9;
    var W = 170, best = 0, minW = Math.max.apply(null, bs.map(function (b) { return b.w; })), tot = bs.reduce(function (s, b) { return s + b.w + G; }, 0);
    if (wide) for (var w = Math.ceil(minW); w <= tot + 1; w += Math.max(2, Math.round(minW / 20))) { var Lw = lay(w), sc = Math.min(cw / (w + 2), ch / (Lw.H + 2)); if (sc > best) { best = sc; W = w; } }
    var LY = lay(W), out = '';
    ps.forEach(function (p, i) {
      var b = bs[i], x = LY.pos[i].x, y = LY.pos[i].y, dx = x - b.x0, dy = y - b.y0;
      var P = function (a) { return a.map(function (q) { return (q.x + dx).toFixed(2) + ',' + (q.y + dy).toFixed(2); }).join(' '); };
      out += '<polygon points="' + P(p.poly) + '" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/>';
      if (p.sa) out += '<polygon points="' + P(p.sa) + '" fill="none" stroke="var(--cut)" stroke-width="2" vector-effect="non-scaling-stroke"/>';
      (p.internal || []).forEach(function (l, k) {
        var kd = (p.internalKind || [])[k] || {};
        out += '<polyline points="' + P(l) + '" fill="none" stroke="' + (kd.color === 'darkRed' || kd.place ? '#D97306' : kd.color === 'green' ? '#008F58' : 'var(--fold)') + '" stroke-width="' + (kd.color === 'darkRed' ? 2.5 : 1) + '" stroke-dasharray="' + (kd.color === 'darkRed' ? 'none' : kd.place ? '6 3' : '5 4') + '" vector-effect="non-scaling-stroke"/>';
      });
      out += '<text x="' + (x + b.w / 2).toFixed(1) + '" y="' + (y + b.h + 2.2).toFixed(1) + '" font-size="' + Math.max(1.1, Math.min(2, (b.w + G) / (p.name.length * 0.55))).toFixed(2) + '" text-anchor="middle" fill="currentColor">' + p.name + '</text>';
    });
    $('prev').setAttribute('viewBox', '-1 -1 ' + (W + 2) + ' ' + (LY.H + 2).toFixed(1)); $('prev').innerHTML = out;
  }

  function build(single) {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? CFG.t.err_fix : e.message; return; }
    var ps = prepare(r); if (!ps.length) { $('msg').textContent = CFG.t.err_none; return; }
    var m = val('meas'); if (Math.abs(m - 50) < 0.2) m = 50; var sc = (!single && m >= 40 && m <= 60) ? 50 / m : 1;
    var d = new Date(), dt = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    var f = function (v) { return dec(Math.round(v * 100) / 100); }, o = r.ov;
    var info = CFG.info.map(function (n) { var q = F.filter(function (z) { return z[0] === n; })[0]; return q[1].toLowerCase() + ' ' + f(o['#' + n]); }).join(', ');
    var res = (!single && window.SAH_MODE !== 'sep') ? PatternSheet.build(ps, { title: CFG.t.pdf, lines: [info], scale: sc, date: dt, lang: L })
      : PatternPDF.build(ps, { title: single ? CFG.t.pdf1 : CFG.t.pdf, lines: [info], scale: sc, date: dt, single: single, recap: { title: CFG.t.title, params: [['', info]], mode: 'auto' } });
    $('msg').textContent = res.warnings.join(' ');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([res.bytes], { type: 'application/pdf' })); a.download = single ? CFG.t.file1 : CFG.t.file; a.click();
  }

  function level() { var l = $('lvl'); if (l) l.textContent = STY().poche === 'passepoil' ? '●●●○' : '●●○○'; }
  window.addEventListener('sah-style', function () { level(); draw(); });
  level();
  window.addEventListener('resize', function () { draw(); });
  document.addEventListener('input', function (ev) { if (ev.target.closest && ev.target.closest('.fld,#v_seam')) draw(); });
  function openPrev() {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? CFG.t.err_fix : e.message; return; }
    var ps = prepare(r); if (!ps.length) { $('msg').textContent = CFG.t.err_none; return; }
    window.SAH_PREVIEW({ sep: function () { return PatternPDF.layout(ps, 1).pages.length + 1; }, sup: function () { return PatternSheet.plan(ps, { lang: L }); }, go: function () { build(false); } });
  }

  /* ---------- métrage estimé : pièces placées sur le tissu plié en deux (140 cm de large utile 136), fil droit, fil inversé (tête-bêche) permis ---------- */
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
  function packLen(items, W) {   /* items : [{polys,fold,fx,n}] -> longueur (cm) sur la largeur W, ou null */
    var occ = [], H = 0, list = [];
    items.forEach(function (it) { for (var k = 0; k < it.n; k++) list.push(it); });
    var area = function (it) { var pts = [].concat.apply([], it.polys), xs = pts.map(function (q) { return q.x; }), ys = pts.map(function (q) { return q.y; }); return (Math.max.apply(null, xs) - Math.min.apply(null, xs)) * (Math.max.apply(null, ys) - Math.min.apply(null, ys)); };
    list.sort(function (a, b) { return (b.fold - a.fold) || (area(b) - area(a)); });
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
  var SEC = { 'Parementure devant': 1, 'Parementure dos': 1 }, DEC = { 'Deco Devant': 1, 'Deco dos': 1, 'Passepoil': 1, 'Garniture poche': 1 };
  function yardage(r) {
    var per = STY().poche === 'passepoil' ? (STY().nb === 2 ? 2 : 1) : null, g = { main: [], sec: [], dec: [] };
    r.pieces.forEach(function (p) {
      if (p.name === N.entoilage) return;
      var q = p.quantity || 1; if (per && /^(Devant poche|Poche int|Passepoil|Garniture poche)$/.test(p.name)) q = per;
      g[SEC[p.name] ? 'sec' : DEC[p.name] ? 'dec' : 'main'].push({ p: p, q: q });
    });
    var res = {};
    ['main', 'sec', 'dec'].forEach(function (k) {
      if (!g[k].length) return;
      var folded = g[k].map(function (x) { return { polys: [x.p.sa || x.p.poly], fold: x.p.onFold ? 1 : 0, fx: x.p.onFold ? foldX(x.p) : null, n: x.p.onFold ? 1 : Math.ceil(x.q / 2) }; });
      var h = packLen(folded, FOLDW);
      if (k !== 'main') {   /* petite quantité : le tissu peut aussi être coupé à plat, en une épaisseur */
        var flat = g[k].map(function (x) { var base = x.p.sa || x.p.poly, polys = [base], fx = x.p.onFold ? foldX(x.p) : null; if (fx !== null) polys.push(base.map(function (q) { return { x: 2 * fx - q.x, y: q.y }; })); return { polys: polys, fold: 0, fx: null, n: x.p.onFold ? 1 : x.q }; });
        var h2 = packLen(flat, FLATW); if (h2 !== null && (h === null || h2 < h)) h = h2;
      }
      if (h !== null) res[k] = Math.ceil((h + 5) / 10) * 10;
    });
    return res;
  }
  function metTxt(cm) {
    if (window.UNITS && window.UNITS.mode() === 'in') { var yd = Math.ceil(cm / 91.44 * 8) / 8; return (Math.round(yd * 1000) / 1000).toString().replace('.', L === 'en' ? '.' : ',') + ' yd'; }
    return (cm / 100).toFixed(2).replace('.', L === 'en' ? '.' : ',') + ' m';
  }
  if (window.SAH_STYLE_UI) window.SAH_STYLE_UI.extra = function () {
    var r; try { r = compute(); } catch (e) { return ''; }
    var y = yardage(r), t = CFG.t, rows = '';
    [['main', t.yMain], ['sec', t.ySec], ['dec', t.yDec]].forEach(function (x) { if (y[x[0]]) rows += '<tr><th scope="row">' + x[1] + '</th><td>' + metTxt(y[x[0]]) + '</td></tr>'; });
    if (!rows) return '';
    return '<h3>' + t.yTitle + '</h3><table class="wz-t"><tbody>' + rows + '</tbody></table><p class="wz-note">' + t.yNote + '</p>';
  };
  $('dl').onclick = openPrev; $('dl1').onclick = function () { build(true); };
  window.addEventListener('load', function () { draw(); });
})();
