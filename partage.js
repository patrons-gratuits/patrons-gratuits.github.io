/* Menu « Partager » : un lien qui porte le patron réglé et, si l'on veut, les mesures du corps.
   Les données sont placées après le « # » de l'adresse : elles ne sont jamais envoyées au serveur.
   Format 1 : {f:1, pg:page, n:prénom, M:[mesures dans l'ordre de WZ_CFG.measures], P:{réglages différents des valeurs par défaut},
              g:[groupes de pièces décochés], s:{choix de style différents des valeurs par défaut}, v:version}
   Étape 1 (envoi) seulement : la fenêtre de réception viendra ensuite. */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var T = EN ? {
    share: 'Share', inc: 'Include my measurements', warn: 'This link contains your measurements: only send it to someone you trust.',
    copy: 'Copy link', send: 'Send…', mail: 'Email', wa: 'WhatsApp', sms: 'Text message', name: 'Your first name (optional)',
    msgl: 'Message (you can edit it)', ok: 'Link copied', ko: 'Copy failed: select the link below and copy it.', close: 'Close',
    sub: 'My measurements for {pattern}', w: 'Here are my measurements and the {pattern} pattern I chose on patrons-gratuits.fr: {link}',
    wo: 'Here is the {pattern} pattern I designed on patrons-gratuits.fr: {link}',
    rc: 'Cancel', rtN: '{n} is sending you her measurements and her “{p}” design', rt0: 'You have received measurements and a “{p}” design', rtoN: '{n} is sending you her “{p}” design', rto0: 'You have received a “{p}” design',
    b1N: 'I’m sewing for {n}', b10: 'I’m sewing for this person', s1N: 'The pattern opens with {n}’s design, options and measurements.', s10: 'The pattern opens with this person’s design, options and measurements.',
    b2: 'I want the same design for myself', s2a: 'Only the design and options are used, without {n}’s measurements; the pattern takes the measurements already saved on this device, to check before downloading.', s2b: 'Only the design and options are used, without {n}’s measurements; your own measurements are then entered.', thisp: 'this person',
    bo: 'Open this design', so: 'The pattern opens with the same design and options.', ct: 'Copy as text',
    ft: 'Share and keep a record', sh1: 'Send this pattern as set up, with or without your measurements, by email, WhatsApp or text message.', sh2: 'One A4 page with your sketch, measurements and a link to reopen this pattern.', sh3: 'To paste them into your notes or a message.', cutxt: 'Copy my settings as text', intro: 'Whoever receives the link opens this pattern already set up, ready to download.', nameh: 'Shown to the recipient: ‘Claire’s measurements’.', fx: 'One printable page (A4) with your sketch, measurements, options and a link to reopen this pattern: ideal to archive or to give to your tailor. In the print window choose “Save as PDF”.',
    fiche: 'Summary sheet (print / PDF)', fh: 'Summary sheet', fd: 'Date', fl: 'Link to reopen this pattern with the same settings (measurements included)', fn: 'Notes', fs: 'Free pattern – patrons-gratuits.fr', fm: 'Tip: in the print window choose “Save as PDF” to archive.',
    saved: 'Saved measurements', mine: 'My measurements', of: '{name}’s measurements', recv: 'Received measurements', loaded: 'Settings loaded. The summary is above; the PDF download buttons and the sheet to archive are right here.',
    dm: '{name}’s measurements', dm0: 'measurements', pat: 'pattern', v: { s: 'plain', d: 'lined' }, sea: ['summer', 'mid-season'], len: { mini: 'mini', midi: 'midi' }
  } : {
    share: 'Partager', inc: 'Inclure mes mesures', warn: 'Ce lien contient vos mesures : ne l’envoyez qu’à une personne de confiance.',
    copy: 'Copier le lien', send: 'Envoyer…', mail: 'E-mail', wa: 'WhatsApp', sms: 'SMS', name: 'Votre prénom (facultatif)',
    msgl: 'Message (modifiable)', ok: 'Lien copié', ko: 'Copie impossible : sélectionnez le lien ci-dessous et copiez-le.', close: 'Fermer',
    sub: 'Mes mesures pour {patron}', w: 'Voici mes mesures et le patron {patron} que j’ai choisi sur patrons-gratuits.fr : {lien}',
    wo: 'Voici le patron {patron} que j’ai composé sur patrons-gratuits.fr : {lien}',
    rc: 'Annuler', rtN: '{n} vous envoie ses mesures et son modèle « {p} »', rt0: 'Vous avez reçu des mesures et un modèle « {p} »', rtoN: '{n} vous envoie son modèle « {p} »', rto0: 'Vous avez reçu un modèle « {p} »',
    b1N: 'Je couds pour {n}', b10: 'Je couds pour cette personne', s1N: 'Le patron s’ouvre avec le modèle, les options et les mesures de {n}.', s10: 'Le patron s’ouvre avec le modèle, les options et les mesures de cette personne.',
    b2: 'Je veux le même modèle pour moi', s2a: 'Seuls le modèle et les options sont repris, sans les mesures de {n} ; le patron prend les mesures déjà enregistrées sur cet appareil, à vérifier avant de télécharger.', s2b: 'Seuls le modèle et les options sont repris, sans les mesures de {n} ; il reste à saisir ses propres mesures.', thisp: 'cette personne',
    bo: 'Ouvrir ce modèle', so: 'Le patron s’ouvre avec le même modèle et les mêmes options.', ct: 'Copier en texte',
    ft: 'Partager et garder une trace', sh1: 'Envoyez ce patron réglé, avec ou sans vos mesures, par e-mail, WhatsApp ou SMS.', sh2: 'Une page A4 avec votre croquis, vos mesures et un lien pour rouvrir ce patron.', sh3: 'Pour les coller dans vos notes ou un message.', cutxt: 'Copier mes réglages en texte', intro: 'La personne qui reçoit le lien ouvre ce patron déjà réglé, prêt à télécharger.', nameh: 'Affiché chez le destinataire : « Mesures de Claire ».', fx: 'Une page imprimable (A4) avec votre croquis, vos mesures, vos options et un lien pour rouvrir ce patron : idéale pour archiver, ou pour la remettre à votre couturière ou à votre tailleur. Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».',
    fiche: 'Fiche récapitulative (imprimer / PDF)', fh: 'Fiche récapitulative', fd: 'Date', fl: 'Lien pour rouvrir ce patron avec les mêmes réglages (mesures comprises)', fn: 'Notes', fs: 'Patron gratuit – patrons-gratuits.fr', fm: 'Astuce : dans la fenêtre d’impression, choisissez « Enregistrer au format PDF » pour archiver.',
    saved: 'Mesures enregistrées', mine: 'Mes mesures', of: 'Mesures de {name}', recv: 'Mesures reçues', loaded: 'Réglages chargés. Le récapitulatif est au-dessus ; les boutons de téléchargement du PDF et la fiche à archiver sont ici.',
    dm: 'mesures de {name}', dm0: 'des mesures', pat: 'patron', v: { s: 'simple', d: 'doublée' }, sea: ['été', 'demi-saison'], len: { mini: 'mini', midi: 'midi' }
  };
  var $ = function (id) { return document.getElementById(id); };
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function pageName() { var m = location.pathname.match(/([^\/]+?)(?:\.html)?$/); return m ? m[1] : 'index'; }
  function patron() { var h = document.querySelector('h1'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : document.title; }
  function hasMeasures() { var C = window.WZ_CFG; return !!(C && C.measures && C.measures.length); }

  /* ---------- les données ---------- */
  function data(include, first) {
    var C = window.WZ_CFG || {}, meas = C.measures || [], o = { f: 1, pg: pageName() };
    if (first) o.n = first;
    if (include && meas.length) o.M = meas.map(function (id) { var e = $('v_' + id); return e ? e.value : ''; });
    var P = {};
    [].forEach.call(document.querySelectorAll('input[id^="v_"], select[id^="v_"]'), function (e) {
      var id = e.id.slice(2); if (id === 'meas' || meas.indexOf(id) > -1) return;
      var dv = e.tagName === 'SELECT' ? ((e.querySelector('option[selected]') || e.options[0] || {}).value) : e.defaultValue;
      if (e.value !== dv) P[id] = e.value;
    });
    if (Object.keys(P).length) o.P = P;
    var g = []; [].forEach.call(document.querySelectorAll('.grp'), function (c) { if (!c.checked) g.push(c.value); });
    if (g.length) o.g = g;
    var UI = window.SAH_STYLE_UI;
    if (UI && UI.share) {
      var sh = UI.share(), s = {};
      Object.keys(sh.d || {}).forEach(function (k) { if (sh.v && sh.v[k] !== undefined && !same(sh.v[k], sh.d[k])) s[k] = sh.v[k]; });
      if (Object.keys(s).length) o.s = s;
      if (sh.ver) o.v = sh.ver;
    }
    return o;
  }
  function link(include, first) {
    return location.origin + location.pathname + '#p1=' + b64(JSON.stringify(data(include, first)));
  }

  var URLS = {
    mail: function (sub, body) { return 'mailto:?subject=' + encodeURIComponent(sub) + '&body=' + encodeURIComponent(body); },
    wa: function (t) { return 'https://wa.me/?text=' + encodeURIComponent(t); },
    sms: function (t) { return 'sms:?&body=' + encodeURIComponent(t); }
  };

  /* ---------- mesures enregistrées (communes à toutes les pages) ---------- */
  var SK = 'pg_mesures_v1';
  function sget() { try { var o = JSON.parse(localStorage.getItem(SK)); if (o && o.sets) return o; } catch (e) { } return { cur: '', sets: [] }; }
  function sset(o) { try { localStorage.setItem(SK, JSON.stringify(o)); } catch (e) { } }
  function ids() { var C = window.WZ_CFG || {}; return C.measures || []; }
  function readForm() { var v = {}, any = false; ids().forEach(function (id) { var e = $('v_' + id); if (e) { v[id] = e.value; if (e.value !== '') any = true; } }); return any ? v : null; }
  function setForm(vals) {
    var first = null, sels = [];
    Object.keys(vals).forEach(function (id) { var e = $('v_' + id); if (!e) return; e.value = vals[id]; if (e.tagName === 'SELECT') sels.push(e); else if (!first) first = e; });
    sels.forEach(function (e) { e.dispatchEvent(new Event('change', { bubbles: true })); });
    if (first) first.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function keepCurrent(o) { var cs = o.sets.filter(function (x) { return x.id === o.cur; })[0], f = readForm(); if (cs && f) cs.vals = f; return o; }
  function switchTo(id) {
    var o = keepCurrent(sget()), t = o.sets.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    o.cur = id; sset(o); setForm(t.vals);
  }

  /* ---------- la fenêtre ---------- */
  var css = '.shx-ov{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:12px}' +
    '.shx-dlg{background:var(--card,#fff);color:inherit;border-radius:14px;max-width:460px;width:100%;max-height:92vh;overflow:auto;padding:16px 16px 14px;box-shadow:0 10px 40px rgba(0,0,0,.3)}' +
    '.shx-dlg h2{margin:0 0 8px;font-size:1.15rem}.shx-dlg label{display:block;margin:8px 0 3px;font-weight:600}.shx-dlg label.chk{display:flex;gap:8px;align-items:center;font-weight:600}' +
    '.shx-dlg input[type=text],.shx-dlg textarea{width:100%;box-sizing:border-box;font:inherit;padding:7px 9px;border:1px solid var(--bd,#cbd5dc);border-radius:8px;background:var(--bg,#fff);color:inherit}' +
    '.shx-dlg textarea{min-height:5.5em;font-size:.9rem}.shx-warn{font-size:.85rem;color:var(--mut,#56707d);margin:6px 0}' +
    '.shx-btns{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}.shx-btns button{width:auto;flex:1 1 130px;margin:0}.shx-foot button{width:auto}.shx-dlg h2{margin-top:0;padding-top:0}.shx-msg{min-height:1.2em;font-size:.85rem;margin:4px 0 0}' +
    '.shx-sv{margin:10px 0 0}.shx-btns button[aria-pressed=true]{outline:3px solid var(--ac2,#b8307a);outline-offset:1px}.shx-ico{vertical-align:-2px;margin-right:5px}.shx-foot{text-align:right;margin-top:6px}' +
    '.shx-fbox{margin:14px 0;padding:12px;border:2px solid #3d6f81;border-radius:10px;background:#f1fafc}.shx-fbox p{margin:4px 0 10px;font-size:13px}.shx-fbox button{width:100%}' +
    '.shx-ct{margin:8px 0 0;text-align:left}.shx-lnk{background:none!important;border:0!important;padding:0!important;color:var(--ac,#3d6f81)!important;text-decoration:underline;font:inherit!important;font-size:13px!important;cursor:pointer;width:auto!important;box-shadow:none!important}.shx-sub{margin:4px 0 12px;font-size:13px;color:#444}' +
    '.shx-expl{font-size:13px;color:#444}.shx-intro{margin:0 0 8px;font-size:.92rem}.shx-hint{display:block;font-size:.8rem;color:var(--mut,#56707d);margin-top:3px}' +
    '.shx-fbox h3{margin:0 0 8px;font-size:1rem}.shx-row{margin:0 0 10px}.shx-row:last-of-type{margin-bottom:0}.shx-row p{margin:4px 0 0;font-size:13px}.shx-row .cpuser{margin:0}' +
    '.shx-fbox .shx-row button{width:100%!important;background:#fff!important;color:#2f5867!important;border:2px solid #3d6f81!important;font-weight:600}.shx-fbox .shx-row button:hover{background:#e4eef1!important}.shx-fbox h3{margin-top:2px!important}' +
    '.cpuser:empty{display:none}body #cpset,body.th #cpset{width:auto!important;display:inline!important;background:none!important;border:0!important;padding:0!important;margin:0!important;color:var(--ac,#3d6f81)!important;text-decoration:underline;font:inherit!important;font-size:13px!important;cursor:pointer;box-shadow:none!important}body.th .shx-fbox #cpuser,.shx-fbox #cpuser{width:100%!important;background:#fff!important;color:#2f5867!important;border:2px solid #3d6f81!important;font-weight:600!important}' +
    '.shx-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:70;background:#2b2b2b;color:#fff;padding:10px 16px;border-radius:10px;max-width:90vw;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '@media(max-width:760px){.shx-ov{align-items:flex-end;padding:0}.shx-dlg{border-radius:14px 14px 0 0;max-width:none}}';
  var ICON = '<svg class="shx-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function open() {
    var old = $('shx'); if (old) old.remove();
    var inc = hasMeasures(), touched = false;
    var ov = document.createElement('div'); ov.id = 'shx'; ov.className = 'shx-ov';
    ov.innerHTML = '<div class="shx-dlg" role="dialog" aria-modal="true" aria-labelledby="shx-t"><h2 id="shx-t">' + ICON + T.share + '</h2><p class="shx-intro">' + esc(T.intro) + '</p>' +
      (inc ? '<label class="chk"><input type="checkbox" id="shx-inc" checked> ' + T.inc + '</label><p class="shx-warn" id="shx-warn">' + T.warn + '</p>' +
        '<label for="shx-name">' + T.name + '</label><input type="text" id="shx-name" autocomplete="off" maxlength="30"><small class="shx-hint">' + esc(T.nameh) + '</small>' : '') +
      '<div id="shx-saved"></div>' +
      '<label for="shx-txt">' + T.msgl + '</label><textarea id="shx-txt"></textarea><div class="shx-btns" id="shx-btns"></div><p class="shx-ct"><button type="button" id="shx-ct" class="shx-lnk">' + esc(T.ct) + '</button></p><p class="shx-msg" id="shx-m" role="status"></p>' +
      '<div class="shx-foot"><button type="button" id="shx-x">' + T.close + '</button></div></div>';
    document.body.appendChild(ov);
    var txt = $('shx-txt'), m = $('shx-m');
    function cur() { var i = $('shx-inc'), n = $('shx-name'); return link(!!(i ? i.checked : false), n ? n.value.trim() : ''); }
    function fill() {
      if (touched) return;
      var i = $('shx-inc'), w = i ? i.checked : false, t = (w ? T.w : T.wo).replace('{patron}', patron()).replace('{pattern}', patron()).replace('{lien}', cur()).replace('{link}', cur());
      txt.value = t; var wn = $('shx-warn'); if (wn) wn.hidden = !w;
    }
    function copyLink() {
      var l = cur();
      function ok() { m.textContent = T.ok; }
      function ko() { m.textContent = T.ko; txt.value = l; txt.focus(); txt.select(); touched = true; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(l).then(ok, ko); else ko();
    }
    var b = $('shx-btns');
    function add(label, fn) { var x = document.createElement('button'); x.type = 'button'; x.textContent = label; x.addEventListener('click', fn); b.appendChild(x); }
    var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    function subj() { return T.sub.replace('{patron}', patron()).replace('{pattern}', patron()); }
    if (navigator.share) add(T.send, function () { navigator.share({ title: subj(), text: txt.value }).catch(function () { }); });
    else {
      add(T.mail, function () { location.href = URLS.mail(subj(), txt.value); });
      add(T.wa, function () { window.open(URLS.wa(txt.value), '_blank', 'noopener'); });
      if (mobile) add(T.sms, function () { location.href = URLS.sms(txt.value); });
    }
    add(T.copy, copyLink);
    $('shx-ct').addEventListener('click', function () {
      var i = $('shx-inc'), S = window.SITE_COPYSETTINGS; if (!S) return;
      var t = S.build(!!(i && i.checked));
      function ok() { m.textContent = S.ok; }
      function ko() { m.textContent = S.ko; txt.value = t; txt.focus(); txt.select(); touched = true; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, ko); else ko();
    });
    txt.addEventListener('input', function () { touched = true; });
    ['shx-inc', 'shx-name'].forEach(function (id) { var e = $(id); if (e) e.addEventListener(id === 'shx-inc' ? 'change' : 'input', fill); });
    function close() { ov.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    $('shx-x').onclick = close;
    (function saved() {
      var o = sget(), box = $('shx-saved'); if (!box || o.sets.length < 2) return;
      box.innerHTML = '<p class="shx-sv"><b>' + T.saved + '</b></p><div class="shx-btns" id="shx-sv"></div>';
      o.sets.forEach(function (x) {
        var y = document.createElement('button'); y.type = 'button'; y.textContent = x.label; y.setAttribute('aria-pressed', String(x.id === o.cur));
        y.addEventListener('click', function () { switchTo(x.id); close(); });
        $('shx-sv').appendChild(y);
      });
    })();
    fill();
    var f = ov.querySelector('button'); if (f) f.focus();
  }

  /* ---------- réception ---------- */
  function decode(h) {
    var m = /^#p1=([A-Za-z0-9_-]+)$/.exec(h || ''); if (!m) return null;
    try { var b = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; var o = JSON.parse(decodeURIComponent(escape(atob(b)))); return o && o.f === 1 ? o : null; } catch (e) { return null; }
  }
  function describe(o) {
    var parts = [], n = o.n && String(o.n).slice(0, 30);
    if (o.M) parts.push(n ? T.dm.replace('{name}', n) : T.dm0);
    var d = [patron()];
    if (o.v) d.push(T.v[o.v] || ''); 
    if (o.s && o.s.len) d.push(T.len[o.s.len] || '');
    var sea = o.s && o.s.sea !== undefined && o.s.sea !== '' ? +o.s.sea : (o.v === 'd' ? 1 : (o.v ? 0 : null));
    if (sea !== null && T.sea[sea]) d.push(T.sea[sea]);
    parts.push(d.filter(Boolean).join(', '));
    return parts.join(' + ');
  }
  function applyProject(o) {
    var meas = ids();
    [].forEach.call(document.querySelectorAll('input[id^="v_"], select[id^="v_"]'), function (e) {
      var id = e.id.slice(2); if (id === 'meas' || meas.indexOf(id) > -1) return;
      var dv = e.tagName === 'SELECT' ? ((e.querySelector('option[selected]') || e.options[0] || {}).value) : e.defaultValue;
      e.value = o.P && o.P[id] !== undefined ? o.P[id] : dv;
    });
    var off = o.g || [];
    [].forEach.call(document.querySelectorAll('.grp'), function (c) { c.checked = off.indexOf(c.value) < 0; c.dispatchEvent(new Event('change', { bubbles: true })); });
    var UI = window.SAH_STYLE_UI; if (UI && UI.setShare) UI.setShare(o.s, o.v);
    var any = document.querySelector('.fld input[id^="v_"]'); if (any) any.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function clearHash() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
  function receive() {
    var o = decode(location.hash); if (!o) return;
    if (o.pg && o.pg !== pageName()) { location.replace(location.pathname.replace(/[^\/]*$/, o.pg + '.html') + location.hash); return; }
    var withM = !!(o.M && ids().length);
    var ov = document.createElement('div'); ov.className = 'shx-ov'; ov.id = 'shx-recv';
    var nm = o.n ? String(o.n).slice(0, 30) : '', pn = patron(), F = function (t, extra) { return t.replace('{n}', nm || (extra || '')).replace('{p}', pn); };
    var title = withM ? (nm ? F(T.rtN) : F(T.rt0)) : (nm ? F(T.rtoN) : F(T.rto0));
    ov.innerHTML = '<div class="shx-dlg" role="dialog" aria-modal="true" aria-labelledby="shx-rt"><h2 id="shx-rt">' + ICON + esc(title) + '</h2><div id="shx-rb"></div></div>';
    document.body.appendChild(ov);
    var b = $('shx-rb');
    function add(label, fn) { var x = document.createElement('button'); x.type = 'button'; x.textContent = label; x.addEventListener('click', fn); b.appendChild(x); return x; }
    function toast(msg) { var t = document.createElement('div'); t.className = 'shx-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 5000); }
    function done(msg) { ov.remove(); clearHash(); if (msg) { toast(msg); if (window.WZ_RECAP) { try { window.WZ_RECAP(); } catch (e) { } setTimeout(function () { var d = document.querySelector('.wz-dls'); if (d) { try { d.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { } } }, 500); } } }
    function loadMeasures() {
      var mid = ids(), vals = {}; mid.forEach(function (id, i) { if (o.M[i] !== undefined) vals[id] = o.M[i]; });
      var st = keepCurrent(sget()), mine = readForm();
      if (!st.sets.length && mine) { st.sets.push({ id: 'mine', label: T.mine, vals: mine }); }
      var n = o.n ? String(o.n).slice(0, 30) : '', label = n ? T.of.replace('{name}', n) : T.recv, nid = 'r' + Date.now();
      st.sets = st.sets.filter(function (x) { return x.label !== label; });
      st.sets.push({ id: nid, label: label, vals: vals }); st.cur = nid; sset(st);
      setForm(vals);
    }
    var rbox = $('shx-rb');
    function add(label, fn, sub) { var x = document.createElement('button'); x.type = 'button'; x.textContent = label; x.addEventListener('click', fn); rbox.appendChild(x); if (sub) { var p = document.createElement('p'); p.className = 'shx-sub'; p.textContent = sub; rbox.appendChild(p); } return x; }
    var who = nm || T.thisp, first;
    if (withM) {
      first = add(nm ? F(T.b1N) : T.b10, function () { loadMeasures(); applyProject(o); done(T.loaded); }, nm ? F(T.s1N) : T.s10);
      var haveSaved = !!(readForm() || sget().sets.length);
      add(T.b2, function () { applyProject(o); done(T.loaded); }, F(haveSaved ? T.s2a : T.s2b, T.thisp));
    } else first = add(T.bo, function () { applyProject(o); done(T.loaded); }, T.so);
    var cn = document.createElement('p'); cn.className = 'shx-ct'; cn.innerHTML = '<button type="button" class="shx-lnk"></button>'; cn.firstChild.textContent = T.rc; cn.firstChild.addEventListener('click', function () { done(); }); rbox.appendChild(cn);
    first.focus();
  }

  /* ---------- fiche récapitulative A4 à archiver ---------- */
  var ficheCss = '#shx-fiche{display:none}' +
    '@media print{body.shx-printing>*:not(#shx-fiche){display:none!important}body.shx-printing{background:#fff!important}#shx-fiche{display:block;font:12px/1.4 Arial,Helvetica,sans-serif;color:#111;padding:0}' +
    '#shx-fiche h1{font-size:20px;margin:0 0 2px}#shx-fiche .f-sub{color:#555;margin:0 0 12px;font-size:11px}#shx-fiche .f-cols{display:flex;gap:16px;align-items:flex-start}' +
    '#shx-fiche .f-sk{flex:0 0 34%;border:1px solid #ccc;border-radius:6px;padding:6px;text-align:center}#shx-fiche .f-sk svg{width:100%;height:auto;max-height:90mm}' +
    '#shx-fiche .f-tb{flex:1;min-width:0}#shx-fiche h3{font-size:13px;margin:10px 0 3px;border-bottom:1px solid #999;padding-bottom:2px}#shx-fiche h3:first-child{margin-top:0}' +
    '#shx-fiche table{width:100%;border-collapse:collapse;margin:0}#shx-fiche th,#shx-fiche td{text-align:left;padding:1px 6px 1px 0;border-bottom:1px solid #e4e4e4;font-weight:normal;vertical-align:top}#shx-fiche td{font-weight:bold}#shx-fiche th,#shx-fiche .wz-t th{color:#333;width:58%!important;white-space:normal}#shx-fiche td,#shx-fiche td *{color:#111!important}#shx-fiche .wz-t{font-size:11px}' +
    '#shx-fiche .f-link{margin-top:8px;font-size:10px;word-break:break-all;font-family:monospace;border:1px dashed #999;padding:6px;border-radius:4px}#shx-fiche .f-nt{margin-top:8px}#shx-fiche .f-nt div{border-bottom:1px solid #bbb;height:18px}' +
    '#shx-fiche .f-ft{margin-top:8px;font-size:10px;color:#666;text-align:center}}';
  function fiche() {
    if (!$('shx-fcss')) { var st = document.createElement('style'); st.id = 'shx-fcss'; st.textContent = ficheCss; document.head.appendChild(st); }
    var rc = window.WZ_BUILD_RECAP ? window.WZ_BUILD_RECAP() : document.querySelector('.wz-recap');
    var old = $('shx-fiche'); if (old) old.remove();
    var box = document.createElement('div'); box.id = 'shx-fiche';
    var tb = document.createElement('div'); tb.className = 'f-tb';
    if (rc) {
      tb.innerHTML = rc.innerHTML;
      [].forEach.call(tb.querySelectorAll('button,.wz-smintro,.wz-small,script,input,.wz-stdmsg'), function (e) { e.remove(); });
      [].forEach.call(tb.querySelectorAll('td'), function (e) { if (!e.textContent.trim()) e.remove(); });
      [].forEach.call(tb.querySelectorAll('h3'), function (h) { var n = h.nextElementSibling; if (!n || n.tagName !== 'TABLE') h.remove(); });
    }
    var sv = document.querySelector('#st-svg, #sketchcard svg, .cq-svg'), sk = '';
    if (sv) { var c = sv.cloneNode(true); c.removeAttribute('id'); var oa = sv.querySelectorAll('*'), ca = c.querySelectorAll('*'); for (var k = 0; k < oa.length && k < ca.length; k++) { var cs = getComputedStyle(oa[k]); ['fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity'].forEach(function (q) { ca[k].style.setProperty(q, cs.getPropertyValue(q)); }); } sk = '<div class="f-sk">' + c.outerHTML + '</div>'; }
    var d = new Date(), ds = d.toLocaleDateString(T.fd === 'Date' && /^en/.test(navigator.language || '') ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    var nl = ''; for (var i = 0; i < 2; i++) nl += '<div></div>';
    box.innerHTML = '<h1>' + esc(patron()) + '</h1><p class="f-sub">' + esc(T.fh) + ' · ' + esc(T.fd) + ' : ' + esc(ds) + '</p><div class="f-cols">' + sk + '</div>' +
      '<p class="f-link"><b>' + esc(T.fl) + '</b><br>' + esc(link(hasMeasures(), '')) + '</p><div class="f-nt"><b>' + esc(T.fn) + '</b>' + nl + '</div><p class="f-ft">' + esc(T.fs) + '</p>';
    box.querySelector('.f-cols').appendChild(tb);
    document.body.appendChild(box);
    var pg = document.createElement('style'); pg.id = 'shx-pg'; pg.textContent = '@page{size:' + (window.PAPER_CHOICE === 'letter' ? 'letter' : 'A4') + ';margin:12mm}'; document.head.appendChild(pg);
    document.body.classList.add('shx-printing');
    function end() { document.body.classList.remove('shx-printing'); box.remove(); pg.remove(); window.removeEventListener('afterprint', end); }
    window.addEventListener('afterprint', end);
    setTimeout(function () { window.print(); }, 150);
  }
  function addVpLink() {
    var d1 = $('dl1'); if (!d1 || document.querySelector('.vp-how')) return;
    var host = d1.closest('p') || d1.parentNode, en = /^en/i.test(document.documentElement.lang || '');
    var sm = document.createElement('small'); sm.className = 'vp-how'; sm.style.cssText = 'display:block;margin-top:4px';
    sm.innerHTML = '<a href="videoprojection.html">' + (en ? 'How?' : 'Comment faire ?') + '</a>';
    host.appendChild(sm);
  }
  function addFicheBtn() {
    addVpLink();
    if ($('shx-fbtn')) return; var dls = document.querySelector('.wz-dls'); if (!dls) return;
    if (!$('shx-css')) { var st = document.createElement('style'); st.id = 'shx-css'; st.textContent = css; document.head.appendChild(st); }
    var bx = document.createElement('div'); bx.className = 'shx-fbox';
    bx.innerHTML = '<h3>' + esc(T.ft) + '</h3>';
    function row(btn, txt, extra) { var r = document.createElement('div'); r.className = 'shx-row'; r.appendChild(btn); if (extra) r.appendChild(extra); var p = document.createElement('p'); p.textContent = txt; r.appendChild(p); bx.appendChild(r); }
    var shb = $('cpshare'); if (!shb) { init(); shb = $('cpshare'); }
    if (shb) row(shb, T.sh1);
    var b = document.createElement('button'); b.type = 'button'; b.id = 'shx-fbtn'; b.textContent = T.fiche; b.addEventListener('click', fiche); row(b, T.sh2);
    var d1 = $('dl1'), d1p = d1 && d1.closest('p'); if (d1p && d1p.parentNode === dls) dls.insertBefore(bx, d1p.nextSibling); else dls.appendChild(bx);
  }

  function init() {
    if ($('cpshare')) return;
    var cs = $('cpset'); if (!cs) return;
    if (!$('shx-css')) { var st = document.createElement('style'); st.id = 'shx-css'; st.textContent = css; document.head.appendChild(st); }
    var b = document.createElement('button'); b.type = 'button'; b.id = 'cpshare'; b.innerHTML = ICON + T.share;
    b.addEventListener('click', open);
    var np = cs.closest('p.note') || cs.parentNode; np.parentNode.insertBefore(b, np);
  }
  window.PARTAGE = { urls: URLS, decode: decode, data: data, link: link };
  function start() {
    if (!$('shx-css')) { var st = document.createElement('style'); st.id = 'shx-css'; st.textContent = css; document.head.appendChild(st); }
    init(); addFicheBtn(); setTimeout(receive, 400); window.addEventListener('hashchange', function () { if (!$('shx-recv')) receive(); });
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
