/* Croquis de la robe carrée sur silhouette féminine.
   Usage : CroquisRobe.draw(svgElement, options)
   options : {
     vue: 'face' | 'dos',
     longueur: 'mini' | 'moyenne' | 'longue',
     encolureDevant: cm (+ descend, - remonte, de -5 à +4),
     encolureDos: cm (+ descend, - remonte, de -12 à +8),
     poche: 'cote' | 'passepoil',
     nbPoches: 1 | 2   (poche passepoilée seulement),
     anglePoche: degrés depuis l'horizontale (0 à 90),
     tissu: couleur de la robe, deco: 'wax' ou une couleur
   }
   Toutes les cotes sont en cm, pour une taille 40, stature moyenne.
   Le dessin est schématique : il montre les choix, pas les mesures exactes. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var S = 4;              // px par cm
  var Y0 = 26;            // ligne d'épaule (cm depuis le haut de la tête)
  var PROJ = 1 / 3.35;    // tour → demi-largeur vue de face (le tissu s’enroule autour du corps, silhouette affinée)
  var FW = 0.9;           // affinage de la silhouette en largeur
  var LONG = { mini: 80, moyenne: 102, longue: 132 };
  var HEM_C = { mini: 140, moyenne: 151, longue: 167 };

  function X(x) { return (x * S + 400).toFixed(1); }
  function Yp(y) { return (y * S + 20).toFixed(1); }
  function pts(a) { return a.map(function (p) { return X(p[0]) + ',' + Yp(p[1]); }).join(' '); }
  function mirror(a) { return a.map(function (p) { return [-p[0], p[1]]; }); }
  function path(d, fill, stroke, sw, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') +
      '" stroke-width="' + (sw || 0) + '" stroke-linejoin="round" stroke-linecap="round"' + (extra || '') + '/>';
  }
  function poly(a, fill, stroke, sw, extra) {
    return '<polygon points="' + pts(a) + '" fill="' + fill + '" stroke="' + (stroke || 'none') +
      '" stroke-width="' + (sw || 0) + '" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  function line(a, stroke, sw, extra) {
    return '<polyline points="' + pts(a) + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  // courbe lissée (Catmull-Rom) passant par les points
  function smooth(a, closed) {
    var p = a.map(function (q) { return [q[0] * S + 400, q[1] * S + 20]; });
    var n = p.length, d = 'M' + p[0][0].toFixed(1) + ',' + p[0][1].toFixed(1);
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) +
        ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d + (closed ? 'Z' : '');
  }

  var SKIN = 'var(--croquis-peau, #e9e3dc)', SKIN_L = 'var(--croquis-trait-peau, #b9aea3)';
  var INK = 'var(--croquis-trait, #3a3530)';

  /* ---------- silhouette ---------- */
  function fx(a) { return a.map(function (p) { return [p[0] * FW, p[1]]; }); }
  function figure(back) {
    var o = [];
    // jambes
    [-1, 1].forEach(function (sg) {
      var leg = [[sg * 3.0, 86], [sg * 15.5, 86], [sg * 14.0, 105], [sg * 10.5, 121], [sg * 10.8, 135],
        [sg * 9.0, 156], [sg * 8.6, 161], [sg * 4.6, 161], [sg * 4.4, 156], [sg * 4.0, 135], [sg * 4.6, 121],
        [sg * 2.4, 100]];
      o.push(path(smooth(fx(leg), true), SKIN, SKIN_L, 1.2));
      var foot = [[sg * 8.8, 159], [sg * 9.6, 166], [sg * 4.0, 167.5], [sg * 3.2, 165], [sg * 4.4, 159]];
      o.push(path(smooth(fx(foot), true), SKIN, SKIN_L, 1.2));
    });
    // buste
    var torso = [[5.4, 22.5], [6.2, 25.6], [12, 27.2], [18.6, 28.4], [20.6, 31], [19.2, 38], [17.4, 46],
      [16.6, 53.5], [14.6, 60], [12.6, 66], [13.8, 74], [17.2, 82], [16.4, 88], [0, 90]];
    var t = torso.concat(mirror(torso.slice(0, -1)).reverse());
    o.push(path(smooth(fx(t), true), SKIN, SKIN_L, 1.2));
    // cou et tête
    o.push(path(smooth([[-4.2, 15], [-4.4, 21], [-5.6, 25.4], [5.6, 25.4], [4.4, 21], [4.2, 15]], false) + 'Z', SKIN, SKIN_L, 1.2));
    o.push('<ellipse cx="' + X(0) + '" cy="' + Yp(9.5) + '" rx="' + (7.2 * S) + '" ry="' + (9.8 * S) + '" fill="' + SKIN + '" stroke="' + SKIN_L + '" stroke-width="1.2"/>');
    // chevignon (cheveux relevés)
    var hair = back
      ? '<ellipse cx="' + X(0) + '" cy="' + Yp(8.6) + '" rx="' + (7.6 * S) + '" ry="' + (9.4 * S) + '" fill="var(--croquis-cheveux, #4a3b31)"/>'
      : path(smooth([[-7.4, 10], [-6.8, 2.8], [0, -0.6], [6.8, 2.8], [7.4, 10], [5.4, 4.6], [0, 3.4], [-5.4, 4.6]], true), 'var(--croquis-cheveux, #4a3b31)');
    o.push(hair);
    o.push('<circle cx="' + X(0) + '" cy="' + Yp(-2.6) + '" r="' + (4.0 * S) + '" fill="var(--croquis-cheveux, #4a3b31)"/>');
    return o.join('');
  }
  function arms() {
    var o = [];
    [-1, 1].forEach(function (sg) {
      var arm = [[sg * 18.4, 28.6], [sg * 21.4, 30.6], [sg * 23.6, 46], [sg * 25.2, 62], [sg * 27.2, 82],
        [sg * 27.6, 88], [sg * 24.6, 88.4], [sg * 22.8, 80], [sg * 20.4, 62], [sg * 18.4, 46], [sg * 17.4, 36]];
      o.push(path(smooth(fx(arm), true), SKIN, SKIN_L, 1.2));
      var hand = [[sg * 24.6, 87.6], [sg * 27.8, 87.6], [sg * 28.6, 94], [sg * 27, 99.5], [sg * 25.2, 99], [sg * 24.2, 93]];
      o.push(path(smooth(fx(hand), true), SKIN, SKIN_L, 1.2));
    });
    return o.join('');
  }

  /* ---------- robe ---------- */
  function dress(o, back) {
    var L = LONG[o.longueur] || LONG.mini;
    var yHem = Y0 + L, yUnder = Y0 + 31, wHem = (HEM_C[o.longueur] || 140) * PROJ / 2;
    // largeur sous les bras : le dos est plus étroit que le devant (ajustement dos de 2,5 cm par demi-pièce)
    var Hq = back ? 25.25 : 27.75, wUnder = 106 * PROJ / 2 * Hq / 27.75;
    // une distance prise sur le patron, depuis le milieu, vue sur un corps arrondi
    function px(sx) { return wUnder * Math.sin(Math.min(sx / Hq, 1) * Math.PI / 2); }
    var slope = Math.tan(11 * Math.PI / 180);
    var xi = 10.25 * FW, xo = 14.25 * FW, yi = Y0 + xi * slope * 0.35, yo = Y0 + xo * slope * 0.35;
    var out = [];
    var fab = o.tissu || 'var(--croquis-tissu, #f7a35c)';
    var deco = (o.deco && o.deco !== 'wax') ? o.deco : 'url(#wax)';
    // contour d'une moitié (côté x>0), du milieu de l'encolure au milieu du bas
    var half = [];
    var arm;
    if (!back) arm = [[xo, yo], [xo, Y0 + 22.5], [xo + (wUnder - xo) * 0.3, Y0 + 27.4], [xo + (wUnder - xo) * 0.7, Y0 + 30.2], [wUnder, yUnder]];
    else arm = [[xo, yo], [xo + 0.3, Y0 + 15], [xo + (wUnder - xo) * 0.45, Y0 + 25], [xo + (wUnder - xo) * 0.8, Y0 + 29.6], [wUnder, yUnder]];
    var side = [[wUnder, yUnder], [wUnder + (wHem - wUnder) * 0.25, yUnder + (yHem - yUnder) * 0.25],
      [wUnder + (wHem - wUnder) * 0.55, yUnder + (yHem - yUnder) * 0.55], [wHem, yHem]];
    var hemCurve = [[wHem, yHem], [wHem * 0.5, yHem + 1.4], [0, yHem + 1.8]];
    var neck;
    if (!back) {
      var dF = Math.min(Math.max(20 + (o.encolureDevant || 0), 15), 24.5);
      neck = [[0, Y0 + dF], [px(5), Y0 + dF], [xi, yi]];
    } else {
      var dB = Math.min(Math.max(31.5 + (o.encolureDos || 0), 15), 40);
      neck = [[0, Y0 + dB], [px(8.25), Y0 + dB], [xi, yi]];
    }
    // polygone complet
    var right = [neck[0], neck[1]].concat([[xi, yi]]).concat(arm).concat(side.slice(1)).concat(hemCurve.slice(1));
    var full = right.concat(mirror(right).reverse().slice(1, -1));
    out.push(poly(full, fab, INK, 1.6));
    // ourlet (surpiqûre)
    out.push(line([[-wHem + 0.6, yHem - 2.4], [0, yHem - 0.8], [wHem - 0.6, yHem - 2.4]], INK, 0.7, ' stroke-dasharray="3 2.4" opacity="0.6"'));
    // décor de l'encolure
    if (!back) {
      var y5 = neck[0][1], h = 3.3;
      var xb5 = neck[1][0], t = h / Math.hypot(xi - xb5, y5 - yi);
      var x38 = xb5 + (xi - xb5) * t, y38 = y5 - (y5 - yi) * t;
      var dec = [[0, y5], [xb5, y5], [x38, y38], [-x38, y38], [-xb5, y5]];
      out.push(poly(dec, deco, INK, 1.2));
    } else {
      var y9 = neck[0][1], hb = 5;
      var xb9 = neck[1][0], tb = hb / Math.hypot(xi - xb9, y9 - yi);
      var x36 = xb9 + (xi - xb9) * tb, y36 = y9 - (y9 - yi) * tb;
      out.push(poly([[0, y9], [xb9, y9], [x36, y36], [-x36, y36], [-xb9, y9]], deco, INK, 1.2));
    }
    // pinces de poitrine (devant)
    if (!back) {
      [-1, 1].forEach(function (sg) {
        out.push(line([[sg * (wUnder - 0.3), yUnder + 4.6], [sg * (px(8) + 1.6), Y0 + 28.2]], INK, 0.8, ' opacity="0.75"'));
      });
    }
    // poches
    var yWaist = Y0 + 40;
    function sideX(y) { var f = (y - yUnder) / (yHem - yUnder); return wUnder + (wHem - wUnder) * f; }
    if (o.poche === 'passepoil' && !back) {
      var n = o.nbPoches === 2 ? [-1, 1] : [1];
      var a = Math.max(0, Math.min(90, o.anglePoche == null ? 41.3 : o.anglePoche)) * Math.PI / 180;
      var rise = 14 * Math.sin(a), yBot = yWaist + Math.max(20.2, 11 + rise);
      n.forEach(function (sg) {
        // vue de face : la côte du côté est vue légèrement en raccourci
        var xb = sideX(yBot) - 5.2, xt = xb - 14 * Math.cos(a) * 0.78, yt = yBot - rise;
        var w = 1.5, dx = xt - xb, dy = yt - yBot, dl = Math.hypot(dx, dy) || 1;
        dx /= dl; dy /= dl;
        var nx = -dy, ny = dx;            // normale ; on prend celle qui descend (ou va vers le côté si verticale)
        if (ny < 0 || (Math.abs(ny) < 1e-6 && nx < 0)) { nx = -nx; ny = -ny; }
        var lip = [[sg * xb, yBot], [sg * xt, yt], [sg * (xt + nx * w), yt + ny * w], [sg * (xb + nx * w), yBot + ny * w]];
        out.push(poly(lip, deco, INK, 1.1));
      });
    }
    if (o.poche === 'cote') {
      var y1 = yWaist + 11, y2 = y1 + 16;
      [-1, 1].forEach(function (sg) {
        var xa = (back ? sideX(y1) - 0.4 : sideX(y1) - 0.4), xb2 = sideX(y2) - 0.4;
        out.push(line([[sg * (xa - 0.9), y1], [sg * (xb2 - 0.9), y2]], INK, 0.9, ' stroke-dasharray="2.2 2"'));
        out.push(line([[sg * (xa - 2.2), y1 - 0.3], [sg * (xa - 0.4), y1]], INK, 0.9));
        out.push(line([[sg * (xb2 - 2.2), y2 + 0.3], [sg * (xb2 - 0.4), y2]], INK, 0.9));
      });
    }
    // milieu dos : rien ; épaulettes : couture d'épaule
    out.push(line([[xi, yi], [xo, yo]], INK, 1.6));
    out.push(line([[-xi, yi], [-xo, yo]], INK, 1.6));
    return out.join('');
  }

  var DEFS = '<defs><pattern id="wax" width="16" height="16" patternUnits="userSpaceOnUse">' +
    '<rect width="16" height="16" fill="var(--croquis-wax-fond, #1cb5b8)"/>' +
    '<circle cx="8" cy="8" r="5" fill="var(--croquis-wax-1, #0f3d63)"/>' +
    '<circle cx="8" cy="8" r="2.4" fill="var(--croquis-wax-2, #f7f1d9)"/>' +
    '<circle cx="0" cy="0" r="2.2" fill="var(--croquis-wax-2, #f7f1d9)"/><circle cx="16" cy="0" r="2.2" fill="var(--croquis-wax-2, #f7f1d9)"/>' +
    '<circle cx="0" cy="16" r="2.2" fill="var(--croquis-wax-2, #f7f1d9)"/><circle cx="16" cy="16" r="2.2" fill="var(--croquis-wax-2, #f7f1d9)"/>' +
    '</pattern></defs>';

  function render(o) {
    o = o || {};
    var back = o.vue === 'dos';
    var nu = o.silhouette === false;   /* silhouette:false : la robe seule, sans le corps */
    return DEFS + (nu ? '' : figure(back)) + dress(o, back) + (nu ? '' : arms());
  }
  function describe(o) {
    var L = { mini: 'mini', moyenne: 'longueur moyenne', longue: 'longue' }[o.longueur] || 'mini';
    var p = o.poche === 'passepoil'
      ? (o.nbPoches === 2 ? 'deux poches passepoilées' : 'une poche passepoilée')
      : 'poches dans les coutures de côté';
    return 'Robe carrée ' + L + ', ' + p + (o.vue === 'dos' ? ', vue de dos' : ', vue de face');
  }
  window.CroquisRobe = {
    VIEWBOX: '230 -10 340 720',
    render: render,
    describe: describe,
    draw: function (svg, o) {
      svg.setAttribute('viewBox', this.VIEWBOX);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', describe(o || {}));
      svg.innerHTML = render(o);
    }
  };
})();
