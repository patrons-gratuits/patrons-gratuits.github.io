/* Étape « Style » du bermuda : coupe, plis, longueur, bas des jambes et poches, avec le croquis.
   Fournit window.SAH_STYLE_UI (lu par etapes.js). Les champs restent des <select id="v_…"> :
   etapes.js les mémorise et partage.js les met dans le lien de partage. Les textes viennent de window.BERM_UI. */
(function () {
  'use strict';
  var T = window.BERM_UI || {};
  var $ = function (id) { return document.getElementById(id); };
  function lbl(id) { var e = $('v_' + id), l = e && e.closest('.fld') && e.closest('.fld').querySelector('label'); return l ? l.textContent.replace(/\s+/g, ' ').trim() : id; }
  function opt(id) { var e = $('v_' + id); return e && e.selectedIndex >= 0 ? e.options[e.selectedIndex].text : ''; }
  function leg(fs) { var l = fs && fs.querySelector('legend'); return l ? l.textContent.trim() : ''; }
  function pocket(pre) {
    var t = $('v_cq_' + pre + 't'); if (!t) return '';
    var s = t.options[t.selectedIndex].text;
    if (t.value === '0') return s;
    var r = $('v_cq_' + pre + 'r'), f = $('v_cq_' + pre + 'f');
    return s + (r && r.value === '1' ? ', ' + T.flap + ' (' + f.options[f.selectedIndex].text.toLowerCase() + ')' : ', ' + T.noflap);
  }
  /* vue face / dos du croquis (carte séparée, comme les autres patrons) */
  function setView(v) {
    var F = $('cq_f'), D = $('cq_d'), bf = $('st-vf'), bd = $('st-vd'); if (!F || !D) return;
    F.style.display = v === 'face' ? '' : 'none'; D.style.display = v === 'dos' ? '' : 'none';
    if (bf) bf.setAttribute('aria-pressed', String(v === 'face')); if (bd) bd.setAttribute('aria-pressed', String(v === 'dos'));
  }
  setView('face');
  if ($('st-vf')) { $('st-vf').onclick = function () { setView('face'); }; $('st-vd').onclick = function () { setView('dos'); }; }
  document.addEventListener('change', function (e) {
    if (!e.isTrusted) return; var id = e.target && e.target.id || '';
    if (/^v_cq_a/.test(id)) setView('dos'); else if (/^v_(cq_c|P_|bas)/.test(id)) setView('face');
  });
  window.SAH_STYLE_UI = {
    title: T.title, fromUrl: false,
    build: function (sec) {
      var a = function (href, txt, on) { return '<a href="' + href + '"' + (on ? ' aria-current="page"' : '') + ' style="display:inline-block;margin:0 .5em .4em 0;padding:.4em .8em;border:1px solid #2A7F96;border-radius:.5em;text-decoration:none;' + (on ? 'background:#2A7F96;color:#fff;font-weight:700' : 'color:#2A7F96;font-weight:600') + '">' + txt + '</a>'; };
      sec.insertAdjacentHTML('beforeend', '<div class="pieces" style="margin-bottom:1em"><h3 style="margin:.2em 0">' + T.who + '</h3>' + a('bermuda-homme.html', T.gm, T.g === 'homme') + a('bermuda-femme.html', T.gf, T.g === 'femme') + '</div>');
      sec.insertAdjacentHTML('beforeend', '<p class="cq-lead">' + T.lead + '</p>');
      ['w_P_Coupe', 'w_P_Plis', 'w_P_AuDessusGenou', 'w_bas', 'bm-hem', 'cqcard', 'bm-consigne', 'pk'].forEach(function (id) {
        var n = $(id); if (n) sec.appendChild(n);
      });
    },
    share: function () { return { v: {}, d: {} }; },
    setShare: function () { },
    reset: function () { },
    recap: function () {
      var rows = [[lbl('P_Coupe'), opt('P_Coupe')], [lbl('P_Plis'), opt('P_Plis')], [lbl('P_AuDessusGenou'), opt('P_AuDessusGenou')], [lbl('bas'), opt('bas')]];
      var c = pocket('c'), a = pocket('a');
      rows.push([T.pc, c]); rows.push([T.pa, a]);
      return rows;
    },
    extra: function () {
      if (!window.BERM_COMPUTE || !window.BermMetrage) return '';
      var ps; try { ps = window.BERM_COMPUTE(); } catch (e) { return ''; }
      var v = window.BERM_VARS || {}, pk = function (p) { var t = $('v_cq_' + p + 't'), r = $('v_cq_' + p + 'r'); return { t: t ? t.value : '0', r: !!r && r.value === '1' }; };
      var cm = window.BermMetrage.estimate(ps, window.BermMetrage.pockets(v, { c: pk('c'), a: pk('a') }));
      if (!cm) return '';
      var txt = (window.UNITS && window.UNITS.mode() === 'in') ? (Math.round(Math.ceil(cm / 91.44 * 8) / 8 * 1000) / 1000).toString().replace('.', /^en/i.test(document.documentElement.lang || '') ? '.' : ',') + ' yd' : (cm / 100).toFixed(2).replace('.', /^en/i.test(document.documentElement.lang || '') ? '.' : ',') + ' m';
      return '<h3>' + T.yt + '</h3><table class="wz-t"><tbody><tr><th scope="row">' + T.ym + '</th><td>' + txt + '</td></tr></tbody></table><p class="wz-note">' + T.yn + '</p>';
    },
    links: function () { return []; },
    cartPdf: function () { },
    smalls: function () {
      var items = [];
      [['pk1'], ['pk2']].forEach(function (p) { var a = $(p[0]); if (a && !a.hidden && a.getAttribute('href')) items.push({ href: a.getAttribute('href'), label: a.textContent.trim() }); });
      return { title: T.smt, intro: T.smi, dl: '', items: items };
    },
    sepLabel: ''
  };
})();
