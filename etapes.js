/* Formulaire par étapes (patrons à plusieurs mesures) et réglages avancés repliés (petits patrons).
   Les champs ne sont pas recréés : ils sont déplacés, donc le calcul et l'aperçu restent ceux de la page d'origine.
   Les mesures sont gardées uniquement dans ce navigateur (localStorage). Rien n'est envoyé. */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var L = EN ? {
    prev: 'Previous', next: 'Next', start: 'Start', see: 'See the summary', back: 'Back to the summary',
    intro: 'Before you start', recap: 'Summary', adv: 'Advanced settings (optional)', advLead: 'Rarely changed: you can skip straight to the next step.',
    ais: 'Ease allowances', pcs: 'Pieces to download', seam: 'Seam allowance', cal: 'Print calibration', mes: 'Measurements', edit: 'Edit', fill: 'To fill in', none: 'none', yes: 'yes', no: 'no',
    priv: 'Your measurements are kept only in this browser, on this device. Nothing is sent to the site.', clear: 'Clear my measurements',
    resume: 'Continue with your measurements from ', restart: 'Start over', nextM: 'Next: measurements', resumeS: 'Resume your measurements from ', hint: 'Tap the preview to enlarge or shrink it.', showPcs: 'Show the pattern pieces', hidePcs: 'Hide the pattern pieces',
    one: 'Your measurement', kofn: function (k, n) { return 'Measurement ' + k + ' of ' + n; },
    advSum: 'Advanced settings (optional): seam allowance, print calibration', advSumCal: 'Advanced settings (optional): print calibration',
    b1: '1. Ready-to-wear: your standard size', sizeL: 'Your usual size (French, UK or US)', statL: 'Your height', fill: 'Fill in my measurements',
    b2: '2. Fitted: the 4 measurements to check first', b2p: 'Pre-filled from your size: correct them if needed.', b3: '3. Made to measure: the other measurements', b3p: 'Also pre-filled: correct those you can take.',
    needSize: 'Please choose your size and height first.', chk: 'check', pick: 'Choose',
    stat: { petite: 'Petite', short: 'Short', moyenne: 'Average', grande: 'Tall' },
    recapStd: function (sz, st, n, lv) { return 'Pattern based on size ' + sz + ', ' + st + ' height, with ' + (n ? n + ' personal measurement' + (n > 1 ? 's' : '') : 'no personal measurement') + ': ' + ['ready-to-wear', 'fitted', 'made to measure'][lv] + '.'; },
    stdAfter: 'Choose your size and height to pre-fill your measurements, then correct any you wish. The pattern updates with every change.',
    introPrio: function (a, b) { return 'You can go from ready-to-wear to made to measure. The ' + a + ' measurements to check first fit the jacket to your figure; the other ' + b + ' make it truly made to measure.'; },
    introTape: 'You need a tape measure and about 10 minutes; help from another person is a plus. Take your measurements in underwear or very thin clothing, with the tape flat against the body, not tight.', introBra: ' For the bust measurements, wear a bra.'
  } : {
    prev: 'Précédent', next: 'Suivant', start: 'Commencer', see: 'Voir le récapitulatif', back: 'Retour au récapitulatif',
    intro: 'Avant de commencer', recap: 'Récapitulatif', adv: 'Réglages avancés (facultatif)', advLead: 'Rarement modifiés : vous pouvez passer directement à la suite.',
    ais: 'Aisances', pcs: 'Pièces à télécharger', seam: 'Marge de couture', cal: 'Étalonnage d’impression', mes: 'Mesures', edit: 'Modifier', fill: 'À renseigner', none: 'aucune', yes: 'oui', no: 'non',
    priv: 'Vos mesures sont gardées uniquement dans ce navigateur, sur cet appareil. Rien n’est envoyé au site.', clear: 'Effacer mes mesures',
    resume: 'Reprendre avec vos mesures du ', restart: 'Recommencer', nextM: 'Suivant : les mesures', resumeS: 'Reprendre vos mesures du ', hint: 'Touchez l’aperçu pour l’agrandir ou le réduire.', showPcs: 'Voir les pièces du patron', hidePcs: 'Masquer les pièces du patron',
    one: 'Votre mesure', kofn: function (k, n) { return 'Mesure ' + k + ' sur ' + n; },
    advSum: 'Réglages avancés (facultatif) : marge de couture, étalonnage d’impression', advSumCal: 'Réglages avancés (facultatif) : étalonnage d’impression',
    b1: '1. Prêt-à-porter : votre taille standard', sizeL: 'Votre taille habituelle (française)', statL: 'Votre stature', fill: 'Préremplir mes mesures',
    b2: '2. Ajusté : les 4 mesures à vérifier en priorité', b2p: 'Préremplies d’après votre taille : corrigez-les si utile.', b3: '3. Sur-mesure : les autres mesures', b3p: 'Préremplies elles aussi : corrigez celles que vous pouvez prendre.',
    needSize: 'Choisissez d’abord votre taille et votre stature.', chk: 'à vérifier', pick: 'Choisir',
    stat: { petite: 'Petite', short: 'Petite', moyenne: 'Moyenne', grande: 'Grande' },
    recapStd: function (sz, st, n, lv) { return 'Patron établi à partir de la taille ' + sz + ', stature ' + st + ', ' + (n ? 'avec ' + n + ' mesure' + (n > 1 ? 's' : '') + ' personnalisée' + (n > 1 ? 's' : '') : 'sans mesure personnalisée') + ' : ' + ['prêt-à-porter', 'ajusté', 'sur-mesure'][lv] + '.'; },
    stdAfter: 'Choisissez votre taille et votre stature pour préremplir vos mesures, puis corrigez celles que vous souhaitez. Le patron se modifie à chaque réglage.',
    introPrio: function (a, b) { return 'Vous pouvez aller du prêt-à-porter au sur-mesure. Les ' + a + ' mesures à vérifier en priorité ajustent la veste à votre silhouette ; les ' + b + ' autres en font une veste vraiment sur mesure.'; },
    introTape: 'Il vous faut un mètre ruban et environ 10 minutes ; l’aide d’une autre personne est un plus. Prenez vos mesures en sous-vêtements ou avec des vêtements très fins, le mètre ruban à plat contre le corps, sans serrer.', introBra: ' Pour les mesures de poitrine, portez un soutien-gorge.'
  };
  var $ = function (id) { return document.getElementById(id); };
  var C = window.WZ_CFG;
  var form = $('form');

  /* --- nœuds « marge de couture » et « étalonnage », quelle que soit la page --- */
  function seamNodes(withH) {
    var sl = document.querySelector('label[for="v_seam"]'); if (!sl) return [];
    if (sl.parentNode.id === 'seamwrap') return [sl.parentNode];
    var out = [], h = sl.previousElementSibling; if (withH && h && h.tagName === 'H2') out.push(h);
    var n = sl, err = $('e_seam');
    while (n) { out.push(n); if (n === err) break; n = n.nextElementSibling; }
    return out;
  }
  function calNodes(ml, withH) {
    var out = [], h = ml.previousElementSibling; if (withH && h && /^H[23]$/.test(h.tagName)) out.push(h);
    var n = ml, passed = false;
    while (n) {
      out.push(n);
      if (n.querySelector && n.querySelector('input[type="number"]')) passed = true;
      else if (passed && n.tagName === 'SMALL') break;
      else if (passed || n.tagName === 'BUTTON') { if (n.tagName === 'BUTTON' || n.tagName === 'P') out.pop(); break; }
      n = n.nextElementSibling;
    }
    return out;
  }

  /* --- petits patrons : réglages avancés repliés --- */
  function small() {
    var cals = Array.prototype.slice.call(document.querySelectorAll('label[for="v_meas"],label[for^="ccal_"]'));
    cals.forEach(function (ml, idx) {
      var cn = calNodes(ml, false), sn = idx === 0 ? seamNodes(false) : [];
      var det = document.createElement('details'); det.className = 'wz-adv';
      var sm = document.createElement('summary'); sm.textContent = sn.length ? L.advSum : L.advSumCal; det.appendChild(sm);
      var hs = [], pp = ml.previousElementSibling; if (pp && /^H[23]$/.test(pp.tagName)) hs.push(pp);
      if (idx === 0) { var sl = document.querySelector('label[for="v_seam"]'); if (sl && sl.parentNode.id !== 'seamwrap') { var q = sl.previousElementSibling; if (q && q.tagName === 'H2') hs.push(q); } }
      cn[0].parentNode.insertBefore(det, cn[0]);
      sn.concat(cn).forEach(function (n) { det.appendChild(n); });
      hs.forEach(function (h) { h.remove(); });
      det.addEventListener('input', function () { if (det.querySelector('.err:not(:empty)')) det.open = true; });
    });
  }
  if (!form || !C) { small(); return; }

  /* --- formulaire par étapes --- */
  var KEY = C.key;
  form.classList.add('wz');
  function lsGet() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function lsDel() { try { localStorage.removeItem(KEY); } catch (e) { } }

  var fld = function (id) { return $('w_' + id); };
  var inputs = function () { return Array.prototype.slice.call(form.querySelectorAll('input[id^="v_"],select[id^="v_"]')); };
  var defaults = {}; inputs().forEach(function (i) { defaults[i.id] = i.value; });
  var STD = (C.std && window.TAILLES_STD && window.TAILLES_STD[C.std.genre]) ? C.std : null, stdState = null;
  if (STD) C.measures.forEach(function (id) { defaults['v_' + id] = ''; });
  var defGroups = {}; form.querySelectorAll('.grp').forEach(function (c) { defGroups[c.value] = c.checked; });
  var cbx = $('opt_epaule'), defCbx = cbx ? cbx.checked : null;
  var rad = form.querySelector('input[type="radio"][name="np"]'), defRad = rad ? form.querySelector('input[name="np"]:checked').value : null;

  var dl = $('dl'), dl1 = $('dl1'), npg = $('npg'), msg = $('msg');
  var dlP = dl.closest('p') || dl, dl1P = dl1.closest('p') || dl1, npgP = npg ? npg.closest('p') : null;
  var lastP = msg.nextElementSibling;
  var piecesDiv = $('pieces') && $('pieces').querySelector('.grp') ? $('pieces') : null;
  var seamN = seamNodes(false), calN = calNodes(document.querySelector('label[for="v_meas"]'), false);

  function labelText(id) { var l = form.querySelector('label[for="v_' + id + '"]'); if (!l) return id; var c = l.cloneNode(true); c.querySelectorAll('small').forEach(function (s) { s.remove(); }); return c.textContent.replace(/\s+/g, ' ').trim(); }
  function unitOf(id) { var u = $('v_' + id).parentNode.querySelector('.u'); return u ? u.textContent.trim() : ''; }
  function fmt(id) { var e = $('v_' + id); if (e.tagName === 'SELECT') return e.options[e.selectedIndex].textContent.trim(); if (e.value.trim() === '') return ''; if (window.UNITS && window.UNITS.active(e)) return window.UNITS.fmtCm(e.value); var v = e.value.replace('.', ','); var u = unitOf(id); return v + (u ? (u === '°' || u === '%' ? '' : ' ') + u : ''); }
  function nodeOf(t) {
    if (typeof t !== 'string') return null;
    if (t.charAt(0) === '@') { var e = $(t.slice(1)); return e ? e.closest('.pieces') : null; }
    if (t.charAt(0) === '+') { var e2 = $(t.slice(1)); var b = e2 ? e2.closest('.pieces') : null; return b ? b.nextElementSibling : null; }
    if (t.charAt(0) === '~') { var r = form.querySelector('input[name="' + t.slice(1) + '"]'); return r ? r.closest('.pieces') : null; }
    return fld(t);
  }

  var steps = [];
  var top = document.createElement('div'); top.className = 'wz-top'; top.innerHTML = '<div class="wz-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="wz-bar"></div></div><p class="wz-count" aria-live="polite"></p>';
  var stage = document.createElement('div'); stage.className = 'wz-stage';
  var nav = document.createElement('div'); nav.className = 'wz-nav';
  nav.innerHTML = '<button type="button" class="wz-prev">' + L.prev + '</button><button type="button" class="wz-next">' + L.next + '</button>';
  var priv = document.createElement('p'); priv.className = 'wz-priv'; priv.innerHTML = '<small>' + L.priv + ' <a href="#" id="wz-clear">' + L.clear + '</a></small>';

  function step(key, title, count, kind) { var s = document.createElement('section'); s.className = 'wz-step'; s.dataset.k = key; s.dataset.title = title; s.dataset.count = count || ''; s.dataset.kind = kind || ''; s.setAttribute('tabindex', '-1'); var h = document.createElement('h2'); h.textContent = title; s.appendChild(h); stage.appendChild(s); steps.push(s); return s; }

  /* étape « Style » (saharienne) : premier écran, avant l'accueil des mesures */
  var UI = window.SAH_STYLE_UI || null, sS = null;
  if (UI) { sS = step('style', UI.title, UI.title, 'style'); UI.build(sS); }
  var i0 = UI ? 1 : 0;

  /* 0. accueil */
  var s0 = step('intro', L.intro, '', 'intro');
  if (STD) { var h0 = s0.querySelector('h2'); if (h0) h0.insertAdjacentHTML('beforebegin', '<p class="cq-lead">' + L.stdAfter + '</p>'); }
  var mids = C.measures, nM = STD ? 1 : mids.length;
  var ul = (C.intro.list && nM > 1 && !STD) ? '<ol class="wz-list">' + mids.map(function (id) { return '<li>' + labelText(id) + '</li>'; }).join('') + '</ol>' : '';
  s0.insertAdjacentHTML('beforeend', (STD ? '<p>' + L.introPrio(STD.prio.length, C.measures.length - STD.prio.length) + '</p><p>' + L.introTape + (STD.genre === 'femme' ? L.introBra : '') + '</p>' : C.intro.lead + ul + C.intro.after) + (UI ? '' : '<div class="wz-resume" hidden></div>'));
  if (UI) sS.insertAdjacentHTML('beforeend', '<div class="wz-resume" hidden></div>');

  /* mesures */
  var figEl = null, figPlace = null, fldEl = {};
  function buildStd() {
    var T = window.TAILLES_STD[STD.genre], statKeys = Object.keys(T.statures), sizes = Object.keys(T.tailles[T.statures[statKeys[0]]]);
    var s = step('m0', L.mes, L.mes, 'mes');
    var EQ = (window.TAILLES_STD.equivalences || {})[STD.genre] || {};
    var sizeLabel = function (z) { var q = EN && EQ[z]; if (!q) return z; return STD.genre === 'homme' ? z + ' (UK/US ' + q.UK_US_poitrine_pouces + ')' : z + ' (UK ' + q.UK + ' · US ' + q.US + ')'; };
    var statLabel = function (k) { var nm = (EN && STD.genre === 'homme' && k === 'petite') ? L.stat.short : L.stat[k]; return nm + ' (' + T.statures[k] + ' cm)'; };
    var h = '<section class="wz-blk wz-b1"><h3>' + L.b1 + '</h3><div class="wz-stdrow"><label for="wz-size">' + L.sizeL + '</label><select id="wz-size"><option value="">' + L.pick + '</option>' + sizes.map(function (z) { return '<option value="' + z + '">' + sizeLabel(z) + '</option>'; }).join('') + '</select>' +
      '<label for="wz-stat">' + L.statL + '</label><select id="wz-stat"><option value="">' + L.pick + '</option>' + statKeys.map(function (k) { return '<option value="' + k + '">' + statLabel(k) + '</option>'; }).join('') + '</select></div>' +
      '<p class="wz-stdmsg" id="wz-stdmsg" role="status" aria-live="polite"></p></section>';
    s.insertAdjacentHTML('beforeend', h);
    var b2 = document.createElement('section'); b2.className = 'wz-blk'; b2.innerHTML = '<h3>' + L.b2 + '</h3><p class="wz-smintro">' + L.b2p + '</p>';
    var b3 = document.createElement('section'); b3.className = 'wz-blk'; b3.innerHTML = '<h3>' + L.b3 + '</h3><p class="wz-smintro">' + L.b3p + '</p>';
    s.appendChild(b2); s.appendChild(b3);
    var guideOf = {}; C.measures.forEach(function (id, k) { guideOf[id] = (C.guide && C.guide[k]) || {}; });
    var ids = STD.prio.concat(C.measures.filter(function (id) { return STD.prio.indexOf(id) < 0; })), els = {};
    ids.forEach(function (id) { els[id] = fld(id); });
    ids.forEach(function (id) {
      var f = els[id], pr = STD.prio.indexOf(id) >= 0;
      if (pr) { var lb = f.querySelector('label'); lb.insertAdjacentHTML('beforeend', ' <small class="wz-chk">' + L.chk + '</small>'); }
      f.dataset.mid = id; (pr ? b2 : b3).appendChild(f); fldEl[id] = f;
    });
    figEl = document.createElement('figure'); figEl.className = 'wz-fig'; figEl.innerHTML = '<img alt=""><figcaption></figcaption>';
    function showFig(id) {
      var g = guideOf[id]; if (!g || !g.img) return;
      var im = figEl.querySelector('img'); im.src = g.img; im.alt = g.alt || ''; figEl.querySelector('figcaption').innerHTML = (g.text || '');
      Array.prototype.forEach.call(s.querySelectorAll('.fld.wz-sel'), function (x) { x.classList.remove('wz-sel'); });
      figEl.dataset.mid = id;
      var f = fldEl[id];
      f.classList.add('wz-sel'); f.appendChild(figEl);
    }
    figPlace = showFig;
    /* grand dessin dans le cadre de droite tant que l'aperçu du patron est vide */
    var pv = $('prev'), bigEl = null;
    if (pv && pv.parentNode) {
      bigEl = document.createElement('figure'); bigEl.id = 'wz-big'; bigEl.innerHTML = '<img alt=""><figcaption></figcaption>';
      pv.parentNode.insertBefore(bigEl, pv);
      var syncBig = function () { bigEl.classList.toggle('on', pv.childElementCount === 0); };
      new MutationObserver(syncBig).observe(pv, { childList: true }); syncBig();
    }
    var showFig0 = showFig;
    showFig = function (id) {
      showFig0(id);
      var g = guideOf[id];
      if (bigEl && g && g.img) { bigEl.querySelector('img').src = g.img; bigEl.querySelector('img').alt = g.alt || ''; bigEl.querySelector('figcaption').innerHTML = '<b>' + labelText(id) + '</b> : ' + (g.text || ''); }
    };
    figPlace = showFig;
    s.addEventListener('focusin', function (ev) { var f = ev.target.closest && ev.target.closest('.fld'); if (f && f.dataset.mid) showFig(f.dataset.mid); });
    showFig(STD.prio[0]);
    var zs = s.querySelector('#wz-size'), zt = s.querySelector('#wz-stat'), msg = s.querySelector('#wz-stdmsg');
    function fill() {
      if (!zs.value || !zt.value) return;
      msg.textContent = '';
      var vals = T.tailles[T.statures[zt.value]][zs.value], base = {};
      Object.keys(vals).forEach(function (id) { var e = $('v_' + id); if (e) { e.value = vals[id]; base[id] = String(vals[id]); } });
      stdState = { size: zs.value, stat: zt.value, base: base };
      C.measures.forEach(function (id) { var e = $('v_' + id); if (e) e.dispatchEvent(new Event('input', { bubbles: true })); });
      save();
    }
    [zs, zt].forEach(function (e) { e.addEventListener('change', function () { msg.textContent = ''; fill(); }); });
    s.dataset.std = '1';
    return s;
  }
  if (STD) buildStd();
  if (!STD) mids.forEach(function (id, k) {
    var g = (C.guide && C.guide[k]) || {};
    var s = step('m' + k, labelText(id), nM > 1 ? L.kofn(k + 1, nM) : L.one, 'mes');
    var wrap = document.createElement('div'); wrap.className = 'wz-mes';
    if (g.img) wrap.insertAdjacentHTML('beforeend', '<img src="' + g.img + '" alt="' + (g.alt || '') + '">');
    var side = document.createElement('div'); side.className = 'wz-side';
    if (g.text) side.insertAdjacentHTML('beforeend', '<p class="wz-expl">' + g.text + '</p>');
    side.appendChild(fld(id));
    wrap.appendChild(side); s.appendChild(wrap);
  });

  /* modèle */
  var sM = null;
  if (C.model) {
    sM = step('modele', C.model.title, C.model.title, 'model');
    sM.insertAdjacentHTML('beforeend', '<p>' + C.model.text + '</p>');
    C.model.nodes.forEach(function (t) {
      if (t && typeof t === 'object') { sM.insertAdjacentHTML('beforeend', '<h3>' + t.h3 + '</h3>'); return; }
      var n = nodeOf(t); if (n) sM.appendChild(n);
    });
  }

  /* avancé */
  var sA = step('avance', L.adv, L.adv, 'adv');
  if (C.aisances && C.aisances.length) { C.aisances.forEach(function (id) { sA.appendChild(fld(id)); }); }
  if (piecesDiv) { sA.insertAdjacentHTML('beforeend', '<h3>' + L.pcs + '</h3>'); sA.appendChild(piecesDiv); }
  sA.insertAdjacentHTML('beforeend', '<h3>' + L.seam + '</h3>'); seamN.forEach(function (n) { sA.appendChild(n); });
  sA.insertAdjacentHTML('beforeend', '<h3>' + L.cal + '</h3>'); calN.forEach(function (n) { sA.appendChild(n); });

  /* récapitulatif */
  var sR = step('recap', L.recap, L.recap, 'recap');
  var recap = document.createElement('div'); recap.className = 'wz-recap'; sR.appendChild(recap);
  var dls = document.createElement('div'); dls.className = 'wz-dls'; var tipP = dlP.previousElementSibling; if (tipP && tipP.classList.contains('dltip')) dls.appendChild(tipP); dls.appendChild(dlP); if (npgP) dls.appendChild(npgP); dls.appendChild(dl1P); dls.appendChild(msg); if (lastP) dls.appendChild(lastP);
  sR.appendChild(dls);
  /* « Un problème ? » et « Vous avez réalisé ce modèle ? » : seulement à l’étape de téléchargement */
  var pbN = document.querySelector('p.note'); var cuN = document.getElementById('cpuserP'); if (cuN) sR.appendChild(cuN); if (pbN && pbN.querySelector('#cpset')) sR.appendChild(pbN);
  var apN = document.getElementById('appel-photo'); if (apN) sR.appendChild(apN);

  Array.prototype.slice.call(form.children).forEach(function (n) { n.remove(); });
  form.appendChild(top); form.appendChild(stage); form.appendChild(nav); form.appendChild(priv);

  var iR = steps.length - 1, iA = iR - 1, iM = C.model ? iR - 2 : iR - 3;

  /* --- navigation --- */
  var cur = -1, returnTo = -1;
  var bar = top.querySelector('.wz-bar'), count = top.querySelector('.wz-count'), prog = top.querySelector('.wz-prog');
  var bPrev = nav.querySelector('.wz-prev'), bNext = nav.querySelector('.wz-next');

  function stepErrors(s) {
    var bad = false;
    Array.prototype.slice.call(s.querySelectorAll('input[id^="v_"]')).forEach(function (i) {
      i.dispatchEvent(new Event('input', { bubbles: true }));
      var e = $('e_' + i.id.slice(2)); if (e && e.textContent.trim()) bad = true;
    });
    return bad;
  }
  function go(n, opts) {
    if (n < 0 || n >= steps.length) return;
    returnTo = opts && opts.from !== undefined ? opts.from : -1;
    cur = n;
    steps.forEach(function (s, i) { s.classList.toggle('on', i === n); });
    document.documentElement.setAttribute('data-wz-step', steps[n].dataset.k);
    priv.hidden = steps[n].dataset.k !== 'intro';
    if (n === iR) buildRecap();
    var pct = Math.round(100 * n / iR);
    bar.style.width = pct + '%'; prog.setAttribute('aria-valuenow', pct);
    var s = steps[n];
    count.textContent = (n === i0 || n === 0) ? '' : (s.dataset.kind === 'mes' && nM > 1 ? s.dataset.count + ' · ' + s.dataset.title : s.dataset.count);
    bPrev.hidden = n === 0;
    bNext.hidden = n === iR;
    bNext.textContent = returnTo >= 0 ? L.back : (n === i0 ? L.start : (n === iA ? L.see : (UI && n === 0 ? L.nextM : L.next)));
    var rs = UI && document.querySelector('.wz-resume'); if (rs) rs.hidden = !(n === 0 && rs.dataset.has);
    nav.classList.toggle('single', !UI && n === 0);
    if (!opts || !opts.quiet) { try { s.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) { } var f = s.querySelector('input[type="number"]'); if (f && n > i0 && n <= iM && !s.dataset.std && !(window.matchMedia && window.matchMedia('(pointer:coarse)').matches)) { try { f.focus({ preventScroll: true }); f.select(); } catch (e) { } } }
  }
  bNext.addEventListener('click', function () {
    if (steps[cur].dataset.std) {
      var empty = Array.prototype.slice.call(steps[cur].querySelectorAll('input[id^="v_"]')).some(function (i) { return i.value.trim() === ''; });
      if (empty) { var sm = $('wz-stdmsg'); if (sm) { sm.textContent = L.needSize; try { steps[cur].querySelector('.wz-b1').scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { } } return; }
    }
    if (stepErrors(steps[cur])) return;
    if (returnTo >= 0) { go(iR); return; }
    go(cur + 1);
  });
  bPrev.addEventListener('click', function () { returnTo = -1; go(cur - 1); });
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'number') { e.preventDefault(); bNext.click(); } });

  /* --- récapitulatif : chaque ligne a son bouton Modifier --- */
  function rowsOf(s, idx) {
    var rows = [], seen = {};
    function add(l, v) { if (v === '' || v == null) v = '<span class="wz-empty">' + L.fill + '</span>'; rows.push('<tr><th scope="row">' + l + '</th><td>' + v + '</td><td><button type="button" class="wz-mod" data-s="' + idx + '" aria-label="' + L.edit + ' : ' + l.replace(/"/g, '') + '">' + L.edit + '</button></td></tr>'); }
    Array.prototype.slice.call(s.querySelectorAll('input,select')).forEach(function (e) {
      if (e.id && e.id.indexOf('v_') === 0) { add(labelText(e.id.slice(2)), fmt(e.id.slice(2))); }
      else if (e.id === 'opt_epaule') { if (true) return; add(e.parentNode.textContent.replace(/\s+/g, ' ').trim(), e.checked ? L.yes : L.no); }
      else if (e.type === 'radio') { if (seen[e.name]) return; seen[e.name] = 1; var ch = s.querySelector('input[name="' + e.name + '"]:checked'); var h3 = (C.radio && C.radio[e.name]) || e.name; add(h3, ch ? ch.parentNode.textContent.replace(/\s+/g, ' ').trim() : ''); }
    });
    if (s === sA) {
      if (piecesDiv) { var g = Array.prototype.slice.call(form.querySelectorAll('.grp:checked')).map(function (c) { return c.parentNode.textContent.split(':')[0].trim(); }).join(', ') || L.none; add(L.pcs, g); }
    }
    return rows.join('');
  }
  function styleRecap() {
    var rows = UI.recap().map(function (x) { return '<tr><th scope="row">' + x[0] + '</th><td>' + x[1] + '</td><td><button type="button" class="wz-mod" data-s="0" aria-label="' + L.edit + ' : ' + x[0].replace(/"/g, '') + '">' + L.edit + '</button></td></tr>'; }).join('');
    var sm = UI.smalls(), ul2 = sm.items.length ? '<h3>' + sm.title + '</h3><p class="wz-smintro">' + sm.intro + '</p><ul class="wz-small">' + sm.items.map(function (x) { return x.act ? '<li><button type="button" class="wz-dlsm" data-act="' + x.act + '">' + x.label + '</button></li>' : '<li><a class="wz-dlsm" href="' + x.href + '" target="_blank" rel="noopener">' + x.label + '</a></li>'; }).join('') + '</ul>' : '';
    return '<h3>' + UI.title + '</h3><table class="wz-t"><tbody>' + rows + '</tbody></table>' + ul2;
  }
  function stdLine() {
    if (!stdState) return '';
    var n = 0, ch = {}; Object.keys(stdState.base).forEach(function (id) { var e = $('v_' + id); if (e && e.value !== stdState.base[id] && parseFloat(e.value) !== parseFloat(stdState.base[id])) { n++; ch[id] = 1; } });
    var allP = STD.prio.every(function (id) { return ch[id]; }), allM = C.measures.every(function (id) { return ch[id]; }), lv = allM ? 2 : (allP ? 1 : 0);
    var T = window.TAILLES_STD[STD.genre], nm = (EN && STD.genre === 'homme' && stdState.stat === 'petite') ? L.stat.short : L.stat[stdState.stat];
    return '<p class="wz-stdline">' + L.recapStd(stdState.size, nm.toLowerCase(), n, lv) + '</p>';
  }
  function buildRecap() {
    var html = (UI ? styleRecap() : '') + '<h3>' + L.mes + '</h3>' + stdLine() + '<table class="wz-t"><tbody>' + steps.slice(i0 + 1, i0 + 1 + nM).map(function (s, k) { return rowsOf(s, i0 + 1 + k); }).join('') + '</tbody></table>' + (function () { var nt = ''; return nt ? '<p class="wz-note">' + nt + '</p>' : ''; })() +
      (C.model ? '<h3>' + C.model.title + '</h3><table class="wz-t"><tbody>' + rowsOf(sM, iM) + '</tbody></table>' : '') +
      '<h3>' + L.adv.replace(/ \(.*\)$/, '') + '</h3><table class="wz-t"><tbody>' + rowsOf(sA, iA) + '</tbody></table>' + (UI && UI.extra ? UI.extra() : '');
    recap.innerHTML = html;
    Array.prototype.slice.call(recap.querySelectorAll('[data-act="cart"]')).forEach(function (b) { b.addEventListener('click', function () { UI.cartPdf(); }); });
    Array.prototype.slice.call(recap.querySelectorAll('.wz-mod')).forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.s, { from: iR }); }); });
  }

  /* --- mémorisation --- */
  var tm = null;
  function save() {
    clearTimeout(tm); tm = setTimeout(function () {
      var v = {}; inputs().forEach(function (i) { v[i.id] = i.value; });
      var g = {}; form.querySelectorAll('.grp').forEach(function (c) { g[c.value] = c.checked; });
      var o = { t: Date.now(), v: v, g: g };
      if (stdState) o.std = stdState;
      if (cbx) o.c = cbx.checked; if (rad) { var r = form.querySelector('input[name="np"]:checked'); if (r) o.r = r.value; }
      lsSet(o);
    }, 300);
  }
  form.addEventListener('input', save); form.addEventListener('change', save);
  function fire() {
    var ins = inputs(); var list = C.touchAll ? ins : [ins[0]];
    ins.forEach(function (i) { if (i.tagName === 'SELECT') i.dispatchEvent(new Event('change', { bubbles: true })); });
    list.forEach(function (i) { if (i.tagName !== 'SELECT') i.dispatchEvent(new Event('input', { bubbles: true })); });
    if (cbx) cbx.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function apply(o) {
    if (STD) { stdState = o.std || null; var zs = $('wz-size'), zt = $('wz-stat'); if (zs && stdState) { zs.value = stdState.size; zt.value = stdState.stat; } }
    Object.keys(o.v || {}).forEach(function (id) { var i = $(id); if (i && id !== 'v_meas') i.value = o.v[id]; });
    Object.keys(o.g || {}).forEach(function (k) { var c = form.querySelector('.grp[value="' + k + '"]'); if (c) c.checked = !!o.g[k]; });
    if (cbx && typeof o.c === 'boolean') cbx.checked = o.c;
    if (rad && o.r) { var r = form.querySelector('input[name="np"][value="' + o.r + '"]'); if (r) r.checked = true; }
    fire();
  }
  function reset() {
    if (STD) { stdState = null; var zs = $('wz-size'), zt = $('wz-stat'), sm = $('wz-stdmsg'); if (zs) { zs.value = ''; zt.value = ''; sm.textContent = ''; } }
    Object.keys(defaults).forEach(function (id) { $(id).value = defaults[id]; });
    form.querySelectorAll('.grp').forEach(function (c) { c.checked = defGroups[c.value]; });
    if (cbx) cbx.checked = defCbx;
    if (rad) { var r = form.querySelector('input[name="np"][value="' + defRad + '"]'); if (r) r.checked = true; }
    fire();
  }
  $('wz-clear').addEventListener('click', function (e) { e.preventDefault(); lsDel(); reset(); if (UI) UI.reset(); go(0); var r = document.querySelector('.wz-resume'); r.hidden = true; r.dataset.has = ''; });
  if (STD) { reset(); }
  var saved = lsGet();
  if (saved && saved.v) {
    var d = new Date(saved.t), ds = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    var r0 = document.querySelector('.wz-resume'); r0.hidden = false;
    if (UI) {
      r0.dataset.has = '1'; r0.innerHTML = '<p><button type="button" class="wz-alt" id="wz-resume">' + L.resumeS + ds + '</button></p>';
      nav.parentNode.insertBefore(r0, nav.nextSibling);
      $('wz-resume').addEventListener('click', function () { apply(saved); go(iR); });
    } else {
      r0.innerHTML = '<p><button type="button" class="wz-big" id="wz-resume">' + L.resume + ds + '</button> <button type="button" class="wz-alt" id="wz-restart">' + L.restart + '</button></p>';
      $('wz-resume').addEventListener('click', function () { apply(saved); go(iR); });
      $('wz-restart').addEventListener('click', function () { reset(); go(i0 + 1); });
    }
  }

  /* --- aperçu mobile : réduit en haut, s'agrandit au toucher --- */
  var pv = document.querySelector('.card.sticky');
  Array.prototype.slice.call(document.querySelectorAll('.card.sticky')).forEach(function (p) { p.classList.add('wz-pv'); p.insertAdjacentHTML('afterbegin', '<p class="wz-pvhint"><small>' + L.hint + '</small></p>'); p.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('button')) return; if (window.innerWidth <= 760) p.classList.toggle('zoom'); }); });

  /* composition : le croquis et l'aperçu des pièces sont groupés ; sur téléphone, les pièces sont repliées par défaut */
  if (UI) {
    var sk = document.getElementById('sketchcard'), pc = document.querySelector('.card.sticky:not(#sketchcard)');
    if (sk && pc) {
      var pair = document.createElement('div'); pair.className = 'wz-pair'; sk.parentNode.insertBefore(pair, sk); pair.appendChild(sk); pair.appendChild(pc);
      pc.classList.add('folded');
      var fb = document.createElement('button'); fb.type = 'button'; fb.className = 'wz-fold'; fb.textContent = L.showPcs; pc.insertAdjacentElement('afterbegin', fb);
      fb.addEventListener('click', function (ev) { ev.stopPropagation(); var f = pc.classList.toggle('folded'); fb.textContent = f ? L.showPcs : L.hidePcs; });
    }
  }

  /* chapeaux : sur téléphone, la coupe schématique reste collée en haut pendant la saisie */
  var prof = document.querySelector('.card.rc .prof');
  if (prof && !pv) {
    var home = prof.parentNode, nextSib = prof.nextSibling;
    var box = document.createElement('div'); box.className = 'card wz-pv wz-prof';
    var mn = document.querySelector('main') || form.parentNode; mn.insertBefore(box, mn.firstChild);
    var mq = window.matchMedia('(max-width:760px)');
    var place = function () {
      if (mq.matches) { if (prof.parentNode !== box) { box.appendChild(prof); box.insertAdjacentHTML('afterbegin', '<p class="wz-pvhint"><small>' + L.hint + '</small></p>'); } }
      else if (prof.parentNode === box) { home.insertBefore(prof, nextSib); box.innerHTML = ''; box.classList.remove('zoom'); }
    };
    box.addEventListener('click', function () { if (mq.matches) box.classList.toggle('zoom'); });
    if (mq.addEventListener) mq.addEventListener('change', place); else mq.addListener(place);
    place();
  }

  /* clavier tactile : l'aperçu collé suit la partie réellement visible de l'écran et se réduit */
  var vv = window.visualViewport, pvs = Array.prototype.slice.call(document.querySelectorAll('.wz-pv'));
  if (vv && pvs.length) {
    var adj = function () {
      var small = window.innerWidth <= 760, kb = window.innerHeight - vv.height > 120;
      pvs.forEach(function (e) {
        e.style.transform = small && vv.offsetTop > 1 ? 'translateY(' + Math.round(vv.offsetTop) + 'px)' : '';
        e.classList.toggle('kb', small && kb);
      });
    };
    vv.addEventListener('resize', adj); vv.addEventListener('scroll', adj);
  }

  go(0, { quiet: true });
})();
