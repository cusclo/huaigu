// 墓园与古迹画卷：水墨远山 + 礼制陵寝/名胜古迹建筑 + 供桌供品 + 古树挂牌 + 触碑穿越
import { svgEl, html, esc, rng, api, openModal, CARD_COLORS, fmtDate } from './util.js';
import { OFFERINGS, OFFERING_CATS, OFFERING_MAP } from './offerings.js';
import { drawTree } from './tree.js';
import { startParticles } from './particles.js';
import { inkTravel } from './transition.js';
import { drawSiteArchitecture } from './renderers/arch-site.js';
import { renderPortraitHtml } from './core/portraits.js';

const VB_W = 1600, VB_H = 900, GROUND = 772, TX = 620, TREE_X = 1110;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const lum = (h) => { const [r, g, b] = hex(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

export function renderTomb(root, fig) {
  const sc = fig.scene;
  const isSite = fig.kind === 'site';
  const night = lum(sc.sky[0]) < 0.35;
  const view = html(`
    <section class="view tomb-view ${night ? 'night' : ''}">
      <svg class="tomb-svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMax slice"></svg>
      <canvas class="particles"></canvas>
      <header class="top-bar">
        <a class="back-link" href="#/">舆图</a>
        <a class="back-link" href="#/life/${fig.id}">${isSite ? '遗址考据 · 诗文' : '生平 · 作品'}</a>
      </header>
      <div class="tomb-title">
        <div class="tt-heading">
          ${renderPortraitHtml(fig, 'sm', 'tt-avatar')}
          <h1>${esc(fig.name)}</h1>
        </div>
        <p>${esc(fig.dynasty)} · ${esc(fig.years)} · ${esc(fig.role || '')}</p>
        <p class="tt-tree">${esc(fig.place)} · ${esc(sc.archLabel || '古迹规制')} · ${isSite ? '古迹旁' : '墓旁'}${esc(sc.tree.name)}</p>
      </div>
      <div class="tomb-count"></div>
      <div class="tomb-actions">
        <button class="btn ${night ? 'ghost-light' : ''}" data-act="incense">${isSite ? '敬一炷清香' : '上一炷香'}</button>
        <button class="btn ${night ? 'ghost-light' : ''}" data-act="offering">${isSite ? '敬献信物' : '摆上供品'}</button>
        <button class="btn zhu" data-act="card">${isSite ? '挂一张凭吊卡' : '挂一张缅怀卡'}</button>
        <button class="btn ${night ? 'ghost-light' : ''}" data-act="all">名录与寄语</button>
      </div>
    </section>`);
  root.appendChild(view);

  const svg = view.querySelector('svg');
  const R = rng(fig.id);
  const r = (a, b) => a + R() * (b - a);
  const defs = svgEl('defs', {}, svg);
  const gid = (n) => `${fig.id}-${n}`;
  const linear = (id, stops, vertical = true) => {
    const lg = svgEl('linearGradient', { id: gid(id), x1: 0, y1: 0, x2: vertical ? 0 : 1, y2: vertical ? 1 : 0 }, defs);
    stops.forEach(([o, c, op = 1]) => svgEl('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, lg));
    return `url(#${gid(id)})`;
  };
  const radial = (id, c, op) => {
    const rg = svgEl('radialGradient', { id: gid(id) }, defs);
    svgEl('stop', { offset: 0, 'stop-color': c, 'stop-opacity': op }, rg);
    svgEl('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, rg);
    return `url(#${gid(id)})`;
  };

  const INK = night ? '#0d1016' : '#2a241d';
  const [sky0, sky1] = sc.sky;

  // —— 天 ——
  svgEl('rect', { width: VB_W, height: VB_H, fill: linear('sky', [[0, sky0], [0.75, sky1]]) }, svg);
  drawCelestial();
  if (sc.emblem === 'qi') {
    for (let i = 0; i < 3; i++) {
      const y = 170 + i * 60;
      svgEl('path', { class: 'mist', d: `M-100 ${y} C300 ${y - 60} 700 ${y + 50} 1100 ${y - 20} S1600 ${y + 30} 1800 ${y - 10}`, stroke: '#8f6aa6', 'stroke-width': 26 - i * 6, fill: 'none', opacity: 0.22, filter: 'url(#ink-blur-lg)' }, svg);
    }
  }

  // —— 远山三叠 ——
  const mountain = (base, amp, color, op, blur, seed) => {
    const Rm = rng(fig.id + seed);
    const ph = [Rm() * 6, Rm() * 6, Rm() * 6];
    let d = `M-60 ${VB_H}`;
    for (let x = -60; x <= VB_W + 60; x += 20) {
      const y = base - amp * (0.55 * (0.5 + 0.5 * Math.sin(x * 0.0035 + ph[0])) + 0.3 * (0.5 + 0.5 * Math.sin(x * 0.009 + ph[1])) + 0.15 * (0.5 + 0.5 * Math.sin(x * 0.023 + ph[2])));
      d += ` L${x} ${y.toFixed(1)}`;
    }
    d += ` L${VB_W + 60} ${VB_H}Z`;
    svgEl('path', { d, fill: linear('m' + seed, [[0, color, op], [0.55, color, op * 0.35], [1, color, 0]]), filter: blur ? 'url(#ink-blur)' : '' }, svg);
  };
  const mBase = night ? mix(sky1, '#05070a', 0.35) : mix(sky1, '#2a241d', 0.3);
  mountain(560, 220, mBase, 0.42, true, 'a');
  mountain(650, 150, mix(mBase, INK, 0.3), 0.55, false, 'b');
  svgEl('ellipse', { class: 'mist', cx: 800, cy: 650, rx: 900, ry: 50, fill: night ? '#9fb0c4' : '#ffffff', opacity: night ? 0.08 : 0.35, filter: 'url(#ink-blur-lg)' }, svg);
  mountain(735, 70, mix(mBase, INK, 0.55), 0.7, false, 'c');

  // 远景点缀
  if (sc.emblem === 'hut') drawHut(250, 742);
  if (sc.emblem === 'boat' && sc.tomb !== 'water') drawBoat(330, 690, 0.8, 0.55);

  // —— 地 ——
  const groundTop = night ? mix(sky1, '#05070a', 0.55) : mix(sky1, '#3a3026', 0.45);
  svgEl('path', { d: `M0 ${GROUND - 8} Q400 ${GROUND - 26} 800 ${GROUND - 2} T1600 ${GROUND - 12} L1600 ${VB_H} L0 ${VB_H}Z`, fill: linear('ground', [[0, groundTop], [1, mix(groundTop, '#000000', 0.45)]]) }, svg);
  // 草叶
  const grass = svgEl('g', { stroke: mix(groundTop, '#000', 0.3), 'stroke-width': 1.2, opacity: 0.6 }, svg);
  for (let i = 0; i < 140; i++) {
    const x = r(0, VB_W), y = r(GROUND - 4, VB_H - 20), h = r(5, 14);
    svgEl('path', { d: `M${x} ${y} q${r(-3, 3)} ${-h / 2} ${r(-5, 5)} ${-h}`, fill: 'none' }, grass);
  }
  if (sc.tomb === 'water') drawWater();
  svgEl('ellipse', { class: 'mist', cx: 400, cy: GROUND + 10, rx: 700, ry: 26, fill: night ? '#a9b8c8' : '#fff', opacity: night ? 0.06 : 0.25, filter: 'url(#ink-blur-lg)' }, svg);

  // —— 树 ——
  const treeLayer = svgEl('g', {}, svg);
  const { hangs } = drawTree(treeLayer, sc.tree, fig.id, TREE_X, GROUND + 4);
  svgEl('ellipse', { cx: TREE_X, cy: GROUND + 6, rx: 120, ry: 10, fill: '#000', opacity: 0.25, filter: 'url(#ink-blur)' }, treeLayer);

  // —— 礼制陵寝建筑群（按等级与时代规制生成） ——
  drawArchitecture();
  if (sc.emblem === 'wine') drawWine(TX - 132, GROUND + 2);
  if (sc.emblem === 'flag') drawFlag(TX + 280, GROUND);
  if (sc.emblem === 'cauldron') drawCauldron(TX - 165, GROUND + 4);
  if (sc.emblem === 'sword') drawSword(TX - 132, GROUND + 2);
  if (sc.emblem === 'compass') drawCompass(TX - 155, GROUND + 2);
  if (sc.emblem === 'gourd') drawGourd(TX - 132, GROUND + 2);
  if (sc.emblem === 'slips') drawSlips(TX - 142, GROUND + 4);
  if (sc.emblem === 'pipa') drawPipa(TX - 132, GROUND + 2);
  const steleScale = sc.steleType === 'imperial' ? 1.12 : sc.steleType === 'bixi' ? 1.04 : 1.08;
  const stele = drawStele(TX, GROUND, steleScale);
  if (sc.emblem === 'hat') drawHat(TX + 66 * steleScale, GROUND - 2);
  if (sc.emblem === 'fan') drawFan(TX + 68 * steleScale, GROUND - 4);

  // —— 石供桌 + 香炉 + 供品层 ——
  const TABLE_Y = GROUND + 22;
  drawAltarTable(TX, TABLE_Y);
  const offeringLayer = svgEl('g', {}, svg);
  const incense = drawBurner(TX, TABLE_Y + 2);
  if (sc.emblem === 'goose') { drawGoose(TX - 250, GROUND + 50, 1); drawGoose(TX - 320, GROUND + 66, -0.85); }
  if (sc.emblem === 'chrys') [[TX - 210, GROUND + 22], [TX + 210, GROUND + 30], [TX - 260, GROUND + 50], [TX + 250, GROUND + 60]].forEach(([x, y]) => drawChrys(x, y));

  // —— 卡片层 ——
  const cardLayer = svgEl('g', {}, svg);

  // 粒子
  const stopParticles = startParticles(view.querySelector('.particles'), sc.particles);

  // ======== 绘制函数 ========
  function drawCelestial() {
    const c = sc.celestial;
    if (c === 'moon') {
      svgEl('circle', { cx: 300, cy: 170, r: 190, fill: radial('mg', '#f6eccc', 0.35) }, svg);
      svgEl('circle', { cx: 300, cy: 170, r: 50, fill: '#f6eed6' }, svg);
      svgEl('circle', { cx: 285, cy: 160, r: 9, fill: '#e3d8b8', opacity: 0.6 }, svg);
      svgEl('circle', { cx: 316, cy: 186, r: 6, fill: '#e3d8b8', opacity: 0.5 }, svg);
    } else if (c === 'moon-pale') {
      svgEl('circle', { cx: 1330, cy: 150, r: 110, fill: radial('mg', '#ffffff', 0.4) }, svg);
      svgEl('circle', { cx: 1330, cy: 150, r: 34, fill: '#fbf8f1', opacity: 0.85 }, svg);
    } else if (c === 'sun') {
      svgEl('circle', { cx: 1330, cy: 170, r: 40, fill: '#b8453a', opacity: 0.5 }, svg);
    } else if (c === 'sunset') {
      svgEl('circle', { cx: 300, cy: 560, r: 300, fill: radial('sg', '#ffd29a', 0.55) }, svg);
      svgEl('circle', { cx: 300, cy: 560, r: 74, fill: '#f6b26b', opacity: 0.9 }, svg);
    } else if (c === 'stars') {
      const sg = svgEl('g', {}, svg);
      for (let i = 0; i < 160; i++) {
        const s = svgEl('circle', { cx: r(0, VB_W), cy: r(0, 520), r: r(0.4, 1.4), fill: '#fff', opacity: r(0.2, 0.8) }, sg);
        if (i % 9 === 0) s.style.animation = `breathe ${r(2, 5)}s ${r(0, 3)}s infinite`;
      }
      // 北斗七星
      const dipper = [[1150, 110], [1215, 98], [1275, 122], [1325, 150], [1340, 215], [1425, 228], [1440, 165]];
      svgEl('polyline', { points: dipper.map((p) => p.join(',')).join(' ') + ' 1325,150', fill: 'none', stroke: '#e9dfc0', 'stroke-width': 0.6, opacity: 0.25 }, sg);
      dipper.forEach(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 2.6, fill: '#fff6d8', filter: 'url(#glow)' }, sg));
    }
  }

  // ======== 十一类历史陵寝建筑规制绘制 ========
  function drawArchitecture() {
    const g = svgEl('g', { class: 'tomb-arch' }, svg);
    const arch = sc.archType || 'poet_garden';
    const banner = sc.archBanner || fig.name;
    const stoneMain = night ? '#484c56' : '#857e71';
    const stoneDark = night ? '#2d3038' : '#585248';
    const stoneLight = night ? '#636875' : '#aba393';
    const brickMain = night ? '#363942' : '#69645c';
    const zhuWall = night ? '#592422' : '#85312b';
    const roofTile = night ? '#1c2028' : '#32302d';
    const goldTrim = '#d4b263';
    const earth = fig.id === 'wangzhaojun'
      ? '#556e43'
      : night ? mix(sky1, '#0d1016', 0.48) : mix('#786850', sky1, 0.25);

    // 通用辅助：绘制中国传统飞檐屋顶（起翘屋角 + 瓦垄 + 脊兽）
    const drawRoof = (parent, cx, topY, spanW, roofH, doubleEave = false) => {
      const hw = spanW / 2;
      if (doubleEave) {
        const lhw = hw * 1.18, ly = topY + roofH * 0.72, lh = roofH * 0.55;
        svgEl('path', {
          d: `M${cx - lhw - 16} ${ly + lh} Q${cx - lhw * 0.7} ${ly + lh * 0.3} ${cx - lhw * 0.55} ${ly} L${cx + lhw * 0.55} ${ly} Q${cx + lhw * 0.7} ${ly + lh * 0.3} ${cx + lhw + 16} ${ly + lh} Q${cx} ${ly + lh - 5} ${cx - lhw - 16} ${ly + lh}Z`,
          fill: roofTile, stroke: stoneDark, 'stroke-width': 1
        }, parent);
        // 斗拱层
        for (let dx = -lhw * 0.65; dx <= lhw * 0.65; dx += 24) {
          svgEl('rect', { x: cx + dx - 5, y: ly + lh, width: 10, height: 6, fill: zhuWall }, parent);
        }
      }
      svgEl('path', {
        d: `M${cx - hw - 14} ${topY + roofH} Q${cx - hw * 0.65} ${topY + roofH * 0.25} ${cx - hw * 0.45} ${topY} L${cx + hw * 0.45} ${topY} Q${cx + hw * 0.65} ${topY + roofH * 0.25} ${cx + hw + 14} ${topY + roofH} Q${cx} ${topY + roofH - 5} ${cx - hw - 14} ${topY + roofH}Z`,
        fill: roofTile, stroke: stoneDark, 'stroke-width': 1
      }, parent);
      // 正脊与吻兽
      svgEl('line', { x1: cx - hw * 0.46, y1: topY, x2: cx + hw * 0.46, y2: topY, stroke: stoneLight, 'stroke-width': 2.5 }, parent);
      svgEl('path', { d: `M${cx - hw * 0.46} ${topY} l-4 -7 l6 3 M${cx + hw * 0.46} ${topY} l4 -7 l-6 3`, stroke: goldTrim, 'stroke-width': 1.8, fill: 'none' }, parent);
    };

    // 通用辅助：绘制神道华表/望柱
    const drawHuabiao = (parent, x, baseY, h = 155) => {
      svgEl('rect', { x: x - 11, y: baseY - 14, width: 22, height: 14, fill: stoneDark }, parent);
      svgEl('rect', { x: x - 6, y: baseY - h, width: 12, height: h - 14, fill: stoneMain }, parent);
      // 云板
      svgEl('path', { d: `M${x - 18} ${baseY - h + 18} L${x + 18} ${baseY - h + 12} L${x + 15} ${baseY - h + 24} L${x - 15} ${baseY - h + 28}Z`, fill: stoneLight }, parent);
      // 承露盘与蹲兽
      svgEl('ellipse', { cx: x, cy: baseY - h, rx: 11, ry: 3.5, fill: stoneLight }, parent);
      svgEl('circle', { cx: x, cy: baseY - h - 6, r: 4.5, fill: stoneDark }, parent);
    };

    // 通用辅助：绘制匾额
    const drawPlaque = (parent, cx, cy, text, w = 88, h = 24) => {
      svgEl('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 2, fill: '#221d18', stroke: goldTrim, 'stroke-width': 1.3 }, parent);
      const t = svgEl('text', { x: cx, y: cy + 5, 'font-size': 14, 'text-anchor': 'middle', fill: '#eedba9', 'font-family': 'var(--f-kai)', 'letter-spacing': '3px' }, parent);
      t.textContent = text;
    };

    // 名胜古迹（古战场、宫殿建筑、考古遗址）委托给独立渲染模块
    if (isSite) {
      drawSiteArchitecture({
        svg, fig, sc, TX, GROUND, night, sky0, sky1, INK,
        mix, linear, radial, drawRoof, drawPlaque, drawHuabiao
      });
      return;
    }

    svgEl('ellipse', { cx: TX, cy: GROUND + 5, rx: 290, ry: 20, fill: '#000', opacity: 0.32, filter: 'url(#ink-blur)' }, g);

    // 1. 【秦汉覆斗方上大陵 + 子母双石阙 + 镇墓辟邪】
    if (arch === 'emperor_fudou') {
      // 覆斗形（梯形平顶）巨型夯土封土台
      svgEl('polygon', {
        points: `${TX - 265},${GROUND} ${TX - 125},${GROUND - 215} ${TX + 125},${GROUND - 215} ${TX + 265},${GROUND}`,
        fill: linear('fudou', [[0, mix(earth, '#fff', 0.14)], [0.8, earth], [1, mix(earth, '#000', 0.42)]]),
        filter: 'url(#ink-rough)'
      }, g);
      // 夯土层横向纹理
      for (let i = 1; i <= 6; i++) {
        const ty = GROUND - i * 30;
        const hw = 265 - (i * 30 / 215) * 140;
        svgEl('line', { x1: TX - hw + 8, y1: ty, x2: TX + hw - 8, y2: ty, stroke: '#000', 'stroke-width': 1, opacity: 0.16 }, g);
      }
      // 覆斗平顶享堂剪影
      drawRoof(g, TX, GROUND - 246, 130, 22, false);
      svgEl('rect', { x: TX - 48, y: GROUND - 225, width: 96, height: 12, fill: zhuWall, opacity: 0.85 }, g);
      // 底部条石包边基座与汉代菱格画像砖纹
      svgEl('rect', { x: TX - 272, y: GROUND - 24, width: 544, height: 24, fill: stoneDark }, g);
      for (let x = TX - 256; x <= TX + 240; x += 28) {
        svgEl('rect', { x, y: GROUND - 20, width: 22, height: 16, fill: 'none', stroke: stoneLight, 'stroke-width': 0.8, opacity: 0.45 }, g);
      }
      // 左右汉代子母双石阙（高耸礼制门户）
      [-288, 288].forEach((dx) => {
        const qx = TX + dx;
        const dir = dx < 0 ? 1 : -1;
        // 母阙
        svgEl('polygon', { points: `${qx - 22},${GROUND} ${qx - 18},${GROUND - 168} ${qx + 18},${GROUND - 168} ${qx + 22},${GROUND}`, fill: stoneMain }, g);
        svgEl('rect', { x: qx - 24, y: GROUND - 176, width: 48, height: 10, fill: zhuWall }, g);
        drawRoof(g, qx, GROUND - 198, 62, 22, false);
        // 子阙（内侧附阙）
        const sx = qx + dir * 28;
        svgEl('polygon', { points: `${sx - 14},${GROUND} ${sx - 12},${GROUND - 112} ${sx + 12},${GROUND - 112} ${sx + 14},${GROUND}`, fill: stoneDark }, g);
        drawRoof(g, sx, GROUND - 128, 38, 16, false);
      });
      // 神道镇墓石辟邪（带翼瑞兽）
      [-215, 215].forEach((dx) => {
        const bx = TX + dx, dir = dx < 0 ? 1 : -1;
        const bg = svgEl('g', { transform: `translate(${bx} ${GROUND}) scale(${dir} 1)` }, g);
        svgEl('rect', { x: -24, y: -10, width: 48, height: 10, fill: stoneDark }, bg);
        svgEl('path', { d: 'M-18 -10 L-14 -34 Q-4 -42 8 -36 Q16 -48 22 -44 Q26 -38 18 -28 L20 -10 Z', fill: stoneLight }, bg);
        svgEl('path', { d: 'M-6 -30 Q-18 -46 -4 -48 Q4 -40 -2 -28', fill: 'none', stroke: goldTrim, 'stroke-width': 1.2, opacity: 0.7 }, bg);
      });
    }

    // 2. 【隋唐两宋 · 因山为陵 + 山腰献殿 + 神道华表翼马】
    else if (arch === 'emperor_shanling') {
      // 九嵕山/梁山主峰陵体
      svgEl('path', {
        d: `M${TX - 340} ${GROUND} C${TX - 250} ${GROUND - 80} ${TX - 160} ${GROUND - 330} ${TX} ${GROUND - 348} C${TX + 160} ${GROUND - 330} ${TX + 250} ${GROUND - 80} ${TX + 340} ${GROUND}Z`,
        fill: linear('shanling', [[0, mix(stoneDark, sky0, 0.25)], [0.65, mix(earth, INK, 0.3)], [1, mix(earth, '#000', 0.45)]]),
        filter: 'url(#ink-rough)'
      }, g);
      // 山腰唐风献殿与红墙山门
      svgEl('rect', { x: TX - 95, y: GROUND - 242, width: 190, height: 22, fill: zhuWall, opacity: 0.9 }, g);
      svgEl('rect', { x: TX - 42, y: GROUND - 266, width: 84, height: 26, fill: zhuWall }, g);
      drawRoof(g, TX, GROUND - 294, 118, 28, true);
      // 贯通山陵的百级青石神道御阶
      for (let i = 0; i < 14; i++) {
        const sy = GROUND - i * 16;
        const sw = 150 - i * 6.5;
        svgEl('rect', { x: TX - sw / 2, y: sy - 5, width: sw, height: 4, fill: stoneLight, opacity: 0.65 }, g);
      }
      // 神道两侧华表望柱与石翁仲/翼马
      [-255, 255].forEach((dx) => drawHuabiao(g, TX + dx, GROUND, 175));
      [-195, 195].forEach((dx) => {
        const ox = TX + dx;
        // 笏板文臣翁仲剪影
        svgEl('rect', { x: ox - 12, y: GROUND - 10, width: 24, height: 10, fill: stoneDark }, g);
        svgEl('path', { d: `M${ox - 10} ${GROUND - 10} L${ox - 9} ${GROUND - 58} Q${ox} ${GROUND - 66} ${ox + 9} ${GROUND - 58} L${ox + 10} ${GROUND - 10}Z`, fill: stoneMain }, g);
        svgEl('circle', { cx: ox, cy: GROUND - 68, r: 6.5, fill: stoneLight }, g);
        svgEl('rect', { x: ox - 5, y: GROUND - 79, width: 10, height: 6, rx: 1, fill: stoneDark }, g);
      });
      // 武则天乾陵专属：右侧增立高耸无字碑
      if (fig.id === 'wuzetian') {
        svgEl('rect', { x: TX + 112, y: GROUND - 180, width: 38, height: 180, fill: stoneLight, stroke: stoneDark, 'stroke-width': 1 }, g);
        svgEl('path', { d: `M${TX + 110} ${GROUND - 180} Q${TX + 131} ${GROUND - 198} ${TX + 152} ${GROUND - 180}Z`, fill: stoneDark }, g);
      }
    }

    // 3. 【元明皇陵 · 宝城宝顶 + 方城明楼】
    else if (arch === 'emperor_minglou') {
      // 后方圆形宝顶封土与苍松剪影
      svgEl('path', {
        d: `M${TX - 230} ${GROUND - 110} Q${TX} ${GROUND - 310} ${TX + 230} ${GROUND - 110}Z`,
        fill: linear('baoding', [[0, mix('#2f4636', sky1, 0.2)], [1, mix(earth, '#000', 0.4)]])
      }, g);
      // 高大砖筑「方城」城台（带雉堞垛口）
      const fcW = 420, fcH = 128, fcTop = GROUND - fcH;
      svgEl('polygon', {
        points: `${TX - fcW / 2},${GROUND} ${TX - fcW / 2 + 14},${fcTop} ${TX + fcW / 2 - 14},${fcTop} ${TX + fcW / 2},${GROUND}`,
        fill: brickMain, stroke: stoneDark, 'stroke-width': 1.2
      }, g);
      // 城墙砖缝与雉堞垛口
      for (let x = TX - fcW / 2 + 16; x < TX + fcW / 2 - 20; x += 22) {
        svgEl('rect', { x, y: fcTop - 9, width: 14, height: 9, fill: brickMain }, g);
      }
      // 汉白玉须弥座底座与城门券洞
      svgEl('rect', { x: TX - fcW / 2 - 4, y: GROUND - 18, width: fcW + 8, height: 18, fill: stoneLight }, g);
      svgEl('path', { d: `M${TX - 48} ${GROUND} L${TX - 48} ${GROUND - 65} A48 48 0 0 1 ${TX + 48} ${GROUND - 65} L${TX + 48} ${GROUND}Z`, fill: '#181412', stroke: stoneLight, 'stroke-width': 2 }, g);
      // 方城之上的重檐歇山顶「明楼」
      const mlTop = fcTop - 92;
      svgEl('rect', { x: TX - 72, y: mlTop + 26, width: 144, height: 66, fill: zhuWall }, g);
      // 明楼四柱与券门
      [-52, -20, 20, 52].forEach((dx) => svgEl('line', { x1: TX + dx, y1: mlTop + 28, x2: TX + dx, y2: fcTop, stroke: goldTrim, 'stroke-width': 2, opacity: 0.65 }, g));
      drawRoof(g, TX, mlTop - 16, 184, 44, true);
      drawPlaque(g, TX, mlTop + 42, banner, 92, 22);
      // 神道两侧望柱
      [-265, 265].forEach((dx) => drawHuabiao(g, TX + dx, GROUND, 165));
    }

    // 4. 【成吉思汗 · 八白室金顶大帐陵宫 + 九斿白纛苏鲁锭】
    else if (arch === 'emperor_ordos') {
      // 三层汉白玉祭坛高台
      svgEl('rect', { x: TX - 260, y: GROUND - 26, width: 520, height: 26, fill: stoneMain }, g);
      svgEl('rect', { x: TX - 210, y: GROUND - 46, width: 420, height: 20, fill: stoneLight }, g);
      // 左右配宫穹庐与中央主陵宫大帐
      [-135, 135].forEach((dx) => {
        const cx = TX + dx, by = GROUND - 46;
        svgEl('rect', { x: cx - 52, y: by - 64, width: 104, height: 64, fill: '#dfd6c3', stroke: goldTrim, 'stroke-width': 1.2 }, g);
        svgEl('path', { d: `M${cx - 58} ${by - 64} Q${cx} ${by - 128} ${cx + 58} ${by - 64}Z`, fill: '#28456b', stroke: goldTrim, 'stroke-width': 1.5 }, g);
        svgEl('polygon', { points: `${cx},${by - 142} ${cx - 6},${by - 120} ${cx + 6},${by - 120}`, fill: goldTrim }, g);
      });
      // 中央金顶八白室主殿
      const by = GROUND - 46;
      svgEl('rect', { x: TX - 82, y: by - 95, width: 164, height: 95, fill: '#efe7d6', stroke: goldTrim, 'stroke-width': 1.6 }, g);
      svgEl('path', { d: `M${TX - 92} ${by - 95} Q${TX} ${by - 188} ${TX + 92} ${by - 95}Z`, fill: '#c99b3b', stroke: '#f7e094', 'stroke-width': 2 }, g);
      svgEl('polygon', { points: `${TX},${by - 212} ${TX - 8},${by - 178} ${TX + 8},${by - 178}`, fill: '#f7e094' }, g);
      drawPlaque(g, TX, by - 92, banner, 92, 22);
      // 两侧九斿白纛与苏鲁锭神矛
      [-235, 235].forEach((dx) => {
        const sx = TX + dx;
        svgEl('line', { x1: sx, y1: GROUND - 26, x2: sx, y2: GROUND - 210, stroke: stoneDark, 'stroke-width': 3.5 }, g);
        svgEl('polygon', { points: `${sx},${GROUND - 232} ${sx - 7},${GROUND - 206} ${sx + 7},${GROUND - 206}`, fill: goldTrim }, g);
        svgEl('path', { d: `M${sx - 14} ${GROUND - 205} Q${sx - 18} ${GROUND - 155} ${sx - 10} ${GROUND - 125} L${sx + 10} ${GROUND - 125} Q${sx + 18} ${GROUND - 155} ${sx + 14} ${GROUND - 205}Z`, fill: '#f4efe4', opacity: 0.9 }, g);
      });
    }

    // 5. 【圣贤哲人 · 曲阜孔林四柱三间冲天石牌坊 + 须弥座圣林】
    else if (arch === 'sage_paifang') {
      // 后景圆润肃穆的古圣林封土冢
      svgEl('path', {
        d: `M${TX - 190} ${GROUND - 18} Q${TX} ${GROUND - 185} ${TX + 190} ${GROUND - 18}Z`,
        fill: linear('sagemound', [[0, mix(earth, '#fff', 0.1)], [1, mix(earth, '#000', 0.38)]]),
        opacity: 0.85
      }, g);
      // 汉白玉须弥座祭台与石栏望柱
      svgEl('rect', { x: TX - 245, y: GROUND - 22, width: 490, height: 22, fill: stoneLight, stroke: stoneDark, 'stroke-width': 1 }, g);
      for (let x = TX - 230; x <= TX + 230; x += 46) {
        if (Math.abs(x - TX) < 75) continue;
        svgEl('rect', { x: x - 4, y: GROUND - 48, width: 8, height: 26, fill: stoneLight }, g);
        svgEl('circle', { cx: x, cy: GROUND - 51, r: 5, fill: stoneMain }, g);
        svgEl('rect', { x: x + 4, y: GROUND - 40, width: 38, height: 14, fill: 'none', stroke: stoneMain, 'stroke-width': 1.2 }, g);
      }
      // 四柱三间冲天式石牌坊（立于墓碑后上方，框住主碑）
      const cols = [-195, -92, 92, 195];
      cols.forEach((dx, i) => {
        const cx = TX + dx;
        const h = (i === 1 || i === 2) ? 286 : 242;
        // 抱鼓石夹杆石
        svgEl('path', { d: `M${cx - 16} ${GROUND - 22} Q${cx - 18} ${GROUND - 52} ${cx - 7} ${GROUND - 56} L${cx + 7} ${GROUND - 56} Q${cx + 18} ${GROUND - 52} ${cx + 16} ${GROUND - 22}Z`, fill: stoneDark }, g);
        // 冲天石柱
        svgEl('rect', { x: cx - 7, y: GROUND - h, width: 14, height: h - 22, fill: stoneLight, stroke: stoneDark, 'stroke-width': 0.9 }, g);
        // 柱顶云冠蹲兽
        svgEl('polygon', { points: `${cx - 10},${GROUND - h} ${cx},${GROUND - h - 14} ${cx + 10},${GROUND - h}`, fill: stoneMain }, g);
      });
      // 中间明间双层额枋与花板
      svgEl('rect', { x: TX - 92, y: GROUND - 248, width: 184, height: 14, fill: stoneMain }, g);
      svgEl('rect', { x: TX - 92, y: GROUND - 216, width: 184, height: 12, fill: stoneMain }, g);
      drawRoof(g, TX, GROUND - 278, 196, 26, false);
      drawPlaque(g, TX, GROUND - 232, banner, 106, 26);
      // 左右次间额枋与檐楼
      [-143.5, 143.5].forEach((cx) => {
        svgEl('rect', { x: cx - 51, y: GROUND - 206, width: 102, height: 12, fill: stoneMain }, g);
        svgEl('rect', { x: cx - 51, y: GROUND - 182, width: 102, height: 10, fill: stoneDark }, g);
        drawRoof(g, cx, GROUND - 230, 112, 22, false);
      });
    }

    // 6. 【文臣名相 · 敕建重檐御碑亭 + 祠垣 + 神道望柱】
    else if (arch === 'minister_pavilion') {
      // 后景青砖祠堂景墙与封土顶
      svgEl('path', { d: `M${TX - 165} ${GROUND - 30} Q${TX} ${GROUND - 175} ${TX + 165} ${GROUND - 30}Z`, fill: earth, opacity: 0.72 }, g);
      svgEl('rect', { x: TX - 235, y: GROUND - 95, width: 470, height: 75, fill: brickMain, opacity: 0.85 }, g);
      svgEl('line', { x1: TX - 242, y1: GROUND - 96, x2: TX + 242, y2: GROUND - 96, stroke: roofTile, 'stroke-width': 6 }, g);
      // 碑亭双层青石台基
      svgEl('rect', { x: TX - 165, y: GROUND - 20, width: 330, height: 20, fill: stoneDark }, g);
      svgEl('rect', { x: TX - 140, y: GROUND - 34, width: 280, height: 14, fill: stoneMain }, g);
      // 四根朱墨亭柱（外二内二，留出中央御碑空间）
      [-122, -96, 96, 122].forEach((dx, idx) => {
        const w = idx === 0 || idx === 3 ? 10 : 8;
        svgEl('rect', { x: TX + dx - w / 2, y: GROUND - 228, width: w, height: 194, fill: zhuWall }, g);
      });
      // 亭额横枋与雀替
      svgEl('rect', { x: TX - 128, y: GROUND - 236, width: 256, height: 16, fill: zhuWall, stroke: goldTrim, 'stroke-width': 0.8 }, g);
      // 重檐歇山碑亭顶 + 宝顶 + 檐角风铎
      drawRoof(g, TX, GROUND - 310, 290, 56, true);
      svgEl('polygon', { points: `${TX},${GROUND - 328} ${TX - 8},${GROUND - 310} ${TX + 8},${GROUND - 310}`, fill: goldTrim }, g);
      [-156, 156].forEach((dx) => {
        svgEl('line', { x1: TX + dx, y1: GROUND - 254, x2: TX + dx, y2: GROUND - 240, stroke: goldTrim, 'stroke-width': 1 }, g);
        svgEl('polygon', { points: `${TX + dx - 4},${GROUND - 234} ${TX + dx + 4},${GROUND - 234} ${TX + dx},${GROUND - 242}`, fill: goldTrim }, g);
      });
      drawPlaque(g, TX, GROUND - 242, banner, 98, 24);
      // 两侧神道望柱
      [-265, 265].forEach((dx) => drawHuabiao(g, TX + dx, GROUND, 150));
    }

    // 7. 【武将名帅 · 霍去病祁连叠石冢 + 神道披甲石马石虎 + 辕门双石表】
    else if (arch === 'general_qilian') {
      // 霍去病墓式「冢象祁连山」嶙峋叠石巨冢
      svgEl('polygon', {
        points: `${TX - 240},${GROUND - 18} ${TX - 205},${GROUND - 115} ${TX - 140},${GROUND - 150} ${TX - 85},${GROUND - 220} ${TX - 15},${GROUND - 195} ${TX + 30},${GROUND - 238} ${TX + 105},${GROUND - 180} ${TX + 165},${GROUND - 145} ${TX + 215},${GROUND - 90} ${TX + 245},${GROUND - 18}`,
        fill: linear('qilian', [[0, stoneLight], [0.5, stoneMain], [1, stoneDark]]),
        stroke: stoneDark, 'stroke-width': 1.5
      }, g);
      // 叠石棱角裂纹
      const rocks = [
        `M${TX - 140} ${GROUND - 150} L${TX - 95} ${GROUND - 75} L${TX - 35} ${GROUND - 110}`,
        `M${TX + 30} ${GROUND - 238} L${TX - 10} ${GROUND - 135} L${TX + 65} ${GROUND - 95}`,
        `M${TX + 105} ${GROUND - 180} L${TX + 80} ${GROUND - 80} L${TX + 160} ${GROUND - 55}`,
        `M${TX - 205} ${GROUND - 115} L${TX - 130} ${GROUND - 45}`
      ];
      rocks.forEach((d) => svgEl('path', { d, fill: 'none', stroke: '#1b1d22', 'stroke-width': 1.6, opacity: 0.45 }, g));
      // 条石包砌将军坛基座（带虎头浮雕纹）
      svgEl('rect', { x: TX - 255, y: GROUND - 26, width: 510, height: 26, fill: stoneDark, stroke: stoneLight, 'stroke-width': 1 }, g);
      for (let x = TX - 235; x <= TX + 215; x += 38) {
        svgEl('line', { x1: x, y1: GROUND - 26, x2: x, y2: GROUND, stroke: '#000', 'stroke-width': 1.2, opacity: 0.35 }, g);
      }
      // 神道两侧：披甲战马石刻（仿茂陵石马/岳王庙石马）
      [-225, 225].forEach((dx) => {
        const mx = TX + dx, dir = dx < 0 ? 1 : -1;
        const mg = svgEl('g', { transform: `translate(${mx} ${GROUND}) scale(${dir} 1)` }, g);
        svgEl('rect', { x: -28, y: -12, width: 56, height: 12, fill: stoneDark }, mg);
        // 马腿与马身、马首
        svgEl('path', { d: 'M-18 -12 L-18 -36 L-22 -52 L12 -52 L20 -72 L30 -66 L26 -54 L20 -46 L20 -12 L12 -12 L12 -32 L-10 -32 L-10 -12 Z', fill: stoneMain, stroke: stoneDark, 'stroke-width': 1 }, mg);
        // 马鞍甲胄
        svgEl('rect', { x: -8, y: -55, width: 18, height: 10, rx: 2, fill: zhuWall, opacity: 0.8 }, mg);
      });
      // 辕门汉阙石柱
      [-285, 285].forEach((dx) => {
        const gx = TX + dx;
        svgEl('rect', { x: gx - 12, y: GROUND - 135, width: 24, height: 135, fill: stoneMain, stroke: stoneDark, 'stroke-width': 1 }, g);
        drawRoof(g, gx, GROUND - 152, 42, 18, false);
      });
    }

    // 8. 【起义豪杰 · 三层巨石盟坛 + 双耳青铜燎原火盆 + 战戟架】
    else if (arch === 'rebel_altar') {
      // 三层粗犷花岗岩巨石盟坛
      svgEl('polygon', { points: `${TX - 260},${GROUND} ${TX - 245},${GROUND - 32} ${TX + 245},${GROUND - 32} ${TX + 260},${GROUND}`, fill: stoneDark }, g);
      svgEl('polygon', { points: `${TX - 205},${GROUND - 32} ${TX - 190},${GROUND - 62} ${TX + 190},${GROUND - 62} ${TX + 205},${GROUND - 32}`, fill: stoneMain }, g);
      svgEl('polygon', { points: `${TX - 145},${GROUND - 62} ${TX - 132},${GROUND - 88} ${TX + 132},${GROUND - 88} ${TX + 145},${GROUND - 62}`, fill: stoneLight }, g);
      // 巨石砌缝
      [-180, -90, 0, 90, 180].forEach((dx) => svgEl('line', { x1: TX + dx, y1: GROUND - 32, x2: TX + dx + 6, y2: GROUND, stroke: '#000', 'stroke-width': 1.5, opacity: 0.4 }, g));
      // 后方苍莽劈裂主峰磐石
      svgEl('polygon', {
        points: `${TX - 120},${GROUND - 88} ${TX - 75},${GROUND - 210} ${TX - 25},${GROUND - 175} ${TX + 20},${GROUND - 245} ${TX + 85},${GROUND - 165} ${TX + 125},${GROUND - 88}`,
        fill: stoneDark, opacity: 0.78
      }, g);
      // 左右双耳青铜燎原火盆（带熊熊篝火）
      [-175, 175].forEach((dx, i) => {
        const fx = TX + dx, fy = GROUND - 62;
        // 三足鼎盆
        svgEl('line', { x1: fx - 12, y1: fy - 14, x2: fx - 16, y2: fy, stroke: '#3e3528', 'stroke-width': 4 }, g);
        svgEl('line', { x1: fx + 12, y1: fy - 14, x2: fx + 16, y2: fy, stroke: '#3e3528', 'stroke-width': 4 }, g);
        svgEl('path', { d: `M${fx - 24} ${fy - 30} L${fx + 24} ${fy - 30} L${fx + 16} ${fy - 12} L${fx - 16} ${fy - 12}Z`, fill: '#4e4232', stroke: goldTrim, 'stroke-width': 0.8 }, g);
        // 摇曳篝火与火光光晕
        svgEl('circle', { cx: fx, cy: fy - 42, r: 34, fill: radial('fire' + i, '#ff7b29', 0.42) }, g);
        const flame = svgEl('path', {
          d: `M${fx - 14} ${fy - 30} Q${fx - 18} ${fy - 54} ${fx - 4} ${fy - 68} Q${fx} ${fy - 50} ${fx + 6} ${fy - 74} Q${fx + 20} ${fy - 52} ${fx + 14} ${fy - 30}Z`,
          fill: '#e85d24', opacity: 0.92,
          style: `transform-origin:${fx}px ${fy - 30}px; animation: breathe ${2.2 + i * 0.4}s ease-in-out infinite`
        }, g);
        svgEl('path', { d: `M${fx - 7} ${fy - 30} Q${fx} ${fy - 56} ${fx + 7} ${fy - 30}Z`, fill: '#ffd15c' }, g);
      });
      // 盟坛两侧交叉方天长戟
      [-232, 232].forEach((dx) => {
        const hx = TX + dx, dir = dx < 0 ? 1 : -1;
        svgEl('line', { x1: hx, y1: GROUND - 32, x2: hx - dir * 18, y2: GROUND - 175, stroke: '#4a3b2c', 'stroke-width': 3 }, g);
        svgEl('path', { d: `M${hx - dir * 18} ${GROUND - 175} L${hx - dir * 20} ${GROUND - 196} M${hx - dir * 16} ${GROUND - 182} Q${hx - dir * 6} ${GROUND - 176} ${hx - dir * 14} ${GROUND - 164}`, stroke: '#b8c0c8', 'stroke-width': 2.2, fill: 'none' }, g);
      });
    }

    // 9. 【玄奘法师 · 兴教寺五层唐代砖石密檐舍利灵塔】
    else if (arch === 'monk_pagoda') {
      // 唐代五层砖塔（立于墓碑正后方）
      const py = GROUND;
      svgEl('rect', { x: TX - 135, y: py - 24, width: 270, height: 24, fill: stoneDark }, g);
      // 五层塔身与叠涩密檐（逐层收分）
      const levels = [
        { w: 156, h: 74 },
        { w: 132, h: 48 },
        { w: 110, h: 42 },
        { w: 90,  h: 36 },
        { w: 72,  h: 32 },
      ];
      let curY = py - 24;
      levels.forEach((lv, idx) => {
        const nextY = curY - lv.h;
        svgEl('rect', { x: TX - lv.w / 2, y: nextY, width: lv.w, height: lv.h, fill: brickMain, stroke: stoneDark, 'stroke-width': 1 }, g);
        // 佛龛券门
        if (idx > 0) {
          svgEl('path', { d: `M${TX - 10} ${curY - 6} L${TX - 10} ${nextY + 14} A10 10 0 0 1 ${TX + 10} ${nextY + 14} L${TX + 10} ${curY - 6}Z`, fill: '#1e1b18', stroke: goldTrim, 'stroke-width': 0.8 }, g);
        }
        // 叠涩砖出檐
        const ew = lv.w + 34;
        svgEl('polygon', {
          points: `${TX - ew / 2},${nextY} ${TX - lv.w / 2 - 4},${nextY - 12} ${TX + lv.w / 2 + 4},${nextY - 12} ${TX + ew / 2},${nextY}`,
          fill: roofTile, stroke: stoneLight, 'stroke-width': 0.8
        }, g);
        curY = nextY - 12;
      });
      // 塔刹相轮与摩尼宝珠
      svgEl('polygon', { points: `${TX - 24},${curY} ${TX},${curY - 16} ${TX + 24},${curY}`, fill: stoneLight }, g);
      svgEl('line', { x1: TX, y1: curY - 16, x2: TX, y2: curY - 58, stroke: goldTrim, 'stroke-width': 3 }, g);
      [22, 30, 38, 46].forEach((dy) => svgEl('ellipse', { cx: TX, cy: curY - dy, rx: 9 - dy * 0.12, ry: 2.2, fill: goldTrim }, g));
      svgEl('circle', { cx: TX, cy: curY - 58, r: 5.5, fill: '#f6df92' }, g);
      drawPlaque(g, TX, py - 88, banner, 88, 22);
      // 两侧石经幢
      [-195, 195].forEach((dx) => drawHuabiao(g, TX + dx, GROUND, 130));
    }

    // 10. 【天算历法百工 · 登封观星台式覆斗青砖测景高台 + 圭表浑仪】
    else if (arch === 'scholar_observatory') {
      // 覆斗式青砖观星高台（中央开圭表凹槽）
      const topY = GROUND - 215;
      svgEl('polygon', {
        points: `${TX - 210},${GROUND} ${TX - 135},${topY} ${TX + 135},${topY} ${TX + 210},${GROUND}`,
        fill: brickMain, stroke: stoneDark, 'stroke-width': 1.2
      }, g);
      // 左右登台踏道斜阶
      svgEl('polygon', { points: `${TX - 255},${GROUND} ${TX - 210},${GROUND} ${TX - 135},${topY + 25} ${TX - 165},${topY + 25}`, fill: stoneDark }, g);
      svgEl('polygon', { points: `${TX + 255},${GROUND} ${TX + 210},${GROUND} ${TX + 135},${topY + 25} ${TX + 165},${topY + 25}`, fill: stoneDark }, g);
      // 观星台顶石栏杆
      svgEl('rect', { x: TX - 138, y: topY - 14, width: 276, height: 14, fill: 'none', stroke: stoneLight, 'stroke-width': 2 }, g);
      for (let x = TX - 120; x <= TX + 120; x += 30) {
        svgEl('line', { x1: x, y1: topY - 18, x2: x, y2: topY, stroke: stoneLight, 'stroke-width': 3 }, g);
      }
      // 台顶大型青铜简仪/浑仪剪影
      const ix = TX + 75, iy = topY - 14;
      svgEl('line', { x1: ix - 16, y1: iy, x2: ix, y2: iy - 38, stroke: goldTrim, 'stroke-width': 2.5 }, g);
      svgEl('line', { x1: ix + 16, y1: iy, x2: ix, y2: iy - 38, stroke: goldTrim, 'stroke-width': 2.5 }, g);
      svgEl('circle', { cx: ix, cy: iy - 42, r: 24, fill: 'none', stroke: goldTrim, 'stroke-width': 2.2 }, g);
      svgEl('ellipse', { cx: ix, cy: iy - 42, rx: 24, ry: 9, transform: `rotate(-32 ${ix} ${iy - 42})`, fill: 'none', stroke: '#e8d292', 'stroke-width': 1.5 }, g);
      drawPlaque(g, TX, topY + 34, banner, 94, 22);
    }

    // 11. 【百工奇人 / 医圣 · 飞檐石龛祠门 + 青石须弥方台】
    else if (arch === 'artisan_shrine') {
      // 双层青石须弥座方台与望柱栏杆
      svgEl('rect', { x: TX - 225, y: GROUND - 24, width: 450, height: 24, fill: stoneDark }, g);
      svgEl('rect', { x: TX - 190, y: GROUND - 42, width: 380, height: 18, fill: stoneMain }, g);
      // 飞檐砖石祠门（二柱一间殿堂式石龛）
      const sTop = GROUND - 235;
      svgEl('rect', { x: TX - 115, y: sTop, width: 230, height: 193, fill: brickMain, stroke: stoneDark, 'stroke-width': 1.2 }, g);
      svgEl('rect', { x: TX - 92, y: sTop + 20, width: 184, height: 173, fill: stoneDark, opacity: 0.7 }, g);
      drawRoof(g, TX, sTop - 36, 268, 38, true);
      drawPlaque(g, TX, sTop + 22, banner, 96, 24);
      // 两侧石栏望柱与石灯台
      [-205, 205].forEach((dx) => {
        const lx = TX + dx;
        svgEl('rect', { x: lx - 10, y: GROUND - 88, width: 20, height: 64, fill: stoneMain }, g);
        svgEl('polygon', { points: `${lx - 18},${GROUND - 88} ${lx},${GROUND - 104} ${lx + 18},${GROUND - 88}`, fill: roofTile }, g);
        svgEl('rect', { x: lx - 5, y: GROUND - 82, width: 10, height: 12, fill: '#f3d184', opacity: 0.75 }, g);
      });
    }

    // 12. 【文豪艺人 · 江南粉墙黛瓦月亮门 + 青砖罗圈诗冢 + 太湖奇石】
    else {
      const wallWhite = night ? '#3c424d' : '#ded8ca';
      // 江南园林错落粉墙黛瓦（左高右低，开月洞门与什锦漏窗）
      svgEl('rect', { x: TX - 265, y: GROUND - 172, width: 240, height: 172, fill: wallWhite, opacity: 0.9 }, g);
      svgEl('rect', { x: TX - 25, y: GROUND - 136, width: 255, height: 136, fill: mix(wallWhite, '#000', 0.06), opacity: 0.9 }, g);
      // 黛瓦压顶
      svgEl('polygon', { points: `${TX - 275},${GROUND - 170} ${TX - 268},${GROUND - 180} ${TX - 18},${GROUND - 180} ${TX - 12},${GROUND - 170}`, fill: roofTile }, g);
      svgEl('polygon', { points: `${TX - 30},${GROUND - 134} ${TX - 24},${GROUND - 143} ${TX + 236},${GROUND - 143} ${TX + 242},${GROUND - 134}`, fill: roofTile }, g);
      // 月洞门（左墙偏中，透出远山竹影）
      const mx = TX - 155, my = GROUND - 74;
      svgEl('circle', { cx: mx, cy: my, r: 54, fill: mix(sky1, INK, 0.25), stroke: stoneDark, 'stroke-width': 3.5 }, g);
      // 月洞门内侧疏竹剪影
      [-18, 4, 22].forEach((bx) => {
        svgEl('line', { x1: mx + bx, y1: my + 50, x2: mx + bx - 6, y2: my - 46, stroke: '#3a4f39', 'stroke-width': 2 }, g);
        svgEl('path', { d: `M${mx + bx - 3} ${my - 10} l-14 -6 M${mx + bx - 4} ${my - 28} l15 -5`, stroke: '#3a4f39', 'stroke-width': 1.8 }, g);
      });
      // 右墙海棠花窗（漏窗）
      const wx = TX + 145, wy = GROUND - 78;
      svgEl('rect', { x: wx - 28, y: wy - 28, width: 56, height: 56, rx: 6, fill: mix(sky1, INK, 0.3), stroke: stoneDark, 'stroke-width': 2 }, g);
      svgEl('line', { x1: wx - 28, y1: wy, x2: wx + 28, y2: wy, stroke: stoneDark, 'stroke-width': 1.2 }, g);
      svgEl('line', { x1: wx, y1: wy - 28, x2: wx, y2: wy + 28, stroke: stoneDark, 'stroke-width': 1.2 }, g);
      // 江南青砖罗圈墓垣与封土
      svgEl('path', {
        d: `M${TX - 115} ${GROUND} C${TX - 110} ${GROUND - 95} ${TX - 45} ${GROUND - 125} ${TX} ${GROUND - 125} C${TX + 45} ${GROUND - 125} ${TX + 110} ${GROUND - 95} ${TX + 115} ${GROUND}Z`,
        fill: earth, opacity: 0.9
      }, g);
      svgEl('path', {
        d: `M${TX - 135} ${GROUND + 2} C${TX - 130} ${GROUND - 110} ${TX - 55} ${GROUND - 142} ${TX} ${GROUND - 142} C${TX + 55} ${GROUND - 142} ${TX + 130} ${GROUND - 110} ${TX + 135} ${GROUND + 2}`,
        fill: 'none', stroke: stoneDark, 'stroke-width': 8
      }, g);
      // 文人太湖奇石（瘦、皱、漏、透）
      const rx = TX + 150, ry = GROUND;
      svgEl('path', {
        d: `M${rx - 22} ${ry} C${rx - 38} ${ry - 35} ${rx - 12} ${ry - 72} ${rx - 26} ${ry - 98} C${rx - 10} ${ry - 122} ${rx + 28} ${ry - 110} ${rx + 22} ${ry - 74} C${rx + 36} ${ry - 48} ${rx + 18} ${ry - 20} ${rx + 24} ${ry}Z`,
        fill: stoneMain, stroke: stoneDark, 'stroke-width': 1
      }, g);
      svgEl('circle', { cx: rx - 2, cy: ry - 78, r: 9, fill: wallWhite, opacity: 0.85 }, g);
      svgEl('circle', { cx: rx + 8, cy: ry - 45, r: 6, fill: wallWhite, opacity: 0.85 }, g);
    }
  }

  // ======== 六等礼制碑刻规制绘制（双龙帝碑 / 螭首龟趺 / 篆额圣碑 / 虎座将碑 / 摩崖剑碑 / 诗碑） ========
  function drawStele(x, base, s) {
    const g = svgEl('g', { class: 'stele', transform: `translate(${x} ${base}) scale(${s})`, role: 'button', 'aria-label': `触摸${fig.name}墓碑，进入古今对话` }, svg);
    const stType = sc.steleType || 'literati';
    const stoneA = night ? '#4c5059' : '#7b766c';
    const stoneB = night ? '#2e3138' : '#504c44';
    const stoneRim = night ? '#6e7380' : '#9e988c';
    const gold = '#e2cf9c';

    // 触碑光晕
    svgEl('rect', { class: 'stele-glow', x: -78, y: -315, width: 156, height: 315, rx: 34, fill: '#f3d78a', opacity: 0.6, filter: 'url(#ink-blur-lg)' }, g);

    // 1. 碑座规制（龟趺赑屃 vs 须弥玉座 vs 摩崖山石座）
    if (stType === 'bixi') {
      // 一品名臣规制：昂首灵龟（赑屃）驮碑
      svgEl('rect', { x: -82, y: -10, width: 164, height: 12, rx: 3, fill: stoneB }, g);
      // 龟壳背甲
      svgEl('path', { d: 'M-58 -10 C-58 -46 58 -46 58 -10 Z', fill: stoneA, stroke: stoneB, 'stroke-width': 1.2 }, g);
      // 龟甲六角格纹
      [-28, 0, 28].forEach((dx) => svgEl('line', { x1: dx, y1: -36, x2: dx, y2: -10, stroke: stoneB, 'stroke-width': 1, opacity: 0.5 }, g));
      // 昂首龙头龟首（向左侧昂起）
      svgEl('path', { d: 'M-52 -16 Q-78 -22 -84 -38 Q-88 -48 -74 -50 Q-62 -50 -62 -38 Q-60 -26 -46 -22 Z', fill: stoneA, stroke: stoneB, 'stroke-width': 1 }, g);
      svgEl('circle', { cx: -75, cy: -43, r: 1.8, fill: gold }, g);
      // 龟尾与四足
      svgEl('path', { d: 'M54 -14 Q68 -18 74 -10 Z', fill: stoneB }, g);
      [-42, 36].forEach((dx) => svgEl('ellipse', { cx: dx, cy: -9, rx: 11, ry: 5, fill: stoneB }, g));
    } else if (stType === 'imperial' || stType === 'sage') {
      // 帝王/圣贤：双层雕花汉白玉须弥座
      svgEl('rect', { x: -76, y: -14, width: 152, height: 15, rx: 2, fill: stoneB }, g);
      svgEl('polygon', { points: '-66,-14 -58,-26 58,-26 66,-14', fill: stoneA }, g);
      svgEl('rect', { x: -64, y: -38, width: 128, height: 12, rx: 2, fill: stoneRim }, g);
      // 覆莲瓣纹
      for (let dx = -52; dx <= 52; dx += 16) {
        svgEl('path', { d: `M${dx - 6} -26 Q${dx} -36 ${dx + 6} -26`, fill: 'none', stroke: stoneB, 'stroke-width': 1 }, g);
      }
    } else if (stType === 'raw') {
      // 起义豪杰：劈裂乱石基座
      svgEl('polygon', { points: '-76,2 -68,-28 -30,-38 28,-34 72,-22 78,2', fill: stoneB }, g);
    } else {
      // 将军磐石座 / 文人青石座
      svgEl('rect', { x: -68, y: -30, width: 136, height: 32, rx: 6, fill: stoneB }, g);
    }

    // 2. 碑身与碑首规制
    const bodyBase = stType === 'bixi' ? -34 : stType === 'imperial' || stType === 'sage' ? -36 : -28;
    if (stType === 'raw') {
      // 摩崖劈裂剑形原石巨碑
      svgEl('polygon', {
        points: `-52,${bodyBase} -58,-160 -42,-255 -4,-308 32,-268 54,-180 48,${bodyBase}`,
        fill: linear('stone', [[0, stoneA], [1, stoneB]], false),
        stroke: stoneRim, 'stroke-width': 1
      }, g);
      svgEl('path', { d: 'M-42 -255 L-18 -190 M32 -268 L14 -210', stroke: stoneB, 'stroke-width': 1.4, opacity: 0.55 }, g);
    } else if (stType === 'literati') {
      // 文人天然不对称诗碑（微带太湖石弧度）
      svgEl('path', {
        d: `M-44 ${bodyBase} L-46 -235 Q-44 -282 -6 -288 Q38 -284 44 -240 L44 ${bodyBase} Z`,
        fill: linear('stone', [[0, stoneA], [1, stoneB]], false)
      }, g);
      svgEl('rect', { x: -34, y: -234, width: 68, height: 196, fill: 'none', stroke: stoneRim, 'stroke-width': 0.9, opacity: 0.7 }, g);
    } else {
      // 官式端庄矩形碑身
      const bw = stType === 'imperial' ? 100 : 92;
      svgEl('rect', { x: -bw / 2, y: -252, width: bw, height: 252 + bodyBase, fill: linear('stone', [[0, stoneA], [1, stoneB]], false) }, g);
      svgEl('rect', { x: -bw / 2 + 9, y: -240, width: bw - 18, height: 200, fill: 'none', stroke: stoneRim, 'stroke-width': 1 }, g);

      if (stType === 'imperial' || stType === 'bixi') {
        // 双龙盘顶螭首
        const cw = bw / 2 + 8;
        svgEl('path', { d: `M-${cw} -246 Q-${cw} -304 0 -306 Q${cw} -304 ${cw} -246 Z`, fill: stoneB, stroke: stoneRim, 'stroke-width': 1 }, g);
        // 盘龙浮雕纹与篆额圭牌
        svgEl('path', { d: 'M-42 -256 C-46 -284 -18 -296 -6 -282 M42 -256 C46 -284 18 -296 6 -282', stroke: stoneRim, 'stroke-width': 2.2, fill: 'none' }, g);
        svgEl('rect', { x: -16, y: -288, width: 32, height: 28, rx: 3, fill: stoneA, stroke: gold, 'stroke-width': 0.9 }, g);
        const sealHead = svgEl('text', { x: 0, y: -269, 'font-size': 12, 'text-anchor': 'middle', fill: gold, 'font-family': 'var(--f-kai)' }, g);
        sealHead.textContent = stType === 'imperial' ? '圣旨' : '敕建';
      } else if (stType === 'sage') {
        // 圭首（尖拱篆额）
        svgEl('polygon', { points: '-50,-248 -50,-272 0,-304 50,-272 50,-248', fill: stoneB, stroke: stoneRim, 'stroke-width': 1 }, g);
        svgEl('circle', { cx: 0, cy: -274, r: 12, fill: 'none', stroke: gold, 'stroke-width': 0.8, opacity: 0.7 }, g);
      } else {
        // 武将圆首虎额碑
        svgEl('path', { d: 'M-52 -246 Q-52 -296 0 -298 Q52 -296 52 -246 Z', fill: stoneB }, g);
        svgEl('path', { d: 'M-30 -262 q10 -16 22 -4 q8 -14 20 0 q10 -10 18 4', stroke: stoneRim, 'stroke-width': 1.5, fill: 'none' }, g);
      }
    }

    // 3. 碑文镌刻
    const chars = [...fig.epitaph];
    const fs = Math.min(28, 182 / chars.length);
    chars.forEach((ch, i) => {
      const t = svgEl('text', { x: 0, y: -226 + fs * (i + 0.85), 'font-size': fs, 'text-anchor': 'middle', fill: gold, 'font-family': 'var(--f-kai)' }, g);
      t.textContent = ch;
    });
    const hint = svgEl('text', { class: 'stele-hint', x: 82, y: -240, 'font-size': 13, fill: night ? '#efe5d0' : '#2a241d', style: 'writing-mode: vertical-rl' }, g);
    hint.textContent = '轻触碑石 · 穿越千年';
    g.addEventListener('click', (e) => {
      inkTravel({ x: e.clientX, y: e.clientY, text: '穿越千年' }, () => (location.hash = `#/talk/${fig.id}`));
    });
    return g;
  }

  function drawAltarTable(x, y) {
    const g = svgEl('g', { class: 'altar-table' }, svg);
    const topC = night ? '#484a52' : '#7b7468';
    const frontC = night ? '#32343b' : '#585248';
    const legC = night ? '#26282e' : '#433e36';
    const runner = '#932c26';
    // 桌影
    svgEl('ellipse', { cx: x, cy: y + 36, rx: 175, ry: 10, fill: '#000', opacity: 0.35, filter: 'url(#ink-blur)' }, g);
    // 案足（内收如意云头腿）
    svgEl('path', { d: `M${x - 142} ${y + 8} L${x - 126} ${y + 8} L${x - 122} ${y + 36} L${x - 148} ${y + 36} Z`, fill: legC }, g);
    svgEl('path', { d: `M${x + 142} ${y + 8} L${x + 126} ${y + 8} L${x + 122} ${y + 36} L${x + 148} ${y + 36} Z`, fill: legC }, g);
    // 牙板横枨
    svgEl('path', { d: `M${x - 130} ${y + 10} L${x + 130} ${y + 10} L${x + 124} ${y + 20} Q${x} ${y + 14} ${x - 124} ${y + 20} Z`, fill: frontC }, g);
    // 案面（梯形透视）
    svgEl('polygon', { points: `${x - 154},${y - 9} ${x + 154},${y - 9} ${x + 170},${y + 2} ${x - 170},${y + 2}`, fill: topC, stroke: 'rgba(0,0,0,.28)', 'stroke-width': 0.8 }, g);
    // 案沿厚度
    svgEl('rect', { x: x - 170, y: y + 2, width: 340, height: 8, rx: 1, fill: frontC }, g);
    // 朱色桌旗（居中垂下）
    svgEl('polygon', { points: `${x - 32},${y - 9} ${x + 32},${y - 9} ${x + 36},${y + 2} ${x - 36},${y + 2}`, fill: runner, opacity: 0.85 }, g);
    svgEl('path', { d: `M${x - 36} ${y + 2} L${x + 36} ${y + 2} L${x + 32} ${y + 25} L${x} ${y + 31} L${x - 32} ${y + 25} Z`, fill: runner, stroke: '#d9b45a', 'stroke-width': 0.8 }, g);
    const sealT = svgEl('text', { x, y: y + 20, 'font-size': 12, 'text-anchor': 'middle', fill: '#e8d5a7', 'font-family': 'var(--f-kai)', opacity: 0.9 }, g);
    sealT.textContent = '敬奉';
  }

  function drawBurner(x, y) {
    const g = svgEl('g', {}, svg);
    const bronze = night ? '#4b4536' : '#5a4f3a';
    const sticks = svgEl('g', { opacity: 0, style: 'transition: opacity 1.2s' }, g);
    [-9, 0, 9].forEach((dx, i) => {
      svgEl('line', { x1: x + dx, y1: y - 14, x2: x + dx * 1.3, y2: y - 56, stroke: '#a3523a', 'stroke-width': 1.6 }, sticks);
      svgEl('circle', { class: 'incense-tip', cx: x + dx * 1.3, cy: y - 56, r: 1.8, style: `animation-delay:${i * 0.4}s` }, sticks);
      const sm = svgEl('g', { class: 'incense-smoke' }, sticks);
      svgEl('path', { d: `M${x + dx * 1.3} ${y - 58} c-8 -20 10 -34 0 -56 s-12 -36 4 -60`, style: `animation-delay:${i * 1.2}s` }, sm);
    });
    svgEl('path', { d: `M${x - 26} ${y - 16} L${x + 26} ${y - 16} L${x + 20} ${y + 6} L${x - 20} ${y + 6}Z`, fill: bronze }, g);
    svgEl('rect', { x: x - 30, y: y - 20, width: 60, height: 6, rx: 2, fill: mix(bronze, '#000', 0.2) }, g);
    [-15, 15].forEach((dx) => svgEl('line', { x1: x + dx, y1: y + 6, x2: x + dx * 1.15, y2: y + 16, stroke: bronze, 'stroke-width': 3 }, g));
    [-22, 22].forEach((dx) => svgEl('path', { d: `M${x + dx} ${y - 20} q${dx > 0 ? 6 : -6} -10 0 -14`, stroke: bronze, 'stroke-width': 3, fill: 'none' }, g));
    return { light: () => (sticks.style.opacity = 1) };
  }

  function drawWater() {
    const wy = GROUND + 46;
    svgEl('rect', { x: 0, y: wy, width: VB_W, height: VB_H - wy, fill: linear('water', [[0, '#7d948f', 0.85], [1, '#3f5552', 0.95]]) }, svg);
    for (let i = 0; i < 7; i++) {
      const y = wy + 12 + i * 15;
      let d = `M-40 ${y}`;
      for (let x = -40; x < VB_W + 40; x += 60) d += ` q15 -${4 + i} 30 0 t30 0`;
      svgEl('path', { class: 'wave', d, stroke: '#dfe8e4', 'stroke-width': 1, fill: 'none', opacity: 0.35 - i * 0.03, style: `animation-duration:${6 + i}s` }, svg);
    }
    drawBoat(330, wy + 50, 1.1, 0.8);
  }

  function drawBoat(x, y, s, op) {
    const g = svgEl('g', { class: 'mist', transform: `translate(${x} ${y}) scale(${s})`, opacity: op }, svg);
    svgEl('path', { d: 'M-46 0 Q0 14 46 0 L38 8 Q0 18 -38 8Z', fill: INK }, g);
    svgEl('path', { d: 'M4 -2 L4 -22 M4 -22 L-6 -2', stroke: INK, 'stroke-width': 1.5, fill: 'none' }, g);
    svgEl('path', { d: 'M-14 -2 l3 -12 l4 0 l2 12', fill: INK }, g);
    svgEl('path', { d: 'M-18 -14 l18 0 l-9 -6z', fill: INK }, g);
  }
  function drawHut(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y})`, opacity: 0.75 }, svg);
    svgEl('rect', { x: -26, y: -24, width: 52, height: 24, fill: mix(INK, sky1, 0.35) }, g);
    svgEl('path', { d: 'M-40 -22 Q0 -58 40 -22 Q0 -30 -40 -22Z', fill: mix('#8a6d45', INK, 0.4) }, g);
    svgEl('rect', { x: -6, y: -16, width: 12, height: 16, fill: '#e8c88a', opacity: 0.7 }, g);
  }
  function drawWine(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y})` }, svg);
    svgEl('path', { d: 'M-14 0 Q-24 -22 -12 -36 L-8 -42 L8 -42 L12 -36 Q24 -22 14 0Z', fill: night ? '#3b2f28' : '#5b3f2b' }, g);
    svgEl('rect', { x: -9, y: -48, width: 18, height: 7, rx: 2, fill: '#a8322d' }, g);
    svgEl('path', { d: 'M24 0 l3 -9 h10 l3 9z', fill: night ? '#5a5a5a' : '#7b746a' }, g);
  }
  function drawFlag(x, y) {
    const g = svgEl('g', {}, svg);
    svgEl('line', { x1: x, y1: y, x2: x, y2: y - 270, stroke: INK, 'stroke-width': 4 }, g);
    const f = svgEl('g', { style: `transform-origin:${x}px ${y - 262}px; animation: sway 4s ease-in-out infinite alternate; --amp: 3deg; transform-box: view-box;` }, g);
    svgEl('path', { d: `M${x} ${y - 262} L${x + 82} ${y - 258} L${x + 78} ${y - 150} L${x + 66} ${y - 160} L${x + 54} ${y - 146} L${x + 40} ${y - 158} L${x + 26} ${y - 144} L${x} ${y - 154}Z`, fill: '#9e2b25', opacity: 0.92 }, f);
    const flagChar = fig.id === 'chengjisihan' ? '汗' : fig.id === 'qinshihuang' ? '秦' : fig.id === 'hanwudi' ? '汉' : fig.id === 'lishimin' ? '唐' : fig.name[0];
    const t = svgEl('text', { x: x + 40, y: y - 186, 'font-size': 44, 'text-anchor': 'middle', fill: '#f2e6cf', 'font-family': 'var(--f-brush)' }, f);
    t.textContent = flagChar;
  }
  function drawCauldron(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y})` }, svg);
    const c = night ? '#3c4842' : '#4a5a50';
    svgEl('line', { x1: -18, y1: -18, x2: -22, y2: 2, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    svgEl('line', { x1: 0, y1: -16, x2: 0, y2: 3, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    svgEl('line', { x1: 18, y1: -18, x2: 22, y2: 2, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    svgEl('path', { d: 'M-28 -44 L28 -44 L24 -16 Q0 -10 -24 -16 Z', fill: c }, g);
    svgEl('rect', { x: -32, y: -48, width: 64, height: 5, rx: 1.5, fill: mix(c, '#000', 0.25) }, g);
    svgEl('path', { d: 'M-26 -48 L-26 -58 L-16 -58 L-16 -48 M26 -48 L26 -58 L16 -58 L16 -48', stroke: c, 'stroke-width': 3, fill: 'none' }, g);
    svgEl('line', { x1: -18, y1: -31, x2: 18, y2: -31, stroke: '#b8a472', 'stroke-width': 1.2, opacity: 0.65 }, g);
  }
  function drawSword(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(14)` }, svg);
    svgEl('path', { d: 'M-3 0 L0 10 L3 0 L4 -68 L-4 -68 Z', fill: night ? '#6f7782' : '#525861' }, g);
    svgEl('line', { x1: 0, y1: 4, x2: 0, y2: -66, stroke: '#c8d0d8', 'stroke-width': 0.9, opacity: 0.7 }, g);
    svgEl('rect', { x: -14, y: -72, width: 28, height: 5, rx: 2, fill: '#b5924c' }, g);
    svgEl('rect', { x: -3, y: -92, width: 6, height: 20, rx: 1, fill: '#6e2b25' }, g);
    svgEl('circle', { cx: 0, cy: -94, r: 5, fill: '#b5924c' }, g);
    svgEl('path', { d: 'M0 -94 C8 -84 14 -68 10 -52', stroke: '#9e2b25', 'stroke-width': 1.8, fill: 'none', opacity: 0.85 }, g);
  }
  function drawCompass(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y})` }, svg);
    const c = night ? '#5e5542' : '#6b5c43';
    svgEl('rect', { x: -24, y: -6, width: 48, height: 6, rx: 2, fill: c }, g);
    svgEl('line', { x1: 0, y1: -6, x2: 0, y2: -36, stroke: c, 'stroke-width': 4 }, g);
    svgEl('circle', { cx: 0, cy: -38, r: 22, fill: 'none', stroke: c, 'stroke-width': 2.5 }, g);
    svgEl('ellipse', { cx: 0, cy: -38, rx: 22, ry: 9, transform: 'rotate(-28 0 -38)', fill: 'none', stroke: '#b89b5e', 'stroke-width': 1.6 }, g);
    svgEl('line', { x1: -24, y1: -50, x2: 24, y2: -26, stroke: '#d4b675', 'stroke-width': 1.6 }, g);
    svgEl('circle', { cx: 0, cy: -38, r: 3, fill: '#b89b5e' }, g);
  }
  function drawGourd(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(-10)` }, svg);
    const c = '#b88946';
    svgEl('circle', { cx: 0, cy: -14, r: 15, fill: c }, g);
    svgEl('circle', { cx: 0, cy: -35, r: 10, fill: '#c49652' }, g);
    svgEl('path', { d: 'M0 -45 Q3 -53 8 -55', stroke: '#5c4628', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, g);
    svgEl('path', { d: 'M-9 -24 Q0 -21 9 -24', stroke: '#9e2b25', 'stroke-width': 2.4, fill: 'none' }, g);
  }
  function drawSlips(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y})` }, svg);
    for (let i = 0; i < 7; i++) {
      svgEl('rect', { x: -24 + i * 7, y: -22, width: 5.5, height: 22, rx: 1, fill: i % 2 ? '#b89860' : '#a88950' }, g);
    }
    svgEl('line', { x1: -24, y1: -16, x2: 24, y2: -16, stroke: '#5c4228', 'stroke-width': 1.2 }, g);
    svgEl('line', { x1: -24, y1: -6, x2: 24, y2: -6, stroke: '#5c4228', 'stroke-width': 1.2 }, g);
  }
  function drawPipa(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(18)` }, svg);
    svgEl('path', { d: 'M0 -58 L-3 -32 Q-18 -20 -16 -4 Q-14 4 0 4 Q14 4 16 -4 Q18 -20 3 -32 Z', fill: '#7a4b2a' }, g);
    svgEl('path', { d: 'M-2 -58 L0 -68 L4 -64 L2 -58 Z', fill: '#4f301a' }, g);
    [-1.5, 0, 1.5].forEach((dx) => svgEl('line', { x1: dx, y1: -56, x2: dx, y2: -4, stroke: '#e6d8be', 'stroke-width': 0.6, opacity: 0.75 }, g));
  }
  function drawFan(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(12)` }, svg);
    svgEl('path', { d: 'M0 0 L-26 -24 A34 34 0 0 1 26 -24 Z', fill: '#ebe1cc', stroke: '#6e5b43', 'stroke-width': 1 }, g);
    for (let i = -3; i <= 3; i++) {
      const a = (i * 14 - 90) * (Math.PI / 180);
      svgEl('line', { x1: 0, y1: 0, x2: Math.cos(a) * 32, y2: Math.sin(a) * 32, stroke: '#7a664c', 'stroke-width': 0.7, opacity: 0.6 }, g);
    }
  }
  function drawHat(x, y) {
    const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(-14)` }, svg);
    svgEl('ellipse', { cx: 0, cy: 0, rx: 30, ry: 6, fill: '#a58a55' }, g);
    svgEl('path', { d: 'M-22 -2 L0 -22 L22 -2Z', fill: '#b59a62' }, g);
    for (let i = -2; i <= 2; i++) svgEl('line', { x1: 0, y1: -22, x2: i * 10, y2: -2, stroke: '#7c6640', 'stroke-width': 0.7 }, g);
  }
  function drawGoose(x, y, dir) {
    const g = svgEl('g', { transform: `translate(${x} ${y}) scale(${dir} ${Math.abs(dir)})` }, svg);
    svgEl('ellipse', { cx: 0, cy: 0, rx: 22, ry: 12, fill: '#f4f0e6' }, g);
    svgEl('path', { d: 'M14 -4 Q24 -14 18 -30 Q16 -38 24 -38', stroke: '#f4f0e6', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
    svgEl('path', { d: 'M26 -40 l10 3 l-10 3z', fill: '#e08a2c' }, g);
    svgEl('circle', { cx: 24, cy: -39, r: 1.2, fill: '#222' }, g);
    svgEl('path', { d: 'M-18 -2 q10 -6 22 0', stroke: '#cfc8b8', 'stroke-width': 1.2, fill: 'none' }, g);
  }
  function drawChrys(x, y) {
    const g = svgEl('g', {}, svg);
    for (let i = 0; i < 4; i++) {
      const fx = x + r(-18, 18), fy = y - r(16, 38);
      svgEl('path', { d: `M${x + r(-4, 4)} ${y} Q${fx} ${y - 10} ${fx} ${fy}`, stroke: '#4d6a3a', 'stroke-width': 1.2, fill: 'none' }, g);
      for (let p = 0; p < 12; p++) {
        const a = (p / 12) * Math.PI * 2;
        svgEl('line', { x1: fx, y1: fy, x2: fx + Math.cos(a) * 6, y2: fy + Math.sin(a) * 6, stroke: '#e3b23c', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
      }
      svgEl('circle', { cx: fx, cy: fy, r: 2, fill: '#c98b1f' }, g);
    }
  }

  // ======== 缅怀卡 & 供桌供品 ========
  let cards = [];
  let offerings = [];
  let incenseCount = 0;
  let lit = false;
  const countEl = view.querySelector('.tomb-count');
  const updateCount = () => {
    const parts = [`缅怀卡 ${cards.length} 张`, `供品 ${offerings.length} 件`];
    if (incenseCount) parts.push(`香火 ${incenseCount} 炷`);
    countEl.textContent = parts.join(' · ');
  };

  // 供桌上的 8 个摆放席位（避开中间香炉）
  const TABLE_SLOTS = [
    { x: TX - 58, y: TABLE_Y - 1 },
    { x: TX + 58, y: TABLE_Y - 1 },
    { x: TX - 102, y: TABLE_Y - 2 },
    { x: TX + 102, y: TABLE_Y - 2 },
    { x: TX - 144, y: TABLE_Y - 1 },
    { x: TX + 144, y: TABLE_Y - 1 },
    { x: TX - 80, y: TABLE_Y - 6 },
    { x: TX + 80, y: TABLE_Y - 6 },
  ];

  function renderOfferings(newId) {
    offeringLayer.innerHTML = '';
    const show = offerings.slice(-TABLE_SLOTS.length);
    show.forEach((off, i) => {
      const def = OFFERING_MAP[off.itemId];
      if (!def) return;
      const slot = TABLE_SLOTS[i % TABLE_SLOTS.length];
      const g = svgEl('g', {
        class: 'offering-item' + (off.id === newId ? ' new' : ''),
        transform: `translate(${slot.x} ${slot.y})`,
      }, offeringLayer);
      const inner = svgEl('g', { class: 'off-inner' }, g);
      inner.innerHTML = def.svg;
      const title = svgEl('title', {}, g);
      title.textContent = `${def.name}（${off.name} 敬奉）`;
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        showOffering(off);
      });
    });
  }

  function showOffering(off) {
    const def = OFFERING_MAP[off.itemId] || OFFERINGS[0];
    openModal(`
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:14px">
        <svg viewBox="-26 -54 52 56" style="width:68px;height:68px;background:rgba(31,28,24,.05);border-radius:50%;padding:6px;flex:none">${def.svg}</svg>
        <div>
          <div class="letter-to">供桌敬奉 · ${esc(def.name)}</div>
          <div style="font-size:12px;color:var(--ink-3);margin-top:4px;font-family:var(--f-kai)">${esc(def.sub)}</div>
        </div>
      </div>
      <div class="letter-body" style="margin:14px 0 22px;font-size:20px">${esc(off.note)}</div>
      <div class="letter-foot">
        <div>—— ${esc(off.name)} 敬奉于 ${esc(fig.name)} 墓前<br/><small style="color:var(--ink-3);font-size:12px">${fmtDate(off.ts)}</small></div>
        <span class="seal">奉</span>
      </div>`, { className: 'c-xing' });
  }

  function openOfferingForm() {
    let curCat = 'ancient';
    let picked = OFFERINGS[0].id;
    const { modal, close } = openModal(`
      <h3>摆上供品</h3>
      <p class="sub">致 ${esc(fig.name)} · 古风雅物或今世美食皆可奉于案前</p>
      <div class="off-tabs">
        ${OFFERING_CATS.map((c) => `<button type="button" data-cat="${c.id}" class="${c.id === curCat ? 'on' : ''}">${c.name}</button>`).join('')}
      </div>
      <div class="off-grid"></div>
      <div class="off-sub"></div>
      <form class="form" style="margin-top:12px;gap:14px">
        <label>敬奉附言<input name="note" maxlength="80" placeholder="请先生品尝后世风物……" /></label>
        <label>署名<input name="name" maxlength="16" placeholder="无名氏" /></label>
        <button class="btn zhu" type="submit" style="justify-content:center">摆上供桌</button>
      </form>`);
    const grid = modal.querySelector('.off-grid');
    const subEl = modal.querySelector('.off-sub');
    const form = modal.querySelector('form');

    function renderGrid() {
      const items = OFFERINGS.filter((o) => o.cat === curCat);
      if (!items.some((o) => o.id === picked)) picked = items[0].id;
      grid.innerHTML = items.map((o) => `
        <button type="button" class="off-card ${o.id === picked ? 'on' : ''}" data-id="${o.id}">
          <svg viewBox="-26 -54 52 56">${o.svg}</svg>
          <span>${esc(o.name)}</span>
        </button>`).join('');
      const cur = OFFERING_MAP[picked];
      subEl.textContent = cur ? `「${cur.name}」${cur.sub}` : '';
      grid.querySelectorAll('.off-card').forEach((b) => {
        b.onclick = () => { picked = b.dataset.id; renderGrid(); };
      });
    }
    modal.querySelectorAll('.off-tabs button').forEach((b) => {
      b.onclick = () => {
        curCat = b.dataset.cat;
        modal.querySelectorAll('.off-tabs button').forEach((x) => x.classList.toggle('on', x === b));
        renderGrid();
      };
    });
    renderGrid();

    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = '正在奉上……';
      try {
        const { offering } = await api.addOffering({
          figureId: fig.id,
          itemId: picked,
          name: form.name.value,
          note: form.note.value,
        });
        offerings.push(offering);
        close();
        renderOfferings(offering.id);
        updateCount();
      } catch (err) {
        btn.disabled = false; btn.textContent = err.message || '奉上失败';
      }
    };
  }

  function renderTags(newId) {
    cardLayer.innerHTML = '';
    const show = cards.slice(-hangs.length);
    show.forEach((c, i) => addTag(c, hangs[i % hangs.length], c.id === newId));
  }
  function addTag(card, pt, isNew) {
    const col = CARD_COLORS[card.color] || CARD_COLORS.zhu;
    const Rc = rng(card.id);
    const len = 14 + Rc() * 26;
    const g = svgEl('g', { class: 'card-tag' + (isNew ? ' new' : ''), style: `--delay:${(-Rc() * 5).toFixed(2)}s; --dur:${(3.5 + Rc() * 3).toFixed(2)}s; --amp:${(3 + Rc() * 5).toFixed(1)}deg` }, cardLayer);
    const s = svgEl('g', { class: 'sway', style: `transform-origin:${pt.x}px ${pt.y}px` }, g);
    svgEl('line', { x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y + len, stroke: night ? '#d9c08a' : '#a8322d', 'stroke-width': 0.9, opacity: 0.85 }, s);
    const body = svgEl('g', { class: 'tag-body' }, s);
    svgEl('rect', { x: pt.x - 10, y: pt.y + len, width: 20, height: 46, rx: 2, fill: col.fill, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 0.6 }, body);
    svgEl('circle', { cx: pt.x, cy: pt.y + len + 5, r: 1.6, fill: 'rgba(0,0,0,.35)' }, body);
    const label = [...card.text.replace(/[\s，。！？、,.!?：:；;“”"'（）()…—-]/g, '')].slice(0, 2);
    label.forEach((ch, i) => {
      const t = svgEl('text', { x: pt.x, y: pt.y + len + 22 + i * 13, 'font-size': 11, 'text-anchor': 'middle', fill: col.text, 'font-family': 'var(--f-kai)' }, body);
      t.textContent = ch;
    });
    svgEl('line', { x1: pt.x, y1: pt.y + len + 46, x2: pt.x, y2: pt.y + len + 58, stroke: col.fill, 'stroke-width': 1.4, opacity: 0.8 }, body);
    g.addEventListener('click', (e) => { e.stopPropagation(); showCard(card); });
  }

  function showCard(card) {
    openModal(`
      <div class="letter-to">致 ${esc(fig.name)}：</div>
      <div class="letter-body">${esc(card.text)}</div>
      <div class="letter-foot">
        <div>—— ${esc(card.name)}<br/><small style="color:var(--ink-3);font-size:12px">${fmtDate(card.ts)} · 挂于${esc(sc.tree.name)}</small></div>
        <span class="seal">敬</span>
      </div>`, { className: `c-${card.color}` });
  }

  function showAll() {
    if (!cards.length && !offerings.length) return openCardForm();
    const offList = [...offerings].reverse().map((o) => {
      const def = OFFERING_MAP[o.itemId] || OFFERINGS[0];
      return `
      <button class="all-off" data-id="${o.id}" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 0;border-bottom:1px dashed rgba(31,28,24,.18)">
        <svg viewBox="-26 -54 52 56" style="width:28px;height:28px;flex:none">${def.svg}</svg>
        <span style="font-family:var(--f-kai);font-size:15px;flex:1"><b>${esc(def.name)}</b> · ${esc(o.note.length > 22 ? o.note.slice(0, 22) + '…' : o.note)}</span>
        <small style="color:var(--ink-3);font-size:12px">${esc(o.name)}</small>
      </button>`;
    }).join('');
    const cardList = [...cards].reverse().map((c) => `
      <button class="all-item" data-id="${c.id}" style="display:block;width:100%;text-align:left;padding:12px 0;border-bottom:1px dashed rgba(31,28,24,.18)">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${(CARD_COLORS[c.color] || CARD_COLORS.zhu).fill};margin-right:8px"></span>
        <span style="font-family:var(--f-kai);font-size:16px">${esc(c.text.length > 30 ? c.text.slice(0, 30) + '…' : c.text)}</span>
        <small style="float:right;color:var(--ink-3);font-size:12px">${esc(c.name)}</small>
      </button>`).join('');
    const { modal, close } = openModal(`
      <h3>敬奉与寄语</h3>
      <p class="sub">供品 ${offerings.length} 件 · 缅怀卡 ${cards.length} 张</p>
      <div style="margin-top:16px;max-height:54vh;overflow:auto">
        ${offList ? `<div style="font-family:var(--f-kai);font-size:12px;color:var(--zhu);letter-spacing:.2em;margin:4px 0 6px">【案前供品】</div>${offList}` : ''}
        ${cardList ? `<div style="font-family:var(--f-kai);font-size:12px;color:var(--zhu);letter-spacing:.2em;margin:14px 0 6px">【枝头寄语】</div>${cardList}` : ''}
      </div>`);
    modal.querySelectorAll('.all-item').forEach((b) => (b.onclick = () => { close(); setTimeout(() => showCard(cards.find((c) => c.id === b.dataset.id)), 260); }));
    modal.querySelectorAll('.all-off').forEach((b) => (b.onclick = () => { close(); setTimeout(() => showOffering(offerings.find((o) => o.id === b.dataset.id)), 260); }));
  }

  function openCardForm() {
    let color = 'zhu';
    const { modal, close } = openModal(`
      <h3>寄一纸思念</h3>
      <p class="sub">致 ${esc(fig.name)} · 将挂于墓旁${esc(sc.tree.name)}</p>
      <form class="form">
        <label>寄语<textarea name="text" maxlength="140" placeholder="想对${esc(fig.name)}说些什么……" required></textarea></label>
        <label>署名<input name="name" maxlength="16" placeholder="无名氏" /></label>
        <div class="form-foot">
          <div class="swatches">${Object.entries(CARD_COLORS).map(([k, v]) => `<button type="button" data-c="${k}" title="${v.name}" style="background:${v.fill}" class="${k === 'zhu' ? 'on' : ''}"></button>`).join('')}</div>
          <span class="counter">0 / 140</span>
        </div>
        <button class="btn zhu" type="submit" style="justify-content:center">挂上枝头</button>
      </form>`);
    const form = modal.querySelector('form');
    const ta = form.text;
    setTimeout(() => ta.focus(), 100);
    ta.addEventListener('input', () => (modal.querySelector('.counter').textContent = `${ta.value.length} / 140`));
    modal.querySelectorAll('.swatches button').forEach((b) => (b.onclick = () => {
      color = b.dataset.c;
      modal.querySelectorAll('.swatches button').forEach((x) => x.classList.toggle('on', x === b));
    }));
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!ta.value.trim()) return ta.focus();
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = '正在挂上……';
      try {
        const { card } = await api.addCard({ figureId: fig.id, name: form.name.value, text: ta.value, color });
        cards.push(card);
        close();
        renderTags(card.id);
        updateCount();
      } catch (err) {
        btn.disabled = false; btn.textContent = err.message || '挂载失败，再试一次';
      }
    };
  }

  view.querySelector('.tomb-actions').addEventListener('click', async (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (act === 'card') openCardForm();
    if (act === 'offering') openOfferingForm();
    if (act === 'all') showAll();
    if (act === 'incense' && !lit) {
      lit = true;
      incense.light();
      e.target.textContent = '香火已续';
      try { incenseCount = (await api.incense(fig.id)).incense; updateCount(); } catch {}
    }
  });

  api.cards(fig.id).then((d) => {
    cards = d.cards || [];
    offerings = d.offerings || [];
    incenseCount = d.incense || 0;
    renderTags();
    renderOfferings();
    updateCount();
  }).catch(() => updateCount());

  return () => stopParticles();
}
