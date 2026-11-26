/* robe-mini-accueil.js — carte « Robes » de la page d'accueil : la robe Béa seule (sans silhouette),
   en longueur maxi, avec les mots Mini / Midi / Maxi à droite. Charger après croquis-robe.js.
   Libellés : data-l="Mini,Midi,Maxi" sur le <svg id="rb-mini"> (mêmes mots en anglais). */
(function () {
  try {
    var s = document.getElementById('rb-mini'); if (!s || !window.CroquisRobe) return;
    var opt = function (L) { return { vue: 'face', longueur: L, poche: 'passepoil', nbPoches: 1, silhouette: false }; };
    CroquisRobe.draw(s, opt('longue'));
    var NS = 'http://www.w3.org/2000/svg', tmp = document.createElementNS(NS, 'svg');
    tmp.setAttribute('style', 'position:absolute;visibility:hidden'); document.body.appendChild(tmp);
    var hem = function (L) { CroquisRobe.draw(tmp, opt(L)); var b = tmp.getBBox(); return b.y + b.height; };
    var noms = (s.getAttribute('data-l') || 'Mini,Midi,Maxi').split(',');
    var yMini = hem('mini') - 4, yMaxi = hem('longue') - 16; tmp.remove();
    var ys = [yMini, (yMini + yMaxi) / 2, yMaxi];            // Midi : à mi-chemin entre Mini et Maxi
    var bb = s.getBBox(), g = '';
    ys.forEach(function (y, i) {
      g += '<text x="' + (bb.x + bb.width + 20) + '" y="' + y + '" font-family="system-ui,sans-serif" font-size="24" font-weight="600" fill="#2f5867">' + noms[i] + '</text>';
    });
    s.insertAdjacentHTML('beforeend', g);
    bb = s.getBBox(); var m = 14;
    s.setAttribute('viewBox', [bb.x - m, bb.y - m, bb.width + 2 * m, bb.height + 2 * m].join(' '));
  } catch (e) {}
})();
