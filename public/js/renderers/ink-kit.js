// 水墨界画笔墨工具：以「线描 + 淡彩晕染 + 皴擦点苔」取代几何色块
// 所有构件均以底边中心为锚点（x, baseY），向上绘制，便于在场景中排布。
import { svgEl, rng } from '../util.js';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

// 画色：日景为绢本淡彩，夜景为月下墨色（以暗色为底、浅线勾勒）
export function palette(night, sky1) {
  if (night) {
    // 月下：石色、土色提亮为冷灰，线条用浅色勾勒，避免整片死黑
    const base = mix(sky1, '#05070a', 0.2);
    return {
      night,
      line: '#b4ab94', lineSoft: 'rgba(200,190,165,.35)', ink: '#0a0c10', inkWash: '#141a22',
      stone: mix(base, '#9d988a', 0.58), stoneLight: mix(base, '#c9c2ae', 0.6), stoneDark: mix(base, '#4a4a46', 0.5),
      earth: mix(base, '#7d7060', 0.52), earthDark: mix(base, '#2a2620', 0.5),
      wall: mix(base, '#d8cfb8', 0.55), wallShade: mix(base, '#8f8774', 0.45),
      roof: mix(base, '#000', 0.3), roofLight: mix(base, '#5f6b74', 0.5),
      column: mix(base, '#8f3d30', 0.62), wood: mix(base, '#6c5540', 0.58),
      gold: '#cdb274', cinnabar: '#a8443a', green: mix(base, '#617f66', 0.58), blue: mix(base, '#5e7884', 0.58),
      foliage: mix(base, '#000', 0.3), mist: '#a9b8cc', mistOp: 0.12,
    };
  }
  return {
    night,
    line: '#2b2520', lineSoft: 'rgba(43,37,32,.45)', ink: '#1e1a16', inkWash: '#3a342c',
    stone: '#a89f8c', stoneLight: '#d3cab5', stoneDark: '#6f675a',
    earth: '#a08867', earthDark: '#6b5944',
    wall: '#ece5d4', wallShade: '#cbbfa6',
    roof: '#3b4247', roofLight: '#69767b',
    column: '#8b4334', wood: '#6e5440',
    gold: '#b09257', cinnabar: '#a8322d', green: '#6c7f5f', blue: '#5d7880',
    foliage: '#2f3a30', mist: '#ffffff', mistOp: 0.42,
  };
}

