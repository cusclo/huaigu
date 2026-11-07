// 墓园与古迹画卷：水墨远山 + 礼制陵寝/名胜古迹建筑 + 供桌供品 + 古树挂牌 + 触碑穿越
import { svgEl, html, esc, rng, api, openModal, CARD_COLORS, fmtDate } from './util.js';
import { OFFERINGS, OFFERING_CATS, OFFERING_MAP } from './offerings.js';
import { drawTree } from './tree.js';
import { startParticles } from './particles.js';
import { inkTravel } from './transition.js';
import { createKit } from './renderers/ink-kit.js';
import { paintBackdrop, paintArchitecture, paintStele, paintAltar, paintBurner, paintBrazier, paintInscriptionWall } from './renderers/ink-scene.js';
import { renderPortraitHtml } from './core/portraits.js';
import { openArchiveModal } from './core/archives.js';
import { playOfferingSound, playTravelSound } from './core/sound.js';

const VB_W = 1600, VB_H = 900, GROUND = 700, TX = 620, TREE_X = 1110;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const lum = (h) => { const [r, g, b] = hex(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

export function renderTomb(root, fig) {
  const sc = fig.scene;
  const isSite = fig.kind === 'site';
  const night = lum(sc.sky[0]) < 0.35;
  const initialVB = `0 0 ${VB_W} ${VB_H}`;
  const treeLabel = isSite ? '题壁' : (sc.tree?.name || '古树');
  const steleLabel = isSite ? '碑铭' : '墓碑';
  const lbl = (long, short) => `<span class="lbl-long">${long}</span><span class="lbl-short">${short}</span>`;
  const view = html(`
    <section class="view tomb-view ${night ? 'night' : ''}">
      <svg class="tomb-svg" viewBox="${initialVB}" preserveAspectRatio="xMidYMax slice"></svg>
      <canvas class="particles"></canvas>
      <header class="top-bar">
        <a class="back-link" href="#/">舆图</a>
        <nav class="top-links">
          <a class="back-link" href="#/life/${fig.id}">${isSite ? lbl('遗址考据 · 诗文', '考据') : lbl('生平 · 作品', '生平')}</a>
          <a class="talk-link" href="#/talk/${fig.id}" data-go-talk><span class="tl-seal" aria-hidden="true">${isSite ? '响' : '语'}</span>${isSite ? lbl('时空回响', '回响') : lbl('古今对话', '对话')}</a>
        </nav>
      </header>
      <div class="tomb-title">
        <div class="tt-heading">
          ${renderPortraitHtml(fig, 'sm', 'tt-avatar')}
          <h1>${esc(fig.name)}</h1>
        </div>
        <p>${esc(fig.dynasty)} · ${esc(fig.years)} · ${esc(fig.role || '')}</p>
        <p class="tt-tree">${esc(fig.place)} · ${esc(sc.archLabel || '历史胜迹')} · ${isSite ? '胜迹题壁抒怀' : '墓旁' + esc(sc.tree.name)}</p>
      </div>
      <div class="scene-pager" role="group" aria-label="场景取景切换" hidden>
        <button type="button" data-stop="stele" class="on">${steleLabel}</button>
        <i aria-hidden="true"></i>
        <button type="button" data-stop="tree">${esc(treeLabel)}</button>
      </div>
      <div class="tomb-count"></div>
      <div class="tomb-actions">
        <button class="btn ${night ? 'ghost-light' : ''}" data-act="incense">${isSite ? lbl('点燃胜迹烽火', '燃烽火') : lbl('上一炷香', '上香')}</button>
        <button class="btn ${night ? 'ghost-light' : ''}" data-act="offering">${isSite ? lbl('敬献信物金石', '献信物') : lbl('摆上供品', '供品')}</button>
        <button class="btn zhu" data-act="card">${isSite ? lbl('题壁抒怀寄语', '题壁') : lbl('挂一张缅怀卡', '缅怀卡')}</button>
        <button class="btn act-secondary ${night ? 'ghost-light' : ''}" data-act="archive" title="${isSite ? '百年旧影 · 金石考据' : '百年旧影 · 神道石像生'}">百年旧影</button>
        <button class="btn act-secondary ${night ? 'ghost-light' : ''}" data-act="all">${isSite ? '千秋题壁胜迹录' : '名录与寄语'}</button>
        <div class="act-more-wrap">
          <button class="btn act-more ${night ? 'ghost-light' : ''}" data-act="more" aria-haspopup="menu" aria-expanded="false">更多</button>
          <div class="act-more-menu" role="menu" hidden>
            <button type="button" role="menuitem" data-act="archive">📷 ${isSite ? '百年旧影 · 金石考据' : '百年旧影 · 石像生'}</button>
            <button type="button" role="menuitem" data-act="all">${isSite ? '千秋题壁胜迹录' : '名录与寄语'}</button>
          </div>
        </div>
      </div>
    </section>`);
  root.appendChild(view);

  const svg = view.querySelector('svg');

  // ======== 取景：窄屏时碑与树无法同屏，允许左右拖动并在「墓碑 / 古树」两处停驻 ========
  const pager = view.querySelector('.scene-pager');
  const STOPS = { stele: TX, tree: TREE_X };
  let vbW = VB_W, panMode = false, panCx = TX, panRaf = 0;
  const clampCx = (cx) => Math.max(vbW / 2, Math.min(VB_W - vbW / 2, Math.max(TX - 120, Math.min(TREE_X + 60, cx))));
  const applyPan = () => {
    svg.setAttribute('viewBox', panMode ? `${(panCx - vbW / 2).toFixed(1)} 0 ${vbW.toFixed(1)} ${VB_H}` : `0 0 ${VB_W} ${VB_H}`);
    const near = Math.abs(panCx - STOPS.tree) < Math.abs(panCx - STOPS.stele) ? 'tree' : 'stele';
    pager.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.stop === near));
  };
  const panTo = (stop, ms = 520) => {
    if (!panMode) return;
    cancelAnimationFrame(panRaf);
    const from = panCx, to = clampCx(STOPS[stop] ?? stop), t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      panCx = from + (to - from) * e;
      applyPan();
      if (p < 1) panRaf = requestAnimationFrame(step);
    };
    panRaf = requestAnimationFrame(step);
  };
  const updateViewBox = () => {
    const w = svg.clientWidth || window.innerWidth, h = svg.clientHeight || window.innerHeight;
    if (!w || !h) return;
    // preserveAspectRatio=slice + 以高度适配时，可见的 viewBox 宽度
    vbW = Math.min(VB_W, VB_H * (w / h));
    panMode = vbW < (TREE_X + 200) - (TX - 180);
    pager.hidden = !panMode;
    view.classList.toggle('pan-mode', panMode);
    panCx = clampCx(panCx);
    applyPan();
  };
  pager.addEventListener('click', (e) => {
    const stop = e.target.closest('button')?.dataset.stop;
    if (stop) panTo(stop);
  });
  // 拖动平移（仅窄屏取景模式）；拖动后屏蔽误触碑石穿越
  let drag = null, dragMoved = false;
  svg.addEventListener('pointerdown', (e) => {
    if (!panMode || (e.pointerType === 'mouse' && e.button !== 0)) return;
    cancelAnimationFrame(panRaf);
    drag = { x: e.clientX, y: e.clientY, cx: panCx, id: e.pointerId };
    dragMoved = false;
  });
  const onPanMove = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!dragMoved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) dragMoved = true;
    if (!dragMoved) return;
    panCx = clampCx(drag.cx - dx * (vbW / (svg.clientWidth || 1)));
    applyPan();
  };
  const onPanUp = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const startCx = drag.cx;
    drag = null;
    if (dragMoved) {
      // 松手后吸附：滑动超过一成画幅即按方向翻到下一处，否则回到最近的停驻点
      const delta = panCx - startCx;
      const target = Math.abs(delta) > vbW * 0.12
        ? (delta > 0 ? 'tree' : 'stele')
        : (Math.abs(panCx - STOPS.tree) < Math.abs(panCx - STOPS.stele) ? 'tree' : 'stele');
      panTo(target, 380);
      setTimeout(() => (dragMoved = false), 0);
    }
  };
  window.addEventListener('pointermove', onPanMove);
  window.addEventListener('pointerup', onPanUp);
  window.addEventListener('pointercancel', onPanUp);
  svg.addEventListener('click', (e) => {
    if (dragMoved) { e.stopPropagation(); e.preventDefault(); }
  }, true);
  const vbRo = new ResizeObserver(updateViewBox);
  vbRo.observe(svg);
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
  const kit = createKit(svg, defs, { id: fig.id, night, sky1 });
  const sceneCtx = { svg, fig, sc, isSite, VB_W, VB_H, GROUND, TX, TREE_X, night, sky0, sky1 };

  // —— 天光、远山三叠、平野 ——
  paintBackdrop(kit, sceneCtx);
  if (sc.emblem === 'hut') drawHut(250, GROUND - 30);
  if (sc.emblem === 'boat' && sc.tomb !== 'water') drawBoat(330, GROUND - 82, 0.8, 0.55);
  if (sc.tomb === 'water') drawWater();

  // —— 规制建筑（中景，雾锁其基） ——
  paintArchitecture(kit, sceneCtx);

  // —— 古树挂牌（陵寝）/ 碑廊题壁（胜迹） ——
  const treeLayer = svgEl('g', {}, svg);
  const { hangs } = isSite
    ? paintInscriptionWall(kit, treeLayer, fig, TREE_X, GROUND)
    : drawTree(treeLayer, sc.tree, fig.id, TREE_X, GROUND + 4);
  if (!isSite) svgEl('ellipse', { cx: TREE_X, cy: GROUND + 6, rx: 120, ry: 10, fill: '#000', opacity: 0.22, filter: 'url(#ink-blur)' }, treeLayer);

  let stele = null;
  let incense = null;
  const TABLE_Y = GROUND + 22;
  const offeringLayer = svgEl('g', {}, svg);

  // —— 碑石（前景）：先贤为墓碑，胜迹为摩崖残碑 / 御制碑 / 考古界石 ——
  const steleVariant = isSite
    ? (fig.role === '古战场遗址' ? 'battle' : fig.role === '建筑宫殿遗址' ? 'palace' : 'boundary')
    : (sc.steleType || 'literati');
  stele = paintStele(kit, svg, {
    x: TX, base: GROUND, variant: steleVariant,
    chars: [...(isSite ? fig.name : fig.epitaph)],
    hint: isSite ? (steleVariant === 'battle' ? '轻触残碑 · 时空回响' : steleVariant === 'palace' ? '轻触御碑 · 时空回响' : '轻触界石 · 聆听回响') : '轻触碑石 · 穿越千年',
    label: isSite ? `触摸${fig.name}胜迹铭刻，进入时空对话` : `触摸${fig.name}墓碑，进入古今对话`,
  });
  if (isSite) stele.classList.add('site-marker');
  const goTalk = (e) => {
    playTravelSound();
    const r = stele.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    inkTravel({ x, y, text: isSite ? '时空回响 · 凭吊古迹' : '穿越千年' }, () => (location.hash = `#/talk/${fig.id}`));
  };
  stele.addEventListener('click', goTalk);
  stele.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), goTalk(e)));

  if (isSite) {
    paintAltar(kit, svg, TX, TABLE_Y, { runner: false, cls: 'site-exhibit-table' });
    incense = paintBrazier(kit, svg, TX, TABLE_Y);
  } else {
    if (sc.emblem === 'wine') drawWine(TX - 132, GROUND + 2);
    if (sc.emblem === 'flag') drawFlag(TX + 280, GROUND);
    if (sc.emblem === 'cauldron') drawCauldron(TX - 165, GROUND + 4);
    if (sc.emblem === 'sword') drawSword(TX - 132, GROUND + 2);
    if (sc.emblem === 'compass') drawCompass(TX - 155, GROUND + 2);
    if (sc.emblem === 'gourd') drawGourd(TX - 132, GROUND + 2);
    if (sc.emblem === 'slips') drawSlips(TX - 142, GROUND + 4);
    if (sc.emblem === 'pipa') drawPipa(TX - 132, GROUND + 2);
    if (sc.emblem === 'hat') drawHat(TX + 60, GROUND - 2);
    if (sc.emblem === 'fan') drawFan(TX + 62, GROUND - 4);
    paintAltar(kit, svg, TX, TABLE_Y);
    incense = paintBurner(kit, svg, TX, TABLE_Y + 2);
    if (sc.emblem === 'goose') { drawGoose(TX - 250, GROUND + 50, 1); drawGoose(TX - 320, GROUND + 66, -0.85); }
    if (sc.emblem === 'chrys') [[TX - 210, GROUND + 22], [TX + 210, GROUND + 30], [TX - 260, GROUND + 50], [TX + 250, GROUND + 60]].forEach(([x, y]) => drawChrys(x, y));
  }
  // —— 卡片层 ——
  const cardLayer = svgEl('g', {}, svg);

  // 粒子
  const stopParticles = startParticles(view.querySelector('.particles'), sc.particles);

  // ======== 绘制函数 ========
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
          <div class="letter-to">${isSite ? '胜迹敬献' : '供桌敬奉'} · ${esc(def.name)}</div>
          <div style="font-size:12px;color:var(--ink-3);margin-top:4px;font-family:var(--f-kai)">${esc(def.sub)}</div>
        </div>
      </div>
      <div class="letter-body" style="margin:14px 0 22px;font-size:20px">${esc(off.note)}</div>
      <div class="letter-foot">
        <div>—— ${esc(off.name)} ${isSite ? `题奉于 ${esc(fig.name)} 胜迹` : `敬奉于 ${esc(fig.name)} 墓前`}<br/><small style="color:var(--ink-3);font-size:12px">${fmtDate(off.ts)}</small></div>
        <span class="seal">${isSite ? '献' : '奉'}</span>
      </div>`, { className: 'c-xing' });
  }

  function openOfferingForm() {
    let curCat = 'ancient';
    let picked = OFFERINGS[0].id;
    const { modal, close } = openModal(`
      <h3>${isSite ? '敬献信物金石' : '摆上供品'}</h3>
      <p class="sub">${isSite ? `致 ${esc(fig.name)} · 献上文房清供或金石信物凭吊胜迹` : `致 ${esc(fig.name)} · 古风雅物或今世美食皆可奉于案前`}</p>
      <div class="off-tabs">
        ${OFFERING_CATS.map((c) => `<button type="button" data-cat="${c.id}" class="${c.id === curCat ? 'on' : ''}">${c.name}</button>`).join('')}
      </div>
      <div class="off-grid"></div>
      <div class="off-sub"></div>
      <form class="form" style="margin-top:12px;gap:14px">
        <label>${isSite ? '凭吊附言' : '敬奉附言'}<input name="note" maxlength="80" placeholder="${isSite ? '仰千秋胜迹，记后世所思……' : '请先生品尝后世风物……'}" /></label>
        <label>${isSite ? '题款' : '署名'}<input name="name" maxlength="16" placeholder="${isSite ? '怀古游人' : '无名氏'}" /></label>
        <button class="btn zhu" type="submit" style="justify-content:center">${isSite ? '敬献案前' : '摆上供桌'}</button>
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
        playOfferingSound();
        close();
        panTo('stele');
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
      <div class="letter-to">${isSite ? '题于 ' : '致 '}${esc(fig.name)}：</div>
      <div class="letter-body">${esc(card.text)}</div>
      <div class="letter-foot">
        <div>—— ${esc(card.name)}<br/><small style="color:var(--ink-3);font-size:12px">${fmtDate(card.ts)} · ${isSite ? '题留于胜迹屏风' : `挂于${esc(sc.tree.name)}`}</small></div>
        <span class="seal">${isSite ? '留' : '敬'}</span>
      </div>`, { className: `c-${card.color}` });
  }

  function showAll() {
    const offTitle = isSite ? '案前信物' : '案前供品';
    const cardTitle = isSite ? '题壁诗牌' : '枝头寄语';
    const offList = [...offerings].reverse().map((o) => {
      const def = OFFERING_MAP[o.itemId] || OFFERINGS[0];
      return `
      <button type="button" class="ar-row all-off" data-id="${o.id}">
        <svg class="ar-icon" viewBox="-26 -54 52 56" aria-hidden="true">${def.svg}</svg>
        <span class="ar-text"><b>${esc(def.name)}</b> · ${esc(o.note)}</span>
        <small class="ar-by">${esc(o.name)}</small>
      </button>`;
    }).join('');
    const cardList = [...cards].reverse().map((c) => `
      <button type="button" class="ar-row all-item" data-id="${c.id}">
        <i class="ar-swatch" style="background:${(CARD_COLORS[c.color] || CARD_COLORS.zhu).fill}"></i>
        <span class="ar-text">${esc(c.text)}</span>
        <small class="ar-by">${esc(c.name)}</small>
      </button>`).join('');
    const empty = !cards.length && !offerings.length;
    const { modal, close } = openModal(`
      <h3>${isSite ? '千秋题壁与胜迹留存' : '敬奉与寄语'}</h3>
      <p class="sub">${isSite ? `信物 ${offerings.length} 件 · 题壁诗牌 ${cards.length} 首` : `供品 ${offerings.length} 件 · 缅怀卡 ${cards.length} 张`}</p>
      ${empty ? `
        <div class="ar-empty">
          <div class="seal">${isSite ? '留白' : '虚席'}</div>
          <p>${isSite ? '胜迹题壁尚无人留墨。' : '案前尚空，枝头未挂一纸。'}<br/><small>做第一位${isSite ? '题壁' : '寄语'}的后来人吧。</small></p>
          <div class="ar-empty-actions">
            <button type="button" class="btn zhu" data-empty="card">${isSite ? '题壁抒怀' : '挂一张缅怀卡'}</button>
            <button type="button" class="btn" data-empty="offering">${isSite ? '敬献信物' : '摆上供品'}</button>
          </div>
        </div>` : `
        <div class="ar-list">
          ${offList ? `<div class="ar-section">【${offTitle}】</div>${offList}` : ''}
          ${cardList ? `<div class="ar-section">【${cardTitle}】</div>${cardList}` : ''}
        </div>`}`, { className: 'all-records' });
    const after = (fn) => { close(); setTimeout(fn, 260); };
    modal.querySelectorAll('.all-item').forEach((b) => (b.onclick = () => after(() => showCard(cards.find((c) => c.id === b.dataset.id)))));
    modal.querySelectorAll('.all-off').forEach((b) => (b.onclick = () => after(() => showOffering(offerings.find((o) => o.id === b.dataset.id)))));
    modal.querySelector('[data-empty="card"]')?.addEventListener('click', () => after(openCardForm));
    modal.querySelector('[data-empty="offering"]')?.addEventListener('click', () => after(openOfferingForm));
  }

  function openCardForm() {
    let color = 'zhu';
    const { modal, close } = openModal(`
      <h3>${isSite ? '题壁抒怀寄语' : '寄一纸思念'}</h3>
      <p class="sub">${isSite ? `题于 ${esc(fig.name)} · 诗牌将悬于胜迹题壁屏风` : `致 ${esc(fig.name)} · 将挂于墓旁${esc(sc.tree.name)}`}</p>
      <form class="form">
        <label>${isSite ? '题壁诗词 / 凭吊感怀' : '寄语'}<textarea name="text" maxlength="140" placeholder="${isSite ? `登临${esc(fig.name)}，怀古感赋……` : `想对${esc(fig.name)}说些什么……`}" required></textarea></label>
        <label>${isSite ? '题款署名' : '署名'}<input name="name" maxlength="16" placeholder="${isSite ? '江南过客' : '无名氏'}" /></label>
        <div class="form-foot">
          <div class="swatches">${Object.entries(CARD_COLORS).map(([k, v]) => `<button type="button" data-c="${k}" title="${v.name}" style="background:${v.fill}" class="${k === 'zhu' ? 'on' : ''}"></button>`).join('')}</div>
          <span class="counter">0 / 140</span>
        </div>
        <button class="btn zhu" type="submit" style="justify-content:center">${isSite ? '题上诗壁' : '挂上枝头'}</button>
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
      btn.disabled = true; btn.textContent = isSite ? '正在题壁……' : '正在挂上……';
      try {
        const { card } = await api.addCard({ figureId: fig.id, name: form.name.value, text: ta.value, color });
        cards.push(card);
        playOfferingSound();
        close();
        panTo('tree');
        renderTags(card.id);
        updateCount();
      } catch (err) {
        btn.disabled = false; btn.textContent = err.message || (isSite ? '题留失败，再试一次' : '挂载失败，再试一次');
      }
    };
  }

  // 上香按日计：同一浏览器同一天对同一位只计一次，避免刷新刷高香火
  const litKey = `huaigu_lit_${fig.id}`;
  const today = new Date().toDateString();
  const markLitToday = () => { try { localStorage.setItem(litKey, today); } catch {} };
  const incenseBtn = view.querySelector('[data-act="incense"]');
  const setIncenseBtn = () => {
    incenseBtn.innerHTML = isSite ? lbl('今日烽火已燃', '已燃') : lbl('今日已敬香', '已敬香');
    incenseBtn.classList.add('done');
  };
  try {
    if (localStorage.getItem(litKey) === today) {
      lit = true;
      setIncenseBtn();
      setTimeout(() => incense?.light(), 400);
    }
  } catch {}
  let flashTimer = 0;
  const flashCount = (text) => {
    clearTimeout(flashTimer);
    countEl.textContent = text;
    countEl.classList.add('flash');
    flashTimer = setTimeout(() => { countEl.classList.remove('flash'); updateCount(); }, 2200);
  };

  // 顶栏「古今对话」入口：与轻触碑石一致的墨滴转场
  view.querySelector('[data-go-talk]').addEventListener('click', (e) => {
    e.preventDefault();
    playTravelSound();
    inkTravel({ x: e.clientX, y: e.clientY, text: isSite ? '时空回响' : '穿越千年' }, () => (location.hash = `#/talk/${fig.id}`));
  });

  // 「更多」菜单（窄屏下收纳次要操作）
  const moreBtn = view.querySelector('.act-more');
  const moreMenu = view.querySelector('.act-more-menu');
  const setMenu = (open) => {
    moreMenu.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
    if (open) moreMenu.querySelector('button')?.focus();
  };
  const onDocDown = (e) => { if (!moreMenu.hidden && !e.target.closest('.act-more-wrap')) setMenu(false); };
  const onDocKey = (e) => { if (e.key === 'Escape' && !moreMenu.hidden) { setMenu(false); moreBtn.focus(); } };
  document.addEventListener('pointerdown', onDocDown);
  document.addEventListener('keydown', onDocKey);

  view.querySelector('.tomb-actions').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const act = btn?.dataset.act;
    if (!act) return;
    if (act === 'more') return setMenu(moreMenu.hidden);
    setMenu(false);
    if (act === 'card') openCardForm();
    if (act === 'offering') openOfferingForm();
    if (act === 'all') showAll();
    if (act === 'archive') openArchiveModal(fig);
    if (act === 'incense') {
      if (lit) return flashCount(isSite ? '今日烽火已燃，明日再来续火' : '今日已敬香，心意已达，明日再来');
      lit = true;
      markLitToday();
      panTo('stele');
      incense?.light();
      setIncenseBtn();
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

  return () => {
    vbRo.disconnect();
    cancelAnimationFrame(panRaf);
    window.removeEventListener('pointermove', onPanMove);
    window.removeEventListener('pointerup', onPanUp);
    window.removeEventListener('pointercancel', onPanUp);
    document.removeEventListener('pointerdown', onDocDown);
    document.removeEventListener('keydown', onDocKey);
    stopParticles();
  };
}
