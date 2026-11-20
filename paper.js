/* Choix du papier (A4 / Letter) : ajoute un sélecteur près des boutons de téléchargement et transmet le format aux générateurs PDF.
   Le PDF d'une page pour vidéoprojection n'est pas concerné. Les calculs restent en cm. */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || 'fr').toLowerCase().indexOf('en') === 0, KEY = 'paper_size';
  function get() {
    try { var v = localStorage.getItem(KEY); if (v === 'a4' || v === 'letter') return v; } catch (e) {}
    var l = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    return /^(en-us|en-ca|fr-ca|es-us|es-mx)$/.test(l) ? 'letter' : 'a4';
  }
  var cur = get();
  window.PAPER_CHOICE = cur;
  var FACT = 50.8 / 50; // le carré de contrôle de la page Letter fait 2 in = 50,8 mm
  /* injecte le format dans les appels aux générateurs */
  function wrap(obj, name) {
    if (!obj || !obj[name] || obj[name].__paper) return;
    var o = obj[name];
    var w = function (a, b, c) {
      var opts = (name === 'layout') ? null : Object.assign({}, b || {});
      if (name === 'layout') { if (obj.setPaper) obj.setPaper(window.PAPER_CHOICE); return o.apply(this, arguments); }
      if (!opts.paper) opts.paper = window.PAPER_CHOICE;
      if (opts.paper === 'letter' && opts.title && !opts.single) opts.title = String(opts.title).replace(/\bA4\b/g, 'Letter');
      if (opts.paper === 'letter' && !opts.single && !opts.proj && opts.scale && opts.scale > 0.5 && opts.scale < 2) { opts.scale = opts.scale * FACT; if (Math.abs(opts.scale - 1) < 1e-6) opts.scale = 1; }
      return o.call(this, a, opts, c);
    };
    w.__paper = true; obj[name] = w;
  }
  function install() {
    if (window.PatternPDF) { wrap(window.PatternPDF, 'build'); wrap(window.PatternPDF, 'layout'); }
    if (window.PatternSheet) { wrap(window.PatternSheet, 'build'); wrap(window.PatternSheet, 'count'); wrap(window.PatternSheet, 'plan'); }
  }
  install();
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);

  var T = EN
    ? { lab: 'Paper size', a4: 'A4', letter: 'Letter (US, Canada)', dl: 'Download the %p PDF', sheets: '%p sheets', hint: '(leave %v if exact)' }
    : { lab: 'Papier', a4: 'A4', letter: 'Letter (États-Unis, Canada)', dl: 'Télécharger le PDF %p', sheets: 'feuilles %p', hint: '(laisser %v si exact)' };
  var nodes = []; // {n: nœud texte, t: texte d'origine}
  function pn() { return cur === 'letter' ? 'Letter' : 'A4'; }
  function collect(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) if (/\bA4\b/.test(n.nodeValue) && !(n.parentNode && n.parentNode.nodeName === 'OPTION') && !nodes.some(function (x) { return x.n === n; })) nodes.push({ n: n, t: n.nodeValue });
  }
  function meas() { return document.getElementById('v_meas'); }
  function applyMeas(prev) {
    var m = meas(); if (!m) return;
    var inch = parseFloat(m.max) < 10, was = inch ? (prev === 'letter' ? '2' : '1.97') : (prev === 'letter' ? '50.8' : '50'), now = inch ? (cur === 'letter' ? '2' : '1.97') : (cur === 'letter' ? '50.8' : '50');
    var vv = parseFloat(m.value);
    if (vv === parseFloat(was) || (arguments[1] === 'norm' && (vv === 50 || vv === 50.8 || vv === 2 || vv === 1.97))) { m.value = now; m.dispatchEvent(new Event('input', { bubbles: true })); }
    if (!inch) m.step = '0.1';
    var lab = document.querySelector('label[for=v_meas] small');
    if (lab && !inch) lab.textContent = T.hint.replace('%v', cur === 'letter' ? (EN ? '50.8' : '50,8') : '50');
  }
  function render() {
    nodes.forEach(function (x) { x.n.nodeValue = x.t.replace(/\bA4\b/g, pn()); });
    document.querySelectorAll('select.paper-sel').forEach(function (s) { s.value = cur; });
  }
  function change(v) {
    var prev = cur; cur = v; window.PAPER_CHOICE = v;
    try { localStorage.setItem(KEY, v); } catch (e) {}
    render(); applyMeas(prev);
    document.dispatchEvent(new CustomEvent('paperchange', { detail: v }));
  }
  function ui() {
    var anchors = document.querySelectorAll('#dl, .cdl');
    if (!anchors.length) return;
    anchors.forEach(function (b) {
      var host = b.closest('p') || b;
      collect(b);
      var p = document.createElement('p'); p.className = 'paper-line'; p.style.cssText = 'margin:.8em 0 .4em';
      var id = 'paper' + Math.random().toString(36).slice(2, 7);
      p.innerHTML = '<label for="' + id + '">' + T.lab + (EN ? ':' : ' :') + ' </label><select class="paper-sel" id="' + id + '"><option value="a4">' + T.a4 + '</option><option value="letter">' + T.letter + '</option></select>';
      host.parentNode.insertBefore(p, host);
      p.querySelector('select').addEventListener('change', function () { change(this.value); });
    });
    collect(document.querySelector('main') || document.body);
    render(); applyMeas(cur, 'norm'); setTimeout(function () { applyMeas(cur, 'norm'); }, 600); window.addEventListener('load', function () { applyMeas(cur, 'norm'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
