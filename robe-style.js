/* Étape « Style » de la robe Béa : croquis qui change avec les choix.
   Les choix de style (jamais des mesures) sont gardés dans ce navigateur (localStorage). Rien n'est envoyé.
   Fournit window.SAH_STYLE_UI (lu par etapes.js) et window.ROBE_STYLE (lu par robe-bea.js). */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var KEY = 'robe_bea_style_v1';
  var T = EN ? {
    title: 'Your style', lead: 'Design a dress that suits you: the sketch shows each of your choices. The measurements come next.',
    len: 'Length', mini: 'Mini', moy: 'Midi', lon: 'Maxi',
    rall: 'Starting length (no adjustment): %b, from the top of the shoulder to the hem. With your setting: %t.', rall0: 'no adjustment',
    lenInfo: '%n: %d, from the top of the shoulder to the hem', lenHint: 'To check, measure a dress you like, or measure on yourself from the top of the shoulder, next to the neck, down to where you want the hem, then adjust with the length setting.',
    neck: 'Necklines', ed: 'Front neckline', eb: 'Back neckline', orig: 'as designed', low: 'lowered by %d', rai: 'raised by %d',
    bra: 'If you wear a bra, do not lower the back neckline by more than about 6 cm, or the strap will show.',
    poc: 'Pockets', pc: 'In the side seams', pp: 'Welt pockets', nb: 'Number', n1: 'One', n2: 'Two',
    ang: 'Opening', a0: 'Horizontal', a1: 'Slanted', a2: 'Steeply slanted', a3: 'Vertical', ppHint: 'Trickier to sew: a video guides you step by step.', ppTxt: 'Welt pockets are cut and sewn with the Welt pocket pattern. This button opens it already set for your dress: single welt, 14 cm opening angled at %a°, %c, 14 cm deep. On the dress front, the pattern marks where the opening goes: place the frame template there, with both ends of its window on the two short marks.', ppBtn: 'Create the pocket pattern', ppPair: 'a pair', ppOne: 'one pocket, on the right side when worn',
    face: 'Front', dos: 'Back', lr: ['right', 'left'], rl: ['left', 'right'], alt: 'Sketch of the dress',
    rl_: 'Length', re: 'Front neckline', rb: 'Back neckline', rp: 'Pockets', cm: 'cm'
  } : {
    title: 'Votre style', lead: 'Composez une robe qui vous ressemble : le croquis intègre chacun de vos choix. Viennent ensuite les mesures.',
    len: 'Longueur', mini: 'Mini', moy: 'Moyenne', lon: 'Longue',
    rall: 'Longueur de départ (sans rallonge) : %b, du haut de l’épaule au bas de la robe. Avec votre réglage : %t.', rall0: 'sans rallonge',
    lenInfo: '%n : %d, du haut de l’épaule au bas de la robe', lenHint: 'Pour vérifier, mesurez une robe que vous aimez, ou mesurez sur vous du haut de l’épaule, au ras du cou, jusqu’à l’endroit voulu, puis corrigez avec la rallonge.',
    neck: 'Encolures', ed: 'Encolure devant', eb: 'Encolure dos', orig: 'd’origine', low: 'descendue de %d', rai: 'remontée de %d',
    bra: 'Si vous portez un soutien-gorge, ne descendez pas l’encolure dos de plus de 6 cm environ : l’attache deviendrait visible.',
    poc: 'Poches', pc: 'Dans les coutures de côté', pp: 'Passepoilées', nb: 'Nombre', n1: 'Une', n2: 'Deux',
    ang: 'Ouverture', a0: 'Horizontale', a1: 'Inclinée', a2: 'Très inclinée', a3: 'Verticale', ppHint: 'Plus délicates à coudre : une vidéo vous guide pas à pas.', ppTxt: 'Les poches passepoilées se coupent et se cousent avec le patron Poches passepoilées. Ce bouton l’ouvre déjà réglé pour votre robe : un passepoil, ouverture de 14 cm inclinée à %a°, %c, profondeur 14 cm. Sur le devant de la robe, le patron marque l’emplacement de l’ouverture : posez-y le cache du cadre, les deux bouts de sa fenêtre sur les deux petits traits.', ppBtn: 'Créer le patron des poches', ppPair: 'une paire', ppOne: 'une poche, côté droit une fois la robe portée',
    face: 'Face', dos: 'Dos', lr: ['droite', 'gauche'], rl: ['gauche', 'droite'], alt: 'Croquis de la robe',
    rl_: 'Longueur', re: 'Encolure devant', rb: 'Encolure dos', rp: 'Poches', cm: 'cm'
  };
  var K = { mini: 1, moyenne: 1.55, longue: 2.3 };
  var ANG = { 0: T.a0, 41.3: T.a1, 65: T.a2, 90: T.a3 };
  var DEF = { longueur: 'mini', ed: 0, eb: 0, poche: 'cote', nb: 1, ang: 41.3 };
  function lsGet() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function lsDel() { try { localStorage.removeItem(KEY); } catch (e) { } }
  var st = {}; Object.keys(DEF).forEach(function (k) { st[k] = DEF[k]; });
  var saved = lsGet(); if (saved) Object.keys(DEF).forEach(function (k) { if (saved[k] !== undefined) st[k] = saved[k]; });
  window.ROBE_STYLE = st; window.ROBE_K = K;

  var root = null, view = 'face';
  var $ = function (id) { return (root && root.querySelector('[id="' + id + '"]')) || document.getElementById(id); };
  function dist(cm) {
    cm = Math.abs(cm);
    if (window.UNITS && window.UNITS.mode() === 'in') return window.UNITS.fmtCm(cm);
    return String(cm).replace('.', EN ? '.' : ',') + ' ' + T.cm;
  }
  function neckTxt(v) { v = +v; return v === 0 ? T.orig : (v > 0 ? T.low : T.rai).replace('%d', dist(v)); }
  function chips(name, list) {
    return '<div class="chips">' + list.map(function (x) {
      return '<label class="chip"><input type="radio" name="st-' + name + '" id="st-' + name + '-' + x[0] + '" value="' + x[0] + '"><span>' + x[1] + '</span></label>';
    }).join('') + '</div>';
  }
  function slider(id, label, mn, mx) {
    return '<div class="rb-sl"><label for="st-' + id + '"><span>' + label + '</span> <output id="st-' + id + '-v"></output></label>' +
      '<input type="range" id="st-' + id + '" min="' + mn + '" max="' + mx + '" step="1" value="0"></div>';
  }
  function lenLabel() {
    var e = document.getElementById('v_M_LongueurDevantTaille'), m = e ? parseFloat(e.value) : NaN; if (!(m > 0)) m = 40;
    var r = document.getElementById('v_P_Rallonge'), ra = r ? parseFloat(r.value) : 0; if (!isFinite(ra)) ra = 0;
    var tot = Math.round(m * (1 + K[st.longueur]) + ra);
    var nm = ({ mini: T.mini, moyenne: T.moy, longue: T.lon })[st.longueur];
    var d = (window.UNITS && window.UNITS.mode() === 'in') ? window.UNITS.fmtCm(tot) : tot + ' ' + T.cm;
    return T.lenInfo.replace('%n', nm).replace('%d', d);
  }

  function rallHint() {
    var e = document.getElementById('v_M_LongueurDevantTaille'), m = e ? parseFloat(e.value) : NaN; if (!(m > 0)) m = 40;
    var r = document.getElementById('v_P_Rallonge'), ra = r ? parseFloat(r.value) : 0; if (!isFinite(ra)) ra = 0;
    var b = Math.round(m * (1 + K[st.longueur])), f = function (v) { return (window.UNITS && window.UNITS.mode() === 'in') ? window.UNITS.fmtCm(v) : v + ' ' + T.cm; };
    var h = document.getElementById('st-rallhint'), w = document.getElementById('w_P_Rallonge');
    if (!w) return;
    if (!h) { h = document.createElement('p'); h.className = 'hint'; h.id = 'st-rallhint'; h.style.margin = '2px 0 6px'; h.style.fontWeight = 'normal'; var lb = w.querySelector('label'); if (lb && lb.nextSibling) w.insertBefore(h, lb.nextSibling); else w.appendChild(h); }
    h.textContent = T.rall.replace('%b', f(b)).replace('%t', f(Math.round(b + ra)));
  }
  var sk = document.createElement('div');
  sk.className = 'card sticky cq'; sk.id = 'sketchcard';
  sk.innerHTML = '<div class="cq-views" role="group"><button type="button" id="st-vf" aria-pressed="true">' + T.face + '</button><button type="button" id="st-vd" aria-pressed="false">' + T.dos + '</button></div>' +
    '<svg id="st-svg" class="cq-svg rb-svg" viewBox="230 -10 340 720" role="img" aria-label="' + T.alt + '"></svg><div class="cq-leg" id="st-leg"></div>';
  var prevCard = document.querySelector('.grid > .card.sticky');
  if (prevCard) prevCard.parentNode.insertBefore(sk, prevCard);

  function build(sec) {
    var h = '<div class="cq-form">' +
      '<fieldset><legend>' + T.len + '</legend>' + chips('long', [['mini', T.mini], ['moyenne', T.moy], ['longue', T.lon]]) + '<p class="hint" id="st-lenv"></p><p class="hint">' + T.lenHint + '</p></fieldset>' +
      '<fieldset><legend>' + T.neck + '</legend>' + slider('ed', T.ed, -5, 4) + slider('eb', T.eb, -12, 8) + '<p class="hint">' + T.bra + '</p></fieldset>' +
      '<fieldset><legend>' + T.poc + '</legend>' + chips('poc', [['cote', T.pc], ['passepoil', T.pp]]) +
      '<div id="st-pp"><p class="hint">' + T.ppHint + '</p><h3>' + T.nb + '</h3>' + chips('nb', [['1', T.n1], ['2', T.n2]]) +
      '<h3>' + T.ang + '</h3>' + chips('ang', [['0', T.a0], ['41.3', T.a1], ['65', T.a2], ['90', T.a3]]) + '<div id="st-ppbox" class="ppbox"><p id="st-pptxt"></p><p><a id="st-ppgo" class="btn" href="poches-passepoilees.html">' + T.ppBtn + '</a></p></div></div></fieldset></div>';
    root = sec;
    var h2 = sec.querySelector('h2'); if (h2) h2.insertAdjacentHTML('beforebegin', '<p class="cq-lead">' + T.lead + '</p>'); else sec.insertAdjacentHTML('afterbegin', '<p class="cq-lead">' + T.lead + '</p>');
    sec.insertAdjacentHTML('beforeend', h);
    sec.addEventListener('change', onChange);
    sec.addEventListener('input', onInput);
    $('st-vf').onclick = function () { setView('face'); };
    $('st-vd').onclick = function () { setView('dos'); };
    applyDom(); render();
  }
  function setView(v) { view = v; $('st-vf').setAttribute('aria-pressed', String(v === 'face')); $('st-vd').setAttribute('aria-pressed', String(v === 'dos')); render(); }
  function rad(n, v) { var e = $('st-' + n + '-' + v); if (e) e.checked = true; }
  function applyDom() {
    rad('long', st.longueur); rad('poc', st.poche); rad('nb', String(st.nb)); rad('ang', String(st.ang));
    $('st-ed').value = st.ed; $('st-eb').value = st.eb;
  }
  function checked(n) { var e = root.querySelector('input[name="st-' + n + '"]:checked'); return e ? e.value : null; }
  function readDom() {
    st.longueur = checked('long') || 'mini'; st.poche = checked('poc') || 'cote';
    st.nb = +(checked('nb') || 1); st.ang = +(checked('ang') || 41.3);
    st.ed = +$('st-ed').value; st.eb = +$('st-eb').value;
  }
  function onChange(e) {
    var t = e.target, n = t.name || '';
    if (n === 'st-poc' || n === 'st-nb' || n === 'st-ang' || n === 'st-long') view = 'face';
    render(true);
  }
  function onInput(e) {
    var t = e.target;
    if (t.id === 'st-eb') view = 'dos'; else if (t.id === 'st-ed') view = 'face'; else return;
    render(true);
  }
  /* encadré : lien vers le patron Poches passepoilées, déjà réglé (un passepoil, ouverture de 14 cm) */
  function ppHref() {
    var sm = document.getElementById('v_seam'), seam = sm && sm.value !== '' && !isNaN(parseFloat(sm.value)) ? parseFloat(sm.value) : 1;
    return 'poches-passepoilees.html?type=simple&L=14&ang=' + st.ang + '&cote=' + (st.nb === 2 ? 'paire' : 'droite') + '&lev=1.5&prof=14&seam=' + seam;
  }
  function ppBox() {
    var t = $('st-pptxt'), a = $('st-ppgo'); if (!t || !a) return;
    t.textContent = T.ppTxt.replace('%a', String(st.ang).replace('.', EN ? '.' : ',')).replace('%c', st.nb === 2 ? T.ppPair : T.ppOne);
    a.href = ppHref();
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'v_seam') ppBox(); });
  document.addEventListener('click', function (e) { var a = e.target && e.target.closest && e.target.closest('#st-ppgo'); if (a) a.href = ppHref(); });
  function render(fromUser) {
    if (!root) return;
    readDom();
    $('st-pp').hidden = st.poche !== 'passepoil';
    ppBox();
    $('st-ed-v').textContent = neckTxt(st.ed); $('st-eb-v').textContent = neckTxt(st.eb);
    $('st-lenv').textContent = lenLabel(); rallHint();
    $('st-vf').setAttribute('aria-pressed', String(view === 'face')); $('st-vd').setAttribute('aria-pressed', String(view === 'dos'));
    lsSet(st);
    window.CroquisRobe.draw($('st-svg'), { vue: view, longueur: st.longueur, encolureDevant: st.ed, encolureDos: st.eb, poche: st.poche, nbPoches: st.nb, anglePoche: st.ang });
    var s = $('st-svg'); s.setAttribute('aria-label', T.alt + ' : ' + s.getAttribute('aria-label'));
    $('st-leg').innerHTML = '<span>' + (view === 'face' ? T.lr : T.rl).join('</span><span>') + '</span>';
    if (fromUser) window.dispatchEvent(new Event('sah-style'));
  }
  document.addEventListener('input', function (ev) { var i = ev.target && ev.target.id; if (i === 'v_M_LongueurDevantTaille' || i === 'v_P_Rallonge') { if (root) { $('st-lenv').textContent = lenLabel(); rallHint(); } } });
  document.addEventListener('unitschange', function () { if (root) render(); });

  window.SAH_STYLE_UI = {
    title: T.title, build: build, fromUrl: false,
    share: function () { return { v: st, d: DEF }; },
    setShare: function (s) { s = s || {}; Object.keys(DEF).forEach(function (k) { st[k] = s[k] !== undefined ? s[k] : DEF[k]; }); if (root) { applyDom(); render(true); } },
    reset: function () { lsDel(); Object.keys(DEF).forEach(function (k) { st[k] = DEF[k]; }); if (root) { applyDom(); render(true); } },
    recap: function () {
      var rows = [];
      rows.push([T.rl_, lenLabel().split(',')[0]]);
      rows.push([T.re, neckTxt(st.ed)]); rows.push([T.rb, neckTxt(st.eb)]);
      var p = st.poche === 'cote' ? T.pc : T.pp + ' : ' + (st.nb === 2 ? T.n2 : T.n1).toLowerCase() + ', ' + (ANG[st.ang] || '').toLowerCase();
      rows.push([T.rp, p]);
      return rows;
    },
    links: function () { return []; },
    cartPdf: function () { },
    smalls: function () { return { title: '', intro: '', dl: '', items: [] }; },
    sepLabel: ''
  };
})();
