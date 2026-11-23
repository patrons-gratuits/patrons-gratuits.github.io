(function () {
  'use strict';
  /* Fenêtre « Avant de télécharger » : choix pièces superposées / séparées, nombre de pages et plan d'assemblage. */
  var EN = /^en/i.test(document.documentElement.lang || '');
  var T = EN ? { pvTitle: 'Before downloading', pvSup: 'Stacked pieces', pvSupD: 'Linings, facings and interfacings are drawn on the piece they derive from. Fewer pages, slightly more to read.', pvSep: 'Separate pieces', pvSepD: 'Each piece has its own outline, including linings and interfacings. More pages, easier to read.', pvPlan: 'Assembly plan (page 1 of the PDF)', pvSepCap: 'Each piece is printed on its own pages.', pvCancel: 'Cancel', pvGo: 'Download the PDF', pvWait: 'Calculating…', pgw: 'pages' }
    : { pvTitle: 'Avant de télécharger', pvSup: 'Pièces superposées', pvSupD: 'Les doublures et entoilages sont tracés sur la pièce dont ils dérivent. Moins de pages, un peu plus de lecture.', pvSep: 'Pièces séparées', pvSepD: 'Chaque pièce a son propre tracé, y compris doublures et entoilages. Plus de pages, lecture simple.', pvPlan: 'Plan d’assemblage (page 1 du PDF)', pvSepCap: 'Chaque pièce est imprimée sur ses propres pages.', pvCancel: 'Annuler', pvGo: 'Télécharger le PDF', pvWait: 'Calcul en cours…', pgw: 'pages' };
  window.SAH_MODE = window.SAH_MODE || 'sup';
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
  window.SAH_PREVIEW = preview;
})();
