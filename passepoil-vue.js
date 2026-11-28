/* passepoil-vue.js — la poche passepoilée finie, posée sur le tissu, qui suit les réglages.
   PasspoilVue.draw(svg, o)
   o = { L: longueur ouverture, ang: angle (°), nb: 0|1|2 lèvres, lev: largeur d'une lèvre, rabat: bool,
         hr: hauteur visible du rabat, leve: rabat levé, bouton: bool, prof: profondeur utile, pal: 'bleu'|'terre', en } */
(function () {
  var PAL = {
    bleu:  { fond: '#498195', levre: '#2f5867', pli: '#6aa2b4', ombre: '#23414c', fil: '#efe3cf', rabat: '#5b93a6', fente: '#1d3640' },
    terre: { fond: '#c1846c', levre: '#94604b', pli: '#dcae99', ombre: '#5e3426', fil: '#fbf1e4', rabat: '#cd977f', fente: '#4a2a1e' }
  };
  var uid = 0, M = 2, EP = 0.3, JEU = 0.1, RF = 2.5;
  function f(n) { return Math.round(n * 10) / 10; }
  function draw(svg, o) {
    var C = PAL[o.pal || 'bleu'], S = 12, id = 'pv' + (++uid);
    var t = o.ang * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    var u = [c, s], n = [s, -c];                       // repère y vers le haut ; n = vers le sac
    var add = function (p, v, l) { return [p[0] + v[0] * l, p[1] + v[1] * l]; };
    var H = o.nb === 0 ? EP + JEU : o.nb * o.lev + (o.rabat ? EP + JEU : 0), L = o.L;   // sans passepoil (rabat seul ou poche fendue) : cadre de 0,4 cm
    var PB = [0, 0], PH = add(PB, u, L);
    var K1 = add(PB, n, -H / 2), K2 = add(PH, n, -H / 2), K3 = add(PH, n, H / 2), K4 = add(PB, n, H / 2);
    // sac de dessus (contour en pointillé)
    var R0u = add(K1, u, -M), PMu = add(K2, u, M), PMd = add(K3, u, M), EQ = add(PMd, n, L * s / 3);
    var R0 = add(PB, u, -M), W = L + 2 * M, Cx = R0[0] + W, C2 = [Cx, K4[1]], yb = -o.prof;
    var bag = [R0u, K1, K2, PMu, EQ, C2];
    for (var k = 0; k <= 8; k++) { var a = -Math.PI / 2 * k / 8; bag.push([Cx - RF + RF * Math.cos(a), yb + RF + RF * Math.sin(a)]); }
    for (k = 0; k <= 8; k++) { a = -Math.PI / 2 - Math.PI / 2 * k / 8; bag.push([R0u[0] + RF + RF * Math.cos(a), yb + RF + RF * Math.sin(a)]); }
    // cadre de vue
    var ext = bag.slice();
    if (o.rabat) [1, -1].forEach(function (d) {          // même cadre pour « fermé » et « ouvert »
      var a1 = add(K1, u, -0.25), a2 = add(K2, u, 0.25);
      ext.push(add(a1, n, d * o.hr), add(a2, n, d * o.hr));
    });
    var xs = ext.map(function (p) { return p[0]; }), ys = ext.map(function (p) { return p[1]; });
    var minx = Math.min.apply(0, xs) - 3, maxx = Math.max.apply(0, xs) + 3, miny = Math.min.apply(0, ys) - 3, maxy = Math.max.apply(0, ys) + 3;
    var T = function (p) { return [f(p[0] * S), f(-p[1] * S)]; };
    var P = function (A, close) { return 'M' + A.map(function (p) { return T(p).join(','); }).join(' L') + (close === false ? '' : ' Z'); };
    var g = [];
    g.push('<defs><pattern id="' + id + 'tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-opacity=".07" stroke-width="2"/></pattern></defs>');
    g.push('<rect x="' + f(minx * S) + '" y="' + f(-maxy * S) + '" width="' + f((maxx - minx) * S) + '" height="' + f((maxy - miny) * S) + '" fill="' + C.fond + '"/>');
    g.push('<rect x="' + f(minx * S) + '" y="' + f(-maxy * S) + '" width="' + f((maxx - minx) * S) + '" height="' + f((maxy - miny) * S) + '" fill="url(#' + id + 'tw)"/>');
    g.push('<path d="' + P(bag) + '" fill="none" stroke="' + C.fil + '" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="4 4"/>');
    var mid = function (A, B, l) { return add(A, n, l); };
    if (o.nb === 2) {                                   // deux lèvres : fente au milieu
      g.push('<path d="' + P([K1, K2, PH, PB]) + '" fill="' + C.levre + '"/>');
      g.push('<path d="' + P([PB, PH, K3, K4]) + '" fill="' + C.levre + '"/>');
      g.push('<path d="' + P([add(PB, n, -0.12), add(PH, n, -0.12), add(PH, n, 0.12), add(PB, n, 0.12)]) + '" fill="' + C.fente + '"/>');
      g.push('<path d="' + P([add(PB, n, -0.15), add(PH, n, -0.15)], false) + '" stroke="' + C.pli + '" stroke-width="1.2"/>');
      g.push('<path d="' + P([add(PB, n, 0.15), add(PH, n, 0.15)], false) + '" stroke="' + C.pli + '" stroke-width="1.2"/>');
    } else if (o.nb === 1) {                            // une lèvre : elle remplit le cadre, fente sur le bord opposé
      var top = o.rabat ? add(K1, n, EP + JEU) : K1, top2 = o.rabat ? add(K2, n, EP + JEU) : K2;
      g.push('<path d="' + P([top, top2, K3, K4]) + '" fill="' + C.levre + '"/>');
      g.push('<path d="' + P([K1, K2, top2, top]) + '" fill="' + C.fente + '"/>');
      g.push('<path d="' + P([add(top, n, 0.12), add(top2, n, 0.12)], false) + '" stroke="' + C.pli + '" stroke-width="1.2"/>');
    } else {                                            // sans passepoil : fente étroite (garniture)
      g.push('<path d="' + P([K1, K2, K3, K4]) + '" fill="' + C.fente + '"/>');
    }
    g.push('<path d="' + P([K1, K2, K3, K4]) + '" fill="none" stroke="' + C.ombre + '" stroke-opacity=".5" stroke-width="0.8"/>');
    {                                                   // surpiqûre autour du cadre, à 3–4 mm
      var r = 0.35, Z = [add(add(K1, u, -r), n, -r), add(add(K2, u, r), n, -r), add(add(K3, u, r), n, r), add(add(K4, u, -r), n, r)];
      g.push('<path d="' + P(Z) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.2" stroke-dasharray="4 3" stroke-linejoin="round"/>');
    }
    if (o.rabat) {
      var e = 0.25, A1 = add(K1, u, -e), A2 = add(K2, u, e), hr = o.hr, dir = o.leve ? -1 : 1, fm = o.forme || 'cut', rr = fm === 'rect' ? 0 : fm === 'round' ? Math.min(2, hr * 0.4) : Math.min(1.5, hr * 0.3);
      var B1 = add(A1, n, dir * hr), B2 = add(A2, n, dir * hr);
      var fl = [A1, A2];
      if (rr === 0) fl.push(B2, B1);
      else if (fm === 'round') {                         // coins arrondis : courbe quadratique de chaque côté
        var qd = function (a, c, b) { for (var k = 0; k <= 6; k++) { var t = k / 6; fl.push([(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]]); } };
        qd(add(B2, n, -dir * rr), B2, add(B2, u, -rr)); qd(add(B1, u, rr), B1, add(B1, n, -dir * rr));
      } else fl.push(add(B2, n, -dir * rr), add(B2, u, -rr), add(B1, u, rr), add(B1, n, -dir * rr));
      g.push('<path d="' + P(fl.map(function (p) { return [p[0] - 0.25, p[1] - 0.3]; })) + '" fill="' + C.ombre + '" opacity=".4"/>');
      g.push('<path d="' + P(fl) + '" fill="' + C.rabat + '" stroke="' + C.ombre + '" stroke-opacity=".5"/>');
      g.push('<path d="' + P([Z[0], Z[1]], false) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.2" stroke-dasharray="4 3"/>');   // surpiqûre du haut, visible au-dessus du rabat
      var q = 0.4, W = L + 2 * e, r2 = Math.max(rr - q, 0), Pt = function (x, d) { return add(add(A1, u, x), n, dir * d); }, Sp = [Pt(W - q, 0)];
      if (!r2) Sp.push(Pt(W - q, hr - q), Pt(q, hr - q));
      else if (fm === 'round') {
        Sp.push(Pt(W - q, hr - q - r2));
        for (var k2 = 1; k2 <= 6; k2++) { var t2 = k2 / 6, m1 = 1 - t2; Sp.push(Pt(m1 * m1 * (W - q) + 2 * t2 * m1 * (W - q) + t2 * t2 * (W - q - r2), m1 * m1 * (hr - q - r2) + 2 * t2 * m1 * (hr - q) + t2 * t2 * (hr - q))); }
        for (k2 = 0; k2 <= 6; k2++) { t2 = k2 / 6; m1 = 1 - t2; Sp.push(Pt(m1 * m1 * (q + r2) + 2 * t2 * m1 * q + t2 * t2 * q, m1 * m1 * (hr - q) + 2 * t2 * m1 * (hr - q) + t2 * t2 * (hr - q - r2))); }
      } else Sp.push(Pt(W - q, hr - q - r2), Pt(W - q - r2, hr - q), Pt(q + r2, hr - q), Pt(q, hr - q - r2));
      Sp.push(Pt(q, 0));
      g.push('<path d="' + P(Sp, false) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.3" stroke-dasharray="5 3.5" stroke-linejoin="round"/>');
      if (o.bouton) {
        var bc = add(add(A1, u, (L + 2 * e) / 2), n, dir * (hr - 1.2));
        if (o.leve) bc = add(add(PB, u, L / 2), n, H / 2 + hr - 1.2);
        var bt = T(bc);
        g.push('<circle cx="' + bt[0] + '" cy="' + bt[1] + '" r="' + f(0.75 * S) + '" fill="#d9c7a4" stroke="#6b5a3e"/>');
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (z) { g.push('<circle cx="' + f(+bt[0] + z[0] * 0.22 * S) + '" cy="' + f(+bt[1] + z[1] * 0.22 * S) + '" r="' + f(0.12 * S) + '" fill="#6b5a3e"/>'); });
      }
    }
    svg.setAttribute('viewBox', [f(minx * S), f(-maxy * S), f((maxx - minx) * S), f((maxy - miny) * S)].join(' '));
    svg.innerHTML = g.join('');
  }
  window.PasspoilVue = { draw: draw };
})();
