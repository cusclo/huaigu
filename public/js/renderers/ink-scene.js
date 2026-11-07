// 水墨界画场景：天光 · 远山 · 平野 · 礼制建筑 · 碑石 · 供案
// 构图原则：建筑退居中景、雾锁其基；碑石立于前景；留白与淡彩取代满铺色块。
import { svgEl, rng } from '../util.js';
import { mix } from './ink-kit.js';

// ============ 天与山 ============
export function paintBackdrop(k, ctx) {
  const { svg, fig, sc, VB_W, VB_H, GROUND, night, sky0, sky1 } = ctx;
  const { P } = k;
  const R = rng(fig.id + 'backdrop');
  const silk = night ? sky0 : mix(sky0, '#efe6d2', 0.4);
  const silk1 = night ? sky1 : mix(sky1, '#e2d6bd', 0.35);

  // 天：绢色渐变
  k.path(svg, `M0 0 H${VB_W} V${VB_H} H0Z`, { fill: k.grad([[0, silk], [0.72, silk1]]) });

  // 日月星辰
  const c = sc.celestial;
  const cel = k.g(svg);
  if (c === 'moon' || c === 'moon-pale') {
    const mx = 1360, my = 150, mr = c === 'moon' ? 46 : 34;
    svgEl('circle', { cx: mx, cy: my, r: mr * 3.4, fill: k.radial(night ? '#f6eccc' : '#ffffff', night ? 0.22 : 0.35) }, cel);
    svgEl('circle', { cx: mx, cy: my, r: mr, fill: k.grad([[0, '#fbf5e3'], [1, night ? '#e6dbbd' : '#f1ead8']], { x2: 1, y2: 1 }), opacity: c === 'moon' ? 0.95 : 0.75 }, cel);
    svgEl('circle', { cx: mx, cy: my, r: mr, fill: 'none', stroke: night ? '#d8ccaa' : '#cbbf9f', 'stroke-width': 0.8, opacity: 0.6 }, cel);
    // 一抹横云掠过月面
    k.path(cel, `M${mx - 150} ${my + 18} q80 -14 160 -4 t150 2`, { fill: 'none', stroke: silk, 'stroke-width': 10, opacity: 0.8, filter: k.F.soft });
  } else if (c === 'sun') {
    svgEl('circle', { cx: 1330, cy: 190, r: 150, fill: k.radial('#e3a08a', 0.2) }, cel);
    svgEl('circle', { cx: 1330, cy: 190, r: 36, fill: k.radial('#b8473a', 0.55, { fx: 0.45, fy: 0.45 }) }, cel);
    svgEl('circle', { cx: 1330, cy: 190, r: 22, fill: '#b8473a', opacity: 0.32 }, cel);
  } else if (c === 'sunset') {
    svgEl('ellipse', { cx: 280, cy: 520, rx: 520, ry: 260, fill: k.radial('#e9a56a', 0.38) }, cel);
    svgEl('circle', { cx: 280, cy: 470, r: 46, fill: k.radial('#d98a52', 0.75) }, cel);
  } else if (c === 'stars') {
    for (let i = 0; i < 120; i++) {
      const s = svgEl('circle', { cx: R() * VB_W, cy: R() * 480, r: 0.4 + R() * 1.1, fill: '#f4ecd6', opacity: 0.15 + R() * 0.55 }, cel);
      if (i % 9 === 0) s.style.animation = `breathe ${2 + R() * 3}s ${R() * 3}s infinite`;
    }
    const dipper = [[1150, 110], [1215, 98], [1275, 122], [1325, 150], [1340, 215], [1425, 228], [1440, 165]];
    k.line(cel, 'M' + dipper.map((p) => p.join(' ')).join(' L') + ' L1325 150', 0.6, '#e9dfc0', 0.22);
    dipper.forEach(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 2.4, fill: '#fff6d8', filter: 'url(#glow)' }, cel));
  }
  if (sc.emblem === 'qi') {
    for (let i = 0; i < 3; i++) {
      const y = 170 + i * 60;
      k.path(svg, `M-100 ${y} C300 ${y - 60} 700 ${y + 50} 1100 ${y - 20} S1600 ${y + 30} 1800 ${y - 10}`, { class: 'mist', stroke: '#8f6aa6', 'stroke-width': 26 - i * 6, fill: 'none', opacity: 0.2, filter: 'url(#ink-blur-lg)' });
    }
  }

  // 远山三叠：远者淡青无皴，近者赭墨有皴有苔
  const ranges = [
    { base: 560, amp: 250, tone: mix(P.blue, silk1, night ? 0.3 : 0.55), op: night ? 0.55 : 0.5, cun: 0, dots: 0, seed: 'a', peaks: 4 },
    { base: 625, amp: 175, tone: mix(P.blue, P.inkWash, night ? 0.5 : 0.35), op: night ? 0.7 : 0.55, cun: 50, dots: 30, seed: 'b', peaks: 5 },
    { base: GROUND + 6, amp: 92, tone: mix(P.inkWash, P.earthDark, 0.4), op: night ? 0.85 : 0.62, cun: 60, dots: 50, seed: 'c', peaks: 7 },
  ];
  ranges.forEach((rg, idx) => {
    const Rm = rng(fig.id + 'mtn' + rg.seed);
    const peaks = Array.from({ length: rg.peaks }, () => ({ x: -100 + Rm() * (VB_W + 200), h: 0.45 + Rm() * 0.55, w: 160 + Rm() * 260 }));
    const ridge = (x) => {
      let y = 0;
      for (const p of peaks) {
        const t = Math.max(0, 1 - Math.abs(x - p.x) / p.w);
        y = Math.max(y, p.h * t ** 1.6);
      }
      return rg.base - rg.amp * (0.18 + y * 0.82) - 6 * Math.sin(x * 0.03 + idx);
    };
    let d = `M-40 ${VB_H}`;
    for (let x = -40; x <= VB_W + 40; x += 14) d += ` L${x} ${ridge(x).toFixed(1)}`;
    d += ` L${VB_W + 40} ${VB_H}Z`;
    const mg = k.g(svg);
    k.path(mg, d, { fill: k.grad([[0, rg.tone, rg.op], [0.35, rg.tone, rg.op * 0.55], [0.7, rg.tone, 0]]), filter: idx === 0 ? 'url(#ink-blur)' : '' });
    let rl = '';
    for (let x = -40; x <= VB_W + 40; x += 14) rl += `${rl ? ' L' : 'M'}${x} ${ridge(x).toFixed(1)}`;
    k.line(mg, rl, idx === 0 ? 0.9 : 1.3, P.line, idx === 0 ? 0.12 : night ? 0.35 : 0.42);
    if (rg.cun) k.cun(mg, Rm, rg.cun, 0, VB_W, ridge, rg.base, P.line, night ? 0.22 : 0.2, 22);
    if (rg.dots) k.dots(mg, Rm, rg.dots, 0, VB_W, (x) => ridge(x) + 2, 2.6, P.ink, night ? 0.45 : 0.4);
    k.mist(svg, VB_W / 2, rg.base - 20, VB_W * 0.7, 46, P.mistOp * (idx === 2 ? 0.7 : 1));
  });

  // 平野：淡墨地坪 + 坡脚线 + 草
  const gtop = night ? mix(sky1, '#05070a', 0.55) : mix(silk1, P.earth, 0.5);
  const gd = `M0 ${GROUND - 6} Q400 ${GROUND - 20} 800 ${GROUND - 2} T1600 ${GROUND - 10} L1600 ${VB_H} L0 ${VB_H}Z`;
  k.path(svg, gd, { fill: k.grad([[0, gtop], [0.5, mix(gtop, P.night ? '#000' : P.earthDark, 0.35)], [1, mix(gtop, '#000', 0.5)]]) });
  k.line(svg, `M0 ${GROUND - 6} Q400 ${GROUND - 20} 800 ${GROUND - 2} T1600 ${GROUND - 10}`, 1.2, P.line, night ? 0.3 : 0.35);
  const Rg = rng(fig.id + 'ground');
  for (let i = 0; i < 9; i++) {
    const x = Rg() * VB_W, y = GROUND + 14 + Rg() * 120, l = 60 + Rg() * 160;
    k.line(svg, `M${x.toFixed(0)} ${y.toFixed(0)} q${(l / 2).toFixed(0)} -6 ${l.toFixed(0)} 0`, 1, P.line, 0.16);
  }
  k.grass(svg, Rg, 60, 0, VB_W, GROUND + 4, VB_H - 40, P.line, night ? 0.3 : 0.35);
}

