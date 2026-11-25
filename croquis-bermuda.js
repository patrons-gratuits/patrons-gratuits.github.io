/* Croquis du bermuda saharienne : dessin à plat du vêtement seul (pas de silhouette), vue de face ou de dos.
   Même rendu que le croquis de la saharienne : couleurs du tissu par variables CSS (--fabric, --fabric2, --ink, --stitch).
   Couleurs : celles de la palette des modèles (couleurs-modeles.css), par l'attribut data-modele posé ici sur le <svg> :
   bermuda-homme (bleu-vert de la saharienne homme) et bermuda-femme (terre cuite de la saharienne femme).
   Usage : CroquisBermuda.draw(svg, options)
   options : {
     vue: 'face' | 'dos',
     genre: 'h' | 'f'            (proportions et côté de la braguette : patte à gauche une fois porté pour l'homme, à droite pour la femme),
     coupe: 'confort' | 'ajustee',
     plis: true | false          (deux plis devant),
     longueur: 5                 (cm au-dessus du genou, = P_AuDessusGenou ; de -3 à 10 ; la poche cargo diminue quand le bermuda raccourcit),
     bas: 'revers' | 'ourlet',
     cargo:   { type, rabat, pli, forme }   poches cargo (sur le côté des jambes),
     arriere: { type, rabat, pli, forme }   poches arrière (vue de dos),
       type : '0' aucune, 's' simple, 'l' soufflets latéraux, 'c' soufflet central, 'd' double soufflet
       rabat : true | false ; pli : 'e' extérieur | 'i' intérieur (soufflet central) ;
       forme du rabat : 'r' arrondi, 'p' pointe, 'd' droit, 'c' coins coupés
   }
   Cotes en cm, pour une taille moyenne. Le dessin est schématique : il montre les choix, pas les mesures exactes. */
