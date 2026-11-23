/* Saharienne femme (aperçu privé) : calcul, aperçu et PDF.
   Lit window.SAHF_DATA (saharienne_femme_data.js) et window.SAHF_CFG (textes et champs, définis par la page).
   Le formulaire par étapes est celui d'etapes.js (window.WZ_CFG) ; l'étape « Style » est fournie par window.SAH_STYLE_UI ci-dessous. */
(function () {
  'use strict';
  var CFG = window.SAHF_CFG, D = window.SAHF_DATA, E = PatternEngine, L = CFG.lang;
  var $ = function (id) { return document.getElementById(id); };
  E.setBevel(0.34);
  /* le tracé « Pièce d’épaule (option) » des pièces simples n’est pas affiché */
  D.blocks.forEach(function (b) { b.pieces.forEach(function (p) { p.iPaths = (p.iPaths || []).filter(function (id) { var m = b.modeling[id]; return !(m && /^Pièce d.épaule/.test(m.name || '')); }); }); });

  /* ---------- pièces ---------- */
  var N = CFG.names; // noms de pièces du fichier Seamly2D, par code
  var ENG = {}; // nom d'origine du moteur utilisé pour superposer les pièces dérivées (voir sheet.js)
  ENG[N.sDos] = 'Dos'; ENG[N.sDevant] = 'Devant'; ENG[N.sPar] = 'Parementure'; ENG[N.col] = 'Col'; ENG[N.colT] = 'ColThermo';
  ENG[N.dDosE] = 'Dos'; ENG[N.dDosN] = 'Dos'; ENG[N.fenteE] = 'FenteExt'; ENG[N.fenteI] = 'FenteInt'; ENG[N.dblDos] = 'DoublureDos'; ENG[N.epaule] = 'Epaule';
  ENG[N.dDevE] = 'Devant'; ENG[N.dDevN] = 'Devant'; ENG[N.dPar] = 'Parementure'; ENG[N.dblDev] = 'DoublureDevant';
  ENG[N.parT] = 'DevantThermo1'; ENG[N.parTm] = 'DevantThermo2';
  ENG[N.m1] = 'Manche1'; ENG[N.m2] = 'Manche2'; ENG[N.mc1] = 'Manchette1'; ENG[N.mc2] = 'Manchette2';
  ENG[N.dblM1] = 'DoublureManche1'; ENG[N.dblM2] = 'DoublureManche2'; ENG[N.mcourte1] = 'Manche_courte1'; ENG[N.mcourte2] = 'Manche_courte2';

  var st = { ver: 's' }; // version : 's' simple, 'd' doublée
  function ver() { return (window.SAH_STYLE && window.SAH_STYLE.ver) || 's'; }
  function flag(id) { if (id === 'opt_courtes') return !!(window.SAH_STYLE && window.SAH_STYLE.man === 'c'); var e = $(id); return !!(e && e.checked); }

  function selected() {
    var v = ver(), ep = flag('opt_epaule'), sh = flag('opt_courtes'), g = {};
    [].forEach.call(document.querySelectorAll('.grp:checked'), function (c) { g[c.value] = 1; });
    var out = [];
    if (g.corps) {
      if (v === 's') out.push(N.sDevant, N.sDos, N.col, N.sPar);
      else out.push(ep ? N.dDevE : N.dDevN, ep ? N.dDosE : N.dDosN, ep ? N.epaule : null, N.dPar, N.col);
      if (window.SAH_STYLE && window.SAH_STYLE.fen && window.SAH_STYLE.fen !== '0') out.push(N.fenteE, N.fenteI);   /* mêmes fentes (ext. et int.) pour toutes les versions */
    }
    if (g.manches) out.push.apply(out, sh ? [N.mcourte1, N.mcourte2] : [N.m1, N.m2, N.mc1, N.mc2]);
    if (g.doublure && v === 'd') out.push(N.dblDev, N.dblDos);
    if (g.doublure && v === 'd' && !sh) out.push(N.dblM1, N.dblM2);
    if (g.thermo) out.push(N.colT, N.parT, N.parTm);
    return out.filter(Boolean);
  }

  /* ---------- champs ---------- */
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
    /* contrôles de cohérence entre mesures (combinaisons impossibles) */
    var EN = CFG.lang === 'en', cm = null;
    var mHD = val('M_PoitrineHautDevant'), mD = val('M_PoitrineDevant'), mT = val('M_TourPoitrineHaut'), mLD = val('M_LongueurDevantTaille'), mLB = val('M_LongueurDosTaille');
    if (mD < mHD) cm = EN ? 'The bust front cannot be smaller than the high bust front: check these two measurements.' : 'La partie devant de la poitrine ne peut pas être plus petite que celle de la poitrine haute : vérifiez ces deux mesures.';
    else if (mHD < 0.42 * mT) cm = EN ? 'The high bust front looks too small compared with the full high bust: check these two measurements.' : 'La partie devant de la poitrine haute paraît trop petite par rapport au tour complet : vérifiez ces deux mesures.';
    else if (mLD < mLB - 2) cm = EN ? 'The front waist length looks too short compared with the back waist length: check these two measurements (the tape goes over the bust).' : 'La longueur devant paraît trop courte par rapport à la longueur dos : vérifiez ces deux mesures (le ruban passe sur la poitrine).';
    if (cm) throw new Error(cm);
    var ov = {}; F.forEach(function (f) { var v = val(f[0]); ov['#' + f[0]] = f[7] ? v / 100 : v; });
    if (window.SAH_STYLE && window.SAH_STYLE.sea !== undefined) ov['#P_Saison'] = window.SAH_STYLE.sea;
    var seam = val('seam'), key = JSON.stringify([ov, seam]), all;
    if (CACHE.k === key) all = CACHE.v; else {
      all = [];
      D.blocks.forEach(function (b, bi) {
        if (!b.pieces.length) return;
        var res = E.computeBlock(D, bi, ov, { chain: true });
        E.computePieces(res, { seamWidth: seam, bevel: {}, miter: {} }).forEach(function (p) { all.push(p); });
      });
      CACHE = { k: key, v: all };
    }
    var sel = selected(), out = all.filter(function (p) { return sel.indexOf(p.name) >= 0; });
    for (var i = 0; i < out.length; i++) { var p = out[i]; if (p.poly.some(function (q) { return !isFinite(q.x + q.y); }) || selfX(p.poly)) throw new Error(CFG.t.err_bad); }
    window.SAH_MEAS = val('meas');
    return { pieces: out, seam: seam, ov: ov };
  }
  function foldEdge(p) { var best = -1, bl = 0, n = p.poly.length; for (var i = 0; i < n; i++) { var a = p.poly[i], b = p.poly[(i + 1) % n]; if (a.wa === 0 && b.wb === 0) { var l = Math.hypot(b.x - a.x, b.y - a.y); if (l > bl) { bl = l; best = i; } } } return best < 0 ? 0 : best; }
  /* couleurs Seamly2D des tracés intérieurs -> styles du PDF (rouge = boutonnière, bleu foncé = emplacement, vert = repère) */
  function kindOf(k) {
    var c = k.color;
    if (c === 'darkRed') return k;
    if (c === 'darkGreen') return Object.assign({}, k, { color: 'green' });
    if (c === 'darkBlue') return Object.assign({}, k, { place: 'poche' });
    return k;
  }
  function prepare(r) {
    return r.pieces.map(function (p) {
      var eng = ENG[p.name] || p.name, th = /thermocollant/.test(p.name), dbl = /Doublure/.test(p.name), q = p.quantity || 1;
      return Object.assign({}, p, {
        eng: eng, grainTop: eng === 'Devant', internalKind: (p.internalKind || []).map(kindOf),
        name: CFG.pn[p.name] || p.name, lbl: CFG.pn[p.name] || p.name, fold: p.onFold, foldEdge: p.onFold ? foldEdge(p) : 0,
        ann: (th ? CFG.t.thermo : dbl ? CFG.t.lining : CFG.t.main) + ' - ' + (p.onFold ? CFG.t.qtyf : CFG.t.qty).replace('%n', q), note: ''
      });
    });
  }

  /* ---------- aperçu à l'écran ---------- */
  function draw() {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? CFG.t.err_fix : e.message; $('dl').disabled = $('dl1').disabled = true; $('prev').innerHTML = ''; return; }
    var ps = prepare(r); $('dl').disabled = $('dl1').disabled = !ps.length; $('msg').textContent = ps.length ? '' : CFG.t.err_none;
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

  /* ---------- PDF ---------- */
  function build(single) {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? CFG.t.err_fix : e.message; return; }
    var ps = prepare(r); if (!ps.length) { $('msg').textContent = CFG.t.err_none; return; }
    var m = val('meas'); if (Math.abs(m - 50) < 0.2) m = 50; var sc = (!single && m >= 40 && m <= 60) ? 50 / m : 1;
    var d = new Date(), dt = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    var f = function (v) { return dec(Math.round(v * 100) / 100); }, o = r.ov;
    var info = ((window.SAH_STYLE && window.SAH_STYLE.seaTxt) ? window.SAH_STYLE.seaTxt + ', ' : '') + CFG.info.map(function (n) { var q = F.filter(function (z) { return z[0] === n; })[0]; return q[1].toLowerCase() + ' ' + f(o['#' + n]); }).join(', ');
    var title = CFG.t.pdf, res = (!single && window.SAH_MODE !== 'sep') ? PatternSheet.build(ps, { title: title, lines: [info], scale: sc, date: dt, lang: L })
      : PatternPDF.build(ps, { title: single ? CFG.t.pdf1 : title, lines: [info], scale: sc, date: dt, single: single, recap: { title: CFG.t.title, params: [['', info]], mode: 'auto' } });
    $('msg').textContent = res.warnings.join(' ');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([res.bytes], { type: 'application/pdf' })); a.download = single ? CFG.t.file1 : CFG.t.file; a.click();
  }
  function openPrev() {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? CFG.t.err_fix : e.message; return; }
    var ps = prepare(r); if (!ps.length) { $('msg').textContent = CFG.t.err_none; return; }
    window.SAH_PREVIEW({ sep: function () { return PatternPDF.layout(ps, 1).pages.length + 1; }, sup: function () { return PatternSheet.plan(ps, { lang: L }); }, go: function () { build(false); } });
  }

  /* ---------- étape « Style » du formulaire ---------- */
  function applyVersion() {
    var d = ver() === 'd', ep = $('opt_epaule'), g = document.querySelector('.grp[value="doublure"]');
    if (ep && ep.closest('label')) ep.closest('label').hidden = !d;
    if (g) { g.closest('label').hidden = !d; }
  }
  /* l'étape « Style » est celle des pages homme (saharienne-style.js), avec le croquis femme ; on y ajoute la mention de validation */
  var M = window.SAH_STYLE_UI;
  window.SAH_STYLE_UI = Object.assign({}, M, {
    build: function (sec) { M.build(sec); applyVersion(); },
    smalls: function () { var r = M.smalls(); r.intro = (r.intro || '') ; return r; }
  });
  window.addEventListener('sah-style', function () { applyVersion(); draw(); });

  window.addEventListener('resize', function () { draw(); });
  document.addEventListener('input', function (ev) { if (ev.target.closest && ev.target.closest('.fld,#v_seam')) draw(); });
  document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t.closest) return;
    if (t.closest('.grp') || t.classList.contains('grp') || t.id === 'opt_epaule') draw();
  });
  $('dl').onclick = openPrev; $('dl1').onclick = function () { build(true); };
  applyVersion();
  window.addEventListener('load', function () { applyVersion(); draw(); });
})();
