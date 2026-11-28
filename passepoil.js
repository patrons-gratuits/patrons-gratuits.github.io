/* passepoil.js — page « Poche passepoilée » (FR et EN) : formulaire, calcul (patron Seamly2D v18 → pp_data.js), aperçu, PDF.
   La langue vient de <html lang>. Les valeurs saisies sont toujours en cm (units.js ajoute les pouces par-dessus). */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var $ = function (id) { return document.getElementById(id); }, D = window.PP_DATA, E = PatternEngine;
  var T = EN ? {
    types: { dbl: 'Double welt', one: 'Single welt', onef: 'Single welt with flap', fen: 'Slit pocket', fenf: 'Slit pocket with flap' },
    title: 'Welt pocket', pdf: 'Welt pocket - A4 pattern 1:1', pdf1: 'Welt pocket - one-page pattern 1:1', file: 'welt-pocket-pattern.pdf', file1: 'welt-pocket-pattern-one-page.pdf',
    range: 'Between %a and %b%u.', bad: 'This combination of values does not give a feasible pattern: change the dimensions.', fix: 'Fix the values shown in red.',
    seamBig: 'Seam allowance too large for this pocket: %m cm at most.',
    btnForced: 'Above 45°, the flap must be buttoned.', closed: 'Closed', open: 'Open',
    side: { gd: 'Both (a pair)', d: 'Right pocket', g: 'Left pocket' }, sideTag: { a: '(a) – left pocket', b: '(b) – right pocket' },
    noseam: 'no seam allowance', withseam: 'seam allowance', qty: 'x', pcs: 'pieces',
    P: {
      'Cache du cadre': ['Frame template', 'Paper – do not cut in fabric', 'Paper. Cut out the window (thick black line), then place the template on the right side of the garment.'],
      'Renfort de l’ouverture': ['Opening reinforcement', 'Fusible interfacing', 'Fusible interfacing, no seam allowance. Centre it under the opening using the notches.'],
      'Passepoil': ['Welt', 'Main or contrasting fabric – allowances included', 'Allowances included. Fold lengthways along the dash-dot line.'],
      'Entoilage du passepoil': ['Welt interfacing', 'Fusible interfacing', 'Fusible interfacing, no seam allowance.'],
      'Garniture': ['Facing', 'Main or contrasting fabric', 'Sewn onto the back pocket bag, so that the lining does not show through the opening.'],
      'Dessus de poche': ['Front pocket bag', 'Lining', 'Lies against the wrong side of the garment.'],
      'Dessus de poche retourné': ['Turned front pocket bag', 'Slit pockets only – main fabric if light, otherwise lining with a facing', 'Slit pockets only. Main fabric if it is light; otherwise cut it in lining, plus a facing (2 facings).'],
      'Dessous de poche': ['Back pocket bag', 'Lining', 'Carries the facing, seen through the opening.'],
      'Rabat': ['Flap', 'Main or contrasting fabric', 'Cut 2: the flap and its lining. Sew them right sides together, leaving the top open.'],
      'Entoilage du rabat': ['Flap interfacing', 'Fusible interfacing', 'Fusible interfacing, no seam allowance.']
    }
  } : {
    types: { dbl: 'Double passepoil', one: 'Un passepoil', onef: 'Un passepoil avec rabat', fen: 'Poche fendue', fenf: 'Poche fendue avec rabat' },
    title: 'Poche passepoilée', pdf: 'Poche passepoilée - patron A4 1:1', pdf1: 'Poche passepoilée - patron en une page 1:1', file: 'patron-poche-passepoilee.pdf', file1: 'patron-poche-passepoilee-une-page.pdf',
    range: 'Entre %a et %b%u.', bad: 'Cette combinaison de valeurs ne donne pas un patron réalisable : modifiez les dimensions.', fix: 'Corrigez les valeurs signalées en rouge.',
    seamBig: 'Marge de couture trop grande pour cette poche : %m cm au maximum.',
    btnForced: 'Au-delà de 45°, le rabat doit être boutonné.', closed: 'Fermé', open: 'Ouvert',
    side: { gd: 'Les deux (une paire)', d: 'Poche droite', g: 'Poche gauche' }, sideTag: { a: '(a) – poche gauche', b: '(b) – poche droite' },
    noseam: 'sans marge', withseam: 'marge', qty: '×', pcs: 'pièces',
    P: {
      'Cache du cadre': ['Cache du cadre', 'Papier – ne pas couper dans le tissu', 'Papier. Évider la fenêtre (trait noir épais), puis poser le cache sur l’endroit du vêtement.'],
      'Renfort de l’ouverture': ['Renfort de l’ouverture', 'Thermocollant', 'Thermocollant, sans marge. À centrer sous l’ouverture grâce aux crans.'],
      'Passepoil': ['Passepoil', 'Tissu principal ou contrastant – marges comprises', 'Marges comprises. À plier en deux dans la longueur, sur la ligne tirets-points.'],
      'Entoilage du passepoil': ['Entoilage du passepoil', 'Thermocollant', 'Thermocollant, sans marge.'],
      'Garniture': ['Garniture', 'Tissu principal ou contrastant', 'Cousue sur le dessous de poche, pour que la doublure ne se voie pas par l’ouverture.'],
      'Dessus de poche': ['Dessus de poche', 'Doublure', 'Pièce plaquée contre l’envers du vêtement.'],
      'Dessus de poche retourné': ['Dessus de poche retourné', 'Poche fendue seulement – tissu principal s’il est fin, sinon doublure + garniture', 'Poche fendue seulement. Tissu principal s’il est fin ; sinon doublure, avec une garniture en plus (2 garnitures).'],
      'Dessous de poche': ['Dessous de poche', 'Doublure', 'Porte la garniture, que l’on voit par l’ouverture.'],
      'Rabat': ['Rabat', 'Tissu principal ou contrastant', 'Couper 2 : le rabat et sa doublure. À coudre endroit contre endroit, bord du haut ouvert.'],
      'Entoilage du rabat': ['Entoilage du rabat', 'Thermocollant', 'Thermocollant, sans marge.']
    }
  };
  var K = 2.54, r2 = function (v) { return Math.round(v * 100) / 100; }, dec = function (s) { return EN ? String(s) : String(s).replace('.', ','); }, fm = function (v) { return dec(r2(v)); };
  var TY = { dbl: { nb: 2, rab: 0 }, one: { nb: 1, rab: 0 }, onef: { nb: 1, rab: 1 }, fen: { nb: 0, rab: 0 }, fenf: { nb: 0, rab: 1 } };
  var ORDER = ['dbl', 'one', 'onef', 'fen', 'fenf'], cur = 'dbl';
  var RG = { LongOuv: [8, 20], AngleEntree: [0, 90], ProfUtile: [8, 25], LevreD: [0.4, 0.7], LevreS: [1, 2.5], HautRabat: [4, 7] };
  var DEF = { LongOuv: 14, AngleEntree: 15, ProfUtile: 14, LevreD: 0.5, LevreS: 1.5, HautRabat: 5 };

  function num(id, d) { var e = $('v_' + id), v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; }
  function show(e, on) { if (e) e.style.display = on ? '' : 'none'; }
  function ty() { return TY[cur]; }
  function vis(id) { var w = $('w_' + id); return !!w && w.style.display !== 'none'; }

  /* ---------- formulaire ---------- */
  function renderTypes() {
    $('types').innerHTML = ORDER.map(function (k) { return '<label><input type="radio" name="tp" class="tp" value="' + k + '"' + (k === cur ? ' checked' : '') + '> ' + T.types[k] + '</label>'; }).join('');
    [].forEach.call(document.querySelectorAll('.tp'), function (i) { i.addEventListener('change', function () { setType(i.value); }); });
  }
  function setType(k) {
    if (!TY[k]) return; cur = k; var s = $('v_type'); if (s) s.value = k;
    [].forEach.call(document.querySelectorAll('.tp'), function (i) { i.checked = i.value === k; });
    draw();
  }
  function sync() {
    var t = ty(), ang = num('AngleEntree', 15);
    show($('w_LevreD'), cur === 'dbl'); show($('w_LevreS'), cur === 'one' || cur === 'onef');
    show($('sec_levre'), t.nb > 0); show($('lev_note'), cur === 'dbl'); show($('sec_rabat'), !!t.rab);
    ['LevreD', 'LevreS'].forEach(function (n) { var i = $('v_' + n); if (i) i.disabled = !vis(n); });
    var hr = $('v_HautRabat'), fo = $('v_forme'); if (hr) hr.disabled = !t.rab; if (fo) fo.disabled = !t.rab;
    var cs = $('v_cote'); if (cs) { cs.disabled = !(ang > 0); $('w_cote').style.opacity = ang > 0 ? '' : '.5'; }
    var bt = $('bouton'), forced = !!t.rab && ang > 45;
    if (bt) { if (forced) bt.checked = true; bt.disabled = !t.rab || forced; }
    show($('bouton_msg'), forced); $('bouton_msg').textContent = forced ? T.btnForced : '';
  }
  function sideId() { var s = $('v_cote'); return s && s.value ? s.value : 'gd'; }

  /* ---------- calcul ---------- */
  function check(seam) {
    var m = {}, chk = function (n, u) { if (!vis(n) && n !== 'LongOuv' && n !== 'AngleEntree' && n !== 'ProfUtile') return; var v = num(n, NaN), r = RG[n];
      if (!(v >= r[0] - 1e-9 && v <= r[1] + 1e-9)) m[n] = T.range.replace('%a', dec(r[0])).replace('%b', dec(r[1])).replace('%u', u ? ' cm' : ''); };
    chk('LongOuv', 1); chk('AngleEntree', 0); chk('ProfUtile', 1);
    if (cur === 'dbl') chk('LevreD', 1); if (cur === 'one' || cur === 'onef') chk('LevreS', 1); if (ty().rab) chk('HautRabat', 1);
    if (!(seam >= 0 && seam <= 3)) m.seam = T.range.replace('%a', '0').replace('%b', '3').replace('%u', ' cm');
    return m;
  }
  function showErrors(m) {
    [].forEach.call(document.querySelectorAll('.err'), function (e) { e.textContent = ''; });
    [].forEach.call(document.querySelectorAll('.row input'), function (i) { i.classList.remove('bad'); });
    Object.keys(m).forEach(function (k) { var e = $('e_' + k), i = $('v_' + k); if (e) e.textContent = m[k]; if (i) i.classList.add('bad'); });
    return Object.keys(m).length > 0;
  }
  function segX(a, b, c, d) { var o = function (p, q, r) { return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x); }; return o(a, b, c) * o(a, b, d) < -1e-9 && o(c, d, a) * o(c, d, b) < -1e-9; }
  function selfX(P) { var n = P.length; for (var i = 0; i < n; i++) for (var j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (segX(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return true; } return false; }
  function allPts(p) { return Array.prototype.concat.apply((p.sa || p.poly).slice(), p.internal || []); }
  function mirror(p, tag) {
    var b = E.bbox(allPts(p)), c = 2 * b.x0 + b.w;
    var M = function (a) { return a.map(function (q) { return Object.assign({}, q, { x: c - q.x }); }).reverse(); };
    var q = Object.assign({}, p, { poly: M(p.poly), sa: p.sa ? M(p.sa) : p.sa, internal: (p.internal || []).map(M), internalKind: p.internalKind,
      notches: (p.notches || []).map(function (n) { return Object.assign({}, n, { x: c - n.x, nx: -n.nx }); }) });
    return q;
  }
  function clipY(poly, y0, keepBelow) {          // découpe d'un polygone par la droite y = y0 (garde y >= y0)
    var out = [], n = poly.length;
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], ia = a.y >= y0 - 1e-9, ib = b.y >= y0 - 1e-9;
      if (ia) out.push({ x: a.x, y: a.y });
      if (ia !== ib) { var t = (y0 - a.y) / (b.y - a.y); out.push({ x: a.x + t * (b.x - a.x), y: y0 }); }
    }
    return out;
  }
  function flapPieces(L, hr, forme, seam) {
    var W = L + 0.5, d = 0.25, m = 1, yb = m + hr, pts = [{ x: d, y: 0 }, { x: W - d, y: 0 }, { x: W, y: m }];
    var rr = forme === 'rect' ? 0 : forme === 'round' ? Math.min(2, hr * 0.4) : Math.min(1.5, hr * 0.3);
    var q = function (a, c, b) { for (var k = 0; k <= 6; k++) { var t = k / 6; pts.push({ x: (1 - t) * (1 - t) * a.x + 2 * t * (1 - t) * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * t * (1 - t) * c.y + t * t * b.y }); } };
    if (!rr) pts.push({ x: W, y: yb }, { x: 0, y: yb });
    else if (forme === 'round') { q({ x: W, y: yb - rr }, { x: W, y: yb }, { x: W - rr, y: yb }); q({ x: rr, y: yb }, { x: 0, y: yb }, { x: 0, y: yb - rr }); }
    else pts.push({ x: W, y: yb - rr }, { x: W - rr, y: yb }, { x: rr, y: yb }, { x: 0, y: yb - rr });
    pts.push({ x: 0, y: m });
    var sa = null; if (seam > 0) { sa = clipY(E.offsetPolygon(pts, seam), 0); }
    var rab = { name: 'Rabat', poly: pts, sa: sa, notches: [{ x: 0, y: m, nx: -1, ny: 0, len: 0.4 }, { x: W, y: m, nx: 1, ny: 0, len: 0.4 }], internal: [], internalKind: [], quantity: 2 };
    var ent = { name: 'Entoilage du rabat', poly: clipY(pts, m), sa: null, notches: [], internal: [], internalKind: [], quantity: 1 };
    return [rab, ent];
  }
  var NAMES = { dbl: ['Cache du cadre', 'Renfort de l’ouverture', 'Passepoil', 'Entoilage du passepoil', 'Garniture', 'Dessus de poche', 'Dessous de poche'],
    fen: ['Cache du cadre', 'Renfort de l’ouverture', 'Garniture', 'Dessus de poche retourné', 'Dessous de poche'] };
  NAMES.one = NAMES.dbl; NAMES.onef = NAMES.dbl.concat(['Rabat', 'Entoilage du rabat']); NAMES.fen = NAMES.fen; NAMES.fenf = NAMES.fen.concat(['Rabat', 'Entoilage du rabat']);
  var PAIRED = { 'Cache du cadre': 1, 'Renfort de l’ouverture': 1, 'Garniture': 1, 'Dessus de poche': 1, 'Dessus de poche retourné': 1, 'Dessous de poche': 1 };

  function compute() {
    var seamV = parseFloat($('v_seam').value), seam = isNaN(seamV) ? 1 : seamV, bad = check(seam);
    if (showErrors(bad)) { var e = new Error(''); e.fieldErrors = true; throw e; }
    var t = ty(), lev = cur === 'dbl' ? num('LevreD', DEF.LevreD) : (t.nb === 1 ? num('LevreS', DEF.LevreS) : 1.5);
    var ang = num('AngleEntree', 15), L = num('LongOuv', 14), hr = num('HautRabat', 5), forme = $('v_forme') ? $('v_forme').value : 'cut';
    var ov = { '#LongOuv': L, '#AngleEntree': ang, '#ProfUtile': num('ProfUtile', 14), '#NbLevres': t.nb, '#Levre': lev, '#AvecRabat': t.rab };
    var res = E.computeBlock(D, 0, ov), all = E.computePieces(res, { seamWidth: seam }), byName = {};
    all.forEach(function (p) { byName[p.name] = p; });
    var sd = ang > 0 ? sideId() : 'g', list = [];
    NAMES[cur].forEach(function (n) {
      var p = byName[n]; if (!p) { var fp = flapPieces(L, hr, forme, seam); p = fp.filter(function (x) { return x.name === n; })[0]; }
      if (!p) return;
      var k = p.internalKind || []; p = Object.assign({}, p);
      if (n === 'Cache du cadre') p.internalKind = (p.internal || []).map(function (l, i) { return { pp: i === 0 ? 'win' : 'cut' }; });
      if (n === 'Passepoil') p.internalKind = (p.internal || []).map(function () { return { pp: 'fold' }; });
      var q = n === 'Passepoil' ? (t.nb === 2 ? 2 : 1) : n === 'Entoilage du passepoil' ? (t.nb === 2 ? 2 : 1) : n === 'Rabat' ? 2 : 1;
      if (PAIRED[n] && ang > 0 && sd !== 'g') {
        if (sd === 'd') list.push({ n: n, p: mirror(p), q: q, tag: '' });
        else { var A = Object.assign({}, p), B = mirror(p); list.push({ n: n, p: A, q: q, tag: '(a)', tagL: T.sideTag.a }, { n: n, p: B, q: q, tag: '(b)', tagL: T.sideTag.b }); }
      } else list.push({ n: n, p: p, q: q * (ang === 0 || sd !== 'gd' ? 1 : 1), tag: '' });
    });
    var pair = ang > 0 && sd === 'gd';
    list.forEach(function (x) { if (pair && !PAIRED[x.n]) x.q *= 2; });
    var bad2 = list.some(function (x) { return !x.p.poly.every(function (q) { return isFinite(q.x + q.y); }) || selfX(x.p.poly) || (x.p.sa && selfX(x.p.sa)); });
    if (bad2) { if (seam > 0) { var mx = -1; for (var kk = Math.ceil(seam * 10) - 1; kk >= 0; kk--) { var s2 = kk / 10; var ok = E.computePieces(res, { seamWidth: s2 }).every(function (p) { return !(p.sa && selfX(p.sa)) && !selfX(p.poly); }); if (ok) { mx = s2; break; } } if (mx >= 0) { showErrors({ seam: T.seamBig.replace('%m', fm(mx)) }); var e1 = new Error(''); e1.fieldErrors = true; throw e1; } } throw new Error(T.bad); }
    return { list: list, seam: seam, ov: { L: L, ang: ang, hr: hr, lev: lev, nb: t.nb, rab: t.rab, prof: ov['#ProfUtile'], forme: forme, sd: sd }, pair: pair };
  }

  /* ---------- aperçu des pièces ---------- */
  function label(x) { var P = T.P[x.n]; return P[0] + (x.tag ? ' ' + x.tag : '') + (x.q > 1 ? ' ' + T.qty + x.q : ''); }
  function drawPieces(r) {
    var items = r.list.map(function (x) { var b = E.bbox(allPts(x.p)); return { x: x, b: b }; });
    items.sort(function (a, b) { return b.b.h - a.b.h; });
    var area0 = items.reduce(function (t, i) { return t + (i.b.w + 2) * (i.b.h + 3); }, 0), fs = Math.max(0.6, Math.sqrt(area0) * 0.032);
    items.forEach(function (it) { it.w = Math.max(it.b.w, label(it.x).length * fs * 0.5); });
    var area = items.reduce(function (t, i) { return t + (i.w + 2) * (i.b.h + 3); }, 0), maxw = Math.max.apply(0, items.map(function (i) { return i.w; }));
    var Wt = Math.max(maxw + 2, Math.sqrt(area * 1.5)), rows = [], row = null;
    items.forEach(function (it) { if (!row || row.w + it.w + 2 > Wt) { row = { it: [], w: 0, h: 0 }; rows.push(row); } row.it.push(it); row.w += it.w + 2; row.h = Math.max(row.h, it.b.h); });
    var TW = Math.max.apply(0, rows.map(function (r0) { return r0.w; })), y = 0, out = '';
    rows.forEach(function (rw) {
      var x = 0;
      rw.it.forEach(function (it) {
        var dx = x + (it.w - it.b.w) / 2 - it.b.x0, dy = y - it.b.y0, p = it.x.p, P = function (a) { return a.map(function (q) { return (q.x + dx).toFixed(2) + ',' + (q.y + dy).toFixed(2); }).join(' '); };
        out += '<polygon points="' + P(p.poly) + '" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/>';
        if (p.sa) out += '<polygon points="' + P(p.sa) + '" fill="none" stroke="var(--cut)" stroke-width="2.5" vector-effect="non-scaling-stroke"/>';
        (p.internal || []).forEach(function (l, i) { var kd = (p.internalKind || [])[i] || {}, st = kd.pp === 'win' ? 'stroke="currentColor" stroke-width="4"' : kd.pp === 'fold' ? 'stroke="currentColor" stroke-width="1.5" stroke-dasharray="9 3 2 3"' : kd.pp === 'cut' ? 'stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"' : 'stroke="var(--fold)" stroke-width="2" stroke-dasharray="7 5"';
          out += '<polyline points="' + P(l) + '" fill="none" ' + st + ' vector-effect="non-scaling-stroke"/>'; });
        (p.notches || []).forEach(function (n) { out += '<line x1="' + (n.x + dx).toFixed(2) + '" y1="' + (n.y + dy).toFixed(2) + '" x2="' + (n.x - n.nx * n.len + dx).toFixed(2) + '" y2="' + (n.y - n.ny * n.len + dy).toFixed(2) + '" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/>'; });
        out += '<text x="' + (x + it.w / 2).toFixed(2) + '" y="' + (y + it.b.h + fs * 1.15).toFixed(2) + '" font-size="' + fs.toFixed(2) + '" text-anchor="middle" fill="currentColor">' + label(it.x) + '</text>';
        x += it.w + 2;
      });
      y += rw.h + fs * 2.6;
    });
    $('prev').setAttribute('viewBox', '-1 -1 ' + (TW + 1).toFixed(2) + ' ' + (y + 0.5).toFixed(2)); $('prev').innerHTML = out;
  }

  /* ---------- aperçu de la poche finie ---------- */
  function one(o, mir) {
    var tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); PasspoilVue.draw(tmp, o);
    var vb = tmp.getAttribute('viewBox').split(' ').map(parseFloat), inner = tmp.innerHTML;
    if (mir) { inner = '<g transform="scale(-1 1)">' + inner + '</g>'; vb[0] = -(vb[0] + vb[2]); }
    return { vb: vb, inner: inner };
  }
  function drawVue(r) {
    var svg = $('vue'); if (!svg || !window.PasspoilVue) return;
    var base = { L: r.ov.L, ang: r.ov.ang, nb: r.ov.nb, lev: r.ov.lev, rabat: !!r.ov.rab, hr: r.ov.hr, bouton: !!($('bouton') && $('bouton').checked) || (r.ov.rab && r.ov.ang > 45), prof: r.ov.prof, pal: 'bleu', forme: r.ov.forme, en: EN };
    var mir = r.ov.sd === 'd', f = function (v) { return Math.round(v * 10) / 10; };
    if (!r.ov.rab) { var a = one(Object.assign({ leve: false }, base), mir); svg.setAttribute('viewBox', a.vb.map(f).join(' ')); svg.innerHTML = a.inner; return; }
    var c = one(Object.assign({}, base, { leve: false }), mir), o = one(Object.assign({}, base, { leve: true }), mir), w = c.vb[2], h = c.vb[3], gap = w * 0.04, cap = 34;
    svg.setAttribute('viewBox', '0 0 ' + f(2 * w + gap) + ' ' + f(h + cap));
    svg.innerHTML = '<rect width="' + f(2 * w + gap) + '" height="' + f(h + cap) + '" fill="#eef3f5"/>' +
      '<svg x="0" y="0" width="' + f(w) + '" height="' + f(h) + '" viewBox="' + c.vb.map(f).join(' ') + '">' + c.inner + '</svg>' +
      '<svg x="' + f(w + gap) + '" y="0" width="' + f(w) + '" height="' + f(h) + '" viewBox="' + o.vb.map(f).join(' ') + '">' + o.inner + '</svg>' +
      '<text x="' + f(w / 2) + '" y="' + f(h + 24) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="19" fill="#2a3f47">' + T.closed + '</text>' +
      '<text x="' + f(w + gap + w / 2) + '" y="' + f(h + 24) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="19" fill="#2a3f47">' + T.open + '</text>';
  }

  function draw() {
    sync();
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? T.fix : e.message; $('dl').disabled = $('dl1').disabled = true; return; }
    $('dl').disabled = $('dl1').disabled = false; $('msg').textContent = '';
    drawPieces(r); drawVue(r); fracs();
  }
  function fracStr(x) { if (!(x >= 0)) return ''; var q = Math.round(x * 16), w = Math.floor(q / 16), n = q % 16, d = 16; while (n && n % 2 === 0) { n /= 2; d /= 2; } var f = n ? n + '/' + d : '', s = w && f ? w + ' ' + f : (f || String(w)); return (Math.abs(x * 16 - q) < 0.02 ? '= ' : '≈ ') + s + ' in'; }
  function fracs() { /* les fractions sont gérées par units.js (champ en pouces) */ }

  /* ---------- PDF ---------- */
  function download(single) {
    var r; try { r = compute(); } catch (e) { $('msg').textContent = e.fieldErrors ? T.fix : e.message; return; }
    var fu = function (v) { return (window.UNITS && UNITS.mode() === 'in' ? fm(v / K) + ' in' : fm(v) + ' cm'); };
    var o = r.ov, info = T.types[cur] + (EN ? ': length ' : ' : longueur ') + fu(o.L) + (EN ? ', angle ' : ', angle ') + o.ang + '°' + (o.nb ? (EN ? ', lip ' : ', lèvre ') + fu(o.lev) : '') + (o.rab ? (EN ? ', flap ' : ', rabat ') + fu(o.hr) : '') + (EN ? ', depth ' : ', profondeur ') + fu(o.prof) + ', ' + (r.seam > 0 ? T.withseam + ' ' + fu(r.seam) : T.noseam);
    var m = parseFloat($('v_meas').value); if (window.UNITS && UNITS.activeMm && UNITS.mode() === 'in') { /* le champ réel reste en mm */ }
    if (Math.abs(m - 50) < 0.2) m = 50; var sc = (!single && m >= 40 && m <= 60) ? 50 / m : 1;
    var d = new Date(), dt = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    var named = r.list.map(function (x) {
      var P = T.P[x.n], nm = P[0] + (x.tag ? ' ' + x.tag : '');
      return Object.assign({}, x.p, { name: T.title + ' - ' + nm, note: info, ann: P[2] + (x.tagL ? ' ' + x.tagL + '.' : ''), lbl: P[0] + (x.tag ? ' ' + x.tag : '') + (x.q > 1 ? ' ' + T.qty + x.q : ''), rlabel: nm, rqty: x.q, rfab: P[1], fold: false,
        nograin: !/^Dessus de poche|^Dessous de poche/.test(x.n) });
    });
    var prm = [['', info]];
    if (o.ang > 0) prm.push([EN ? 'Side' : 'Côté', T.side[o.sd]]);
    var res = PatternPDF.build(named, { title: single ? T.pdf1 : T.pdf, lines: [info], scale: sc, date: dt, single: !!single, recap: { title: T.title + ' - ' + T.types[cur], params: prm } });
    $('msg').textContent = res.warnings.join(' ');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([res.bytes], { type: 'application/pdf' })); a.download = single ? T.file1 : T.file; a.click();
  }

  /* ---------- démarrage ---------- */
  var pvc = $('vue') && $('vue').closest('.card'); if (pvc) pvc.classList.add('pvc');
  { var hmax = 0, setH = function (reset) { var h = window.innerHeight; if (reset || h > hmax) { hmax = h; document.documentElement.style.setProperty('--pvh', h + 'px'); } }; setH(true); window.addEventListener('resize', function () { setH(false); }); window.addEventListener('orientationchange', function () { hmax = 0; setTimeout(function () { setH(true); }, 300); }); }
  if (pvc && window.visualViewport) { var vv = window.visualViewport, upd = function () { pvc.style.transform = (window.innerWidth <= 760 && vv.offsetTop > 1 && vv.height < window.innerHeight - 100) ? 'translateY(' + Math.round(vv.offsetTop) + 'px)' : ''; }; vv.addEventListener('scroll', upd); vv.addEventListener('resize', upd); }
  renderTypes();
  var tsel = $('v_type'); if (tsel) { tsel.innerHTML = ORDER.map(function (k) { return '<option value="' + k + '">' + T.types[k] + '</option>'; }).join(''); tsel.value = cur; }
  var cs = $('v_cote'); if (cs) cs.innerHTML = ['gd', 'd', 'g'].map(function (k) { return '<option value="' + k + '">' + T.side[k] + '</option>'; }).join('');
  var fo = $('v_forme'); if (fo) fo.innerHTML = [['rect', EN ? 'Rectangular' : 'Rectangulaire'], ['cut', EN ? 'Cut corners' : 'Angles coupés'], ['round', EN ? 'Rounded corners' : 'Angles arrondis']].map(function (a) { return '<option value="' + a[0] + '">' + a[1] + '</option>'; }).join('');
  if (fo) fo.value = 'cut';
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'v_type' && TY[e.target.value]) setType(e.target.value); });
  [].forEach.call(document.querySelectorAll('#form input[type=number], #form select, #bouton'), function (i) { i.addEventListener('input', draw); i.addEventListener('change', draw); });
  $('dl').onclick = function () { download(false); }; $('dl1').onclick = function () { download(true); };
  try { var Q = new URLSearchParams(location.search); Object.keys(DEF).forEach(function (n) { var v = Q.get(n), e = $('v_' + n); if (e && v !== null && v !== '' && !isNaN(parseFloat(v))) e.value = v; });
    var qt = Q.get('type'); if (qt && TY[qt]) { cur = qt; var s0 = $('v_type'); if (s0) s0.value = qt; renderTypes(); } } catch (e) {}
  draw();
})();