(function () {
  'use strict';
  var S = 8;                                   // px par cm
  var FAB = 'var(--fabric)', FAB2 = 'var(--fabric2)', INK = 'var(--ink)', STC = 'var(--stitch)', DD = '4 3';
  var buf, MAP = null, UID = 0, g_lg = 5;
  function X(x) { return (x * S + 300).toFixed(1); }
  function Y(y) { return (y * S + 40).toFixed(1); }
  function pts(pl, m) { return pl.map(function (p) { var x = MAP ? MAP(p[0]) : p[0]; return X(m ? -x : x) + ',' + Y(p[1]); }).join(' '); }
  function emit(m, pl, o) {
    o = o || {};
    var closed = o.closed !== false, tag = closed ? 'polygon' : 'polyline';
    buf.push('<' + tag + ' points="' + pts(pl, m) + '" fill="' + (closed ? (o.fill || FAB) : 'none') + '" stroke="' + (o.stroke || INK) +
      '" stroke-width="' + (o.sw || 1.8) + '" stroke-linejoin="round" stroke-linecap="round"' + (o.da ? ' stroke-dasharray="' + o.da + '"' : '') + '/>');
  }
  function dash(m, pl, closed) { emit(m, pl, { fill: 'none', sw: 1, stroke: STC, da: DD, closed: !!closed }); }
  function btn(m, x, y, r) { r = r || 0.75; if (MAP) x = MAP(x); buf.push('<circle cx="' + X(m ? -x : x) + '" cy="' + Y(y) + '" r="' + (r * S) + '" fill="' + FAB2 + '" stroke="' + INK + '" stroke-width="1.3"/>'); }
  // courbe de Bézier cubique échantillonnée
  function bez(a, b, c, d, n) {
    var o = [], i, t, u; n = n || 12;
    for (i = 0; i <= n; i++) { t = i / n; u = 1 - t; o.push([u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1]]); }
    return o;
  }

  /* ---------- rabats et poches (mêmes formes que le croquis de la saharienne) ---------- */
  function flapP(xa, xb, y, h, sh) {
    var b = y + h, c = (xa + xb) / 2, r = Math.min(2.2, h / 2.5), pl, t, i;
    if (sh === 'p') return [[xa, y], [xb, y], [xb, b - h * .25], [c, b], [xa, b - h * .25]];
    if (sh === 'd') return [[xa, y], [xb, y], [xb, b], [xa, b]];
    if (sh === 'c') return [[xa, y], [xb, y], [xb, b - r], [xb - r, b], [xa + r, b], [xa, b - r]];
    pl = [[xa, y], [xb, y], [xb, b - r]];
    for (i = 1; i < 9; i++) { t = i / 8 * Math.PI / 2; pl.push([xb - r + r * Math.cos(t), b - r + r * Math.sin(t)]); }
    for (i = 0; i < 9; i++) { t = Math.PI / 2 + i / 8 * Math.PI / 2; pl.push([xa + r + r * Math.cos(t), b - r + r * Math.sin(t)]); }
    return pl;
  }
  function pocket(m, xa, ya, w, h, p) {
    if (!p || !p.type || p.type === '0') return;
    var x1 = xa, x2 = xa + w, y1 = ya, y2 = ya + h, cx = xa + w / 2, typ = p.type, flap = !!p.rabat, sh = p.forme || 'r';
    emit(m, [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]);
    dash(m, [[x1 + .6, y1 + .6], [x2 - .6, y1 + .6], [x2 - .6, y2 - .6], [x1 + .6, y2 - .6]], false);
    if (typ === 'c' || typ === 'd') {
      var ty = y1 + (flap ? 5 : 1.6);
      if (p.pli === 'e') {
        [-1.6, 1.6].forEach(function (dx) { emit(m, [[cx + dx, ty], [cx + dx, y2]], { sw: 1.2, closed: false }); });
        dash(m, [[cx, ty], [cx, y2]], false);
      } else {
        emit(m, [[cx, y1], [cx, y2]], { sw: 1.2, closed: false });
        [-1, 1].forEach(function (dx) { dash(m, [[cx + dx, y1 + .6], [cx + dx, y2 - .65]], false); });
      }
    }
    if (typ === 'l' || typ === 'd') { [x1 + 1.3, x2 - 1.3].forEach(function (xe) { emit(m, [[xe, y1 + 1.8], [xe, y2 - .6]], { sw: .9, closed: false }); }); }
    if (flap) {
      var fh = w > 15.7 ? 7.8 : (w < 10.5 ? 5.4 : 6.5), fy = y1 - 2.6;
      emit(m, flapP(x1 - .65, x2 + .65, fy, fh, sh));
      emit(m, flapP(x1 + .2, x2 - .2, fy + .85, fh - 1.7, sh), { fill: 'none', sw: 1, stroke: STC, da: DD });
      btn(m, cx, fy + fh - (sh === 'p' ? 2.3 : 2.6));
    }
  }

  /* ---------- gabarit du bermuda (demi-vêtement côté droit du dessin, x >= 0) ---------- */
  function gab(o) {
    var f = o.genre === 'f', aj = o.coupe === 'ajustee';
    var lg5 = isFinite(parseFloat(o.longueur)) ? Math.max(-5, Math.min(12, parseFloat(o.longueur))) : 5;
    g_lg = lg5;
    var g = {
      HB: 4,                                   // hauteur de ceinture
      wt: f ? 18.5 : 20.5,                     // demi-largeur à la taille
      hp: (f ? 26 : 26.5) - (aj ? 1.2 : 0),    // demi-largeur au bassin
      yh: f ? 20 : 21,                         // niveau du bassin
      yk: f ? 30 : 32,                         // niveau de l'entrejambe
      yb: 61 + (5 - lg5),                      // bas fini : suit la longueur (cm au-dessus du genou ; 5 = référence)
      lg: aj ? 24.5 : 27.5,                    // largeur à plat d'une jambe en bas
      gap: 1.4                                 // demi-écart entre les jambes en bas
    };
    g.xo = g.gap + g.lg;                       // côté, en bas
    return g;
  }
  function outline(g) {
    // du milieu taille (sous la ceinture) au bas, en passant par le côté ; puis entrejambe jusqu'à la fourche
    var pl = [[0, g.HB], [g.wt, g.HB]];
    pl = pl.concat(bez([g.wt, g.HB], [g.wt + 1.6, g.HB + 5], [g.hp - .3, g.yh - 8], [g.hp, g.yh], 10).slice(1));
    pl = pl.concat(bez([g.hp, g.yh], [g.hp, g.yh + 8], [g.xo, g.yb - 14], [g.xo, g.yb], 12).slice(1));
    pl.push([g.gap, g.yb]);
    pl = pl.concat(bez([g.gap, g.yb], [g.gap, g.yb - 10], [0.4, g.yk + 4], [0, g.yk], 10).slice(1));
    return pl;
  }
  // x du côté à la hauteur y (pour placer les repères)
  function sideX(g, y) {
    var pl = outline(g), i, a, b;
    for (i = 1; i < pl.length; i++) { a = pl[i - 1]; b = pl[i]; if (b[0] > g.wt - 1 && ((a[1] <= y && b[1] >= y))) return a[0] + (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) || 1); }
    return g.xo;
  }
  function legInX(g, y) { // bord intérieur de jambe (entrejambe) à la hauteur y
    if (y <= g.yk) return 0;
    var t = (y - g.yk) / (g.yb - g.yk); return 0.4 + (g.gap - 0.4) * Math.sqrt(t);
  }

  function half(m, o, g, back) {
    // corps
    emit(m, outline(g));
    // couture d'enfourchure (milieu) : dos jusqu'à la fourche ; devant sous la braguette
    // bas : revers ou ourlet
    var yb = g.yb;
    if (o.bas === 'ourlet') {
      dash(m, [[g.gap + .4, yb - 2.6], [g.xo - .4, yb - 2.6]], false);
    } else {
      var yr = yb - 3.4;
      emit(m, [[g.gap - .15, yr], [g.xo + .35, yr], [g.xo + .35, yb + .15], [g.gap - .15, yb + .15]]);
      dash(m, [[g.gap + .3, yb - .55], [g.xo - .1, yb - .55]], false);
    }
    // poche de côté : ouverture le long de la couture, arrêts de couture
    var y1 = g.HB + 2, y2 = g.HB + 17;
    [y1, y2].forEach(function (yy) { var sx = sideX(g, yy); emit(m, [[sx - 1.1, yy], [sx, yy]], { sw: 1.4, closed: false }); });
    // poche cargo, centrée sur la couture de côté : on en voit la moitié avant (face) ou arrière (dos), dessinée en légère perspective
    if (o.cargo && o.cargo.type && o.cargo.type !== '0') {
      // centrée sur la couture de côté : on ne dessine que la moitié visible (avant vue de face, arrière vue de dos)
      var ch = Math.min(17, 22 - g_lg), cw = Math.min(16, ch / 1.06), cy = g.yk + (o.cargo.rabat ? 1.2 : 0), xa = sideX(g, cy + 7) - cw / 2;
      var y0 = cy - 4, y1 = cy + ch + 1, cid = 'cg' + (++UID);
      var BO = 1.1; // la poche dépasse légèrement de la couture de côté : effet de volume
      var clip = [[xa - 3, y0], [sideX(g, y0) + BO, y0], [sideX(g, (y0 + y1) / 2) + BO, (y0 + y1) / 2], [sideX(g, y1) + BO, y1], [xa - 3, y1]];
      buf.push('<clipPath id="' + cid + '"><polygon points="' + pts(clip, m) + '"/></clipPath><g clip-path="url(#' + cid + ')">');
      pocket(m, xa, cy, cw, ch, o.cargo);
      buf.push('</g>');
      var ytop = o.cargo.rabat ? cy - 2.6 : cy, ed = [];
      for (var yy = ytop; yy <= cy + ch + .01; yy += .5) ed.push([sideX(g, yy) + BO, yy]);
      emit(m, ed, { closed: false });
      // ombre légère sur la tranche de la poche
      emit(m, [[sideX(g, ytop) + BO - .5, ytop], [sideX(g, ytop) + BO, ytop], [sideX(g, cy + ch) + BO, cy + ch], [sideX(g, cy + ch) + BO - .5, cy + ch]], { fill: 'var(--ink)', sw: 0, stroke: 'none' });
      buf[buf.length - 1] = buf[buf.length - 1].replace('/>', ' fill-opacity=".18"/>');
    }
    if (back) {
      // poche arrière
      if (o.arriere && o.arriere.type && o.arriere.type !== '0') {
        var by = g.HB + 6 + (o.arriere.rabat ? 2.6 : 0);
        pocket(m, g.wt * .5 - 6.5 + .5, by, 13, 14, o.arriere);
      }
    } else {
      // plis devant (option) : couchés vers la braguette
      if (o.plis) {
        [g.wt * .45, g.wt * .45 + 3.2].forEach(function (px, k) {
          emit(m, [[px, g.HB], [px - .25, g.HB + (k ? 6 : 8)]], { sw: 1.3, closed: false });
          emit(m, [[px + .9, g.HB], [px + .9, g.HB + 2.2]], { sw: .9, closed: false, stroke: STC });
        });
      }
    }
  }

  function waistband(g, back, o) {
    var w = g.wt;
    emit(false, [[0, 0], [w + .2, 0], [w, g.HB], [0, g.HB]]);
    emit(true, [[0, 0], [w + .2, 0], [w, g.HB], [0, g.HB]]);
    dash(false, [[.3, .55], [w - .2, .55]], false); dash(true, [[.3, .55], [w - .2, .55]], false);
    dash(false, [[.3, g.HB - .55], [w - .2, g.HB - .55]], false); dash(true, [[.3, g.HB - .55], [w - .2, g.HB - .55]], false);
    if (back) emit(false, [[0, 0], [0, g.HB]], { sw: 1.4, closed: false }); // couture milieu dos de la ceinture
  }
  function loops(g, back) {
    var xs = back ? [0, g.wt * .5, g.wt - .9] : [g.wt * .45 + 4.2, g.wt - .9];
    xs.forEach(function (x) {
      [false, true].forEach(function (m) {
        if (x === 0 && m) return;
        var a = x - .6, b = x + .6;
        emit(m, [[a, -.4], [b, -.4], [b, g.HB + .6], [a, g.HB + .6]], { sw: 1.3 });
        dash(m, [[a + .25, -.1], [a + .25, g.HB + .3]], false); dash(m, [[b - .25, -.1], [b - .25, g.HB + .3]], false);
      });
    });
  }
  function fly(g, o) {
    // patte de braguette : gauche une fois porté pour l'homme = côté droit du dessin vu de face ; inverse pour la femme
    var m = o.genre === 'f', L = 15, J = 3.5, y0 = g.HB, yb = y0 + L;
    var jl = [[J, y0], [J, yb - J]].concat(bez([J, yb - J], [J, yb - J * .45], [J * .45, yb], [0, yb], 8).slice(1));
    dash(m, jl, false);
    emit(false, [[0, y0], [0, g.yk]], { sw: 1.4, closed: false });      // milieu devant : bord de la patte puis couture d'enfourchure
    // bouton et boutonnière de la ceinture, sur la patte de ceinture
    btn(m, 1.6, g.HB / 2, .8);
  }

  function draw(sv, o) {
    o = o || {};
    var back = o.vue === 'dos', g = gab(o);
    buf = [];
    [false, true].forEach(function (m) { half(m, o, g, back); });
    if (back) emit(false, [[0, g.HB], [0, g.yk]], { sw: 1.4, closed: false });
    waistband(g, back, o);
    if (!back) fly(g, o);
    loops(g, back);
    var minx = -(g.xo + 6), w = 2 * (g.xo + 6);
    sv.setAttribute('viewBox', [X(minx), Y(-2), (w * S).toFixed(0), ((g.yb + 4) * S).toFixed(0)].join(' '));
    var cl = sv.getAttribute('class') || '';
    if (!/\bcq\b/.test(cl)) sv.setAttribute('class', (cl + ' cq').trim());
    sv.setAttribute('data-modele', o.genre === 'f' ? 'bermuda-femme' : 'bermuda-homme');
    sv.innerHTML = buf.join('');
  }
  window.CroquisBermuda = { draw: draw };
})();