export function createKit(svg, defs, { id, night, sky1 }) {
  const P = palette(night, sky1);
  let uid = 0;
  const nid = (n) => `${id}-ik-${n}-${uid++}`;

  // —— 滤镜：手绘线条微颤 / 晕染毛边 ——
  const hand = nid('hand');
  const fh = svgEl('filter', { id: hand, x: '-3%', y: '-3%', width: '106%', height: '106%' }, defs);
  svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.045', numOctaves: 2, seed: 11, result: 'n' }, fh);
  svgEl('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 2.6, xChannelSelector: 'R', yChannelSelector: 'G' }, fh);
  const wash = nid('wash');
  const fw = svgEl('filter', { id: wash, x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
  svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.02 0.06', numOctaves: 3, seed: 5, result: 'n' }, fw);
  svgEl('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 14, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }, fw);
  svgEl('feGaussianBlur', { in: 'd', stdDeviation: 1.6 }, fw);
  const soft = nid('soft');
  const fs = svgEl('filter', { id: soft, x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
  svgEl('feGaussianBlur', { stdDeviation: 14 }, fs);

  const F = { hand: `url(#${hand})`, wash: `url(#${wash})`, soft: `url(#${soft})` };

  const grad = (stops, { x2 = 0, y2 = 1 } = {}) => {
    const gid = nid('g');
    const lg = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2, y2 }, defs);
    stops.forEach(([o, c, op = 1]) => svgEl('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, lg));
    return `url(#${gid})`;
  };
  const radial = (c, op, { fx = 0.5, fy = 0.5 } = {}) => {
    const gid = nid('r');
    const rg = svgEl('radialGradient', { id: gid, fx, fy }, defs);
    svgEl('stop', { offset: 0, 'stop-color': c, 'stop-opacity': op }, rg);
    svgEl('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, rg);
    return `url(#${gid})`;
  };
  const clip = (d) => {
    const cid = nid('c');
    const cp = svgEl('clipPath', { id: cid }, defs);
    svgEl('path', { d }, cp);
    return `url(#${cid})`;
  };

  const g = (parent, attrs = {}) => svgEl('g', attrs, parent);
  const path = (parent, d, attrs = {}) => svgEl('path', { d, ...attrs }, parent);
  const line = (parent, d, w = 1.1, c = P.line, op = 1) => path(parent, d, { fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op });
  const shape = (parent, d, fill, { w = 1.1, c = P.line, op = 1, lineOp = 1 } = {}) => {
    path(parent, d, { fill, opacity: op });
    if (w) line(parent, d, w, c, lineOp);
  };

  // —— 墨点、雾、皴 ——
  const mist = (parent, cx, cy, rx, ry, op = P.mistOp) =>
    svgEl('ellipse', { cx, cy, rx, ry, fill: P.mist, opacity: op, filter: F.soft, class: 'mist' }, parent);

  // 点苔：沿轮廓或区域随机打下的短墨点
  const dots = (parent, R, n, x0, x1, yFn, size = 2.4, c = P.ink, op = 0.55) => {
    const dg = g(parent, { fill: c, opacity: op });
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * (x1 - x0);
      const y = yFn(x) + R() * 6;
      const rx = size * (0.6 + R() * 0.8);
      svgEl('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: rx.toFixed(1), ry: (rx * 0.62).toFixed(1), transform: `rotate(${(R() * 50 - 25).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})` }, dg);
    }
    return dg;
  };
  // 披麻皴：沿坡面的长短弧线
  const cun = (parent, R, n, x0, x1, yTop, yBot, c = P.line, op = 0.32, len = 26) => {
    const cg = g(parent, { opacity: op });
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * (x1 - x0), y = yTop(x) + R() * (yBot - yTop(x)) * 0.85;
      const l = len * (0.5 + R());
      const dx = (R() - 0.5) * l * 0.5;
      line(cg, `M${x.toFixed(1)} ${y.toFixed(1)} q${(dx * 0.4).toFixed(1)} ${(l * 0.45).toFixed(1)} ${dx.toFixed(1)} ${l.toFixed(1)}`, 0.8 + R() * 0.7, c);
    }
    return cg;
  };
  // 草：一丛丛撇出的短笔
  const grass = (parent, R, n, x0, x1, y0, y1, c = P.line, op = 0.45) => {
    const gg = g(parent, { opacity: op });
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
      const k = 2 + Math.floor(R() * 3);
      for (let j = 0; j < k; j++) {
        const h = 5 + R() * 10, lean = (R() - 0.5) * 10;
        line(gg, `M${(x + j * 2).toFixed(1)} ${y.toFixed(1)} q${(lean * 0.3).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}`, 0.8, c);
      }
    }
    return gg;
  };

  // —— 屋顶：曲线屋面 + 起翘翼角 + 瓦垄 + 正脊鸱吻 ——
  // y 为檐口线；w 为檐口宽；h 为屋面高
  function roof(parent, cx, y, w, h, { type = 'xieshan', tiles = true, color = P.roof, finial = true } = {}) {
    const rg = g(parent);
    const lift = Math.max(6, w * 0.045), over = w * 0.04;
    const rw = type === 'wudian' ? w * 0.52 : type === 'xieshan' ? w * 0.4 : type === 'yingshan' ? w * 0.86 : 0;
    const L = cx - w / 2 - over, Rr = cx + w / 2 + over;
    const top = y - h;
    const d = [
      `M${L} ${y - lift}`,
      `Q${cx - w * 0.36} ${y + 3} ${cx} ${y + 3}`,
      `Q${cx + w * 0.36} ${y + 3} ${Rr} ${y - lift}`,
      `Q${cx + w * 0.3} ${y - h * 0.32} ${cx + rw / 2} ${top}`,
      `L${cx - rw / 2} ${top}`,
      `Q${cx - w * 0.3} ${y - h * 0.32} ${L} ${y - lift}Z`,
    ].join(' ');
    path(rg, d, { fill: grad([[0, mix(color, '#000', 0.12)], [1, mix(color, P.night ? '#000' : '#e4dccb', 0.3)]]) });
    if (tiles) {
      const tg = g(rg, { 'clip-path': clip(d), opacity: 0.28 });
      const n = Math.max(8, Math.round(w / 12));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const bx = L + (Rr - L) * t;
        const tx = cx - rw / 2 + rw * t;
        line(tg, `M${tx.toFixed(1)} ${top} Q${(bx * 0.6 + tx * 0.4).toFixed(1)} ${(y - h * 0.35).toFixed(1)} ${bx.toFixed(1)} ${y + 4}`, 0.6, P.night ? '#000' : mix(color, '#000', 0.5));
      }
    }
    // 檐口与屋面轮廓
    line(rg, `M${L} ${y - lift} Q${cx - w * 0.36} ${y + 3} ${cx} ${y + 3} Q${cx + w * 0.36} ${y + 3} ${Rr} ${y - lift}`, 2.2, P.ink);
    line(rg, `M${L} ${y - lift} Q${cx - w * 0.3} ${y - h * 0.32} ${cx - rw / 2} ${top} M${Rr} ${y - lift} Q${cx + w * 0.3} ${y - h * 0.32} ${cx + rw / 2} ${top}`, 1.1, P.line);
    // 翼角起翘的小飞椽
    line(rg, `M${L} ${y - lift} q-5 -4 -7 -10 M${Rr} ${y - lift} q5 -4 7 -10`, 1.4, P.ink);
    if (type === 'xieshan') {
      // 歇山山花
      const gy = top + h * 0.42;
      line(rg, `M${cx - rw / 2} ${top} L${cx - rw / 2 - w * 0.06} ${gy} M${cx + rw / 2} ${top} L${cx + rw / 2 + w * 0.06} ${gy}`, 0.9, P.line, 0.8);
    }
    if (rw > 0) {
      // 正脊与鸱吻
      line(rg, `M${cx - rw / 2 - 2} ${top} L${cx + rw / 2 + 2} ${top}`, 3.4, P.ink);
      if (finial) {
        line(rg, `M${cx - rw / 2} ${top} q-3 -11 6 -13 q3 4 -1 6 M${cx + rw / 2} ${top} q3 -11 -6 -13 q-3 4 1 6`, 1.8, P.ink);
      }
    } else if (finial) {
      // 攒尖宝顶
      line(rg, `M${cx} ${top} L${cx} ${top - 14}`, 1.6, P.ink);
      svgEl('circle', { cx, cy: top - 16, r: 3.4, fill: P.gold, stroke: P.ink, 'stroke-width': 1 }, rg);
    }
    return rg;
  }

  // —— 殿堂：台明 + 檐柱 + 额枋 + 斗拱 + 隔扇 + 屋顶 ——
  function hall(parent, cx, baseY, { w = 260, colH = 70, bays = 5, roofType = 'xieshan', double = false, roofH, color, wallTone } = {}) {
    const hg = g(parent);
    const top = baseY - colH;
    // 隔扇门窗（浅色）
    path(hg, `M${cx - w / 2} ${top} H${cx + w / 2} V${baseY} H${cx - w / 2}Z`, { fill: wallTone || mix(P.wall, P.wood, 0.25) });
    const bw = w / bays;
    const lattice = g(hg, { opacity: 0.5 });
    for (let i = 0; i < bays; i++) {
      const x0 = cx - w / 2 + i * bw;
      for (let k = 1; k < 4; k++) line(lattice, `M${(x0 + (bw * k) / 4).toFixed(1)} ${top + 10} V${baseY - 4}`, 0.6);
      line(lattice, `M${x0 + 3} ${(top + colH * 0.62).toFixed(1)} H${(x0 + bw - 3).toFixed(1)}`, 0.6);
    }
    // 檐柱
    for (let i = 0; i <= bays; i++) {
      const x = cx - w / 2 + i * bw;
      path(hg, `M${(x - 3).toFixed(1)} ${top} h6 V${baseY} h-6Z`, { fill: P.column });
      line(hg, `M${(x - 3).toFixed(1)} ${top} V${baseY} M${(x + 3).toFixed(1)} ${top} V${baseY}`, 0.7, P.ink, 0.8);
    }
    // 额枋与斗拱
    path(hg, `M${cx - w / 2 - 6} ${top - 9} H${cx + w / 2 + 6} V${top + 2} H${cx - w / 2 - 6}Z`, { fill: mix(P.blue, P.green, 0.4), opacity: 0.85 });
    line(hg, `M${cx - w / 2 - 6} ${top - 9} H${cx + w / 2 + 6} M${cx - w / 2 - 6} ${top + 2} H${cx + w / 2 + 6}`, 0.9, P.ink);
    const n = bays * 2 + 1;
    for (let i = 0; i < n; i++) {
      const x = cx - w / 2 + (w * i) / (n - 1);
      line(hg, `M${(x - 4).toFixed(1)} ${top - 11} h8 M${x.toFixed(1)} ${top - 11} v-5 M${(x - 6).toFixed(1)} ${top - 16} h12`, 0.9, P.ink, 0.85);
    }
    const rH = roofH || w * 0.3;
    let roofBase = top - 16;
    if (double) {
      roof(hg, cx, roofBase, w + 26, rH * 0.42, { type: 'wudian', tiles: true, color, finial: false });
      roofBase -= rH * 0.42 - 2;
      path(hg, `M${cx - w * 0.36} ${roofBase} H${cx + w * 0.36} V${roofBase - 14} H${cx - w * 0.36}Z`, { fill: P.column, opacity: 0.85 });
      line(hg, `M${cx - w * 0.36} ${roofBase - 14} H${cx + w * 0.36}`, 0.9, P.ink);
      roofBase -= 14;
      roof(hg, cx, roofBase, w * 0.86, rH * 0.7, { type: roofType, color });
      return { g: hg, top: roofBase - rH * 0.7 };
    }
    roof(hg, cx, roofBase, w + 22, rH, { type: roofType, color });
    return { g: hg, top: roofBase - rH };
  }

  // —— 台基：须弥座线脚 + 望柱栏板 + 中央踏跺 ——
  function terrace(parent, cx, baseY, w, h, { tiers = 1, rail = true, stairs = true, tone = P.stoneLight, shrink = 0.08 } = {}) {
    const tg = g(parent);
    let y = baseY, cw = w;
    for (let t = 0; t < tiers; t++) {
      const th = h / tiers;
      const tw = cw;
      path(tg, `M${cx - tw / 2} ${y} L${cx - tw / 2 + 4} ${y - th} H${cx + tw / 2 - 4} L${cx + tw / 2} ${y}Z`, { fill: grad([[0, tone], [1, mix(tone, P.stoneDark, 0.35)]]) });
      // 线脚
      line(tg, `M${cx - tw / 2} ${y} H${cx + tw / 2} M${cx - tw / 2 + 4} ${y - th} H${cx + tw / 2 - 4} M${cx - tw / 2 + 3} ${y - th * 0.72} H${cx + tw / 2 - 3}`, 0.9, P.line, 0.85);
      line(tg, `M${cx - tw / 2 + 2} ${y - th * 0.3} H${cx + tw / 2 - 2}`, 0.6, P.line, 0.5);
      if (rail) {
        const ry = y - th;
        line(tg, `M${cx - tw / 2 + 6} ${ry - 9} H${cx + tw / 2 - 6}`, 1, P.line, 0.8);
        for (let x = cx - tw / 2 + 8; x <= cx + tw / 2 - 8; x += 13) {
          line(tg, `M${x.toFixed(1)} ${ry} V${ry - 12}`, 0.9, P.line, 0.8);
        }
      }
      y -= th;
      cw = tw * (1 - shrink);
    }
    if (stairs) {
      const sw = w * 0.16;
      path(tg, `M${cx - sw / 2} ${baseY} L${cx - sw * 0.38} ${y} H${cx + sw * 0.38} L${cx + sw / 2} ${baseY}Z`, { fill: mix(tone, P.stoneDark, 0.15) });
      for (let s = baseY; s > y; s -= 5) line(tg, `M${cx - sw / 2 + 2} ${s} H${cx + sw / 2 - 2}`, 0.6, P.line, 0.55);
      line(tg, `M${cx - sw / 2} ${baseY} L${cx - sw * 0.38} ${y} M${cx + sw / 2} ${baseY} L${cx + sw * 0.38} ${y}`, 0.9, P.line);
    }
    return { g: tg, top: y };
  }

  // —— 封土：穹窿 / 覆斗 / 因山 / 叠石，土色晕染 + 披麻皴 + 点苔 ——
  function mound(parent, cx, baseY, w, h, { shape = 'dome', seed = 'm', tone = P.earth, trees = 0 } = {}) {
    const R = rng(id + seed);
    const mg = g(parent);
    let d, topY;
    if (shape === 'fudou') {
      const tw = w * 0.34;
      d = `M${cx - w / 2} ${baseY} C${cx - w * 0.44} ${baseY - h * 0.35} ${cx - tw * 0.7} ${baseY - h * 0.92} ${cx - tw / 2} ${baseY - h} Q${cx} ${baseY - h * 1.03} ${cx + tw / 2} ${baseY - h} C${cx + tw * 0.7} ${baseY - h * 0.92} ${cx + w * 0.44} ${baseY - h * 0.35} ${cx + w / 2} ${baseY}Z`;
      topY = (x) => (Math.abs(x - cx) < tw / 2 ? baseY - h : baseY - h * (1 - (Math.abs(x - cx) - tw / 2) / (w / 2 - tw / 2)) ** 1.2);
    } else if (shape === 'mountain') {
      d = `M${cx - w / 2} ${baseY} C${cx - w * 0.3} ${baseY - h * 0.3} ${cx - w * 0.16} ${baseY - h * 0.7} ${cx - w * 0.05} ${baseY - h * 0.94} Q${cx + w * 0.02} ${baseY - h * 1.04} ${cx + w * 0.08} ${baseY - h * 0.9} C${cx + w * 0.2} ${baseY - h * 0.72} ${cx + w * 0.3} ${baseY - h * 0.5} ${cx + w * 0.36} ${baseY - h * 0.52} C${cx + w * 0.42} ${baseY - h * 0.4} ${cx + w * 0.46} ${baseY - h * 0.2} ${cx + w / 2} ${baseY}Z`;
      topY = (x) => baseY - h * Math.max(0, 1 - Math.abs(x - cx) / (w / 2)) ** 0.9;
    } else if (shape === 'rocky') {
      let s = `M${cx - w / 2} ${baseY}`;
      const pts = 9;
      for (let i = 1; i < pts; i++) {
        const t = i / pts, x = cx - w / 2 + w * t;
        const y = baseY - h * Math.sin(Math.PI * t) ** 0.8 * (0.82 + R() * 0.28);
        s += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      d = s + ` L${cx + w / 2} ${baseY}Z`;
      topY = (x) => baseY - h * Math.sin(Math.PI * Math.min(1, Math.max(0, (x - cx + w / 2) / w))) ** 0.8;
    } else {
      d = `M${cx - w / 2} ${baseY} C${cx - w * 0.42} ${baseY - h * 0.6} ${cx - w * 0.22} ${baseY - h} ${cx} ${baseY - h} C${cx + w * 0.22} ${baseY - h} ${cx + w * 0.42} ${baseY - h * 0.6} ${cx + w / 2} ${baseY}Z`;
      topY = (x) => baseY - h * Math.sqrt(Math.max(0, 1 - ((x - cx) / (w / 2)) ** 2));
    }
    path(mg, d, { fill: grad([[0, mix(tone, P.night ? '#000' : P.earthDark, 0.15)], [0.7, mix(tone, P.wall, P.night ? 0 : 0.18)], [1, tone, 0.35]]) });
    const inner = g(mg, { 'clip-path': clip(d) });
    // 背光面晕染
    path(inner, `M${cx + w * 0.05} ${baseY - h * 1.1} Q${cx + w * 0.3} ${baseY - h * 0.5} ${cx + w * 0.6} ${baseY}`, { fill: 'none', stroke: P.ink, 'stroke-width': w * 0.18, opacity: P.night ? 0.25 : 0.1, filter: F.soft });
    cun(inner, R, Math.round(w / 9), cx - w / 2, cx + w / 2, topY, baseY, P.line, shape === 'rocky' ? 0.45 : 0.3, shape === 'rocky' ? 18 : 30);
    line(mg, d.replace(/Z$/, ''), 1.5, P.line, 0.9);
    dots(mg, R, Math.round(w / 12), cx - w * 0.42, cx + w * 0.42, (x) => topY(x) - 2, 2.6, P.ink, 0.6);
    grass(mg, R, Math.round(w / 20), cx - w / 2, cx + w / 2, baseY - 8, baseY + 2);
    // 封土上植柏：陵如丘山，草木葱郁
    for (let i = 0; i < trees; i++) {
      const tx = cx - w * 0.38 + R() * w * 0.76;
      cypress(mg, tx, topY(tx) + 6, 26 + R() * 22, seed + 't' + i);
    }
    return { g: mg, topY };
  }

  // —— 树：柏（层叠墨团）、竹、垂柳、小松 ——
  function cypress(parent, x, baseY, h, seed = 'c') {
    const R = rng(id + seed + x);
    const cg = g(parent);
    line(cg, `M${x} ${baseY} q${(R() - 0.5) * 6} ${-h * 0.5} ${(R() - 0.5) * 4} ${-h * 0.9}`, 2.4, P.ink, 0.9);
    const layers = 6;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1);
      const cy = baseY - h * (0.3 + t * 0.66);
      const rx = h * (0.2 - t * 0.12) * (0.9 + R() * 0.3);
      svgEl('ellipse', { cx: x + (R() - 0.5) * 6, cy, rx, ry: rx * 0.55, fill: P.foliage, opacity: 0.78, filter: F.wash }, cg);
    }
    dots(cg, R, 14, x - h * 0.16, x + h * 0.16, (xx) => baseY - h * (0.35 + R() * 0.6), 2, P.ink, 0.7);
    return cg;
  }
  function bamboo(parent, x, baseY, h, n = 5, seed = 'b') {
    const R = rng(id + seed + x);
    const bg = g(parent);
    for (let i = 0; i < n; i++) {
      const bx = x + (R() - 0.5) * 40, bh = h * (0.6 + R() * 0.4), lean = (R() - 0.5) * 24;
      line(bg, `M${bx} ${baseY} q${lean * 0.3} ${-bh * 0.5} ${lean} ${-bh}`, 2, P.line, 0.8);
      for (let k = 1; k < 5; k++) line(bg, `M${(bx + lean * (k / 5) - 2).toFixed(1)} ${(baseY - (bh * k) / 5).toFixed(1)} h4`, 1.2, P.ink, 0.8);
      for (let k = 0; k < 4; k++) {
        const ly = baseY - bh * (0.45 + R() * 0.55), lx = bx + lean * ((baseY - ly) / bh);
        const dir = R() > 0.5 ? 1 : -1;
        path(bg, `M${lx.toFixed(1)} ${ly.toFixed(1)} q${dir * 8} -3 ${dir * 20} 4 q${-dir * 10} 1 ${-dir * 20} -4Z`, { fill: P.foliage, opacity: 0.75 });
      }
    }
    return bg;
  }
  function willow(parent, x, baseY, h, seed = 'w') {
    const R = rng(id + seed + x);
    const wg = g(parent);
    line(wg, `M${x} ${baseY} q-6 ${-h * 0.4} 4 ${-h * 0.7} q8 -14 -2 ${-h * 0.3}`, 4, P.ink, 0.85);
    for (let i = 0; i < 26; i++) {
      const sx = x - h * 0.3 + R() * h * 0.6, sy = baseY - h * (0.75 + R() * 0.25), len = h * (0.35 + R() * 0.4);
      line(wg, `M${sx.toFixed(1)} ${sy.toFixed(1)} q${(R() - 0.5) * 10} ${len * 0.5} ${(R() - 0.5) * 16} ${len}`, 1.1, P.night ? mix(P.green, P.line, 0.45) : P.green, 0.8);
    }
    return wg;
  }

  // —— 石：太湖石 / 磐石（皴擦 + 孔窍） ——
  function rock(parent, cx, baseY, w, h, seed = 'r', { holes = false, tone = P.stone } = {}) {
    const R = rng(id + seed + cx);
    const rg = g(parent);
    let d;
    if (holes) {
      // 太湖石：瘦、漏、透，轮廓圆转
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        pts.push([cx - w / 2 + w * t + (R() - 0.5) * w * 0.12, baseY - h * (0.2 + 0.8 * Math.sin(Math.PI * t) ** 0.6) * (0.75 + R() * 0.3)]);
      }
      d = `M${cx - w * 0.3} ${baseY} ` + pts.map(([x, y], i) => (i === 0 ? `L${x.toFixed(1)} ${y.toFixed(1)}` : `Q${(x - w * 0.08).toFixed(1)} ${(y - h * 0.08).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`)).join(' ') + ` L${cx + w * 0.3} ${baseY}Z`;
    } else {
      // 磐石：棱角分明的多面体，斧劈面
      const n = 5 + Math.floor(R() * 3);
      const pts = [[cx - w / 2, baseY]];
      for (let i = 1; i < n; i++) {
        const t = i / n;
        pts.push([cx - w / 2 + w * t + (R() - 0.5) * w * 0.1, baseY - h * (0.45 + 0.55 * Math.sin(Math.PI * t)) * (0.78 + R() * 0.3)]);
      }
      pts.push([cx + w / 2, baseY]);
      d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + 'Z';
      // 受光面与背光面的分界
      const peak = pts.reduce((m, p) => (p[1] < m[1] ? p : m), pts[1]);
      rg.dataset.peak = peak.join(',');
    }
    path(rg, d, { fill: grad([[0, mix(tone, P.wall, 0.22)], [1, mix(tone, P.stoneDark, 0.45)]], { x2: 1, y2: 1 }) });
    const inner = g(rg, { 'clip-path': clip(d) });
    if (!holes) {
      const [px] = rg.dataset.peak.split(',').map(Number);
      path(inner, `M${px} ${baseY - h * 1.2} L${px + w * 0.1} ${baseY} H${cx + w} V${baseY - h * 1.2}Z`, { fill: P.ink, opacity: P.night ? 0.28 : 0.16 });
    }
    cun(inner, R, Math.round(w / 6), cx - w / 2, cx + w / 2, () => baseY - h, baseY, P.line, 0.5, 14);
    if (holes) {
      for (let i = 0; i < 3; i++) {
        const hx = cx + (R() - 0.5) * w * 0.4, hy = baseY - h * (0.3 + R() * 0.5), hr = 3 + R() * 5;
        svgEl('ellipse', { cx: hx, cy: hy, rx: hr, ry: hr * 1.4, fill: P.ink, opacity: 0.6 }, rg);
      }
    }
    line(rg, d.replace(/Z$/, ''), 1.3, P.line, 0.95);
    return rg;
  }
  // 叠石冢：大小磐石层层堆叠成山（霍去病墓「冢象祁连山」）
  function rockPile(parent, cx, baseY, w, h, seed = 'rp') {
    const R = rng(id + seed);
    const pg = g(parent);
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const t = r / rows;
      const rowW = w * (1 - t * 0.78), y = baseY - h * t * 0.86;
      const n = Math.max(1, Math.round(5 - r * 1.2));
      for (let i = 0; i < n; i++) {
        const bw = (rowW / n) * (1.05 + R() * 0.25), bh = (h / rows) * (1.2 + R() * 0.5);
        const x = cx - rowW / 2 + (rowW / n) * (i + 0.5) + (R() - 0.5) * 12;
        rock(pg, x, y + 6, bw, bh, seed + r + '-' + i);
      }
    }
    grass(pg, R, Math.round(w / 16), cx - w / 2, cx + w / 2, baseY - 6, baseY + 4);
    dots(pg, R, Math.round(w / 10), cx - w * 0.4, cx + w * 0.4, (x) => baseY - h * (1 - Math.abs(x - cx) / (w / 2)) * 0.9 * R(), 2.2, P.ink, 0.55);
    return pg;
  }
  // 崖壁：斧劈皴
  function cliff(parent, x0, x1, baseY, h, seed = 'cl', { tone = P.stone } = {}) {
    const R = rng(id + seed);
    const cg = g(parent);
    const w = x1 - x0;
    // 崖顶：主峰偏一侧，参差错落；两侧斜削而下
    const peakAt = 0.25 + R() * 0.5;
    let d = `M${x0} ${baseY} L${(x0 + w * 0.04).toFixed(1)} ${(baseY - h * 0.45).toFixed(1)}`;
    const n = 12;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const env = 1 - Math.abs(t - peakAt) * 1.1;
      const y = baseY - h * Math.max(0.35, env) * (0.82 + R() * 0.26);
      d += ` L${(x0 + w * t).toFixed(1)} ${y.toFixed(1)}`;
      if (R() > 0.6) d += ` L${(x0 + w * (t + 0.02)).toFixed(1)} ${(y + 10 + R() * 18).toFixed(1)}`;
    }
    d += ` L${(x1 - w * 0.03).toFixed(1)} ${(baseY - h * 0.4).toFixed(1)} L${x1} ${baseY}Z`;
    path(cg, d, { fill: grad([[0, mix(tone, P.stoneDark, 0.2)], [1, mix(tone, P.stoneDark, 0.6)]]) });
    const inner = g(cg, { 'clip-path': clip(d) });
    for (let i = 0; i < Math.round(w / 10); i++) {
      const x = x0 + R() * w, y = baseY - R() * h;
      const l = 18 + R() * 40;
      path(inner, `M${x.toFixed(1)} ${y.toFixed(1)} l${(-l * 0.35).toFixed(1)} ${l.toFixed(1)} l${(4 + R() * 6).toFixed(1)} 0Z`, { fill: P.ink, opacity: 0.18 + R() * 0.2 });
    }
    line(cg, d.replace(/Z$/, ''), 1.5, P.line);
    return cg;
  }

  // —— 礼制构件：华表、阙、牌坊、塔 ——
  function huabiao(parent, x, baseY, h = 150) {
    const hg = g(parent);
    path(hg, `M${x - 10} ${baseY} h20 l-3 -10 h-14Z`, { fill: P.stoneLight });
    path(hg, `M${x - 4} ${baseY - 10} L${x - 3.5} ${baseY - h} h7 L${x + 4} ${baseY - 10}Z`, { fill: grad([[0, P.stoneLight], [1, P.stone]], { x2: 1, y2: 0 }) });
    line(hg, `M${x - 4} ${baseY - 10} L${x - 3.5} ${baseY - h} M${x + 4} ${baseY - 10} L${x + 3.5} ${baseY - h}`, 0.9);
    // 盘龙纹
    line(hg, `M${x - 4} ${baseY - h * 0.3} q8 -8 0 -16 q-8 -8 0 -16 q8 -8 0 -16`, 0.8, P.line, 0.6);
    // 云板
    path(hg, `M${x - 3} ${baseY - h * 0.78} q-16 -6 -14 -14 q6 2 14 8Z M${x + 3} ${baseY - h * 0.78} q16 -6 14 -14 q-6 2 -14 8Z`, { fill: P.stoneLight, stroke: P.line, 'stroke-width': 0.8 });
    // 承露盘与蹲兽
    path(hg, `M${x - 11} ${baseY - h} h22 l-3 -5 h-16Z`, { fill: P.stoneLight, stroke: P.line, 'stroke-width': 0.8 });
    path(hg, `M${x - 6} ${baseY - h - 5} q2 -10 8 -9 q5 1 4 9Z`, { fill: P.stone, stroke: P.line, 'stroke-width': 0.8 });
    return hg;
  }
  function que(parent, cx, baseY, h = 120, w = 46) {
    const qg = g(parent);
    path(qg, `M${cx - w / 2} ${baseY} L${cx - w / 2 + 5} ${baseY - h} H${cx + w / 2 - 5} L${cx + w / 2} ${baseY}Z`, { fill: grad([[0, P.stoneLight], [1, P.stone]]) });
    for (let y = baseY - 14; y > baseY - h; y -= 14) line(qg, `M${cx - w / 2 + 3} ${y} H${cx + w / 2 - 3}`, 0.6, P.line, 0.45);
    line(qg, `M${cx - w / 2} ${baseY} L${cx - w / 2 + 5} ${baseY - h} M${cx + w / 2} ${baseY} L${cx + w / 2 - 5} ${baseY - h}`, 1);
    // 子阙
    path(qg, `M${cx + w / 2} ${baseY} V${baseY - h * 0.55} H${cx + w / 2 + 18} V${baseY}Z`, { fill: P.stone });
    line(qg, `M${cx + w / 2} ${baseY - h * 0.55} H${cx + w / 2 + 18} V${baseY}`, 0.9);
    roof(qg, cx + w / 2 + 9, baseY - h * 0.55, 24, 10, { type: 'wudian', tiles: false, finial: false });
    // 斗拱层与屋顶
    path(qg, `M${cx - w / 2 + 2} ${baseY - h} h${w - 4} v-8 h${-(w - 4)}Z`, { fill: P.stoneDark, opacity: 0.6 });
    roof(qg, cx, baseY - h - 8, w + 6, 20, { type: 'wudian', tiles: true });
    return qg;
  }
  function paifang(parent, cx, baseY, w = 260, h = 170) {
    const pg = g(parent);
    const posts = [-w / 2, -w / 6, w / 6, w / 2];
    // 夹杆石
    posts.forEach((dx) => path(pg, `M${cx + dx - 10} ${baseY} v-24 h20 v24Z`, { fill: P.stone, stroke: P.line, 'stroke-width': 0.9 }));
    posts.forEach((dx, i) => {
      const ph = i === 1 || i === 2 ? h : h * 0.82;
      path(pg, `M${cx + dx - 5} ${baseY - 24} V${baseY - ph} h10 V${baseY - 24}Z`, { fill: grad([[0, P.stoneLight], [1, P.stone]], { x2: 1, y2: 0 }) });
      line(pg, `M${cx + dx - 5} ${baseY - 24} V${baseY - ph} M${cx + dx + 5} ${baseY - 24} V${baseY - ph}`, 0.9);
      // 冲天柱云罐
      path(pg, `M${cx + dx - 7} ${baseY - ph} q7 -16 14 0Z`, { fill: P.stone, stroke: P.line, 'stroke-width': 0.9 });
    });
    // 额枋、匾心、楼顶
    const spans = [[-w / 2, -w / 6, h * 0.62], [-w / 6, w / 6, h * 0.74], [w / 6, w / 2, h * 0.62]];
    spans.forEach(([a, b, hy]) => {
      const y = baseY - hy;
      path(pg, `M${cx + a} ${y} H${cx + b} v14 H${cx + a}Z`, { fill: mix(P.stone, P.blue, 0.25) });
      line(pg, `M${cx + a} ${y} H${cx + b} M${cx + a} ${y + 14} H${cx + b}`, 0.9);
      path(pg, `M${cx + a + 4} ${y - 16} H${cx + b - 4} v16 H${cx + a + 4}Z`, { fill: P.stoneLight, stroke: P.line, 'stroke-width': 0.8 });
      roof(pg, cx + (a + b) / 2, y - 18, b - a - 4, 14, { type: 'wudian', tiles: false, finial: false });
    });
    return pg;
  }
  function pagoda(parent, cx, baseY, levels = 5, w0 = 70, h = 260) {
    const pg = g(parent);
    const bodyH = h / (levels + 0.8);
    let y = baseY;
    path(pg, `M${cx - w0 / 2 - 14} ${y} h${w0 + 28} v-12 h${-(w0 + 28)}Z`, { fill: P.stoneLight, stroke: P.line, 'stroke-width': 0.9 });
    y -= 12;
    for (let i = 0; i < levels; i++) {
      const bw = w0 * (1 - i * 0.12);
      const lh = i === 0 ? bodyH * 1.4 : bodyH * 0.72;
      path(pg, `M${cx - bw / 2} ${y} L${cx - bw / 2 + 2} ${y - lh} H${cx + bw / 2 - 2} L${cx + bw / 2} ${y}Z`, { fill: grad([[0, mix(P.wall, P.stone, 0.4)], [1, P.stone]], { x2: 1, y2: 0 }) });
      line(pg, `M${cx - bw / 2} ${y} L${cx - bw / 2 + 2} ${y - lh} M${cx + bw / 2} ${y} L${cx + bw / 2 - 2} ${y - lh}`, 0.9);
      if (i === 0) path(pg, `M${cx - 8} ${y} v-18 a8 8 0 0 1 16 0 v18Z`, { fill: P.ink, opacity: 0.75 });
      else svgEl('rect', { x: cx - 3, y: y - lh * 0.7, width: 6, height: lh * 0.45, fill: P.ink, opacity: 0.6 }, pg);
      y -= lh;
      roof(pg, cx, y, bw + 18, 12, { type: 'cuanjian', tiles: false, finial: false });
      y -= 6;
    }
    line(pg, `M${cx} ${y} V${y - 34}`, 1.6, P.ink);
    for (let k = 0; k < 4; k++) svgEl('ellipse', { cx, cy: y - 8 - k * 6, rx: 6 - k, ry: 1.6, fill: 'none', stroke: P.ink, 'stroke-width': 1 }, pg);
    return pg;
  }

  // —— 墙：粉墙黛瓦，墙面水渍斑驳，可开月洞门 ——
  function wall(parent, x0, x1, baseY, h, { moonGate = null, windows = [] } = {}) {
    const R = rng(id + 'wall' + x0);
    const wg = g(parent);
    let d = `M${x0} ${baseY} V${baseY - h} H${x1} V${baseY}Z`;
    path(wg, d, { fill: grad([[0, P.wall], [1, mix(P.wall, P.wallShade, 0.6)]]) });
    const inner = g(wg, { 'clip-path': clip(d) });
    for (let i = 0; i < 6; i++) {
      const sx = x0 + R() * (x1 - x0);
      svgEl('ellipse', { cx: sx, cy: baseY - R() * h * 0.6, rx: 12 + R() * 30, ry: 18 + R() * 30, fill: P.wallShade, opacity: 0.35, filter: F.soft }, inner);
      line(inner, `M${sx} ${baseY - h} q${(R() - 0.5) * 6} ${h * 0.3} ${(R() - 0.5) * 4} ${h * (0.2 + R() * 0.4)}`, 3 + R() * 4, P.wallShade, 0.25);
    }
    if (moonGate) {
      const { cx, r } = moonGate;
      svgEl('circle', { cx, cy: baseY - r - 2, r, fill: P.night ? '#05070a' : mix(P.ink, P.green, 0.3), opacity: 0.85 }, wg);
      svgEl('circle', { cx, cy: baseY - r - 2, r: r + 4, fill: 'none', stroke: P.stone, 'stroke-width': 5 }, wg);
      svgEl('circle', { cx, cy: baseY - r - 2, r: r + 6.5, fill: 'none', stroke: P.line, 'stroke-width': 0.9 }, wg);
      bamboo(wg, cx + r * 0.2, baseY - 2, r * 1.7, 3, 'gate');
    }
    windows.forEach(({ cx, cy, s = 22 }) => {
      path(wg, `M${cx - s} ${cy} h${s * 2} v${s * 1.4} h${-s * 2}Z`, { fill: P.stone, opacity: 0.5 });
      const lg = g(wg, { opacity: 0.8 });
      for (let k = -s + 6; k < s; k += 8) line(lg, `M${cx + k} ${cy} q4 ${s * 0.7} 0 ${s * 1.4}`, 1, P.line);
      line(wg, `M${cx - s} ${cy} h${s * 2} v${s * 1.4} h${-s * 2}Z`, 1, P.line);
    });
    // 瓦檐压顶
    path(wg, `M${x0 - 8} ${baseY - h} Q${(x0 + x1) / 2} ${baseY - h - 4} ${x1 + 8} ${baseY - h} L${x1 + 2} ${baseY - h - 12} H${x0 - 2}Z`, { fill: P.roof });
    for (let x = x0; x <= x1; x += 7) line(wg, `M${x} ${baseY - h - 11} v10`, 0.8, P.ink, 0.6);
    line(wg, `M${x0 - 8} ${baseY - h} Q${(x0 + x1) / 2} ${baseY - h - 4} ${x1 + 8} ${baseY - h}`, 1.6, P.ink);
    line(wg, `M${x0} ${baseY - h} V${baseY} M${x1} ${baseY - h} V${baseY}`, 0.9, P.line, 0.7);
    return wg;
  }

  // 夯土残垣：层层夯筑线 + 残缺顶部
  function ruinWall(parent, x0, x1, baseY, h, seed = 'ru', tone = P.earth) {
    const R = rng(id + seed);
    const rg = g(parent);
    let d = `M${x0} ${baseY} L${x0 + 6} ${baseY - h * 0.7}`;
    const n = 10;
    for (let i = 1; i < n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = baseY - h * (0.55 + R() * 0.45);
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L${x1 - 6} ${baseY - h * 0.6} L${x1} ${baseY}Z`;
    path(rg, d, { fill: grad([[0, mix(tone, P.wall, 0.12)], [1, mix(tone, P.earthDark, 0.45)]]) });
    const inner = g(rg, { 'clip-path': clip(d) });
    for (let y = baseY - 8; y > baseY - h; y -= 9) line(inner, `M${x0} ${y} H${x1}`, 0.7, P.line, 0.3);
    cun(inner, R, Math.round((x1 - x0) / 10), x0, x1, () => baseY - h, baseY, P.line, 0.3, 14);
    line(rg, d.replace(/Z$/, ''), 1.2);
    return rg;
  }

  // —— 石像生剪影：翼马、石狮、翁仲（小尺度，用于神道纵深） ——
  function statue(parent, x, baseY, kind = 'horse', s = 1, dir = 1) {
    const sg = g(parent, { transform: `translate(${x} ${baseY}) scale(${s * dir} ${s})` });
    path(sg, 'M-16 0 h32 v-6 h-32Z', { fill: P.stoneLight, stroke: P.line, 'stroke-width': 0.8 });
    let d;
    if (kind === 'horse') d = 'M-14 -6 v-14 q0 -8 8 -9 h10 q4 -10 10 -12 q4 0 4 6 l-4 8 v20 h-4 v-12 h-14 v12Z';
    else if (kind === 'lion') d = 'M-12 -6 q-2 -14 4 -18 q4 -8 12 -6 q8 2 8 10 v14 h-5 v-8 h-12 v8Z';
    else d = 'M-6 -6 v-26 q0 -6 6 -6 q6 0 6 6 v26Z M-4 -38 q4 -8 8 0Z';
    path(sg, d, { fill: grad([[0, P.stoneLight], [1, P.stone]]), stroke: P.line, 'stroke-width': 1 });
    return sg;
  }

  // —— 旌旗、帐、水 ——
  function banner(parent, x, baseY, h, color = P.cinnabar, text = '') {
    const bg = g(parent, { class: 'ink-banner' });
    line(bg, `M${x} ${baseY} V${baseY - h}`, 2, P.ink);
    const fy = baseY - h + 4;
    path(bg, `M${x} ${fy} q22 4 40 -2 l-4 18 l6 18 q-20 6 -42 0Z`, { fill: color, opacity: 0.82 });
    line(bg, `M${x} ${fy} q22 4 40 -2 l-4 18 l6 18 q-20 6 -42 0`, 0.9, P.ink, 0.8);
    if (text) {
      const t = svgEl('text', { x: x + 19, y: fy + 24, 'font-size': 15, 'text-anchor': 'middle', fill: '#f2e6cc', 'font-family': 'var(--f-brush)' }, bg);
      t.textContent = text;
    }
    return bg;
  }
  function tent(parent, cx, baseY, w = 200, h = 110) {
    const tg = g(parent);
    const d = `M${cx - w / 2} ${baseY} L${cx - w * 0.42} ${baseY - h * 0.62} Q${cx} ${baseY - h * 1.08} ${cx + w * 0.42} ${baseY - h * 0.62} L${cx + w / 2} ${baseY}Z`;
    path(tg, d, { fill: grad([[0, mix(P.wood, P.wall, 0.25)], [1, mix(P.wood, P.ink, 0.35)]]) });
    line(tg, d.replace(/Z$/, ''), 1.3);
    for (let k = -2; k <= 2; k++) line(tg, `M${cx + k * w * 0.1} ${baseY - h * (1 - Math.abs(k) * 0.08)} Q${cx + k * w * 0.16} ${baseY - h * 0.4} ${cx + k * w * 0.2} ${baseY}`, 0.7, P.line, 0.5);
    path(tg, `M${cx - 22} ${baseY} V${baseY - h * 0.42} Q${cx} ${baseY - h * 0.5} ${cx + 22} ${baseY - h * 0.42} V${baseY}Z`, { fill: P.ink, opacity: 0.7 });
    line(tg, `M${cx} ${baseY - h * 1.05} V${baseY - h * 1.4}`, 1.6, P.ink);
    return tg;
  }
  function water(parent, x0, x1, y0, y1, seed = 'wa') {
    const R = rng(id + seed);
    const wg = g(parent);
    path(wg, `M${x0} ${y0} H${x1} V${y1} H${x0}Z`, { fill: grad([[0, mix(P.blue, P.wall, P.night ? 0.05 : 0.45), 0.85], [1, mix(P.blue, P.ink, 0.35), 0.9]]) });
    for (let i = 0; i < Math.round((x1 - x0) / 22); i++) {
      const x = x0 + R() * (x1 - x0), y = y0 + 6 + R() * (y1 - y0 - 8), l = 20 + R() * 50;
      line(wg, `M${x.toFixed(1)} ${y.toFixed(1)} q${(l / 4).toFixed(1)} -3 ${(l / 2).toFixed(1)} 0 t${(l / 2).toFixed(1)} 0`, 0.8, P.night ? P.lineSoft : P.line, 0.35);
    }
    return wg;
  }
  // 铭文牌匾
  function plaque(parent, cx, cy, text, w = 90, h = 24, { color = P.ink, ink = P.gold } = {}) {
    const pg = g(parent);
    path(pg, `M${cx - w / 2} ${cy - h / 2} h${w} v${h} h${-w}Z`, { fill: color, opacity: 0.9 });
    line(pg, `M${cx - w / 2 + 3} ${cy - h / 2 + 3} h${w - 6} v${h - 6} h${-(w - 6)}Z`, 0.8, ink, 0.8);
    const t = svgEl('text', { x: cx, y: cy + h * 0.2, 'font-size': h * 0.55, 'text-anchor': 'middle', fill: ink, 'font-family': 'var(--f-kai)', 'letter-spacing': '0.15em' }, pg);
    t.textContent = text;
    return pg;
  }

  return {
    P, F, mix, grad, radial, clip, g, path, line, shape, mist, dots, cun, grass,
    roof, hall, terrace, mound, cypress, bamboo, willow, rock, rockPile, cliff,
    huabiao, que, paifang, pagoda, wall, ruinWall, statue, banner, tent, water, plaque,
  };
}
