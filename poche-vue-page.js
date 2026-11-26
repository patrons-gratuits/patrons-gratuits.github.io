/* poche-vue-page.js — branche le visuel « Votre poche » sur le formulaire des pages de poches */
(function () {
  var g = function (n, d) { var e = document.getElementById('v_' + n); var v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  var r = function (c, d) { var e = document.querySelector(c + ':checked'); return e ? e.value : d; };
  function up() {
    var svg = document.getElementById('vue'); if (!svg || !window.PocheVue) return;
    var ty = (document.getElementById('type') || {}).value || 'simple';
    var box = document.getElementById('revvue');
    if (!box) {                                             // choix du sens du revers, pour l'aperçu seulement
      box = document.createElement('p'); box.id = 'revvue'; box.className = 'vnote';
      var en = /^en/.test(document.documentElement.lang || '');
      box.innerHTML = en
        ? 'Cuff facing: <label><input type="radio" name="revvue" value="int" checked> turned inside</label> <label><input type="radio" name="revvue" value="ext"> turned outside</label><br><small>This is chosen when sewing: it does not change the pattern.</small>'
        : 'Revers : <label><input type="radio" name="revvue" value="int" checked> vers l’intérieur</label> <label><input type="radio" name="revvue" value="ext"> vers l’extérieur</label><br><small>Ce choix se fait au montage : il ne change pas le patron.</small>';
      svg.parentNode.insertBefore(box, svg.nextSibling);
    }
    var vr = r('input[name=vr]', ty);                       // variante éventuelle (sou1, sou2)
    var t = vr || ty, rb = r('.rb', 'none');
    var lat = /lat|dbl|sou1|sou2/.test(t), cen = /cen|dbl|sou2/.test(t);
    box.style.display = cen ? 'none' : '';
    var one = /sou1|sou2/.test(t), std = function (k) { return one ? k : 1; };   /* réalisation en une pièce : valeurs par défaut plus grandes (4 et 3,5) ; le schéma garde l’épaisseur de la réalisation standard */
    PocheVue.draw(svg, {
      forme: r('.pc', 'rect'), H: g('H_poche', 16), L: g('L_poche', 14), biseau: g('A_biseau_entree', 0),
      revers: g('H_revers', 2.4), revType: cen ? 'ext' : r('input[name=revvue]', 'int'),     /* revers rajouté (soufflet central, double) : toujours visible ; revers intégré : au choix, pour l'aperçu */
      lat: lat ? g('Prof_soufflet_lat', 2) * std(.5) : 0, pli: cen ? r('.pl', 'e') : null, pliProf: g('Prof_pli_central', 2) * std(2 / 3.5),
      coupe: g('Prop_angle_coupe', .25), arrondi: g('Prop_angle_arrondi', .2),
      rabat: rb === 'none' ? null : rb, rabH: g('Prop_H_rabat', .25), rabL: g('Add_L_rabat', .5),
      rabCoupe: g('Prop_rabat_angle_coupe', .3), rabArrondi: g('Prop_rabat_angle_arrondi', .4), pal: 'bleu'
    });
  }
  document.addEventListener('input', up); document.addEventListener('change', up);
  window.addEventListener('load', function () { setTimeout(up, 50); });
})();