// ============ 礼制建筑 ============
export function paintArchitecture(k, ctx) {
  const { svg, fig, sc, TX, GROUND, isSite } = ctx;
  const { P } = k;
  const B = GROUND - 22; // 退后一层，雾锁其基
  const A = TX;
  const arch = sc.archType || (isSite ? 'palace_platform' : 'poet_garden');
  const banner = sc.archBanner || fig.name.slice(0, 4);
  const R = rng(fig.id + 'arch');
  const root = k.g(svg, { class: isSite ? 'site-arch ink-arch' : 'tomb-arch ink-arch' });
  // 远层（更小更淡）与主层
  const far = k.g(root, { opacity: 0.85 });
  const g = k.g(root, { filter: k.F.hand });

  const cypressRow = (x0, x1, n, base = B, h = 120, layer = far) => {
    for (let i = 0; i < n; i++) k.cypress(layer, x0 + ((x1 - x0) * i) / Math.max(1, n - 1) + (R() - 0.5) * 16, base + (R() - 0.5) * 6, h * (0.8 + R() * 0.35), 'cr' + i);
  };
  const spiritPath = (kinds = ['horse', 'official'], from = 230, to = 470, side = [-1, 1]) => {
    // 神道石像生：自远而近成对排列，近大远小
    kinds.forEach((kind, i) => {
      const t = i / Math.max(1, kinds.length - 1);
      const dx = from + (to - from) * t;
      const s = 1.25 + t * 0.6;
      side.forEach((sd) => k.statue(g, A + sd * dx, B + 10 + t * 18, kind, s, -sd));
    });
  };

  switch (arch) {
    // ——— 帝王陵寝 ———
    case 'emperor_fudou': {
      cypressRow(A - 520, A - 330, 4, B - 6, 110);
      cypressRow(A + 330, A + 520, 4, B - 6, 110);
      k.mound(g, A, B, 640, 215, { shape: 'fudou', seed: 'fd', trees: 9 });
      k.que(g, A - 330, B + 16, 150, 54);
      k.que(g, A + 330, B + 16, 150, 54);
      spiritPath(['horse', 'lion', 'official'], 180, 250);
      break;
    }
    case 'emperor_shanling': {
      k.mound(far, A + 60, B - 10, 980, 360, { shape: 'mountain', seed: 'sl', tone: mix(P.earth, P.green, 0.35), trees: 14 });
      cypressRow(A - 470, A - 300, 3, B, 100, far);
      k.huabiao(g, A - 190, B + 10, 165);
      k.huabiao(g, A + 190, B + 10, 165);
      k.que(g, A - 330, B + 16, 104, 40);
      k.que(g, A + 330, B + 16, 104, 40);
      spiritPath(['horse', 'horse', 'official'], 230, 300);
      break;
    }
    case 'emperor_minglou': {
      cypressRow(A - 520, A - 360, 4, B - 10, 120);
      cypressRow(A + 360, A + 520, 4, B - 10, 120);
      k.mound(far, A, B - 34, 600, 150, { shape: 'dome', seed: 'bd', tone: mix(P.earth, P.green, 0.3), trees: 10 });
      // 宝城：环抱封土的城墙
      const wy = B - 30;
      k.path(g, `M${A - 320} ${B} V${wy} H${A + 320} V${B}Z`, { fill: k.grad([[0, mix(P.stone, P.column, 0.25)], [1, mix(P.stoneDark, P.column, 0.2)]]) });
      for (let x = A - 316; x < A + 316; x += 14) k.path(g, `M${x} ${wy} v-7 h7 v7Z`, { fill: mix(P.stone, P.column, 0.25), stroke: P.line, 'stroke-width': 0.6 });
      k.line(g, `M${A - 320} ${wy} H${A + 320} M${A - 320} ${B} V${wy} M${A + 320} ${B} V${wy}`, 1);
      // 方城明楼
      const fw = 200, fy = B - 96;
      k.path(g, `M${A - fw / 2} ${B} L${A - fw / 2 + 6} ${fy} H${A + fw / 2 - 6} L${A + fw / 2} ${B}Z`, { fill: k.grad([[0, mix(P.stone, P.column, 0.35)], [1, mix(P.stoneDark, P.column, 0.3)]]) });
      for (let y = B - 10; y > fy; y -= 8) k.line(g, `M${A - fw / 2 + 4} ${y} H${A + fw / 2 - 4}`, 0.5, P.line, 0.3);
      k.path(g, `M${A - 22} ${B} V${B - 42} a22 22 0 0 1 44 0 V${B}Z`, { fill: P.ink, opacity: 0.8 });
      k.line(g, `M${A - fw / 2} ${B} L${A - fw / 2 + 6} ${fy} H${A + fw / 2 - 6} L${A + fw / 2} ${B}`, 1.2);
      const h1 = k.hall(g, A, fy, { w: 130, colH: 40, bays: 3, roofType: 'xieshan', double: true, roofH: 60 });
      k.plaque(g, A, fy - 52, banner.slice(0, 4), 58, 15);
      void h1;
      break;
    }
    case 'emperor_ordos': {
      const yurt = (cx, w, h) => {
        const yg = k.g(g);
        k.path(yg, `M${cx - w / 2} ${B} V${B - h * 0.45} H${cx + w / 2} V${B}Z`, { fill: k.grad([[0, mix(P.wall, P.stone, 0.15)], [1, P.stone]]) });
        k.line(yg, `M${cx - w / 2} ${B} V${B - h * 0.45} H${cx + w / 2} V${B}`, 1.1);
        k.path(yg, `M${cx - w / 2 - 6} ${B - h * 0.45} Q${cx - w * 0.4} ${B - h * 1.05} ${cx} ${B - h} Q${cx + w * 0.4} ${B - h * 1.05} ${cx + w / 2 + 6} ${B - h * 0.45}Z`, { fill: k.grad([[0, mix(P.gold, '#d6b25c', 0.4)], [1, mix(P.gold, P.earthDark, 0.35)]]) });
        k.line(yg, `M${cx - w / 2 - 6} ${B - h * 0.45} Q${cx - w * 0.4} ${B - h * 1.05} ${cx} ${B - h} Q${cx + w * 0.4} ${B - h * 1.05} ${cx + w / 2 + 6} ${B - h * 0.45}`, 1.2);
        for (let i = -2; i <= 2; i++) k.line(yg, `M${cx + i * w * 0.12} ${B - h * 0.98} Q${cx + i * w * 0.2} ${B - h * 0.7} ${cx + i * w * 0.24} ${B - h * 0.47}`, 0.7, P.line, 0.5);
        k.path(yg, `M${cx - 12} ${B} V${B - h * 0.3} H${cx + 12} V${B}Z`, { fill: P.cinnabar, opacity: 0.8 });
        k.line(yg, `M${cx} ${B - h} V${B - h - 16}`, 1.4, P.ink);
      };
      yurt(A - 230, 140, 130);
      yurt(A + 230, 140, 130);
      yurt(A, 220, 190);
      [-380, 380].forEach((dx) => {
        k.line(g, `M${A + dx} ${B + 12} V${B - 210}`, 2, P.ink);
        k.line(g, `M${A + dx - 8} ${B - 220} L${A + dx} ${B - 238} L${A + dx + 8} ${B - 220} M${A + dx} ${B - 210} V${B - 238}`, 1.6, P.ink);
        for (let i = -3; i <= 3; i++) k.line(g, `M${A + dx} ${B - 206} q${i * 3} 14 ${i * 5} 30`, 1.1, P.ink, 0.8);
      });
      break;
    }
    // ——— 圣贤：孔林式牌坊柏林 ———
    case 'sage_paifang': {
      cypressRow(A - 560, A + 560, 12, B - 30, 130);
      k.mound(far, A + 150, B - 26, 300, 95, { shape: 'dome', seed: 'sg', tone: mix(P.earth, P.green, 0.4), trees: 4 });
      k.paifang(g, A, B + 6, 320, 190);
      k.plaque(g, A, B + 6 - 190 * 0.74 - 8, banner.slice(0, 4), 70, 14, { color: P.blue, ink: '#efe2c0' });
      break;
    }
    // ——— 名臣：御碑亭 + 封土 ———
    case 'minister_pavilion': {
      cypressRow(A - 520, A - 330, 4, B - 12, 120);
      k.mound(far, A + 260, B - 10, 360, 120, { shape: 'dome', seed: 'mp', trees: 5 });
      cypressRow(A + 420, A + 560, 3, B - 12, 130);
      const t = k.terrace(g, A - 40, B + 6, 250, 26, { rail: false });
      k.hall(g, A - 40, t.top, { w: 160, colH: 92, bays: 3, roofType: 'xieshan', double: true, roofH: 80 });
      spiritPath(['official', 'horse'], 260, 330, [-1]);
      break;
    }
    // ——— 名将：冢象祁连 ———
    case 'general_qilian': {
      k.mound(far, A + 10, B - 4, 600, 120, { shape: 'dome', seed: 'ql', tone: mix(P.earth, P.green, 0.3), trees: 3 });
      k.rockPile(g, A + 10, B + 4, 540, 230, 'ql');
      k.statue(g, A - 300, B + 22, 'horse', 2.4, 1);
      k.statue(g, A + 300, B + 22, 'lion', 1.8, -1);
      k.banner(g, A + 400, B + 18, 230, P.cinnabar, banner.slice(0, 1));
      cypressRow(A - 560, A - 420, 3, B - 4, 120);
      break;
    }
    // ——— 起义豪杰：盟坛 + 劈裂摩崖 ———
    case 'rebel_altar': {
      k.cliff(far, A + 200, A + 560, B, 260, 'rb');
      const t = k.terrace(g, A, B + 8, 440, 96, { tiers: 3, rail: false, tone: mix(P.stone, P.earth, 0.35), shrink: 0.16 });
      // 燎原火盆
      k.path(g, `M${A - 26} ${t.top} q2 -18 26 -20 q24 2 26 20Z`, { fill: mix(P.green, P.ink, 0.4), stroke: P.line, 'stroke-width': 1 });
      k.path(g, `M${A - 14} ${t.top - 18} q4 -26 14 -36 q10 12 14 36Z`, { fill: '#c8592e', opacity: 0.75, class: 'ink-fire' });
      k.banner(g, A - 280, B + 14, 210, P.cinnabar, '义');
      k.banner(g, A + 250, B + 14, 180, mix(P.ink, P.cinnabar, 0.3));
      break;
    }
    // ——— 高僧：砖石密檐塔 ———
    case 'monk_pagoda': {
      cypressRow(A - 520, A - 330, 4, B - 8, 120);
      k.wall(far, A - 300, A + 420, B - 6, 46);
      k.pagoda(g, A + 190, B + 4, 5, 76, 330);
      k.pagoda(g, A - 160, B + 4, 3, 44, 170);
      break;
    }
    // ——— 天文：观星台 + 圭表 + 浑仪 ———
    case 'scholar_observatory': {
      const ox = A - 170;
      k.path(g, `M${ox - 95} ${B} L${ox - 62} ${B - 190} H${ox + 62} L${ox + 95} ${B}Z`, { fill: k.grad([[0, mix(P.stone, P.earth, 0.3)], [1, mix(P.stoneDark, P.earth, 0.3)]], { x2: 1, y2: 0 }) });
      for (let y = B - 10; y > B - 190; y -= 9) k.line(g, `M${ox - 90 + (B - y) * 0.17} ${y} H${ox + 90 - (B - y) * 0.17}`, 0.5, P.line, 0.3);
      k.line(g, `M${ox - 95} ${B} L${ox - 62} ${B - 190} H${ox + 62} L${ox + 95} ${B}`, 1.2);
      k.path(g, `M${ox - 8} ${B} V${B - 190} h16 V${B}Z`, { fill: P.ink, opacity: 0.55 });
      k.hall(g, ox, B - 190, { w: 90, colH: 26, bays: 3, roofType: 'xieshan', roofH: 30 });
      // 石圭
      k.path(g, `M${ox + 8} ${B + 10} H${A + 200} v-10 H${ox + 8}Z`, { fill: P.stoneLight, stroke: P.line, 'stroke-width': 0.9 });
      for (let x = ox + 20; x < A + 200; x += 14) k.line(g, `M${x} ${B + 2} v5`, 0.7);
      // 浑仪
      const hx = A + 300, hy = B - 120;
      k.path(g, `M${hx - 30} ${B + 6} L${hx - 10} ${hy + 60} M${hx + 30} ${B + 6} L${hx + 10} ${hy + 60}`, { fill: 'none', stroke: mix(P.green, P.ink, 0.3), 'stroke-width': 4 });
      svgEl('circle', { cx: hx, cy: hy, r: 62, fill: 'none', stroke: mix(P.green, P.ink, 0.25), 'stroke-width': 3 }, g);
      svgEl('ellipse', { cx: hx, cy: hy, rx: 62, ry: 20, fill: 'none', stroke: mix(P.green, P.ink, 0.25), 'stroke-width': 2.4, transform: `rotate(-24 ${hx} ${hy})` }, g);
      svgEl('ellipse', { cx: hx, cy: hy, rx: 20, ry: 62, fill: 'none', stroke: mix(P.green, P.ink, 0.25), 'stroke-width': 2, transform: `rotate(18 ${hx} ${hy})` }, g);
      break;
    }
    // ——— 百工医圣：祠堂 ———
    case 'artisan_shrine': {
      cypressRow(A - 540, A - 380, 3, B - 6, 110);
      k.wall(far, A - 360, A + 380, B - 4, 58, { windows: [{ cx: A - 250, cy: B - 44, s: 16 }, { cx: A + 260, cy: B - 44, s: 16 }] });
      const t = k.terrace(g, A, B + 8, 330, 30, { rail: true });
      k.hall(g, A, t.top, { w: 230, colH: 76, bays: 5, roofType: 'xieshan', roofH: 74 });
      k.plaque(g, A, t.top - 102, banner.slice(0, 4), 74, 18, { color: P.blue, ink: '#efe2c0' });
      k.willow(g, A + 430, B + 10, 210);
      break;
    }
    // ——— 文人：粉墙黛瓦月洞门诗冢 ———
    case 'poet_garden': {
      k.wall(g, A - 470, A + 250, B, 140, { moonGate: { cx: A - 300, r: 56 }, windows: [{ cx: A + 150, cy: B - 100, s: 20 }] });
      k.mound(g, A + 30, B + 8, 230, 74, { shape: 'dome', seed: 'pg', tone: mix(P.earth, P.green, 0.35) });
      k.path(g, `M${A - 85} ${B + 8} Q${A + 30} ${B - 6} ${A + 145} ${B + 8} v-12 Q${A + 30} ${B - 18} ${A - 85} ${B - 4}Z`, { fill: mix(P.stone, P.wall, 0.2), stroke: P.line, 'stroke-width': 0.9 });
      k.rock(g, A + 200, B + 14, 66, 96, 'tai', { holes: true });
      k.bamboo(g, A + 280, B + 14, 200, 6, 'pgb');
      k.willow(g, A - 540, B + 18, 250);
      break;
    }

    // ——— 古战场 ———
    case 'battle_chariot': {
      const t = k.terrace(g, A, B + 8, 560, 46, { rail: false, stairs: true, tone: mix(P.earth, P.stone, 0.3) });
      k.tent(g, A, t.top, 210, 120);
      k.banner(g, A - 140, t.top, 170, P.cinnabar, banner.slice(0, 1));
      k.banner(g, A + 160, t.top, 150, mix(P.ink, P.blue, 0.4));
      // 残车
      const cx = A - 340, cy = B - 4;
      svgEl('circle', { cx, cy, r: 34, fill: 'none', stroke: P.wood, 'stroke-width': 4 }, g);
      for (let a = 0; a < 180; a += 30) { const r = (a * Math.PI) / 180; k.line(g, `M${cx - Math.cos(r) * 34} ${cy - Math.sin(r) * 34} L${cx + Math.cos(r) * 34} ${cy + Math.sin(r) * 34}`, 1.2, P.wood); }
      k.line(g, `M${cx + 10} ${cy} L${cx + 120} ${cy - 30}`, 3, P.wood);
      // 折戟沉沙
      [[A + 300, 0.3], [A + 340, -0.2], [A + 420, 0.15], [A - 450, -0.25]].forEach(([x, lean]) => k.line(g, `M${x} ${B + 30} l${lean * 60} -110`, 1.6, P.ink, 0.8));
      break;
    }
    case 'battle_altar': {
      k.ruinWall(far, A - 560, A - 220, B - 6, 70, 'ba1');
      k.ruinWall(far, A + 240, A + 560, B - 6, 56, 'ba2');
      const t = k.terrace(g, A, B + 8, 420, 80, { tiers: 2, rail: false, tone: mix(P.earth, P.stone, 0.2), shrink: 0.22 });
      k.banner(g, A - 120, t.top, 150, mix(P.ink, P.cinnabar, 0.35), banner.slice(0, 1));
      k.banner(g, A + 110, t.top, 130, mix(P.ink, P.cinnabar, 0.6));
      for (let i = 0; i < 14; i++) { const x = A - 500 + R() * 1000; k.line(g, `M${x.toFixed(0)} ${B + 30 + R() * 30} l${(R() - 0.5) * 30} -${30 + R() * 20}`, 1, P.ink, 0.6); }
      break;
    }
    case 'battle_cliff': {
      k.cliff(g, A - 520, A - 40, B + 10, 330, 'bc');
      const tx = A - 300, chars = fig.id === 'site_chibi' ? ['赤', '壁'] : [...banner.slice(0, 2)];
      chars.forEach((ch, i) => {
        const t = svgEl('text', { x: tx, y: B - 200 + i * 66, 'font-size': 58, 'text-anchor': 'middle', fill: P.cinnabar, opacity: 0.85, 'font-family': 'var(--f-brush)' }, g);
        t.textContent = ch;
      });
      k.water(g, -40, 1640, B + 14, B + 60, 'bcw');
      [[A + 190, 0.85], [A + 300, 0.55]].forEach(([x, s], i) => {
        const bg = k.g(g, { transform: `translate(${x} ${B + 26}) scale(${s})` });
        k.path(bg, 'M-70 0 Q0 18 70 0 L58 -12 H-58Z', { fill: P.wood, stroke: P.line, 'stroke-width': 1 });
        k.line(bg, 'M0 -12 V-110', 2, P.ink);
        k.path(bg, 'M2 -104 q40 30 0 80 Z', { fill: P.wall, opacity: 0.7, stroke: P.line, 'stroke-width': 0.8 });
        if (i === 0) svgEl('ellipse', { cx: -20, cy: -40, rx: 30, ry: 44, fill: '#d0643a', opacity: 0.35, filter: k.F.soft }, bg);
      });
      break;
    }
    case 'battle_pass': {
      k.cliff(far, A - 640, A - 300, B, 300, 'bp1');
      k.cliff(far, A + 300, A + 640, B, 280, 'bp2');
      const wy = B - 90;
      k.path(g, `M${A - 330} ${B} V${wy} H${A + 330} V${B}Z`, { fill: k.grad([[0, mix(P.stone, P.earth, 0.25)], [1, mix(P.stoneDark, P.earth, 0.25)]]) });
      for (let y = B - 8; y > wy; y -= 8) k.line(g, `M${A - 326} ${y} H${A + 326}`, 0.45, P.line, 0.3);
      for (let x = A - 326; x < A + 326; x += 16) k.path(g, `M${x} ${wy} v-9 h9 v9Z`, { fill: mix(P.stone, P.earth, 0.25), stroke: P.line, 'stroke-width': 0.6 });
      k.path(g, `M${A - 30} ${B} V${B - 50} a30 30 0 0 1 60 0 V${B}Z`, { fill: P.ink, opacity: 0.85 });
      k.line(g, `M${A - 330} ${B} V${wy} H${A + 330} V${B}`, 1.2);
      k.hall(g, A, wy - 9, { w: 200, colH: 44, bays: 5, roofType: 'xieshan', double: true, roofH: 74 });
      k.plaque(g, A, wy - 30, banner.slice(0, 4), 70, 16);
      break;
    }

    // ——— 宫殿建筑遗址 ———
    case 'palace_imperial': {
      const t = k.terrace(g, A, B + 8, 680, 96, { tiers: 3, rail: true, tone: mix(P.stoneLight, P.wall, 0.4) });
      k.hall(g, A, t.top, { w: 420, colH: 78, bays: 9, roofType: 'wudian', double: true, roofH: 130, color: P.night ? P.roof : mix('#b8923e', P.roof, 0.35) });
      k.wall(far, A - 620, A - 360, B - 6, 70);
      k.wall(far, A + 360, A + 620, B - 6, 70);
      break;
    }
    case 'palace_platform': {
      // 夯土台基残存 + 依考古复原的殿宇淡线（虚线勾勒，似存似亡）
      const t = k.terrace(g, A, B + 8, 720, 84, { tiers: 2, rail: false, tone: mix(P.earth, P.stone, 0.3), stairs: true, shrink: 0.12 });
      k.cun(g, R, 40, A - 340, A + 340, () => B - 80, B, P.line, 0.25, 16);
      for (let x = A - 280; x <= A + 280; x += 56) svgEl('ellipse', { cx: x, cy: t.top + 2, rx: 10, ry: 3, fill: P.stoneDark, opacity: 0.7 }, g);
      const ghost = k.g(root, { opacity: P.night ? 0.42 : 0.35, 'stroke-dasharray': '5 4' });
      k.hall(ghost, A, t.top, { w: 520, colH: 90, bays: 9, roofType: 'wudian', double: true, roofH: 140 });
      break;
    }
    case 'palace_tower': {
      const t = k.terrace(g, A, B + 8, 420, 60, { tiers: 1, rail: true });
      let base = t.top;
      const levels = 3;
      for (let i = 0; i < levels; i++) {
        const w = 300 - i * 56;
        const rh = i === levels - 1 ? 92 : 50;
        const h = k.hall(g, A, base, { w, colH: i === 0 ? 74 : 54, bays: 5 - (i === 2 ? 2 : 0), roofType: i === levels - 1 ? 'xieshan' : 'wudian', roofH: rh });
        if (i < levels - 1) {
          base = h.top + rh * 0.62;
          k.line(g, `M${A - w * 0.42} ${base} H${A + w * 0.42}`, 1.2, P.ink);
          for (let x = A - w * 0.42; x <= A + w * 0.42; x += 9) k.line(g, `M${x} ${base} v-9`, 0.7, P.line, 0.8);
          k.line(g, `M${A - w * 0.42} ${base - 9} H${A + w * 0.42}`, 0.8);
        }
      }
      k.plaque(g, A, t.top - 92, banner.slice(0, 4), 74, 17);
      break;
    }
    case 'palace_pavilion': {
      k.bamboo(far, A - 420, B, 230, 7, 'lt1');
      k.bamboo(far, A + 380, B, 210, 6, 'lt2');
      // 曲水
      k.path(g, `M${A - 600} ${B + 40} C${A - 400} ${B + 10} ${A - 300} ${B + 52} ${A - 120} ${B + 30} S${A + 200} ${B + 6} ${A + 520} ${B + 36}`, { fill: 'none', stroke: mix(P.blue, P.wall, 0.4), 'stroke-width': 16, opacity: 0.6 });
      k.line(g, `M${A - 600} ${B + 40} C${A - 400} ${B + 10} ${A - 300} ${B + 52} ${A - 120} ${B + 30} S${A + 200} ${B + 6} ${A + 520} ${B + 36}`, 0.8, P.line, 0.5);
      const t = k.terrace(g, A + 120, B + 4, 170, 22, { rail: false, stairs: false });
      k.hall(g, A + 120, t.top, { w: 110, colH: 72, bays: 2, roofType: 'cuanjian', roofH: 74 });
      k.rock(g, A - 220, B + 22, 80, 60, 'lt', { holes: true });
      break;
    }
    case 'palace_bridge': {
      k.water(g, -40, 1640, B - 10, B + 50, 'zw');
      const bw = 560, by = B - 6, ah = 120;
      const deck = `M${A - bw / 2 - 30} ${by} Q${A} ${by - ah - 30} ${A + bw / 2 + 30} ${by}`;
      k.path(g, `${deck} L${A + bw / 2 - 10} ${by + 6} A${bw * 0.46} ${ah * 0.95} 0 0 0 ${A - bw / 2 + 10} ${by + 6}Z`, { fill: k.grad([[0, P.stoneLight], [1, P.stone]]) });
      k.line(g, deck, 1.4);
      k.path(g, `M${A - bw / 2 + 10} ${by + 6} A${bw * 0.46} ${ah * 0.95} 0 0 1 ${A + bw / 2 - 10} ${by + 6}`, { fill: 'none', stroke: P.line, 'stroke-width': 1.4 });
      for (let a = -70; a <= 70; a += 10) {
        const rad = (a * Math.PI) / 180;
        k.line(g, `M${A + Math.sin(rad) * bw * 0.46} ${by + 6 - Math.cos(rad) * ah * 0.95} l${Math.sin(rad) * 10} ${-Math.cos(rad) * 10}`, 0.7, P.line, 0.7);
      }
      [-1, 1].forEach((s) => {
        [0.28, 0.4].forEach((p) => svgEl('ellipse', { cx: A + s * bw * p, cy: by - ah * 0.42, rx: bw * 0.04, ry: ah * 0.16, fill: P.ink, opacity: 0.45 }, g));
      });
      k.line(g, `M${A - bw / 2 - 20} ${by - 10} Q${A} ${by - ah - 42} ${A + bw / 2 + 20} ${by - 10}`, 1, P.line, 0.7);
      break;
    }
    case 'palace_waterworks': {
      if (fig.id === 'site_nanhai1') {
        k.water(g, -40, 1640, B - 30, B + 60, 'nh');
        const hull = `M${A - 260} ${B - 10} Q${A} ${B + 50} ${A + 260} ${B - 10}`;
        k.path(g, `${hull} L${A + 230} ${B - 40} H${A - 230}Z`, { fill: k.grad([[0, P.wood], [1, mix(P.wood, P.ink, 0.5)]]), opacity: 0.85 });
        k.line(g, hull, 1.4);
        for (let x = A - 220; x <= A + 220; x += 30) k.line(g, `M${x} ${B - 40} V${B - 4 + Math.abs(x - A) * -0.08}`, 0.9, P.line, 0.7);
        for (let i = 0; i < 9; i++) svgEl('ellipse', { cx: A - 160 + i * 40, cy: B - 46, rx: 12, ry: 9, fill: mix(P.wall, P.blue, 0.2), stroke: P.line, 'stroke-width': 0.8 }, g);
      } else {
        k.mound(far, A + 300, B - 20, 420, 150, { shape: 'mountain', seed: 'dj', tone: mix(P.green, P.earth, 0.4) });
        k.hall(far, A + 300, B - 150, { w: 110, colH: 28, bays: 3, roofType: 'xieshan', roofH: 34 });
        k.water(g, -40, 1640, B - 12, B + 56, 'dj');
        k.path(g, `M${A - 320} ${B + 30} Q${A - 60} ${B + 6} ${A + 140} ${B + 20} Q${A - 60} ${B + 28} ${A - 320} ${B + 30}Z`, { fill: P.stone, stroke: P.line, 'stroke-width': 1 });
        for (let x = A - 260; x < A + 100; x += 26) k.path(g, `M${x} ${B + 26} h18 v-12 h-18Z`, { fill: mix(P.wood, P.stone, 0.4), stroke: P.line, 'stroke-width': 0.7 });
      }
      break;
    }

    // ——— 考古文明遗址 ———
    case 'arch_jade_altar': {
      k.terrace(g, A, B + 8, 600, 90, { tiers: 3, rail: false, tone: mix(P.earth, P.wall, 0.15), shrink: 0.2 });
      const cx = A + 320, cy = B - 30;
      k.path(g, `M${cx - 26} ${cy} V${cy - 120} H${cx + 26} V${cy}Z`, { fill: k.grad([[0, mix(P.green, P.wall, 0.25)], [1, mix(P.green, P.ink, 0.3)]], { x2: 1, y2: 0 }) });
      for (let y = cy - 14; y > cy - 116; y -= 22) k.line(g, `M${cx - 26} ${y} H${cx + 26}`, 0.9);
      svgEl('ellipse', { cx, cy: cy - 120, rx: 22, ry: 6, fill: mix(P.green, P.wall, 0.3), stroke: P.line, 'stroke-width': 1 }, g);
      k.line(g, `M${cx - 26} ${cy} V${cy - 120} H${cx + 26} V${cy}`, 1.1);
      break;
    }
    case 'arch_bronze_pit':
    case 'arch_terracotta': {
      // 探方：下挖坑壁 + 拉线网格
      const pw = 620, pd = 70;
      k.path(g, `M${A - pw / 2} ${B} L${A - pw / 2 + 30} ${B + pd} H${A + pw / 2 - 30} L${A + pw / 2} ${B}Z`, { fill: k.grad([[0, mix(P.earthDark, P.ink, 0.25)], [1, P.earth]]) });
      k.line(g, `M${A - pw / 2} ${B} L${A - pw / 2 + 30} ${B + pd} H${A + pw / 2 - 30} L${A + pw / 2} ${B}`, 1.2);
      for (let x = A - pw / 2 + 60; x < A + pw / 2; x += 80) k.line(g, `M${x} ${B} L${x + (x - A) * 0.08} ${B + pd}`, 0.6, P.cinnabar, 0.6);
      if (arch === 'arch_terracotta') {
        // 保护大厅只以淡线勾出拱架，俑阵分列坑中两侧，避开碑石
        const shed = k.g(far, { opacity: P.night ? 0.4 : 0.32 });
        k.line(shed, `M${A - 420} ${B - 6} Q${A} ${B - 250} ${A + 420} ${B - 6}`, 1.4, P.line);
        for (let i = -4; i <= 4; i++) k.line(shed, `M${A + i * 92} ${B - 6} V${B - 6 - Math.sqrt(Math.max(0, 1 - ((i * 92) / 420) ** 2)) * 230}`, 0.8, P.line);
        for (let row = 0; row < 3; row++) {
          for (let i = 0; i < 6; i++) {
            const s2 = 1.15 + row * 0.18;
            [-1, 1].forEach((sd) => k.statue(g, A + sd * (95 + i * 36 * (0.9 + row * 0.08)), B + 22 + row * 20, 'official', s2, 1));
          }
        }
      } else {
        const dx = A + 340, dy = B - 4;
        k.path(g, `M${dx - 50} ${dy - 74} H${dx + 50} Q${dx + 48} ${dy - 20} ${dx + 30} ${dy - 14} H${dx - 30} Q${dx - 48} ${dy - 20} ${dx - 50} ${dy - 74}Z`, { fill: k.grad([[0, mix(P.green, P.wall, 0.15)], [1, mix(P.green, P.ink, 0.4)]]) });
        k.line(g, `M${dx - 50} ${dy - 74} H${dx + 50} Q${dx + 48} ${dy - 20} ${dx + 30} ${dy - 14} H${dx - 30} Q${dx - 48} ${dy - 20} ${dx - 50} ${dy - 74}Z`, 1.1);
        k.line(g, `M${dx - 30} ${dy - 74} v-16 h10 M${dx + 30} ${dy - 74} v-16 h-10 M${dx - 24} ${dy - 14} v18 M${dx + 24} ${dy - 14} v18 M${dx} ${dy - 14} v18`, 3, mix(P.green, P.ink, 0.4));
        k.line(g, `M${dx - 40} ${dy - 56} q10 -8 20 0 t20 0 t20 0 t20 0`, 0.9, P.line, 0.7);
        k.mound(far, A - 380, B - 4, 200, 60, { shape: 'dome', seed: 'sp' });
      }
      break;
    }
    case 'arch_sanxingdui': {
      const tx = A - 300;
      const bronzeC = P.night ? mix(P.gold, P.green, 0.45) : mix(P.green, P.ink, 0.35);
      k.line(g, `M${tx} ${B + 10} V${B - 300}`, 6, bronzeC);
      [0.25, 0.55, 0.85].forEach((p, i) => {
        const y = B - 300 * p;
        [-1, 1].forEach((s) => {
          const len = 90 - i * 20;
          k.line(g, `M${tx} ${y} q${s * len * 0.5} -${30 - i * 6} ${s * len} 10 q${s * 6} 12 ${s * 2} 22`, 3.4, bronzeC);
          svgEl('circle', { cx: tx + s * len, cy: y + 2, r: 7, fill: mix(P.gold, P.green, 0.5), stroke: P.line, 'stroke-width': 0.8 }, g);
          k.path(g, `M${tx + s * len * 0.6} ${y - 22} q${s * 8} -10 ${s * 16} -2 q${-s * 6} 2 ${-s * 16} 2Z`, { fill: bronzeC });
        });
      });
      const mx = A + 250, my = B - 120;
      k.path(g, `M${mx - 80} ${my} Q${mx} ${my - 70} ${mx + 80} ${my} L${mx + 60} ${my + 80} Q${mx} ${my + 100} ${mx - 60} ${my + 80}Z`, { fill: k.grad([[0, mix(P.green, P.gold, 0.4)], [1, mix(P.green, P.ink, 0.45)]]) });
      k.line(g, `M${mx - 80} ${my} Q${mx} ${my - 70} ${mx + 80} ${my} L${mx + 60} ${my + 80} Q${mx} ${my + 100} ${mx - 60} ${my + 80}Z`, 1.2);
      [-1, 1].forEach((s) => {
        k.path(g, `M${mx + s * 30} ${my + 10} l${s * 40} -6 l0 14Z`, { fill: P.ink, opacity: 0.7 });
        k.path(g, `M${mx + s * 80} ${my + 6} q${s * 40} -20 ${s * 50} -60 q${-s * 4} 30 ${-s * 30} 70Z`, { fill: mix(P.green, P.ink, 0.35), stroke: P.line, 'stroke-width': 0.8 });
      });
      k.line(g, `M${mx - 34} ${my + 56} q34 16 68 0`, 1.6, P.ink);
      k.path(g, `M${mx - 40} ${B + 10} v-${B - my - 92} h80 v${B - my - 92}Z`, { fill: P.stone, stroke: P.line, 'stroke-width': 0.9 });
      break;
    }
    case 'arch_desert_stupa': {
      const dune = (x0, x1, h) => k.path(far, `M${x0} ${B + 10} Q${(x0 + x1) / 2} ${B - h} ${x1} ${B + 10}Z`, { fill: mix(P.earth, P.wall, 0.3), opacity: 0.7 });
      dune(A - 700, A - 100, 140);
      dune(A + 200, A + 800, 120);
      k.ruinWall(g, A - 470, A - 160, B + 6, 80, 'ds1');
      k.ruinWall(g, A + 170, A + 420, B + 6, 64, 'ds2');
      const sx = A + 40;
      k.ruinWall(g, sx - 120, sx + 120, B + 8, 90, 'ds3');
      const top = B - 82;
      k.path(g, `M${sx - 70} ${top} Q${sx - 64} ${top - 120} ${sx} ${top - 130} Q${sx + 64} ${top - 118} ${sx + 70} ${top} Z`, { fill: k.grad([[0, mix(P.earth, P.wall, 0.2)], [1, mix(P.earth, P.earthDark, 0.4)]], { x2: 1, y2: 0 }) });
      k.cun(g, R, 20, sx - 66, sx + 66, () => top - 120, top, P.line, 0.35, 16);
      k.line(g, `M${sx - 70} ${top} Q${sx - 64} ${top - 120} ${sx} ${top - 130} Q${sx + 64} ${top - 118} ${sx + 70} ${top}`, 1.2);
      break;
    }
    case 'arch_grotto':
    case 'arch_mogao': {
      const tone = arch === 'arch_mogao' ? mix(P.earth, P.wall, 0.3) : P.stone;
      k.cliff(g, A - 640, A + 640, B + 6, 380, 'gr', { tone });
      const niche = (cx, cy, w, h) => {
        k.path(g, `M${cx - w / 2} ${cy} V${cy - h * 0.6} Q${cx} ${cy - h * 1.1} ${cx + w / 2} ${cy - h * 0.6} V${cy}Z`, { fill: P.ink, opacity: 0.55 });
        k.line(g, `M${cx - w / 2} ${cy} V${cy - h * 0.6} Q${cx} ${cy - h * 1.1} ${cx + w / 2} ${cy - h * 0.6} V${cy}`, 0.9);
      };
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
        const x = A - 560 + i * 140 + (row % 2) * 60, y = B - 60 - row * 100;
        if (Math.abs(x - (A - 270)) < 150) continue;
        niche(x, y, 26, 38);
      }
      if (arch === 'arch_mogao') {
        const cx = A - 270;
        let base = B + 4;
        for (let i = 0; i < 5; i++) {
          const w = 150 - i * 12;
          const h = k.hall(g, cx, base, { w, colH: 36, bays: 3, roofType: i === 4 ? 'cuanjian' : 'wudian', roofH: 26 });
          base = h.top + 12;
        }
      } else {
        // 大佛龛与线描坐佛
        const cx = A - 270, cy = B + 4, w = 220, h = 300;
        k.path(g, `M${cx - w / 2} ${cy} V${cy - h * 0.62} Q${cx} ${cy - h * 1.08} ${cx + w / 2} ${cy - h * 0.62} V${cy}Z`, { fill: mix(P.stoneDark, P.ink, 0.35), opacity: 0.85 });
        const bud = k.g(g, { fill: 'none', stroke: P.night ? '#c9bea2' : '#e6dcc4', 'stroke-width': 1.4, opacity: 0.85 });
        svgEl('ellipse', { cx, cy: cy - 220, rx: 26, ry: 32 }, bud);
        svgEl('circle', { cx, cy: cy - 220, r: 56, opacity: 0.6 }, bud);
        k.path(bud, `M${cx - 30} ${cy - 192} Q${cx - 80} ${cy - 160} ${cx - 76} ${cy - 90} Q${cx - 90} ${cy - 40} ${cx - 90} ${cy - 20} H${cx + 90} Q${cx + 90} ${cy - 40} ${cx + 76} ${cy - 90} Q${cx + 80} ${cy - 160} ${cx + 30} ${cy - 192}`);
        k.path(bud, `M${cx - 40} ${cy - 100} Q${cx} ${cy - 84} ${cx + 40} ${cy - 100} M${cx - 70} ${cy - 30} Q${cx} ${cy - 60} ${cx + 70} ${cy - 30}`);
      }
      break;
    }
    default: {
      const t = k.terrace(g, A, B + 8, 360, 40, { rail: true });
      k.hall(g, A, t.top, { w: 240, colH: 74, bays: 5 });
    }
  }

  // 雾锁其基：让建筑自然退入中景
  k.mist(root, A, B + 4, 560, 28, P.mistOp * 1.1);
  return root;
}

