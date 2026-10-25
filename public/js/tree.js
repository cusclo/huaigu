// 程序化水墨树：阔叶 / 花树 / 果树 / 垂柳 / 修竹 / 苍松 / 古柏
import { svgEl, rng } from './util.js';

const INK = '#2a231c';

export function drawTree(parent, cfg, seed, bx, by) {
  const R = rng(seed + cfg.kind);
  const r = (a, b) => a + R() * (b - a);
  const g = svgEl('g', { class: 'tree' }, parent);
  const back = svgEl('g', {}, g); // 叶团背景
  const wood = svgEl('g', { filter: 'url(#ink-rough)' }, g);
  const front = svgEl('g', {}, g);
  const segs = [];
  const tips = [];

  const seg = (x, y, ex, ey, w, d, curve = 0.15) => {
    const mx = (x + ex) / 2 + (ey - y) * r(-curve, curve);
    const my = (y + ey) / 2 - (ex - x) * r(-curve, curve);
    svgEl('path', { d: `M${x} ${y} Q${mx} ${my} ${ex} ${ey}`, stroke: INK, 'stroke-width': Math.max(0.8, w), 'stroke-linecap': 'round', fill: 'none', opacity: 0.92 }, wood);
    segs.push({ x, y, ex, ey, d, w });
  };

  function branch(x, y, ang, len, w, d, maxD, spread, curve) {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    seg(x, y, ex, ey, w, d, curve);
    if (d >= maxD) { tips.push({ x: ex, y: ey }); return; }
    const n = d < 1 ? 2 : R() < 0.35 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      let a = ang + (i - (n - 1) / 2) * spread * r(0.7, 1.3) + r(-0.15, 0.15);
      a = Math.max(-Math.PI + 0.15, Math.min(-0.15, a));
      branch(ex, ey, a, len * r(0.66, 0.8), w * 0.66, d + 1, maxD, spread, curve);
    }
  }

  // 悬挂点：在中层枝干上取点，彼此间隔
  function pickHangs(minD = 2, maxD = 5, gap = 34, offsetY = 0) {
    const cands = segs.filter((s) => s.d >= minD && s.d <= maxD).map((s) => {
      const t = r(0.35, 0.85);
      return { x: s.x + (s.ex - s.x) * t, y: s.y + (s.ey - s.y) * t + offsetY };
    });
    return spaced(cands, gap);
  }
  function spaced(cands, gap) {
    for (let i = cands.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]]; }
    const out = [];
    for (const c of cands) if (out.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > gap) && c.y < by - 120) out.push(c);
    return out;
  }

  const foliageBlob = (x, y, rad, color, op, layer = back) =>
    svgEl('circle', { cx: x, cy: y, r: rad, fill: color, opacity: op }, layer);

  const kind = cfg.kind;
  let hangs = [];

  if (kind === 'broad' || kind === 'fruit') {
    const spread = cfg.gnarled ? 0.75 : 0.52;
    branch(bx, by, -Math.PI / 2 + r(-0.08, 0.08), 150, 24, 0, 6, spread, cfg.gnarled ? 0.35 : 0.15);
    // 墨晕底
    const cx = tips.reduce((s, t) => s + t.x, 0) / tips.length, cy = tips.reduce((s, t) => s + t.y, 0) / tips.length;
    svgEl('ellipse', { cx, cy: cy + 10, rx: 230, ry: 150, fill: cfg.leaf, opacity: 0.14, filter: 'url(#ink-blur-lg)' }, back);
    for (const t of tips) {
      foliageBlob(t.x + r(-10, 10), t.y + r(-10, 10), r(18, 32), cfg.leaf, r(0.22, 0.42));
      if (R() < 0.6) foliageBlob(t.x + r(-14, 14), t.y + r(-14, 14), r(6, 12), cfg.leaf, r(0.5, 0.8), front);
    }
    if (kind === 'fruit') {
      for (const t of tips) {
        const k = cfg.small ? 5 : 1;
        for (let i = 0; i < k; i++) if (R() < (cfg.small ? 0.9 : 0.55))
          svgEl('circle', { cx: t.x + r(-22, 22), cy: t.y + r(-14, 18), r: cfg.small ? r(1.6, 2.8) : r(4.5, 6.5), fill: cfg.fruit, opacity: 0.95 }, front);
      }
    }
    hangs = pickHangs(2, 5, 36, 4);
  } else if (kind === 'blossom') {
    branch(bx, by, -Math.PI / 2 + r(-0.12, 0.12), 140, 20, 0, 6, 0.62, 0.08);
    for (const s of segs) {
      if (s.d < 2) continue;
      const n = cfg.bare ? (s.d >= 5 ? 1 : 0) : Math.round(r(1, 4));
      for (let i = 0; i < n; i++) {
        const t = cfg.bare ? 1 : r(0.2, 1);
        const x = s.x + (s.ex - s.x) * t + r(-5, 5), y = s.y + (s.ey - s.y) * t + r(-5, 5);
        const rad = cfg.bare ? r(6, 9) : r(3, 5.5);
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2 + r(0, 1);
          svgEl('circle', { cx: x + Math.cos(a) * rad * 0.55, cy: y + Math.sin(a) * rad * 0.55, r: rad * 0.55, fill: cfg.leaf, opacity: 0.85 }, front);
        }
        svgEl('circle', { cx: x, cy: y, r: Math.max(1, rad * 0.22), fill: cfg.calyx || '#f1d27a', opacity: 0.95 }, front);
      }
    }
    const cx = tips.reduce((s, t) => s + t.x, 0) / tips.length, cy = tips.reduce((s, t) => s + t.y, 0) / tips.length;
    svgEl('ellipse', { cx, cy, rx: 230, ry: 140, fill: cfg.leaf, opacity: 0.12, filter: 'url(#ink-blur-lg)' }, back);
    hangs = pickHangs(2, 5, 36, 4);
  } else if (kind === 'willow') {
    branch(bx, by, -Math.PI / 2 + r(-0.1, 0.1), 140, 28, 0, 4, 0.7, 0.25);
    const strands = svgEl('g', { class: 'willow-strands' }, front);
    for (let i = 0; i < 90; i++) {
      const s = segs.filter((q) => q.d >= 2)[Math.floor(R() * segs.filter((q) => q.d >= 2).length)];
      const t = r(0.3, 1);
      const x = s.x + (s.ex - s.x) * t, y = s.y + (s.ey - s.y) * t;
      const len = r(120, 280), dx = r(-24, 24);
      svgEl('path', { d: `M${x} ${y} Q${x + dx * 0.2} ${y + len * 0.5} ${x + dx} ${y + len}`, stroke: cfg.leaf, 'stroke-width': r(0.8, 1.8), fill: 'none', opacity: r(0.35, 0.75), 'stroke-dasharray': R() < 0.5 ? '6 3' : 'none' }, strands);
    }
    strands.style.cssText = `transform-origin:${bx}px ${by - 380}px; animation: sway 7s ease-in-out infinite alternate; --amp: 1.2deg; transform-box: view-box;`;
    hangs = pickHangs(1, 4, 40, 6);
  } else if (kind === 'bamboo') {
    const leafD = 'M0 0 Q14 -4 38 0 Q14 4 0 0Z';
    const nodes = [];
    for (let i = 0; i < 6; i++) {
      const x0 = bx + (i - 2.5) * 30 + r(-8, 8);
      const h = r(380, 540), bend = r(-50, 50), w = r(5, 8);
      const top = { x: x0 + bend, y: by - h };
      svgEl('path', { d: `M${x0} ${by} Q${x0 + bend * 0.2} ${by - h * 0.5} ${top.x} ${top.y}`, stroke: '#3c5c3a', 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 }, wood);
      for (let yy = by - 40; yy > top.y + 10; yy -= r(38, 52)) {
        const t = (by - yy) / h;
        const nx = x0 + bend * (2 * t * (1 - t) * 0.2 + t * t);
        svgEl('line', { x1: nx - w * 0.7, y1: yy, x2: nx + w * 0.7, y2: yy, stroke: '#e8e0cc', 'stroke-width': 1.2, opacity: 0.55 }, wood);
        if (t > 0.35) {
          nodes.push({ x: nx, y: yy });
          const side = R() < 0.5 ? -1 : 1;
          for (let k = 0; k < 4; k++) {
            const ang = side > 0 ? r(10, 70) : r(110, 170);
            svgEl('path', { d: leafD, fill: cfg.leaf, opacity: r(0.6, 0.9), transform: `translate(${nx} ${yy}) rotate(${ang}) scale(${r(0.7, 1.2)})` }, front);
          }
        }
      }
    }
    hangs = spaced(nodes.map((n) => ({ x: n.x + r(-6, 6), y: n.y + 6 })), 34);
  } else if (kind === 'pine') {
    // 蜿蜒主干
    let x = bx, y = by;
    const trunk = [[x, y]];
    for (let i = 0; i < 8; i++) { x += r(-22, 22); y -= r(48, 60); trunk.push([x, y]); }
    trunk.forEach((p, i) => i && seg(trunk[i - 1][0], trunk[i - 1][1], p[0], p[1], 20 - i * 2, 0, 0.1));
    trunk.slice(2).forEach(([tx, ty], i) => {
      const dir = i % 2 ? 1 : -1, len = r(80, 170) * (1 - i * 0.07);
      const ex = tx + dir * len, ey = ty - r(0, 30);
      seg(tx, ty, ex, ey, 7 - i * 0.6, 2, 0.2);
      for (const [cx, cy, rx] of [[ex, ey - 6, r(50, 72)], [tx + dir * len * 0.5, ty - 14, r(36, 50)]]) {
        svgEl('ellipse', { cx, cy, rx, ry: rx * 0.3, fill: cfg.leaf, opacity: 0.85 }, front);
        for (let k = 0; k < 16; k++) {
          const a = Math.PI + (k / 15) * Math.PI;
          svgEl('line', { x1: cx + Math.cos(a) * rx * 0.6, y1: cy + Math.sin(a) * rx * 0.18, x2: cx + Math.cos(a) * rx * 1.05, y2: cy + Math.sin(a) * rx * 0.36, stroke: cfg.leaf, 'stroke-width': 1, opacity: 0.8 }, front);
        }
      }
    });
    const top = trunk[trunk.length - 1];
    svgEl('ellipse', { cx: top[0], cy: top[1] - 6, rx: 56, ry: 18, fill: cfg.leaf, opacity: 0.9 }, front);
    const pc = [];
    segs.filter((s) => s.d === 2).forEach((s) => [0.3, 0.55, 0.8].forEach((t) => pc.push({ x: s.x + (s.ex - s.x) * t, y: s.y + (s.ey - s.y) * t + 12 })));
    hangs = spaced(pc, 30);
  } else if (kind === 'cypress') {
    seg(bx, by, bx + r(-6, 6), by - 470, 20, 0, 0.04);
    for (let i = 0; i < 70; i++) {
      const t = R(), yy = by - 110 - t * 380, wdt = (1 - t * 0.75) * 85;
      svgEl('ellipse', { cx: bx + r(-1, 1) * wdt, cy: yy, rx: r(14, 26), ry: r(10, 18), fill: cfg.leaf, opacity: r(0.4, 0.75) }, R() < 0.5 ? back : front);
    }
    const c = [];
    for (let i = 0; i < 40; i++) { const t = r(0.05, 0.7), yy = by - 110 - t * 380, wdt = (1 - t * 0.75) * 85; c.push({ x: bx + (R() < 0.5 ? -1 : 1) * wdt * r(0.6, 1), y: yy + 14 }); }
    hangs = spaced(c, 34);
  }

  return { g, hangs: hangs.sort((a, b) => a.y - b.y) };
}
