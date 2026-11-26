/* Rendu « 3D » des chapeaux du site (patrons-gratuits.fr) : surface de révolution ombrée, en couleur, posée sur une tête de mannequin.
   Chapeau3D.bob(svg, M, opts)
     M : le modèle calculé par la page du bob ({A, B, Cd, H, drop}, en cm : diamètre de la couronne, de la tête, du bord ; hauteur de calotte ; chute du bord)
     opts : { retourne: false|true }   // true : le côté doublure passe à l'extérieur (bob réversible)
   Couleurs par variables CSS (palette des modèles) : --fabric (tissu), --lining (doublure), --ink (contours), --head (mannequin).
   Valeurs par défaut : couleurs des sahariennes (bleu-vert dehors, terre cuite dedans). */
(function () {
  'use strict';
  var EL = 9 * Math.PI / 180;                // regard légèrement par-dessous : on voit le dessous du bord (la doublure)
  var AZ = 18 * Math.PI / 180;                // léger trois-quarts
  var N = 64;                                 // découpage autour de l'axe
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function shade(c, k) { var r = hex(c); return 'rgb(' + r.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * k))); }).join(',') + ')'; }
  function css(sv, name, def) {
    try { var v = getComputedStyle(sv).getPropertyValue(name).trim(); if (/^#[0-9a-f]{6}$/i.test(v)) return v; } catch (e) {}
    return def;
  }
  // point 3D (x, y profondeur, z haut) -> écran
  function proj(p) {
    var ca = Math.cos(AZ), sa = Math.sin(AZ), x = p[0] * ca - p[1] * sa, y = p[0] * sa + p[1] * ca;
    var ce = Math.cos(EL), se = Math.sin(EL);
    return { x: x, y: -(p[2] * ce - y * se), d: y * ce + p[2] * se };   // d : profondeur (grand = loin)
  }
  var UID = 0;
  var LIGHT = (function () { var v = [-0.45, -0.7, 0.55], l = Math.hypot(v[0], v[1], v[2]); return v.map(function (a) { return a / l; }); })();

  // profil : liste de [rayon, hauteur] du haut vers le bas ; produit les facettes ombrées
  function surface(profil, col, colIn, faces) {
    for (var j = 0; j + 1 < profil.length; j++) {
      for (var i = 0; i < N; i++) {
        var t0 = 2 * Math.PI * i / N, t1 = 2 * Math.PI * (i + 1) / N;
        var P = [[profil[j][0], t0, profil[j][1]], [profil[j][0], t1, profil[j][1]], [profil[j + 1][0], t1, profil[j + 1][1]], [profil[j + 1][0], t0, profil[j + 1][1]]]
          .map(function (q) { return [q[0] * Math.sin(q[1]), -q[0] * Math.cos(q[1]), q[2]]; });
        // normale extérieure
        var u = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], v = [P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]];
        var n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], ln = Math.hypot(n[0], n[1], n[2]) || 1;
        n = n.map(function (a) { return -a / ln; });
        var cx = (P[0][0] + P[2][0]) / 2, cy = (P[0][1] + P[2][1]) / 2;
        if (n[0] * cx + n[1] * cy < 0) n = n.map(function (a) { return -a; });   // vers l'extérieur de l'axe
        // vecteur vers la caméra
        var cam = [-Math.sin(AZ) * Math.cos(EL), -Math.cos(AZ) * Math.cos(EL), -Math.sin(EL)];
        var vis = n[0] * cam[0] + n[1] * cam[1] + n[2] * cam[2];
        var ext = vis > 0, nn = ext ? n : n.map(function (a) { return -a; });
        var lum = 0.82 + 0.33 * Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2]);   // bob : ombrage plus doux, couleurs plus claires
        var S = P.map(proj), d = (S[0].d + S[1].d + S[2].d + S[3].d) / 4;
        faces.push({ pts: S, d: d, fill: shade(ext ? col : colIn, ext ? lum : lum * 0.9), ext: ext });
      }
    }
  }
  // tête de mannequin (en cm, y vers le bas, 0 = ligne du chapeau), contenue dans la calotte.
  // Elle tourne avec le chapeau : de face à az = 0, de profil à az = ±90° (le nez suit le sens de rotation).
  function tete(B, A, H) {
    var w = B / 2 * 0.96, wt = Math.min(A / 2 * 0.95, w * 0.8), top = Math.min(H * 0.82, 10), chin = 15.5, n = 28;
    function bez(a, b, c, d) { var r = []; for (var k = 0; k < n; k++) { var t = k / n, q = 1 - t;
      r.push([q*q*q*a[0] + 3*q*q*t*b[0] + 3*q*t*t*c[0] + t*t*t*d[0], q*q*q*a[1] + 3*q*q*t*b[1] + 3*q*t*t*c[1] + t*t*t*d[1]]); } return r; }
    function lisse(P) {                           // courbe lissée passant par les points (Catmull-Rom), n points, sans le dernier
      var L = [0], k; for (k = 1; k < P.length; k++) L.push(L[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]));
      var r = [], seg = 0; for (k = 0; k < n; k++) { var s = L[L.length - 1] * k / n; while (seg < P.length - 2 && L[seg + 1] < s) seg++;
        var t = (s - L[seg]) / ((L[seg + 1] - L[seg]) || 1), p0 = P[Math.max(0, seg - 1)], p1 = P[seg], p2 = P[seg + 1], p3 = P[Math.min(P.length - 1, seg + 2)], t2 = t * t, t3 = t2 * t;
        r.push([0, 1].map(function (c) { return 0.5 * (2 * p1[c] + (p2[c] - p0[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * t3); })); }
      return r; }
    var crane = bez([-w, 0], [-w, -top * 0.6], [-wt, -top], [0, -top]).concat(bez([0, -top], [wt, -top], [w, -top * 0.6], [w, 0]));
    var face = crane.concat(bez([w, 0], [w, 8], [w * 0.55, chin], [0, chin]), bez([0, chin], [-w * 0.55, chin], [-w, 8], [-w, 0]));
    var profil = crane.concat(
      lisse([[w, 0], [w * 1.02, 2.6], [w * 0.97, 4.4], [w + 0.5, 5.6], [w + 2.0, 7.7], [w + 0.2, 8.4], [w + 0.35, 9.6], [w * 0.98, 10.5], [w + 0.15, 11.6], [w * 0.95, 13.5], [w * 0.6, 14.5], [w * 0.15, 14.9]]),
      lisse([[w * 0.15, 14.9], [-w * 0.15, 13.4], [-w * 0.55, 11.6], [-w * 0.92, 8.5], [-w * 1.03, 4.2], [-w, 0]]));
    var sa = Math.sin(AZ), m = Math.abs(sa), sg = sa < 0 ? -1 : 1;
    var pts = face.map(function (p, k) { var q = profil[k]; return [p[0] * (1 - m) + sg * q[0] * m, p[1] * (1 - m) + q[1] * m]; });
    var t = 'M' + pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' L') + ' Z';
    var cf = [[-w * 0.44, chin - 3], [-w * 0.48, chin + 7], [w * 0.48, chin + 7], [w * 0.44, chin - 3]];
    var cp = [[-w * 0.62, chin - 5], [-w * 0.4, chin + 7], [w * 0.55, chin + 7], [w * 0.3, chin - 3]];
    var cou = 'M' + cf.map(function (p, k) { return (p[0] * (1 - m) + sg * cp[k][0] * m).toFixed(2) + ',' + (p[1] * (1 - m) + cp[k][1] * m).toFixed(2); }).join(' L') + ' Z';
    return [cou, t];
  }

  function bob(sv, M, o) {
    o = o || {};
    var EL0 = EL, AZ0 = AZ;
    if (o.elev != null) EL = -o.elev * Math.PI / 180;
    if (o.azim != null) AZ = o.azim * Math.PI / 180;
    var fab = css(sv, '--fabric', '#498195'), lin = css(sv, '--lining', '#c1846c'), ink = css(sv, '--ink', '#3b2f22'), head = css(sv, '--head', '#2f3236');
    var ext = o.retourne ? lin : fab, inn = o.retourne ? fab : lin;
    var faces = [];
    // calotte (couronne en haut) puis bord ; le fond de la couronne est un disque
    var prof = [], k, steps = 6;
    for (k = 0; k <= steps; k++) prof.push([M.A / 2 + (M.B / 2 - M.A / 2) * k / steps, M.H - M.H * k / steps]);
    for (k = 1; k <= steps; k++) prof.push([M.B / 2 + (M.Cd / 2 - M.B / 2) * k / steps, -M.drop * k / steps]);
    surface(prof, ext, inn, faces);
    var disque = [], top = [];
    for (k = 0; k < N; k++) { var t = 2 * Math.PI * k / N; top.push(proj([M.A / 2 * Math.sin(t), -M.A / 2 * Math.cos(t), M.H])); }
    faces.sort(function (a, b) { return b.d - a.d; });
    var out = [];
    function poly(S, fill, extra) { out.push('<polygon points="' + S.map(function (p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }).join(' ') + '" fill="' + fill + '" stroke="' + fill + '" stroke-width=".08"' + (extra || '') + '/>'); }
    // ombre portée douce sous le mannequin
    out.push('<ellipse cx="0" cy="' + (23).toFixed(1) + '" rx="' + (M.Cd * 0.42).toFixed(1) + '" ry="1.6" fill="' + ink + '" opacity=".12"/>');
    // facettes lointaines (intérieur du chapeau), puis la tête, puis le reste
    var loin = faces.filter(function (f) { return f.d > 0 && !f.ext; }), pres = faces.filter(function (f) { return !(f.d > 0 && !f.ext); });
    loin.forEach(function (f) { poly(f.pts, f.fill); });
    tete(M.B, M.A, M.H).forEach(function (d) { out.push('<path d="' + d + '" fill="' + head + '"/>'); });
    out.push('<ellipse cx="' + (-M.B * 0.16).toFixed(2) + '" cy="4" rx="' + (M.B * 0.09).toFixed(2) + '" ry="5" fill="#fff" opacity=".07"/>');
    pres.forEach(function (f) { poly(f.pts, f.fill); });
    if (EL < 0) poly(top, shade(ext, 1.0));      // dessus de la couronne (visible seulement vu d'en haut)
    // contour et surpiqûres du bord (cercles de la calotte et du bord)
    function anneau(r, z, st) { var S = []; for (var i = 0; i <= N; i++) { var t = 2 * Math.PI * i / N; S.push(proj([r * Math.sin(t), -r * Math.cos(t), z])); } return S; }
    function trait(S, col, w, da, devant) {
      var seg = [], segs = [];
      S.forEach(function (p, i) { var vis = !devant || p.d <= 0.2; if (vis) seg.push(p); else if (seg.length) { segs.push(seg); seg = []; } });
      if (seg.length) segs.push(seg);
      segs.forEach(function (s) { if (s.length > 1) out.push('<polyline points="' + s.map(function (p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'); });
    }
    trait(anneau(M.B / 2, 0), shade(ext, 0.7), .14, null, true);                                                                     // couture calotte / bord
    trait(anneau(M.Cd / 2, -M.drop), ink, .16, null, true);                                                                         // bord extérieur
    // cadrage
    var minx = -M.Cd / 2 - 2, maxx = M.Cd / 2 + 2, miny = -M.H - 3, maxy = 24;
    sv.setAttribute('viewBox', [minx, miny, maxx - minx, maxy - miny].map(function (v) { return v.toFixed(1); }).join(' '));
    sv.innerHTML = out.join('');
    EL = EL0; AZ = AZ0;
  }
    /* ---------- bérets : dessus bombé, dessous du disque jusqu'à l'ouverture (décentrée pour le béret basque), bandeau ----------
     P : { R: rayon du béret, r: rayon de l'ouverture (tête), d: décalage de l'ouverture (cm), H: hauteur entre le bord et l'ouverture,
           dome: bombé du dessus, Hb: hauteur du bandeau, petales: 0 ou nombre de pétales }
     o : { elev: degrés (vue d'en haut si > 0), azim: degrés } */
  function mesh(G, col, colIn, faces, cen) {
    for (var j = 0; j + 1 < G[0].length; j++) for (var i = 0; i < G.length; i++) {
      var i2 = (i + 1) % G.length, P = [G[i][j], G[i2][j], G[i2][j + 1], G[i][j + 1]];
      var u = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], v = [P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]];
      if (Math.hypot(u[0], u[1], u[2]) < 1e-6) u = [P[2][0] - P[3][0], P[2][1] - P[3][1], P[2][2] - P[3][2]];
      var n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], ln = Math.hypot(n[0], n[1], n[2]) || 1;
      n = n.map(function (a) { return a / ln; });
      var m = [(P[0][0] + P[2][0]) / 2 - cen[0], (P[0][1] + P[2][1]) / 2 - cen[1], (P[0][2] + P[2][2]) / 2 - cen[2]];
      if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) n = n.map(function (a) { return -a; });
      var cam = [-Math.sin(AZ) * Math.cos(EL), -Math.cos(AZ) * Math.cos(EL), -Math.sin(EL)];
      var ext = n[0] * cam[0] + n[1] * cam[1] + n[2] * cam[2] > 0, nn = ext ? n : n.map(function (a) { return -a; });
      var lum = 0.55 + 0.45 * Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2]);
      var S = P.map(proj);
      faces.push({ pts: S, d: (S[0].d + S[1].d + S[2].d + S[3].d) / 4, fill: shade(ext ? col : colIn, ext ? lum : lum * 0.8), ext: ext, i: i, j: j, lum: lum });
    }
  }
  function beret(sv, P, o) {
    o = o || {};
    var EL0 = EL, AZ0 = AZ;
    EL = -(o.elev != null ? o.elev : 12) * Math.PI / 180;   // elev > 0 : vu d'en haut
    AZ = (o.azim != null ? o.azim : 0) * Math.PI / 180;
    var fab = o.fabric || css(sv, '--fabric', '#c1846c'), ink = css(sv, '--ink', '#3b2f22'), head = css(sv, '--head', '#2f3236');
    var NA = o.rapide ? 48 : (P.petales ? 96 : 72), faces = [], out = [], i, j;   // rapide : pendant la rotation
    var cx = -P.d;                                            // la tête est centrée sous l'ouverture : le disque se décale de -d
    var surf = [], band = [], rr = P.arrondi ? Math.min(P.H * 0.75, 3.6, (P.R - P.r) * 0.42) : Math.min(P.H * 0.45, 2.6, (P.R - P.r) * 0.3);   // rayon de l'arrondi du bord (arrondi : bord plus rond)
    for (i = 0; i < NA; i++) {
      var t = 2 * Math.PI * i / NA, c = Math.cos(t), s2 = Math.sin(t), a = [], e = [];
      var rx = cx + P.R * c, ry = P.R * s2, ex = Math.hypot(rx, ry), tomb = (P.tombe || 0.6) * Math.max(0, ex - P.R);   // le côté long tombe
      var Rt = P.R - rr, m = -2 * P.dome / Rt, ph0 = Math.atan2(1, -m);
      // 1. dessus bombé, du centre jusqu'au début de l'arrondi
      for (j = 0; j <= 8; j++) { var u = j / 8; a.push([cx + Rt * u * c, Rt * u * s2, P.H + P.dome * (1 - u * u) - tomb * Math.pow(u, 3)]); }
      // 2. bord arrondi, tangent au dessus
      var ez = P.H - tomb, Cx = Rt - rr * Math.cos(ph0), Cz = ez - rr * Math.sin(ph0);
      for (j = 1; j <= 8; j++) { var ph = ph0 - (ph0 + Math.PI / 2) * j / 8, rho = Cx + rr * Math.cos(ph) + rr * Math.cos(ph0); a.push([cx + rho * c, rho * s2, Cz + rr * Math.sin(ph)]); }
      // 3. dessous : part à l'horizontale sous l'arrondi et arrive à la verticale sur l'ouverture (pas d'arête)
      var last = a[a.length - 1], z0 = last[2], ox = P.r * c, oy = P.r * s2;
      for (j = 1; j <= 10; j++) { var w = j / 10, q = 1 - w;
        var bw = w * w * (3 - 2 * w), bz = q * q * q * z0 + 3 * q * q * w * (z0 * 0.75) + 3 * q * w * w * (z0 * 0.2);
        a.push([last[0] + (ox - last[0]) * bw, last[1] + (oy - last[1]) * bw, bz]); }
      // 4. bandeau, dans le prolongement
      for (j = 1; j <= 2; j++) a.push([ox * 0.995, oy * 0.995, -P.Hb * j / 2]);
      surf.push(a);
    }
    mesh(surf, fab, fab, faces, [cx * 0.5, 0, P.H * 0.3]);
    if (P.petales && o.unPetale) faces.forEach(function (f) {         // schéma : un pétale d'une autre couleur pour montrer les parties du béret
      var k = Math.round(((f.i + .5) / NA) * P.petales) % P.petales, nj = surf[0].length - 1;
      if (k === 0 && f.j < nj - 2) f.fill = shade(o.unPetale, f.ext ? f.lum : f.lum * 0.8);
    });
    if (P.petales && o.alterne) faces.forEach(function (f) {          // deux tissus en alternance, un pétale sur deux
      var k = Math.round(((f.i + .5) / NA) * P.petales) % P.petales, nj = surf[0].length - 1;
      if (f.j < nj - 2) f.fill = shade(o.alterne[k % 2], f.ext ? f.lum : f.lum * 0.8);
    });
    faces.sort(function (a, b) { return b.d - a.d; });
    function poly(S, fill) { out.push('<polygon points="' + S.map(function (p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }).join(' ') + '" fill="' + fill + '" stroke="' + fill + '" stroke-width=".08"/>'); }
    var hz = -P.Hb;                                             // la tête commence sous le bandeau
    out.push('<ellipse cx="0" cy="' + (24 - hz).toFixed(1) + '" rx="' + (P.R * 0.8).toFixed(1) + '" ry="1.6" fill="' + ink + '" opacity=".12"/>');
    var loin = faces.filter(function (f) { return f.d > 0 && !f.ext; }), pres = faces.filter(function (f) { return !(f.d > 0 && !f.ext); });
    loin.forEach(function (f) { poly(f.pts, f.fill); });
    var motifId = null;
    if (P.petales && o.motif && !o.rapide) {                       // écossais posé dans le plan du dessus, tourné à 45° de l'axe de chaque pétale :
      var c1 = o.motif[0], c2 = o.motif[1], c3 = o.motif[2] || '#f1e8d6';   // raccord en chevron exact sur les coutures
      motifId = 'tt' + (UID++);
      // coordonnées « à plat » de chaque sommet : distance le long du profil (dessus puis arrondi), dans la direction de l'angle
      var TX = surf.map(function (row, ii) { var t = 2 * Math.PI * ii / NA, acc = 0, o2 = [[0, 0]];
        for (var jj = 1; jj < row.length; jj++) { acc += Math.hypot(row[jj][0] - row[jj - 1][0], row[jj][1] - row[jj - 1][1], row[jj][2] - row[jj - 1][2]); o2.push([acc * Math.cos(t), acc * Math.sin(t)]); }
        return o2; });
      var defs = '<defs>';
      for (var kk = 0; kk < P.petales; kk++) defs += '<pattern id="' + motifId + '_' + kk + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(' + (360 * kk / P.petales + 45).toFixed(2) + ')">' +
        '<rect width="6" height="6" fill="' + c1 + '"/>' +
        '<rect x="0" y="1.2" width="6" height="1.4" fill="' + c2 + '" opacity=".6"/><rect x="1.2" y="0" width="1.4" height="6" fill="' + c2 + '" opacity=".6"/>' +
        '<rect x="0" y="4.4" width="6" height=".18" fill="' + c3 + '" opacity=".8"/><rect x="4.4" y="0" width=".18" height="6" fill="' + c3 + '" opacity=".8"/>' +
        '<rect x="0" y="3.4" width="6" height=".5" fill="#1d2a30" opacity=".35"/><rect x="3.4" y="0" width=".5" height="6" fill="#1d2a30" opacity=".35"/></pattern>';
      out.push(defs + '</defs>');
    }
    var AZt = AZ; if (o.teteDeFace) AZ = 0;                      // schéma : la tête reste de face quand on tourne le béret
    var T = tete(2 * P.r, 2 * P.r * 0.8, P.H + P.dome); AZ = AZt;
    var ty = (-P.Hb + 2).toFixed(2);
    T.forEach(function (dd) { out.push('<path d="' + dd + '" fill="' + head + '" transform="translate(0,' + (-hz * Math.cos(EL)).toFixed(2) + ')"/>'); });
    pres.forEach(function (f) {
      if (motifId && f.ext && f.j < 16) {
        var k = Math.round(((f.i + .5) / NA) * P.petales) % P.petales;
        poly(f.pts, f.fill);
        // projection affine tissu -> écran, à partir de trois sommets de la facette : le motif épouse le dessus et l'arrondi
        var i2 = (f.i + 1) % NA, A0 = TX[f.i][f.j], A1 = TX[i2][f.j], A3 = TX[f.i][f.j + 1], S0 = f.pts[0], S1 = f.pts[1], S3 = f.pts[3];
        var ux = A1[0] - A0[0], uy = A1[1] - A0[1], vx = A3[0] - A0[0], vy = A3[1] - A0[1], det = ux * vy - uy * vx;
        if (Math.abs(det) > 1e-6) {
          var px = S1.x - S0.x, py = S1.y - S0.y, qx = S3.x - S0.x, qy = S3.y - S0.y;
          var a = (px * vy - qx * uy) / det, c2 = (qx * ux - px * vx) / det, b = (py * vy - qy * uy) / det, d2 = (qy * ux - py * vx) / det;
          var e2 = S0.x - a * A0[0] - c2 * A0[1], f2 = S0.y - b * A0[0] - d2 * A0[1];
          var tp = [A0, A1, TX[i2][f.j + 1], A3];
          out.push('<polygon transform="matrix(' + [a, b, c2, d2, e2, f2].map(function (v) { return v.toFixed(4); }).join(' ') + ')" points="' + tp.map(function (q) { return q[0].toFixed(3) + ',' + q[1].toFixed(3); }).join(' ') + '" fill="url(#' + motifId + '_' + k + ')" stroke="url(#' + motifId + '_' + k + ')" stroke-width=".05"/>');
        }
        out.push('<polygon points="' + f.pts.map(function (p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }).join(' ') + '" fill="#000" stroke="#000" stroke-width=".06" stroke-opacity="' + (0.7 * (1 - f.lum)).toFixed(3) + '" opacity="' + (0.7 * (1 - f.lum)).toFixed(3) + '"/>');
      } else poly(f.pts, f.fill);
    });
    // coutures des pétales, sur le dessus (vu d'en haut)
    if (P.petales) for (var k = 0; k < P.petales; k++) {            // coutures (indices exacts seulement si NA est un multiple de 2 × pétales) des pétales : dessus et arrondi du bord
      var S = surf[Math.round((k + .5) * NA / P.petales) % NA].slice(0, 13).map(proj);
      out.push('<polyline points="' + S.map(function (p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }).join(' ') + '" fill="none" stroke="' + shade(fab, .6) + '" stroke-width=".14" stroke-linecap="round"/>');
    }
    if (P.petales) {                                               // bouton uni au centre du dessus
      var BR = (o.boutonD || 3) / 2;                               // bouton : 3 cm de diamètre par défaut
      var c0 = proj([cx, 0, P.H + P.dome + 0.35]), bc = o.bouton || shade(fab, .55), sy = Math.abs(Math.sin(EL)) * 0.9 + 0.1;
      out.push('<ellipse cx="' + c0.x.toFixed(2) + '" cy="' + (c0.y + 0.3).toFixed(2) + '" rx="' + (BR + 0.12).toFixed(2) + '" ry="' + ((BR + 0.12) * sy).toFixed(2) + '" fill="#000" opacity=".25"/>');
      out.push('<ellipse cx="' + c0.x.toFixed(2) + '" cy="' + (c0.y + 0.12).toFixed(2) + '" rx="' + BR.toFixed(2) + '" ry="' + (BR * sy + 0.3).toFixed(2) + '" fill="' + shade(bc, .75) + '"/>');
      out.push('<ellipse cx="' + c0.x.toFixed(2) + '" cy="' + c0.y.toFixed(2) + '" rx="' + BR.toFixed(2) + '" ry="' + (BR * sy + 0.15).toFixed(2) + '" fill="' + bc + '"/>');
      out.push('<ellipse cx="' + (c0.x - BR * 0.3).toFixed(2) + '" cy="' + (c0.y - BR * 0.25 * sy - 0.1).toFixed(2) + '" rx="' + (BR * 0.4).toFixed(2) + '" ry="' + (BR * 0.25 * sy + 0.1).toFixed(2) + '" fill="#fff" opacity=".35"/>');
    }
    var all = faces.map(function (f) { return f.pts; }).reduce(function (a, b) { return a.concat(b); }, []);
    var minx = Math.min.apply(null, all.map(function (p) { return p.x; })) - 2, maxx = Math.max.apply(null, all.map(function (p) { return p.x; })) + 2;
    var miny = Math.min.apply(null, all.map(function (p) { return p.y; })) - 2, maxy = 27;
    minx = Math.min(minx, -maxx); maxx = Math.max(maxx, -minx);
    sv.setAttribute('viewBox', [minx, miny, maxx - minx, maxy - miny].map(function (v) { return v.toFixed(1); }).join(' '));
    sv.innerHTML = out.join('');
    EL = EL0; AZ = AZ0;
  }
  window.Chapeau3D = { bob: bob, beret: beret };
})();