// ============ 碑石 ============
// variant：imperial / bixi / sage / general / literati / raw / battle / palace / boundary
export function paintStele(k, parent, { x, base, variant, chars, hint, label }) {
  const { P } = k;
  const g = k.g(parent, { class: 'stele', transform: `translate(${x} ${base})`, role: 'button', tabindex: 0, 'aria-label': label });
  svgEl('rect', { class: 'stele-glow', x: -66, y: -250, width: 132, height: 260, rx: 30, fill: '#f3d78a', opacity: 0.6, filter: 'url(#ink-blur-lg)' }, g);
  const body = k.g(g, { filter: k.F.hand });
  const stoneL = P.night ? mix(P.stone, '#b9b2a0', 0.25) : mix(P.stoneLight, P.stone, 0.3);
  const stoneD = P.night ? P.stoneDark : mix(P.stone, P.stoneDark, 0.55);
  const fill = k.grad([[0, stoneL], [0.55, mix(stoneL, stoneD, 0.45)], [1, stoneD]], { x2: 1, y2: 0 });
  const R = rng(String(chars.join('')) + variant);

  // 碑座
  let seatTop = -22;
  if (variant === 'bixi') {
    k.path(body, 'M-78 0 Q-74 -36 -10 -40 Q60 -40 70 -6 L78 0Z', { fill });
    k.line(body, 'M-78 0 Q-74 -36 -10 -40 Q60 -40 70 -6 L78 0', 1.2);
    k.line(body, 'M-50 -28 l14 -6 l14 6 l-14 6Z M-14 -32 l14 -6 l14 6 l-14 6Z M22 -28 l14 -6 l14 6 l-14 6Z', 0.7, P.line, 0.6);
    k.path(body, 'M-74 -10 q-20 -8 -26 -24 q-2 -12 12 -12 q12 2 12 14 q2 10 10 14Z', { fill, stroke: P.line, 'stroke-width': 1 });
    svgEl('circle', { cx: -90, cy: -32, r: 1.6, fill: P.ink }, body);
    seatTop = -38;
  } else if (variant === 'imperial' || variant === 'sage' || variant === 'palace') {
    k.path(body, 'M-64 0 h128 v-8 h-128Z M-56 -8 h112 l-6 -10 h-100Z M-50 -18 h100 v-10 h-100Z', { fill });
    k.line(body, 'M-64 0 h128 v-8 h-128Z M-56 -8 h112 l-6 -10 h-100 M-50 -18 h100 v-10 h-100Z', 0.9);
    for (let dx = -42; dx <= 42; dx += 14) k.line(body, `M${dx - 5} -18 q5 -8 10 0`, 0.7, P.line, 0.7);
    seatTop = -28;
  } else if (variant === 'raw' || variant === 'battle') {
    k.path(body, 'M-66 0 L-58 -16 L-20 -24 L30 -20 L62 -10 L68 0Z', { fill: stoneD });
    k.line(body, 'M-66 0 L-58 -16 L-20 -24 L30 -20 L62 -10 L68 0', 1);
    seatTop = -18;
  } else if (variant === 'boundary') {
    k.path(body, 'M-70 0 h140 v-10 h-140Z', { fill: stoneD });
    seatTop = -10;
  } else {
    k.path(body, 'M-56 0 h112 v-6 l-8 -14 h-96 l-8 14Z', { fill });
    k.line(body, 'M-56 0 h112 v-6 l-8 -14 h-96 l-8 14Z', 0.9);
    seatTop = -20;
  }

  // 碑身（含碑首）
  const bw = variant === 'imperial' || variant === 'palace' ? 74 : variant === 'boundary' ? 112 : 66;
  const bh = variant === 'boundary' ? 96 : variant === 'imperial' || variant === 'palace' ? 162 : 150;
  const top = seatTop - bh;
  const L = -bw / 2, Rr = bw / 2;
  let d;
  if (variant === 'imperial' || variant === 'bixi' || variant === 'palace') {
    d = `M${L} ${seatTop} V${top + 10} Q${L} ${top - 46} 0 ${top - 50} Q${Rr} ${top - 46} ${Rr} ${top + 10} V${seatTop}Z`;
  } else if (variant === 'sage') {
    d = `M${L} ${seatTop} V${top} L0 ${top - 34} L${Rr} ${top} V${seatTop}Z`;
  } else if (variant === 'general') {
    d = `M${L} ${seatTop} V${top} Q${L} ${top - 34} 0 ${top - 36} Q${Rr} ${top - 34} ${Rr} ${top} V${seatTop}Z`;
  } else if (variant === 'raw' || variant === 'battle') {
    d = `M${L + 4} ${seatTop} L${L - 4} ${top + 60} L${L + 8} ${top - 6} L${-6} ${top - 40} L${Rr - 10} ${top - 18} L${Rr + 4} ${top + 50} L${Rr - 2} ${seatTop}Z`;
  } else if (variant === 'boundary') {
    d = `M${L} ${seatTop} V${top + 8} Q${L} ${top} ${L + 8} ${top} H${Rr - 8} Q${Rr} ${top} ${Rr} ${top + 8} V${seatTop}Z`;
  } else {
    d = `M${L + 2} ${seatTop} L${L - 2} ${top + 40} Q${L} ${top - 22} ${-4} ${top - 26} Q${Rr + 2} ${top - 18} ${Rr} ${top + 30} L${Rr - 2} ${seatTop}Z`;
  }
  k.path(body, d, { fill });
  const inner = k.g(body, { 'clip-path': k.clip(d) });
  // 风化斑驳与苔点
  for (let i = 0; i < 7; i++) svgEl('ellipse', { cx: L + R() * bw, cy: seatTop - R() * bh, rx: 6 + R() * 16, ry: 8 + R() * 22, fill: P.ink, opacity: 0.08 + R() * 0.08, filter: k.F.soft }, inner);
  k.dots(inner, R, 10, L, Rr, () => seatTop - 18 - R() * 30, 1.6, P.night ? '#4e5a47' : '#5f6d4c', 0.5);
  if (variant === 'battle' || variant === 'raw') k.line(inner, `M${L + 10} ${top + 10} l18 40 l-6 20 l14 30`, 1, P.ink, 0.5);
  k.line(body, d.replace(/Z$/, ''), 1.3, P.line);

  // 碑首纹饰
  if (variant === 'imperial' || variant === 'bixi' || variant === 'palace') {
    k.line(body, `M${L + 6} ${top + 6} c-2 -26 18 -40 30 -30 c6 6 0 14 -6 10 M${Rr - 6} ${top + 6} c2 -26 -18 -40 -30 -30 c-6 6 0 14 6 10`, 1.2, P.line, 0.75);
    k.path(body, `M-12 ${top - 34} h24 v26 h-24Z`, { fill: mix(stoneD, P.ink, 0.15), stroke: P.line, 'stroke-width': 0.8 });
    const t = svgEl('text', { x: 0, y: top - 16, 'font-size': 10, 'text-anchor': 'middle', fill: P.gold, 'font-family': 'var(--f-kai)' }, body);
    t.textContent = variant === 'bixi' ? '敕建' : variant === 'palace' ? '御制' : '圣旨';
  } else if (variant === 'sage') {
    svgEl('circle', { cx: 0, cy: top - 10, r: 8, fill: 'none', stroke: P.line, 'stroke-width': 0.8, opacity: 0.7 }, body);
  }

  // 碑心：阴刻线框 + 竖排描字
  const panelTop = top + 14, panelH = bh - 34;
  const pw = variant === 'boundary' ? 92 : bw - 22;
  k.path(body, `M${-pw / 2} ${panelTop} h${pw} v${panelH} h${-pw}Z`, { fill: P.ink, opacity: 0.07 });
  k.line(body, `M${-pw / 2} ${panelTop} h${pw} v${panelH} h${-pw}Z`, 0.7, P.line, 0.55);
  const ink = P.night ? P.gold : (variant === 'battle' ? P.cinnabar : '#3a2a1e');
  if (variant === 'boundary') {
    const t = svgEl('text', { x: 0, y: panelTop + panelH / 2 + 7, 'font-size': Math.min(20, 84 / chars.length), 'text-anchor': 'middle', fill: ink, 'font-family': 'var(--f-kai)', 'letter-spacing': '0.1em' }, g);
    t.textContent = chars.join('');
  } else {
    const fs = Math.min(21, (panelH - 12) / chars.length);
    chars.forEach((ch, i) => {
      const t = svgEl('text', { x: 0, y: panelTop + 8 + fs * (i + 0.85), 'font-size': fs, 'text-anchor': 'middle', fill: ink, 'font-family': variant === 'battle' ? 'var(--f-brush)' : 'var(--f-kai)' }, g);
      t.textContent = ch;
    });
  }
  const h = svgEl('text', { class: 'stele-hint', x: bw / 2 + 22, y: top + 10, 'font-size': 13, fill: P.night ? '#efe5d0' : '#2a241d', style: 'writing-mode: vertical-rl' }, g);
  h.textContent = hint;
  return g;
}

