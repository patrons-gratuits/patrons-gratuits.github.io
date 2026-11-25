/* Schémas du guide de couture du bermuda saharienne.
   SchemaBermuda.draw(svg, nom, options)
     nom : 'braguette-patte-posee' | 'braguette-surpiqure' | 'braguette-sous-patte' | 'braguette-fermee' | 'poche-cote' | 'ceinture'
     options : { genre: 'h' | 'f' }
   Couleurs par variables CSS, comme le croquis (data-modele="bermuda-homme" / "bermuda-femme") :
     --fabric (endroit), --fabric2 (pièce posée par-dessus), --ink (contours), et pour l'envers une teinte claire.
   Pas de texte dans les schémas : les explications restent dans le guide. */
(function () {
  'use strict';
  var S = 10;                                   // px par cm
  var END = 'var(--fabric)', DESSUS = 'var(--fabric2)', INK = 'var(--ink)';
  var ENV = 'var(--envers, #efe8dc)';           // envers : teinte claire
  var PIQ = 'var(--piqure, #c0392b)';           // couture à faire
  var buf;
  function f(n) { return (+n).toFixed(1); }
  function P(pl) { return pl.map(function (p) { return f(p[0] * S) + ',' + f(p[1] * S); }).join(' '); }
  function poly(pl, o) {
    o = o || {};
    buf.push('<' + (o.open ? 'polyline' : 'polygon') + ' points="' + P(pl) + '" fill="' + (o.open ? 'none' : (o.fill || END)) + '" stroke="' + (o.stroke || INK) +
      '" stroke-width="' + (o.sw || 1.6) + '" stroke-linejoin="round" stroke-linecap="round"' + (o.da ? ' stroke-dasharray="' + o.da + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + '/>');
  }
  function piqure(pl) { poly(pl, { open: true, stroke: PIQ, sw: 2.2, da: '6 4' }); }
  function cache(pl, closed) { poly(pl, { open: !closed, fill: 'none', stroke: INK, sw: 1, da: '3 3', op: .7 }); }
  function bez(a, b, c, d, n) {
    var o = [], i, t, u; n = n || 14;
    for (i = 0; i <= n; i++) { t = i / n; u = 1 - t; o.push([u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1]]); }
    return o;
  }
  function fleche(a, b, courbe) {            // flèche de mouvement (pliage, retournement)
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    var c = [mx - dy * (courbe || .35), my + dx * (courbe || .35)];
    buf.push('<path d="M' + f(a[0]*S) + ',' + f(a[1]*S) + ' Q' + f(c[0]*S) + ',' + f(c[1]*S) + ' ' + f(b[0]*S) + ',' + f(b[1]*S) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" marker-end="url(#fl)"/>');
  }
  function defs() {
    buf.push('<defs><marker id="fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + INK + '"/></marker></defs>');
  }
  function groupe(tx, ty, miroir, cb) {
    buf.push('<g transform="translate(' + f(tx * S) + ',' + f(ty * S) + ')' + (miroir ? ' scale(-1,1)' : '') + '">'); cb(); buf.push('</g>');
  }

  /* ---------- haut du devant qui recouvre, vu sur l'endroit (milieu devant à gauche du dessin) ---------- */
  var L = 15, W = 15;                           // ouverture de braguette, largeur dessinée du devant
  function devant(fond) {
    var pl = [[0, 0], [W, 0]];
    for (var y = 0; y <= 27; y += 1.5) pl.push([W + (Math.sin(y * .9) * .35), y]);   // bord coupé : le devant continue
    pl.push([W, 27]);
    var fourche = bez([0, L + 3.5], [0, L + 7.5], [-2.5, 25], [-5.5, 27], 10);       // courbe d'enfourchure
    pl = pl.concat([[-5.5, 27]]).concat(fourche.slice().reverse());
    poly(pl, { fill: fond || END });
  }

  function braguettePatte(o) {
    defs();
    var m = o.genre === 'f';
    groupe(m ? 22 : 7, 2, m, function () {
      devant();
      // patte de braguette posée endroit contre endroit, bords coupés sur le milieu devant ; pli vers le côté
      var pw = 4, pl = [[0, 0], [pw, 0], [pw, L + 1 - pw]].concat(bez([pw, L + 1 - pw], [pw, L + 1 - pw * .45], [pw * .45, L + 1], [0, L + 1], 10).slice(1));
      poly(pl, { fill: DESSUS });
      poly([[pw, 0], [pw, L + 1 - pw]], { open: true, sw: 2.6 });          // pliure de la patte (bord épais)
      // couture à 1 cm du bord, de la taille au bas de l'ouverture
      piqure([[1, -0.3], [1, L]]);
    });
  }

  function braguetteSurpiqure(o) {
    defs();
    var m = o.genre === 'f';
    groupe(m ? 22 : 7, 2, m, function () {
      devant();
      var J = 3.5, x0 = 1;                                                    // milieu devant à 1 cm du bord coupé
      // patte retournée sur l'envers : visible en transparence
      var pw = 4;
      cache([[x0, 0], [x0 + pw, 0], [x0 + pw, L + 1 - pw]].concat(bez([x0 + pw, L + 1 - pw], [x0 + pw, L + 1 - pw * .45], [x0 + pw * .45, L + 1], [x0, L + 1], 10).slice(1)), false);
      [1, 2, 3].forEach(function (k) { var y = L * k / 4; cache([[x0 + 1, y], [x0 + 2.8, y]], false); });   // boutonnières, sous le devant
      // surpiqûre en J
      var jl = [[x0 + J, -0.2], [x0 + J, L - J]].concat(bez([x0 + J, L - J], [x0 + J, L - J * .45], [x0 + J * .45, L], [x0, L], 10).slice(1));
      piqure(jl);
      // point d'arrêt au bas de la braguette
      poly([[x0 - .6, L - .8], [x0 + .9, L + .6]], { open: true, stroke: PIQ, sw: 4 });
    });
  }


  /* ---------- sous-patte posée sous le devant qui est dessous (vu sur l'endroit) ---------- */
  function braguetteSousPatte(o) {
    defs();
    var m = o.genre !== 'f';                       // devant droit porté pour l'homme : milieu devant à droite du dessin
    groupe(m ? 22 : 7, 2, m, function () {
      var sw = 4, ext = 3;                         // sous-patte pliée : 4 cm, dont 3 cm dépassent du milieu devant
      poly([[-ext, 0], [1, 0], [1, L + 1], [-ext, L + 1]], { fill: DESSUS });
      devant();
      cache([[0, 0], [1, 0], [1, L + 1], [0, L + 1]], false);
      piqure([[.25, -0.3], [.25, L + .6]]);                                  // surpiqûre au bord du devant
      [1, 2, 3].forEach(function (k) { var y = L * k / 4; poly([[-2.1, y - .5], [-1.1, y + .5]], { open: true, sw: 1.4 }); poly([[-2.1, y + .5], [-1.1, y - .5]], { open: true, sw: 1.4 }); });   // repères des boutons
    });
  }

  /* ---------- braguette fermée : les deux devants vus de face ---------- */
  var HB = 6;                                      // hauteur dessinée sous la braguette
  function haut(sens, fond) {                      // haut d'un devant, milieu devant en x = 0, s'étend vers sens
    var Wd = 13, pl = [[0, 0], [sens * Wd, 0]];
    for (var y = 0; y <= L + HB; y += 1.5) pl.push([sens * (Wd + Math.sin(y * .9) * .35), y]);
    for (var x = Wd; x >= 0; x -= 1.5) pl.push([sens * x, L + HB + Math.sin(x * 1.1) * .3]);
    pl.push([0, L + HB]);
    poly(pl, { fill: fond || END });
  }
  function braguetteFermee(o) {
    defs();
    var m = o.genre === 'f';
    groupe(19, 2, m, function () {
      // sous-patte (sous le devant qui recouvre), puis devant de dessous, puis devant qui recouvre
      haut(-1);
      cache([[0, 0], [3, 0], [3, L + 1], [0, L + 1]], true);
      haut(1);
      var J = 3.5;
      piqure([[J, -0.2], [J, L - J]].concat(bez([J, L - J], [J, L - J * .45], [J * .45, L], [0, L], 10).slice(1)));
      [1, 2, 3].forEach(function (k) { var y = L * k / 4; buf.push('<circle cx="' + f(1.9 * S) + '" cy="' + f(y * S) + '" r="' + f(.75 * S) + '" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="2 2"/>'); });
      poly([[0, L], [0, L + HB]], { open: true, sw: 1.6 });                // couture d'enfourchure sous la braguette
      poly([[-.8, L - .7], [.8, L + .7]], { open: true, stroke: PIQ, sw: 4 }); // point d'arrêt
    });
  }

  /* ---------- poche de côté : couture de côté fermée en deux fois (envers du dos visible) ---------- */
  function pocheCote(o) {
    defs();
    var H = 30, o1 = 2, o2 = 17;
    groupe(16, 2, false, function () {
      // fonds de poche, rabattus hors de la couture
      var sac = [[0, o1 - .5], [6, o1 - .5]].concat(bez([6, o1 - .5], [11, o1 + 3], [11, o2 + 6], [5, o2 + 8], 10).slice(1)).concat([[0, o2 + 3]]);
      poly(sac, { fill: ENV });
      piqure(bez([6, o1 - .2], [10.2, o1 + 3], [10.2, o2 + 5.6], [5, o2 + 7.4], 12).concat([[1, o2 + 2.6]]));
      // devant et dos endroit contre endroit : on voit l'envers du dos
      var pl = [[0, 0], [-12, 0]];
      for (var y = 0; y <= H; y += 1.5) pl.push([-12 - Math.sin(y * .9) * .35, y]);
      pl.push([0, H]);
      poly(pl, { fill: ENV });
      // couture de côté en deux fois, l'ouverture reste libre
      piqure([[-1, -0.3], [-1, o1]]); piqure([[-1, o2], [-1, H + .3]]);
      [o1, o2].forEach(function (y) { poly([[-2.2, y], [.4, y]], { open: true, stroke: PIQ, sw: 4 }); });   // points d'arrêt
      [o1, o2].forEach(function (y) { poly([[0, y], [1.2, y]], { open: true, sw: 1.2 }); });              // repères d'ouverture
    });
  }

  /* ---------- ceinture posée, braguette fermée ---------- */
  function ceinture(o) {
    defs();
    var m = o.genre === 'f', HC = 4;
    groupe(19, 6, m, function () {
      haut(-1); haut(1);
      // ceinture : côté patte (à gauche du dessin), avec 4 cm qui passent sous l'extrémité côté braguette
      poly([[-13, -HC], [4, -HC], [4, 0], [-13, 0]], { fill: DESSUS });
      poly([[0, -HC], [13, -HC], [13, 0], [0, 0]], { fill: DESSUS });
      cache([[0, -HC], [4, -HC], [4, 0], [0, 0]], true);                    // extrémité côté patte, sous l'autre
      poly([[1.4, -HC / 2], [3.2, -HC / 2]], { open: true, sw: 2.4 });       // boutonnière
      buf.push('<circle cx="' + f(2.3 * S) + '" cy="' + f(-HC / 2 * S) + '" r="' + f(.95 * S) + '" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="2 2"/>');
      // passants du devant
      [-8.5, 8.5].forEach(function (x) { poly([[x - .6, -HC - .4], [x + .6, -HC - .4], [x + .6, .8], [x - .6, .8]], { fill: DESSUS, sw: 1.3 }); });
      var J = 3.5; piqure([[J, 0], [J, L - J]].concat(bez([J, L - J], [J, L - J * .45], [J * .45, L], [0, L], 10).slice(1)));
    });
  }

  function draw(sv, nom, o) {
    o = o || {}; buf = [];
    var vb = '0 0 380 340';
    if (nom === 'braguette-patte-posee') braguettePatte(o);
    else if (nom === 'braguette-surpiqure') braguetteSurpiqure(o);
    else if (nom === 'braguette-sous-patte') braguetteSousPatte(o);
    else if (nom === 'braguette-fermee') braguetteFermee(o);
    else if (nom === 'poche-cote') pocheCote(o);
    else if (nom === 'ceinture') { ceinture(o); vb = '0 0 380 300'; }
    sv.setAttribute('viewBox', vb);
    sv.setAttribute('data-modele', o.genre === 'f' ? 'bermuda-femme' : 'bermuda-homme');
    sv.innerHTML = buf.join('');
  }
  window.SchemaBermuda = { draw: draw };
})();
