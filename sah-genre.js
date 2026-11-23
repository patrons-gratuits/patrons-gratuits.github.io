/* Aperçu privé : choix « homme / femme » en tête de l'étape Style des pages saharienne.
   À charger avant etapes.js. Injecté seulement dans le zip d'aperçu (voir build_apercu_femme.py). */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var fem = !!window.SAHF_CFG, ui = window.SAH_STYLE_UI;
  if (!ui || !ui.build) return;
  var T = EN ? { h: 'Who is it for?', m: 'Men’s jacket', f: 'Women’s jacket', here: 'this page' }
             : { h: 'Pour qui ?', m: 'Saharienne homme', f: 'Saharienne femme', here: 'cette page' };
  var ob = ui.build;
  ui.build = function (sec) {
    ob.apply(ui, arguments);
    var d = document.createElement('div'); d.className = 'pieces'; d.style.marginBottom = '1em';
    var a = function (href, txt, on) { return '<a href="' + href + '" style="display:inline-block;margin:0 .5em .4em 0;padding:.4em .8em;border:1px solid #2A7F96;border-radius:.5em;text-decoration:none;' + (on ? 'background:#2A7F96;color:#fff;font-weight:700' : '') + '"' + (on ? ' aria-current="true"' : '') + '>' + txt + '</a>'; };
    d.innerHTML = '<h3 style="margin:.2em 0">' + T.h + '</h3>' +
      a(fem ? 'saharienne.html' : '#', T.m, !fem) + a(fem ? '#' : 'saharienne-femme.html', T.f, fem);
    (sec || document.body).insertBefore(d, (sec || document.body).firstChild);
  };
})();