// ============ 供案 / 香炉 / 烽火盆 ============
export function paintAltar(k, parent, x, y, { runner = true, cls = 'altar-table' } = {}) {
  const { P } = k;
  const g = k.g(parent, { class: cls });
  svgEl('ellipse', { cx: x, cy: y + 36, rx: 175, ry: 9, fill: '#000', opacity: 0.3, filter: 'url(#ink-blur)' }, g);
  const s = k.g(g, { filter: k.F.hand });
  const top = k.grad([[0, mix(P.stoneLight, P.stone, 0.3)], [1, P.stone]]);
  // 案面、束腰、卷云足
  k.path(s, `M${x - 160} ${y - 8} H${x + 160} L${x + 170} ${y + 2} H${x - 170}Z`, { fill: top });
  k.path(s, `M${x - 170} ${y + 2} H${x + 170} v7 H${x - 170}Z`, { fill: P.stoneDark });
  k.path(s, `M${x - 150} ${y + 9} H${x + 150} l-6 6 H${x - 144}Z`, { fill: mix(P.stone, P.stoneDark, 0.5) });
  [-1, 1].forEach((sd) => {
    k.path(s, `M${x + sd * 150} ${y + 9} v24 q0 4 ${-sd * 4} 4 h${-sd * 14} q${sd * 6} -4 ${sd * 6} -10 v-18Z`, { fill: P.stoneDark });
    k.line(s, `M${x + sd * 150} ${y + 9} v24 q0 4 ${-sd * 4} 4 h${-sd * 14}`, 0.9);
  });
  k.line(s, `M${x - 160} ${y - 8} H${x + 160} L${x + 170} ${y + 2} H${x - 170}Z M${x - 170} ${y + 9} H${x + 170}`, 1);
  if (runner) {
    k.path(s, `M${x - 30} ${y - 8} H${x + 30} L${x + 33} ${y + 2} L${x + 30} ${y + 28} L${x} ${y + 34} L${x - 30} ${y + 28} L${x - 33} ${y + 2}Z`, { fill: P.cinnabar, opacity: 0.78 });
    k.line(s, `M${x - 26} ${y + 25} L${x} ${y + 30} L${x + 26} ${y + 25}`, 0.7, P.gold, 0.8);
  }
  return g;
}

