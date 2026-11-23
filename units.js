/* Unités : cm / pouces (in).
   Le patron calcule toujours en cm : le champ d'origine (id v_…) garde la valeur exacte en cm, sans arrondi.
   En mode « pouces », un champ de saisie supplémentaire (classe uin) affiche et reçoit des pouces (fractions ¼ ½ ¾, ou huitièmes sous 2 in) ;
   chaque saisie est convertie une seule fois (× 2,54) dans le champ d'origine. */
(function () {
  'use strict';
  var K = 2.54, LANG = (document.documentElement.lang || 'fr').toLowerCase(), EN = LANG.indexOf('en') === 0, KEY = 'units_pref';
  var FR8 = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
  var T = EN ? { lab: 'Units', cm: 'cm', inch: 'in' } : { lab: 'Unités', cm: 'cm', inch: 'pouces' };

  function pref() {
    try { var v = localStorage.getItem(KEY); if (v === 'cm' || v === 'in') return v; } catch (e) {}
    var l = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    return (EN && l === 'en-us') ? 'in' : 'cm';
  }
  var mode = pref();

  /* ---------- conversions ---------- */
  function stepFor(inch) { return Math.abs(inch) < 2 ? 1 / 8 : 1 / 4; }
  function fracStr(x, st) { // x en pouces, déjà multiple de st
    if (x < -1e-9) return '-' + fracStr(-x, st);
    var n = Math.floor(x + 1e-9), f = Math.round((x - n) / (1 / 8));
    if (f === 8) { n++; f = 0; }
    var s = f ? FR8[f] : '';
    if (n === 0 && s) return s;
    return n + (s ? ' ' + s : '');
  }
  function fmtIn(inch) { var st = stepFor(inch), r = Math.round(inch / st) * st; return fracStr(r, st); }
  function fmtCm(cm) { var c = parseFloat(String(cm).replace(',', '.')); return isNaN(c) ? '' : fmtIn(c / K); }
  function inwardLo(cm) { var i = cm / K, st = stepFor(i); return fracStr(Math.ceil(i / st - 1e-9) * st, st); }
  function inwardHi(cm) { var i = cm / K, st = stepFor(i); return fracStr(Math.floor(i / st + 1e-9) * st, st); }
  var UF = { '⅛': 1 / 8, '¼': 1 / 4, '⅜': 3 / 8, '½': 1 / 2, '⅝': 5 / 8, '¾': 3 / 4, '⅞': 7 / 8 };
  function parseIn(s) { // → pouces (nombre) ou null
    s = String(s).trim().replace(',', '.'); if (!s) return null;
    var sign = 1; if (s.charAt(0) === '-') { sign = -1; s = s.slice(1).trim(); }
    var tot = 0, ok = false, m;
    s = s.replace(/[⅛¼⅜½⅝¾⅞]/g, function (c) { return ' ' + UF[c] + ' '; });
    s = s.replace(/-/g, ' ');
    var parts = s.split(/\s+/).filter(Boolean);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if ((m = /^(\d+)\/(\d+)$/.exec(p))) { if (+m[2] === 0) return null; tot += +m[1] / +m[2]; ok = true; }
      else if (/^\d*\.?\d+$/.test(p) || /^\d+\.$/.test(p)) { tot += parseFloat(p); ok = true; }
      else return null;
    }
    return ok ? sign * tot : null;
  }

  /* ---------- textes (aide, messages) ---------- */
  var NUM = '((?:(?<!\\d)-)?\\d+(?:[.,]\\d+)?)';
  function n(x) { return parseFloat(String(x).replace(',', '.')); }
  function convertHint(str) { // plages : arrondi vers l'intérieur ; autres valeurs : arrondi au pas d'affichage
    var re = new RegExp(NUM + '\\s*(to|à|and|et)\\s*' + NUM + '\\s*cm\\b', 'g');
    str = str.replace(re, function (_, a, w, b) { return inwardLo(n(a)) + ' ' + w + ' ' + inwardHi(n(b)) + ' in'; });
    str = str.replace(new RegExp('(' + NUM + '(?:\\s*[×x]\\s*' + NUM + ')+)\\s*cm\\b', 'g'), function (_, list) { return list.split(/\s*[×x]\s*/).map(function (v) { return fmtCm(n(v)); }).join(' × ') + ' in'; });
    return str.replace(new RegExp(NUM + '\\s*cm\\b', 'g'), function (_, a) { return fmtCm(n(a)) + ' in'; });
  }
  function convertMsg(str) {
    var re = new RegExp(NUM + '\\s*(to|à|and|et)\\s*' + NUM + '\\s*cm\\b', 'g');
    str = str.replace(re, function (_, a, w, b) { return inwardLo(n(a)) + ' ' + w + ' ' + inwardHi(n(b)) + ' in'; });
    str = str.replace(new RegExp('(' + NUM + '(?:\\s*[×x]\\s*' + NUM + ')+)\\s*cm\\b', 'g'), function (_, list) { return list.split(/\s*[×x]\s*/).map(function (v) { return fmtCm(n(v)); }).join(' × ') + ' in'; });
    return str.replace(new RegExp(NUM + '\\s*cm\\b', 'g'), function (_, a) { return fmtCm(n(a)) + ' in'; });
  }

  /* ---------- champs ---------- */
  var fields = []; // {real, shadow, u, hint, hintOrig}
  function isCmField(inp) {
    if (!inp || inp.type !== 'number' || !/^v_/.test(inp.id) || inp.id === 'v_meas') return false;
    var u = inp.nextElementSibling; return !!(u && u.classList.contains('u') && u.textContent.trim() === 'cm');
  }
  var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  function refresh(f) {
    if (mode !== 'in') return;
    if (document.activeElement === f.shadow) return;
    f.shadow.value = fmtCm(proto.get.call(f.real));
    f.shadow.classList.toggle('bad', f.real.classList.contains('bad'));
  }
  function setup(real) {
    if (real.__uin) return; real.__uin = true;
    var u = real.nextElementSibling, sh = document.createElement('input');
    sh.type = 'text'; sh.className = 'uin'; sh.setAttribute('inputmode', 'decimal'); sh.setAttribute('autocomplete', 'off');
    sh.setAttribute('aria-label', (document.querySelector('label[for="' + real.id + '"]') || {}).textContent || real.id);
    sh.style.display = 'none'; sh.id = 'ui_' + real.id.slice(2);
    real.parentNode.insertBefore(sh, real.nextSibling);
    var fld = real.closest('.fld'), hint = fld && fld.querySelector('small.hint');
    var f = { real: real, shadow: sh, u: u, hint: hint, hintOrig: hint ? hint.innerHTML : '' };
    fields.push(f);
    Object.defineProperty(real, 'value', { get: function () { return proto.get.call(this); }, set: function (v) { proto.set.call(this, v); refresh(f); }, configurable: true });
    sh.addEventListener('input', function () {
      var i = parseIn(sh.value);
      if (i === null) { proto.set.call(real, ''); }
      else { proto.set.call(real, String(Math.round(i * K * 1e6) / 1e6)); }
      real.dispatchEvent(new Event('input', { bubbles: true }));
    });
    sh.addEventListener('blur', function () { var i = parseIn(sh.value); if (i !== null) sh.value = fmtIn(i); });
    try { new MutationObserver(function () { sh.classList.toggle('bad', real.classList.contains('bad')); }).observe(real, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
    var lab = document.querySelector('label[for="' + real.id + '"]'); if (lab) lab.addEventListener('click', function (ev) { if (mode === 'in') { ev.preventDefault(); sh.focus(); } });
  }
  function applyMode(noRedraw) {
    fields.forEach(function (f) {
      var inch = mode === 'in';
      f.real.style.display = inch ? 'none' : ''; f.shadow.style.display = inch ? '' : 'none';
      if (f.u) f.u.textContent = inch ? 'in' : 'cm';
      if (f.hint) f.hint.innerHTML = inch ? convertHint(f.hintOrig) : f.hintOrig;
      if (inch) { f.shadow.value = fmtCm(proto.get.call(f.real)); }
    });
    var sel = document.querySelectorAll('select.units-sel'); sel.forEach(function (s) { s.value = mode; });
    document.querySelectorAll('.err, .frac').forEach(fixErr);
    document.querySelectorAll('#wz-stat option').forEach(function (o) {
      if (!o.value) return;
      if (o.dataset.o === undefined) o.dataset.o = o.textContent;
      o.textContent = mode === 'in' ? o.dataset.o.replace(/\((\d+(?:[.,]\d+)?) cm\)/, function (_, a) { return '(' + fmtCm(a) + ' in)'; }) : o.dataset.o;
    });
    applyTables();
    watchSvg(); document.querySelectorAll('main svg').forEach(fixSvg);
    if (!noRedraw && fields[0]) { fields[0].real.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  function fixErr(e) { if (mode === 'in' && /cm\b/.test(e.textContent)) { var t = convertMsg(e.textContent); if (t !== e.textContent) e.textContent = t; } }
  function watchErrors() {
    document.querySelectorAll('.err, .frac').forEach(function (e) {
      try { new MutationObserver(function () { fixErr(e); }).observe(e, { childList: true, characterData: true, subtree: true }); } catch (x) {}
    });
  }
  /* étiquettes de cotes dans les schémas (SVG) */
  var svgBusy = false;
  function fixSvg(svg) {
    if (mode !== 'in' || svgBusy) return;
    svgBusy = true;
    try {
      svg.querySelectorAll('text, tspan').forEach(function (t) {
        if (t.children.length && t.tagName.toLowerCase() === 'text' && t.querySelector('tspan')) return;
        var v = t.textContent; if (/\bcm\b/.test(v)) t.textContent = convertMsg(v);
      });
    } finally { svgBusy = false; }
  }
  function watchSvg() {
    document.querySelectorAll('main svg').forEach(function (sv) {
      if (sv.__uw) return; sv.__uw = true;
      try { new MutationObserver(function () { fixSvg(sv); }).observe(sv, { childList: true, subtree: true, characterData: true }); } catch (x) {}
      fixSvg(sv);
    });
  }
  /* tableaux de tailles standard */
  var tables = [];
  function setupTables() {
    document.querySelectorAll('table.tstd').forEach(function (t) {
      if (t.__ut) return; t.__ut = true;
      var cap = t.querySelector('caption'), cells = [];
      var hs = Array.prototype.slice.call(t.querySelectorAll('thead th')).map(function (h) { return h.textContent; });
      t.querySelectorAll('tbody tr').forEach(function (tr) {
        Array.prototype.slice.call(tr.children).forEach(function (td, i) { if (i >= 1 && !/UK|US/.test(hs[i] || '')) cells.push({ td: td, o: td.textContent }); });
      });
      tables.push({ t: t, cap: cap, capO: cap ? cap.textContent : '', cells: cells });
    });
  }
  function applyTables() {
    tables.forEach(function (x) {
      var inch = mode === 'in';
      if (x.cap) x.cap.textContent = inch ? x.capO.replace(/\(cm\)/, '(in)') : x.capO;
      x.cells.forEach(function (c) { c.td.textContent = inch ? fmtCm(c.o) : c.o; });
    });
  }
  function selector(first) {
    if (first.tagName === 'TABLE') {
      var w = first.parentNode, pp = document.createElement('p'), idt = 'units' + Math.random().toString(36).slice(2, 7);
      pp.className = 'units-line'; pp.style.cssText = 'margin:.4em 0 .8em';
      pp.innerHTML = '<label for="' + idt + '">' + T.lab + (EN ? ': ' : ' : ') + '</label><select class="units-sel" id="' + idt + '"><option value="cm">' + T.cm + '</option><option value="in">' + T.inch + '</option></select>';
      w.parentNode.insertBefore(pp, w);
      pp.querySelector('select').addEventListener('change', function () { setMode(this.value); });
      return;
    }
    var host = first.closest('.wz-step') || first.closest('form') || first.parentNode;
    var p = document.createElement('p'); p.className = 'units-line'; p.style.cssText = 'margin:.4em 0 .8em';
    var id = 'units' + Math.random().toString(36).slice(2, 7);
    p.innerHTML = '<label for="' + id + '">' + T.lab + (EN ? ': ' : ' : ') + '</label><select class="units-sel" id="' + id + '"><option value="cm">' + T.cm + '</option><option value="in">' + T.inch + '</option></select>';
    var h = host.querySelector('h2'); if (h && h.parentNode === host) host.insertBefore(p, h.nextSibling); else host.insertBefore(p, host.firstChild);
    p.querySelector('select').addEventListener('change', function () { setMode(this.value); });
  }
  function setMode(m) {
    mode = m; try { localStorage.setItem(KEY, m); } catch (e) {}
    applyMode(); document.dispatchEvent(new CustomEvent('unitschange', { detail: m }));
  }
  function init() {
    var list = Array.prototype.slice.call(document.querySelectorAll('input[id^="v_"]')).filter(isCmField);
    setupTables();
    if (!list.length) {
      if (!tables.length) return;
      selector(tables[0].t); applyMode(true); return;
    }
    list.forEach(setup); selector(list[0]); watchErrors(); applyMode(true);
    var tm = null;
    try {
      new MutationObserver(function () {
        if (tm) return;
        tm = setTimeout(function () {
          tm = null;
          var nw = Array.prototype.slice.call(document.querySelectorAll('input[id^="v_"]')).filter(function (i) { return !i.__uin && isCmField(i); });
          if (nw.length) { nw.forEach(setup); watchErrors(); applyMode(true); }
        }, 60);
      }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  window.UNITS = {
    mode: function () { return mode; },
    active: function (inp) { return mode === 'in' && !!inp && !!inp.__uin; },
    fmtCm: function (cm) { return fmtCm(cm) + ' in'; },
    fmt: fmtCm, parse: parseIn, set: setMode
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
