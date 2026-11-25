/* Petit signe « Projetable » sur les cartes de patron, avec lien vers la page vidéoprojection.
   (Un lien ne peut pas être imbriqué dans le lien de la carte : on utilise un élément role="link".) */
(function () {
  'use strict';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var T = EN ? { t: 'Projector-ready', h: 'Sewing with a projector' } : { t: 'Projetable', h: 'Coudre avec un vidéoprojecteur' };
  var st = document.createElement('style');
  st.textContent = '.proj-tag{display:inline-flex;align-items:center;gap:4px;margin:.3em 0 .6em;padding:1px 8px;border:1px solid currentColor;border-radius:99px;font-size:.74rem;line-height:1.5;color:var(--ac2,#0b6a86);cursor:pointer;text-decoration:none;background:transparent}.proj-tag:hover,.proj-tag:focus-visible{background:rgba(0,122,148,.1)}.proj-tag svg{width:14px;height:14px;flex:none}';
  document.head.appendChild(st);
  var ico = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="8" width="14" height="8" rx="2"/><circle cx="9" cy="12" r="2"/><path d="M19 9l3-2v10l-3-2"/></svg>';
  function go(e) { e.preventDefault(); e.stopPropagation(); location.href = 'videoprojection.html'; }
  [].forEach.call(document.querySelectorAll('a.tile'), function (a) {
    if (a.querySelector('.proj-tag')) return;
    var s = document.createElement('span'); s.className = 'proj-tag'; s.setAttribute('role', 'link'); s.tabIndex = 0; s.title = T.h;
    s.innerHTML = ico + '<span>' + T.t + '</span>';
    s.addEventListener('click', go);
    s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') go(e); });
    var go_ = a.querySelector('.go'); if (go_) a.insertBefore(s, go_); else a.appendChild(s);
  });
})();
