/* patte-vue.js — la patte de manche finie, posée sur le bas de manche (vue de face), qui suit les réglages.
   API : PatteVue.draw(svg, o)
   o = { forme:'droite'|'biseautee'|'arrondie', L (longueur), lD (largeur côté couture), lF (largeur côté bouton),
         arrondi (prop. de L), biseau (prop. de L), pointe (0 = pointe … 1 = pas de biseau), pal:'bleu'|'terre', en } */
(function () {
  var PAL = {
    bleu: { fond: '#498195', piece: '#5b93a6', ombre: '#23414c', fil: '#efe3cf' },
    terre: { fond: '#c1846c', piece: '#cd977f', ombre: '#5e3426', fil: '#fbf1e4' }
  };
  var uid = 0;
  function f(n) { return Math.round(n * 10) / 10; }
  function path(P, close) { return 'M' + P.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' L') + (close === false ? '' : ' Z'); }

  /* contour de la patte : côté couture en x = 0, côté bouton en x = L, axe sur y = 0 */
  function contour(o, S, ins) {
    ins = ins || 0;
    var L = o.L * S, hD = o.lD * S / 2 - ins, hF = o.lF * S / 2 - ins, x0 = ins, x1 = L - ins, P = [], k, a;
    var h = function (x) { return hD + (hF - hD) * x / L; };
    if (o.forme === 'arrondie') {
      var r = Math.max(0.4 * S, (o.arrondi || 0.2) * L - ins), xr = x1 - r;
      P.push([x0, -h(x0)], [xr, -h(xr)]);
      for (k = 1; k <= 12; k++) { a = Math.PI / 2 * k / 12; P.push([xr + r * Math.sin(a), -h(xr) * Math.cos(a)]); }
      for (k = 1; k <= 12; k++) { a = Math.PI / 2 * k / 12; P.push([xr + r * Math.cos(a), h(xr) * Math.sin(a)]); }
      P.push([x0, h(x0)]);
    } else if (o.forme === 'biseautee') {
      var b = Math.max(0.3 * S, (o.biseau || 0.25) * L), xb = x1 - b, t = Math.max(0, Math.min(1, o.pointe)) * h(xb);
      P.push([x0, -h(x0)], [xb, -h(xb)], [x1, -t]);
      if (t > 0.5) P.push([x1, t]);
      P.push([xb, h(xb)], [x0, h(x0)]);
    } else {
      P.push([x0, -h(x0)], [x1, -h(x1)], [x1, h(x1)], [x0, h(x0)]);
    }
    return P;
  }

  function draw(svg, o) {
    var C = PAL[o.pal || 'bleu'], id = 'pv' + (++uid), S = 12, g = [];
    var L = o.L * S;
    // manche portée, vue de face : largeur apparente = tour / π (diamètre) ; la manche courte, ample, s'écarte du bras et s'ovalise (tour / 2,8) ; la patte s'enroule sur le bras, donc vue raccourcie.
    // bas de manche vu de face. Manche longue : fente à droite, patte parallèle à l'ourlet, en travers de la fente.
    // Manche courte : pas de fente, patte perpendiculaire à l'ourlet, côté couture en bas.
    var courte = o.manche === 'courte';
    var H = courte ? Math.max(15, o.L + 7) * S : Math.max(18, o.L + 8) * S, Tb = courte ? 36 : 28, Th = courte ? 36 : 31, kF = courte ? 2.8 : Math.PI, Wb = Tb / kF * S, Wh = Th / kF * S, R = Wb / 2, Wm = Math.max(Wh, Wb);
    // contour : haut de manche qui se prolonge (fondu), bas = ouverture de manche légèrement arrondie (tube vu de face)
    var cb = 1.1 * S, sleeve = [[-Wh / 2, -H], [Wh / 2, -H], [Wb / 2, 0]], k2;
    for (k2 = 1; k2 < 16; k2++) { var t2 = k2 / 16; sleeve.push([Wb / 2 - Wb * t2, cb * Math.sin(Math.PI * t2)]); }
    sleeve.push([-Wb / 2, 0]);
    // intérieur visible de l'ouverture : croissant sombre entre l'arrière (droit) et l'avant (arrondi) du bas de manche
    var ins = [[-Wb / 2, 0]]; for (k2 = 1; k2 < 16; k2++) { var t3 = k2 / 16; ins.push([-Wb / 2 + Wb * t3, -0.55 * cb * Math.sin(Math.PI * t3)]); }
    ins.push([Wb / 2, 0]); for (k2 = 15; k2 > 0; k2--) { var t4 = k2 / 16; ins.push([-Wb / 2 + Wb * t4, cb * Math.sin(Math.PI * t4) * 0.15]); }
    var aC = 0.55, fx = R * Math.sin(aC), fh = 8 * S;                     // couture de manche à ~32° du milieu, côté arrière
    g.push('<defs><pattern id="' + id + 'tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-opacity=".07" stroke-width="2"/></pattern><linearGradient id="' + id + 'fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f5"/><stop offset="1" stop-color="#eef3f5" stop-opacity="0"/></linearGradient></defs>');
    g.push('<path d="' + path(sleeve) + '" fill="' + C.fond + '" stroke="' + C.ombre + '" stroke-opacity=".45" stroke-width="1.5"/>');
    g.push('<path d="' + path(sleeve) + '" fill="url(#' + id + 'tw)"/>');
    g.push('<path d="' + path(ins) + '" fill="' + C.ombre + '" opacity=".85"/>');
    var ou = []; for (k2 = 0; k2 <= 16; k2++) { var t5 = k2 / 16, xo = -Wb / 2 + 3 + (Wb - 6) * t5; ou.push([xo, -2.5 * S - 0.55 * cb * Math.sin(Math.PI * (xo + Wb / 2) / Wb)]); }
    g.push('<path d="' + path(ou, false) + '" fill="none" stroke="' + C.fil + '" stroke-opacity=".7" stroke-width="1.3" stroke-dasharray="5 3.5"/>');
    if (!courte) {
      g.push('<line x1="' + f(fx) + '" y1="' + f(cb * Math.sin(Math.PI * (Wb / 2 - fx) / Wb)) + '" x2="' + f(fx + (Wh - Wb) / 2 * (fx / (Wb / 2))) + '" y2="' + f(-H) + '" stroke="' + C.ombre + '" stroke-opacity=".7" stroke-width="1.8"/>');
      g.push('<line x1="' + f(fx + 0.35 * S) + '" y1="0" x2="' + f(fx + 0.35 * S) + '" y2="' + f(-fh + 0.3 * S) + '" stroke="' + C.fil + '" stroke-opacity=".6" stroke-width="1.2" stroke-dasharray="4 3"/>');
    }
    // le haut de manche s'efface : la manche continue vers l'épaule
    g.push('<rect x="' + f(-Wm / 2 - 2) + '" y="' + f(-H - 1) + '" width="' + f(Wm + 4) + '" height="' + f(3 * S) + '" fill="url(#' + id + 'fd)"/>');
    var P = contour(o, S), Q = contour(o, S, 0.35 * S), s0, ay;
    // repère local de la patte (x : du côté couture au côté bouton, y : travers) → abscisse curviligne sur le bras, puis projection
    function pr(pt) {
      var sa, y;
      if (courte) { sa = pt[1]; y = ay - pt[0]; }                         // côté couture en bas, bouton en haut, au milieu de la manche
      else { sa = s0 - pt[0]; y = ay - pt[1]; }                           // côté couture 3 cm derrière la couture, bouton vers l'avant
      var a = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, sa / R));
      return [R * Math.sin(a), y, Math.cos(a)];
    }
    function dense(A) { var out = [], i, k, n; for (i = 0; i < A.length; i++) { var a = A[i], b = A[(i + 1) % A.length]; n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (0.3 * S))); for (k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return out; }
    if (courte) { s0 = 0; ay = -3 * S; } else { s0 = R * aC + 3 * S; ay = -6.25 * S; }
    var PP = dense(P).map(pr), QQ = dense(Q).map(pr);
    var shp = PP.map(function (q) { return [q[0] + (courte ? -4 : -3), q[1] + (courte ? 3 : 4)]; });
    g.push('<path d="' + path(shp) + '" fill="' + C.ombre + '" opacity=".45"/>');
    g.push('<path d="' + path(PP) + '" fill="' + C.piece + '" stroke="' + C.ombre + '" stroke-opacity=".55"/>');
    g.push('<path d="' + path(QQ) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.4" stroke-dasharray="5 3.5" stroke-linejoin="round"/>');
    var bx = L - Math.min(1.5, o.L * 0.15) * S - (o.forme === 'biseautee' ? (o.biseau || 0.25) * L * (1 - (o.pointe || 0)) * 0.6 : 0);
    var hb = (o.lD + (o.lF - o.lD) * bx / L) / 2, br = 0.75 * S, B = pr([bx, 0]);
    var rx = courte ? br : br * Math.max(0.3, B[2]), ry = courte ? br * Math.max(0.3, B[2]) : br;
    if (courte) { rx = br * Math.max(0.3, pr([bx, 0])[2]); ry = br; }
    g.push('<ellipse cx="' + f(B[0] - 1.5) + '" cy="' + f(B[1] + 2) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + C.ombre + '" opacity=".45"/>');
    g.push('<ellipse cx="' + f(B[0]) + '" cy="' + f(B[1]) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="#d9c7a4" stroke="#6b5a3e"/>');
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { g.push('<circle cx="' + f(B[0] + q[0] * rx * 0.3) + '" cy="' + f(B[1] + q[1] * ry * 0.3) + '" r="' + f(br * 0.17) + '" fill="#6b5a3e"/>'); });
    g.push('<text x="0" y="' + f(cb + 1.9 * S) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="' + f(1.25 * S) + '" fill="#5b6775">' + (courte ? (o.en ? 'Short sleeve' : 'Manche courte') : (o.en ? 'Long sleeve' : 'Manche longue')) + '</text>');
    var vx = -Wm / 2 - 1.2 * S, vw = Wm + 2.4 * S, vy = -H - 1 * S, vh = H + 3.6 * S + cb;
    svg.setAttribute('viewBox', [f(vx), f(vy), f(vw), f(vh)].join(' '));
    svg.innerHTML = '<rect x="' + f(vx) + '" y="' + f(vy) + '" width="' + f(vw) + '" height="' + f(vh) + '" fill="#eef3f5"/>' + g.join('');
  }
  window.PatteVue = { draw: draw };
})();