export function paintBurner(k, parent, x, y) {
  const { P } = k;
  const g = k.g(parent);
  const sticks = k.g(g, { opacity: 0, style: 'transition: opacity 1.2s' });
  [-9, 0, 9].forEach((dx, i) => {
    svgEl('line', { x1: x + dx, y1: y - 18, x2: x + dx * 1.3, y2: y - 58, stroke: '#a3523a', 'stroke-width': 1.5 }, sticks);
    svgEl('circle', { class: 'incense-tip', cx: x + dx * 1.3, cy: y - 58, r: 1.8, style: `animation-delay:${i * 0.4}s` }, sticks);
    const sm = k.g(sticks, { class: 'incense-smoke' });
    k.path(sm, `M${x + dx * 1.3} ${y - 60} c-8 -20 10 -34 0 -56 s-12 -36 4 -60`, { style: `animation-delay:${i * 1.2}s` });
  });
  const bronze = k.grad([[0, mix(P.green, P.gold, 0.35)], [1, mix(P.green, P.ink, 0.45)]]);
  const b = k.g(g, { filter: k.F.hand });
  // 三足鼎：口沿、立耳、鼓腹、蹄足
  [-1, 1].forEach((s) => k.path(b, `M${x + s * 20} ${y - 18} v-10 h${s * 8} v10Z`, { fill: bronze, stroke: P.line, 'stroke-width': 0.8 }));
  k.path(b, `M${x - 28} ${y - 18} H${x + 28} v4 Q${x + 28} ${y + 8} ${x} ${y + 8} Q${x - 28} ${y + 8} ${x - 28} ${y - 14}Z`, { fill: bronze });
  k.line(b, `M${x - 28} ${y - 18} H${x + 28} v4 Q${x + 28} ${y + 8} ${x} ${y + 8} Q${x - 28} ${y + 8} ${x - 28} ${y - 14}Z`, 1);
  k.line(b, `M${x - 22} ${y - 8} q5 -5 10 0 t10 0 t10 0 t10 0`, 0.8, P.line, 0.7);
  [-16, 0, 16].forEach((dx) => k.line(b, `M${x + dx} ${y + 6} q${dx * 0.1} 8 ${dx * 0.18} 14`, 3, mix(P.green, P.ink, 0.5)));
  return { light: () => (sticks.style.opacity = 1) };
}

