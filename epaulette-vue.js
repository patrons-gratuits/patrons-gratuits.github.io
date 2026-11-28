/* epaulette-vue.js — l'épaulette finie, posée sur l'épaule, qui suit les réglages.
   API : EpauletteVue.draw(svg, o)
   o = { forme:'trapeze'|'arrondie'|'biseautee'|'double', L (cm, longueur finie), lE (largeur côté épaule), lC (largeur côté col),
         arrondi (prop. de L), biseau (prop. de L), pointe (0 = pointe … 1 = pas de biseau), pal:'bleu'|'terre' }
   Côté épaule à gauche, côté col à droite (comme sur le patron). */
(function () {
  var PAL = {
    bleu: { fond: '#498195', piece: '#5b93a6', ombre: '#23414c', fil: '#efe3cf' },
    terre: { fond: '#c1846c', piece: '#cd977f', ombre: '#5e3426', fil: '#fbf1e4' }
  };
  var uid = 0;
  function f(n) { return Math.round(n * 10) / 10; }
  function path(P, close) { return 'M' + P.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' L') + (close === false ? '' : ' Z'); }

  /* contour, sens horaire depuis le haut côté épaule ; y = 0 sur l'axe de l'épaulette */
  function contour(o, S, ins) {
    ins = ins || 0;
    var L = o.L * S, hE = o.lE * S / 2 - ins, hC = o.lC * S / 2 - ins, x0 = ins, x1 = L - ins, P = [], k, a;
    var h = function (x) { return hE + (hC - hE) * x / L; };          // demi-largeur en x (trapèze)
    if (o.forme === 'arrondie') {
      var r = Math.max(0.5 * S, Math.min((o.arrondi || 0.2) * L, h(L)));  // l'arrondi ne dépasse pas la demi-largeur
      var xr = x1 - r;
      P.push([x0, -h(x0)], [xr, -h(xr)]);
      // quart d'ellipse vers la pointe, puis retour : arrondi qui raccorde les deux bords
      for (k = 1; k <= 12; k++) { a = Math.PI / 2 * k / 12; P.push([xr + r * Math.sin(a), -h(xr) * Math.cos(a)]); }
      for (k = 1; k <= 12; k++) { a = Math.PI / 2 * k / 12; P.push([xr + r * Math.cos(a), h(xr) * Math.sin(a)]); }
      P.push([x0, h(x0)]);
    } else if (o.forme === 'biseautee') {
      var b = Math.max(0.3 * S, (o.biseau || 0.3) * L), xb = x1 - b, t = Math.max(0, Math.min(1, o.pointe || 0)) * h(x1);
      P.push([x0, -h(x0)], [xb, -h(xb)], [x1, -t]);
      if (t > 0.5) P.push([x1, t]);
      P.push([xb, h(xb)], [x0, h(x0)]);
    } else {                                                              // trapèze, ou double (pliée au col)
      P.push([x0, -h(x0)], [x1, -h(x1)], [x1, h(x1)], [x0, h(x0)]);
    }
    return P;
  }

  function draw(svg, o) {
    var C = PAL[o.pal || 'bleu'], id = 'ev' + (++uid), S = 12;
    var L = o.L * S, E = Math.max(o.L, o.LE || o.L / 0.6) * S;   /* l'épaule ne dépend que de la longueur d'épaule, pas de celle de l'épaulette */   // l'épaulette s'arrête ~2 cm avant le col        // E : longueur d'épaule (emmanchure → encolure)
    var D = 5 * S;                                                      // demi-épaisseur du buste vue du dessus (devant / dos)
    var P = contour(o, S), Q = contour(o, S, 0.4 * S);
    var g = [], k, a;
    // --- le vêtement vu du dessus : buste (épaule) et départ de manche ---
    var creux = 1.6 * S, nx = E;                                         // encolure : courbe creuse, la plus profonde au milieu (couture d'épaule)
    var body = [[0, -D], [E + creux, -D]];
    for (k = 1; k < 16; k++) { a = -Math.PI / 2 + Math.PI * k / 16; body.push([E + creux - creux * Math.cos(a), D * Math.sin(a)]); }
    body.push([E + creux, D], [0, D]);
    var sleeve = [[0.6 * S, -D], [-2.5 * S, -D * 0.95], [-5 * S, -D * 0.9], [-5 * S, D * 0.9], [-2.5 * S, D * 0.95], [0.6 * S, D]];
    g.push('<path d="' + path(sleeve) + '" fill="' + C.piece + '" fill-opacity=".0"/>');
    g.push('<path d="' + path(sleeve) + '" fill="' + C.fond + '" stroke="' + C.ombre + '" stroke-opacity=".45" stroke-width="1.5"/>');
    g.push('<path d="' + path(body) + '" fill="' + C.fond + '" stroke="' + C.ombre + '" stroke-opacity=".45" stroke-width="1.5"/>');
    g.push('<path d="' + path(body) + '" fill="url(#' + id + 'tw)"/><path d="' + path(sleeve) + '" fill="url(#' + id + 'tw)"/>');
    // couture d'emmanchure (manche tailleur montée) et couture d'épaule, sur le buste seulement
    g.push('<path d="M0,' + f(-D) + ' Q' + f(1.2 * S) + ',0 0,' + f(D) + '" fill="none" stroke="' + C.ombre + '" stroke-opacity=".6" stroke-width="1.6"/>');
    g.push('<line x1="' + f(0.9 * S) + '" y1="0" x2="' + f(E) + '" y2="0" stroke="' + C.ombre + '" stroke-opacity=".5" stroke-width="1.6"/>');
    // repères
    g.push('<text x="' + f(-4.7 * S) + '" y="' + f(D + 1.9 * S) + '" text-anchor="start" font-family="system-ui,sans-serif" font-size="' + f(1.25 * S) + '" fill="#5b6775">' + (o.en ? 'Sleeve' : 'Manche') + '</text>');
    g.push('<text x="' + f(E / 2) + '" y="' + f(D + 1.9 * S) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="' + f(1.25 * S) + '" fill="#5b6775">' + (o.en ? 'Shoulder' : 'Épaule') + '</text>');
    g.push('<text x="' + f(E + creux * 0.6) + '" y="' + f(D + 1.9 * S) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="' + f(1.25 * S) + '" fill="#5b6775">' + (o.en ? 'Neck' : 'Col') + '</text>');
    // --- l'épaulette, de l'emmanchure vers le col ---
    var ox = 0.4 * S;
    g.push('<g transform="translate(' + f(ox) + ',0)">');
    g.push('<path d="' + path(P) + '" transform="translate(3,4)" fill="' + C.ombre + '" opacity=".45"/>');
    g.push('<path d="' + path(P) + '" fill="' + C.piece + '" stroke="' + C.ombre + '" stroke-opacity=".55"/>');
    if (o.forme === 'double') {
      g.push('<path d="' + path(Q.slice(2).concat([Q[0], Q[1]]), false) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.4" stroke-dasharray="5 3.5"/>');
      g.push('<line x1="' + f(L - 1.5) + '" y1="' + f(P[1][1] + 1) + '" x2="' + f(L - 1.5) + '" y2="' + f(P[2][1] - 1) + '" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>');
    } else {
      g.push('<path d="' + path(Q) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.4" stroke-dasharray="5 3.5" stroke-linejoin="round"/>');
    }
    var bx = L - Math.min(1.6, o.L * 0.15) * S - (o.forme === 'biseautee' ? (o.biseau || 0.3) * L * 0.35 : 0), br = 0.75 * S;
    g.push('<circle cx="' + f(bx + 1.5) + '" cy="2" r="' + f(br) + '" fill="' + C.ombre + '" opacity=".45"/>');
    g.push('<circle cx="' + f(bx) + '" cy="0" r="' + f(br) + '" fill="#d9c7a4" stroke="#6b5a3e"/>');
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { g.push('<circle cx="' + f(bx + q[0] * br * 0.3) + '" cy="' + f(q[1] * br * 0.3) + '" r="' + f(br * 0.17) + '" fill="#6b5a3e"/>'); });
    g.push('</g>');
    // cadrage : fond clair (hors vêtement), carré
    var vx = -5 * S, vw = E + creux + 1.2 * S - vx, vy = -D - 1.2 * S, vh = 2 * D + 3.8 * S, side = vw;   // cadre en largeur
    svg.setAttribute('viewBox', [f(vx), f(vy), f(vw), f(vh)].join(' '));
    svg.innerHTML = '<defs><pattern id="' + id + 'tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-opacity=".07" stroke-width="2"/></pattern></defs>' +
      '<rect x="' + f(vx) + '" y="' + f(vy) + '" width="' + f(vw) + '" height="' + f(vh) + '" fill="#eef3f5"/>' + g.join('');
  }
  window.EpauletteVue = { draw: draw };
})();

/* branchement sur la page epaulettes.html */
(function () {
  var g = function (n, d) { var e = document.getElementById('v_' + n); var v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  function up() {
    var svg = document.getElementById('vue'); if (!svg) return;
    var r = document.querySelector('input[name=pc]:checked');
    EpauletteVue.draw(svg, { forme: r ? r.value : 'biseautee', en: /^en/.test(document.documentElement.lang || ''), LE: g('LongEp', 16.65), L: g('PropLon', 0.6) * g('LongEp', 16.65), lE: g('LargCE', 4.5), lC: g('LargCC', 4.5),
      arrondi: g('Prop_angle_arrondi', 0.2), biseau: g('Propanglecoup', 0.3), pointe: g('AngB', 0), pal: 'bleu' });
  }
  document.addEventListener('input', up); document.addEventListener('change', up);
  window.addEventListener('load', function () { setTimeout(up, 50); });
})();
