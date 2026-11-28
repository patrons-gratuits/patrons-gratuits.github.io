/* Étape « Style » du formulaire de la saharienne : croquis qui change avec les choix, présélection par l'adresse.
   Les choix de style (jamais des mesures) sont gardés dans ce navigateur (localStorage). Rien n'est envoyé. */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var ROBE = !!window.SAH_ROBE;   /* robe saharienne : même composeur, avec longueur, ceinture et croquis de robe */
  var FEM = !!window.SAH_FEMME || ROBE;   /* saharienne femme (aperçu privé) : une seule page, version simple / doublée choisie ici, croquis femme */
  var PV = window.SAH_PAGE_VER === 'd' ? 'd' : 's';
  var KEY = ROBE ? 'robesah_style_v1' : FEM ? 'sahariennes_style_femme_v1' : 'sahariennes_style_v1';
  var VKEY = ROBE ? 'robesah_ver' : 'sahariennes_femme_ver';
  if (FEM) { try { if (localStorage.getItem(VKEY) === 'd') PV = 'd'; } catch (e) { } }
  var T = EN ? {
    title: 'Your style', lead: 'Design a safari jacket that suits you: the sketch shows each of your choices. The measurements come next.',
    ver: 'Version', sea: 'Season', se: 'Summer', sd: 'Mid-season', seah: 'Summer: worn over a T-shirt or shirt.<br>Mid-season: a little more room for a shirt and a light sweater.', s: 'Simple', d: 'Lined', hs: 'One layer, the quickest to sew.', hd: '',
    sleeves: 'Sleeves and slits', ml: 'Long sleeves', mc: 'Short sleeves', mcn: 'Short sleeves are available on the simple jacket only.',
    slits: 'Slits', f0: 'None', fc: 'Side', fd: 'Back', soon: 'soon', pvTitle: 'Before downloading', pvSup: 'Stacked pieces', pvSupD: 'Linings, facings and interfacings are drawn on the piece they derive from. Fewer pages, slightly more to read.', pvSep: 'Separate pieces', pvSepD: 'Each piece has its own outline, including linings and interfacings. More pages, easier to read.', pvPlan: 'Assembly plan (page 1 of the PDF)', pvSepCap: 'Each piece is printed on its own pages.', pvCancel: 'Cancel', pvGo: 'Download the PDF', pvWait: 'Calculating…', modeH: 'Pieces on the printed sheets', modeSup: 'Stacked pieces', modeSupD: 'fewer pages; linings, facings and interfacings are traced onto the piece they come from (recommended)', modeSep: 'Separate pieces', modeSepD: 'every piece is cut out directly, nothing to trace', pgw: 'pages',
    small: 'Small pieces', emp: 'Shoulder yoke', epa: 'Epaulettes', pat: 'Sleeve tabs', pmc: 'Sleeve pockets', empn: 'The shoulder yoke belongs to the lined jacket.',
    cart: 'Pen and glasses holder', cart_h: 'Pen and glasses holder, instead of a chest pocket.', c0: 'None', cg: 'For right-handers (left side)', cd: 'For left-handers (right side)',
    chest: 'Chest pockets', same: 'Same choice on both sides', right: 'Right side, as worn', left: 'Left side, as worn', low: 'Lower pockets',
    t0: 'None', tp: 'No gusset', tc: 'Centre gusset', tl: 'Side gussets', td: 'Double gusset', tk: 'Pen and glasses holder', flap: 'With flap',
    gus: 'Centre gusset', gi: 'inwards', ge: 'outwards',
    flaps: 'Flap shape', fp: 'Pointed', fdr: 'Straight', fa: 'Rounded', fcc: 'Cut corners', flaps_h: 'The same shape for all the flaps on the jacket.',
    face: 'Front', dos: 'Back', lr: ['right', 'left'], rl: ['left', 'right'], alt: 'Sketch of the safari jacket',
    sum: 'Your jacket:', simple: 'Simple jacket', lined: 'Lined jacket', long: 'long sleeves', short: 'short sleeves', noslit: 'no slits', sslit: 'side slits', bslit: 'back slit',
    yoke: 'shoulder yoke', epaul: 'epaulettes', tabs: 'sleeve tabs', spock: 'sleeve pockets', flapsOf: 'flaps ', fpn: 'pointed', fdn: 'straight', fan: 'rounded', fcn: 'with cut corners',
    chestP: 'chest pockets: ', rchest: 'right chest: ', lchest: 'left chest: ', lowP: 'lower pockets: ', none: 'none', holder: 'pen and glasses holder', wflap: ' with flap', nflap: ' without flap',
    inw: ' folded inwards', outw: ' folded outwards',
    links: 'You will be able to customise each small piece at the end.', smTitle: 'Going further: customise each piece', smIntro: 'Each piece opens on its own page, already set for your jacket. If the setting suits you, just download the PDF. Otherwise, change the dimensions and shapes, then print the pattern of your choice.', smDl: 'Customise',
    lEpa: 'Epaulettes', lPat: 'Sleeve tabs', lPmc: 'Sleeve pockets', lCart: 'Pen and glasses holder', lCh: 'Chest pockets', lLow: 'Lower pockets',
    rv: 'Version', rm: 'Sleeves', rf: 'Slits', rs: 'Small pieces', rr: 'Flaps', rch: 'Chest pockets', rlo: 'Lower pockets', rc: 'Pen and glasses holder',
    sep: 'To download separately:'
  } : {
    title: 'Votre style', lead: 'Composez une saharienne qui vous ressemble : le croquis intègre chacun de vos choix. Viennent ensuite les mesures.',
    ver: 'Version', sea: 'Saison', se: 'Été', sd: 'Demi-saison', seah: 'Été : se porte sur un T-shirt ou une chemise.<br>Demi-saison : un peu plus d’ampleur pour une chemise et un pull léger.', s: 'Simple', d: 'Doublée', hs: 'Une épaisseur, la plus rapide à coudre.', hd: '',
    sleeves: 'Manches et fentes', ml: 'Manches longues', mc: 'Manches courtes', mcn: 'Les manches courtes sont proposées pour la saharienne simple.',
    slits: 'Fentes', f0: 'Aucune', fc: 'De côté', fd: 'De dos', soon: 'bientôt', pvTitle: 'Avant de télécharger', pvSup: 'Pièces superposées', pvSupD: 'Les doublures et entoilages sont tracés sur la pièce dont ils dérivent. Moins de pages, un peu plus de lecture.', pvSep: 'Pièces séparées', pvSepD: 'Chaque pièce a son propre tracé, y compris doublures et entoilages. Plus de pages, lecture simple.', pvPlan: 'Plan d’assemblage (page 1 du PDF)', pvSepCap: 'Chaque pièce est imprimée sur ses propres pages.', pvCancel: 'Annuler', pvGo: 'Télécharger le PDF', pvWait: 'Calcul en cours…', modeH: 'Pièces sur les pages imprimées', modeSup: 'Pièces superposées', modeSupD: 'moins de pages ; doublures, parementures et entoilages sont à décalquer sur la pièce dont elles dérivent (conseillé)', modeSep: 'Pièces séparées', modeSepD: 'chaque pièce est à découper directement, rien à décalquer', pgw: 'pages',
    small: 'Petites pièces', emp: 'Pièce d’épaule', epa: 'Épaulettes', pat: 'Pattes de manches', pmc: 'Poches de manches', empn: 'La pièce d’épaule est propre à la saharienne doublée.',
    cart: 'Cartouchière', cart_h: 'Porte-stylos et lunettes, à la place d’une poche de poitrine.', c0: 'Aucune', cg: 'Pour droitier (à gauche)', cd: 'Pour gaucher (à droite)',
    chest: 'Poches de poitrine', same: 'Même choix des deux côtés', right: 'Côté droit, une fois la veste portée', left: 'Côté gauche, une fois la veste portée', low: 'Poches du bas',
    t0: 'Aucune', tp: 'Sans soufflet', tc: 'Soufflet central', tl: 'Soufflets latéraux', td: 'Double soufflet', tk: 'Cartouchière', flap: 'Avec rabat',
    gus: 'Soufflet central', gi: 'vers l’intérieur', ge: 'vers l’extérieur',
    flaps: 'Forme des rabats', fp: 'En pointe', fdr: 'Droit', fa: 'Arrondi', fcc: 'Angles coupés', flaps_h: 'La même forme pour tous les rabats de la veste.',
    face: 'Face', dos: 'Dos', lr: ['droite', 'gauche'], rl: ['gauche', 'droite'], alt: 'Croquis de la saharienne',
    sum: 'Votre saharienne :', simple: 'Saharienne simple', lined: 'Saharienne doublée', long: 'manches longues', short: 'manches courtes', noslit: 'sans fente', sslit: 'fentes de côté', bslit: 'fente de dos',
    yoke: 'pièce d’épaule', epaul: 'épaulettes', tabs: 'pattes de manches', spock: 'poches de manches', flapsOf: 'rabats ', fpn: 'en pointe', fdn: 'droits', fan: 'arrondis', fcn: 'à angles coupés',
    chestP: 'poches de poitrine : ', rchest: 'poitrine droite : ', lchest: 'poitrine gauche : ', lowP: 'poches du bas : ', none: 'aucune', holder: 'cartouchière', wflap: ' à rabat', nflap: ' sans rabat',
    inw: ' tourné vers l’intérieur', outw: ' tourné vers l’extérieur',
    links: 'Vous pourrez personnaliser chaque petite pièce à la fin.', smTitle: 'Aller plus loin : personnaliser chaque pièce', smIntro: 'Chaque pièce s’ouvre sur sa propre page, déjà réglée pour votre saharienne. Si ce réglage vous convient, il suffit de télécharger le PDF. Sinon, modifiez les dimensions et les formes, puis imprimez le patron de votre choix.', smDl: 'Personnaliser',
    lEpa: 'Épaulettes', lPat: 'Pattes de manches', lPmc: 'Poches de manches', lCart: 'Cartouchière', lCh: 'Poches de poitrine', lLow: 'Poches du bas',
    rv: 'Version', rm: 'Manches', rf: 'Fentes', rs: 'Petites pièces', rr: 'Rabats', rch: 'Poches de poitrine', rlo: 'Poches du bas', rc: 'Cartouchière',
    sep: 'À télécharger séparément :'
  };

  /* textes propres à la robe (les autres intitulés sont ceux de la saharienne) */
  var RLEN = { mini: { ext: 9.5, flare: 1.5, dChest: 2, dSpread: 1.5, dLow: 4, btnStop: 11, waist: 40, waistIn: 0.11, trueW: 1.35, slitSide: 12, slitBack: 12, flapOver: 0.25 },
               midi: { ext: 33, flare: 3.5, dChest: 2, dSpread: 1.5, dLow: 8, btnStop: 18, waist: 40, waistIn: 0.11, trueW: 1.35, slitSide: 12, slitBack: 18, flapOver: 0.25 } };
  if (ROBE) {
    Object.assign(T, EN ? {
      lead: 'Design a safari dress that suits you: the sketch reflects each of your choices. Measurements come next.',
      len: 'Length', mini: 'Mini', midi: 'Midi', hs: 'One layer, the quickest to sew.', hd: 'The top is lined down to the hips.',
      seah: 'Summer: worn on its own, in a light fabric.<br>Mid-season: a little more room for a long-sleeved T-shirt or a thin jumper underneath.',
      empn: 'The shoulder yoke belongs to the lined dress.', belt: 'Belt', b0: 'Without', b1: 'Tie belt', hfen: 'For the midi, a slit makes walking easier.',
      alt: 'Sketch of the safari dress', sum: 'Your dress:', beltTxt: 'tie belt', rlen: 'Length',
      smTitle: 'Going further: customise each piece', smIntro: T.smIntro.replace(/your jacket/g, 'your dress')
    } : {
      lead: 'Composez une robe saharienne qui vous ressemble : le croquis intègre chacun de vos choix. Viennent ensuite les mesures.',
      len: 'Longueur', mini: 'Mini', midi: 'Midi', hs: 'Une épaisseur, la plus rapide à coudre.', hd: 'Le haut est doublé jusqu’aux hanches.',
      seah: 'Été : se porte seule, en tissu léger.<br>Demi-saison : un peu plus d’ampleur pour un T-shirt à manches longues ou un pull fin dessous.',
      empn: 'La pièce d’épaule est propre à la robe doublée.', belt: 'Ceinture', b0: 'Sans', b1: 'À nouer', hfen: 'Pour la midi, une fente aide à marcher.',
      alt: 'Croquis de la robe saharienne', sum: 'Votre robe :', beltTxt: 'ceinture à nouer', rlen: 'Longueur',
      smIntro: T.smIntro.replace(/votre saharienne/g, 'votre robe')
    });
  }
  var root = null;
  var $ = function (id) { return (root && root.querySelector('[id="' + id + '"]')) || document.getElementById(id); };
  var I = function (id) { return $('st-' + id); };
  var val = function (n) { var e = (root || document).querySelector('input[name="st-' + n + '"]:checked'); return e ? e.value : null; };
  var TYPES = [['0', T.t0], ['p', T.tp], ['c', T.tc], ['l', T.tl], ['d', T.td]];
  var PAGES = { p: 'poches-simple.html', c: 'poches-soufflet-central.html', l: 'poches-soufflets-lateraux.html', d: 'poches-double-soufflet.html' };

  var DEF = { sea: '', man: 'l', fen: '0', emp: PV === 'd', epa: true, pat: true, pmc: true, cart: '0', same: true, ps: 'c', psr: true, pss: 'i', pd: 'c', pdr: true, pds: 'i', pg: 'c', pgr: true, pgs: 'i', pb: 'l', pbr: true, pbs: 'i', rab: 'p' };
  if (ROBE) Object.assign(DEF, { len: 'mini', belt: '1', man: 'c', emp: false, epa: true, pat: false, pmc: false, ps: 'p', pss: 'e', pd: 'p', pds: 'e', pg: 'p', pgs: 'e', pb: 'p', pbs: 'e' });
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
  if (FEM) { if (PV !== 'd') st.emp = false; } else if (PV === 'd') st.man = 'l'; else st.emp = false;
  function seaVal() { return (st.sea === '0' || st.sea === '1') ? st.sea : (PV === 'd' ? '1' : '0'); }
  window.SAH_STYLE = { man: 'l', fen: '0' };

  var view = 'face';
  var sk = document.createElement('div');
  sk.className = 'card sticky cq'; sk.id = 'sketchcard';
  sk.innerHTML = '<div class="cq-views" role="group"><button type="button" id="st-vf" aria-pressed="true">' + T.face + '</button><button type="button" id="st-vd" aria-pressed="false">' + T.dos + '</button></div>' +
    '<svg id="st-svg" class="cq-svg" viewBox="50 30 300 345" role="img" aria-label="' + T.alt + '"></svg><div class="cq-leg" id="st-leg"></div><p class="cq-cap" id="st-cap" aria-hidden="true"></p>';
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
    var h = '<div class="cq-form">' +
      (ROBE ? '<fieldset><legend>' + T.len + '</legend>' + chips('len', [['mini', T.mini], ['midi', T.midi]]) + '</fieldset>' : '') +
      '<fieldset><legend>' + T.ver + '</legend>' + chips('ver', [['s', T.s], ['d', T.d]]) + '<p class="hint" id="st-verhint"></p></fieldset>' +
      '<fieldset><legend>' + T.sea + '</legend>' + chips('sea', [['0', T.se], ['1', T.sd]]) + '<p class="hint">' + T.seah + '</p></fieldset>' +
      '<fieldset><legend>' + T.sleeves + '</legend>' + chips('man', [['l', T.ml], ['c', T.mc]]) + '<p class="hint" id="st-manhint" hidden>' + T.mcn + '</p>' +
      '<div class="sub"><h3>' + T.slits + '</h3>' + chips('fen', [['0', T.f0], ['c', T.fc, 0], ['d', T.fd, 0]]) + (ROBE ? '<p class="hint" id="st-hfen" hidden>' + T.hfen + '</p>' : '') + '</div></fieldset>' +
      '<fieldset><legend>' + T.small + '</legend><div class="chips">' + chk('emp', T.emp) + chk('epa', T.epa) + chk('pat', T.pat) + chk('pmc', T.pmc) + '</div><p class="hint" id="st-emphint" hidden>' + T.empn + '</p></fieldset>' +
      (ROBE ? '<fieldset><legend>' + T.belt + '</legend>' + chips('belt', [['0', T.b0], ['1', T.b1]]) + '</fieldset>' : '') +
      '<fieldset><legend>' + T.cart + '</legend><p class="hint">' + T.cart_h + '</p>' + chips('cart', [['0', T.c0], ['g', T.cg], ['d', T.cd]]) + '</fieldset>' +
      '<fieldset><legend>' + T.chest + '</legend><label class="check"><input type="checkbox" id="st-same"> ' + T.same + '</label>' +
      '<div id="st-pSame">' + pocketGroup('ps', '', false) + '</div><div id="st-pSides" hidden><div class="sub">' + pocketGroup('pd', T.right, true) + '</div><div class="sub">' + pocketGroup('pg', T.left, true) + '</div></div></fieldset>' +
      '<fieldset><legend>' + T.low + '</legend>' + pocketGroup('pb', '', false) + '</fieldset>' +
      '<fieldset><legend>' + T.flaps + '</legend>' + chips('rab', [['p', T.fp], ['d', T.fdr], ['a', T.fa], ['c', T.fcc]]) + '<p class="hint">' + T.flaps_h + '</p></fieldset>' +
      '<p class="cq-links" id="st-links"></p></div>';
    root = sec; var h2 = sec.querySelector('h2'); if (h2) h2.insertAdjacentHTML('beforebegin', '<p class="cq-lead">' + T.lead + '</p>'); else sec.insertAdjacentHTML('afterbegin', '<p class="cq-lead">' + T.lead + '</p>'); sec.insertAdjacentHTML('beforeend', h);
    sec.addEventListener('change', onChange);
    $('st-vf').onclick = function () { setView('face'); };
    $('st-vd').onclick = function () { setView('dos'); };
    var ob = $('opt_epaule'); if (ob) ob.addEventListener('change', function () { if (I('emp').checked !== ob.checked) { I('emp').checked = ob.checked; render(); } });
    applyDom(); render();
  }
  function setView(v) { view = v; $('st-vf').setAttribute('aria-pressed', String(v === 'face')); $('st-vd').setAttribute('aria-pressed', String(v === 'dos')); render(); }

  function applyDom() {
    function rad(n, v) { var e = I(n + '-' + v); if (e) e.checked = true; }
    rad('ver', PV); if (ROBE) { rad('len', st.len); rad('belt', st.belt); } rad('sea', seaVal()); rad('man', st.man); rad('fen', st.fen); rad('cart', st.cart); rad('rab', st.rab);
    ['ps', 'pd', 'pg', 'pb'].forEach(function (k) { rad(k, st[k]); rad(k + '-souf', st[k + 's']); I(k + '-rab').checked = !!st[k + 'r']; });
    ['emp', 'epa', 'pat', 'pmc', 'same'].forEach(function (k) { I(k).checked = !!st[k]; });
  }
  function readDom() {
    var o = { sea: st.sea || '', len: val('len') || 'mini', belt: val('belt') || '0', man: val('man') || 'l', fen: val('fen') || '0', cart: val('cart') || '0', rab: val('rab') || 'p', same: I('same').checked };
    ['emp', 'epa', 'pat', 'pmc'].forEach(function (k) { o[k] = I(k).checked; });
    ['ps', 'pd', 'pg', 'pb'].forEach(function (k) { o[k] = val(k) || '0'; o[k + 'r'] = I(k + '-rab').checked; o[k + 's'] = val(k + '-souf') || 'i'; });
    return o;
  }
  function onChange(e) {
    var t = e.target;
    /* bascule automatique : fente de dos -> Dos ; poches, rabats, cartouchière -> Face */
    if (t.name === 'st-sea') st.sea = t.value;
    var key = (t.name || t.id || '').replace(/^st-/, '');
    if (key === 'fen' && t.value === 'd') { if (view !== 'dos') setView('dos'); }
    else if (/^(ps|pd|pg|pb|cart|rab|same|belt)/.test(key) && view !== 'face') setView('face');
    if (t.name === 'st-ver' && FEM) { PV = t.value; try { localStorage.setItem(VKEY, PV); } catch (e) { } I('emp').checked = PV === 'd' && !ROBE; render(); return; }
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
    if (FEM) { } else if (PV === 's') s.emp = prev.emp !== undefined ? prev.emp : true; else s.man = prev.man !== undefined ? prev.man : 'l';
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
    if (val('pb') === '0') I('pb-l').checked = true;
    var o = readDom();
    /* cohérence cartouchière / poches de poitrine */
    var sm = o.same;
    I((!sm && o.pd === 'k') ? 'cart-d' : (!sm && o.pg === 'k') ? 'cart-g' : 'cart-0').checked = true; o.cart = val('cart');
    I('same').closest('label').hidden = o.cart !== '0';
    I('pg-k').closest('label').hidden = true; I('pd-k').closest('label').hidden = true;
    I('pd-k').closest('.sub').hidden = o.pd === 'k'; I('pg-k').closest('.sub').hidden = o.pg === 'k';
    I('pb-0').closest('label').hidden = true;
    ['ps', 'pd', 'pg', 'pb'].forEach(function (k) { var t = val(k); I(k + '-rab').disabled = (t === '0' || t === 'k'); var sb = I(k + '-soufbox'); sb.hidden = !(t === 'c' || t === 'd'); if (!sb.hidden) { var lab = I(k + '-' + t).closest('label'); if (lab.nextSibling !== sb) lab.after(sb); } });
    $('st-pSame').hidden = !I('same').checked; $('st-pSides').hidden = I('same').checked;
    /* version : simple / doublée */
    $('st-verhint').textContent = PV === 's' ? T.hs : T.hd;
    I('man-c').closest('label').hidden = PV === 'd' && !FEM; $('st-manhint').hidden = FEM || PV !== 'd';
    if (!FEM && PV === 'd' && o.man === 'c') { I('man-l').checked = true; o.man = 'l'; }
    I('emp').closest('label').hidden = PV === 's'; $('st-emphint').hidden = true;
    if (PV === 's' && o.emp) { I('emp').checked = false; o.emp = false; }
    var o2 = readDom(); o2.cart = o.cart; o = o2;
    o.ver = PV;
    /* lien avec le calcul du patron */
    var changed = window.SAH_STYLE.man !== o.man || window.SAH_STYLE.fen !== o.fen;
    var sv = seaVal(); I('sea-' + sv).checked = true;
    var seaChanged = window.SAH_STYLE.sea !== +sv; window.SAH_STYLE.sea = +sv; window.SAH_STYLE.seaTxt = sv === '0' ? T.se : T.sd;
    window.SAH_STYLE.man = o.man; window.SAH_STYLE.fen = o.fen; window.SAH_STYLE.ver = PV;
    if (ROBE) { window.SAH_STYLE.len = o.len; window.SAH_STYLE.belt = o.belt; $('st-hfen').hidden = o.len !== 'midi'; }
    if (seaChanged && !FEM) { var g0 = document.querySelector('.grp'); if (g0) setTimeout(function () { g0.dispatchEvent(new Event('change', { bubbles: true })); }, 0); }
    var ob = $('opt_epaule'); if (PV === 'd' && ob && ob.checked !== o.emp) { ob.checked = o.emp; ob.dispatchEvent(new Event('change', { bubbles: true })); }
    var g = document.querySelector('.grp[value="manches"]');
    if (g) { var lab = g.parentNode, txt = o.man === 'c' ? window.SAH_LBL_SHORT : window.SAH_LBL_LONG; if (txt && lab.lastChild && lab.lastChild.nodeType === 3) lab.lastChild.textContent = ' ' + txt; if (changed) g.dispatchEvent(new Event('change', { bubbles: true })); }
    persist(o);
    if (FEM) o.genre = 'f';
    if (ROBE) window.SahCroquis.drawDress($('st-svg'), o, o.rab, view, Object.assign({}, RLEN[o.len], { belt: +o.belt, legs: 1, floor: 137, knee: 93 }));
    else window.SahCroquis.draw($('st-svg'), o, o.rab, view);
    $('st-leg').innerHTML = '<span>' + (view === 'face' ? T.lr : T.rl).join('</span><span>') + '</span>';
    /* résumé */
    var RB = { p: T.fpn, d: T.fdn, a: T.fan, c: T.fcn };
    var parts = [ROBE ? (EN ? (PV === 's' ? 'Simple ' : 'Lined ') + o.len + ' dress' : 'Robe ' + o.len + (PV === 's' ? ' simple' : ' doublée')) : PV === 's' ? T.simple : T.lined, (sv === '0' ? T.se : T.sd).toLowerCase(), o.man === 'l' ? T.long : T.short, o.fen === '0' ? T.noslit : (o.fen === 'c' ? T.sslit : T.bslit)];
    if (o.emp) parts.push(T.yoke); if (o.epa) parts.push(T.epaul); if (o.pat) parts.push(T.tabs); if (o.pmc) parts.push(T.spock);
    if (ROBE && o.belt === '1') parts.push(T.beltTxt);
    parts.push(T.flapsOf + RB[o.rab]);
    var poit = o.same ? T.chestP + pk(o.ps, o.psr, o.pss) : T.rchest + pk(o.pd, o.pdr, o.pds) + ' ; ' + T.lchest + pk(o.pg, o.pgr, o.pgs);
    var sumTxt = parts.join(', ') + ' ; ' + poit + ' ; ' + T.lowP + pk(o.pb, o.pbr, o.pbs) + '.';
    $('st-cap').textContent = T.sum + ' ' + sumTxt.charAt(0).toLowerCase() + sumTxt.slice(1); $('st-svg').setAttribute('aria-label', T.alt + '. ' + T.sum + ' ' + sumTxt);
    last = { o: o, parts: parts, poit: poit, sum: sumTxt };
    /* petites pièces : boutons du récapitulatif (adresses complétées à l'affichage avec les dimensions du modèle) */
    var SM = [];
    function add(href, label, kind) { SM.push({ href: href, label: label, kind: kind || '' }); }
    if (o.epa) add('epaulettes.html' + epaQ(), T.lEpa); if (o.pat) add('pattes-manches.html', T.lPat, 'pat'); if (o.pmc) add('poches-simple.html', T.lPmc, 'pmc');
    var hasCart = o.pd === 'k' || o.pg === 'k'; if (hasCart) SM.push({ href: '', label: T.lCart, kind: 'cart' });
    var seen = {};
    function pq(t, r, sn) { var q = []; if (r) { var m = { d: 'rect', a: 'round', c: 'cut' }[o.rab]; if (m) q.push('rabat=' + m); } if ((t === 'c' || t === 'd') && sn) q.push('pli=' + (sn === 'e' ? 'e' : 'i')); return PAGES[t] + (q.length ? '?' + q.join('&') : ''); }
    function addP(t, r, sn, pre, kind) { if (!PAGES[t]) return; var label = pre + ' (' + NAMES[t].toLowerCase() + ')'; var h = pq(t, r, sn); if (seen[h + kind]) return; seen[h + kind] = 1; add(h, label, kind); }
    if (o.same) addP(o.ps, o.psr, o.pss, T.lCh, 'chest');
    else { addP(o.pd, o.pdr, o.pds, T.lCh, 'chest'); addP(o.pg, o.pgr, o.pgs, T.lCh, 'chest'); }
    addP(o.pb, o.pbr, o.pbs, T.lLow, 'low');
    lastLinks = []; lastSmall = SM;
    $('st-links').innerHTML = SM.length ? T.links : '';
    if (FEM) window.dispatchEvent(new Event('sah-style'));
  }
  var last = null, lastLinks = [], lastSmall = [];
  /* cartouchière : modèle affiché, PDF A4 1:1 direct (même étalonnage d'impression que le patron de la veste) */
  var CART_CF = {"fr":{"title":"Cartouchière","names":{"Principale":"Principale","Poche":"Poche","Ruban":"Ruban","Thermocollant pièce principale":"Thermocollant"},"ann":{"Principale":"Tissu principal ou fantaisie - 8 boutonnières (traits rouges) pour le passage du ruban","Poche":"Tissu principal ou fantaisie","Ruban":"Tissu principal ou fantaisie - à passer dans les boutonnières de la Principale","Thermocollant pièce principale":"Thermocollant (à repasser sur l'envers de la Principale)"},"info":"Dimensions fixes : 12 x 12 cm, rempli 1,5 cm, sans marge (rempli)","pdf":"Cartouchière avec poche - patron A4 1:1","file":"cartouchiere-avec-poche.pdf"},"en":{"title":"Pen and glasses holder","names":{"Principale":"Main piece","Poche":"Pocket","Ruban":"Ribbon strip","Thermocollant pièce principale":"Fusible interfacing"},"ann":{"Principale":"Main or fancy fabric - 8 buttonholes (red lines) for the ribbon to pass through","Poche":"Main or fancy fabric","Ruban":"Main or fancy fabric - thread through the buttonholes of the Main piece","Thermocollant pièce principale":"Fusible interfacing (iron onto the wrong side of the Main piece)"},"info":"Fixed dimensions: 12 x 12 cm, fold-under allowance 1.5 cm, no seam allowance","pdf":"Pen and glasses holder with pocket - A4 pattern 1:1","file":"pen-and-glasses-holder-with-pocket.pdf"}};
  function cartPdf() {
    var cf = CART_CF[EN ? 'en' : 'fr'], msg = $('msg');
    function go() {
      try {
        var D = window.CART_DATA, E = window.PatternEngine, res = E.computeBlock(D, 0), all = E.computePieces(res, {});
        var pcs = ['Principale', 'Poche', 'Ruban', 'Thermocollant pièce principale'].map(function (n) { return all.find(function (p) { return p.name === n; }); }).filter(Boolean);
        var named = pcs.map(function (p) { return Object.assign({}, p, { name: cf.title + ' - ' + (cf.names[p.name] || p.name), note: cf.info, ann: cf.ann[p.name] || '', rlabel: cf.names[p.name] || p.name, fold: false }); });
        var m = parseFloat(window.SAH_MEAS); if (Math.abs(m - 50) < 0.2) m = 50;
        var sc = (m >= 40 && m <= 60) ? 50 / m : 1, d = new Date();
        var dt = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
        var o = window.PatternPDF.build(named, { title: cf.pdf, lines: [cf.info], scale: sc, date: dt, single: false, recap: { title: cf.title, params: [['', cf.info]], mode: 'auto' } });
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([o.bytes], { type: 'application/pdf' })); a.download = cf.file; a.click();
      } catch (e) { if (msg) msg.textContent = e.message; }
    }
    if (window.CART_DATA) { go(); return; }
    var sc2 = document.createElement('script'); sc2.src = (EN ? '../' : '') + 'cart_data.js?v=202611172200'; sc2.onload = go;
    sc2.onerror = function () { if (msg) msg.textContent = 'cart_data.js'; };
    document.head.appendChild(sc2);
  }
  /* dimensions des poches du modèle : lignes de repérage horizontales du Devant, hauteur par la proportion 14/13 */
  /* poche de manche : limites en proportion de B_B1 (hauteur) et Dos_Devant (largeur), bas = niveau B71 - 2,5 cm ; valeurs par defaut 10 x 9 cm sur le modele */
  function sleevePocket() {
    try {
      var D = window.SAH_DATA, E = window.PatternEngine, ov = window.SAH_OV; if (!D || !E || !ov) return null;
      var want = { B: 1, B1: 1, Dos: 1, Devant: 1 }, pt = {};
      D.blocks.forEach(function (bl, bi) {
        if (!bl.pieces || !bl.pieces.length) return;
        var res = null;
        bl.calc.forEach(function (c) { if (want[c.name] && !pt[c.name]) { if (!res) res = E.computeBlock(D, bi, ov, { chain: true }); var q = res.pts[c.id]; if (q) pt[c.name] = q; } });
      });
      if (!pt.B || !pt.B1 || !pt.Dos || !pt.Devant) return null;
      var bb1 = pt.B1.y - pt.B.y, dd = pt.Devant.x - pt.Dos.x, ec = ov['#M_EpauleCoude'];
      if (!(bb1 > 0) || !(dd > 0) || !(ec > 0)) return null;
      var top = bb1 * 14 / 19.2, bot = bb1 + ec * 0.705 - 19.2 - 2.5, maxW = dd * 10 / 43.72, avail = bot - top;
      if (!(avail > 3) || !(maxW > 3)) return null;
      function r1(v) { return Math.round(v * 10) / 10; }
      return { w: r1(0.9 * maxW), h: r1(avail * 10 / 11.7) };
    } catch (e) { return null; }
  }
  function epaQ() {
    var v = window.SAH_OV; if (!v) return '';
    var t = v['#M_TourCou'], a = v['#A_Cou'], w = v['#M_LargeurEpaules'];
    if (!(t > 0) || !(w > 0) || !isFinite(a)) return '';
    var ae = v['#A_Epaule']; if (!isFinite(ae)) return '';
    var L = (w - (t + a) / Math.PI) / 2 + ae; if (!(L > 0)) return '';
    return '?LongEp=' + (Math.round(L * 100) / 100);
  }
  function pocketDims() {
    if (FEM && window.SAH_FEMME_DIMS) return window.SAH_FEMME_DIMS;
    var P = window.SAH_PCS, dv = null; if (!P) return null;
    P.forEach(function (p) { if (p.name === 'Devant' && !dv) dv = p; });
    if (!dv || !dv.internal) return null;
    var hs = [];
    dv.internal.forEach(function (l) { if (l.length === 2 && Math.abs(l[0].y - l[1].y) < 0.01) { var w = Math.abs(l[1].x - l[0].x); if (w > 5 && l[0].y < 70) hs.push({ y: l[0].y, w: w }); } });
    if (hs.length < 2) return null;
    hs.sort(function (a, b) { return a.y - b.y; });
    function r1(v) { return Math.round(v * 10) / 10; }
    var c = hs[0], b = hs[hs.length - 1];
    return { chest: { w: r1(c.w), h: r1(c.w * 14 / 13) }, low: { w: r1(b.w), h: r1(b.w * 14 / 13) } };
  }

  window.SAH_MODE = window.SAH_MODE || 'sup'; window.SAH_PG = T.pgw;
  function mode(parent, before) {
    var d = document.createElement('fieldset'); d.className = 'wz-mode';
    d.innerHTML = '<legend>' + T.modeH + '</legend>' +
      '<label class="wz-mopt"><input type="radio" name="st-mode" value="sup" checked> <span><b>' + T.modeSup + '</b> <small id="st-mode-sup-n"></small><br><small>' + T.modeSupD + '</small></span></label>' +
      '<label class="wz-mopt"><input type="radio" name="st-mode" value="sep"> <span><b>' + T.modeSep + '</b> <small id="st-mode-sep-n"></small><br><small>' + T.modeSepD + '</small></span></label>';
    d.addEventListener('change', function (e) { if (e.target && e.target.name === 'st-mode') { window.SAH_MODE = e.target.value; window.dispatchEvent(new Event('sah-mode')); } });
    parent.insertBefore(d, before || null);
  }
  function preview(o) {
    var old = document.getElementById('sah-pv'); if (old) old.remove();
    var ov = document.createElement('div'); ov.id = 'sah-pv'; ov.className = 'pv-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'sah-pv-t');
    var cur = window.SAH_MODE === 'sep' ? 'sep' : 'sup';
    ov.innerHTML = '<div class="pv-dlg"><div class="pv-hd"><strong id="sah-pv-t">' + T.pvTitle + '</strong></div><div class="pv-bd"><fieldset class="pv-fs">' +
      '<label class="pv-opt"><input type="radio" name="pv-m" value="sup"><span>' + T.pvSup + ' <b id="pv-n-sup" class="pv-pg"></b><small>' + T.pvSupD + '</small></span></label>' +
      '<label class="pv-opt"><input type="radio" name="pv-m" value="sep"><span>' + T.pvSep + ' <b id="pv-n-sep" class="pv-pg"></b><small>' + T.pvSepD + '</small></span></label></fieldset>' +
      '<div class="pv-pv"><div class="pv-img" id="pv-img">' + T.pvWait + '</div><div class="pv-cap" id="pv-cap"></div></div></div>' +
      '<div class="pv-ft"><button type="button" class="pv-b2" id="pv-x">' + T.pvCancel + '</button><button type="button" class="pv-b1" id="pv-go">' + T.pvGo + '</button></div></div>';
    document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('#pv-x').onclick = close;
    ov.querySelector('#pv-go').onclick = function () { window.SAH_MODE = cur; close(); o.go(); };
    var plan = null;
    function show() {
      var im = ov.querySelector('#pv-img');
      im.innerHTML = cur === 'sup' ? (plan ? plan.svg : T.pvWait) : '';
      im.style.display = cur === 'sup' ? '' : 'none';
      ov.querySelector('#pv-cap').textContent = cur === 'sup' ? T.pvPlan : T.pvSepCap;
    }
    ov.querySelectorAll('input[name=pv-m]').forEach(function (r) { r.checked = r.value === cur; r.onchange = function () { cur = r.value; show(); }; });
    show(); ov.querySelector('#pv-go').focus();
    setTimeout(function () {
      try { ov.querySelector('#pv-n-sep').textContent = o.sep() + ' ' + T.pgw; } catch (e) {}
      try { plan = o.sup(); ov.querySelector('#pv-n-sup').textContent = plan.pages + ' ' + T.pgw; show(); } catch (e) { ov.querySelector('#pv-img').textContent = ''; }
    }, 30);
  }
  window.SAH_STYLE_UI = {
    mode: mode, preview: preview,
    title: T.title, build: build, fromUrl: fromUrl,
    reset: function () { lsDel(); Object.keys(DEF).forEach(function (k) { st[k] = DEF[k]; }); if (PV === 'd' && !FEM) st.man = 'l'; applyDom(); render(); },
    recap: function () {
      var o = last.o, rows = [];
      if (ROBE) rows.push([T.rlen, o.len === 'midi' ? T.midi : T.mini]);
      rows.push([T.rv, ROBE ? (PV === 's' ? T.s : T.d) : PV === 's' ? T.simple : T.lined]);
      rows.push([T.sea, seaVal() === '0' ? T.se : T.sd]);
      rows.push([T.rm, o.man === 'l' ? T.ml : T.mc]);
      if (ROBE) rows.push([T.rf, o.fen === '0' ? T.f0 : (o.fen === 'c' ? T.fc : T.fd)]);
      rows.push([T.rs, [o.emp ? T.emp : '', o.epa ? T.epa : '', o.pat ? T.pat : '', o.pmc ? T.pmc : ''].filter(Boolean).join(', ') || T.none]);
      if (ROBE) rows.push([T.belt, o.belt === '1' ? T.b1 : T.b0]);
      rows.push([T.rch, last.poit.replace(T.chestP, '')]);
      rows.push([T.rlo, pk(o.pb, o.pbr, o.pbs)]);
      rows.push([T.flaps, ({ p: T.fp, d: T.fdr, a: T.fa, c: T.fcc })[o.rab]]);
      return rows;
    },
    links: function () { return lastLinks.slice(); },
    cartPdf: function () { cartPdf(); },
    share: function () { return { v: lsGet() || {}, d: DEF, ver: PV }; },
    setShare: function (s, ver) {
      s = s || {};
      if (FEM && (ver === 's' || ver === 'd')) { PV = ver; try { localStorage.setItem(VKEY, PV); } catch (e) { } }
      Object.keys(DEF).forEach(function (k) { st[k] = s[k] !== undefined ? s[k] : DEF[k]; });
      if (s.emp === undefined) st.emp = PV === 'd' && !ROBE;
      if (PV !== 'd') st.emp = false;
      if (st.same && (st.pd === 'k' || st.pg === 'k')) st.same = false;
      if (root) { applyDom(); render(); }
    },
    smalls: function () {
      var d = pocketDims();
      return { title: T.smTitle, intro: T.smIntro, dl: T.smDl, items: lastSmall.map(function (x) {
        if (x.kind === 'cart') return { href: '', label: x.label, act: 'cart' };
        var h = x.href, sep = h.indexOf('?') < 0 ? '?' : '&';
        if (x.kind === 'pat') h += sep + 'LongP=10&LarPDem=4.5&LaPFin=4.5';
        else if (x.kind === 'pmc') { var sp = sleevePocket(); if (sp) h += sep + 'H_poche=' + sp.h + '&L_poche=' + sp.w; }
        else if (d && d[x.kind]) h += sep + 'H_poche=' + d[x.kind].h + '&L_poche=' + d[x.kind].w;
        return { href: h, label: x.label };
      }) };
    },
    sepLabel: T.sep
  };
})();