/* branchement sur la page pattes-manches.html */
(function () {
  var g = function (n, d) { var e = document.getElementById('v_' + n); var v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  function up() {
    var svg = document.getElementById('vue'); if (!svg) return;
    var r = document.querySelector('input[name=pc]:checked');
    var m = document.querySelector('#manchevue button[aria-pressed=true]');
    PatteVue.draw(svg, { forme: r ? r.value : 'droite', en: /^en/.test(document.documentElement.lang || ''), L: g('LongP', 10), lD: g('LarPDem', 5), lF: g('LaPFin', 4),
      arrondi: g('Prop_angle_arrondi', 0.2), biseau: g('Propanglecoup', 0.25), pointe: g('AngB', 0.5), manche: m ? m.getAttribute('data-v') : 'longue', pal: 'bleu' });
  }
  function choix() {
    var svg = document.getElementById('vue'); if (!svg || document.getElementById('manchevue')) return;
    var en = /^en/.test(document.documentElement.lang || ''), d = document.createElement('div');
    d.id = 'manchevue'; d.className = 'cq-views'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', en ? 'Sleeve length' : 'Longueur de manche');
    d.innerHTML = '<button type="button" data-v="longue" aria-pressed="true">' + (en ? 'Long sleeve' : 'Manche longue') + '</button>' +
                  '<button type="button" data-v="courte" aria-pressed="false">' + (en ? 'Short sleeve' : 'Manche courte') + '</button>';
    var st = document.createElement('style');
    st.textContent = '#manchevue{display:flex;gap:0;justify-content:center;margin:10px 0 0}#manchevue button{font:inherit;font-size:1rem;font-weight:600;padding:9px 22px;min-height:40px;border:1px solid var(--ac);background:transparent;color:var(--ac);cursor:pointer;width:auto;border-radius:0}#manchevue button:first-child{border-radius:999px 0 0 999px}#manchevue button:last-child{border-radius:0 999px 999px 0;border-left:0}#manchevue button[aria-pressed="true"]{background:var(--ac);border-color:var(--ac);color:#fff}';
    document.head.appendChild(st);
    d.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      d.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      up();
    });
    svg.parentNode.insertBefore(d, svg.nextSibling);
  }
  document.addEventListener('input', up); document.addEventListener('change', up);
  window.addEventListener('load', function () { choix(); setTimeout(up, 50); });
})();
