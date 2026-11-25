/* Commandes de la vue 3D des chapeaux : glisser pour tourner / incliner, curseur vertical d'inclinaison.
   Chapeau3DUI.bind(ids, st, redraw)
     ids : id du ou des <svg> (le glissement et le curseur .vinc[data-v=ids[0]] pilotent le même état)
     st  : { az, el, e0, e1, fixe } (azimut, élévation et bornes en degrés ; fixe = pas de rotation horizontale)
     redraw : fonction qui redessine uniquement l'aperçu 3D
   Chapeau3DUI.fast : vrai pendant le mouvement (le dessin est alors allégé). */
(function () {
  'use strict';
  var UI = window.Chapeau3DUI = { fast: false };
  UI.bind = function (ids, st, redraw) {
    ids = [].concat(ids);
    var sl = document.querySelector('.vinc[data-v=' + ids[0] + ']');
    function fastDraw() { UI.fast = true; try { redraw(); } finally { UI.fast = false; } }
    if (sl) {
      sl.min = st.e0; sl.max = st.e1; sl.step = 1; sl.value = st.el;
      sl.addEventListener('input', function () { st.el = +sl.value; fastDraw(); });
      sl.addEventListener('change', function () { st.el = +sl.value; redraw(); });
    }
    ids.forEach(function (id) {
      var sv = document.getElementById(id), p = null, moved = false;
      if (!sv) return;
      sv.style.touchAction = 'none'; sv.style.cursor = 'grab';
      sv.addEventListener('pointerdown', function (e) { p = [e.clientX, e.clientY, st.az, st.el]; moved = false; try { sv.setPointerCapture(e.pointerId); } catch (x) {} sv.style.cursor = 'grabbing'; });
      sv.addEventListener('pointermove', function (e) {
        if (!p) return;
        if (Math.abs(e.clientX - p[0]) + Math.abs(e.clientY - p[1]) > 5) moved = true;
        if (!st.fixe) st.az = p[2] + (e.clientX - p[0]) * 0.6;
        st.el = Math.max(st.e0, Math.min(st.e1, p[3] + (e.clientY - p[1]) * 0.3));
        if (sl) sl.value = st.el;
        fastDraw();
      });
      // un glissement ne doit pas déclencher le « toucher pour agrandir » de la page
      sv.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); moved = false; } }, true);
      ['pointerup', 'pointercancel'].forEach(function (t) {
        sv.addEventListener(t, function () { if (p) { var m = moved; p = null; if (m) redraw(); } sv.style.cursor = 'grab'; });
      });
    });
  };
})();
