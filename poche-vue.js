/* poche-vue.js — dessin de la poche finie, posée sur le tissu, qui suit les options choisies.
   API : PocheVue.draw(svg, o)
   o = { forme:'rect'|'cut'|'round', H, L (cm), biseau (°), revers (cm), revType:'int'|'ext',
         lat (profondeur soufflet latéral, cm, 0 = sans), pli:null|'e'|'i', pliProf (cm),
         coupe (prop. de L), arrondi (prop. de H),
         rabat:null|'rect'|'cut'|'round', rabH (prop. de H), rabL (supplément cm), rabCoupe, rabArrondi (prop. de la hauteur du rabat),
         pal:'bleu'|'terre' } */
(function () {
  var PAL = {
    bleu: { fond: '#498195', poche: '#5b93a6', ombre: '#23414c', fil: '#efe3cf', cote: '#3d6f81', dessous: '#2f5867', bande: '#6aa2b4', pliure: '#9cc3cf', rabat: '#64a0b3' },
    terre: { fond: '#c1846c', poche: '#cd977f', ombre: '#5e3426', fil: '#fbf1e4', cote: '#a96d56', dessous: '#94604b', bande: '#dcae99', pliure: '#e9c2b1', rabat: '#d5a28c' }
  };
  var uid = 0;
  function f(n) { return Math.round(n * 10) / 10; }
  function path(P, close) { return 'M' + P.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' L') + (close === false ? '' : ' Z'); }

  /* contour de la poche, sens horaire, départ en haut à gauche ; t = descente du bord droit de l'entrée */
  function contour(forme, w, h, t, c, r, ins) {
    ins = ins || 0;
    var x0 = ins, x1 = w - ins, y1 = h - ins, P = [[x0, ins], [x1, t + ins]], k, a;
    if (forme === 'cut') { c = Math.max(0, c - ins * 0.41); P.push([x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c]); }
    else if (forme === 'round') {
      r = Math.max(0, r - ins); P.push([x1, y1 - r]);
      for (k = 1; k < 12; k++) { a = Math.PI / 2 * k / 12; P.push([x1 - r + r * Math.cos(a), y1 - r + r * Math.sin(a)]); }
      P.push([x1 - r, y1], [x0 + r, y1]);
      for (k = 1; k < 12; k++) { a = Math.PI / 2 + Math.PI / 2 * k / 12; P.push([x0 + r + r * Math.cos(a), y1 - r + r * Math.sin(a)]); }
      P.push([x0, y1 - r]);
    } else P.push([x1, y1], [x0, y1]);
    return P;
  }

  function draw(svg, o) {
    var C = PAL[o.pal || 'bleu'], id = 'pv' + (++uid);
    var S = 10;                                         // px par cm
    var W = o.L * S, H = o.H * S;
    var t = Math.tan((o.biseau || 0) * Math.PI / 180) * W;   // descente de l'entrée
    var cut = (o.coupe || 0.25) * o.L * S, rad = (o.arrondi || 0.2) * o.H * S;
    var P = contour(o.forme, W, H, t, cut, rad);
    var dep = (o.lat || 0) * S * 0.42, dx = dep, dy = dep * 0.75;   // soufflet vu de 3/4, épaisseur modérée (pas d'effet boîte)
    var rabH = o.rabat ? (o.rabH || 0.25) * o.H * S : 0;
    var top = function (x) { return t * x / W; };
    var g = [];

    // ombre / soufflet latéral (vue de 3/4)
    if (dep > 0) {
      g.push('<path d="' + path(P.map(function (p) { return [p[0] + dx + 2, p[1] + dy + 3]; })) + '" fill="' + C.ombre + '" opacity=".45"/>');
      var mid = [];
      for (var i = 1; i < P.length; i++) {
        var a = P[i], b = P[(i + 1) % P.length], ex = b[0] - a[0], ey = b[1] - a[1];
        if (ey * dx - ex * dy <= 0) continue;
        var col = Math.abs(ex) < Math.abs(ey) ? C.cote : C.dessous;
        g.push('<path d="' + path([a, b, [b[0] + dx, b[1] + dy], [a[0] + dx, a[1] + dy]]) + '" fill="' + col + '" stroke="' + col + '" stroke-width=".6"/>');
        mid.push('<line x1="' + f(a[0] + dx / 2) + '" y1="' + f(a[1] + dy / 2) + '" x2="' + f(b[0] + dx / 2) + '" y2="' + f(b[1] + dy / 2) + '" stroke="' + C.pliure + '" stroke-opacity=".7" stroke-linecap="round"/>');
      }
      g = g.concat(mid);
      g.push('<path d="M' + f(P[1][0]) + ',' + f(P[1][1]) + ' l' + f(dx) + ',' + f(dy) + '" stroke="' + C.ombre + '" stroke-opacity=".7"/>');
    } else g.push('<path d="' + path(P) + '" transform="translate(2.5,3.5)" fill="' + C.ombre + '" opacity=".45"/>');

    // face de la poche
    g.push('<clipPath id="' + id + 'c"><path d="' + path(P) + '"/></clipPath>');
    g.push('<path d="' + path(P) + '" fill="' + C.poche + '" stroke="' + C.ombre + '" stroke-opacity=".55"/>');

    // pli central
    if (o.pli === 'e') {
      var bw = Math.max(1.2, (o.pliProf || 2) * 0.8) * S, xa = W / 2 - bw, xb = W / 2 + bw;
      g.push('<path d="M' + f(xa) + ',' + f(top(xa)) + ' L' + f(xb) + ',' + f(top(xb)) + ' L' + f(xb) + ',' + f(H) + ' L' + f(xa) + ',' + f(H) + ' Z" fill="#000" opacity=".03" clip-path="url(#' + id + 'c)"/>');
      [xa, xb].forEach(function (x) { g.push('<line x1="' + f(x) + '" y1="' + f(top(x)) + '" x2="' + f(x) + '" y2="' + f(H) + '" stroke="' + C.ombre + '" stroke-width="1.6" clip-path="url(#' + id + 'c)"/>'); });
      g.push('<line x1="' + f(xa + 2) + '" y1="' + f(top(xa + 2)) + '" x2="' + f(xa + 2) + '" y2="' + f(H) + '" stroke="#fff" stroke-opacity=".35" clip-path="url(#' + id + 'c)"/>');
    } else if (o.pli === 'i') {
      g.push('<line x1="' + f(W / 2) + '" y1="' + f(top(W / 2)) + '" x2="' + f(W / 2) + '" y2="' + f(H) + '" stroke="' + C.ombre + '" stroke-width="1.8" clip-path="url(#' + id + 'c)"/>');
    }

    // revers
    var rh = (o.revers || 0) * S;
    if (rh > 0 && o.revType === 'ext') {
      g.push('<path d="M0,0 L' + f(W) + ',' + f(t) + ' L' + f(W) + ',' + f(t + rh) + ' L0,' + f(rh) + ' Z" fill="' + C.bande + '"/>');
      g.push('<line x1="0" y1="' + f(rh) + '" x2="' + f(W) + '" y2="' + f(t + rh) + '" stroke="' + C.ombre + '" stroke-width="1.4"/>');
    } else if (rh > 0) {
      g.push('<line x1="2" y1="' + f(rh) + '" x2="' + f(W - 2) + '" y2="' + f(t + rh) + '" stroke="' + C.fil + '" stroke-width="1.2" stroke-dasharray="4 3"/>');
    }

    // surpiqûre côtés et fond
    var Q = contour(o.forme, W, H, t, cut, rad, 0.45 * S);
    g.push('<path d="' + path(Q.slice(1).concat([Q[0]]), false) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.2" stroke-dasharray="4 3" stroke-linejoin="round"/>');
    if (dep > 0) g.push('<path d="' + path(P.slice(1).map(function (p) { return [p[0] + dx - 0.35 * S, p[1] + dy]; }), false) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.1" stroke-dasharray="4 3" opacity=".8"/>');

    // rabat
    if (o.rabat) {
      var rw = W + (o.rabL || 0) * S, rx0 = -(o.rabL || 0) * S / 2, ry0 = (dep > 0 || o.pli) ? 0 : -1.6 * S, rt = t * rw / W;   // poches à soufflet : haut du rabat aligné sur le haut de la poche
      var rc = (o.rabat === 'cut' ? (o.rabCoupe || 0.3) : (o.rabArrondi || 0.4)) * rabH;
      var shear = function (p) { return [p[0] + rx0, p[1] + ry0 + rt * p[0] / rw]; };   // le rabat suit l'inclinaison de l'entrée
      var R = contour(o.rabat, rw, rabH, 0, rc, rc).map(shear);
      var Ri = contour(o.rabat, rw, rabH, 0, rc, rc, 0.45 * S).map(shear);
      g.push('<path d="' + path(R) + '" transform="translate(2,3)" fill="' + C.ombre + '" opacity=".5"/>');
      g.push('<path d="' + path(R) + '" fill="' + C.rabat + '" stroke="' + C.ombre + '" stroke-opacity=".6"/>');
      g.push('<path d="' + path(Ri.slice(1).concat([Ri[0]]), false) + '" fill="none" stroke="' + C.fil + '" stroke-width="1.2" stroke-dasharray="4 3"/>');
      g.push('<line x1="' + f(R[0][0]) + '" y1="' + f(R[0][1] + 3) + '" x2="' + f(R[1][0]) + '" y2="' + f(R[1][1] + 3) + '" stroke="' + C.fil + '" stroke-width="1.2" stroke-dasharray="4 3"/>');
    }

    // cadrage : marge de tissu autour de la poche
    var m = 4 * S, minY = Math.min(0, (o.rabat && !(dep > 0 || o.pli)) ? -1.6 * S : 0, t), maxX = W + dx + 4, maxY = Math.max(H, H + dy) + 4;
    var vx = -m - Math.max(0, (o.rabL || 0) * S / 2), vy = minY - m, vw = maxX - vx + m, vh = maxY - vy + m;
    svg.setAttribute('viewBox', [f(vx), f(vy), f(vw), f(vh)].join(' '));
    svg.innerHTML = '<defs><pattern id="' + id + 'tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-opacity=".07" stroke-width="2"/></pattern></defs>' +
      '<rect x="' + f(vx) + '" y="' + f(vy) + '" width="' + f(vw) + '" height="' + f(vh) + '" fill="' + C.fond + '"/><rect x="' + f(vx) + '" y="' + f(vy) + '" width="' + f(vw) + '" height="' + f(vh) + '" fill="url(#' + id + 'tw)"/>' + g.join('');
  }
  window.PocheVue = { draw: draw };
})();
