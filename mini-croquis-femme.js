/* Aperçu privé : accueil. Le choix « Coupe : Homme / Femme » du mini-croquis est déplacé sous le texte d'introduction ;
   le bouton principal mène à la page de la saharienne femme quand « Femme » est choisi.
   À charger après mini-croquis.js (version à deux coupes). Injecté seulement dans le zip d'aperçu. */
(function () {
  'use strict';
  function setup() {
    var root = document.querySelector('.mc'), txt = document.querySelector('.hero2-txt');
    var cta = root && document.getElementById(root.dataset.cta);
    var seg = root && root.querySelector('.mc-ctl .mc-seg');
    if (!root || !txt || !cta || !seg || txt.dataset.gen) return; txt.dataset.gen = 1;
    var lab = seg.querySelector('.mc-lab'); if (lab) lab.textContent = /^en/i.test(document.documentElement.lang || '') ? 'Jacket for' : 'Saharienne pour';
    seg.style.cssText = 'align-items:flex-start;margin:18px 0 18px';
    txt.insertBefore(seg, cta);
    function fix() {
      var f = seg.querySelector('button[data-v="f"]').getAttribute('aria-pressed') === 'true';
      if (!f) return;
      var m = /[?&]manches=(\w+)/.exec(cta.getAttribute('href') || '');
      var h = 'saharienne-femme.html' + (m && m[1] === 'courtes' ? '?manches=courtes' : '');
      if (cta.getAttribute('href') !== h) cta.setAttribute('href', h);
    }
    new MutationObserver(fix).observe(cta, { attributes: true, attributeFilter: ['href'] });
    fix();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(setup, 0); }); else setTimeout(setup, 0);
})();
