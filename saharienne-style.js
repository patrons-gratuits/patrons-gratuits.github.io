/* Étape « Style » du formulaire de la saharienne : croquis qui change avec les choix, présélection par l'adresse.
   Les choix de style (jamais des mesures) sont gardés dans ce navigateur (localStorage). Rien n'est envoyé. */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var PV = window.SAH_PAGE_VER === 'd' ? 'd' : 's';
  var KEY = 'sahariennes_style_v1';
  var T = EN ? {
    title: 'Your style', lead: 'Start by designing your jacket: every choice changes the drawing. The measurements come next.',
    ver: 'Version', s: 'Simple', d: 'Lined', hs: 'One layer, the quickest to sew.', hd: 'Lining and interfacing, for mid-season.',
    sleeves: 'Sleeves and slits', ml: 'Long sleeves', mc: 'Short sleeves', mcn: 'Short sleeves are available on the simple jacket only.',
    slits: 'Slits', f0: 'None', fc: 'Side', fd: 'Back', soon: 'soon',
    small: 'Small pieces', emp: 'Shoulder yoke', epa: 'Epaulettes', pat: 'Sleeve tabs', pmc: 'Sleeve pockets', empn: 'The shoulder yoke belongs to the lined jacket.',
    cart: 'Pen and glasses holder', cart_h: 'Pen and glasses holder, instead of a chest pocket.', c0: 'None', cg: 'For right-handers (left side)', cd: 'For left-handers (right side)',
    cart_n: 'It sits on the side opposite the writing hand: the gesture is more natural, with less arm twist. Right and left are as worn.',
    chest: 'Chest pockets', same: 'Same choice on both sides', right: 'Right side, as worn', left: 'Left side, as worn', low: 'Lower pockets',
    t0: 'None', tp: 'No gusset', tc: 'Centre gusset', tl: 'Side gussets', td: 'Double gusset', tk: 'Pen and glasses holder', flap: 'With flap',
    gus: 'Centre gusset', gi: 'inwards', ge: 'outwards',
    flaps: 'Flap shape', fp: 'Pointed', fdr: 'Straight', fa: 'Rounded', fcc: 'Cut corners', flaps_h: 'The same shape for all the flaps on the jacket.',
    face: 'Front', dos: 'Back', lr: ['right (wearer)', 'left (wearer)'], rl: ['left (wearer)', 'right (wearer)'], alt: 'Sketch of the safari jacket',
    sum: 'Your jacket:', simple: 'Simple jacket', lined: 'Lined jacket', long: 'long sleeves', short: 'short sleeves', noslit: 'no slits', sslit: 'side slits', bslit: 'back slit',
    yoke: 'shoulder yoke', epaul: 'epaulettes', tabs: 'sleeve tabs', spock: 'sleeve pockets', flapsOf: 'flaps ', fpn: 'pointed', fdn: 'straight', fan: 'rounded', fcn: 'with cut corners',
    chestP: 'chest pockets: ', rchest: 'right chest: ', lchest: 'left chest: ', lowP: 'lower pockets: ', none: 'none', holder: 'pen and glasses holder', wflap: ' with flap', nflap: ' without flap',
    inw: ' folded inwards', outw: ' folded outwards',
    links: 'You will be able to customise each small piece at the end.', smTitle: 'Going further: customise each piece', smIntro: 'Dimensions, flaps, corners, gussets… Each piece opens on its own page, already set to your choices, with its own PDF.', smDl: 'Customise',
    lEpa: 'Epaulettes', lPat: 'Sleeve tabs', lPmc: 'Sleeve pockets', lCart: 'Pen and glasses holder', lCh: 'Chest pockets', lLow: 'Lower pockets',
    rv: 'Version', rm: 'Sleeves', rf: 'Slits', rs: 'Small pieces', rr: 'Flaps', rch: 'Chest pockets', rlo: 'Lower pockets', rc: 'Pen and glasses holder',
    sep: 'To download separately:'
  } : {
    title: 'Votre style', lead: 'Commencez par composer votre saharienne : chaque choix change le dessin. Les mesures viennent ensuite.',
    ver: 'Version', s: 'Simple', d: 'Doublée', hs: 'Une épaisseur, la plus rapide à coudre.', hd: 'Doublure et entoilage, pour la mi-saison.',
    sleeves: 'Manches et fentes', ml: 'Manches longues', mc: 'Manches courtes', mcn: 'Les manches courtes sont proposées pour la saharienne simple.',
    slits: 'Fentes', f0: 'Aucune', fc: 'De côté', fd: 'De dos', soon: 'bientôt',
    small: 'Petites pièces', emp: 'Pièce d’épaule', epa: 'Épaulettes', pat: 'Pattes de manches', pmc: 'Poches de manches', empn: 'La pièce d’épaule est propre à la saharienne doublée.',
    cart: 'Cartouchière', cart_h: 'Porte-stylos et lunettes, à la place d’une poche de poitrine.', c0: 'Aucune', cg: 'Pour droitier (à gauche)', cd: 'Pour gaucher (à droite)',
    cart_n: 'Elle se place du côté opposé à la main qui écrit : le geste est plus naturel, avec moins de torsion du bras. Droite et gauche s’entendent une fois la veste portée.',
    chest: 'Poches de poitrine', same: 'Même choix des deux côtés', right: 'Côté droit, une fois la veste portée', left: 'Côté gauche, une fois la veste portée', low: 'Poches du bas',
    t0: 'Aucune', tp: 'Sans soufflet', tc: 'Soufflet central', tl: 'Soufflets latéraux', td: 'Double soufflet', tk: 'Cartouchière', flap: 'Avec rabat',
    gus: 'Soufflet central', gi: 'vers l’intérieur', ge: 'vers l’extérieur',
    flaps: 'Forme des rabats', fp: 'En pointe', fdr: 'Droit', fa: 'Arrondi', fcc: 'Angles coupés', flaps_h: 'La même forme pour tous les rabats de la veste.',
    face: 'Face', dos: 'Dos', lr: ['droite (porteur)', 'gauche (porteur)'], rl: ['gauche (porteur)', 'droite (porteur)'], alt: 'Croquis de la saharienne',
    sum: 'Votre saharienne :', simple: 'Saharienne simple', lined: 'Saharienne doublée', long: 'manches longues', short: 'manches courtes', noslit: 'sans fente', sslit: 'fentes de côté', bslit: 'fente de dos',
    yoke: 'pièce d’épaule', epaul: 'épaulettes', tabs: 'pattes de manches', spock: 'poches de manches', flapsOf: 'rabats ', fpn: 'en pointe', fdn: 'droits', fan: 'arrondis', fcn: 'à angles coupés',
    chestP: 'poches de poitrine : ', rchest: 'poitrine droite : ', lchest: 'poitrine gauche : ', lowP: 'poches du bas : ', none: 'aucune', holder: 'cartouchière', wflap: ' à rabat', nflap: ' sans rabat',
    inw: ' tourné vers l’intérieur', outw: ' tourné vers l’extérieur',
    links: 'Vous pourrez personnaliser chaque petite pièce à la fin.', smTitle: 'Aller plus loin : personnaliser chaque pièce', smIntro: 'Dimensions, revers, coins, forme du rabat… Chaque pièce s’ouvre sur sa propre page, déjà réglée selon vos choix, avec son PDF.', smDl: 'Personnaliser',
    lEpa: 'Épaulettes', lPat: 'Pattes de manches', lPmc: 'Poches de manches', lCart: 'Cartouchière', lCh: 'Poches de poitrine', lLow: 'Poches du bas',
    rv: 'Version', rm: 'Manches', rf: 'Fentes', rs: 'Petites pièces', rr: 'Rabats', rch: 'Poches de poitrine', rlo: 'Poches du bas', rc: 'Cartouchière',
    sep: 'À télécharger séparément :'
  };
  var root = null;
  var $ = function (id) { return (root && root.querySelector('[id="' + id + '"]')) || document.getElementById(id); };
  var I = function (id) { return $('st-' + id); };
  var val = function (n) { var e = (root || document).querySelector('input[name="st-' + n + '"]:checked'); return e ? e.value : null; };
  var TYPES = [['0', T.t0], ['p', T.tp], ['c', T.tc], ['l', T.tl], ['d', T.td]];
  var PAGES = { p: 'poches-simple.html', c: 'poches-soufflet-central.html', l: 'poches-soufflets-lateraux.html', d: 'poches-double-soufflet.html' };

  var DEF = { man: 'l', fen: '0', emp: PV === 'd', epa: true, pat: true, pmc: true, cart: '0', same: true, ps: 'c', psr: true, pss: 'i', pd: 'c', pdr: true, pds: 'i', pg: 'c', pgr: true, pgs: 'i', pb: 'l', pbr: true, pbs: 'i', rab: 'p' };
  function lsGet() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function lsDel() { try { localStorage.removeItem(KEY); } catch (e) { } }

  var st = {}; Object.keys(DEF).forEach(function (k) { st[k] = DEF[k]; });
  var saved = lsGet(); if (saved) Object.keys(DEF).forEach(function (k) { if (saved[k] !== undefined) st[k] = saved[k]; });
  /* adresse : ?manches=courtes&cartouchiere=gauche&rabats=arrondi (des choix de style, jamais des mesures) */
  var fromUrl = false;
  try {
    var q = new URLSearchParams(location.search), m = q.get('manches'), c = q.get('cartouchiere'), r = q.get('rabats');
    if (m === 'courtes' || m === 'longues') { st.man = m === 'courtes' ? 'c' : 'l'; fromUrl = true; }
    if (c === 'gauche') { st.cart = 'g'; st.same = false; st.pg = 'k'; st.pd = st.ps; st.pdr = st.psr; st.pds = st.pss; fromUrl = true; }
    if (c === 'aucune') { st.cart = '0'; if (st.pg === 'k') st.pg = st.ps; if (st.pd === 'k') st.pd = st.ps; fromUrl = true; }
    var RB = { pointe: 'p', droit: 'd', arrondi: 'a', coupe: 'c' }; if (RB[r]) { st.rab = RB[r]; fromUrl = true; }
  } catch (e) { }
  if (st.same && (st.pd === 'k' || st.pg === 'k')) st.same = false;
  if (PV === 'd') st.man = 'l'; else st.emp = false;
  window.SAH_STYLE = { man: 'l', fen: '0' };

  var view = 'face';
  var sk = document.createElement('div');
  sk.className = 'card sticky cq'; sk.id = 'sketchcard';
  sk.innerHTML = '<div class="cq-views" role="group"><button type="button" id="st-vf" aria-pressed="true">' + T.face + '</button><button type="button" id="st-vd" aria-pressed="false">' + T.dos + '</button></div>' +
    '<svg id="st-svg" class="cq-svg" viewBox="50 30 300 345" role="img" aria-label="' + T.alt + '"></svg><div class="cq-leg" id="st-leg"></div>';
  var prevCard = document.querySelector('.grid > .card.sticky');
  if (prevCard) prevCard.parentNode.insertBefore(sk, prevCard);

  function chips(name, list, extra) {
    return '<div class="chips">' + list.map(function (x) {
      return '<label class="chip"><input type="radio" name="st-' + name + '" id="st-' + name + '-' + x[0] + '" value="' + x[0] + '"' + (x[2] ? ' disabled' : '') + '><span>' + x[1] + '</span></label>';
    }).join('') + '</div>';
  }
  function pocketGroup(key, title, withCart) {
    var list = TYPES.slice(); if (withCart) list.push(['k', T.tk]);
    var souf = '<span class="souf" id="st-' + key + '-soufbox">' +
      '<label class="chip"><input type="radio" name="st-' + key + '-souf" id="st-' + key + '-souf-i" value="i"><span>' + T.gi + '</span></label>' +
      '<label class="chip"><input type="radio" name="st-' + key + '-souf" id="st-' + key + '-souf-e" value="e"><span>' + T.ge + '</span></label></span>';
    return '<div>' + (title ? '<h3>' + title + '</h3>' : '') + chips(key, list).replace(/<\/div>$/, souf + '</div>') +
      '<div class="chips" style="margin-top:6px"><label class="chip"><input type="checkbox" id="st-' + key + '-rab"><span>' + T.flap + '</span></label></div></div>';
  }
  function chk(id, label) { return '<label class="chip"><input type="checkbox" id="st-' + id + '"><span>' + label + '</span></label>'; }

  function build(sec) {
    var h = '<p class="cq-lead">' + T.lead + '</p><div class="cq-form">' +
      '<fieldset><legend>' + T.ver + '</legend>' + chips('ver', [['s', T.s], ['d', T.d]]) + '<p class="hint" id="st-verhint"></p></fieldset>' +
      '<fieldset><legend>' + T.sleeves + '</legend>' + chips('man', [['l', T.ml], ['c', T.mc]]) + '<p class="hint" id="st-manhint" hidden>' + T.mcn + '</p>' +
      '<div class="sub"><h3>' + T.slits + '</h3>' + chips('fen', [['0', T.f0], ['c', T.fc, 0], ['d', T.fd, 0]]) + '</div></fieldset>' +
      '<fieldset><legend>' + T.small + '</legend><div class="chips">' + chk('emp', T.emp) + chk('epa', T.epa) + chk('pat', T.pat) + chk('pmc', T.pmc) + '</div><p class="hint" id="st-emphint" hidden>' + T.empn + '</p></fieldset>' +
      '<fieldset><legend>' + T.cart + '</legend><p class="hint">' + T.cart_h + '</p>' + chips('cart', [['0', T.c0], ['g', T.cg], ['d', T.cd]]) + '<p class="hint">' + T.cart_n + '</p></fieldset>' +
      '<fieldset><legend>' + T.chest + '</legend><label class="check"><input type="checkbox" id="st-same"> ' + T.same + '</label>' +
      '<div id="st-pSame">' + pocketGroup('ps', '', false) + '</div><div id="st-pSides" hidden><div class="sub">' + pocketGroup('pd', T.right, true) + '</div><div class="sub">' + pocketGroup('pg', T.left, true) + '</div></div></fieldset>' +
      '<fieldset><legend>' + T.low + '</legend>' + pocketGroup('pb', '', false) + '</fieldset>' +
      '<fieldset><legend>' + T.flaps + '</legend>' + chips('rab', [['p', T.fp], ['d', T.fdr], ['a', T.fa], ['c', T.fcc]]) + '<p class="hint">' + T.flaps_h + '</p></fieldset>' +
      '<div class="summary" id="st-sum"></div><p class="cq-links" id="st-links"></p></div>';
    root = sec; sec.insertAdjacentHTML('beforeend', h);
    sec.addEventListener('change', onChange);
    $('st-vf').onclick = function () { setView('face'); };
    $('st-vd').onclick = function () { setView('dos'); };
    var ob = $('opt_epaule'); if (ob) ob.addEventListener('change', function () { if (I('emp').checked !== ob.checked) { I('emp').checked = ob.checked; render(); } });
    applyDom(); render();
  }
  function setView(v) { view = v; $('st-vf').setAttribute('aria-pressed', String(v === 'face')); $('st-vd').setAttribute('aria-pressed', String(v === 'dos')); render(); }

  function applyDom() {
    function rad(n, v) { var e = I(n + '-' + v); if (e) e.checked = true; }
    rad('ver', PV); rad('man', st.man); rad('fen', st.fen); rad('cart', st.cart); rad('rab', st.rab);
    ['ps', 'pd', 'pg', 'pb'].forEach(function (k) { rad(k, st[k]); rad(k + '-souf', st[k + 's']); I(k + '-rab').checked = !!st[k + 'r']; });
    ['emp', 'epa', 'pat', 'pmc', 'same'].forEach(function (k) { I(k).checked = !!st[k]; });
  }
  function readDom() {
    var o = { man: val('man') || 'l', fen: val('fen') || '0', cart: val('cart') || '0', rab: val('rab') || 'p', same: I('same').checked };
    ['emp', 'epa', 'pat', 'pmc'].forEach(function (k) { o[k] = I(k).checked; });
    ['ps', 'pd', 'pg', 'pb'].forEach(function (k) { o[k] = val(k) || '0'; o[k + 'r'] = I(k + '-rab').checked; o[k + 's'] = val(k + '-souf') || 'i'; });
    return o;
  }
  function onChange(e) {
    var t = e.target;
    /* bascule automatique : fente de dos -> Dos ; poches, rabats, cartouchière -> Face */
    var key = (t.name || t.id || '').replace(/^st-/, '');
    if (key === 'fen' && t.value === 'd') { if (view !== 'dos') setView('dos'); }
    else if (/^(ps|pd|pg|pb|cart|rab|same)/.test(key) && view !== 'face') setView('face');
    if (t.name === 'st-ver') { if (t.value !== PV) { persist(readDom()); location.href = t.value === 'd' ? 'saharienne-doublee.html' : 'saharienne.html'; } return; }
    if (t.name === 'st-cart') {
      var c = val('cart'), base = val('ps') || 'c', set = function (k, v) { I(k + '-' + v).checked = true; };
      if (c === '0') { if (val('pd') === 'k') set('pd', base); if (val('pg') === 'k') set('pg', base); }
      else {
        if (I('same').checked) { set('pd', base); set('pg', base); I('pd-rab').checked = I('ps-rab').checked; I('pg-rab').checked = I('ps-rab').checked; }
        I('same').checked = false;
        if (c === 'd') { set('pd', 'k'); if (val('pg') === 'k') set('pg', base); } else { set('pg', 'k'); if (val('pd') === 'k') set('pd', base); }
      }
    }
    render();
  }
  function persist(o) {
    var s = {}, prev = lsGet() || {}; Object.keys(DEF).forEach(function (k) { s[k] = o[k]; });
    /* les choix propres à l'autre version sont conservés quand on passe de l'une à l'autre */
    if (PV === 's') s.emp = prev.emp !== undefined ? prev.emp : true; else s.man = prev.man !== undefined ? prev.man : 'l';
    lsSet(s);
  }
  var NAMES = { p: T.tp, c: T.tc, l: T.tl, d: T.td };
  function pk(t, r, sn) {
    if (t === '0') return T.none; if (t === 'k') return T.holder;
    var n = NAMES[t].toLowerCase();
    if (t === 'c' || t === 'd') n += (sn === 'e' ? T.outw : T.inw);
    return n + (r ? T.wflap : T.nflap);
  }
  var shortRead = null;
  function render() {
    var o = readDom();
    /* cohérence cartouchière / poches de poitrine */
    var sm = o.same;
    I((!sm && o.pd === 'k') ? 'cart-d' : (!sm && o.pg === 'k') ? 'cart-g' : 'cart-0').checked = true; o.cart = val('cart');
    I('same').disabled = o.cart !== '0';
    I('pg-k').disabled = o.pd === 'k'; I('pd-k').disabled = o.pg === 'k';
    ['ps', 'pd', 'pg', 'pb'].forEach(function (k) { var t = val(k); I(k + '-rab').disabled = (t === '0' || t === 'k'); var sb = I(k + '-soufbox'); sb.hidden = !(t === 'c' || t === 'd'); if (!sb.hidden) { var lab = I(k + '-' + t).closest('label'); if (lab.nextSibling !== sb) lab.after(sb); } });
    $('st-pSame').hidden = !I('same').checked; $('st-pSides').hidden = I('same').checked;
    /* version : simple / doublée */
    $('st-verhint').textContent = PV === 's' ? T.hs : T.hd;
    I('man-c').disabled = PV === 'd'; $('st-manhint').hidden = PV !== 'd';
    if (PV === 'd' && o.man === 'c') { I('man-l').checked = true; o.man = 'l'; }
    I('emp').disabled = PV === 's'; $('st-emphint').hidden = PV !== 's';
    if (PV === 's' && o.emp) { I('emp').checked = false; o.emp = false; }
    var o2 = readDom(); o2.cart = o.cart; o = o2;
    o.ver = PV;
    /* lien avec le calcul du patron */
    var changed = window.SAH_STYLE.man !== o.man || window.SAH_STYLE.fen !== o.fen;
    window.SAH_STYLE.man = o.man; window.SAH_STYLE.fen = o.fen;
    var ob = $('opt_epaule'); if (PV === 'd' && ob && ob.checked !== o.emp) { ob.checked = o.emp; ob.dispatchEvent(new Event('change', { bubbles: true })); }
    var g = document.querySelector('.grp[value="manches"]');
    if (g) { var lab = g.parentNode, txt = o.man === 'c' ? window.SAH_LBL_SHORT : window.SAH_LBL_LONG; if (txt && lab.lastChild && lab.lastChild.nodeType === 3) lab.lastChild.textContent = ' ' + txt; if (changed) g.dispatchEvent(new Event('change', { bubbles: true })); }
    persist(o);
    window.SahCroquis.draw($('st-svg'), o, o.rab, view);
    $('st-leg').innerHTML = '<span>' + (view === 'face' ? T.lr : T.rl).join('</span><span>') + '</span>';
    /* résumé */
    var RB = { p: T.fpn, d: T.fdn, a: T.fan, c: T.fcn };
    var parts = [PV === 's' ? T.simple : T.lined, o.man === 'l' ? T.long : T.short, o.fen === '0' ? T.noslit : (o.fen === 'c' ? T.sslit : T.bslit)];
    if (o.emp) parts.push(T.yoke); if (o.epa) parts.push(T.epaul); if (o.pat) parts.push(T.tabs); if (o.pmc) parts.push(T.spock);
    parts.push(T.flapsOf + RB[o.rab]);
    var poit = o.same ? T.chestP + pk(o.ps, o.psr, o.pss) : T.rchest + pk(o.pd, o.pdr, o.pds) + ' ; ' + T.lchest + pk(o.pg, o.pgr, o.pgs);
    var sumTxt = parts.join(', ') + ' ; ' + poit + ' ; ' + T.lowP + pk(o.pb, o.pbr, o.pbs) + '.';
    $('st-sum').innerHTML = '<b>' + T.sum + '</b> ' + sumTxt;
    last = { o: o, parts: parts, poit: poit, sum: sumTxt };
    /* liens vers les pages dédiées */
    var L = [], SM = [];
    function add(href, label) { SM.push({ href: href, label: label }); L.push('<a href="' + href + '" target="_blank" rel="noopener">' + label + '</a>'); }
    if (o.epa) add('epaulettes.html', T.lEpa); if (o.pat) add('pattes-manches.html', T.lPat); if (o.pmc) add('poches-simple.html', T.lPmc);
    var hasCart = o.pd === 'k' || o.pg === 'k'; if (hasCart) add('cartouchiere.html', T.lCart);
    var seen = {};
    function pq(t, r, sn) { var q = []; if (r) { var m = { d: 'rect', a: 'round', c: 'cut' }[o.rab]; if (m) q.push('rabat=' + m); } if ((t === 'c' || t === 'd') && sn) q.push('pli=' + (sn === 'e' ? 'e' : 'i')); return PAGES[t] + (q.length ? '?' + q.join('&') : ''); }
    function addP(t, r, sn, pre) { if (!PAGES[t]) return; var label = pre + ' (' + NAMES[t].toLowerCase() + ')'; var h = pq(t, r, sn); if (seen[h]) return; seen[h] = 1; add(h, label); }
    if (o.same) addP(o.ps, o.psr, o.pss, T.lCh);
    else { addP(o.pd, o.pdr, o.pds, T.lCh); addP(o.pg, o.pgr, o.pgs, T.lCh); }
    addP(o.pb, o.pbr, o.pbs, T.lLow);
    lastLinks = L; lastSmall = SM;
    $('st-links').innerHTML = L.length ? T.links : '';
  }
  var last = null, lastLinks = [], lastSmall = [];

  window.SAH_STYLE_UI = {
    title: T.title, build: build, fromUrl: fromUrl,
    reset: function () { lsDel(); Object.keys(DEF).forEach(function (k) { st[k] = DEF[k]; }); if (PV === 'd') st.man = 'l'; applyDom(); render(); },
    recap: function () {
      var o = last.o, rows = [];
      rows.push([T.rv, PV === 's' ? T.simple : T.lined]);
      rows.push([T.rm, o.man === 'l' ? T.ml : T.mc]);
      rows.push([T.rs, [o.emp ? T.emp : '', o.epa ? T.epa : '', o.pat ? T.pat : '', o.pmc ? T.pmc : ''].filter(Boolean).join(', ') || T.none]);
      rows.push([T.rch, last.poit.replace(T.chestP, '')]);
      rows.push([T.rlo, pk(o.pb, o.pbr, o.pbs)]);
      rows.push([T.flaps, ({ p: T.fp, d: T.fdr, a: T.fa, c: T.fcc })[o.rab]]);
      return rows;
    },
    links: function () { return lastLinks.slice(); },
    smalls: function () { return { title: T.smTitle, intro: T.smIntro, dl: T.smDl, items: lastSmall.slice() }; },
    sepLabel: T.sep
  };
})();