export function paintBrazier(k, parent, x, y) {
  const { P } = k;
  const g = k.g(parent, { class: 'site-flame-burner' });
  const fy = y - 6;
  const flameG = k.g(g, { class: 'flame-glow' });
  const glow = svgEl('circle', { cx: x, cy: fy - 18, r: 24, fill: k.radial('#ff8432', 0.42) }, flameG);
  const flame = k.path(flameG, `M${x - 13} ${fy} Q${x - 18} ${fy - 26} ${x} ${fy - 44} Q${x + 6} ${fy - 30} ${x + 9} ${fy - 34} Q${x + 18} ${fy - 20} ${x + 13} ${fy}Z`, { fill: '#e8692c', style: 'animation: breathe 2.4s ease-in-out infinite' });
  flameG.style.opacity = '0.35';
  const b = k.g(g, { filter: k.F.hand });
  const bronze = k.grad([[0, mix(P.green, P.gold, 0.3)], [1, mix(P.green, P.ink, 0.5)]]);
  k.path(b, `M${x - 30} ${fy} H${x + 30} L${x + 22} ${fy + 14} H${x - 22}Z`, { fill: bronze });
  k.line(b, `M${x - 30} ${fy} H${x + 30} L${x + 22} ${fy + 14} H${x - 22}Z`, 1);
  [-14, 14].forEach((dx) => k.line(b, `M${x + dx} ${fy + 14} v10`, 3, mix(P.green, P.ink, 0.5)));
  return {
    light() {
      flameG.style.opacity = '1';
      glow.setAttribute('r', '44');
      flame.setAttribute('fill', '#f39a3a');
    },
  };
}

