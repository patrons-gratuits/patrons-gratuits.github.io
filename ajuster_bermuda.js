/* Ajustement des coutures du bermuda (méthode du bloc Titan de FreeSewing, licence MIT).
 * Calcule les cinq réglages #P_Aj... pour que :
 *  - la couture d'enfourchure dos et devant ait exactement la longueur mesurée ;
 *  - les coutures de côté et d'entrejambe du devant aient la même longueur que celles du dos.
 * Usage : const ov2 = ajusterBermuda(PatternEngine, DATA, ov) ; puis calcul normal avec ov2.
 */
(function (root) {
  'use strict';
  function ajusterBermuda(E, D, ov, opts) {
    opts = opts || {};
    const tol = opts.tol || 0.02;            // cm
    const o = {}; Object.keys(ov || {}).forEach(k => { o[k] = Number(ov[k]); });
    ['#P_AjDos', '#P_AjDevant', '#P_AjLongJambe', '#P_AjCote', '#P_AjEntrejambe'].forEach(k => { o[k] = 0; });
    const run = () => E.computeBlock(D, 0, o, { chain: true });
    const d = (r, a, b) => { const p = r.names.get(a), q = r.names.get(b); return Math.hypot(p.x - q.x, p.y - q.y); };
    const r0 = run();
    // longueurs mesurées
    const getVar = (r, n) => (r.vars && r.vars[n] !== undefined) ? r.vars[n] : NaN;
    const enf = getVar(r0, '#M_Enfourchure'), enfDev = getVar(r0, '#M_EnfourchureDevant');
    const backCS = r => d(r, 'BWI', 'BCSS') + r.curveLen.Spl_BCSS_BFK;
    const frontCS = r => d(r, 'FWI3', 'FCSS3') + r.curveLen.Spl_FFK_FCSS3;
    const seams = r => ({
      dIn: r.curveLen.Spl_FFLI_FFK - r.curveLen.Spl_BFK_BFLI,
      dOut: (r.curveLen.Spl_FWO3_FSO2 + r.curveLen.Spl_FSO2_FFLO) - (r.curveLen.Spl_BWO_BSO + r.curveLen.Spl_BFLO_BSO),
    });
    function secant(key, f, x0, x1) {
      let a = x0, b = x1; o[key] = a; let fa = f(run()); if (Math.abs(fa) < tol) return a;
      for (let i = 0; i < 30; i++) {
        o[key] = b; const fb = f(run());
        if (Math.abs(fb) < tol) return b;
        const c = b - fb * (b - a) / (fb - fa); a = b; fa = fb; b = c;
      }
      o[key] = b; return b;
    }
    secant('#P_AjDos', r => backCS(r) - (enf - enfDev), 0, 1);
    secant('#P_AjDevant', r => frontCS(r) - enfDev, 0, -1);
    let s = seams(run());
    if ((s.dIn < 0 && s.dOut < 0) || (s.dIn > 0 && s.dOut > 0)) {
      secant('#P_AjLongJambe', r => { const t = seams(r); return Math.abs(t.dIn) > Math.abs(t.dOut) ? t.dOut : t.dIn; }, 0, 0.5);
    }
    // Newton à deux variables (côté, entrejambe)
    let x = [0, 0];
    const F = (xx) => { o['#P_AjCote'] = xx[0]; o['#P_AjEntrejambe'] = xx[1]; const t = seams(run()); return [t.dOut, t.dIn]; };
    for (let it = 0; it < 20; it++) {
      const f0 = F(x); if (Math.abs(f0[0]) < tol && Math.abs(f0[1]) < tol) break;
      const h = 0.05, fa = F([x[0] + h, x[1]]), fb = F([x[0], x[1] + h]);
      const J = [[(fa[0] - f0[0]) / h, (fb[0] - f0[0]) / h], [(fa[1] - f0[1]) / h, (fb[1] - f0[1]) / h]];
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0]; if (Math.abs(det) < 1e-12) break;
      const dx0 = (f0[0] * J[1][1] - f0[1] * J[0][1]) / det, dx1 = (J[0][0] * f0[1] - J[1][0] * f0[0]) / det;
      x = [x[0] - dx0, x[1] - dx1];
    }
    F(x);
    const rf = run(), sf = seams(rf);
    o.__controle = { enfourchureDos: backCS(rf) - (enf - enfDev), enfourchureDevant: frontCS(rf) - enfDev, cote: sf.dOut, entrejambe: sf.dIn };
    return o;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = ajusterBermuda; else root.ajusterBermuda = ajusterBermuda;
})(this);
