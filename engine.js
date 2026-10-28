/* Moteur de calcul de patrons paramétriques (indépendant de Seamly2D).
 * Lit les données exportées par build_data.py (data.json) et calcule
 * les points, arcs et pièces d'un bloc, puis les marges de couture.
 * Utilisable dans le navigateur (window.PatternEngine) et dans Node (module.exports).
 * Convention d'angles identique à Seamly2D / Qt : degrés, sens anti-horaire à l'écran, axe y vers le bas.
 */
(function (root) {
  'use strict';
  const DEG = Math.PI / 180;

  // ------------------------------------------------------------------ formules
  function tokenize(s) {
    const re = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([A-Za-z_#][A-Za-z0-9_#]*)|(.))/g;
    const out = [];
    let m;
    while ((m = re.exec(s)) !== null) {
      if (m[1] !== undefined) out.push({ t: 'num', v: parseFloat(m[1]) });
      else if (m[2] !== undefined) out.push({ t: 'id', v: m[2] });
      else if (m[3] !== undefined && m[3].trim() !== '') out.push({ t: 'op', v: m[3] });
    }
    return out;
  }

  const FUNCS = {
    sin: (x) => Math.sin(x * DEG), cos: (x) => Math.cos(x * DEG), tan: (x) => Math.tan(x * DEG),
    sqrt: Math.sqrt, abs: Math.abs, min: Math.min, max: Math.max,
  };

  function evalFormula(str, resolve) {
    if (typeof str === 'number') return str;
    const tk = tokenize(String(str));
    let i = 0;
    const peek = () => tk[i];
    const next = () => tk[i++];
    function primary() {
      const t = next();
      if (!t) throw new Error('Formule incomplète : ' + str);
      if (t.t === 'num') return t.v;
      if (t.t === 'id') {
        if (peek() && peek().t === 'op' && peek().v === '(') {
          next();
          const args = [expr()];
          while (peek() && peek().v === ',') { next(); args.push(expr()); }
          next(); // )
          const f = FUNCS[t.v];
          if (!f) throw new Error('Fonction inconnue : ' + t.v);
          return f.apply(null, args);
        }
        return resolve(t.v);
      }
      if (t.v === '(') { const v = expr(); next(); return v; }
      throw new Error('Symbole inattendu « ' + t.v + ' » dans : ' + str);
    }
    function unary() {
      const t = peek();
      if (t && t.t === 'op' && (t.v === '-' || t.v === '+')) { next(); const v = unary(); return t.v === '-' ? -v : v; }
      return pow();
    }
    function pow() {
      const b = primary();
      if (peek() && peek().v === '^') { next(); return Math.pow(b, unary()); }
      return b;
    }
    function term() {
      let v = unary();
      while (peek() && (peek().v === '*' || peek().v === '/')) {
        const o = next().v; const r = unary(); v = o === '*' ? v * r : v / r;
      }
      return v;
    }
    function expr() {
      let v = term();
      while (peek() && (peek().v === '+' || peek().v === '-')) {
        const o = next().v; const r = term(); v = o === '+' ? v + r : v - r;
      }
      return v;
    }
    const v = expr();
    return v;
  }

  // ------------------------------------------------------------------ géométrie
  const norm360 = (a) => ((a % 360) + 360) % 360;
  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const lineAngle = (a, b) => norm360(Math.atan2(-(b.y - a.y), b.x - a.x) / DEG);
  const dirOf = (ang) => ({ x: Math.cos(ang * DEG), y: -Math.sin(ang * DEG) });

  function intersectLines(p, u, a, b) { // droite p+t*u avec droite (a,b) -> point
    const v = { x: b.x - a.x, y: b.y - a.y };
    const den = u.x * v.y - u.y * v.x;
    if (Math.abs(den) < 1e-12) throw new Error('Droites parallèles');
    const t = ((a.x - p.x) * v.y - (a.y - p.y) * v.x) / den;
    return { x: p.x + t * u.x, y: p.y + t * u.y };
  }

  function arcSpan(arc) {
    let a1 = norm360(arc.a1), a2 = norm360(arc.a2);
    if (a2 <= a1) a2 += 360;
    return [a1, a2];
  }
  function arcPoint(arc, ang) {
    return { x: arc.cx + arc.r * Math.cos(ang * DEG), y: arc.cy - arc.r * Math.sin(ang * DEG) };
  }
  function arcPolyline(arc, stepDeg) {
    const [a1, a2] = arcSpan(arc);
    const n = Math.max(2, Math.ceil((a2 - a1) / (stepDeg || 3)));
    const pts = [];
    for (let k = 0; k <= n; k++) pts.push(arcPoint(arc, a1 + ((a2 - a1) * k) / n));
    return pts;
  }

  function rayArc(base, angle, arc, warnings) {
    // angle « de construction » : on la rapproche d'un multiple de 45° quand elle en est très proche
    let ang = norm360(angle);
    const k = Math.round(ang / 45);
    if (Math.abs(ang - 45 * k) < 1e-6) ang = norm360(45 * k);
    const u = dirOf(ang);
    const px = base.x - arc.cx, py = base.y - arc.cy;
    const b = u.x * px + u.y * py;
    const c = px * px + py * py - arc.r * arc.r;
    let disc = b * b - c;
    const dperp = Math.abs(px * u.y - py * u.x); // distance centre-droite
    const [a1, a2] = arcSpan(arc);
    const inSweep = (pt) => {
      let a = norm360(Math.atan2(-(pt.y - arc.cy), pt.x - arc.cx) / DEG);
      if (a < a1 - 1e-3) a += 360;
      return a <= a2 + 1e-3;
    };
    const cands = [];
    if (disc < 0 && Math.abs(dperp - arc.r) < 0.05) disc = 0; // quasi tangent
    if (disc >= -1e-9) {
      const s = Math.sqrt(Math.max(0, disc));
      for (const t of [-b - s, -b + s]) {
        if (t >= -1e-9) cands.push({ t, p: { x: base.x + t * u.x, y: base.y + t * u.y } });
      }
      if (disc < 1e-9 && cands.length === 0) { // tangence : pied de la perpendiculaire
        const t = -b; cands.push({ t, p: { x: base.x + t * u.x, y: base.y + t * u.y } });
      }
    }
    // tangence presque parfaite : on prend le point de tangence
    if (dperp > arc.r - 0.05 && dperp <= arc.r + 0.05) {
      const t = -b; cands.length = 0; cands.push({ t, p: { x: base.x + t * u.x, y: base.y + t * u.y } });
    }
    const good = cands.filter((c0) => inSweep(c0.p));
    const pick = (good.length ? good : cands).sort((m, n) => m.t - n.t)[0];
    if (!pick) throw new Error('Intersection droite-arc introuvable');
    if (!good.length && warnings) warnings.push('Intersection hors de l\'arc (corrigée)');
    return pick.p;
  }

  // ------------------------------------------------------------------ construction
  function computeBlockRaw(data, blockIndex, overrides) {
    const block = data.blocks[blockIndex];
    const vars = {};
    for (const v of data.variables) vars[v.name] = evalFormula(v.formula, (n) => { if (n in vars) return vars[n]; throw new Error('Variable inconnue ' + n); });
    Object.assign(vars, overrides || {});

    const pts = {};      // id -> {x,y,name}
    const arcs = {};     // id -> {cx,cy,r,a1,a2}
    const names = new Map(); // nom -> point
    const warnings = [];
    let current = 0;

    const resolve = (n) => {
      if (n in vars) return vars[n];
      if (n === 'CurrentLength') return current;
      const m = /^(AngleLine|Line)_(.+)$/.exec(n);
      if (m) {
        const rest = m[2];
        for (let i = 0; i < rest.length; i++) {
          if (rest[i] !== '_') continue;
          const a = names.get(rest.slice(0, i)), b = names.get(rest.slice(i + 1));
          if (a && b) return m[1] === 'Line' ? dist(a, b) : lineAngle(a, b);
        }
      }
      throw new Error('Nom inconnu dans une formule : ' + n);
    };
    const F = (s, cur) => { current = cur || 0; return evalFormula(s, resolve); };
    const P = (id) => { const p = pts[id]; if (!p) throw new Error('Point introuvable id=' + id); return p; };
    const reg = (id, p, name) => { p.name = name; p.id = id; pts[id] = p; if (name) names.set(name, p); };

    for (const e of block.calc) {
      if (e.tag === 'point') {
        let p;
        switch (e.type) {
          case 'single': p = { x: Number(e.x), y: Number(e.y) }; break;
          case 'endLine': {
            const b = P(e.basePoint); const a = F(e.angle), l = F(e.length), u = dirOf(a);
            p = { x: b.x + l * u.x, y: b.y + l * u.y }; break;
          }
          case 'alongLine': {
            const f = P(e.firstPoint), s = P(e.secondPoint);
            const d = dist(f, s); const l = F(e.length, d);
            p = { x: f.x + (l * (s.x - f.x)) / d, y: f.y + (l * (s.y - f.y)) / d }; break;
          }
          case 'normal': {
            const f = P(e.firstPoint), s = P(e.secondPoint);
            const l = F(e.length), add = F(e.angle);
            const ang = lineAngle(f, s) + 90 + add, u = dirOf(ang);
            p = { x: f.x + l * u.x, y: f.y + l * u.y }; break;
          }
          case 'intersectXY': p = { x: P(e.firstPoint).x, y: P(e.secondPoint).y }; break;
          case 'lineIntersectAxis': {
            const b = P(e.basePoint); const a = F(e.angle);
            p = intersectLines(b, dirOf(a), P(e.p1Line), P(e.p2Line)); break;
          }
          case 'curveIntersectAxis': {
            const b = P(e.basePoint); const a = F(e.angle);
            const arc = arcs[e.curve]; if (!arc) throw new Error('Arc introuvable ' + e.curve);
            p = rayArc(b, a, arc, warnings); break;
          }
          default: throw new Error('Type de point non géré : ' + e.type);
        }
        reg(e.id, p, e.name);
      } else if (e.tag === 'arc') {
        const c = P(e.center);
        arcs[e.id] = { cx: c.x, cy: c.y, r: F(e.radius), a1: F(e.angle1), a2: F(e.angle2), id: e.id };
      } else if (e.tag === 'operation') {
        let reflectPt, reflectAng;
        if (e.type === 'flippingByAxis') {
          if (String(e.axisType) !== '1') throw new Error('Axe de symétrie non géré');
          const cx = P(e.center).x;
          reflectPt = (p) => ({ x: 2 * cx - p.x, y: p.y });
          reflectAng = (a) => 180 - a;
        } else if (e.type === 'flippingByLine') {
          const a = P(e.p1Line), b = P(e.p2Line);
          const phi = lineAngle(a, b);
          const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
          reflectPt = (p) => {
            const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2;
            const fx = a.x + t * dx, fy = a.y + t * dy;
            return { x: 2 * fx - p.x, y: 2 * fy - p.y };
          };
          reflectAng = (ang) => 2 * phi - ang;
        } else throw new Error('Opération non gérée : ' + e.type);
        e.source.forEach((sid, i) => {
          const did = e.destination[i];
          if (pts[sid]) {
            const s = pts[sid]; const q = reflectPt(s);
            reg(did, q, s.name ? s.name + e.suffix : null);
          } else if (arcs[sid]) {
            const s = arcs[sid]; const c = reflectPt({ x: s.cx, y: s.cy });
            arcs[did] = { cx: c.x, cy: c.y, r: s.r, a1: norm360(reflectAng(s.a2)), a2: norm360(reflectAng(s.a1)), id: did };
          } else throw new Error('Objet source introuvable ' + sid);
        });
      }
      // les éléments « line » ne servent qu'à l'affichage dans Seamly2D
    }
    return { block, vars, pts, arcs, names, warnings };
  }

  // ------------------------------------------------------------------ pièces
  function dedupe(poly, eps) {
    const out = [], e = eps || 1e-6, num = (v) => typeof v === 'number';
    for (const p of poly) {
      const l = out[out.length - 1];
      if (!l || Math.hypot(p.x - l.x, p.y - l.y) > e) out.push(p);
      else {
        if (p.notch && !l.notch) l.notch = p.notch; // point confondu : une largeur explicite (nombre) l'emporte
        l.wb = num(l.wb) ? l.wb : (num(p.wb) ? p.wb : (l.wb != null ? l.wb : (p.wb != null ? p.wb : null)));
        l.wa = num(p.wa) ? p.wa : (num(l.wa) ? l.wa : (p.wa != null ? p.wa : (l.wa != null ? l.wa : null)));
      }
    }
    if (out.length > 1 && Math.hypot(out[0].x - out[out.length - 1].x, out[0].y - out[out.length - 1].y) <= e) {
      const last = out.pop();
      if (num(last.wb) || out[0].wb == null) out[0].wb = last.wb != null ? last.wb : out[0].wb;
      if (out[0].wa == null && last.wa != null) out[0].wa = last.wa;
    }
    return out;
  }

  function resolveNode(res, modId) {
    const m = res.block.modeling[modId];
    if (!m) throw new Error('Élément de modélisation introuvable ' + modId);
    if (m.tag === 'arc') return { kind: 'arc', arc: res.arcs[m.idObject] };
    return { kind: 'pt', p: res.pts[m.idObject], mod: m };
  }

  // coupe l'arc (déjà orienté de p vers q) aux points p et q lorsqu'ils sont sur l'arc (comme Seamly2D) ; sinon extrémité naturelle
  function cutArc(a, arc, p, q) {
    if (a.length < 2) return a;
    const tol = 0.02, eps = 0.02, ph = (z) => Math.atan2(z.y - arc.cy, z.x - arc.cx);
    const onC = (z) => Math.abs(Math.hypot(z.x - arc.cx, z.y - arc.cy) - arc.r) < tol;
    const wrap = (d) => { while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
    const phi = [ph(a[0])];
    for (let i = 1; i < a.length; i++) phi.push(phi[i - 1] + wrap(ph(a[i]) - phi[i - 1]));
    const sg = phi[phi.length - 1] >= phi[0] ? 1 : -1, mid = phi[phi.length >> 1];
    const lo = Math.min(phi[0], phi[phi.length - 1]), hi = Math.max(phi[0], phi[phi.length - 1]);
    const inside = (v) => v >= lo - eps && v <= hi + eps;
    const pp = mid + wrap(ph(p) - mid), pq = mid + wrap(ph(q) - mid);
    const cutP = onC(p) && inside(pp), cutQ = onC(q) && inside(pq);
    const out = [];
    for (let i = 0; i < a.length; i++) {
      if (cutP && sg * (phi[i] - pp) <= 1e-6) continue;
      if (cutQ && sg * (pq - phi[i]) <= 1e-6) continue;
      out.push(a[i]);
    }
    return out;
  }

  function nodeBefore(nodeList, n, res) {
    for (let j = nodeList.indexOf(n) + 1; j < nodeList.length; j++) {
      if (nodeList[j].excluded === 'true') continue;
      const o2 = resolveNode(res, nodeList[j].idObject);
      if (o2.kind === 'pt') return nodeList[j].before !== undefined ? +nodeList[j].before : null;
      return null;
    }
    return null;
  }

  // Valeurs singulières (ex. revers = rempli : droites confondues) : on réessaie avec un écart de 0,01 mm
  function computeBlock(data, blockIndex, overrides) {
    try { return computeBlockRaw(data, blockIndex, overrides); } catch (e) {
      if (!/parall/i.test(e.message)) throw e;
      for (const k of [1, -1, 2, -2]) {
        const ov = Object.assign({}, overrides || {});
        for (const key of ['H_revers', 'Val_repli_poche', 'H_poche', 'L_poche']) if (typeof ov[key] === 'number') ov[key] *= 1 + k * 1e-5;
        try { return computeBlockRaw(data, blockIndex, ov); } catch (e2) { if (!/parall/i.test(e2.message)) throw e2; }
      }
      throw e;
    }
  }

  function buildPolyline(res, nodeList, arcStep) {
    const poly = [];
    for (const n of nodeList) {
      if (n.excluded === 'true') continue;
      const o = resolveNode(res, n.idObject);
      if (o.kind === 'pt') {
        poly.push({ x: o.p.x, y: o.p.y, wb: n.before !== undefined ? +n.before : null, wa: n.after !== undefined ? +n.after : null, notch: n.notch === 'true' ? (n.notchLength !== undefined ? +n.notchLength : 1.25) : 0 });
      } else {
        let a = arcPolyline(o.arc, arcStep);
        const last = poly[poly.length - 1];
        // comme Seamly2D : un arc inséré entre deux points n'est tracé que d'un point à l'autre
        let nxt = null;
        for (let j = nodeList.indexOf(n) + 1; j < nodeList.length; j++) { if (nodeList[j].excluded === 'true') continue; const o2 = resolveNode(res, nodeList[j].idObject); if (o2.kind === 'pt') nxt = o2.p; break; }
        if (last) {
          const dS = Math.hypot(a[0].x - last.x, a[0].y - last.y);
          const dE = Math.hypot(a[a.length - 1].x - last.x, a[a.length - 1].y - last.y);
          if (dE < dS) a = a.slice().reverse();
          if (nxt) a = cutArc(a, o.arc, last, nxt);
        } else if (n.reverse === '1') a = a.slice().reverse();
        // largeur de marge le long de l'arc : de la largeur « après » du point précédent à la largeur « avant » du point suivant
        const ws = last ? last.wa : null, we = nxt ? nodeBefore(nodeList, n, res) : null;
        a.forEach((q, k) => {
          const t = (k + 1) / (a.length + 1);
          poly.push(ws == null && we == null ? { x: q.x, y: q.y, wb: null, wa: null } : { x: q.x, y: q.y, wb: { a: ws, b: we, t }, wa: { a: ws, b: we, t } });
        });
      }
    }
    const closed = poly.length > 2 && Math.hypot(poly[0].x - poly[poly.length - 1].x, poly[0].y - poly[poly.length - 1].y) <= 1e-5;
    const out = dedupe(poly, 1e-5);
    out.closed = closed;
    return out;
  }

  function signedArea(poly) {
    let s = 0;
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a.x * b.y - b.x * a.y; }
    return s / 2;
  }

  // décalage d'un polygone : marge w par défaut ; chaque sommet peut porter sa propre largeur avant (wb) / après (wa),
  // comme les nœuds d'une pièce Seamly2D (0 = pas de marge ; la largeur varie alors linéairement le long du segment)
  function offsetPolygon(poly, w) {
    const n = poly.length;
    const sgn = signedArea(poly) > 0 ? 1 : -1; // normale extérieure = (sgn*dy, -sgn*dx)
    const W = (v) => (v === null || v === undefined ? w : typeof v === 'number' ? v : (v.a == null ? w : v.a) + ((v.b == null ? w : v.b) - (v.a == null ? w : v.a)) * v.t);
    const seg = [];
    for (let i = 0; i < n; i++) {
      const p1 = poly[i], p2 = poly[(i + 1) % n];
      const dx = p2.x - p1.x, dy = p2.y - p1.y, l = Math.hypot(dx, dy);
      if (l < 1e-9) { seg.push(null); continue; }
      const nx = (sgn * dy) / l, ny = (-sgn * dx) / l, ws = W(p1.wa), we = W(p2.wb);
      seg.push({ nx, ny, a: { x: p1.x + nx * ws, y: p1.y + ny * ws }, b: { x: p2.x + nx * we, y: p2.y + ny * we } });
    }
    const res = [];
    for (let i = 0; i < n; i++) {
      const sp = seg[(i + n - 1) % n], sn = seg[i];
      if (!sp || !sn) continue;
      const p = poly[i];
      const dot = 1 + sp.nx * sn.nx + sp.ny * sn.ny;
      if (dot < 0.25) { res.push({ x: sp.b.x, y: sp.b.y }, { x: sn.a.x, y: sn.a.y }); continue; } // coin très aigu : biseau
      const d1 = { x: sp.b.x - sp.a.x, y: sp.b.y - sp.a.y }, d2 = { x: sn.b.x - sn.a.x, y: sn.b.y - sn.a.y };
      const cr = d1.x * d2.y - d1.y * d2.x;
      if (Math.abs(cr) < 1e-12 * Math.hypot(d1.x, d1.y) * Math.hypot(d2.x, d2.y)) { // segments alignés
        res.push({ x: sp.b.x, y: sp.b.y });
        if (Math.hypot(sp.b.x - sn.a.x, sp.b.y - sn.a.y) > 1e-9) res.push({ x: sn.a.x, y: sn.a.y });
        continue;
      }
      const t = ((sn.a.x - sp.a.x) * d2.y - (sn.a.y - sp.a.y) * d2.x) / cr;
      res.push({ x: sp.a.x + t * d1.x, y: sp.a.y + t * d1.y });
    }
    // arête devenue inversée (petit segment « absorbé » par la marge, ex. fond d'un V étroit) : on la supprime
    // et on remplace ses deux coins par l'intersection des deux droites voisines
    if (res.length === n && seg.every(Boolean)) {
      for (let pass = 0; pass < 3; pass++) {
        let changed = false;
        for (let k = 0; k < res.length; k++) {
          const k2 = (k + 1) % res.length, sk = seg[k];
          const d = { x: sk.b.x - sk.a.x, y: sk.b.y - sk.a.y };
          const e = { x: res[k2].x - res[k].x, y: res[k2].y - res[k].y };
          if (d.x * e.x + d.y * e.y >= 0) continue;
          const sp = seg[(k + n - 1) % n], sn = seg[(k + 1) % n];
          const d1 = { x: sp.b.x - sp.a.x, y: sp.b.y - sp.a.y }, d2 = { x: sn.b.x - sn.a.x, y: sn.b.y - sn.a.y };
          const cr = d1.x * d2.y - d1.y * d2.x;
          if (Math.abs(cr) < 1e-9) continue;
          const t = ((sn.a.x - sp.a.x) * d2.y - (sn.a.y - sp.a.y) * d2.x) / cr;
          const q = { x: sp.a.x + t * d1.x, y: sp.a.y + t * d1.y };
          res[k] = q; res[k2] = { x: q.x, y: q.y }; changed = true;
        }
        if (!changed) break;
      }
      const out = res.filter((p, i) => { const q = res[(i + 1) % res.length]; return Math.hypot(p.x - q.x, p.y - q.y) > 1e-9; });
      return out;
    }
    return res;
  }

  function computePieces(res, opts) {
    opts = opts || {};
    const out = [];
    for (const pc of res.block.pieces) {
      if (opts.only && !opts.only.includes(pc.name)) continue;
      const poly = buildPolyline(res, pc.nodes, opts.arcStep || 3);
      const lines = [];
      for (const pid of pc.iPaths) {
        const path = res.block.modeling[pid];
        const l = buildPolyline(res, path.nodes, opts.arcStep || 3);
        if (l.closed && l.length > 2) l.push({ x: l[0].x, y: l[0].y }); // chemin refermé dans Seamly2D (premier nœud = dernier)
        if (l.length > 1) lines.push(l);
      }
      // la polyligne de chaque chemin interne est ouverte : buildPolyline ferme-t-elle ? non, dedupe retire seulement le doublon final
      let sa = null;
      const saw = pc.seamAllowance ? (opts.seamWidth !== undefined ? opts.seamWidth : pc.width) : 0; // pas de marge si la pièce n'en a pas dans le patron (le rempli en tient lieu)
      if (saw > 0) sa = offsetPolygon(poly, saw);
      // crans (nœuds « notch » de la pièce) : position sur la ligne de couture, normale extérieure, longueur et largeur de marge locale
      const notches = [], sg = signedArea(poly) > 0 ? 1 : -1, np = poly.length;
      poly.forEach((v, i) => {
        if (!v.notch) return;
        const a = poly[(i + np - 1) % np], b = poly[(i + 1) % np];
        const e1 = { x: v.x - a.x, y: v.y - a.y }, e2 = { x: b.x - v.x, y: b.y - v.y }, l1 = Math.hypot(e1.x, e1.y) || 1, l2 = Math.hypot(e2.x, e2.y) || 1;
        let nx = sg * (e1.y / l1 + e2.y / l2), ny = -sg * (e1.x / l1 + e2.x / l2); const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const wl = typeof v.wb === 'number' ? v.wb : saw, wr = typeof v.wa === 'number' ? v.wa : saw;
        notches.push({ x: v.x, y: v.y, nx, ny, len: v.notch, w: Math.max(wl, wr) });
      });
      out.push({ name: pc.name, poly, sa, notches, onFold: !!pc.onFold, internal: lines, quantity: pc.quantity, lines: pc.lines, grain: pc.grainline, annotation: pc.annotation });
    }
    return out;
  }

  function bbox(pts) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
  }

  const api = { evalFormula, computeBlock, computePieces, bbox, offsetPolygon, signedArea };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PatternEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