// ============ 胜迹题壁（碑廊粉壁，诗牌挂于檐下） ============
export function paintInscriptionWall(k, parent, f, treeX, ground) {
  const { P } = k;
  const g = k.g(parent, { class: 'site-inscription-screen' });
  const bx = treeX + 50, x0 = bx - 132, x1 = bx + 132, h = 250;
  svgEl('ellipse', { cx: bx, cy: ground + 8, rx: 160, ry: 11, fill: '#000', opacity: 0.3, filter: 'url(#ink-blur)' }, g);
  const s = k.g(g, { filter: k.F.hand });
  // 墙基
  k.path(s, `M${x0 - 10} ${ground + 4} h${x1 - x0 + 20} v-16 h${-(x1 - x0 + 20)}Z`, { fill: P.stone });
  k.line(s, `M${x0 - 10} ${ground - 12} h${x1 - x0 + 20}`, 0.9);
  k.wall(s, x0, x1, ground - 12, h - 22);
  k.path(s, `M${x0} ${ground - 12} V${ground - h + 10} H${x1} V${ground - 12}Z`, { fill: P.stone, opacity: P.night ? 0.1 : 0.16 });
  // 墙面淡墨题刻：取传世诗文作背景摩崖
  const text = (f.works?.[0]?.text || f.motto || '').replace(/\s+/g, '');
  const cols = 8, perCol = 11;
  const tg = k.g(g, { opacity: P.night ? 0.26 : 0.32, fill: P.ink, 'font-family': 'var(--f-brush)', 'font-size': 14 });
  for (let c = 0; c < cols; c++) {
    const seg = text.slice(c * perCol, (c + 1) * perCol);
    if (!seg) break;
    const t = svgEl('text', { x: x1 - 22 - c * 30, y: ground - h + 44, style: 'writing-mode: vertical-rl', 'letter-spacing': '0.1em' }, tg);
    t.textContent = seg;
  }
  // 题壁匾
  k.plaque(g, bx, ground - h + 2, '题壁', 64, 20, { color: P.cinnabar, ink: '#f4e7c8' });
  // 檐下挂钩横木
  const rows = [ground - 196, ground - 154, ground - 112, ground - 70];
  const xs = [bx - 84, bx - 28, bx + 28, bx + 84];
  rows.forEach((ry) => k.line(g, `M${x0 + 18} ${ry} H${x1 - 18}`, 1.2, P.wood, 0.55));
  const hangs = [];
  rows.forEach((ry, ri) => xs.forEach((cx, ci) => hangs.push({ x: cx + ((ri + ci) % 2 === 0 ? -4 : 4), y: ry })));
  return { hangs };
}
